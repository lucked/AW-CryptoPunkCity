// var alert;

/**
 * Creates and alert modal based on alertText, destroys itslelf on button click
 * @param {Phaser.Scene} scene
 * @param {string} alertText
 */
function setAlertModal(scene, alertText, isLogin) {
  // create dom element
  let alert = scene.add
    .dom(0, 0)
    .createFromCache("alert")
    .setDepth(10)
    .addListener("click");
    // .setOrigin(0.5);
  // grab alert text holder and pass in altertText value
  alert.getChildByID("alertText").innerHTML = alertText;
  // on button click destroy game object
  alert.on("click", function (event) {
    if (event.target.id === "alertClose") {
      alert.destroy();
      alert = null;
    }
  });
  setInterval(() => {
    if (!isLogin) {
      updateAlertModal(scene, alert);
      console.log("updating alert position");
    }
  }, 200);
}

function updateAlertModal(scene, alert) {
  if (alert) {
    alert.x = scene.cameras.main.scrollX - 200;
    alert.y = scene.cameras.main.scrollY - 200;
  }
}

export { setAlertModal, updateAlertModal };
