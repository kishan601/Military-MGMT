import { useTransactions, useBases, useAssets, useAssignAsset, useExpendAsset } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { TRANSACTION_TYPES, ROLES, ASSET_STATUS } from "@shared/schema";
import { format } from "date-fns";
import { Users, AlertTriangle, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function Assignments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;
  const [baseId, setBaseId] = useState<string>("");
  const { data: transactions, isLoading } = useTransactions({ baseId: baseId ? Number(baseId) : undefined });
  const { data: bases } = useBases();
  const { data: assets } = useAssets({ baseId: baseId ? Number(baseId) : undefined, status: ASSET_STATUS.AVAILABLE });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ assetId: "", type: TRANSACTION_TYPES.ASSIGN, notes: "" });

  const assignMutation = useAssignAsset();
  const expendMutation = useExpendAsset();

  const handleAction = async () => {
    try {
      if (formData.type === TRANSACTION_TYPES.ASSIGN) {
        await assignMutation.mutateAsync({ id: Number(formData.assetId), data: { notes: formData.notes } });
      } else {
        await expendMutation.mutateAsync({ id: Number(formData.assetId), data: { notes: formData.notes } });
      }
      setIsModalOpen(false);
      setFormData({ assetId: "", type: TRANSACTION_TYPES.ASSIGN, notes: "" });
      toast({ title: "Success", description: "Record created successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const relevantTransactions = transactions?.filter(t => 
    t.type === TRANSACTION_TYPES.ASSIGN || t.type === TRANSACTION_TYPES.EXPEND
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-500" />
            Assignments & Expenditures
          </h1>
        </div>
        
        <div className="flex gap-2">
           <select 
             className="bg-card border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none text-foreground"
             value={baseId}
             onChange={e => setBaseId(e.target.value)}
           >
             <option value="">All Bases</option>
             {bases?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
           </select>
           {isAdmin && (
             <Button onClick={() => setIsModalOpen(true)} className="gap-2">
               <Plus className="h-4 w-4" />
               New Record
             </Button>
           )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wider">New Operational Record</DialogTitle>
            <DialogDescription>Assign an asset to personnel or mark it as expended.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v as any})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={TRANSACTION_TYPES.ASSIGN}>ASSIGNMENT</SelectItem>
                  <SelectItem value={TRANSACTION_TYPES.EXPEND}>EXPENDITURE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Asset</Label>
              <Select value={formData.assetId} onValueChange={v => setFormData({...formData, assetId: v})}>
                <SelectTrigger><SelectValue placeholder="Select available asset" /></SelectTrigger>
                <SelectContent>
                  {assets?.map(a => (
                    <SelectItem key={a.id} value={a.id.toString()}>{a.name} ({a.serialNumber})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes / Authorization</Label>
              <textarea 
                className="w-full bg-secondary border border-border rounded-sm p-2 text-sm focus:border-primary outline-none resize-none"
                rows={3}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Enter assignment details..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAction} 
              disabled={assignMutation.isPending || expendMutation.isPending}
            >
              {(assignMutation.isPending || expendMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="glass-panel rounded-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 text-muted-foreground font-mono uppercase text-xs tracking-wider border-b border-border">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Type</th>
              <th className="p-4">Asset</th>
              <th className="p-4">Base</th>
              <th className="p-4">Notes</th>
              <th className="p-4">Authorized By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
               <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Loading records...</td></tr>
            ) : relevantTransactions?.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No records found.</td></tr>
            ) : (
              relevantTransactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono text-muted-foreground">
                    {format(new Date(tx.timestamp), "yyyy-MM-dd HH:mm")}
                  </td>
                  <td className="p-4">
                    <span className={clsx(
                      "px-2 py-1 rounded-xs text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 w-fit",
                      tx.type === TRANSACTION_TYPES.ASSIGN ? "bg-blue-500/10 text-blue-500" : "bg-destructive/10 text-destructive"
                    )}>
                      {tx.type === TRANSACTION_TYPES.ASSIGN ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{tx.asset?.name}</div>
                    <div className="text-xs font-mono text-primary/70">{tx.asset?.serialNumber}</div>
                  </td>
                  <td className="p-4 text-foreground">
                    {bases?.find(b => b.id === (tx.fromBaseId || tx.toBaseId))?.name || "N/A"}
                  </td>
                  <td className="p-4 text-muted-foreground italic max-w-xs truncate">
                    {tx.notes || "-"}
                  </td>
                  <td className="p-4 text-xs font-mono text-foreground">
                    {tx.user?.username}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
