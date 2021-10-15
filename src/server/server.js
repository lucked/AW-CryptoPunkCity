require("@nomiclabs/hardhat-ethers/package.json"); // @nomiclabs/hardhat-ethers is a peer dependency. 
require("hardhat/package.json"); // hardhat is a peer dependency.

var v2Deployments = require("@balancer-labs/v2-deployments")
export var corsOrigin;

const PORT = process.env.PORT || 3000;
const express = require("express");
const socketIO = require("socket.io");
const app = express();
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(server, {
  cors: {
    origin: ["https://test--demoatl.netlify.app", "https://localhost:8080"],
    methods: ["GET", "POST"],
  } 
}); 

// setBranchVars();

// global variables
var players = [];
var users;
var count;

/** */
/** SOCKET SETUP*/
/** */
io.on("connection", (socket) => {
  console.log("Client connected");
  getBalancerAbi(socket);
  // send player list to socket and new player to everyone else
  socket.on("playerJoined", onPlayerJoined);
  // send updated player move data to all other sockets
  socket.on("playerMoved", onPlayerMoved);
  //when sockets leave
  socket.on("close", onClose);
  socket.on("disconnect", onDisconnect);
  //catch errors
  socket.on("list items", onListItems);
  //update player info
  socket.on("nextPos", onNextPos);
  socket.on("stopAnim", onStopAnim);
  socket.on("startAnim", onStartAnim);
  socket.on("nextTile", onNextTile);
  //chat handling
  socket.on("joinRoom", onJoinRoom);
  socket.on("leaveRoom", onLeaveRoom);
  socket.on("message", onMessage);
  socket.on("joinUserRoom", onJoinUserRoom);
  socket.on("leaveMap", onLeaveMap);

  socket.on("setPlayerRoom", onSetPlayerRoom);
});

function getBalancerAbi(socket) {
  var v2Deployments = require("@balancer-labs/v2-deployments")
  v2Deployments.getBalancerContractAbi('20210418-vault', "Vault").then(function(response) {
      console.log(response);
      socket.emit("balancerData", response);
  });
}

/** */ ////
/** CALLBACK FUNCTION DEFINITIONS */
//** */
function onLeaveMap(roomName) {
  this.to(roomName).emit("removePlayer", this.id);
}

function onJoinUserRoom(userID) {
  joinUserToRoom(this, userID, true);
}

function onJoinRoom(room) {
  joinUserToRoom(this, room, false);
}

function joinUserToRoom(socket, room, isPM) {
  if (!isPM) {
    socket.join(room);
  }
  var roomUsers = Array.from(io.sockets.adapter.rooms.get(room));
  console.log("======================ROOM USERS====>");
  console.log(roomUsers);
  const userObjects = [];
  for (let i = 0; i < roomUsers.length; i++) {
    const newUserObj = {
      username: players[roomUsers[i]].username,
      socket: roomUsers[i],
    };
    userObjects[i] = newUserObj;
  }
  if (isPM) {
    console.log("ITS A NEW PRIVATE MESSAGE!!");
    console.log("userA: " + players[socket.id].username + " : " + socket.id);
    console.log("userB: " + players[room].username + " : " + room);
    socket
      .to(room)
      .emit("roomData", userObjects, socket.id, players[socket.id].username);
    socket.emit("roomData", userObjects, room, players[room].username);
    socket
      .to(room)
      .emit(
        "chatUserJoin",
        players[socket.id].username,
        socket.id,
        players[socket.id].username
      );
  } else {
    var list = [];
    //console.log("count: " + count);
    for (let i = 0; i < roomUsers.length; i++) {
      if (roomUsers[i] && players[roomUsers[i]] !== null) {
        list.push(players[roomUsers[i]]);
      }
    }
    console.log("sending playerData");
    console.log(list);
    console.log(players[socket.id]);
    socket.emit("allPlayers", list, players[socket.id]);
    socket.to(room).emit("newPlayer", players[socket.id]);
    socket.emit("roomData", userObjects, room, false);
    socket
      .to(room)
      .emit("chatUserJoin", players[socket.id].username, socket.id, room);
  }
}

function onLeaveRoom(room, isPm) {
  if (!isPm) {
    this.leave(room);
    this.to(room).emit("chatUserLeave", players[this.id].username, room);
  } else {
    this.leave(room);
    this.to(room).emit("closePm", this.id);
  }
}

function onMessage(room, message, isPM) {
  var playerUsername = players[this.id].username;
  if (isPM) {
    this.to(room).emit("testPM");
    this.to(room).emit("message", message, playerUsername, playerUsername);
    console.log(
      playerUsername +
        " is sending private message: " +
        message +
        " to room " +
        room
    );
  } else {
    this.to(room).emit("message", message, playerUsername, room);
    console.log(
      playerUsername + " is sending message: " + message + " to room " + room
    );
  }
}

function onNextTile(tilePos, sceneRoom) {
  this.to(sceneRoom).emit("nextTile", tilePos, this.id);
  if (players[this.id]) {
    players[this.id].tilePos = tilePos;
  }
}

function onStartAnim(direction, sceneRoom) {
  this.to(sceneRoom).emit("startAnim", direction, this.id);
}

function onStopAnim(direction, sceneRoom) {
  this.to(sceneRoom).emit("stopAnim", direction, this.id);
}

function onNextPos(pos, sceneRoom) {
  this.to(sceneRoom).emit("nextPos", pos, this.id);
}

function getCount(socket, player) {
  count = io.of("/").sockets.size;
  console.log(io.of("/").sockets);
  users = Array.from(io.sockets.adapter.rooms);
  if (player.username !== "theArchitect") {
    if (checkForUsername(player.username)) {
      socket.emit("alreadyLoggedIn");
      socket.disconnect();
      return "alreadyLoggedIn";
    }
  }
  socket.emit("playerCount", count, users);
}

function checkForUsername(username) {
  for (let i = 0; i < count; i++) {
    if (players[users[i][0]]) {
      if (players[users[i][0]].username === username) {
        return true;
      }
    }
  }
  return false;
}

// adds new player to players array and send back to same socket, and sends individual player data to all other sockets
function onPlayerJoined(player) {
  if (getCount(this, player) === "alreadyLoggedIn") {
    return;
  }
  // players obj struct
  var socketId = this.id;
  players[socketId] = {
    player_id: socketId,
    username: player.username,
    x: player.x,
    y: player.y,
    tilePos: player.tilePos,
    direction: player.direction,
    inBldg: false,
    room: "public"
  };
}

function onPlayerMoved(direction, tilePos) {
  players[this.id].tilePos = tilePos;
  // send info to other players' movement intent 
  this.broadcast.emit("playerMoved", this.id, direction);
}

function onClose() {
  if(players[this.id]) {
    this.to(players[this.id].room).emit("removePlayer", this.id);
    this.to(players[this.id].room).emit("chatUserLeave", players[this.id].username, players[this.id].room);
    console.log("Client disconnected");
    this.leave(players[this.id].room);
    delete players[this.id];
  }
}
 
function onDisconnect() {
  if(players[this.id]) {
    this.to(players[this.id].room).emit("removePlayer", this.id);
    this.to(players[this.id].room).emit("chatUserLeave", players[this.id].username, players[this.id].room);
    console.log("Client disconnected");
    this.leave(players[this.id].room);
    delete players[this.id];
  }
}

// listens to catch errors
async function onListItems(callback) {
  try {
    const items = await findItems();
    callback({
      status: "OK",
      items,
    });
  } catch (e) {
    callback({
      status: "NOK",
    });
  }
} 

function onSetPlayerRoom(room) {
  players[this.id].room = room;
}
