import {
  authenticateMoralis,
  connectMoralis,
} from "../web3/metamaskConnection.js";
import { makeLoader } from "./scripts/loaderScreen.js";
import { setAlertModal } from "./scripts/alert.js";
import { connectSocket, setActiveScene } from "../client/socket.js";
import { getLivePeerData } from "./scripts/livePeer.js";
import { checkOnline } from "./scripts/tools";


// global variables
export var gameScene;
var isLoggedIn = false,
  isError = false,
  socketConnected = false,
  isDisconnected,
  errorText;

/**
 * settings for game scene
 * @type {object}
 */
const sceneConfig = {
  key: "LoginScene",
  pack: {
    files: [
      {
        type: "image",
        key: "cyberBiker",
        url: "assets/loading/cyberBiker.png",
      },
    ],
  },
};

// scene setup
class LoginScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }
  init(data) {
    if(data && data.isLoggedIn) {
      isLoggedIn = true;
    }
    if(data && data.isDisconnected) {
      isDisconnected = true;
    }
    if(data && data.isError) {
      isError = true;
      errorText = data.isError;
    }
  }
  preload() {
    if (!socketConnected && checkOnline()) {
      connectSocket();
    }
    gameScene = this;
    setActiveScene(gameScene);
    loadAssets();
    makeLoader(gameScene);
    connectMoralis();
  }
  create() {
    setBackground();
    checkBrowser();
    setLoginForm();
    // getLivePeerData();
  }
  update(time, delta) {
    // console.log(`${git-branch}`);
    if(isLoggedIn) {
      setAlertModal(gameScene, "You Are Already Logged In!", true);
      isLoggedIn = false;
    }
    if(isDisconnected) {
      setAlertModal(gameScene, "Disconnected from Atlantis World", true);
      isDisconnected = false;
    }
    if(isError) {
      setAlertModal(gameScene, errorText, true);
      isError = false;
      errorText = null;
    }
  }
}

export function setConnected() {
  socketConnected = true;
}

/**
 * checks if browser is chrome (ideal browser)
 */
function checkBrowser() {
  //var isFirefox = typeof InstallTrigger !== "undefined";
  var isChrome =
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
  if (!isChrome) {
    setAlertModal(gameScene, "Please Use Chrome Browser", true);
  }
  //console.log(navigator.userAgent);
}

// create bg with animation
function setBackground() {
  var bg = gameScene.add.image(0, 0, "bg").setOrigin(0).setScale(0.5);
  var login = gameScene.add
    .dom(0,0)
    .createFromCache("login")
    .setDepth(3)
}

/**
 * checks to see if its first log in
 * if yes send to registration page
 * if no send to game scene
 * @param {object} user
 */
const startGameScene = async (user) => {
  if (socketConnected) {
    user.attributes.Nickname
      ? gameScene.scene.start("Game", {
          username: user.attributes.Nickname,
        })
      : gameScene.scene.start("RegistrationScene", {
          username: user.attributes.Nickname,
        });
  }
};

// creates the login form using the html template
function setLoginForm() {
  var loginInput = gameScene.add
    .dom(650, 660)
    .createFromCache("loginForm")
    .setDepth(3)
    .addListener("click");
  loginInput.on("click", function (event) {
    if (event.target.name === "login") {
      authenticateMoralis("metamask").then((user) => startGameScene(user));
    } else if (event.target.name === "loginWalletConnect") {
      authenticateMoralis("walletconnect").then((user) => startGameScene(user));
    }
  });
}

//load assets for game scene
function loadAssets() {
  gameScene.load.image("bg", "assets/login/loginBG.png");
  gameScene.load.html("loginForm", "assets/login/loginForm.html");
  gameScene.load.html("login", "assets/login/login.html");
  gameScene.load.html("alert", "assets/alerts/browserCheck/alert.html");
}

export default LoginScene;
