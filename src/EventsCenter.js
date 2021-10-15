import Phaser from "phaser";

// event emitter handler. allows for scenes to communicate with one another
const eventsCenter = new Phaser.Events.EventEmitter();

export default eventsCenter;
