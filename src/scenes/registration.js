import * as MetaMaskAPI from "../web3/metamaskConnection";

//Global Variables
var gameScene;

//Scene Setup
class RegistrationScene extends Phaser.Scene {
  constructor() {
    super("RegistrationScene");
  }
  init() {
    // Used to prepare data
  }
  preload() {
    gameScene = this;
    loadAssets();
  }
  create(User) {
    setBackground();
    setRegistrationForm(User);
  }
  update(time, delta) {}
}

// creates background image
function setBackground() {
  var bg = gameScene.add
    .image(0, 0, "registrationBG")
    .setOrigin(0)
    .setScale(0.5);
}

/**
 * creats registration form with listeners and sets username
 * @param {object} User holds user data to pass into username variable
 */
function setRegistrationForm(User) {
  var profileInput = gameScene.add
    .dom(650, 400)
    .createFromCache("registrationForm")
    .setDepth(3)
    .addListener("click");
  var inputUsername = profileInput.getChildByName("username");
  if (User.username) inputUsername.value = User.username;

  profileInput.on("click", function (event) {
    if (event.target.name === "start") {
      if (inputUsername.value) {
        MetaMaskAPI.setProfileMoralis(inputUsername.value).then((user) => {
          gameScene.scene.start("Game", { username: user.attributes.Nickname });
        });
      } else {
        alert("Please input Username");
      }
    }
  });
  MetaMaskAPI.web3Listener();
}

// loads asset for scene to use
function loadAssets() {
  gameScene.load.image("registrationBG", "assets/login/registrationscreen.png");
  gameScene.load.html("registrationForm", "assets/login/registrationForm.html");
}

export default RegistrationScene;
