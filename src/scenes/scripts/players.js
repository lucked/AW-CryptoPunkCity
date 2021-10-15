import { playerCount, allPlayers, self } from "../../client/socket";
import { PLAYER_DEPTH, PLAYER_SCALE } from "../game";
import { Player } from "../../movement/Player";
import { Direction } from "../../movement/Direction";

// global variables
export var otherPlayers = [];
var opColliders;

/**
 * removes all the created players and empties the colliders
 */
function clearOtherPlayers() {
  if (otherPlayers && allPlayers && opColliders) {
    for (let i = 0; i < otherPlayers.length; i++) {
      otherPlayers[i].sprite.destroy();
      otherPlayers[i].usernameText.destroy();
    }
    otherPlayers = [];
    opColliders.children.iterate(function (child) {
      child.destroy();
    });
    opColliders.clear(true);
  }
}

/**
 * iterates through list of all connected players and loads them into scene
 * @param {Phaser.Scene} scene 
 */
function loadPlayers(scene) {
  opColliders = scene.add.group();
  for (let i = 0; i < playerCount; i++) {
    if (allPlayers[i] && allPlayers[i].player_id !== self.player_id) {
      createOtherPlayer(allPlayers[i], scene);
    }
  }
  scene.physics.add.overlap(
    scene.player.sprite,
    opColliders,
    function (player, oPlayer) {
      oPlayer.alpha = 0.2;
      setTimeout(function () {
        oPlayer.alpha = 1;
      }, 500);
    }
  );
}

/**
 * creates new player, adds a new player sprite and socketId
 * @param {object} player 
 * @param {Phaser.Scene} scene 
 */
function createOtherPlayer(player, scene) {
  const newPlayerSprite = scene.physics.add.sprite(0, 0, "player");
  newPlayerSprite.body.setSize(16, 16);
  newPlayerSprite.setDepth(PLAYER_DEPTH - 1);
  newPlayerSprite.scale = PLAYER_SCALE;
  const newVector = new Phaser.Math.Vector2();
  newVector.x = player.tilePos.x;
  newVector.y = player.tilePos.y;
  const newPlayer = new Player(
    newPlayerSprite,
    newVector,
    player.player_id,
    player.username,
    null,
    scene
  );
  // make player face correct direction
  newPlayer.startAnimation(player.direction);
  newPlayer.stopAnimation(player.direction);
  // newPlayer.stopAnimation(player.direction);
  if (newPlayer !== null) {
    newPlayerSprite.setVisible(!player.inBldg);
    // otherPlayers[otherPlayers.length] = newPlayer;
    otherPlayers.push(newPlayer);
    opColliders.add(newPlayerSprite);
  }
}

function createSpawnPortal(scene, xPos, yPos) {
  // var particles = scene.add.particles("player").setDepth(5);
  // var portal = particles.createEmitter({
  //   frame: 'portal',
  //   x: xPos * 32, y: yPos * 32,
  //   lifespan: { min: 600, max: 800 },
  //   angle: { start: 0, end: 360, steps: 64 },
  //   speed: 200,
  //   quantity: 64,
  //   scale: { start: 0.2, end: 0.1 },
  //   frequency: 32,
  //   blendMode: 'ADD'
  // });
  // for(let i = 0; i < 3; i += 0.1) {
  //   portal.opacity -= 0.01;
  // }
  // particles.destroy();
}

export { createOtherPlayer, loadPlayers, clearOtherPlayers, createSpawnPortal };
