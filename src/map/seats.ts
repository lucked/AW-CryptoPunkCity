/**
 * HANDLES ALL TILE TRIGGER CREATION
 */
import {
  newSocket,
  makeEvent,
  deleteRoom,
  renderChatUsers,
  renderRooms,
  renderMessages,
} from "../client/socket";
import eventsCenter from "../EventsCenter";
import { clearOtherPlayers } from "../scenes/scripts/players";
import { Direction } from "../movement/Direction";
import { makeMuseumEntrance, makeRestaurantEntrance, makeBankEntrance } from "./entrances";

// global variables
var
  seatRoom = "public",
  chat = {
    openRooms: [],
    roomIndex: 0,
  };
export { seatRoom, chat };

/**
 * Handles tile map triggers used for doors and seating
 */
export class Seats {
  // bools and trigger counts to check against when triggered
  constructor(
    public inChat: boolean,
    public inSeat: boolean,
    public pickupAsked: boolean,
    public inBldg: boolean,
    public triggerCount: number
  ) {}

  /**
   * **************************************
   * *************SEATING******************
   * **************************************
   */

  /**
   * creates seating for demo scene
   * @param layer for tile trigger
   * @param layers 
   * @param scene for accessing sub objects
   */
  createSeating(layer, layers, scene): void {
    this.setDefaultArea(layer, scene);
    this.makeTables(layer, scene);
    this.makeBenches(layer, scene);
    this.makeMask(scene);
    this.makeBank(layer, scene);
    this.makeMuseum(layer, scene);
    // this.makeRestaurant(layer, scene); 
  }

  /**
   * creates all restaurant seats
   * @param layer 
   * @param scene 
   */
  public createRestaurantSeating(layer, scene) {
    this.makeRestaurantMask(scene);
  }

  public createMuseumSeating(layer, scene): void {
    this.makeMuseumMask(scene);
    //bottom left
    this.makeBooth(2, 36, layer, 1, scene);
    this.makeBooth(7, 36, layer, 2, scene);
    this.makeBooth(12, 36, layer, 3, scene);
    this.makeBooth(17, 36, layer, 4, scene);
    //middle
    this.makeBooth(28, 17, layer, 9, scene);
    this.makeBooth(28, 21, layer, 10, scene);
    this.makeBooth(28, 25, layer, 10, scene);
    this.makeBooth(28, 29, layer, 10, scene);
    //bottom right
    this.makeBooth(39, 36, layer, 5, scene);
    this.makeBooth(44, 36, layer, 6, scene);
    this.makeBooth(49, 36, layer, 7, scene);
    this.makeBooth(54, 36, layer, 8, scene);
  }

  /**
   * makes all tables in Demo world
   * @param layer 
   * @param scene 
   */
  private makeTables(layer, scene): void {
    // Arcade
    this.makeTable(25, 20, layer, 1, scene);
    this.makeTable(30, 20, layer, 2, scene);
    this.makeTable(46, 20, layer, 3, scene);
    this.makeTable(51, 20, layer, 4, scene);
    // Alley
    this.makeTable(65, 18, layer, 4, scene);
  }

  /**
   * Creates all benches in Demo world
   * @param layer for tile trigger
   * @param scene to access sub objects
   */
  private makeBenches(layer, scene): void {
    // BusStop
    this.makeBench(25, 27, layer, 13, scene);
    this.makeBench(31, 27, layer, 14, scene);
    this.makeBench(46, 27, layer, 15, scene);
    this.makeBench(52, 27, layer, 16, scene);
    // Spawn
    this.makeBench(32, 36, layer, 17, scene);
    this.makeBench(32, 46, layer, 18, scene);
    this.makeBench(45, 36, layer, 19, scene);
    this.makeBench(45, 46, layer, 20, scene);
    //bottom
    this.makeBench(30, 57, layer, 21, scene);
    this.makeBench(47, 57, layer, 22, scene);
  }

  /**
   * Make seat of type bench
   * @param x position
   * @param y position
   * @param layer for tile trigger
   * @param room index of seat
   * @param scene 
   */
  private makeBench(x: number, y: number, layer, room: number, scene): void {
    this.makeChatSeats(layer, x, y, 3, 1, "bench", room, scene);
  }

  /**
   * Makes a seat of type booth
   * @param x position
   * @param y position
   * @param layer for tile trigger
   * @param room index of seat
   * @param scene 
   */
  private makeBooth(x: number, y: number, layer, room: number, scene): void {
    this.makeChatSeats(layer, x, y, 4, 1, "booth", room, scene);
  }

