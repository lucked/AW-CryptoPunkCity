import { Seats } from "../../map/seats";
export var seats = new Seats(false, false, false, false, 0);
export var museumCollisionLayer;
export var restaurantCollisionLayer;
/**
 * Creates Demo tile map
 * @param {Phaser.Scene} scene 
 */
function createDemoMap(scene) {
  var layers = scene.add.group();
  scene.mainSceneTileMap = scene.make.tilemap({ key: "demoWorld" });
  const tileSet = scene.mainSceneTileMap.addTilesetImage(
    "awTileSet-new",
    "tiles"
  );
  for (let i = 0; i < scene.mainSceneTileMap.layers.length; i++) {
    const layer = scene.mainSceneTileMap.createLayer(i, "awTileSet-new", 0, 0);
    layer.setDepth(i);
    layer.scale = 2;
    if (i === 3) {
      /**create seating */
      seats.createSeating(layer, layers, scene);
      scene.physics.add.overlap(scene.player.sprite, layer);
    }
  }
}

/**
 * Creates museum tile map
 * @param {Phaser.Scene} scene 
 */
function createMuseumMap(scene) {
  var layers = scene.add.group();
  scene.mainSceneTileMap = scene.make.tilemap({ key: "museum" });
  const tileSet = scene.mainSceneTileMap.addTilesetImage(
    "museumTileSet",
    "museumTiles"
  );
  for (let i = 0; i < scene.mainSceneTileMap.layers.length; i++) {
    const layer = scene.mainSceneTileMap.createLayer(i, "museumTileSet", 0, 0);
    layer.setDepth(i);
    layer.scale = 2;
    if (i === 3) {
      museumCollisionLayer = layer;
      seats.setDefaultArea(layer, scene);
      seats.createMuseumSeating(layer, scene);
      scene.physics.add.overlap(scene.player.sprite, layer);
    }
  }
}

/**
 * Creates restaurant tile map
 * @param {Phaser.Scene} scene 
 */
function createRestaurantMap(scene) {
  scene.mainSceneTileMap = scene.make.tilemap({ key: "restaurant" });
    const tileSet = scene.mainSceneTileMap.addTilesetImage("restaurantTileset", "restaurantTiles");
    for (let i = 0; i < scene.mainSceneTileMap.layers.length; i++) {
      const layer = scene.mainSceneTileMap.createLayer(i, "restaurantTileset", 0, 0);
      layer.setDepth(i);
      layer.scale = 2;
      if (i === 3) {
        /**create seating */
        restaurantCollisionLayer = layer;
        seats.setDefaultArea(layer, scene);
        // seats.createRestaurantSeating(layer, scene);
        scene.physics.add.overlap(scene.player.sprite, layer);
      }
    }
}

export { createDemoMap, createMuseumMap, createRestaurantMap };
