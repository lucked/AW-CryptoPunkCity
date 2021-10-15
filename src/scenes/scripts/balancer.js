import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { contractCall, exitBank } from "../Bank";
import { editNumber } from "../scripts/tools";
import { BigNumber, ethers } from "ethers";
import { getUserAddress } from "../../web3/web3helpers";
import { hexValue } from "../../server/node_modules/@ethersproject/bytes/lib";

const balErc20 = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
// const newProvider = ethers.getDefaultProvider("matic");
// console.log("default provider: ", newProvider);

var balancerCreated = false;

var balancerPoolData, balancer, iface;

//https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan-v2
//https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2
//https://thegraph.com/legacy-explorer/subgraph/balancer-labs/balancer-polygon-v2
/**
 * Contacts Balancer's The Graph API endpoint to query pool data
 */
async function getBalancerGraph() {
  // Balancer's The Graph API URL
  const APIURL =
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2";

  // query request with result settings
  const poolsQuery = `
      query {
          pools(first: 100, orderBy: totalLiquidity, orderDirection: desc) {
              id
              name
              owner
              symbol
              tokens {
              id
              name
              symbol
              address
              }
              address
              poolType
              totalLiquidity
              totalSwapVolume
          }
      }
  `;

  // create new Apollo client
  const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
  });

  // query data with query config object
  await client
    .query({
      query: gql(poolsQuery),
    })
    .then((data) => {
      balancerPoolData = data.data.pools;
      //   console.log("subgraph data: ", data);
      //   console.log("var data: ", balancerPoolData);
    })
    .catch((err) => {
      console.log("Error fetching data: ", err);
    });
}

/**
 * Create Balancer billboard into scene from html template
 * @param {Phaser.Scene} scene
 */
function createBalancer(scene) {
  balancer = scene.add
    .dom(117, 600)
    .createFromCache("balancer")
    .setDepth(6)
    .addListener("click");
  balancer.on("click", function (event) {
    if (event.target.id === "exitBtn") {
      exitBank();
    }
    if(event.target.classList.contains("resultsRow")) {
      console.log("clicked results row");
      balancer.getChildByID("balancerModal").setAttribute("style", "display: block");
    }
    if(event.target.id === "closeModal") {
      console.log("clicked close modal");
      balancer.getChildByID("balancerModal").setAttribute("style", "display: none");
    }
  });

  renderPools();
  balancerCreated = true;
  updateBalancer();
}

function updateBalancer() {
  setInterval(() => {
    if(balancerCreated) {
      getBalancerGraph();
      renderPools();
    }
  }, 12000);
}

function renderModal() {

}

function calculatePercent(fraction, whole) {
  return (fraction / whole)*10;
}

async function renderPools() {
  const renderedPoolData = balancerPoolData
    .map((pool) => {
      const tokenIcons = pool.tokens
        .map((token) => {
          var tokenSymbol = token.symbol;
          if (token.symbol === "'USDT'") {
            tokenSymbol = "USDT";
          }
          return `<img class="resultsCoin" onerror="() => {this.src='assets/balancer/dummyCoin.png'}" src="https://api.coinicons.net/icon/${tokenSymbol}/32x32" />`;
        })
        .join("");

      const tokenNames = pool.tokens
        .map((token) => {
          var tokenSymbol = token.symbol;
          if (tokenSymbol === "'USDT'") {
            tokenSymbol = "USDT";
          }
          return `
                        <div class="compItem">${tokenSymbol}</div>
                    `;
        })
        .join("");

      // const poolValue = Math.round(pool.totalLiquidity / 10);
      const poolValue = editNumber(pool.totalLiquidity / 10);
      // const poolVolume = Math.round(pool.totalSwapVolume / 10);
      const poolVolume = editNumber(pool.totalSwapVolume / 10);
      return `<div class="resultsRow">
                    <div class="colStart">
                        ${tokenIcons}
                    </div>
                    <div class="col-two">
                        ${tokenNames}
                    </div>
                    <div class="col">
                        $ ${poolValue}
                    </div>
                    <div class="col">
                        $ ${poolVolume}
                    </div>
                    <div class="colEnd">
                        N/A
                    </div>
                </div>
                `;
    })
    .join("");
  balancer.getChildByID("resultsBody").innerHTML = renderedPoolData;
}

async function getBalancerContract(data) {
  await window.ethereum.enable();
  const provider = new ethers.providers.Web3Provider(window.ethereum, "kovan");
  const signer = provider.getSigner();

  await provider.send("eth_requestAccounts", []);
  console.log("Signer: ", signer);
  console.log("Account: ", await signer.getAddress());
  // signer.connect(provider);

  const network = await provider.getNetwork();
  console.log("network: ", network);
  console.log("chainId: ", network.chainId);
  iface = new ethers.Contract("0xBA12222222228d8Ba445958a75a0704d566BF2C8", data, signer);
  iface = iface.connect(signer);
  console.log("Ethers Contract: ", iface);
  const blockNumber = await provider.getBlockNumber();
  console.log("Block Number: ", blockNumber);
  const authorizer = await iface.getAuthorizer();
  console.log("Authorizer: ", authorizer);
  
  const balance = await provider.getBalance(await signer.getAddress());
  console.log("Balance in Wei: ", balance);
  console.log("Balance in Eth: ", ethers.utils.parseEther("1.0"));
  var weiExp = BigNumber.from("10").pow(18);
  const testAmount2 = BigNumber.from(0.0001 *weiExp);
  const testAmount = hexValue((0.001 *weiExp));
  console.log("test amount: ", testAmount);
  console.log("test amount 2: ", testAmount2);

  const internalBalance = await iface.getInternalBalance(await signer.getAddress(), ["0x02822e968856186a20fEc2C824D4B174D0b70502", "0x41286Bb1D3E870f3F750eB7E1C25d7E48c8A1Ac7"]);
  console.log("internalBalance: ", internalBalance);


  const op = {
    kind: hexValue(0),
    asset: '0xAf9ac3235be96eD496db7969f60D354fe5e426B0',
    amount: testAmount2,
    sender: await signer.getAddress(),
    recipient: "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
  }

  //  await iface.WETH.approve();

  const ops = [op];

  // console.log("manage balance response: ", await iface.manageUserBalance([op]));

  console.log("internal Balance take 2: ", await iface.getInternalBalance(await signer.getAddress(), ['0xAf9ac3235be96eD496db7969f60D354fe5e426B0']))

  // console.log("manage balance response", await iface.manageUserBalance([op]));

  
  console.log("WETH: ", await iface.WETH())

  console.log("has approved relayer: ", await iface.hasApprovedRelayer(await signer.getAddress(), '0xBA12222222228d8Ba445958a75a0704d566BF2C8'))
}

export { createBalancer, getBalancerGraph, getBalancerContract };
