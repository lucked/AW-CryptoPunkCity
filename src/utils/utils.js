/**
 * This file contains text formaters and converters
 */

export const n6 = new Intl.NumberFormat("en-us", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 6,
});

export const n2 = new Intl.NumberFormat("en-us", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const c2 = new Intl.NumberFormat("en-us", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const tokenValue = (value, decimals) => (decimals ? value / Math.pow(10, decimals) : value);

export const convrt = (n) => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};

export const convrtUSD = (n) => {
  if (n < 1e3) return "$" + (+n).toFixed(2);
  if (n >= 1e3 && n < 1e6) return "$" + (n / 1e3).toFixed(2) + "K";
  if (n >= 1e6 && n < 1e9) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e9 && n < 1e12) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
};

/**
 * Return a formatted string with the symbol at the end
 * @param {number} value integer value
 * @param {number} decimals number of decimals
 * @param {string} symbol token symbol
 * @returns {string}
 */
export const tokenValueTxt = (value, decimals, symbol) =>
  decimals ? `${n6.format(tokenValue(value, decimals))} ${symbol}` : `${value}`;

export const tokenPriceTxt = (value, decimals) =>
  decimals ? `${c2.format(tokenValue(value, decimals))}` : `${value}`;

/**
 * Returns a string of form "abc...xyz"
 * @param {string} str string to strink
 * @param {number} n number of chars to keep at front/end
 * @returns {string}
 */
export const getEllipsisTxt = (str, n = 6) => {
  return `${str.substr(0, n)}...${str.substr(str.length - n, str.length)}`;
};

export const convertAPY = (value) => (value * 100).toFixed(2) + "%";

export const strtodec = (amount, dec) => web3.utils.toBN("0x" + (amount * 10 ** dec).toString(16));
