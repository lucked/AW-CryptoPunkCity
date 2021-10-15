/**
 * THIS IS THE PLAYER MOVEMENT LOGIC
 */
import { Direction } from "./Direction";
import { TILE_SIZE } from "../scenes/game";
import { newSocket } from "../client/socket.js";
import { Player } from "./Player";

const Vector2 = Phaser.Math.Vector2;
type Vector2 = Phaser.Math.Vector2;

/**
 * Physics class 
 */
export class AtlantisPhysics {
  private movementDirectionVectors: {
    [key in Direction]?: Vector2;
  } = {
    [Direction.UP]: Vector2.UP,
    [Direction.DOWN]: Vector2.DOWN,
    [Direction.LEFT]: Vector2.LEFT,
    [Direction.RIGHT]: Vector2.RIGHT,
  };

  private movementDirection: Direction = Direction.NONE;
  private readonly speedPixelsPerSecond: number = TILE_SIZE * 8;
  private tileSizePixelsWalked: number = 0;
  private lastMovementIntent = Direction.NONE;

  constructor(
    private player: Player,
    private tileMap: Phaser.Tilemaps.Tilemap,
    private isMain: boolean,
    private sceneRoom: string
  ) {}

  movePlayer(direction: Direction): void {
    this.lastMovementIntent = direction;
    if (this.isMoving()) return;
    if (this.isBlockingDirection(direction)) {
      this.player.stopAnimation(direction);
      if (this.isMain) {
        newSocket.emit("stopAnim", direction, this.sceneRoom);
      }
    } else {
      this.startMoving(direction);
    }
  }
  //on update check if player is still moving, if so update his position. If not, cancel his direction
  update(delta: number) {
    if (this.isMoving()) {
      this.updatePlayerPosition(delta);
    }
    this.lastMovementIntent = Direction.NONE;
  }

  public isMoving(): boolean {
    return this.movementDirection != Direction.NONE;
  }

  private startMoving(direction: Direction): void {
    this.player.startAnimation(direction);
    if (this.isMain) {
      newSocket.emit("startAnim", direction, this.sceneRoom);
    }
    this.movementDirection = direction;
    this.updatePlayerTilePos();
  }

  private updatePlayerPosition(delta: number) {
    const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);
    if (!this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
    } else if (this.shouldContinueMoving()) {
      this.movePlayerSprite(pixelsToWalkThisUpdate);
      this.updatePlayerTilePos();
    } else {
      this.movePlayerSprite(TILE_SIZE - this.tileSizePixelsWalked);
      this.stopMoving();
    }
  }

  private updatePlayerTilePos() {
    const newPos = this.player
      .getTilePos()
      .add(this.movementDirectionVectors[this.movementDirection]);
    this.player.setTilePos(newPos);

    if (this.isMain) {
      newSocket.emit("nextTile", newPos, this.sceneRoom);
    }
  }

  private movePlayerSprite(pixelsToMove: number) {
    const directionVec =
      this.movementDirectionVectors[this.movementDirection].clone();
    const movementDistance = directionVec.multiply(new Vector2(pixelsToMove));
    const newPlayerPos = this.player.getPosition().add(movementDistance);

    if (this.isMain) {
      this.player.setPosition(newPlayerPos);
      newSocket.emit("nextPos", newPlayerPos, this.sceneRoom);
    }

    this.tileSizePixelsWalked += pixelsToMove;
    this.tileSizePixelsWalked %= TILE_SIZE;
  }

  private getPixelsToWalkThisUpdate(delta: number): number {
    const deltaInSeconds = delta / 800;
    return this.speedPixelsPerSecond * deltaInSeconds;
  }

  private stopMoving(): void {
    this.player.stopAnimation(this.movementDirection);
    if (this.isMain) {
      for (let i = 0; i < 3; i++) {
        newSocket.emit("stopAnim", this.movementDirection, this.sceneRoom);
      }
    }
    this.movementDirection = Direction.NONE;
  }

  private willCrossTileBorderThisUpdate(
    pixelsToWalkThisUpdate: number
  ): boolean {
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= TILE_SIZE;
  }

  private shouldContinueMoving(): boolean {
    return (
      this.movementDirection == this.lastMovementIntent &&
      !this.isBlockingDirection(this.lastMovementIntent)
    );
  }

  private isBlockingDirection(direction: Direction): boolean {
    return this.hasBlockingTile(this.tilePosInDirection(direction));
  }

  private tilePosInDirection(direction: Direction): Vector2 {
    const nextPos = this.player
      .getTilePos()
      .add(this.movementDirectionVectors[direction]);

    return nextPos;
  }

  private hasBlockingTile(pos: Vector2): boolean {
    if (this.hasNoTile(pos)) return true;
    return this.tileMap.layers.some((layer) => {
      const tile = this.tileMap.getTileAt(pos.x, pos.y, false, layer.name);
      return tile && tile.properties.collides;
    });
  }

  private hasNoTile(pos: Vector2): boolean {
    return !this.tileMap.layers.some((layer) =>
      this.tileMap.hasTileAt(pos.x, pos.y, layer.name)
    );
  }
}
