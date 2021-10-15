/**
 * HANDLES PLAYER INPUT CONTROLS USING PHYSICS LOGIC
 */
import { Direction } from "./Direction";
import { AtlantisPhysics } from "./AtlantisPhysics";
import {
  newSocket,
  renderChatUsers,
  renderMessages,
  deleteRoom,
} from "../client/socket.js";
import { seatRoom } from "../map/seats";
import { seats } from "../scenes/scripts/maps";

// Handles the Player controls for movement
export class AtlantisControls {
  constructor(
    private input: Phaser.Input.InputPlugin,
    private atlantisPhysics: AtlantisPhysics,
    public parentScene
  ) {}

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    let physics = this.atlantisPhysics;
    if (cursors.left.isDown) {
      physics.movePlayer(Direction.LEFT);
    }
    if (cursors.right.isDown) {
      physics.movePlayer(Direction.RIGHT);
    }
    if (cursors.up.isDown) {
      physics.movePlayer(Direction.UP);
    }
    if (cursors.down.isDown) {
      physics.movePlayer(Direction.DOWN);
    } 
  }

  exitChat() {
    seats.inChat = false;
    newSocket.emit(
      "leaveRoom",
      seatRoom,
      false
    );
    if (
      !this.parentScene.sidebar.getChildByID("tabWindow")
      .classList.contains("slideIn")
    ) {
      this.parentScene.sidebar.getChildByID("tabWindow")
        .classList.toggle("slideIn");
    }
    deleteRoom(seatRoom);
    renderChatUsers();
    renderMessages();
  }
}
