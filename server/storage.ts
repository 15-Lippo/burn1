import {
  users, burns, transactions, tokenStats, walletAddresses,
  type User, type InsertUser,
  type Burn, type InsertBurn,
  type Transaction, type InsertTransaction,
  type TokenStats, type InsertTokenStats,
  type WalletAddress, type InsertWalletAddress
} from "@shared/schema";

export interface IStorage {
  // User related
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet addresses
  getWalletAddressByAddress(address: string): Promise<WalletAddress | undefined>;
  createWalletAddress(walletAddress: InsertWalletAddress): Promise<WalletAddress>;
  
  // Burns
  getBurns(limit?: number, offset?: number): Promise<Burn[]>;
  getBurnsByWalletAddress(walletAddress: string, limit?: number, offset?: number): Promise<Burn[]>;
  getBurnByTxHash(txHash: string): Promise<Burn | undefined>;
  createBurn(burn: InsertBurn): Promise<Burn>;
  
  // Transactions
  getTransactions(limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionsByWalletAddress(walletAddress: string, limit?: number, offset?: number): Promise<Transaction[]>;
  getTransactionByTxHash(txHash: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTotalTransactionsCount(): Promise<number>;
  
  // Token stats
  getLatestTokenStats(): Promise<TokenStats | undefined>;
  updateTokenStats(stats: InsertTokenStats): Promise<TokenStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private walletAddresses: Map<string, WalletAddress>;
  private burns: Map<string, Burn>;
  private transactions: Map<string, Transaction>;
  private tokenStatsHistory: TokenStats[];
  
  private userCurrentId: number;
  private walletAddressCurrentId: number;
  private burnCurrentId: number;
  private transactionCurrentId: number;
  private tokenStatsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.walletAddresses = new Map();
    this.burns = new Map();
    this.transactions = new Map();
    this.tokenStatsHistory = [];
    
    this.userCurrentId = 1;
    this.walletAddressCurrentId = 1;
    this.burnCurrentId = 1;
    this.transactionCurrentId = 1;
    this.tokenStatsCurrentId = 1;
    
    // Initialize with default token stats
    this.updateTokenStats({
      totalSupply: "10000000",
      burnedTokens: "2450000",
      price: "$0.0032",
      holders: 42839
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Wallet address methods
  async getWalletAddressByAddress(address: string): Promise<WalletAddress | undefined> {
    return this.walletAddresses.get(address);
  }
  
  async createWalletAddress(insertWalletAddress: InsertWalletAddress): Promise<WalletAddress> {
    const id = this.walletAddressCurrentId++;
    const walletAddress: WalletAddress = { ...insertWalletAddress, id };
    this.walletAddresses.set(walletAddress.address, walletAddress);
    return walletAddress;
  }
  
  // Burns methods
  async getBurns(limit = 10, offset = 0): Promise<Burn[]> {
    return Array.from(this.burns.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
  }
  
  async getBurnsByWalletAddress(walletAddress: string, limit = 10, offset = 0): Promise<Burn[]> {
    return Array.from(this.burns.values())
      .filter(burn => burn.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
  }
  
  async getBurnByTxHash(txHash: string): Promise<Burn | undefined> {
    return this.burns.get(txHash);
  }
  
  async createBurn(insertBurn: InsertBurn): Promise<Burn> {
    const id = this.burnCurrentId++;
    const burn: Burn = { 
      ...insertBurn, 
      id,
      timestamp: new Date()
    };
    this.burns.set(burn.txHash, burn);
    
    // Update token stats
    const latestStats = await this.getLatestTokenStats();
    if (latestStats) {
      this.updateTokenStats({
        totalSupply: (BigInt(latestStats.totalSupply) - BigInt(burn.amount)).toString(),
        burnedTokens: (BigInt(latestStats.burnedTokens) + BigInt(burn.amount)).toString(),
        price: latestStats.price,
        holders: latestStats.holders
      });
    }
    
    return burn;
  }
  
  // Transaction methods
  async getTransactions(limit = 10, offset = 0): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
  }
  
  async getTransactionsByWalletAddress(walletAddress: string, limit = 10, offset = 0): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);
  }
  
  async getTransactionByTxHash(txHash: string): Promise<Transaction | undefined> {
    return this.transactions.get(txHash);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionCurrentId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id,
      timestamp: new Date()
    };
    this.transactions.set(transaction.txHash, transaction);
    return transaction;
  }
  
  async getTotalTransactionsCount(): Promise<number> {
    return this.transactions.size;
  }
  
  // Token stats methods
  async getLatestTokenStats(): Promise<TokenStats | undefined> {
    if (this.tokenStatsHistory.length === 0) {
      return undefined;
    }
    return this.tokenStatsHistory[this.tokenStatsHistory.length - 1];
  }
  
  async updateTokenStats(insertTokenStats: InsertTokenStats): Promise<TokenStats> {
    const id = this.tokenStatsCurrentId++;
    const stats: TokenStats = { 
      ...insertTokenStats, 
      id,
      lastUpdated: new Date()
    };
    this.tokenStatsHistory.push(stats);
    return stats;
  }
}

export const storage = new MemStorage();
