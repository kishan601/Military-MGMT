import { useTransactions, useBases } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { TRANSACTION_TYPES } from "@shared/schema";
import { format } from "date-fns";
import { ArrowRight, ArrowRightLeft, Calendar } from "lucide-react";
import { useState } from "react";

export default function Transfers() {
  const [baseId, setBaseId] = useState<string>("");
  const { data: transactions, isLoading } = useTransactions({ baseId: baseId ? Number(baseId) : undefined });
  const { data: bases } = useBases();

  // Filter client-side for now for specific transaction types if API doesn't support generic type filtering yet
  const transferTransactions = transactions?.filter(t => 
    t.type === TRANSACTION_TYPES.TRANSFER_IN || t.type === TRANSACTION_TYPES.TRANSFER_OUT
  );

  return (
    <Layout>
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-primary" />
            Movement Log
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
              <th className="p-4">Date/Time</th>
              <th className="p-4">Asset</th>
              <th className="p-4">Origin</th>
              <th className="p-4"></th>
              <th className="p-4">Destination</th>
              <th className="p-4">Officer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Loading logs...</td></tr>
            ) : transferTransactions?.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transfer records found.</td></tr>
            ) : (
              transferTransactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(tx.timestamp), "yyyy-MM-dd HH:mm")}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{tx.asset?.name}</div>
                    <div className="text-xs font-mono text-primary/70">{tx.asset?.serialNumber}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {bases?.find(b => b.id === tx.fromBaseId)?.name || "Unknown"}
                  </td>
                  <td className="p-4 text-center">
                    <ArrowRight className="w-4 h-4 text-primary opacity-50" />
                  </td>
                  <td className="p-4 font-bold text-foreground">
                    {bases?.find(b => b.id === tx.toBaseId)?.name || "Unknown"}
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
