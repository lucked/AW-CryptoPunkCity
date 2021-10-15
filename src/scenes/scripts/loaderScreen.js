/**
 * Creates Loading progress screen
 * @param {Phaser.Scene} scene 
 */
function makeLoader(scene) {
  // bar holder
  var progressBox = scene.add.graphics();
  // bar
  var progressBar = scene.add.graphics();
  progressBox.fillStyle(0x222222, 0.8);
  progressBox.fillRect(470, 450, 320, 50);

  var loadingImage = scene.add.image(650, 350, "cyberBiker");

  // as it gets closer to being done loading, increase size of progress bar
  scene.load.on("progress", function (value) {
    progressBar.clear();
    progressBar.fillStyle(0x2bffce, 1);
    progressBar.fillRect(480, 460, 300 * value, 30);
  });
  // as it moves on to the next file
  scene.load.on("fileprogress", function (file) {});
  // when all loading is complete, self destruct
  scene.load.on("complete", function () {
    progressBar.destroy();
    progressBox.destroy();
    loadingImage.destroy();
  });
}

export { makeLoader };
