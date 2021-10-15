import { request } from "./scripts/appollo";
import { deposit, withdraw } from "../web3/aave";
import { depositYearn, withdrawYearn } from "../web3/yearn";
import { tokenValueTxt, convrtUSD, convertAPY } from "../utils/utils";
import { tokens } from "../utils/consts";
import { yearnData, reRenderBalances, getYearnVaults } from "./scripts/yearnFinance";
import { getBalancesByAddress } from "../web3/metamaskConnection";
import eventsCenter from "../EventsCenter";
import { newSocket } from "../client/socket";
import { Direction } from "../movement/Direction";
import { setAlertModal } from "./scripts/alert";
import { makeLoader } from "../scenes/scripts/loaderScreen";
import { createBalancer } from "./scripts/balancer";
import Moralis from "moralis";

/**Global Variables */
export var gameScene;
Moralis.initialize("nAplGpihVQeHUrirnWY20y9tFF9N0Imjb5DtCZUI");
Moralis.serverURL = "https://dlcxxcapyhza.usemoralis.com:2053/server";

var bankToggleText;
var bankToggleAave;
var bankToggleYearn;
var bankToggleBalancer;
var bankToggleExit;
var bankInterface;
var modal;

const sceneConfig = {
  key: "BankScene",
  backgroundColor: "#fff",
};

/**
 * Scene Setup
 * */
class BankScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }
  init() {
    // Used to prepare data
  }
  preload() {
    gameScene = this;
    loadAssets();
  }
  create() {
    setBankToggle();
    newSocket.emit("setPlayerRoom", "bank");
  }
  update(time, delta) {}
}

/**
 * Set yearn bank in the scene.
 */
export function triggerPendingModal(status) {
  let pendingModal = document.getElementById("transaction-modal");
  switch (status) {
    case "show":
      pendingModal.style.display = "flex";
      break;
    case "hide":
      pendingModal.style.display = "none";
  }
}

function setBalancerBank() {
  createBalancer(gameScene);
}

/**
 * Set yearn bank in the scene.
 */
async function setYearnBank() {
  const vaults = await yearnData();
  const vaultsObj = await getYearnVaults(vaults);
  const balances = await getBalancesByAddress("0x1");
  const yInteval = setInterval(() => reRenderBalances(), 10000);

  bankInterface = gameScene.add
    .dom(129.5, 294)
    .createFromCache("yearnBank")
    .setDepth(3)
    .addListener("click");

  for (let vault of vaults) {
    $(".yearn-table").append(`<li class="table-row">
    <div id="" class="col col-1" data-label="Token Logo"><img
            src=${vault.token.icon}
            style="height: 35px; margin-right: 10px;"></div>
    <div id="" class="col col-2" data-label="Asset">${vault.display_name}</div>
    <div id="fees" class="col col-3" data-label="Fees">${vault.type}</div>
    <div id="holdings-${vault.address}" class="col col-4" data-label="Holdings">${
      balances[vault.address]
        ? tokenValueTxt(balances[vault.address].balance, balances[vault.address].decimals, "")
        : "0.00"
    }</div>
    <div id="netAPY-${vault.address}" class="col col-5" data-label="NetAPY">${convertAPY(
      vault.apy.net_apy
    )}</div>
    <div id="tvl-${vault.address}" class="col col-6" data-label="tvl">${convrtUSD(
      vault.tvl.tvl
    )}</div>
    <div id="available-${vault.address}" class="col col-7" data-label="available">${
      balances[vault.token.address]
        ? tokenValueTxt(
            balances[vault.token.address].balance,
            balances[vault.token.address].decimals,
            ""
          )
        : "0.00"
    }</div>
    <div id="" class="col col-8" data-label="Approve">
        <div>
            <div name=${vault.address} id="expand-button">SHOW</div>
        </div>
    </div>
</li>`);
  }

  let assetAddress;
  bankInterface.on("click", async function (event) {
    let modal = bankInterface.parent.ownerDocument.getElementById("expandModal");
    let amount;
    switch (event.target.id) {
      case "expand-button":
        assetAddress = event.target.getAttribute("name");
        modal.style.display = "block";
        modal.setAttribute("name", assetAddress);

        document.getElementById("expand-header").innerHTML =
          vaultsObj[assetAddress].token.display_name;
        document.getElementById("expand-apy").innerHTML = convertAPY(
          vaultsObj[assetAddress].apy.net_apy
        );

        if (balances[vaultsObj[assetAddress].token.address]) {
          const asset = balances[vaultsObj[assetAddress].token.address];
          document.getElementById("expand-balance").innerHTML = tokenValueTxt(
            asset.balance,
            asset.decimals,
            asset.symbol
          );
        }
        if (balances[vaultsObj[assetAddress].address]) {
          const asset = balances[vaultsObj[assetAddress].address];
          document.getElementById("expand-deposited").innerHTML = tokenValueTxt(
            asset.balance,
            asset.decimals,
            asset.symbol
          );
        }
        break;
      case "switch-withdraw":
        switchWithdrawUI();
        break;
      case "switch-deposit":
        switchDepositUI();
        break;
      case "exitBtn":
        clearInterval(yInteval);
        exitBank();
        break;
      case "modal-deposit-button":
        amount = document.getElementById("deposit-amount").value;
        const depoTokenAddress = vaultsObj[assetAddress].token.address;
        if (amount > 0 && typeof +amount == "number") {
          await depositYearn(assetAddress, amount, depoTokenAddress).then(async () => {
            document.getElementById("deposit-amount").value = null;
          });
        } else {
          setAlertModal(gameScene, "Please provide a valid value!");
        }
        break;
      case "modal-withdraw-button":
        amount = document.getElementById("withdraw-amount").value;
        const withdrawTokenAddress = vaultsObj[assetAddress].token.address;
        if (amount > 0 && typeof +amount == "number") {
          withdrawYearn(assetAddress, amount, withdrawTokenAddress).then(() => {
            document.getElementById("withdraw-amount").value = null;
          });
        } else {
          setAlertModal(gameScene, "Please provide a valid value!");
        }
    }

    if (event.target.classList.contains("close")) {
      resetModal();
      modal.style.display = "none";
    }
  });
}

