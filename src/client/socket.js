/**
 * HANDLES ALL THE SOCKET IO EMITTERS
 */
import { otherPlayers } from "../scenes/scripts/players";
import { io } from "socket.io-client";
import { chat } from "../map/seats";
import { loadPlayers } from "../scenes/scripts/players";
import { createOtherPlayer } from "../scenes/scripts/players";
import { setAlertModal } from "../scenes/scripts/alert";
import { setConnected } from "../scenes/login";
import { getBalancerContract } from "../scenes/scripts/balancer";

// global variables
var newSocket,
  playerCount = 0,
  allPlayers = [],
  self,
  messages = [],
  chatWindow,
  renderedMessages,
  activeScene,
  messageBox,
  usersBox,
  roomsBox,
  chatName,
  leaveBtn,
  renderedChatUsers,
  renderedRooms;

export {
  newSocket,
  playerCount,
  allPlayers,
  self,
  messages,
  chatWindow,
  renderedMessages,
  activeScene,
};

/**
 * updates the active scene
 * @param {Phaser.Scene} scene
 */
export function setActiveScene(scene) {
  activeScene = scene;
}

/**
 * updates the chat elements
 * @param {Phaser.Scene} scene
 */
export function setChatObj(scene) {
  setChatElements(scene);
}

/**
 * iterate through chatroom messages and render html elements
 */
export function renderMessages() {
  //check if room at index exists
  if (chat.openRooms[chat.roomIndex]) {
    // iterate through messages in selected chat room and make
    // html elements to hold message data
    renderedMessages = chat.openRooms[chat.roomIndex].messages
      .map((msg, i) => {
        // if the message is an event, style it differently
        if (msg.event) {
          return `<p class="eventText">${msg.eventText}</p>`;
        }
        //if its your messages, style them differently
        if (msg.username === self.username) {
          return (
            '<p class="message">' +
            `<strong class="yourMsg">${msg.username} : </strong>` +
            `${msg.text}` +
            "</p>"
          );
        } else {
          return (
            '<p class="message">' +
            `<strong class="otherMsg">${msg.username} : </strong>` +
            `${msg.text}` +
            "</p>"
          );
        }
      })
      .join("");
    // filter messages to remove empty p tags and put into messageBox
    const tempMessages = renderedMessages.split("<p>​</p>").join("");
    renderedMessages = tempMessages;
    messageBox.innerHTML = renderedMessages;
    // scroll message display to bottom
    goToMessageBottom();
  }
}

// scrolls chat window to bottom on new message
export function goToMessageBottom() {
  if (messageBox) {
    messageBox.scrollTop = messageBox.scrollHeight;
  }
}

// iterate through chatroom users and render html elements
export function renderChatUsers() {
  if (chat.openRooms[chat.roomIndex]) {
    renderedChatUsers = chat.openRooms[chat.roomIndex].users
      .map((user) => {
        if (user.socket === self.player_id || chat.openRooms[chat.roomIndex].isPm) {
          return `<p class="chatUser"><strong>${user.username}</strong><p/>`;
        } else {
          return `<p class="chatUser"><strong>${user.username}</strong><button class="pmButton">PM</button><p/>`;
        }
      })
      .join("");
    const tempChatUsers = renderedChatUsers.split("<p>​</p>").join("");
    renderedChatUsers = tempChatUsers;
    usersBox.innerHTML = renderedChatUsers;
  }
}

/**
 * iterate through chatrooms and render html elements
 */
export function renderRooms() {
  renderedRooms = chat.openRooms
    .map((room, i) => {
      if (
        i === chat.roomIndex &&
        (chat.openRooms[chat.roomIndex].name === "public" ||
          chat.openRooms[chat.roomIndex].isPm === false)
      ) {
        return `<button class="chatButton" id="chatButtonActive">${room.name}</button>`;
      }
      if (i === chat.roomIndex) {
        return `<button class="chatButton" id="chatButtonActive">${room.name}<span class="leaveButton">&#10006;</span></button>`;
      } else {
        return `<button class="chatButton">${room.name}</button>`;
      }
    })
    .join("");
  const tempRooms = renderedRooms.split("<p>​</p>").join("");
  renderedRooms = tempRooms;
  roomsBox.innerHTML = renderedRooms;
}

