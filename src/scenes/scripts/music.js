// handles the audius music player
import { setElements } from "../../audius/musicPlayer";
 
/**
 * creates game object into scene and links to code
 * @param {Phaser.Scene} scene 
 */
function setMusicPlayer(scene) {
    // links the created dom element to the on click handling
    insertMusicHtml(scene);
    setElements(scene);
}

/**
 * creates temp game object to grab to grab inner html and add it to sidebar
 * @param {Phaser.Scene} scene 
 */
function insertMusicHtml(scene) {
  var musicHtml =  scene.add
  .dom(0, 0)
  .createFromCache("music");
  scene.sidebar.getChildByID("tabWindow").innerHTML += musicHtml.getChildByID("musicContent").innerHTML;
  musicHtml.destroy();
}

export { setMusicPlayer };