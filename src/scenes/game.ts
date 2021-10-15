import * as Phaser from "phaser";
import { AtlantisControls } from "../movement/AtlantisControls";
import { AtlantisPhysics } from "../movement/AtlantisPhysics";
import { Direction } from "../movement/Direction";
import {
  newSocket,
  setChatObj,
  setActiveScene,
} from "../client/socket.js";
import eventsCenter from "../EventsCenter.js";
import { musicUpdate, getAudius } from "../audius/musicPlayer.js";
import { web3Listener } from "../web3/metamaskConnection.js";
import { updateItemPickup, setCrafting, loadBaseItems } from "./scripts/craft.js";
import {
  createPlayer,
  setupCamera,
  setupPhysics,
  setupPlayerAnimation,
  setResponsive,
  afterLoaded,
  updateControllers,
} from "./scripts/setup";
import { createDemoMap } from "./scripts/maps";
import { setChatForm } from "./scripts/chat";
import { setMusicPlayer } from "../scenes/scripts/music";
import { otherPlayers } from "./scripts/players";
import { makeLoader } from "./scripts/loaderScreen";
import { updateSidebar, setSidebar } from "./scripts/sidebar";
import { createSpawnPortal } from "./scripts/players";
import { loadBuildingNft } from "./scripts/buildingNft";
import { VariablesInAllowedPositionRule } from "graphql";
import { makeNftModal, updateNftModal } from "./scripts/buildingNft";
import { updateAlertModal } from "./scripts/alert";
import { createBillboard } from "./scripts/billboard";
import { getBalancerGraph } from "./scripts/balancer";
import { checkOnline } from "./scripts/tools";


//global variables
const PLAYER_SCALE = 1.8,
  PLAYER_DEPTH = 5,
  TILE_SIZE = 32;
var scene,
  playerObj,
  gameLoaded: boolean = false,
  username: string,
  inBldg = false;
export { username, inBldg, scene, playerObj, PLAYER_DEPTH, PLAYER_SCALE, TILE_SIZE };

/**
 * setting for game scene
 * @type {Phaser.Types.Scenes.SettingsConfig}
 */
const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  key: "Game",
  pack: {
    // async asset loader needed for loading to wait until nfts are ready
    files: [
      {
        type: "plugin",
        key: "rexawaitloaderplugin",
        url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexawaitloaderplugin.min.js",
      },
    ],
  },
  active: false,
  visible: false,
};

// scene setup
export class GameScene extends Phaser.Scene {
  private playerSprite;
  private mainSceneTileMap;
  private player;
  private atlantisControls: AtlantisControls;
  public atlantisPhysics: AtlantisPhysics;
  private sidebar;
  private activeTab: string;
  private sceneRoom: string = "public";
  public mask;
  public maskBench;
  public maskTable;

  constructor() {
    super(sceneConfig);
  }

  init(data) {
    if (data.username) {
      username = data.username;
    }
  }
 
  public preload() {
    scene = this;
    makeLoader(scene);
    loadBuildingNft(scene);
    this.loadAssets();
    getBalancerGraph();
  }

  public create() {
    setActiveScene(scene);
    setResponsive(scene);
    setSidebar(scene);
    setMusicPlayer(scene);
    getAudius(scene);
    setChatForm(scene);
    this.loadGame();
    makeNftModal(scene);
    createBillboard(scene);
    eventsCenter.on("leaveBuilding", this.leaveBuilding, this);
    // setCrafting(scene, this.player.sprite);
  }

  public update(_time: number, delta: number) {
    // console.log(checkOnline());
    if(checkOnline()) {
      afterLoaded(delta, this.atlantisControls, this.atlantisPhysics, gameLoaded, scene, playerObj);
      updateControllers(delta, otherPlayers);
      this.player.update();
      musicUpdate(scene);
      updateNftModal(scene);
      updateAlertModal(scene);
    }
  }

  /*
   * *************************
   *   ADDITIONAL FUNCTIONS
   * *************************
   */

  /**
   * move player and rejoin socket room
   * @param direction the direction in which to walk when leaving building
   */
  private leaveBuilding(direction: Direction): void {
    this.atlantisPhysics.movePlayer(direction);
    setActiveScene(scene);
    newSocket.emit("joinRoom", scene.sceneRoom);
    setChatObj(scene);
    newSocket.emit("setPlayerRoom", scene.sceneRoom);
  }

  // updates sidebar position based on an offset
  private updateUIPos(): void {
    const xOffset = -212;
    const yOffset = -230;
    updateSidebar(xOffset, yOffset, scene);
    // updateItemPickup(this.player.sprite, scene);
  }

  public createBldgNft(url) {
    var video = document.createElement('video');
    video.src = url;
    video.height = 200;
    video.autoplay = true;
    video.loop = true;
    var element = scene.add.dom(471,755, video);
    element.setDepth(5);
  }

  //load game scene only after logged on and only once
  private loadAssets(): void {
    scene.load.image("openCrafting", "assets/crafting/openCrafting.png");
    scene.load.image("pickupImage", "assets/crafting/pickupImage.png");
    scene.load.image("pickupYes", "assets/crafting/pickupYes.png");
    scene.load.image("pickupNo", "assets/crafting/pickupNo.png");
    scene.load.image("swordItem", "assets/crafting/swordItem.png");
    scene.load.image("tiles", "assets/maps/awTileSet-new.png");
    // // scene.load.image(
    // //   "tiles",
    // //   "https://bafkreibcnmk4gfib6qbo7mgtsqyftxfkhlnm6rqpwb42thudpmyslzr4e4.ipfs.dweb.link/"
    // // );
    scene.load.tilemapTiledJSON("demoWorld", "assets/maps/awTilemap-new.json");
    scene.load.spritesheet(
      "player",
      "https://bafkreiarf4jshsmnakr6ytz6p3zkdvq2mzfruabvsk3t2gyu33rsod4rvy.ipfs.dweb.link/",
      {
        frameWidth: 18,
        frameHeight: 37,
      }
    );
    scene.load.html("sidebar", "assets/sidebar/sidebar.html");
    scene.load.html("chat", "assets/chat/chat.html");
    scene.load.html("music", "assets/music/audius.html");
    //loadBaseItems(scene);
    //scene.load.html("crafting", "assets/crafting/crafting.html");
    scene.load.html("nftModal", "assets/museum/museum.html");
    scene.load.html("billboard", "assets/billboard/billboard.html");
    scene.load.html("balancer", "assets/balancer/balancer.html");

  }

  /**
   * sets up the game scene and flips gameloaded value
   */
  private loadGame(): void {
    setChatObj(scene);
    createPlayer(scene);
    setupCamera(scene, username, 40, 46, 2560, 1900);
    createSpawnPortal(scene, 40,46);
    createDemoMap(scene);
    setupPhysics(scene);
    setupPlayerAnimation(scene);
    web3Listener();
    gameLoaded = true;
  }

  //send your data to server
  private sendPlayerData(): void {
    const playerObj = {
      username: this.player.username,
      x: this.playerSprite.x,
      y: this.playerSprite.y,
      tilePos: {
        x: this.player.tilePos.x,
        y: this.player.tilePos.y,
      },
      direction: "none",
    };
    newSocket.emit("playerJoined", playerObj);
    newSocket.emit("joinRoom", this.sceneRoom);
  }
}

export default GameScene;