  /**
   * 
   * @param x position
   * @param y position
   * @param layer for tile trigger
   * @param room index of seat
   * @param scene to add to the scene
   */
  private makeTable(x: number, y: number, layer, room: number, scene): void {
    this.makeChatSeats(layer, x, y, 4, 3, "table", room, scene);
  }

  /**
   * **************************************
   * ***************EXITS******************
   * **************************************
   */

  /**
   * Makes the exit to the restaurant
   * @param layer for tile trigger
   * @param scene to switch scenes
   * @param aPhysics to check if moving
   */
  public makeRestaurantExit(layer, scene, aPhysics) {
    layer.setTileLocationCallback(40, 7, 1, 4, () => {
      if (!aPhysics.isMoving() && this.triggerCount < 1) {
        this.triggerCount = 1;
        scene.scene.switch("Game");
        scene.scene.stop("RestaurantScene");
        eventsCenter.emit("leaveBuilding", Direction.RIGHT);
        clearOtherPlayers();
        newSocket.emit(
          "leaveRoom",
          scene.sceneRoom,
          chat.openRooms[this.findRoom(scene.sceneRoom)].isPm
        );
        deleteRoom(scene.sceneRoom);
        renderChatUsers();
        renderMessages();
        renderRooms();
        newSocket.emit("leaveMap", scene.sceneRoom);
      }
    });
  }

  /**
   * Makes museum exit
   * @param layer 
   * @param scene 
   * @param aPhysics 
   */
  public makeMuseumExit(layer, scene, aPhysics) {
    layer.setTileLocationCallback(28, 38, 4, 1, () => {
      if (!aPhysics.isMoving() && this.triggerCount < 1) {
        this.triggerCount = 1;
        scene.scene.switch("Game");
        scene.scene.stop("MuseumScene");
        eventsCenter.emit("leaveBuilding", Direction.DOWN);
        clearOtherPlayers();
        newSocket.emit(
          "leaveRoom",
          scene.sceneRoom,
          chat.openRooms[this.findRoom(scene.sceneRoom)].isPm
        );
        deleteRoom(scene.sceneRoom);
        renderChatUsers();
        renderMessages();
        renderRooms();
        newSocket.emit("leaveMap", scene.sceneRoom);
      }
    });
  }

  /**
   * **************************************
   * *************ENTRANCES****************
   * **************************************
   */

  /**
   * makes restaurant entrance
   * @param layer 
   */
  private makeRestaurant(layer, scene) {
    makeRestaurantEntrance(layer, scene, this);
  }

  /**
   * Makes museum entrance
   * @param layer 
   * @param scene 
   */
  private makeMuseum(layer, scene) {
    makeMuseumEntrance(layer, scene, this);
  }

  /**
   * Make bank entrance
   * @param layer for tile trigger
   * @param scene to switch scenes
   */
  private makeBank(layer, scene) {
    makeBankEntrance(layer, scene, this);
  }

  /**
   * *********************************************
   * *******************CHATS*********************
   * *********************************************
   */

  /**
   * set handling for chat seat
   * @param layer for tile trigger
   * @param x position
   * @param y position
   * @param w width
   * @param l length
   * @param name seat type
   * @param num index of type
   * @param scene to access sidebar
   */
   private makeChatSeats(layer, x, y, w, l, name, num, scene) {
    layer.setTileLocationCallback(x, y, w, l, () => {
      if (!scene.atlantisPhysics.isMoving()) {
        if (!this.inSeat && this.triggerCount < 1) { 
          this.triggerCount = 1;
          this.inSeat = true;
          if (
            scene.sidebar
              .getChildByID("tabWindow")
              .classList.contains("slideIn")
          ) {
            scene.sidebar
              .getChildByID("tabWindow")
              .classList.remove("slideIn");
          }
          this.startChat(name, x, y, num, scene);
        }
      }
    });
  }

  /**
   * 
   * @param type of seat
   * @param x position
   * @param y posiiton
   * @param room index of type
   * @param scene to access mask
   */
  private startChat(type, x, y, room, scene) {
    if (!this.inChat) {
      this.inChat = true;
      seatRoom = type + room;
      this.showMask(type, x, y, scene);
      newSocket.emit("joinRoom", seatRoom);
    }
  }

