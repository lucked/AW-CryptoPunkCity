import * as Phaser from "phaser";
import LoginScene from "./scenes/login.js";
import RegistrationScene from "./scenes/registration";
import GameScene from "./scenes/game";
import BankScene from "./scenes/Bank";
import RestaurantScene from "./scenes/restaurant";
import MuseumScene from "./scenes/museum";



// canvas variables
const CANVAS_WIDTH = 1300;
const CANVAS_HEIGHT = 800;

/**
 * configuration setting for game
 * @type {object}
 */
const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Atlantis World",
  // render settings
  render: {
    antialias: false,
    pixelArt: true,
  },
  // renderer settings
  type: Phaser.AUTO,
  // allows the creation of dom elements
  dom: {
    createContainer: true,
  },
  // sets responsiveness settings
  scale: {
    mode: Phaser.Scale.FIT,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  // parent element
  parent: "game",
  backgroundColor: "#000",
  // game physics settings
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
};

// const uiRoot = document.getElementById('uiRoot');
// for (const eventName of ['mouseup','mousedown', 'touchstart', 'touchmove', 'touchend', 'touchcancel']){
//     uiRoot.addEventListener(eventName, e => e.stopPropagation());
// }

/**
 * greate game objects using game config object
 * @type {Phaser.Game}
 */
const game = new Phaser.Game(gameConfig);
// add imported scenes to game
game.scene.add("LoginScene", LoginScene);
game.scene.add("RegistrationScene", RegistrationScene);
game.scene.add("GameScene", GameScene);
game.scene.add("BankScene", BankScene);
game.scene.add("RestaurantScene", RestaurantScene);
game.scene.add("MuseumScene", MuseumScene);
// start game scene
game.scene.start("LoginScene");
