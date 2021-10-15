import { musicUpdate } from "../audius/musicPlayer";
import { seats, createRestaurantMap } from "../scenes/scripts/maps";
import { AtlantisControls } from "../movement/AtlantisControls";
import { AtlantisPhysics } from "../movement/AtlantisPhysics";
import { makeLoader } from "../scenes/scripts/loaderScreen";
import { newSocket, setActiveScene, setChatObj } from "../client/socket";
import { setChatForm } from "./scripts/chat";
import { username, playerObj } from "./game";
import { otherPlayers } from "./scripts/players";
import { Direction } from "../movement/Direction";
import { restaurantCollisionLayer } from "./scripts/maps";
import {
  setResponsive,
  createPlayer,
  setupCamera,
  setupPhysics,
  setupPlayerAnimation,
  afterLoaded,
  updateControllers,
} from "./scripts/setup";
import { setSidebar, updateSidebar } from "./scripts/sidebar";
import { resetCount } from "../audius/musicPlayer";
import { setMusicPlayer } from "./scripts/music";

// global variables
var gameScene;
var gameLoaded = false;

// scene set up
class RestaurantScene extends Phaser.Scene {
  private playerSprite;
  private mainSceneTileMap;
  private player;
  private atlantisControls: AtlantisControls;
  public atlantisPhysics: AtlantisPhysics;
  private sidebar;
  private activeTab;
  private sceneRoom: string = "restaurant";
  private textInput;
  private mask;
  private maskBooth;

  constructor() {
    super("RestaurantScene");
  }
  init() {
    // Used to prepare data
  }
  preload() {
    gameScene = this;
    makeLoader(gameScene);
    loadAssets();
  }
  create() {
    setActiveScene(gameScene);
    setResponsive(gameScene);
    setSidebar(gameScene);
    setMusicPlayer(gameScene);
    resetCount();
    setChatForm(gameScene);
    gameScene.loadGame();
  }
  update(time, delta) {
    afterLoaded(
      delta,
      this.atlantisControls,
      this.atlantisPhysics,
      gameLoaded,
      gameScene,
      playerObj
    );
    gameScene.player.update();
    updateControllers(delta, otherPlayers);
    musicUpdate(gameScene);
  }

  // joins the socket sceneroom
  private sendPlayerData() {
    newSocket.emit("joinRoom", this.sceneRoom);
  }

  // updates the ui component positioning
  private updateUIPos() {
    const xOffset = -20;
    const yOffset = 275;
    updateSidebar(xOffset, yOffset, gameScene);
  }

  // sets up the game
  // TODO simplify into a function that can be used in all scenes
  private loadGame() {
    createPlayer(gameScene);
    setupCamera(gameScene, username, 40, 9, 1910, 1280);
    createRestaurantMap(gameScene);
    setupPhysics(gameScene);
    seats.makeRestaurantExit(
      restaurantCollisionLayer,
      gameScene,
      gameScene.atlantisPhysics
    );
    setupPlayerAnimation(gameScene);
    // //web3Listener();
    gameLoaded = true;
    setChatObj(gameScene);
    newSocket.emit("setPlayerRoom", gameScene.sceneRoom);
    gameScene.atlantisPhysics.movePlayer(Direction.LEFT);
  }
}

// loads in needed assets to scene
function loadAssets() {
  gameScene.load.image("restaurantTiles", "assets/maps/restaurantTileSet.png");
  gameScene.load.tilemapTiledJSON(
    "restaurant",
    "assets/maps/restaurantTilemap.json"
  );
}

export default RestaurantScene;