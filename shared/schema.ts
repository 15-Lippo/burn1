import { pgTable, text, serial, integer, bigint, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const walletAddresses = pgTable("wallet_addresses", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 42 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id),
});

export const burns = pgTable("burns", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  amount: bigint("amount", { mode: "string" }).notNull(),
  txHash: varchar("tx_hash", { length: 66 }).notNull().unique(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
  amount: bigint("amount", { mode: "string" }).notNull(),
  type: text("type").notNull(), // "burn", "transfer", "receive"
  txHash: varchar("tx_hash", { length: 66 }).notNull().unique(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("confirmed"), // "confirmed", "pending", "failed"
});

export const tokenStats = pgTable("token_stats", {
  id: serial("id").primaryKey(),
  totalSupply: bigint("total_supply", { mode: "string" }).notNull(),
  burnedTokens: bigint("burned_tokens", { mode: "string" }).notNull(),
  price: text("price").notNull(),
  holders: integer("holders").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWalletAddressSchema = createInsertSchema(walletAddresses).pick({
  address: true,
  userId: true,
});

export const insertBurnSchema = createInsertSchema(burns).pick({
  walletAddress: true,
  amount: true,
  txHash: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  walletAddress: true,
  amount: true,
  type: true,
  txHash: true,
  status: true,
});

export const insertTokenStatsSchema = createInsertSchema(tokenStats).pick({
  totalSupply: true,
  burnedTokens: true,
  price: true,
  holders: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWalletAddress = z.infer<typeof insertWalletAddressSchema>;
export type WalletAddress = typeof walletAddresses.$inferSelect;

export type InsertBurn = z.infer<typeof insertBurnSchema>;
export type Burn = typeof burns.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertTokenStats = z.infer<typeof insertTokenStatsSchema>;
export type TokenStats = typeof tokenStats.$inferSelect;
