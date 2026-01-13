import { pgTable, text, serial, integer, boolean, timestamp, numeric, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const ROLES = {
  ADMIN: "ADMIN",
  COMMANDER: "COMMANDER",
  LOGISTICS: "LOGISTICS",
} as const;

export const ASSET_TYPES = {
  VEHICLE: "VEHICLE",
  WEAPON: "WEAPON",
  AMMUNITION: "AMMUNITION",
  COMMUNICATION: "COMMUNICATION",
} as const;

export const ASSET_STATUS = {
  AVAILABLE: "AVAILABLE",
  ASSIGNED: "ASSIGNED",
  MAINTENANCE: "MAINTENANCE",
  TRANSIT: "TRANSIT",
  EXPENDED: "EXPENDED",
} as const;

export const TRANSACTION_TYPES = {
  PURCHASE: "PURCHASE",
  TRANSFER_IN: "TRANSFER_IN",
  TRANSFER_OUT: "TRANSFER_OUT",
  ASSIGN: "ASSIGN",
  RETURN: "RETURN",
  EXPEND: "EXPEND",
} as const;

export const ASSET_CONDITIONS = {
  EXCELLENT: "EXCELLENT",
  GOOD: "GOOD",
  FAIR: "FAIR",
  POOR: "POOR",
  NON_OPERATIONAL: "NON-OPERATIONAL",
} as const;

// Tables

export const bases = pgTable("bases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  commander: text("commander"),
  budget: numeric("budget").default("0"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default(ROLES.LOGISTICS),
  baseId: integer("base_id").references(() => bases.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  serialNumber: text("serial_number").unique(),
  type: text("type").notNull(), // ASSET_TYPES
  status: text("status").notNull().default(ASSET_STATUS.AVAILABLE), // ASSET_STATUS
  baseId: integer("base_id").references(() => bases.id), // Current location
  condition: text("condition"),
  value: numeric("value"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  type: text("type").notNull(), // TRANSACTION_TYPES
  fromBaseId: integer("from_base_id").references(() => bases.id),
  toBaseId: integer("to_base_id").references(() => bases.id),
  userId: integer("user_id").references(() => users.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  notes: text("notes"),
});

// Schemas

export const insertBaseSchema = createInsertSchema(bases).omit({ id: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });

// Types

export type Base = typeof bases.$inferSelect;
export type InsertBase = z.infer<typeof insertBaseSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// API Types

export type AssetFilter = {
  type?: string;
  baseId?: number;
  status?: string;
};

export type DashboardStats = {
  openingBalance: number;
  closingBalance: number;
  netMovement: number; // Purchases + Transfer In - Transfer Out
  purchases: number;
  transfersIn: number;
  transfersOut: number;
  assigned: number;
  expended: number;
};
