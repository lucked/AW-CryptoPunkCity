// import { fetchRarible } from "../../../assets/museum/raribleFetch";
import { tokenValue } from "../../utils/utils";
var nftModal,
  nftModalBG,
  nftName,
  nftImg,
  nftArtist,
  nftPrice,
  nftPriceRow,
  nftDesc,
  nftDoc,
  testImages,
  selectedHash,
  selectedLink,
  imageObjects = [],
  imgIndex = 0;

const imgWidth = 120;
const imgGap = 25;

// async fetch call to rarible - to populate museum with nft info array
export const fetchRarible = async () => {
  let collection = await fetch(
    // Collection ID and array size are put here
    "https://ethereum-api.rarible.org/v0.1/order/orders/sell/byCollection?collection=0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d&size=50"
  )
    .then((response) => response.json())
    .then((data) => data.orders)
    .catch((error) => console.log(error));
  // holder for urls returned by initial request
  let urls = [];
  //collection is array of objects with information needed to create a link for another call to get further data
  // itterate throug this array and push dynamically created links into url array
  for (let i = 0; i < collection.length; i++) {
    let link = `https://ethereum-api.rarible.org/v0.1/nft/items/${collection[i].make.assetType.contract}:${collection[i].make.assetType.tokenId}/meta`;
    urls.push(link);
  }
  //take array of urls and make fetch calls for each one to recieve all data for each nft
  const metas = await Promise.all(
    urls.map(async (url) => {
      const resp = await fetch(url);
      return resp.json();
    })
  );

  // create useable object array ouput
  for (let i = 0; i < collection.length; i++) {
    // structure for nft array objects
    collection[i].name = metas[i].name;
    collection[i].isOnSale = collection[i].priceHistory[0] ? true : false;
    collection[i].attributes = metas[i].attributes;
    collection[i].image = metas[i].image;
    collection[
      i
    ].link = `https://rarible.com/token/${collection[i].make.assetType.contract}:${collection[i].make.assetType.tokenId}?tab=details`;
  }
  return collection;
};

// Handles etherium transaction
export const matchOrder = async (hash, amount) => {
  const maker = (await window.web3.eth.getAccounts())[0];
  const preparedTx = await prepareTx(hash, maker, amount);
  const tx = {
    from: maker,
    data: preparedTx.transaction.data,
    to: preparedTx.transaction.to,
    value: preparedTx.asset.value,
  };
  window.web3.eth.sendTransaction(tx);
};

// sets up the structure for the usable array of data objects
const prepareTx = async (hash, maker, amount) => {
  const transaction = await fetch(
    `https://ethereum-api.rarible.org/v0.1/order/orders/${hash}/prepareTx`,
    {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ maker, amount, payouts: [], originFees: [] }),
    }
  ).then((response) => response.json());
  return transaction;
};

/**
 * creates the modal and its events into the given scene
 * @param {Phaser.Scene} scene
 */
function makeModal(scene) {
  nftModalBG = scene.add.rectangle(650, 400, 1800, 1200, "0x000", 0.5);
  nftModalBG.setDepth(11).setVisible(false);
  nftModal = scene.add
    .dom(600, 300)
    .createFromCache("nftModal")
    .setDepth(11)
    .setVisible(false)
    .addListener("click");

  nftModal.on("click", function (event) {
    if (event.target.name === "nftBuyBtn") {
      matchOrder(selectedHash, "1");
      //"0xbbbd3569945974eff849718b0c07d2d2b489653ffd772a002df575162b5190db"
    }
    if (event.target.name === "cancelNftBtn") {
      nftPriceRow.style.display = "flex";
      nftModal.setVisible(false);
      nftModalBG.setVisible(false);
      toggleInteractive(true);
    }
    if (event.target.name === "raribleLinkBtn") {
      window.open(selectedLink, "_blank").focus();
    }
  });
  setElements(nftModal);
}

/**
 * updates the nft modal positioning in scene as player moves
 * @param {Phaser.Scene} scene
 */
function updateNftModal(scene) {
  if (nftModal && scene) {
    var xPos = scene.cameras.main.scrollX;
    var yPos = scene.cameras.main.scrollY;
    nftModalBG.x = xPos + 650;
    nftModalBG.y = yPos + 400;

    nftModal.x = xPos + 390;
    nftModal.y = yPos + 300;
  }
}