  /**
   * sets the default tile area and what to do
   * @param layer for setting tile trigger
   * @param scene to access atlantis controls
   */
  public setDefaultArea(layer, scene) {
    layer.setTileLocationCallback(0, 0, 80, 64, () => {
      if(this.inChat) {
        this.inChat = false;
        scene.atlantisControls.exitChat();
        this.hideMask(scene);
      }
      this.inSeat = false;
      this.triggerCount = 0;
      this.inBldg = false;
    });
  }

  /**
   * *********************************************
   * *******************MASKS*********************
   * *********************************************
   */

  /**
   * hides the active chat mask
   * @param scene to access mask
   */
  private hideMask(scene) {
    var triggered = 0;
    while (triggered < 1) {
      scene.mask.setVisible(false);
      if (scene.maskBench) {
        scene.maskBench.setVisible(false);
        scene.maskTable.setVisible(false);
      }
      if (scene.maskBooth) {
        scene.maskBooth.setVisible(false);
      }
      triggered++;
    }
  }

  /**
   * Show mask of proper type at seat location
   * @param type of seat
   * @param maskX position
   * @param maskY position
   * @param scene to access mask and camera
   */
  private showMask(type, maskX, maskY, scene) {
    const newMaskX = maskX * 32;
    const newMaskY = maskY * 32;
    const newX = scene.cameras.main.midPoint.x;
    const newY = scene.cameras.main.midPoint.y;
    scene.mask.x = newX;
    scene.mask.y = newY;
    scene.mask.setVisible(true);
    if (type === "bench") {
      scene.maskBench.x = newMaskX - 16;
      scene.maskBench.y = newMaskY;
      scene.mask.mask = new Phaser.Display.Masks.GeometryMask(
        scene,
        scene.maskBench
      );
      scene.mask.mask.invertAlpha = true;
    }
    if (type === "table") {
      scene.maskTable.x = newMaskX - 16;
      scene.maskTable.y = newMaskY + 16;
      scene.mask.mask = new Phaser.Display.Masks.GeometryMask(
        scene,
        scene.maskTable
      );
      scene.mask.mask.invertAlpha = true;
    }
    if (type === "booth") {
      scene.maskBooth.x = newMaskX - 16;
      scene.maskBooth.y = newMaskY + 16;
      scene.mask.mask = new Phaser.Display.Masks.GeometryMask(
        scene,
        scene.maskBooth
      );
      scene.mask.mask.invertAlpha = true;
    }
  }

  /**
   * Create Mask into demo scene
   * @param scene to create masks
   */
  private makeMask(scene) {
    scene.mask = scene.add
      .rectangle(0, 0, 1800, 1800, 0x3d4654, 0.5)
      .setDepth(9)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setVisible(false);
    scene.maskBench = scene.add
      .rectangle(0, 0, 128, 64, 0xffffff, 0)
      .setDepth(10)
      .setOrigin(0)
      .setVisible(false);
    scene.maskTable = scene.add
      .rectangle(0, 0, 160, 128, 0xffffff, 0)
      .setDepth(10)
      .setOrigin(0)
      .setVisible(false);
  }

  /**
   * Makes seat masks for museum scene
   * @param scene to addd masks
   */
  private makeMuseumMask(scene) {
    scene.mask = scene.add
      .rectangle(0, 0, 1800, 1800, 0x3d4654, 0.5)
      .setDepth(9)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setVisible(false);
    scene.maskBooth = scene.add
      .rectangle(0, 0, 160, 96, 0xffffff, 0)
      .setDepth(10)
      .setOrigin(0)
      .setVisible(false);
  }

  /**
   * Makes seat masks for restaurant scene
   * @param scene to add mask
   */
  private makeRestaurantMask(scene) {
    scene.mask = scene.add
      .rectangle(0, 0, 1800, 1800, 0x3d4654, 0.5)
      .setDepth(9)
      .setBlendMode(Phaser.BlendModes.MULTIPLY)
      .setVisible(false);
  }

  /**
   * *******************************************************
   * ***********************MISC****************************
   * *******************************************************
   */

  /**
   * iterate through open rooms to find match against roomName
   * @param roomName string to check against
   * @returns boolean of wether it found it or not
   */
   private findRoom(roomName) {
    for (let i = 0; i < chat.openRooms.length; i++) {
      if (roomName === chat.openRooms[i].socket) {
        return i;
      }
    }
    return;
  }
}