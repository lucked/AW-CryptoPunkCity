/**
 * HANDLES CHAT BAR ELEMENT CREATION AND ONCLICK SETUP
 */
import { chat } from "../../map/seats";
import {
  newSocket,
  renderedMessages,
  renderMessages,
  renderRooms,
  renderChatUsers,
  deleteRoom,
  setChatElements,
} from "../../client/socket";
import { username } from "../game";
import { seats } from "../scripts/maps";
import { toggleInteractive } from "./museum";
import { toggleHtmlClickable } from "./tools";

/**
 * Makes temp game object to copy html contents and add into sidebar element, then destroy temp
 * @param {Phaser.Scene} scene 
 */
function insertChatHtml(scene) {
  var chatHtml =  scene.add
  .dom(0, 0)
  .createFromCache("chat");
  scene.sidebar.getChildByID("tabWindow").innerHTML += chatHtml.getChildByID("chatContent").innerHTML;
  chatHtml.destroy();
}

/**
 * Adds chat to sidebar and then sets up onclick events
 * @param {Phaser.Scene} scene 
 */
function setChatForm(scene) {
  // put chat html into sidebar element
  insertChatHtml(scene);
  scene.sidebar.getChildByID("chatroomName").innerHTML = username;
  // set up on click events
  scene.sidebar
    .addListener("click")
    .on("click", function (event) {
      // leave chat room
      if (event.target.classList.contains("leaveButton")) {
        seats.inChat = false;
        newSocket.emit(
          "leaveRoom",
          chat.openRooms[chat.roomIndex].socket,
          chat.openRooms[chat.roomIndex].isPm
        );
        deleteRoom(chat.openRooms[chat.roomIndex].socket);
        renderChatUsers();
        renderMessages();
      }
      // send message
      if (event.target.name === "chat") {
        submitChatMessage(scene);
      }
      // select chat room
      if (event.target.classList.contains("chatButton")) {
        chat.roomIndex = getIndex(event.target);
        renderRooms();
        renderChatUsers();
        renderMessages();
      }
      // start private message
      if (event.target.classList.contains("pmButton")) {
        const userIndex = getIndex(event.target.parentNode);
        const userSocket = chat.openRooms[chat.roomIndex].users[userIndex / 2].socket;
        newSocket.emit("joinUserRoom", userSocket);
      }
      // toggle sidebar slide in and out
      if (event.target.classList.contains("sidebarTab") &&
      scene.sidebar.getChildByID("tabWindow").classList.contains("slideIn")) {
        toggleInteractive(false);
        toggleHtmlClickable(false);
        scene.sidebar.getChildByID("tabWindow").classList.toggle("slideIn");
      }
      // toggle chat tab display
      if (event.target.id === "chatTab") {
        if (scene.activeTab === "chat") {
          scene.sidebar.getChildByID("tabWindow").classList.toggle("slideIn");
          toggleInteractive(true);
          toggleHtmlClickable(true);
          scene.activeTab = "";
        }
        else {
          scene.activeTab = "chat";
          if (!scene.sidebar.getChildByID("musicHolder").classList.contains("hidden")) {
            scene.sidebar.getChildByID("musicHolder").classList.add("hidden");
          }
          if (scene.sidebar.getChildByID("chatHolder").classList.contains("hidden")) {
            scene.sidebar.getChildByID("chatHolder").classList.remove("hidden");
          }
        }
      }
      // toggle music tab display
      if (event.target.id === "musicTab") {
        if (scene.activeTab === "music") {
          scene.sidebar.getChildByID("tabWindow").classList.toggle("slideIn");
          toggleInteractive(true);
          toggleHtmlClickable(true);
          scene.activeTab = "";
        }
        else {
          scene.activeTab = "music";
          if (!scene.sidebar.getChildByID("chatHolder").classList.contains("hidden")) {
            scene.sidebar.getChildByID("chatHolder").classList.add("hidden");
          }
          if (scene.sidebar.getChildByID("musicHolder").classList.contains("hidden"))
          scene.sidebar.getChildByID("musicHolder").classList.remove("hidden");
        }
      }
    });
  // while typing chat message, adding special characters, send message with enter, and moving caret
  scene.sidebar.addListener("keydown")
  scene.sidebar.on("keydown", function (event) {
    if (event.keyCode == 32) {
      textInput.value = textInput.value + "\xa0";
    }
    if (event.keyCode == 37) {
      setCaretPosition("left", textInput);
    }
    if (event.keyCode == 39) {
      setCaretPosition("right", textInput);
    }
    if (event.keyCode == 13) {
      submitChatMessage(scene);
    }
    setChatElements(scene);
  })
}

/**
 * find index of item based on what nth child it is
 * @param {node} node 
 * @returns 
 */
function getIndex(node) {
  var child = node;
  var parent = child.parentNode;
  var index = Array.prototype.indexOf.call(parent.children, child);
  return index;
}

/**
 * function handles using the arrow keys to move the caret position when typing a message
 * @param {Direction} direction 
 * @param {element} element 
 */
function setCaretPosition(direction, element) {
  const pos = element.selectionStart;
  if (element != null) {
    if (direction === "right") {
      element.setSelectionRange(pos + 1, pos + 1);
    } else {
      element.setSelectionRange(pos - 1, pos - 1);
    }
  }
}

/**
 * Sends a chat message to socket.io if not empty.
 * It handles private messages differently
 * @param {Phaser.Scene} scene 
 */
function submitChatMessage(scene) {
  var textInput = scene.sidebar.getChildByID("textInput");
  //  Have they entered anything?
  if (textInput.value !== "") {
    // create new message object
    const newMsg = {
      username: username,
      text: textInput.value,
    };
    // get messages array
    const msgArray = chat.openRooms[chat.roomIndex].messages;
    // append message
    msgArray[msgArray.length] = newMsg;
    // private message
    if (chat.openRooms[chat.roomIndex].isPm) {
      newSocket.emit(
        "message",
        chat.openRooms[chat.roomIndex].socket,
        textInput.value,
        true
      );
    }
    // regular message
    if (!chat.openRooms[chat.roomIndex].isPm) {
      newSocket.emit(
        "message",
        chat.openRooms[chat.roomIndex].socket,
        textInput.value,
        false
      );
    }
    // render array into dom elements
    renderMessages();
    // add elements into messages holder
    scene.sidebar.getChildByID("messages").innerHTML =
      renderedMessages;
    // clear message value
    textInput.value = "";
    // refocus on message text input
    textInput.focus();
  }
}

export { setChatForm };
