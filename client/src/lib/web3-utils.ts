import { ethers } from "ethers";
import { BSC_CHAIN_ID } from "./connectors";

// BSC token contract address
export const TOKEN_ADDRESS = "0xfa4C07636B53D868E514777B9d4005F1e9c6c40B";

// ERC20 token ABI - minimal set for functionality we need
export const ERC20_ABI = [
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

// The audit service address for payments
export const AUDIT_SERVICE_ADDRESS = "0x8C56A47F7FBaCE1177fFe2cb54c7BD7aEF1f999C";

// BSC Chain configuration for wallet switching
export const BSC_CHAIN_CONFIG = {
  chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: ["https://bsc-dataseed1.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com/"],
};

// Format token amount with proper decimals (for display)
export function formatTokenAmount(amount: string | number | bigint, decimals = 18): string {
  try {
    return ethers.formatUnits(amount, decimals);
  } catch (error) {
    return "0";
  }
}

// Format wallet address for display (add ellipsis)
export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  const start = address.substring(0, chars + 2);
  const end = address.substring(address.length - chars);
  return `${start}...${end}`;
}

// Get the explorer URL for transactions, addresses, or tokens
export function getExplorerLink(chainId: number, type: "tx" | "address" | "token", value: string): string {
  const baseUrl = chainId === BSC_CHAIN_ID ? "https://bscscan.com" : "https://etherscan.io";
  
  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${value}`;
    case "address":
      return `${baseUrl}/address/${value}`;
    case "token":
      return `${baseUrl}/token/${value}`;
    default:
      return baseUrl;
  }
}

// Create a token contract instance
export function getTokenContract(
  provider: ethers.BrowserProvider | null, 
  address: string = TOKEN_ADDRESS
): ethers.Contract | null {
  if (!provider) return null;
  
  try {
    return new ethers.Contract(address, ERC20_ABI, provider);
  } catch (error) {
    console.error("Error creating token contract:", error);
    return null;
  }
}

// Execute payment for audit service
export async function payForAudit(
  provider: ethers.BrowserProvider,
  amount: string,
  decimals = 18
): Promise<string> {
  if (!provider) {
    throw new Error("Provider not available");
  }

  try {
    const signer = await provider.getSigner();
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);
    
    // Convert amount to wei
    const parsedAmount = ethers.parseUnits(amount, decimals);
    
    // Send payment transaction
    const tx = await tokenContract.transfer(AUDIT_SERVICE_ADDRESS, parsedAmount);
    const receipt = await tx.wait();
    
    return receipt.hash;
  } catch (error: any) {
    console.error("Error processing payment:", error);
    throw new Error(error.message || "Failed to process payment");
  }
}