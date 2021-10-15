import { whiteListedV1YFarms } from "../../utils/consts";
import { tokenValueTxt, convrtUSD, convertAPY } from "../../utils/utils";
import { getBalancesByAddress } from "../../web3/metamaskConnection";
/** Min deposited value in a pool for filtering */
const minUsdDeposited = 1000;

/**
 * Function for getting info about yearn vaults
 * @returns {array} information about yearn vaults
 */
export const yearnData = async () => {
  let output = await fetch("https://api.yearn.finance/v1/chains/1/vaults/all")
    .then((response) => response.json())
    .catch((error) => console.log(error));
  let vaults = output.filter(
    (vault) =>
      (vault.type == "v2" &&
        vault.tvl.tvl > minUsdDeposited &&
        vault.migration.available === false) ||
      whiteListedV1YFarms.includes(vault.address)
  );
  for (let vault of vaults) {
    vault.address = vault.address.toLowerCase();
    vault.token.address = vault.token.address.toLowerCase();
    if (vault.display_name == "ETH") {
      vault.display_name = "wETH";
    }
  }
  return vaults;
};

/**
 * Function for updating yearn vaults UI.
 */
export async function reRenderBalances() {
  const vaults = await yearnData();
  const balances = await getBalancesByAddress("0x1");

  for (let vault of vaults) {
    let vaultAddress = vault.address;
    const yToken = balances[vaultAddress];
    const domElementHoldings = document.getElementById(`holdings-${vaultAddress}`);
    domElementHoldings.innerHTML = yToken
      ? tokenValueTxt(yToken.balance, yToken.decimals, "")
      : "0.00";

    const standardToken = balances[vault.token.address];
    const domElementAvailable = document.getElementById(`available-${vaultAddress}`);
    domElementAvailable.innerHTML = standardToken
      ? tokenValueTxt(standardToken.balance, standardToken.decimals, "")
      : "0.00";

    const domElementNetAPY = document.getElementById(`netAPY-${vaultAddress}`);
    domElementNetAPY.innerHTML = convertAPY(vault.apy.net_apy);

    const domElementNetTVL = document.getElementById(`tvl-${vaultAddress}`);
    domElementNetTVL.innerHTML = convrtUSD(vault.tvl.tvl);

    if (document.getElementById("expandModal").style.display === "block") {
      const vaultAddress = document.getElementById("expandModal").getAttribute("name");
      let tokenBalance;
      if (balances[vault.token.address] && vault.address == vaultAddress) {
        tokenBalance = balances[vault.token.address];
      }

      if (tokenBalance) {
        const asset = balances[vault.token.address];
        document.getElementById("expand-balance").innerHTML = tokenValueTxt(
          asset.balance,
          asset.decimals,
          asset.symbol
        );
      }
      if (balances[vaultAddress]) {
        const asset = balances[vaultAddress];
        document.getElementById("expand-deposited").innerHTML = tokenValueTxt(
          asset.balance,
          asset.decimals,
          asset.symbol
        );
      }
    }
  }
}

/**
 * Get yearn vaults function.
 * @return {object} returns object of vaults
 */
export async function getYearnVaults(params) {
  const vaults = params ? params : await yearnData();
  const vaultSArrayToObj = (vaults) => {
    let vaultsObj = {};
    for (let vault of vaults) vaultsObj[vault.address] = vault;
    return vaultsObj;
  };
  return vaultSArrayToObj(vaults);
}