// log to verify connection
function onSocketConnect() {
  setConnected();
  console.log("client connected to socket");
}

/**
 * Set all the dom elements to variables to given scene's sidebar element
 * @param {Phaser.Scene} scene
 */
export function setChatElements(scene) {
  messageBox = scene.sidebar.getChildByID("messages");
  usersBox = scene.sidebar.getChildByID("chatUsers__display");
  chatWindow = scene.sidebar.getChildByID("chatWindow");
  roomsBox = scene.sidebar.getChildByID("chatTabs");
  chatName = scene.sidebar.getChildByID("chatroomName");
  leaveBtn = scene.sidebar.getChildByID("leaveButton");
}

/**
 * Stores returned player count
 * @param {number} count
 * @param {array} users
 */
function onPlayerCount(count, users) {
  playerCount = count;
}

/**
 * Filter and populate allPlayers array, set chat header, and loadin in players based on list
 * @param {array} playerList
 * @param {object} player
 */
function onAllPlayers(playerList, player) {
  playerList = playerList.filter((player) => player !== null);
  allPlayers = playerList;
  self = player;
  chatName.innerHTML = self.username;
  loadPlayers(activeScene);
}

/**
 * Find player in arrays by socket id, destroy all game elements and remove array index
 * @param {string} socketId
 */
function onRemovePlayer(socketId) {
  const otherP = findPlayerIndex(socketId, otherPlayers);
  const allP = findPlayerIndex(socketId, allPlayers);
  otherPlayers[otherP].sprite.destroy();
  otherPlayers[otherP].usernameText.destroy();
  otherPlayers.splice(otherP, 1);
  allPlayers.splice(allP, 1);
  removeFromChat(socketId);
  playerCount--;
}

/**
 * Looks for matching socket id in given array
 * @param {string} socketId
 * @param {arrray} array
 * @returns index of player in array
 */
function findPlayerIndex(socketId, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].player_id === socketId) {
      return i;
    }
  }
}

function removeFromChat(socketId) {
  for (let i = 0; i < chat.openRooms.length; i++) {
    for (let j = 0; j < chat.openRooms[i].users.length; j++) {
      if (chat.openRooms[i].users[j].socket === socketId) {
        chat.openRooms[i].users.splice(j, 1);
        renderChatUsers;
      }
    }
  }
}

/**
 * Handle socket being disconnected
 */
function onSocketDisconnect() {
  // setAlertModal(activeScene, "Disconnected from Atlantis World");
  // activeScene.scene.stop("Game");
  // activeScene.scene.start("LoginScene", { isDisconnected: true });
  console.log("you are now disconnected from socket.io");
  handleErrors("you are now disconnected from socket.io");
}

/**
 * This is kind of an error catch all.
 * sends them back to login screen and displays alert message
 * @param {string} error
 */
function handleErrors(error) {
  activeScene.scene.stop(activeScene);
  activeScene.scene.start("LoginScene", { isError: error });
}

/**
 * Handle getting next tile position for connected player
 * @param {object} pos
 * @param {string} socketId
 */
function onNextPos(pos, socketId) {
  const newVector = new Phaser.Math.Vector2();
  newVector.x = pos.x;
  newVector.y = pos.y;
  for (let i = 0; i < otherPlayers.length; i++) {
    if (otherPlayers[i].player_id === socketId) {
      otherPlayers[i].setPosition(newVector);
    }
  }
}

/**
 * stop animation of other player when they stop moving
 * @param {string} direction
 * @param {string} socketId
 */
