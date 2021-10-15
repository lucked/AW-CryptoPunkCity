import { lendingPoolABI, erc20ABI, wethGateAbi } from "../utils/abis";
import { contractCall, gameScene, updateModalInner } from "../scenes/Bank";
import { setSupportedChain, getChainSupport, getUserAddress } from "./web3helpers";
import { getAllowance } from "./contractCalls";
import {
  tokens,
  maxValue,
  lendingAaveAddress,
  wethGateAddress,
  whiteListChainsPoly,
} from "../utils/consts";
import { strtodec } from "../utils/utils";
import { triggerPendingModal } from "../scenes/Bank";
import { setAlertModal } from "../scenes/scripts/alert";
/**
 * Deposit function.
 * After checking the asset, it performs the depositPool() or depositETH() function
 * @param {string} symbol - symbol of the depositing asset
 * @param {number} amount - value of the depositing asset
 */
export const deposit = async (symbol, amount) => {
  const isMATIC = symbol == "MATIC" ? true : false;

  let userAddress = await getUserAddress();
  const asset = tokens[symbol].address;
  const contractPool = new window.web3.eth.Contract(
    isMATIC ? wethGateAbi : lendingPoolABI,
    isMATIC ? wethGateAddress : lendingAaveAddress
  );
  const amountDeposit = strtodec(amount, tokens[symbol].decimals);
  const contract = new window.web3.eth.Contract(erc20ABI, asset);

  await setSupportedChain({ whiteListChains: whiteListChainsPoly, targetChain: "0x89" }).catch(
    (e) => setAlertModal(gameScene, e.message)
  );
  const isChainSupported = await getChainSupport(whiteListChainsPoly);
  switch (isChainSupported) {
    case true:
      const allowance = await getAllowance(contract, {
        userAddress,
        contractAddress: lendingAaveAddress,
      });

      if (allowance > amount && !isMATIC) {
        depositPool(symbol, asset, contractPool, amountDeposit, userAddress);
      } else if (isMATIC) {
        depositETH(symbol, contractPool, lendingAaveAddress, amountDeposit, userAddress);
      } else {
        triggerPendingModal("show");
        await contract.methods
          .approve(lendingAaveAddress, maxValue)
          .send({ from: userAddress })
          .then(function (receipt) {
            setAlertModal(gameScene, "Succes!");
            depositPool(symbol, asset, contractPool, amountDeposit, userAddress);
          })
          .catch(function (error) {
            if (error.code === 4001) {
              setAlertModal(gameScene, "You declined the transaction");
            } else {
              setAlertModal(gameScene, error.message);
            }
          });
        triggerPendingModal("hide");
      }
      break;

    default:
      setAlertModal(gameScene, "Only Matic Network is Supported");
  }
};

/**
 * Deposit ETH function.
 * Aave requires to wrap ETH to wETH before depositing
 * We use Aave's wethGate
 * @param {string} symbol - symbol of the depositing asset
 * @param {contract} contractPool - contract of Aave's wethGate
 * @param {address} lendingAaveAddress - address of the targeted underlying lending pool
 * @param {BN} amountDeposit - amount deposited
 * @param {address} userAddress - user's address
 * @return {promise} returns contract call promise
 */
const depositETH = async (symbol, contractPool, lendingAaveAddress, amountDeposit, userAddress) => {
  triggerPendingModal("show");
  return await contractPool.methods
    .depositETH(lendingAaveAddress, userAddress, "0")
    .send({ from: userAddress, value: amountDeposit })
    .then(function (receipt) {
      setAlertModal(gameScene, "Succes!");
      contractCall();
      updateModalInner(symbol);

      triggerPendingModal("hide");
    })
    .catch(function (error) {
      setAlertModal(gameScene, error.message);
      triggerPendingModal("hide");
    });
};

/**
 * Deposit ERC20 tokens in a pool function.
 * @param {string} symbol - symbol of the depositing asset
 * @param {address} asset - address of the underlying asset
 * @param {contract} contractPool - contract of Aave's pool
 * @param {BN} amountDeposit - amount deposited
 * @param {address} userAddress - user's address
 * @return {promise} returns contract call promise
 */
async function depositPool(symbol, asset, contractPool, amountDeposit, userAddress) {
  triggerPendingModal("show");
  return await contractPool.methods
    .deposit(asset, amountDeposit, userAddress, "0")
    .send({ from: userAddress })
    .then(function (receipt) {
      setAlertModal(gameScene, "Succes!");
      contractCall();
      updateModalInner(symbol);

      triggerPendingModal("hide");
    })
    .catch(function (error) {
      if (error.code === 4001) {
        setAlertModal(gameScene, "You declined the transaction");
      } else {
        setAlertModal(gameScene, error.message);
      }
      triggerPendingModal("hide");
    });
}

