import { useTransactions, useBases } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { TRANSACTION_TYPES } from "@shared/schema";
import { format } from "date-fns";
import { ShoppingCart, Calendar } from "lucide-react";
import { useState } from "react";

export default function Purchases() {
  const [baseId, setBaseId] = useState<string>("");
  const { data: transactions, isLoading } = useTransactions({ baseId: baseId ? Number(baseId) : undefined });
  const { data: bases } = useBases();

  const purchaseTransactions = transactions?.filter(t => t.type === TRANSACTION_TYPES.PURCHASE);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-emerald-500" />
            Purchase History
          </h1>
        </div>
        
        <div className="flex gap-2">
           <select 
             className="bg-card border border-border rounded-sm px-3 py-2 text-sm focus:border-primary focus:outline-none"
             value={baseId}
             onChange={e => setBaseId(e.target.value)}
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
              <th className="p-4">Acquisition Date</th>
              <th className="p-4">Asset Details</th>
              <th className="p-4">Assigned Base</th>
              <th className="p-4">Value</th>
              <th className="p-4">Procured By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
               <tr><td colSpan={5} className="p-8 text-center text-muted-foreground animate-pulse">Loading records...</td></tr>
            ) : purchaseTransactions?.length === 0 ? (
               <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No purchase records found.</td></tr>
            ) : (
              purchaseTransactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(tx.timestamp), "yyyy-MM-dd")}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{tx.asset?.name}</div>
                    <div className="text-xs font-mono text-emerald-500/70">{tx.asset?.serialNumber}</div>
                  </td>
                  <td className="p-4">
                    {bases?.find(b => b.id === tx.toBaseId)?.name}
                  </td>
                  <td className="p-4 font-mono">
                    ${Number(tx.asset?.value || 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-xs font-mono">
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
