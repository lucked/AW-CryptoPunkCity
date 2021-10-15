/**
 * HANDLES ALL THE CRAFTING ITEMS (PICKUP AND TRIGGERING MINTING)
 */
import { GameABI } from "../../utils/abis";
import { getChainId } from "../../web3/web3helpers";
// import { craftModal, swordItem } from "../game";
import { PLAYER_DEPTH } from "../game";

const contractAddress = "0xfdc2d96871f6c5eae565885ada6eac6586072ba8";

/**
 * Attempts to pick up item, if it can it mints it and returns true if not it just returns false
 * @returns {boolean} wether is succeeded or not
 */
export const pickUpItems = async () => {
  let isMinted = false;
  const contractNFT = new window.web3.eth.Contract(GameABI, contractAddress);
  const userAddress = (await window.web3.eth.getAccounts())[0];
  const chainId = await getChainId();
  if (chainId == "0x13881" || chainId == 80001) {
    await contractNFT.methods
      .pickUpItems()
      .send({ from: userAddress })
      .then(function (receipt) {
        alert("You picked up items!");
        isMinted = true;
      })
      .catch((error) => alert(error.message));
  } else {
    await switchNetwork("0x13881");
  }

  return isMinted;
};

export const createItem = async () => {
  let isMinted = false;
  const userAddress = (await window.web3.eth.getAccounts())[0];
  const contractNFT = new window.web3.eth.Contract(GameABI, contractAddress);
  const chainId = await getChainId();
  if (chainId == "0x13881" || chainId == 80001) {
    await contractNFT.methods
      .createItem()
      .send({ from: userAddress })
      .then(function (receipt) {
        alert("You crafted the Crypto Sword!");
        craftModal.setVisible(false);
        swordItem.setVisible(true);
        isMinted = true;
      });
  } else {
    await switchNetwork("0x13881");
  }
  return isMinted;
};

/**
 * Holds the seperate parts of the crafting object
 * @type {array}
 */
var items = [
  {
    name: "sword",
    baseItems: [
      {
        name: "Handle",
        url: "assets/crafting/items/swordbottom.png",
      },
      // {
      //   name: "Blade",
      //   url: "assets/crafting/items/swordupper.png",
      // }
    ],
    result: {
      name: "Sword",
      url: "assets/crafting/items/sword.png",
    },
  },
];

var swordItem, craftBtn, craftModal, baseItemObj, itemCollider;

/**
 * adds sword image to game
 * @param {Phaser.Scene} scene
 */
function makeSwordItem(scene) {
  swordItem = scene.add.image(0, 0, "swordItem").setScale(0.3).setDepth(10).setVisible(false);
}

/**
 * adds the crafting toggle button
 * @param {Phaser.Scene} scene
 */
function makeCraftBtn(scene) {
  craftBtn = scene.add.image(0, 0, "openCrafting").setDepth(9).setVisible(false).setInteractive();
  craftBtn.on("pointerdown", function () {
    craftModal.setVisible(true);
    craftBtn.setVisible(false);
  });
}

/**
 * Creates the crafting modal
 * @param {Phaser.Scene} scene
 * @param {Phaser.GameObjects.Sprite} playerSprite
 */
function makeAllCraftingItems(scene, playerSprite) {
  craftModal = scene.add
    .dom(0, 660)
    .createFromCache("crafting")
    .setDepth(10)
    .addListener("click")
    .setVisible(false)
    .on("click", async function (event) {
      if (event.target.name === "craftBtn") {
        createItem()
          .catch((error) => alert(error.message))
          .then((isMinted) => {
            if (isMinted) {
              //
            } else {
              //
            }
          });
      }
      if (event.target.name === "cancelBtn") {
        craftModal.setVisible(false);
        craftBtn.setVisible(true);
      }
    });
  const spacing = 300;
  items.map((item) => {
    item.baseItems.map((baseItem, i) => {
      const xPos = i * spacing + spacing + 830;
      const yPos = 1400;
      baseItemObj = scene.physics.add
        .image(xPos, yPos, baseItem.name)
        .setDepth(PLAYER_DEPTH)
        .setScale(0.1);
      itemCollider = scene.physics.add.overlap(playerSprite, baseItemObj, function () {
        if (itemPickup.visible === false) {
          showItemPickup();
        }
      });
    });
  });
}

// makes pickup item modal visible
function showItemPickup() {
  itemPickup.setVisible(true);
  itemPickupNo.setVisible(true);
  itemPickupYes.setVisible(true);
}

// makes pickup item modal invisible
function hideItemPickup() {
  itemPickup.setVisible(false);
  itemPickupNo.setVisible(false);
  itemPickupYes.setVisible(false);
}

var itemPickup, itemPickupYes, itemPickupNo;

/**
 * Creates item pickup modal
 * @param {Phaser.Scene} scene
 */
function makeItemPickup(scene) {
  itemPickup = scene.add.image(1200, 800, "pickupImage").setDepth(10).setVisible(false);
  itemPickupYes = scene.add
    .image(itemPickup.x - 60, itemPickup.y + 50, "pickupYes")
    .setDepth(10)
    .setVisible(false)
    .setInteractive();
  itemPickupNo = scene.add
    .image(itemPickup.x + 60, itemPickup.y + 50, "pickupNo")
    .setDepth(10)
    .setVisible(false)
    .setInteractive();
  itemPickupYes.on("pointerdown", function () {
    //baseItemObj.setVisible(false).setInteractive(false).enableBody(false);
    itemCollider.destroy();
    baseItemObj.destroy();
    hideItemPickup();
    pickUpItems()
      .catch((error) => alert(error.message))
      .then((isMinted) => {
        if (isMinted) {
          itemCollider.destroy();
          baseItemObj.destroy();
          hideItemPickup();
        } else {
          hideItemPickup();
        }
      });
  });
  itemPickupNo.on("pointerdown", function () {
    hideItemPickup();
  });
}

/**
 * Updates the positioning of the item pickup and crafting modal
 * @param {Player} player
 * @param {Phaser.Scene} scene
 */
function updateItemPickup(player, scene) {
  const x = scene.cameras.main.scrollX;
  const y = scene.cameras.main.scrollY;
  itemPickup.x = player.x;
  itemPickup.y = player.y;

  itemPickupYes.x = player.x - 70;
  itemPickupYes.y = player.y + 100;
  itemPickupNo.x = player.x + 70;
  itemPickupNo.y = player.y + 100;

  swordItem.x = player.x + 700;
  swordItem.y = player.y - 400;

  craftBtn.x = x + 1200;
  craftBtn.y = y - 20;

  craftModal.x = x + 580;
  craftModal.y = y + 350;
}

/**
 * Iterates throught the items array and loads the image of each
 * @param {Phaser.Scene} scene
 */
function loadBaseItems(scene) {
  items.map((item) => {
    item.baseItems.map((baseItem) => {
      scene.load.image(baseItem.name, baseItem.url);
    });
  });
}

/**
 * fires all the crafting item creations
 * @param {Phaser.Scene} scene
 * @param {Phaser.GameObjects.Sprite} playerSprite
 */
function setCrafting(scene, playerSprite) {
  makeAllCraftingItems(scene, playerSprite);
  makeItemPickup(scene);
  makeCraftBtn(scene);
  makeSwordItem(scene);
}

export {
  updateItemPickup,
  makeAllCraftingItems,
  makeItemPickup,
  showItemPickup,
  hideItemPickup,
  makeSwordItem,
  makeCraftBtn,
  loadBaseItems,
  setCrafting,
};
