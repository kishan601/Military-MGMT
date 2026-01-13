import { useAssets, useBases, useTransferAsset, useExpendAsset, useAssignAsset, useCreateAsset } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { ASSET_TYPES, ASSET_STATUS, type Asset, ROLES, ASSET_CONDITIONS } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { 
  Package, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  Trash2, 
  UserPlus, 
  MoreVertical,
  Edit2,
  Plus,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Assets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [filters, setFilters] = useState({ type: "", baseId: "", status: "" });
  const { data: assets, isLoading } = useAssets(
    { 
      type: filters.type || undefined, 
      baseId: filters.baseId ? Number(filters.baseId) : undefined, 
      status: filters.status || undefined 
    }
  );
  const { data: bases } = useBases();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [actionType, setActionType] = useState<"transfer" | "assign" | "expend" | "create" | "edit" | null>(null);

  // New Asset State
  const [newAsset, setNewAsset] = useState({
    name: "",
    serialNumber: "",
    type: ASSET_TYPES.COMMUNICATION,
    status: ASSET_STATUS.AVAILABLE,
    baseId: "",
    condition: "EXCELLENT",
    value: "0"
  });

  // Action Logic
  const transferMutation = useTransferAsset();
  const assignMutation = useAssignAsset();
  const expendMutation = useExpendAsset();
  const createAssetMutation = useCreateAsset();

  const handleAction = async (formData: any) => {
    if (actionType === "create") {
      try {
        await createAssetMutation.mutateAsync({
          ...newAsset,
          baseId: Number(newAsset.baseId),
        });
        toast({ title: "Success", description: "Asset created successfully" });
        setActionType(null);
        setNewAsset({
          name: "",
          serialNumber: "",
          type: ASSET_TYPES.COMMUNICATION,
          status: ASSET_STATUS.AVAILABLE,
          baseId: "",
          condition: ASSET_CONDITIONS.EXCELLENT,
          value: "0"
        });
      } catch (e: any) {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
      return;
    }

    if (!selectedAsset) return;

    try {
      if (actionType === "transfer") {
        await transferMutation.mutateAsync({ 
          id: selectedAsset.id, 
          data: { toBaseId: Number(formData.toBaseId), notes: formData.notes } 
        });
      } else if (actionType === "assign") {
        await assignMutation.mutateAsync({ 
          id: selectedAsset.id, 
          data: { notes: formData.notes } 
        });
      } else if (actionType === "expend") {
        await expendMutation.mutateAsync({ 
          id: selectedAsset.id, 
          data: { notes: formData.notes } 
        });
      }
      setActionType(null);
      setSelectedAsset(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Asset Inventory
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="Search Serial #" 
                  className="pl-9 pr-4 py-2 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-primary w-full md:w-64 font-mono"
                />
             </div>
             
             <select 
               className="bg-card border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none"
               value={filters.type}
               onChange={e => setFilters({...filters, type: e.target.value})}
             >
               <option value="">All Types</option>
               {Object.values(ASSET_TYPES).map(t => <option key={t} value={t}>{t}</option>)}
             </select>
             
             <select 
               className="bg-card border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none"
               value={filters.baseId}
               onChange={e => setFilters({...filters, baseId: e.target.value})}
             >
               <option value="">All Bases</option>
               {bases?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
             </select>

             {isAdmin && (
               <Button onClick={() => setActionType("create")} className="gap-2">
                 <Plus className="h-4 w-4" />
                 Add Asset
               </Button>
             )}
          </div>
        </div>

        <div className="glass-panel rounded-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 text-muted-foreground font-mono uppercase text-xs tracking-wider border-b border-border">
              <tr>
                <th className="p-4">Serial #</th>
                <th className="p-4">Asset Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Scanning database...</td></tr>
              ) : assets?.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No assets found matching criteria.</td></tr>
              ) : (
                assets?.map((asset) => (
                  <tr key={asset.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4 font-mono text-primary/80">{asset.serialNumber}</td>
                    <td className="p-4 font-bold">{asset.name}</td>
                    <td className="p-4 text-xs font-mono">{asset.type}</td>
                    <td className="p-4">{bases?.find(b => b.id === asset.baseId)?.name || "N/A"}</td>
                    <td className="p-4">
                      <span className={clsx(
                        "px-2 py-1 rounded-xs text-[10px] uppercase font-bold tracking-wider border",
                        asset.status === ASSET_STATUS.AVAILABLE && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                        asset.status === ASSET_STATUS.ASSIGNED && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        asset.status === ASSET_STATUS.MAINTENANCE && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        asset.status === ASSET_STATUS.EXPENDED && "bg-red-500/10 text-red-500 border-red-500/20",
                      )}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                          {isAdmin && (
                            <button 
                              className="p-1.5 hover:bg-muted hover:text-foreground rounded-sm transition-colors" 
                              title="Edit Asset Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {(asset.status === ASSET_STATUS.AVAILABLE || isAdmin) && (
                            <>
                              <button 
                                onClick={() => { setSelectedAsset(asset); setActionType("transfer"); }}
                                className="p-1.5 hover:bg-primary/20 hover:text-primary rounded-sm transition-colors" 
                                title="Transfer"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => { setSelectedAsset(asset); setActionType("assign"); }}
                                className="p-1.5 hover:bg-blue-500/20 hover:text-blue-500 rounded-sm transition-colors" 
                                title="Assign"
                              >
                                <UserPlus className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => { setSelectedAsset(asset); setActionType("expend"); }}
                                className="p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-sm transition-colors" 
                                title="Expend"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={(open) => !open && setActionType(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider flex items-center gap-2">
              {actionType === "transfer" && <ArrowRightLeft className="w-5 h-5 text-primary" />}
              {actionType === "assign" && <UserPlus className="w-5 h-5 text-blue-500" />}
              {actionType === "expend" && <Trash2 className="w-5 h-5 text-destructive" />}
              {actionType === "create" && <Plus className="w-5 h-5 text-primary" />}
              {actionType} Asset {selectedAsset ? `: ${selectedAsset.serialNumber}` : ""}
            </DialogTitle>
            <DialogDescription>
              {actionType === "transfer" && "Relocate this asset to another base. This will create a movement record."}
              {actionType === "assign" && "Assign this asset to personnel. It will be marked as unavailable."}
              {actionType === "expend" && "Mark this asset as expended/consumed. This action is irreversible."}
              {actionType === "create" && "Register a new military asset into the inventory system."}
            </DialogDescription>
          </DialogHeader>

          {actionType === "create" ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Name</Label>
                  <Input 
                    value={newAsset.name} 
                    onChange={e => setNewAsset({...newAsset, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number</Label>
                  <Input 
                    value={newAsset.serialNumber} 
                    onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select value={newAsset.type} onValueChange={v => setNewAsset({...newAsset, type: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(ASSET_TYPES).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Base</Label>
                  <Select value={newAsset.baseId} onValueChange={v => setNewAsset({...newAsset, baseId: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {bases?.map(b => <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Condition</Label>
                  <Select value={newAsset.condition} onValueChange={v => setNewAsset({...newAsset, condition: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(ASSET_CONDITIONS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value ($)</Label>
                  <Input 
                    type="number"
                    value={newAsset.value} 
                    onChange={e => setNewAsset({...newAsset, value: e.target.value})} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setActionType(null)}>Cancel</Button>
                <Button onClick={() => handleAction({})} disabled={createAssetMutation.isPending}>
                  {createAssetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register Asset
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAction(Object.fromEntries(formData));
              }}
              className="space-y-4 py-4"
            >
              {actionType === "transfer" && (
                <div className="space-y-2">
                  <label className="text-xs uppercase font-bold text-muted-foreground">Destination Base</label>
                  <select name="toBaseId" required className="w-full bg-secondary border border-border rounded-sm p-2 text-sm focus:border-primary outline-none text-foreground">
                    {bases?.filter(b => b.id !== selectedAsset?.baseId).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-muted-foreground">Notes / Authorization</label>
                <textarea 
                  name="notes" 
                  rows={3} 
                  className="w-full bg-secondary border border-border rounded-sm p-2 text-sm focus:border-primary outline-none resize-none text-foreground"
                  placeholder="Enter details..." 
                />
              </div>

              <DialogFooter className="mt-6">
                <button 
                  type="button" 
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-sm transition-colors text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={clsx(
                    "px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-sm transition-all shadow-lg",
                    actionType === "transfer" && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
                    actionType === "assign" && "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20",
                    actionType === "expend" && "bg-destructive text-white hover:bg-destructive/90 shadow-destructive/20",
                  )}
                >
                  Confirm {actionType}
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