/**
 * creates a double row of images in the scene - size of length
 * @param {number} xpos
 * @param {number} ypos
 * @param {number} length
 * @param {Phaser.Scene} scene
 */
function makeGalleryRow(xpos, ypos, length, scene) {
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < length; i++) {
      if (imgIndex < testImages.length) {
        const thisIndex = imgIndex;
        var newXpos = xpos + (imgWidth + imgGap) * i;
        var newYpos = ypos;
        if (j === 1) {
          newYpos = ypos + 5 + imgWidth;
        }
        const newImg = scene.add
          .image(newXpos, newYpos, testImages[imgIndex].image.url.PREVIEW)
          .setDepth(10)
          .setInteractive();
        newImg.on("pointerdown", function () {
          toggleInteractive(false);
          setNft(testImages[thisIndex]);
          selectedHash = testImages[thisIndex].hash;
          selectedLink = testImages[thisIndex].link;
          
        });
        resizeImage(newImg);
        imageObjects[imageObjects.length] = newImg;
        imgIndex++;
      }
    }
  }
}

/**
 * creates a double row of images in the scene - size of length
 * @param {boolean} value
 */
function toggleInteractive(value) {
  imageObjects.map((image) => {
    if (value) {
      // console.log("enabling images");
      image.setInteractive();
    } else {
      // console.log("disabling images");
      image.disableInteractive();
    }
  });
}

/**
 * the handler for selecting an nft and having its info populate the modal
 * @param {object} image
 */
function setNft(image) {
  nftImg.setAttribute("src", image.image.url.BIG);
  var attributes = image.attributes
    .map((attr) => {
      return `<div class='attribute'><span class="attrKey">${attr.key}</span><span class="attrValue">${attr.value}</span></div>`;
    })
    .join("");

  const ethConverted = tokenValue(image.take.value, "18");
  if (image.isOnSale) {
    nftPrice.innerHTML = ethConverted;
  } else {
    nftPriceRow.style.display = "none";
  }
  nftName.innerHTML = image.name;
  nftArtist.innerHTML = image.maker;
  nftDesc.innerHTML = attributes;

  setTimeout(() => {
    nftModalBG.setVisible(true);
    nftModal.setVisible(true);
  }, 500);
}

/**
 * link the dom elements to the proper variables
 * @param {Phaser.GameObjects} modal
 */
function setElements(modal) {
  // nftDoc = modal.parent.ownerDocument;
  nftName = modal.getChildByID("nftName");
  nftArtist = modal.getChildByID("nftArtist");
  nftPrice = modal.getChildByID("nftPrice");
  nftPriceRow = modal.getChildByID("priceRow");
  nftDesc = modal.getChildByID("nftDesc");
  nftImg = modal.getChildByID("nftImg");
}

/**
 * resizes all images to predefined image size variable
 * @param {object} image
 */
function resizeImage(image) {
  var newScale = imgWidth / image.width;
  var newHeight = image.height * newScale;
  image.width = imgWidth;
  image.displayWidth = imgWidth;
  image.height = newHeight;
  image.displayHeight = newHeight;
}

/**
 * fetch call to rarible is fired and images are loaded based on response
 * @param {Phaser.Scene} scene
 */
async function loadImages(scene) {
  const metas = await fetchRarible();
  testImages = metas;
  for (let i = 0; i < testImages.length; i++) {
    scene.load.image(
      testImages[i].image.url.PREVIEW,
      testImages[i].image.url.PREVIEW
    );
  }
  scene.load.start();
  scene.load.on("complete", function () {
    makeGalleryRow(140, 130, 11, scene);
    makeGalleryRow(165, 740, 4, scene);
    makeGalleryRow(1300, 740, 4, scene);
  });
}

/**
 * calls async load function using plugin. allows for preload to wait for response from fetch before moving to create.
 * @param {Phaser.Scene} scene
 */
function loadNfts(scene) {
  imgIndex = 0;
  imageObjects = [];
  scene.plugins.get("rexawaitloaderplugin").addToScene(scene);
  scene.load.rexAwait(async function (successCallback, failureCallback) {
    await loadImages(scene);
    successCallback();
  });
}

export { makeModal, loadNfts, updateNftModal, toggleInteractive };