/**
 * Switcher for selecting Aave/Yearn scene in the bank
 */
function setBankToggle() {
  gameScene.add.rectangle(0, 0, 1300, 800, 0xffffff).setOrigin(0);
  bankToggleText = gameScene.add
    .text(600, 250, "Please Select Bank", {
      fontFamily: "Arial",
      fontSize: 40,
      color: "0x000",
    })
    .setOrigin(0.5);
  bankToggleAave = gameScene.add.image(350, 430, "aaveBtn").setInteractive();
  bankToggleYearn = gameScene.add.image(650, 430, "yearnBtn").setInteractive();
  bankToggleBalancer = gameScene.add.image(950, 430, "balancerBtn").setInteractive();
  bankToggleExit = gameScene.add
    .image(600, 600, "exitBtn")
    .setInteractive()
    .on("pointerdown", function () {
      exitBank();
    });
  bankToggleYearn.on("pointerdown", function () {
    toggleBankToggle();
    setYearnBank();
  });
  bankToggleAave.on("pointerdown", function () {
    toggleBankToggle();
    setAaveBank();
  });
  bankToggleBalancer.on("pointerdown", function() {
    toggleBankToggle();
    setBalancerBank();
  })
}

/**
 * Switch scene Aave/Yearn.
 */
function toggleBankToggle() {
  bankToggleText.setVisible(!bankToggleText.visible);
  bankToggleAave.setVisible(!bankToggleAave.visible);
  bankToggleYearn.setVisible(!bankToggleYearn.visible);
  bankToggleBalancer.setVisible(!bankToggleBalancer.visible);
  bankToggleExit.setVisible(!bankToggleExit.visible);
}

/**
 * Function for fetching token balances.
 */
async function getTokenBalances(chain) {
  const balances = await Moralis.Web3.getAllERC20({ chain });
  let resultObj = {};
  for (let balance of balances) resultObj[balance.symbol] = balance;
  return resultObj;
}

/**
 * Function for fetching Aave info.
 */
async function getAaveInfo() {
  const APYs = await request();
  const balances = await getTokenBalances("matic");
  return { APYs, balances };
}

/**
 * Function for updating UI in Aave.
 */
export async function contractCall() {
  const { APYs, balances } = await getAaveInfo();
  for (let token of Object.keys(tokens)) {
    document.getElementById(`apy-${token}`).innerHTML = APYs[tokens[token].address];
    if (balances[token]) {
      let asset = balances[token];
      document.getElementById(`inwallet-${token}`).innerHTML = tokenValueTxt(
        asset.balance,
        asset.decimals,
        ""
      );
    }
    if (balances[tokens[token].aSymbol]) {
      let asset = balances[tokens[token].aSymbol];
      document.getElementById(`deposit-${tokens[token].aSymbol}`).innerHTML = tokenValueTxt(
        asset.balance,
        asset.decimals,
        ""
      );
    }
  }
}

/**
 * Function for updating modal inner UI
 * */