/**
 * Withdraw function.
 * After checking the asset, it performs the withdrawPool() or withdrawETH() function
 * @param {string} symbol - symbol of the aToken
 * @param {number} amount - amount deposited, expressed in wei units.
 */
export const withdraw = async (symbol, amount) => {
  let userAddress = await getUserAddress();
  const aTokenAddress = tokens[symbol].address;
  const isMATIC = symbol == "MATIC" ? true : false;
  const contractPool = new window.web3.eth.Contract(
    isMATIC ? wethGateAbi : lendingPoolABI,
    isMATIC ? wethGateAddress : lendingAaveAddress
  );
  const amountWithdraw = strtodec(amount, tokens[symbol].decimals);
  const contract = new window.web3.eth.Contract(erc20ABI, aTokenAddress);
  await setSupportedChain({ whiteListChains: whiteListChainsPoly, targetChain: "0x89" }).catch(
    (e) => setAlertModal(gameScene, e.message)
  );
  const isChainSupported = await getChainSupport(whiteListChainsPoly);
  switch (isChainSupported) {
    case true:
      const allowance = await getAllowance(contract, {
        userAddress,
        contractAddress: lendingAaveAddress,
      });
      if (allowance > amount && !isMATIC) {
        withdrawPool(symbol, aTokenAddress, contractPool, amountWithdraw, userAddress);
      } else if (isMATIC) {
        triggerPendingModal("show");
        await contract.methods
          .approve(wethGateAddress, maxValue)
          .send({ from: userAddress })
          .then(function (receipt) {
            setAlertModal(gameScene, "Succes!");
            withdrawETH(symbol, lendingAaveAddress, contractPool, amountWithdraw, userAddress);
          })
          .catch(function (error) {
            if (error.code === 4001) {
              setAlertModal(gameScene, "You declined the transaction");
            } else {
              setAlertModal(gameScene, error.message);
            }
            triggerPendingModal("hide");
          });
        triggerPendingModal("hide");
      } else {
        triggerPendingModal("show");
        await contract.methods
          .approve(lendingAaveAddress, maxValue)
          .send({ from: userAddress })
          .then(function (receipt) {
            setAlertModal(gameScene, "Succes!");
            withdrawPool(symbol, aTokenAddress, contractPool, amountWithdraw, userAddress);
          })
          .catch(function (error) {
            if (error.code === 4001) {
              setAlertModal(gameScene, "You declined the transaction");
            } else {
              setAlertModal(gameScene, error.message);
            }
            triggerPendingModal("hide");
          });
        triggerPendingModal("hide");
      }
      break;
    default:
      setAlertModal(gameScene, "Only Matic Network is Supported");
  }
};

/**
 * Withdraws amount of the WETH, unwraps it to ETH, and transfers the ETH to the to address.
 * @param {string} symbol - symbol of the aToken
 * @param {address} lendingAaveAddress - address of the targeted underlying lending pool
 * @param {contract} contractPool - contract of Aave's pool
 * @param {BN} amountWithdraw - amount to withdraw
 * @param {address} userAddress - user's address
 * @return {promise} returns contract call promise
 */
async function withdrawETH(symbol, lendingAaveAddress, contractPool, amountWithdraw, userAddress) {
  triggerPendingModal("show");
  return await contractPool.methods
    .withdrawETH(lendingAaveAddress, amountWithdraw, userAddress)
    .send({ from: userAddress })
    .then(function (receipt) {
      setAlertModal(gameScene, "Succes!");
      contractCall();
      updateModalInner(symbol);

      triggerPendingModal("hide");
    })
    .catch(function (error) {
      if (error.code === 4001) {
        setAlertModal(gameScene, "You declined the transaction");
      } else {
        setAlertModal(gameScene, error.message);
      }
      triggerPendingModal("hide");
    });
}

/**
 * Withdraws amount of the underlying asset, i.e. redeems the underlying token and burns the aTokens.
 * @param {string} symbol - symbol of the aToken
 * @param {address} aTokenAddress - address of the underlying asset
 * @param {contract} contractPool - contract of Aave's pool
 * @param {BN} amountWithdraw - amount to withdraw
 * @param {address} userAddress - user's address
 * @return {promise} returns contract call promise
 */
async function withdrawPool(symbol, aTokenAddress, contractPool, amountWithdraw, userAddress) {
  triggerPendingModal("show");
  return await contractPool.methods
    .withdraw(aTokenAddress, amountWithdraw, userAddress)
    .send({ from: userAddress })
    .then(function (receipt) {
      setAlertModal(gameScene, "Succes!");
      contractCall();
      updateModalInner(symbol);

      triggerPendingModal("hide");
    })
    .catch(function (error) {
      if (error.code === 4001) {
        setAlertModal(gameScene, "You declined the transaction");
      } else {
        setAlertModal(gameScene, error.message);
      }
      triggerPendingModal("hide");
    });
}
