/**
 * Creates sidebar from html template
 * @param {Phaser.Scene} scene
 */
function setSidebar(scene) {
  scene.sidebar = scene.add.dom(0, 30).createFromCache("sidebar").setDepth(10);
}

/**
 * updatest the position of the sidebar based on camera position and offset
 * @param {number} offsetX
 * @param {number} offsetY
 * @param {Phaser.Scene} scene
 */
function updateSidebar(offsetX, offsetY, scene) {
  const xPos = scene.cameras.main.scrollX + offsetX;
  const yPos = scene.cameras.main.scrollY + offsetY;
  scene.sidebar.x = xPos;
  scene.sidebar.y = yPos;
}

export { setSidebar, updateSidebar };