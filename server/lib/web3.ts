import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";

// BSC token contract address
const TOKEN_ADDRESS = "0xfa4C07636B53D868E514777B9d4005F1e9c6c40B";

// BSC RPC endpoints
const BSC_RPC_URL = "https://bsc-dataseed1.binance.org/";
const BSC_RPC_FALLBACKS = [
  "https://bsc-dataseed2.binance.org/",
  "https://bsc-dataseed3.binance.org/",
  "https://bsc-dataseed4.binance.org/"
];

// ABI for ERC20 token
const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  // Write functions
  "function transfer(address to, uint amount) returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

// Burn address
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";

// Create provider with fallbacks
let currentRpcIndex = 0;
const getProvider = () => {
  // In ethers v6, JsonRpcProvider constructor takes an object config instead
  const provider = new ethers.JsonRpcProvider(
    currentRpcIndex === 0 ? BSC_RPC_URL : BSC_RPC_FALLBACKS[currentRpcIndex - 1]
  );
  
  // Error handling in v6 is different - we'll log errors but don't need to set up explicit handlers
  // for auto-switching as v6 has better built-in retry logic
  
  return provider;
};

// Initialize provider and contract
const provider = getProvider();
const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);

/**
 * Get token information
 */
export async function getTokenInfo() {
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);
    
    return {
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      address: TOKEN_ADDRESS
    };
  } catch (error) {
    console.error("Error fetching token info:", error);
    throw error;
  }
}

/**
 * Get token balance for a specific address
 */
export async function getTokenBalance(address: string) {
  try {
    const balance = await tokenContract.balanceOf(address);
    return balance.toString();
  } catch (error) {
    console.error(`Error fetching token balance for ${address}:`, error);
    throw error;
  }
}

/**
 * Get burned token amount (balance of burn address)
 */
export async function getBurnedTokens() {
  try {
    const burnedAmount = await tokenContract.balanceOf(BURN_ADDRESS);
    return burnedAmount.toString();
  } catch (error) {
    console.error("Error fetching burned tokens:", error);
    throw error;
  }
}

/**
 * Get token price (from an external API)
 * Note: In a real app, you'd use a price feed or API like CoinGecko or PancakeSwap
 */
export async function getTokenPrice() {
  // This is a placeholder for a real price API call
  try {
    // For demo purposes we're returning a fixed price
    // In a real implementation, you'd fetch this from an API
    return "$0.0032";
  } catch (error) {
    console.error("Error fetching token price:", error);
    throw error;
  }
}

/**
 * Get holder count
 * Note: In a real app, this would typically come from an indexer or API
 */
export async function getHolderCount() {
  // This is a placeholder for a real API call to get holder count
  try {
    // For demo purposes we're returning a fixed number
    return 42839;
  } catch (error) {
    console.error("Error fetching holder count:", error);
    throw error;
  }
}

export const web3 = {
  provider,
  tokenContract,
  getTokenInfo,
  getTokenBalance,
  getBurnedTokens,
  getTokenPrice,
  getHolderCount,
  TOKEN_ADDRESS,
  BURN_ADDRESS
};
