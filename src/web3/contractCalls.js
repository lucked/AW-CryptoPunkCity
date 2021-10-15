/**
 * Get info about an allowance of a smart contract to spend user tokens.
 * @param {contract} contract - contract of ERC20 token
 * @param {object} params {userAddress, contractAddress} - consists of the user's address and the contract that is going to spend tokens
 * @return {string} returns the amount that the contract can spend
 */
export const getAllowance = async (contract, params) =>
  await contract.methods.allowance(params.userAddress, params.contractAddress).call();