function onStopAnim(direction, socketId) {
  for (let i = 0; i < otherPlayers.length; i++) {
    if (otherPlayers[i].player_id === socketId) {
      otherPlayers[i].stopAnimation(direction);
    }
  }
}

/**
 * start other player animation when moving
 * @param {string} direction
 * @param {string} socketId
 */
function onStartAnim(direction, socketId) {
  for (let i = 0; i < otherPlayers.length; i++) {
    if (otherPlayers[i].player_id === socketId) {
      otherPlayers[i].startAnimation(direction);
    }
  }
}

/**
 * update player held tile position info
 * @param {object} tilePos
 * @param {string} socketId
 */
function onNextTile(tilePos, socketId) {
  var newTile = new Phaser.Math.Vector2();
  newTile.x = tilePos.x;
  newTile.y = tilePos.y;
  for (let i = 0; i < otherPlayers.length; i++) {
    if (otherPlayers[i].player_id === socketId) {
      otherPlayers[i].setTilePos(newTile);
    }
  }
}

//create new logged in player
function onNewPlayer(player) {
  createOtherPlayer(player, activeScene);
  allPlayers.push(player);
  playerCount++;
}

/**
 * Add new message to open chat room object index array and render messages
 * @param {string} message
 * @param {string} username
 * @param {string} room
 */
function onMessage(message, username, room) {
  var msg = {
    username: username,
    text: message,
  };
  const msgArray = chat.openRooms[findRoom(room)].messages;
  msgArray[msgArray.length] = msg;
  renderMessages();
}

/**
 * Add user to chat array and rerender
 * @param {string} username
 * @param {string} socketId
 * @param {string} room
 */
function onChatUserJoin(username, socketId, room) {
  makeEvent("joined", username, room);
  addUser(username, socketId, room);
}

/**
 * Create a new user, add into array and rerender users
 * @param {string} username
 * @param {string} socketId
 * @param {string} room
 */
function addUser(username, socketId, room) {
  const newUser = {
    username: username,
    socket: socketId,
  };
  for (let i = 0; i < chat.openRooms.length; i++) {
    if (chat.openRooms[i].name === room) {
      chat.openRooms[i].users[chat.openRooms[i].users.length] = newUser;
    }
  }
  renderChatUsers();
}

/**
 * Create leaving event message and remove user from array
 * @param {string} username
 * @param {string} room
 */
function onChatUserLeave(username, room) {
  makeEvent("left", username, room);
  removeUser(username, room);
}

/**
 * Remove user from array and rerender users
 * @param {string} username
 * @param {string} room
 */
function removeUser(username, room) {
  const thisRoom = chat.openRooms[findRoom(room)];
  for (let i = 0; i < thisRoom.users.length; i++) {
    if (thisRoom.users[i].username === username) {
      thisRoom.users.splice(i, 1);
    }
  }
  renderChatUsers();
}

/**
 * Creates a new message of type event for special chat events
 * @param {string} type
 * @param {string} username
 * @param {string} room
 */
export function makeEvent(type, username, room) {
  const event = {
    event: type,
    eventText:
      "--- " + username + " has " + type + " " + chat.openRooms[findRoom(room)].name + " ---",
  };
  const msgArray = chat.openRooms[findRoom(room)].messages;
  msgArray[msgArray.length] = event;
  renderMessages();
}

/**
 * Look for room with name matching given string
 * @param {string} room
 * @returns
 */
function findRoom(room) {
  for (let i = 0; i < chat.openRooms.length; i++) {
    if (chat.openRooms[i].name === room) {
      return i;
    }
  }
}

/**
 * handle room data and create room differntly if has a roomName
 * @param {array} usersArray
 * @param {string} room
 * @param {string} roomName
 */
function onRoomData(usersArray, room, roomName) {
  if (roomName) {
    newRoom(roomName, room, usersArray, true);
  } else {
    newRoom(room, room, usersArray, false);
  }
}

