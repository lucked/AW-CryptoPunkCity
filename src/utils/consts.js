/**
 * Aave tokens for displaying in Aave UI
 * */
export const tokens = {
  AAVE: {
    address: "0xd6df932a45c0f255f85145f286ea0b292b21c90b",
    logoURI:
      "https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9/logo.png",
    aToken: "0x1d2a0E5EC8E5bBDCA5CB219e649B565d8e5c3360",
    aSymbol: "amAAVE",
    decimals: "18",
  },
  WBTC: {
    address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
    aToken: "0x5c2ed810328349100A66B82b78a1791B101C9D61",
    aSymbol: "amWBTC",
    decimals: "8",
  },
  WETH: {
    address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
    aToken: "0x28424507fefb6f7f8E9D3860F56504E4e5f5f390",
    aSymbol: "amWETH",
    decimals: "18",
  },
  USDT: {
    address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    aToken: "0x60D55F02A771d515e077c9C2403a1ef324885CeC",
    aSymbol: "amUSDT",
    decimals: "6",
  },
  USDC: {
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    aToken: "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F",
    aSymbol: "amUSDC",
    decimals: "6",
  },
  DAI: {
    address: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    aToken: "0x27F8D03b3a2196956ED754baDc28D73be8830A6e",
    aSymbol: "amDAI",
    decimals: "18",
  },
  MATIC: {
    address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
    aToken: "0x8dF3aad3a84da6b69A4DA8aeC3eA40d9091B2Ac4",
    aSymbol: "amWMATIC",
    decimals: "18",
  },
};

/** The maximum integer in Solidity 2**256 - 1 for unlimited approve */
export const maxValue = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

/** The LendingPool contract is the main contract of the protocol.
 * It exposes all the user-oriented actions that can be invoked using either Solidity or web3 libraries.*/
export const lendingAaveAddress = "0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf";

/**If you need to use native ETH in the protocol, it must first be wrapped into WETH.
 * The WETH Gateway contract is a helper contract to easily wrap and unwrap ETH as necessary when interacting with the protocol, since ETH is no longer used within protocol interactions. */
export const wethGateAddress = "0xbEadf48d62aCC944a06EEaE0A9054A90E5A7dc97";

/** Params for adding new chains in Metamask */
export const paramsForAddingChain = {
  "0x89": {
    chainId: "0x89",
    chainName: "Polygon",
    rpcUrls: ["https://rpc-mainnet.matic.network"],
    nativeCurrency: {
      name: "Matic",
      symbol: "Matic",
      decimals: 18,
    },
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  "0x13881": {
    chainId: "0x13881",
    chainName: "Mumbai",
    rpcUrls: ["https://rpc-mumbai.matic.today"],
    nativeCurrency: {
      name: "Matic",
      symbol: "Matic",
      decimals: 18,
    },
    blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
  },
};

/**
 * Polygon network chain in HEX and decimal styles.
 * @type {array} whiteListChains
 */
export const whiteListChainsPoly = ["0x89", 137];

/**
 * Ethereum network chain in HEX and decimal styles.
 * @type {array} whiteListChains
 */
export const whiteListChainsEth = ["0x1", 1];

/** Most Yearn protocol pools have a newer version and we filter them by the V1 version.
 * But some of the active pools still have version V2*/
export const whiteListedV1YFarms = [
  "0xc5bDdf9843308380375a611c18B50Fb9341f502A",
  "0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a",
];
