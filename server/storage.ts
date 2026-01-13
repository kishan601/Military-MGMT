import { db } from "./db";
import {
  users, bases, assets, transactions,
  type User, type InsertUser,
  type Base, type InsertBase,
  type Asset, type InsertAsset,
  type Transaction, type InsertTransaction,
  ASSET_STATUS, TRANSACTION_TYPES
} from "@shared/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Bases
  getBases(): Promise<Base[]>;
  getBase(id: number): Promise<Base | undefined>;
  createBase(base: InsertBase): Promise<Base>;
  updateBase(id: number, updates: Partial<InsertBase>): Promise<Base>;

  // Assets
  getAssets(filters?: { baseId?: number; type?: string; status?: string }): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, updates: Partial<InsertAsset>): Promise<Asset>;

  // Transactions
  getTransactions(filters?: { baseId?: number; assetId?: number; startDate?: Date; endDate?: Date }): Promise<(Transaction & { asset: Asset; user: User })[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Dashboard
  getDashboardStats(filters: { baseId?: number; startDate?: Date; endDate?: Date; type?: string }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getBases(): Promise<Base[]> {
    return await db.select().from(bases);
  }

  async getBase(id: number): Promise<Base | undefined> {
    const [base] = await db.select().from(bases).where(eq(bases.id, id));
    return base;
  }

  async createBase(insertBase: InsertBase): Promise<Base> {
    const [base] = await db.insert(bases).values(insertBase).returning();
    return base;
  }

  async updateBase(id: number, updates: Partial<InsertBase>): Promise<Base> {
    const [base] = await db.update(bases).set(updates).where(eq(bases.id, id)).returning();
    return base;
  }

  async getAssets(filters?: { baseId?: number; type?: string; status?: string }): Promise<Asset[]> {
    let query = db.select().from(assets);
    const conditions = [];

    if (filters?.baseId) conditions.push(eq(assets.baseId, filters.baseId));
    if (filters?.type) conditions.push(eq(assets.type, filters.type));
    if (filters?.status) conditions.push(eq(assets.status, filters.status));

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    return await query;
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const [asset] = await db.insert(assets).values(insertAsset).returning();
    return asset;
  }

  async updateAsset(id: number, updates: Partial<InsertAsset>): Promise<Asset> {
    const [asset] = await db.update(assets).set(updates).where(eq(assets.id, id)).returning();
    return asset;
  }

  async getTransactions(filters?: { baseId?: number; assetId?: number; startDate?: Date; endDate?: Date }): Promise<(Transaction & { asset: Asset; user: User })[]> {
    let query = db.select({
        id: transactions.id,
        assetId: transactions.assetId,
        type: transactions.type,
        fromBaseId: transactions.fromBaseId,
        toBaseId: transactions.toBaseId,
        userId: transactions.userId,
        timestamp: transactions.timestamp,
        notes: transactions.notes,
        asset: assets,
        user: users,
      })
      .from(transactions)
      .innerJoin(assets, eq(transactions.assetId, assets.id))
      .innerJoin(users, eq(transactions.userId, users.id));

    const conditions = [];

    if (filters?.baseId) {
      // For transactions, we might care about where it happened.
      // For Transfer Out: fromBaseId = baseId
      // For Transfer In: toBaseId = baseId
      // For Purchase/Assign/Expend: baseId of asset usually, but simple approach:
      // Check if either fromBaseId or toBaseId matches, OR if the asset was at that base?
      // Simplified: Just match fromBaseId or toBaseId
       conditions.push(sql`(${transactions.fromBaseId} = ${filters.baseId} OR ${transactions.toBaseId} = ${filters.baseId})`);
    }

    if (filters?.assetId) conditions.push(eq(transactions.assetId, filters.assetId));
    if (filters?.startDate) conditions.push(gte(transactions.timestamp, filters.startDate));
    if (filters?.endDate) conditions.push(lte(transactions.timestamp, filters.endDate));

    if (conditions.length > 0) {
      // @ts-ignore - drizzle type inference struggles with complex joins sometimes
      return await query.where(and(...conditions));
    }
    // @ts-ignore
    return await query;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getDashboardStats(filters: { baseId?: number; startDate?: Date; endDate?: Date; type?: string }): Promise<any> {
    // This requires complex aggregation. For MVP, fetch transactions and process in memory or use simplified queries.
    // Given the complexity, I'll fetch relevant assets and transactions and compute.

    // Get all transactions within date range
    const txs = await this.getTransactions(filters);

    let purchases = 0;
    let transfersIn = 0;
    let transfersOut = 0;
    let assigned = 0;
    let expended = 0;

    for (const tx of txs) {
       // Filter by baseId logic again if needed
       if (filters.baseId) {
         if (tx.type === TRANSACTION_TYPES.TRANSFER_OUT && tx.fromBaseId !== filters.baseId) continue;
         if (tx.type === TRANSACTION_TYPES.TRANSFER_IN && tx.toBaseId !== filters.baseId) continue;
         if (tx.type === TRANSACTION_TYPES.PURCHASE && tx.toBaseId !== filters.baseId) continue; // Purchases come INTO a base
       }

       if (tx.type === TRANSACTION_TYPES.PURCHASE) purchases++;
       if (tx.type === TRANSACTION_TYPES.TRANSFER_IN) transfersIn++;
       if (tx.type === TRANSACTION_TYPES.TRANSFER_OUT) transfersOut++;
       if (tx.type === TRANSACTION_TYPES.ASSIGN) assigned++;
       if (tx.type === TRANSACTION_TYPES.EXPEND) expended++;
    }

    // Opening/Closing balance requires counting inventory at start date.
    // Current Inventory = Sum of all Active Assets at Base.
    // Closing Balance = Current Inventory (if endDate is today/future) OR calculated backwards.
    // Opening Balance = Closing Balance - Net Movement.

    // Let's get current inventory count for the base
    const assetsList = await this.getAssets({ baseId: filters.baseId, type: filters.type });
    const currentCount = assetsList.filter(a => a.status === ASSET_STATUS.AVAILABLE || a.status === ASSET_STATUS.ASSIGNED).length;

    // Net Movement = Purchases + Transfer In - Transfer Out - Expended?
    // "Net Movement (Purchases + Transfer In - Transfer Out)"
    const netMovement = purchases + transfersIn - transfersOut;

    // If endDate is today, Closing Balance is currentCount.
    // If we want accurate historical balances, we need to reverse transactions from today back to endDate.
    // For MVP, assume Closing Balance = Current Count (approx).
    const closingBalance = currentCount;
    const openingBalance = closingBalance - netMovement + expended; // Logic check: Opening + Net - Expended = Closing

    return {
      openingBalance,
      closingBalance,
      netMovement,
      purchases,
      transfersIn,
      transfersOut,
      assigned,
      expended
    };
  }
}

export const storage = new DatabaseStorage();
