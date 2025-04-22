import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { web3 } from "./lib/web3";
import { ai } from "./lib/ai";
import { z } from "zod";
import { insertBurnSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get token information
  app.get("/api/token", async (req, res) => {
    try {
      const tokenInfo = await web3.getTokenInfo();
      res.json(tokenInfo);
    } catch (error) {
      console.error("Error fetching token info:", error);
      res.status(500).json({ message: "Error fetching token information" });
    }
  });

  // Get token stats (supply, burned, price, etc)
  app.get("/api/token/stats", async (req, res) => {
    try {
      let stats = await storage.getLatestTokenStats();
      
      // If no stats exist or they're older than 5 minutes, fetch them fresh
      if (!stats || (Date.now() - new Date(stats.lastUpdated).getTime() > 5 * 60 * 1000)) {
        const [totalSupply, burnedTokens, price, holders] = await Promise.all([
          web3.getTokenInfo().then(info => info.totalSupply),
          web3.getBurnedTokens(),
          web3.getTokenPrice(),
          web3.getHolderCount()
        ]);
        
        stats = await storage.updateTokenStats({
          totalSupply,
          burnedTokens,
          price,
          holders
        });
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching token stats:", error);
      res.status(500).json({ message: "Error fetching token statistics" });
    }
  });

  // Get token balance for an address
  app.get("/api/wallet/:address/balance", async (req, res) => {
    try {
      const address = req.params.address;
      const balance = await web3.getTokenBalance(address);
      res.json({ address, balance });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: "Error fetching wallet balance" });
    }
  });

  // Get recent burns
  app.get("/api/burns", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const walletAddress = req.query.wallet as string | undefined;
      
      let burns;
      if (walletAddress) {
        burns = await storage.getBurnsByWalletAddress(walletAddress, limit, offset);
      } else {
        burns = await storage.getBurns(limit, offset);
      }
      
      res.json(burns);
    } catch (error) {
      console.error("Error fetching burns:", error);
      res.status(500).json({ message: "Error fetching burn history" });
    }
  });

  // Record a new burn
  app.post("/api/burns", async (req, res) => {
    try {
      const burnData = insertBurnSchema.parse(req.body);
      
      // Check if burn with this tx hash already exists
      const existingBurn = await storage.getBurnByTxHash(burnData.txHash);
      if (existingBurn) {
        return res.status(409).json({ message: "Burn transaction already recorded" });
      }
      
      const burn = await storage.createBurn(burnData);
      
      // Also record this as a transaction
      await storage.createTransaction({
        walletAddress: burnData.walletAddress,
        amount: burnData.amount,
        type: "burn",
        txHash: burnData.txHash,
        status: "confirmed"
      });
      
      res.status(201).json(burn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid burn data", errors: error.errors });
      }
      console.error("Error recording burn:", error);
      res.status(500).json({ message: "Error recording burn transaction" });
    }
  });

  // Get transaction history
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const walletAddress = req.query.wallet as string | undefined;
      
      let transactions;
      if (walletAddress) {
        transactions = await storage.getTransactionsByWalletAddress(walletAddress, limit, offset);
      } else {
        transactions = await storage.getTransactions(limit, offset);
      }
      
      const total = await storage.getTotalTransactionsCount();
      
      res.json({
        data: transactions,
        pagination: {
          total,
          limit,
          offset,
          remaining: Math.max(0, total - (offset + limit))
        }
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Error fetching transaction history" });
    }
  });

  // Record a new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const txData = insertTransactionSchema.parse(req.body);
      
      // Check if transaction with this tx hash already exists
      const existingTx = await storage.getTransactionByTxHash(txData.txHash);
      if (existingTx) {
        return res.status(409).json({ message: "Transaction already recorded" });
      }
      
      const transaction = await storage.createTransaction(txData);
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      console.error("Error recording transaction:", error);
      res.status(500).json({ message: "Error recording transaction" });
    }
  });

  // AI Smart Contract Analysis
  app.post("/api/audit/analyze", async (req, res) => {
    try {
      const { contractCode, query } = req.body;
      
      if (!contractCode) {
        return res.status(400).json({ message: "Contract code is required" });
      }
      
      const analysis = await ai.analyzeSmartContract(contractCode, query || undefined);
      res.json(analysis);
    } catch (error: any) {
      console.error("Error analyzing smart contract:", error);
      res.status(500).json({ message: `Error analyzing smart contract: ${error.message}` });
    }
  });

  // AI Smart Contract Improvement
  app.post("/api/audit/improve", async (req, res) => {
    try {
      const { contractCode, feedback } = req.body;
      
      if (!contractCode || !feedback) {
        return res.status(400).json({ message: "Contract code and feedback are required" });
      }
      
      const improvedCode = await ai.improveContractCode(contractCode, feedback);
      res.json({ improvedCode });
    } catch (error: any) {
      console.error("Error improving smart contract:", error);
      res.status(500).json({ message: `Error improving smart contract: ${error.message}` });
    }
  });

  // AI Smart Contract Explanation
  app.post("/api/audit/explain", async (req, res) => {
    try {
      const { contractCode, query } = req.body;
      
      if (!contractCode || !query) {
        return res.status(400).json({ message: "Contract code and query are required" });
      }
      
      const explanation = await ai.explainContractCode(contractCode, query);
      res.json({ explanation });
    } catch (error: any) {
      console.error("Error explaining smart contract:", error);
      res.status(500).json({ message: `Error explaining smart contract: ${error.message}` });
    }
  });

  // Get dynamic audit pricing based on token price
  app.get("/api/audit/pricing", async (req, res) => {
    try {
      // Get current token price and exchange rate
      const stats = await storage.getLatestTokenStats();
      if (!stats) {
        return res.status(404).json({ message: "Token stats not available" });
      }

      // Base prices in USDT
      const basePrices = {
        basic: 500,
        standard: 1000,
        premium: 2500,
        comprehensive: 5000
      };
      
      // Get current Bob token price in USDT (from stats)
      const bobTokenPriceInUsdt = parseFloat(stats.price);
      
      // Calculate BOB token amounts for each audit type
      const pricing = Object.entries(basePrices).reduce((result, [type, usdtPrice]) => {
        // Calculate how many BOB tokens needed based on current price
        // If price is 0, use a default value to avoid division by zero
        const bobPrice = bobTokenPriceInUsdt > 0
          ? Math.ceil(usdtPrice / bobTokenPriceInUsdt)
          : usdtPrice * 100; // Default: 1 USDT = 100 BOB
          
        return {
          ...result,
          [type]: {
            usdtPrice,
            bobPrice,
            exchangeRate: bobTokenPriceInUsdt
          }
        };
      }, {});
      
      res.json({
        pricing,
        lastUpdated: stats.lastUpdated
      });
    } catch (error) {
      console.error("Error calculating audit pricing:", error);
      res.status(500).json({ message: "Error calculating audit pricing" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