export async function updateModalInner(assetName) {
  const { APYs, balances } = await getAaveInfo();
  document.getElementById("expand-apy").innerHTML = APYs[tokens[assetName].address];
  if (balances[assetName]) {
    let asset = balances[assetName];
    document.getElementById("expand-balance").innerHTML = tokenValueTxt(
      asset.balance,
      asset.decimals,
      asset.symbol
    );
  }
  if (balances[tokens[assetName].aSymbol]) {
    let asset = balances[tokens[assetName].aSymbol];
    document.getElementById("expand-deposited").innerHTML = tokenValueTxt(
      asset.balance,
      asset.decimals,
      asset.symbol
    );
  }
}

/**
 * Function for exiting Bank Scene
 * */
export const exitBank = () => {
  gameScene.scene.switch("Game");
  gameScene.scene.stop("BankScene");
  eventsCenter.emit("leaveBuilding", Direction.DOWN);
};

/**
 * Function for setting AaveBank Scene
 * */
async function setAaveBank() {
  const aInteval = setInterval(() => contractCall(), 10000);
  bankInterface = gameScene.add
    .dom(310, 800)
    .createFromCache("aaveBank")
    .setDepth(3)
    .addListener("click");

  const { APYs, balances } = await getAaveInfo();

  await contractCall();

  modal = bankInterface.parent.ownerDocument.getElementById("expandModal");
  let assetName;
  bankInterface.on("click", async function (event) {
    const clickTarget = event.target.id;
    let amount;
    switch (clickTarget) {
      case "expand-button":
        assetName = event.target.getAttribute("name");
        modal.style.display = "block";

        document.getElementById("expand-header").innerHTML = assetName;
        document.getElementById("expand-apy").innerHTML = APYs[tokens[assetName].address];

        if (balances[assetName]) {
          const asset = balances[assetName];
          document.getElementById("expand-balance").innerHTML = tokenValueTxt(
            asset.balance,
            asset.decimals,
            asset.symbol
          );
        }
        if (balances[tokens[assetName].aSymbol]) {
          const asset = balances[tokens[assetName].aSymbol];
          document.getElementById("expand-deposited").innerHTML = tokenValueTxt(
            asset.balance,
            asset.decimals,
            asset.symbol
          );
        }
        break;
      case "switch-withdraw":
        switchWithdrawUI();
        break;
      case "switch-deposit":
        switchDepositUI();
        break;
      case "exitBtn":
        clearInterval(aInteval);
        exitBank();
        break;
      case "modal-deposit-button":
        amount = document.getElementById("deposit-amount").value;
        if (amount > 0 && typeof +amount == "number") {
          deposit(assetName, amount).then(() => {
            document.getElementById("deposit-amount").value = null;
          });
        } else {
          setAlertModal(gameScene, "Please provide a valid value!");
        }
        break;
      case "modal-withdraw-button":
        amount = document.getElementById("withdraw-amount").value;
        if (amount > 0 && typeof +amount == "number") {
          withdraw(assetName, amount).then(() => {
            document.getElementById("withdraw-amount").value = null;
          });
        } else {
          setAlertModal(gameScene, "Please provide a valid value!");
        }
    }
    if (event.target.classList.contains("close")) {
      resetModal();
      modal.style.display = "none";
    }
  });
}
/**
 * UI switch Helpers
 * */
function switchDepositUI() {
  document.getElementById("switched-withdraw").style.display = "none";
  document.getElementById("switched-deposit").style.display = "block";
  document.getElementById("switch-deposit").classList.add("switch-active");
  document.getElementById("switch-withdraw").classList.remove("switch-active");
}

function switchWithdrawUI() {
  document.getElementById("switched-deposit").style.display = "none";
  document.getElementById("switched-withdraw").style.display = "block";
  document.getElementById("switch-withdraw").classList.add("switch-active");
  document.getElementById("switch-deposit").classList.remove("switch-active");
}

function resetModal() {
  document.getElementById("expand-deposited").innerHTML = "-";
  document.getElementById("expand-balance").innerHTML = "-";
  document.getElementById("withdraw-amount").value = null;
  document.getElementById("deposit-amount").value = null;
  switchDepositUI();
}

/**
 * LoadAssets
 */
function loadAssets() {
  gameScene.load.html("aaveBank", "assets/bank/aaveBank.html");
  gameScene.load.html("yearnBank", "assets/bank/yearnBank.html");
  gameScene.load.image("aaveBtn", "assets/bank/aave.png");
  gameScene.load.image("yearnBtn", "assets/bank/yearn.png");
  gameScene.load.image("balancerBtn", "assets/bank/balancer.png");
  gameScene.load.image("exitBtn", "assets/bank/exitBtn.png");
}
export default BankScene;
