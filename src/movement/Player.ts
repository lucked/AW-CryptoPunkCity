/**
 * THIS IS THE PLAYER TEMPLATE USED FOR MAKING ALL PLAYERS IN GAME
 */
import { Direction } from "./Direction";
import { TILE_SIZE } from "../scenes/game";

var offX;
var offY;

/** player class that holds sprite and player data */
export class Player {
  constructor(
    private sprite: Phaser.GameObjects.Sprite,
    private tilePos: Phaser.Math.Vector2,
    private player_id: string,
    private username: string,
    private usernameText,
    private parentScene
  ) {
    // Position of the player within tile
    const offsetX = TILE_SIZE / 2;
    const offsetY = TILE_SIZE / 2;
    offX = offsetX;
    offY = offsetY;

    // make username above head
    this.createUsername(this.username);

    // place at tile position
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setPosition(
      tilePos.x * TILE_SIZE + offsetX,
      tilePos.y * TILE_SIZE + offsetY
    );
    //this.sprite.setFrame(55);
  }
  // update player username text position above head
  update() {
    this.usernameText.x = this.sprite.x + 2;
    this.usernameText.y = this.sprite.y - 80;
    if (this.sprite.visible === false) {
      this.usernameText.setVisible(false);
    } else {
      this.usernameText.setVisible(true);
    }
  }

  /**
   * Gets player's current position
   * @returns x,y, position of bottom center of sprite
   */
  getPosition(): Phaser.Math.Vector2 {
    return this.sprite.getBottomCenter();
  }

  /**
   * Sets sprite position
   * @param position holds tile pos
   */
  setPosition(position: Phaser.Math.Vector2): void {
    this.sprite.setPosition(position.x, position.y);
  }
 
  /**
   * stops sprite animation
   * @param direction string for knowing last movement intent
   */
  stopAnimation(direction: Direction) {
    const animationManager = this.sprite.anims.animationManager;
    const standingFrame = animationManager.get(direction).frames[1].frame.name;
    this.sprite.anims.stop();
    this.sprite.setFrame(standingFrame);
  }

  /**
   * Start the sprite animation in given direction
   * @param direction string for knowing what animation to start
   */
  startAnimation(direction: Direction) {
    this.sprite.anims.play(direction);
  }

  /**
   * Gets current tile position
   * @returns tile position
   */
  getTilePos(): Phaser.Math.Vector2 {
    return this.tilePos.clone();
  }

  /**
   * Sets tile position value to given tile position
   * @param tilePosition tile position
   */
  setTilePos(tilePosition: Phaser.Math.Vector2): void {
    this.tilePos = tilePosition.clone();
  }
  
  /**
   * the username that shows up over every player
   * @param username player;s username
   */
  createUsername(username) {
    this.usernameText = this.parentScene.add
      .text(this.sprite.x, this.sprite.y, username, {
        fontSize: 18,
        fontColor: "white",
        fontFamily: "verdana",
        stroke: "0xfff",
        strokeThickness: 6,
        fontWeight: "100",
      })
      .setOrigin(0.5)
      .setDepth(this.sprite.depth + 4)
      .setResolution(30);
  }
}
