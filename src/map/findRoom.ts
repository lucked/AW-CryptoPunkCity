// to know how many rooms are currently open
import { chat } from "./seats";

/**
 * Iterates through open chat rooms and room name against roomName
 * @param roomName to check against
 * @returns index of room
 */
function findRoom(roomName:string):number {
    for (let i = 0; i < chat.openRooms.length; i++) {
      if (roomName === chat.openRooms[i].socket) {
        return i;
      }
    }
    return;
}

export { findRoom };