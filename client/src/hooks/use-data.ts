import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertAsset, type InsertBase } from "@shared/schema";

// --- Bases ---
export function useBases() {
  return useQuery({
    queryKey: [api.bases.list.path],
    queryFn: async () => {
      const res = await fetch(api.bases.list.path);
      if (!res.ok) throw new Error("Failed to fetch bases");
      return api.bases.list.responses[200].parse(await res.json());
    },
  });
}

// --- Assets ---
export function useAssets(filters?: { baseId?: number; type?: string; status?: string }) {
  return useQuery({
    queryKey: [api.assets.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.assets.list.path, window.location.origin);
      if (filters?.baseId) url.searchParams.append("baseId", filters.baseId.toString());
      if (filters?.type) url.searchParams.append("type", filters.type);
      if (filters?.status) url.searchParams.append("status", filters.status);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch assets");
      return api.assets.list.responses[200].parse(await res.json());
    },
  });
}

export function useAsset(id: number) {
  return useQuery({
    queryKey: [api.assets.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.assets.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch asset");
      return api.assets.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertAsset) => {
      const res = await fetch(api.assets.create.path, {
        method: api.assets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create asset");
      return api.assets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.assets.list.path] }),
  });
}

export function useTransferAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { toBaseId: number; notes?: string } }) => {
      const url = buildUrl(api.assets.transfer.path, { id });
      const res = await fetch(url, {
        method: api.assets.transfer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to transfer asset");
      return api.assets.transfer.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { notes?: string } }) => {
      const url = buildUrl(api.assets.assign.path, { id });
      const res = await fetch(url, {
        method: api.assets.assign.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to assign asset");
      return api.assets.assign.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

export function useExpendAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { notes?: string } }) => {
      const url = buildUrl(api.assets.expend.path, { id });
      const res = await fetch(url, {
        method: api.assets.expend.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to expend asset");
      return api.assets.expend.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.assets.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
    },
  });
}

// --- Dashboard ---
export function useDashboardStats(filters?: { baseId?: number; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [api.dashboard.stats.path, filters],
    queryFn: async () => {
      const url = new URL(api.dashboard.stats.path, window.location.origin);
      if (filters?.baseId) url.searchParams.append("baseId", filters.baseId.toString());
      if (filters?.startDate) url.searchParams.append("startDate", filters.startDate);
      if (filters?.endDate) url.searchParams.append("endDate", filters.endDate);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
  });
}

// --- Transactions ---
export function useTransactions(filters?: { baseId?: number; assetId?: number; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: [api.transactions.list.path, filters],
    queryFn: async () => {
      const url = new URL(api.transactions.list.path, window.location.origin);
      if (filters?.baseId) url.searchParams.append("baseId", filters.baseId.toString());
      if (filters?.assetId) url.searchParams.append("assetId", filters.assetId.toString());
      if (filters?.startDate) url.searchParams.append("startDate", filters.startDate);
      if (filters?.endDate) url.searchParams.append("endDate", filters.endDate);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}
