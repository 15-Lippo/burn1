import { ethers } from "ethers";
import { apiRequest } from "./queryClient";

// Token contract address
export const TOKEN_ADDRESS = "0xfa4C07636B53D868E514777B9d4005F1e9c6c40B";

// BSC explorer URL
export const BSC_EXPLORER_URL = "https://bscscan.com";

// Format a token amount for display
export function formatTokenAmount(amount: string | number | bigint, decimals = 18): string {
  try {
    return ethers.formatUnits(amount.toString(), decimals);
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return "0";
  }
}

// Format an address for display
export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

// Get a link to the BSC explorer for a transaction, address, or token
export function getExplorerLink(type: "tx" | "address" | "token", value: string): string {
  switch (type) {
    case "tx":
      return `${BSC_EXPLORER_URL}/tx/${value}`;
    case "address":
      return `${BSC_EXPLORER_URL}/address/${value}`;
    case "token":
      return `${BSC_EXPLORER_URL}/token/${value}`;
  }
}

// Format a date for display
export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format a time ago string (e.g. "3 hours ago")
export function timeAgo(date: Date | string | number): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return `${interval} year${interval === 1 ? "" : "s"} ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} month${interval === 1 ? "" : "s"} ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} day${interval === 1 ? "" : "s"} ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour${interval === 1 ? "" : "s"} ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute${interval === 1 ? "" : "s"} ago`;
  }
  
  return `${Math.floor(seconds)} second${seconds === 1 ? "" : "s"} ago`;
}

// Fetch token stats from the backend
export async function fetchTokenStats() {
  const response = await apiRequest("GET", "/api/token/stats", undefined);
  return response.json();
}

// Fetch recent burns from the backend
export async function fetchRecentBurns(limit = 5) {
  const response = await apiRequest("GET", `/api/burns?limit=${limit}`, undefined);
  return response.json();
}

// Fetch transactions from the backend
export async function fetchTransactions(limit = 10, offset = 0) {
  const response = await apiRequest("GET", `/api/transactions?limit=${limit}&offset=${offset}`, undefined);
  return response.json();
}

// Record a new burn transaction
export async function recordBurnTransaction(walletAddress: string, amount: string, txHash: string) {
  const response = await apiRequest("POST", "/api/burns", {
    walletAddress,
    amount,
    txHash
  });
  return response.json();
}

// Get token balance for a wallet
export async function fetchWalletBalance(address: string) {
  const response = await apiRequest("GET", `/api/wallet/${address}/balance`, undefined);
  return response.json();
}
