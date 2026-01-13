import { useAssets, useBases, useTransferAsset, useExpendAsset, useAssignAsset } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { useState } from "react";
import { ASSET_TYPES, ASSET_STATUS, type Asset } from "@shared/schema";
import { 
  Package, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  Trash2, 
  UserPlus, 
  MoreVertical 
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

export default function Assets() {
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
  const [actionType, setActionType] = useState<"transfer" | "assign" | "expend" | null>(null);

  // Action Logic
  const transferMutation = useTransferAsset();
  const assignMutation = useAssignAsset();
  const expendMutation = useExpendAsset();

  const handleAction = async (formData: any) => {
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
                          {asset.status === ASSET_STATUS.AVAILABLE && (
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
      <Dialog open={!!selectedAsset} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider flex items-center gap-2">
              {actionType === "transfer" && <ArrowRightLeft className="w-5 h-5 text-primary" />}
              {actionType === "assign" && <UserPlus className="w-5 h-5 text-blue-500" />}
              {actionType === "expend" && <Trash2 className="w-5 h-5 text-destructive" />}
              {actionType} Asset: {selectedAsset?.serialNumber}
            </DialogTitle>
            <DialogDescription>
              {actionType === "transfer" && "Relocate this asset to another base. This will create a movement record."}
              {actionType === "assign" && "Assign this asset to personnel. It will be marked as unavailable."}
              {actionType === "expend" && "Mark this asset as expended/consumed. This action is irreversible."}
            </DialogDescription>
          </DialogHeader>

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
                <select name="toBaseId" required className="w-full bg-secondary border border-border rounded-sm p-2 text-sm focus:border-primary outline-none">
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
                className="w-full bg-secondary border border-border rounded-sm p-2 text-sm focus:border-primary outline-none resize-none"
                placeholder="Enter details..." 
              />
            </div>

            <DialogFooter className="mt-6">
              <button 
                type="button" 
                onClick={() => setSelectedAsset(null)}
                className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-sm transition-colors"
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
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