/**
 * Create a new room and rerender rooms
 * @param {string} name
 * @param {string} socket
 * @param {array} users
 * @param {boolean} isPm
 */
function newRoom(name, socket, users, isPm) {
  if (!checkForRoom(name)) {
    const newRoom = {
      index: chat.openRooms.length,
      name: name,
      socket: socket,
      users: users,
      messages: [],
      isPm: isPm,
    };
    chat.roomIndex = chat.openRooms.length;
    chat.openRooms[chat.roomIndex] = newRoom;
    makeEvent("joined", self.username, chat.openRooms[chat.roomIndex].name);
    renderRooms();
    renderChatUsers();
  }
}

/**
 * Look for room name that matches given name
 * @param {string} name
 * @returns
 */
function checkForRoom(name) {
  for (let i = 0; i < chat.openRooms.length; i++) {
    if (chat.openRooms[i].name === name) {
      return true;
    }
  }
  return false;
}

/**
 * Remove room from array and rerender rooms
 * @param {string} socket
 */
export function deleteRoom(socket) {
  for (let i = 0; i < chat.openRooms.length; i++) {
    if (socket === chat.openRooms[i].socket) {
      if (chat.openRooms.length === 1) {
        chat.openRooms = [];
        chat.roomIndex = 0;
      } else {
        chat.openRooms.splice(i, 1);
        chat.roomIndex = i - 1;
      }
    }
  }
  renderRooms();
}

/**
 * delete private message room when pm closed
 * @param {string} socketId
 */
function onClosePm(socketId) {
  deleteRoom(socketId);
}

// shoot player back to login screen and show alert
function onAlreadyLoggedIn() {
  scene.scene.stop("Game");
  scene.scene.start("LoginScene", { isLoggedIn: true });
}

function onBalancerData(data) {
  // getBalancerContract(data);
}

export var serverUrl;

//set up client side socket handshake
export function connectSocket() {
  const socketSettings = {
    reconnection: true,
    reconnectionAttempts: 10,
    // autoConnect: false
    //'reconnection delay': 500,
    // 'max reconnection attempts': 10
} 
  //TEST - julio test server:
  newSocket = io("https://aw-server-test.herokuapp.com/", socketSettings);
  
  //MAIN - test server:
  // newSocket = io("https://atlantis-world.herokuapp.com/", socketSettings);
  
  //DEMO - server:
  // newSocket = io("https://demo-atlantis.herokuapp.com/", socketSettings);

  //LOCAL -node server
  // newSocket = io("http://localhost:3000")

  // connection handling
  newSocket.on("connect", onSocketConnect);
  newSocket.on("disconnect", onSocketDisconnect);
  newSocket.on("alreadyLoggedIn", onAlreadyLoggedIn);
  newSocket.on("error", err => handleErrors(err));
  newSocket.on('connect_error', err => handleErrors(err));
  newSocket.on('connect_failed', err => handleErrors(err));
  newSocket.on('reconnect_failed', err => handleErrors(err));
  // user data
  newSocket.on("playerCount", onPlayerCount);
  newSocket.on("removePlayer", onRemovePlayer);
  newSocket.on("allPlayers", onAllPlayers);
  newSocket.on("newPlayer", onNewPlayer);
  // movement updates
  newSocket.on("nextPos", onNextPos);
  newSocket.on("stopAnim", onStopAnim);
  newSocket.on("startAnim", onStartAnim);
  newSocket.on("nextTile", onNextTile);
  //chat handling
  newSocket.on("message", onMessage);
  newSocket.on("chatUserJoin", onChatUserJoin);
  newSocket.on("chatUserLeave", onChatUserLeave);
  newSocket.on("roomData", onRoomData);
  newSocket.on("closePm", onClosePm);
  newSocket.on("alreadyLoggedIn", onAlreadyLoggedIn);

  newSocket.on("balancerData", onBalancerData);
}
