/**
 * THIS IS FOR CREATING ENTRANCES TO BUILDINGS IN GIVEN SCENE
 */
import {
    newSocket,
    makeEvent,
    deleteRoom,
    renderChatUsers,
    renderRooms,
    renderMessages,
} from "../client/socket";
import { clearOtherPlayers } from "../scenes/scripts/players";
import { chat } from "./seats";
import { findRoom } from "./findRoom";

function makeMuseumEntrance(layer, scene, seats) {
    layer.setTileLocationCallback(18, 27, 3, 1, () => {
        if (!seats.inBldg && !scene.atlantisPhysics.isMoving()) {
          seats.inBldg = true;
          newSocket.emit(
            "leaveRoom",
            scene.sceneRoom,
            chat.openRooms[findRoom(scene.sceneRoom)].isPm
          );
          scene.scene.switch("MuseumScene");
          clearOtherPlayers();
          
          deleteRoom(scene.sceneRoom);
          renderChatUsers();
          renderMessages();
          renderRooms();
          newSocket.emit("leaveMap", scene.sceneRoom);
        }
    });
}

function makeRestaurantEntrance(layer, scene, seats) {
  layer.setTileLocationCallback(22, 56, 1, 3, () => {
    if (!seats.inBldg && !scene.atlantisPhysics.isMoving()) {
      seats.inBldg = true;
      newSocket.emit(
        "leaveRoom",
        scene.sceneRoom,
        chat.openRooms[findRoom(scene.sceneRoom)].isPm
      );
      scene.scene.switch("RestaurantScene");
      clearOtherPlayers();
      deleteRoom(scene.sceneRoom);
      renderChatUsers();
      renderMessages();
      renderRooms();
      newSocket.emit("leaveMap", scene.sceneRoom);
    }
  });
}

function makeBankEntrance(layer, scene, seats) {
  layer.setTileLocationCallback(14, 37, 1, 1, () => {
    if (!seats.inBldg && !scene.atlantisPhysics.isMoving()) {
      seats.inBldg = true;
      scene.scene.switch("BankScene");
      clearOtherPlayers();
      newSocket.emit(
        "leaveRoom",
        scene.sceneRoom,
        chat.openRooms[findRoom(scene.sceneRoom)].isPm
      );
      deleteRoom(scene.sceneRoom);
      renderChatUsers();
      renderMessages();
      renderRooms();
      newSocket.emit("leaveMap", scene.sceneRoom);
    }
  });
}

export {makeMuseumEntrance, makeRestaurantEntrance, makeBankEntrance}