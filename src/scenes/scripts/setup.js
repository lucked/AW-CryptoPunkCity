import { Player } from "../../movement/Player";
import { PLAYER_DEPTH, PLAYER_SCALE } from "../game";
import { AtlantisControls } from "../../movement/AtlantisControls";
import { AtlantisPhysics } from "../../movement/AtlantisPhysics";
import { Direction } from "../../movement/Direction";

/**
 * adds a player prite
 * @param {Phaser.Scene} scene 
 */
function createPlayer(scene) {
  scene.playerSprite = scene.physics.add.sprite(0, 0, "player");
  scene.playerSprite.setDepth(PLAYER_DEPTH);
  scene.playerSprite.scale = PLAYER_SCALE;
  scene.playerSprite.body.setSize(16, 16);
}

/**
 * creates main player and camera and links them together
 * @param {Phaser.Scene} scene 
 * @param {string} username 
 * @param {number} xPos 
 * @param {number} yPos 
 * @param {number} xBounds 
 * @param {number} yBounds 
 */
function setupCamera(scene, username, xPos, yPos, xBounds, yBounds) {
  scene.cameras.main.setBounds(0, 0, xBounds, yBounds);
  scene.cameras.main.zoom = 0.8;
  scene.cameras.main.startFollow(scene.playerSprite);
  scene.cameras.main.roundPixels = true;
  scene.player = new Player(
    scene.playerSprite,
    new Phaser.Math.Vector2(xPos, yPos),
    "",
    username,
    null,
    scene
  );
  scene.cameras.main.on("followupdate", function (camera, gameObject) {
    scene.updateUIPos();
  });
  scene.sendPlayerData();
}

/**
 * create new control and physics objects linking in the main player and input
 * @param {Phaser.Scene} scene 
 */
function setupPhysics(scene) {
  scene.atlantisPhysics = new AtlantisPhysics(
    scene.player,
    scene.mainSceneTileMap,
    true,
    scene.sceneRoom
  );
  scene.atlantisControls = new AtlantisControls(
    scene.input,
    scene.atlantisPhysics,
    scene
  );
}

/**
 * creates all animations for 4 arrow directions
 * @param {Phaser.Scene} scene 
 */
function setupPlayerAnimation(scene) {
  createPlayerAnimation(Direction.UP, 0, 2, scene);
  createPlayerAnimation(Direction.RIGHT, 3, 5, scene);
  createPlayerAnimation(Direction.DOWN, 6, 8, scene);
  createPlayerAnimation(Direction.LEFT, 9, 11, scene);
}

/**
 * set up for each animation
 * @param {string} name 
 * @param {number} startFrame 
 * @param {number} endFrame 
 * @param {Phaser.Scene} scene 
 */
function createPlayerAnimation(name, startFrame, endFrame, scene) {
  scene.anims.create({
    key: name,
    frames: scene.anims.generateFrameNumbers("player", {
      start: startFrame,
      end: endFrame,
    }),
    frameRate: 10,
    repeat: -1,
    yoyo: true,
  });
}

/**
 * makes game window responsive
 * @param {Phaser.Scene} scene 
 */
function setResponsive(scene) {
  scene.scale.displaySize.setAspectRatio(1300 / 800);
  scene.scale.refresh();
}

/**
 * updqate controls and physics once game is loaded
 * @param {number} delta 
 * @param {AtlantisControls} controls 
 * @param {AtlantisPhysics} physics 
 * @param {boolean} gameLoaded 
 * @param {Phaser.Scene} scene 
 * @param {object} playerObj 
 */
function afterLoaded(delta, controls, physics, gameLoaded, scene, playerObj) {
  if (gameLoaded) {
    controls.update();
    physics.update(delta);
    playerObj = scene.player;
  }
}

/**
 * itterates through other player array and runs its update
 * @param {number} delta 
 * @param {array} otherPlayers 
 */
function updateControllers(delta, otherPlayers) {
  for (let i = 0; i < otherPlayers.length; i++) {
    otherPlayers[i].update();
  }
}

export {
  createPlayer,
  setupCamera,
  setupPhysics,
  setupPlayerAnimation,
  setResponsive,
  afterLoaded,
  updateControllers,
};