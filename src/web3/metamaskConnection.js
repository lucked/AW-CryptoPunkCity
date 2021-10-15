import Moralis from "moralis";

/** To-do
 * Change all alerts to inGame alerts
 * Instead of location.reload() create "waiting room"
 */
/**
 * Deactivating page reload when changing network
 */
if (window.ethereum) {
  window.ethereum.autoRefreshOnNetworkChange = false;
}

/**
 * Moralis initilization
 */
export const connectMoralis = () => {
  Moralis.initialize("nAplGpihVQeHUrirnWY20y9tFF9N0Imjb5DtCZUI");
  Moralis.serverURL = "https://dlcxxcapyhza.usemoralis.com:2053/server";
};

/**
 * Authenticate function.
 * @param {provider} provider - provider
 * @return {object} returns user object
 */
const authenticate = async (provider) => {
  try {
    let user = await Moralis.Web3.authenticate({ provider, chainId: "137" });
    window.web3 = await Moralis.Web3.activeWeb3Provider.activate();
    return user;
  } catch (e) {
    alert(e.message);
  }
};

/**
 * Moralis authenticate function.
 * @param {provider} provider - provider
 * @return {object} returns user object
 */
export async function authenticateMoralis(provider) {
  let user = await Moralis.User.current();
  if (provider == "metamask") {
    await Moralis.Web3.enable();
    window.web3 = await Moralis.Web3.activeWeb3Provider.activate();
    let currentAddress = await window.ethereum.send("eth_requestAccounts");
    currentAddress = currentAddress.result[0];
    if (user && user.attributes.ethAddress == currentAddress) {
      return user;
    } else {
      return await authenticate(provider);
    }
  } else if (provider !== "metamask") {
    return await authenticate(provider);
  }
}

/**
 * Set user's profile function.
 * @param {string} username
 */
export async function setProfileMoralis(username) {
  let user = Moralis.User.current();
  user.set("Nickname", username);
  try {
    await user.save();
    return user;
  } catch (e) {
    alert(e.message);
  }
}

/**
 * Web3Listener for detecting changing accounts
 */
export async function web3Listener() {
  window.web3.currentProvider.on("accountsChanged", async function (accounts) {
    let user = Moralis.User.current();
    if (accounts.length) {
      const isConfirmed = confirm("Link this address to your account?");
      if (isConfirmed) {
        try {
          await Moralis.Web3.link(accounts[0]);
          alert("Address added!");
        } catch (e) {
          alert(e.message);
        }
      } else {
        alert("Address not added!");
      }
    } else {
      alert("No accounts selected");
      location.reload();
    }
  });

  if (window.web3.ethereum) {
    window.web3.ethereum.on("disconnect", async function () {
      location.reload();
      alert("Session closed");
    });
  }
}

/**
 * Get balances by address.
 * @param {tring} chain
 * @return {object} balacnes object
 */
export async function getBalancesByAddress(chain) {
  const balances = await Moralis.Web3.getAllERC20({ chain });
  let resultObj = {};
  for (let balance of balances) {
    resultObj[balance.symbol == "ETH" ? "0x1" : balance.tokenAddress] = balance;
  }
  return resultObj;
}
