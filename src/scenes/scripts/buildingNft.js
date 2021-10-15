var bldgNftData,
  nftModal,
  nftModalBG,
  nftDoc,
  nftName,
  nftArtist,
  nftPrice,
  nftPriceRow,
  nftDesc,
  nftImg,
  nftVideo;

/**
 * Async load for building nft. creates in game element when ready.
 * @param {Phaser.Scene} scene
 */
function loadBuildingNft(scene) {
  // this is needed for the url request to work on load
  scene.load.crossOrigin = "anonymous";
  // async loader
  scene.plugins.get("rexawaitloaderplugin").addToScene(scene);
  scene.load.rexAwait(async function (successCallback, failureCallback) {
    // get nft data
    bldgNftData = await fetchAdvertisedNft();
    // queue on load into scene
    scene.load.video("bldgNft", bldgNftData.animation.url.ORIGINAL);
    // start load
    scene.load.start();
    // when finished
    scene.load.on("complete", function () {
      // frame for nft
      scene.add.rectangle(375, 780, 190, 230, "0xffc83d").setDepth(4);
      // nft
      var bldgNft = scene.add
        .video(375, 780, "bldgNft")
        .play(true)
        .setScale(0.11)
        .setDepth(4)
        .setInteractive();
      // when clicked, toggle modaland bg visibility
      bldgNft.on("pointerdown", function (event) {
        nftModal.setVisible(true);
        nftModalBG.setVisible(true);
      });
    });
    // flag the loader to continue on
    successCallback();
  });
}

/**
 * Function for fetching advertised NFT metadata
 * @returns {JSON} NFT metadata
 */
const fetchAdvertisedNft = async () => {
  const nftContactAddress = "0x60f80121c31a0d46b5279700f9df786054aa5ee5";
  const nftId = "1358088";
  const metaLink = `https://ethereum-api.rarible.org/v0.1/nft/items/${nftContactAddress}:${nftId}/meta`;
  const advertisedNFT = await fetch(metaLink)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  const sellOrderLink = `https://ethereum-api.rarible.org/v0.1/order/orders/sell/byItem?contract=${nftContactAddress}&tokenId=${nftId}`;
  const sellOrderNFT = await fetch(sellOrderLink)
    .then((response) => response.json())
    .catch((error) => console.log(error));
  const result = {
    ...sellOrderNFT,
    ...advertisedNFT,
    isOnSale:
      Object.keys(sellOrderNFT).includes("priceHistory") && sellOrderNFT.priceHistory[0]
        ? true
        : false,
    link: `https://rarible.com/token/${nftContactAddress}:${nftId}?tab=details`,
  };
  // console.log(result);
  // collection[i].isOnSale = collection[i].priceHistory[0] ? true : false;
  return result;
};

/**
 * creates the modal and its events into the given scene
 * @param {Phaser.Scene} scene
 */
function makeNftModal(scene) {
  nftModalBG = scene.add.rectangle(650, 400, 1800, 1200, "0x000", 0.5);
  nftModalBG.setDepth(11).setVisible(false);
  nftModal = scene.add
    .dom(600, 300)
    .createFromCache("nftModal")
    .setDepth(11)
    .setVisible(false)
    .addListener("click");

  if(!bldgNftData.isOnSale) {
    nftModal.getChildByID("nftArtistHolder").remove();
    nftModal.getChildByID("priceRow").remove();
    nftModal.getChildByID("raribleLinkBtn").remove();
  }

  nftModal.on("click", function (event) {
    if (event.target.name === "nftBuyBtn") {
      // matchOrder(selectedHash, "1");
      //"0xbbbd3569945974eff849718b0c07d2d2b489653ffd772a002df575162b5190db"
    }
    if (event.target.name === "cancelNftBtn") {
      // nftPriceRow.style.display = "flex";
      nftModal.setVisible(false);
      nftModalBG.setVisible(false);
    }
    if (event.target.name === "raribleLinkBtn") {
      // window.open(selectedLink, "_blank").focus();
    }
  });
  setElements(nftModal);
  populateElements(bldgNftData);
}

/**
 * link the dom elements to the proper variables
 * @param {Phaser.GameObjects} modal
 */
function setElements(modal) {
  nftName = modal.getChildByID("nftName");
  if(bldgNftData.isOnSale) {
    nftArtist = modal.getChildByID("nftArtist");
    nftPrice = modal.getChildByID("nftPrice");
    nftPriceRow = modal.getChildByID("priceRow");
  }
  nftDesc = modal.getChildByID("nftDesc");
  nftImg = modal.getChildByID("nftImg");
  nftVideo = modal.getChildByID("nftVideo");
}

/**
 * Get in game dom element and fill with nft data
 * @param {object} nft 
 */
function populateElements(nft) {
    nftName.innerHTML = nft.name;
    nftDesc.innerHTML = nft.description;
    nftImg.classList.toggle("hidden");
    nftVideo.classList.toggle("hidden");
    nftVideo.setAttribute("src", nft.animation.url.ORIGINAL);
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
      nftModal.x = xPos - 20;
      nftModal.y = yPos + 100;
    }
  }

export { loadBuildingNft, makeNftModal, updateNftModal };
