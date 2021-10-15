import { paramsForAddingChain } from "../utils/consts";
import { setAlertModal } from "../scenes/scripts/alert";
import { gameScene } from "../scenes/Bank";
/**
 * Function for switching network in injected wallets (Metamask)
 * @param {string} targetChain - the chain to which the function will try to switch
 */
export async function switchNetwork(targetChain) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChain }],
    });
  } catch (error) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [paramsForAddingChain[targetChain]],
        });
      } catch (error) {
        setAlertModal(gameScene, error.message);
      }
    }
    if (error.code !== 4001) {
      setAlertModal(gameScene, error.message);
    }
  }
}

/**
 * If the current chain_id is allowed in the current scene, will return chainId.
 * In case it is not supported, it will try to switch it to targetChain.
 * @param {object} params contains:
 * {targetChain} - chain allowed in current scene
 * {whiteListChains} - chain allowed in current scene in hex and number style.
 * @returns {string} current chainId
 */
export const setSupportedChain = async (params) => {
  const chainNames = {
    "0x89": "Polygon",
    "0x1": "Ethereum",
    "0x13881": "Mumbai",
  };
  const { targetChain, whiteListChains } = params;
  const isChainSupported = await getChainSupport(whiteListChains);
  let chainId = await getChainId();
  switch (isChainSupported) {
    case false:
      try {
        await switchNetwork(targetChain);
        chainId = await getChainId();
      } catch (e) {
        if (error.code === 4001) {
          setAlertModal(gameScene, `Only ${chainNames.targetChain} chain is supported`);
        } else {
          setAlertModal(gameScene, error.message);
        }
        triggerPendingModal("hide");
        setAlertModal(gameScene, e.message);
      }
      break;
    default:
      chainId = await getChainId();
  }
  return chainId;
};

/**
 * Checks if current chain_id is supported in a scene
 * @param {array} whiteListChains - supported chains in current scene
 * @returns {boolean}
 * Is used in aave, yearn scenes and in crafting
 */
export const getChainSupport = async (whiteListChains) => {
  let chainId = await getChainId();
  let result = whiteListChains.includes(chainId);
  return result;
};

/**
 * Function for getting the user's wallet address
 * @returns {string} user's wallet address
 */
export const getUserAddress = async () => (await window.web3.eth.getAccounts())[0];

/**
 * Function for getting the current chain id
 * @returns {string} returns current chain id
 */
export const getChainId = async () => await window.web3.eth.getChainId();
