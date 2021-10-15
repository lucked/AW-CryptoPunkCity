"use strict";
import { yvVaultsV2, erc20ETHABI } from "../utils/abis";
import { maxValue, whiteListChainsEth } from "../utils/consts";
import { strtodec } from "../utils/utils";
import { setSupportedChain, getChainSupport, getUserAddress } from "./web3helpers";
import { getAllowance } from "./contractCalls";
import { triggerPendingModal } from "../scenes/Bank";
import { setAlertModal } from "../scenes/scripts/alert";
import { gameScene } from "../scenes/Bank";

/**
 * Deposit Yearn function.
 * @param {string} address - address of the depositing asset
 * @param {number} amount - value of the depositing assets
 * @param {string} depoTokenAddress - address of the targeted underlying pool
 */
export const depositYearn = async (address, amount, depoTokenAddress) => {
  let userAddress = await getUserAddress();
  const contractPool = new window.web3.eth.Contract(yvVaultsV2, address);
  const contractToken = new window.web3.eth.Contract(erc20ETHABI, depoTokenAddress);

  await setSupportedChain({ whiteListChains: whiteListChainsEth, targetChain: "0x1" }).catch((e) =>
    setAlertModal(gameScene, e.message)
  );
  const isChainSupported = await getChainSupport(whiteListChainsEth);
  switch (isChainSupported) {
    case true:
      const allowance = await getAllowance(contractToken, {
        userAddress,
        contractAddress: address,
      });
      const decimals = await contractToken.methods.decimals().call();
      const amountDeposit = strtodec(amount, decimals);

      if (allowance > amount) {
        await depositPool(contractPool, amountDeposit, userAddress);
      } else {
        triggerPendingModal("show");
        contractToken.methods
          .approve(address, maxValue)
          .send({ from: userAddress })
          .then(async function (receipt) {
            setAlertModal(gameScene, "Succes!");
            triggerPendingModal("hide");
            await depositPool(contractPool, amountDeposit, userAddress);
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
      break;

    default:
      setAlertModal(gameScene, "Only Ethereum Network is Supported");
  }
};

/**
 * Deposit ERC20 tokens in a pool function.
 * @param {contract} contractPool - contract of Yearn pool
 * @param {BN} amountDeposit - amount to deposit
 * @param {address} userAddress - user's address
 * @return {promise} returns contract call promise
 */
async function depositPool(contractPool, amountDeposit, userAddress) {
  triggerPendingModal("show");
  return await contractPool.methods
    .deposit(amountDeposit)
    .send({ from: userAddress })
    .then(function (receipt) {
      setAlertModal(gameScene, "Succes!");
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
 * Withdraws amount of the underlying asset, i.e. redeems the underlying token.
 * @param {address} assetAddress - address of Yean vault
 * @param {BN} amount - amount to withdraw
 * @param {address} withdrawTokenAddress - address of the underlying asset
 * @return {promise} returns contract call promise
 */
export const withdrawYearn = async (assetAddress, amount, withdrawTokenAddress) => {
  let userAddress = await getUserAddress();
  const contractPool = new window.web3.eth.Contract(yvVaultsV2, assetAddress);

  await setSupportedChain({ whiteListChains: whiteListChainsEth, targetChain: "0x1" }).catch((e) =>
    setAlertModal(gameScene, e.message)
  );
  const isChainSupported = await getChainSupport(whiteListChainsEth);
  switch (isChainSupported) {
    case true:
      const allowance = await getAllowance(contractPool, {
        userAddress,
        contractAddress: assetAddress,
      });
      const decimals = await contractPool.methods.decimals().call();
      console.log(decimals);
      const amountWithdraw = strtodec(amount, decimals);

      if (allowance > amount) {
        await withdrawPool(contractPool, amountWithdraw, userAddress);
      } else {
        triggerPendingModal("show");
        contractPool.methods
          .approve(assetAddress, maxValue)
          .send({ from: userAddress })
          .then(async function (receipt) {
            console.log(receipt);
            setAlertModal(gameScene, "Succes!");
            triggerPendingModal("hide");
            await withdrawPool(contractPool, amountWithdraw, userAddress);
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
      break;

    default:
      setAlertModal(gameScene, "Only Ethereum Network is Supported");
  }
};

/**
 * Withdraw. Convert yToken to ERC20.
 * @param {contract} contractPool - contract of Yearn pool
 * @param {BN} amountWithdraw - amount to withdraw
 * @param {address} userAddress - user's address
 * @return {promise} returns contract call promise
 */
async function withdrawPool(contractPool, amountWithdraw, userAddress) {
  triggerPendingModal("show");
  return await contractPool.methods
    .withdraw(amountWithdraw)
    .send({ from: userAddress })
    .then(function (receipt) {
      setAlertModal(gameScene, "Succes!");
      triggerPendingModal("hide");
    })
    .catch(function (error) {
      setAlertModal(gameScene, error.message);
      triggerPendingModal("hide");
    });
}
