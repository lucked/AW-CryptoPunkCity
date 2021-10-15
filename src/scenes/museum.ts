import { musicUpdate } from "../audius/musicPlayer";
import { web3Listener } from "../web3/metamaskConnection.js";
import * as Phaser from "phaser";
import { username, playerObj, scene } from "./game";
import { Direction } from "../movement/Direction";
import { AtlantisControls } from "../movement/AtlantisControls";
import { AtlantisPhysics } from "../movement/AtlantisPhysics";
import {
  setResponsive,
  createPlayer,
  setupCamera,
  setupPhysics,
  setupPlayerAnimation,
  afterLoaded,
  updateControllers,
} from "./scripts/setup";
import { setChatForm } from "./scripts/chat";
import {
  seats,
  createMuseumMap,
  museumCollisionLayer,
} from "../scenes/scripts/maps";
import { newSocket, setActiveScene, setChatObj } from "../client/socket";
import { otherPlayers } from "./scripts/players";
import { makeLoader } from "./scripts/loaderScreen";
import {
  makeModal,
  updateNftModal,
  loadNfts,
  toggleInteractive,
} from "./scripts/museum";
import { setSidebar, updateSidebar } from "./scripts/sidebar";
import { setMusicPlayer } from "./scripts/music";
import { resetCount } from "../audius/musicPlayer";
import { checkOnline } from "./scripts/tools";

// Global Variables
var gameScene;
var audius;
var gameLoaded = false,
  collisionLayer;
export { collisionLayer };

// settings for game scene
var sceneConfig = {
  key: "MuseumScene",
  // load files before even running init or preload
  pack: {
    // async asset loader needed for loading to wait until nfts are ready
    files: [
      {
        type: "plugin",
        key: "rexawaitloaderplugin",
        url: "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexawaitloaderplugin.min.js",
        start: true,
      },
    ],
  },
};

// Scene setup
class MuseumScene extends Phaser.Scene {
  private playerSprite;
  private mainSceneTileMap;
  private player;
  private atlantisControls: AtlantisControls;
  public atlantisPhysics: AtlantisPhysics;
  private sidebar;
  private activeTab;
  private sceneRoom: string = "museum";
  private textInput;
  private mask;
  private maskBooth;

  constructor() {
    super(sceneConfig);
  }

  init() {
    // Used to prepare data
  }

  preload() {
    gameScene = this;
    loadNfts(gameScene);
    makeLoader(gameScene);
    this.loadAssets();
  }
  create() {
    setActiveScene(gameScene);
    setResponsive(gameScene);
    makeModal(gameScene);
    setSidebar(gameScene);
    setMusicPlayer(gameScene);
    resetCount();
    setChatForm(gameScene);
    this.loadGame();
  }

  update(time, delta) {
    if(checkOnline()){
      musicUpdate(gameScene);
      afterLoaded(
        delta,
        this.atlantisControls,
        this.atlantisPhysics,
        gameLoaded,
        gameScene,
        playerObj
      );
      this.player.update();
      updateControllers(delta, otherPlayers);
      updateNftModal(gameScene);
    }
  }

  // connects player to scene room
  private sendPlayerData() {
    newSocket.emit("joinRoom", this.sceneRoom);
  }

  // update sidebar positioning based on offset
  private updateUIPos() {
    const xOffset = -20;
    const yOffset = 275;
    updateSidebar(xOffset, yOffset, gameScene);
  }

  // scene creation
  private loadGame() {
    createPlayer(gameScene);
    setupCamera(gameScene, username, 29, 38, 1910, 1280);
    createMuseumMap(gameScene);
    setupPhysics(gameScene);
    seats.makeMuseumExit(
      museumCollisionLayer,
      gameScene,
      gameScene.atlantisPhysics
    );
    setupPlayerAnimation(gameScene);
    // //web3Listener();
    gameLoaded = true;
    setChatObj(gameScene);
    newSocket.emit("setPlayerRoom", gameScene.sceneRoom);
    this.atlantisPhysics.movePlayer(Direction.UP);
  }

  // load assets needed for game scene
  private loadAssets() {
    gameScene.load.image("museumTiles", "assets/maps/museumTileSet.png");
    gameScene.load.tilemapTiledJSON(
      "museum",
      "assets/maps/museumTilemap-test.json"
    );
    // gameScene.load.html("nftModal", "assets/museum/museum.html");
  }
}

export default MuseumScene;
