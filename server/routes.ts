import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { ASSET_STATUS, TRANSACTION_TYPES, users } from "@shared/schema";
import { hashPassword } from "./auth";
import { db } from "./db";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Bases
  app.get(api.bases.list.path, async (req, res) => {
    const bases = await storage.getBases();
    res.json(bases);
  });

  app.get(api.bases.get.path, async (req, res) => {
    const base = await storage.getBase(Number(req.params.id));
    if (!base) return res.status(404).json({ message: "Base not found" });
    res.json(base);
  });

  app.post(api.bases.create.path, async (req, res) => {
    try {
      const input = api.bases.create.input.parse(req.body);
      const base = await storage.createBase(input);
      res.status(201).json(base);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch("/api/bases/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "ADMIN") {
      return res.status(403).send("Admin access required");
    }
    const baseId = Number(req.params.id);
    const updates = req.body;
    
    // Validate budget if provided
    if (updates.budget !== undefined) {
      const val = Number(updates.budget);
      if (isNaN(val)) {
        return res.status(400).send("Invalid budget value");
      }
      // Ensure we pass it back as string for numeric type
      updates.budget = val.toString();
    }

    const base = await storage.updateBase(baseId, updates);
    res.json(base);
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "ADMIN") {
      return res.status(403).send("Admin access required");
    }
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      role: users.role,
      baseId: users.baseId,
      createdAt: users.createdAt
    }).from(users);
    res.json(allUsers);
  });

  // Assets
  app.get(api.assets.list.path, async (req, res) => {
    const filters = req.query;
    const assets = await storage.getAssets({
      baseId: filters.baseId ? Number(filters.baseId) : undefined,
      type: filters.type as string,
      status: filters.status as string,
    });
    res.json(assets);
  });

  app.get(api.assets.get.path, async (req, res) => {
    const asset = await storage.getAsset(Number(req.params.id));
    if (!asset) return res.status(404).json({ message: "Asset not found" });
    res.json(asset);
  });

  app.post(api.assets.create.path, async (req, res) => {
    try {
      const input = api.assets.create.input.parse(req.body);
      const asset = await storage.createAsset(input);
      
      // Log Purchase Transaction
      if (req.user) {
         await storage.createTransaction({
           assetId: asset.id,
           type: TRANSACTION_TYPES.PURCHASE,
           fromBaseId: null,
           toBaseId: asset.baseId,
           userId: (req.user as any).id,
           notes: "Initial purchase/entry",
         });
      }

      res.status(201).json(asset);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.assets.update.path, async (req, res) => {
     // ... implementation
     const input = api.assets.update.input.parse(req.body);
     const asset = await storage.updateAsset(Number(req.params.id), input);
     res.json(asset);
  });

  app.post(api.assets.transfer.path, async (req, res) => {
    const assetId = Number(req.params.id);
    const { toBaseId, notes } = req.body;
    const user = req.user as any;

    if (!user) return res.status(401).send("Unauthorized");

    const asset = await storage.getAsset(assetId);
    if (!asset) return res.status(404).send("Asset not found");

    // Update asset location and status
    const updatedAsset = await storage.updateAsset(assetId, {
      baseId: toBaseId,
      status: ASSET_STATUS.AVAILABLE, // Assuming instant transfer for MVP
    });

    // Log Transaction
    await storage.createTransaction({
      assetId,
      type: TRANSACTION_TYPES.TRANSFER_OUT, // Needs pairs? Or just one log?
      // Requirement: "Net Movement (Purchases + Transfer In - Transfer Out)"
      // We should probably log a Transfer Out from Source and Transfer In to Dest?
      // Or one record with from/to?
      // schema has fromBaseId and toBaseId.
      // So one record is enough. But for counting "Transfer In" vs "Transfer Out" for a SPECIFIC base:
      // A base sees it as Transfer Out if fromBaseId == base.id
      // A base sees it as Transfer In if toBaseId == base.id
      type: TRANSACTION_TYPES.TRANSFER_OUT, // Just use a generic TRANSFER type? Or derive from context.
      // Let's use TRANSFER_OUT for source log, or just "TRANSFER" and logic handles it.
      // Schema has specific types. Let's use TRANSFER_OUT for now as the action initiation.
      // Actually, let's just call it TRANSFER_OUT? No, let's use a generic TRANSFER if possible, or handle in stats.
      // I defined TRANSFER_IN and TRANSFER_OUT.
      // Let's just create ONE transaction record, and stats logic will count it based on baseId match.
      // But the type field is single.
      // Let's record it as TRANSFER_OUT from source?
      // Wait, if I query by baseId, I need to know if it came in or went out.
      // Maybe I should record TWO transactions?
      // No, that duplicates data.
      // I'll stick to one record.
      // I'll update the stats logic to look at fromBaseId/toBaseId.
      // But the TYPE field might be confusing.
      // Let's genericize to TRANSFER in my mind, but use TRANSFER_OUT for the API call context.
      fromBaseId: asset.baseId,
      toBaseId: toBaseId,
      userId: user.id,
      notes,
    });
    
    // Actually, for the "Type" field to be useful for simple filtering, maybe I should use "TRANSFER".
    // I'll update the schema in my head to treat TRANSFER_IN/OUT as derived, but schema has them as enum.
    // I will insert it as TRANSFER_OUT (initiated transfer).
    
    res.json(updatedAsset);
  });

  app.post(api.assets.expend.path, async (req, res) => {
    const assetId = Number(req.params.id);
    const { notes } = req.body;
    const user = req.user as any;
    
    if (!user) return res.status(401).send("Unauthorized");

    const asset = await storage.getAsset(assetId);
    if (!asset) return res.status(404).send("Asset not found");

    const updatedAsset = await storage.updateAsset(assetId, {
      status: ASSET_STATUS.EXPENDED,
    });

    await storage.createTransaction({
      assetId,
      type: TRANSACTION_TYPES.EXPEND,
      fromBaseId: asset.baseId,
      toBaseId: null, // Gone
      userId: user.id,
      notes,
    });

    res.json(updatedAsset);
  });
  
  app.post(api.assets.assign.path, async (req, res) => {
      const assetId = Number(req.params.id);
      const { notes } = req.body;
      const user = req.user as any;
      
      if (!user) return res.status(401).send("Unauthorized");
      
      const asset = await storage.getAsset(assetId);
      
      const updatedAsset = await storage.updateAsset(assetId, {
          status: ASSET_STATUS.ASSIGNED
      });
      
      await storage.createTransaction({
          assetId,
          type: TRANSACTION_TYPES.ASSIGN,
          fromBaseId: asset.baseId,
          toBaseId: asset.baseId,
          userId: user.id,
          notes
      });
      
      res.json(updatedAsset);
  });

  // Transactions
  app.get(api.transactions.list.path, async (req, res) => {
    const filters = {
      baseId: req.query.baseId ? Number(req.query.baseId) : undefined,
      assetId: req.query.assetId ? Number(req.query.assetId) : undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
    };
    const txs = await storage.getTransactions(filters);
    res.json(txs);
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (req, res) => {
    const filters = {
      baseId: req.query.baseId ? Number(req.query.baseId) : undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      type: req.query.type as string,
    };
    const stats = await storage.getDashboardStats(filters);
    res.json(stats);
  });
  
  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
    const basesList = await storage.getBases();
    if (basesList.length === 0) {
        const baseA = await storage.createBase({ name: "Alpha Base", location: "Sector 1", commander: "Col. Smith", budget: "1000000" });
        const baseB = await storage.createBase({ name: "Bravo Base", location: "Sector 2", commander: "Maj. Jones", budget: "500000" });
        const baseC = await storage.createBase({ name: "HQ", location: "Capital", commander: "Gen. Doe", budget: "5000000" });
        
        // Create Admin User
        const adminPassword = await hashPassword("admin123");
        const adminUser = await storage.createUser({
            username: "admin",
            password: adminPassword,
            role: "ADMIN"
        });

        // Add some dummy assets for inventory visibility
        const asset1 = await storage.createAsset({
            name: "M1 Abrams Tank",
            serialNumber: "TK-7782",
            type: "VEHICLE",
            status: "AVAILABLE",
            baseId: baseA.id,
            condition: "EXCELLENT",
            value: "6000000"
        });

        const asset2 = await storage.createAsset({
            name: "M4 Carbine",
            serialNumber: "WP-0012",
            type: "WEAPON",
            status: "AVAILABLE",
            baseId: baseA.id,
            condition: "GOOD",
            value: "1200"
        });

        await storage.createTransaction({
            assetId: asset1.id,
            type: TRANSACTION_TYPES.PURCHASE,
            toBaseId: baseA.id,
            userId: adminUser.id,
            notes: "Initial deployment"
        });
    }
}
