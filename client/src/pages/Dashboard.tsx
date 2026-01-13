import { useDashboardStats, useBases } from "@/hooks/use-data";
import { Layout } from "@/components/Layout";
import { StatsCard } from "@/components/StatsCard";
import { 
  Activity, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Box, 
  Crosshair, 
  Wallet,
  Calendar,
  Filter,
  ShoppingCart,
  ArrowRightLeft
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { clsx } from "clsx";

export default function Dashboard() {
  const [selectedBaseId, setSelectedBaseId] = useState<number | undefined>(undefined);
  const { data: bases } = useBases();
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const { data: stats, isLoading } = useDashboardStats({ 
    baseId: selectedBaseId,
    type: selectedType 
  });
  const [isNetMovementOpen, setIsNetMovementOpen] = useState(false);

  // Mock data for charts since the API returns aggregated stats
  const movementData = stats ? [
    { name: 'Purchases', value: stats.purchases, fill: '#10B981' },
    { name: 'Transfers In', value: stats.transfersIn, fill: '#3B82F6' },
    { name: 'Transfers Out', value: stats.transfersOut, fill: '#EF4444' },
  ] : [];

  const statusData = stats ? [
    { name: 'Assigned', value: stats.assigned },
    { name: 'Expended', value: stats.expended },
    { name: 'Available', value: stats.closingBalance - stats.assigned }, // Estimate
  ] : [];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981'];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Command Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm">
            <span className="text-primary mr-2">●</span>
            SYSTEM STATUS: ONLINE
            <span className="mx-2 text-border">|</span>
            {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
          </p>
        </div>

        <div className="flex gap-2">
          <select 
            className="bg-card border border-border text-sm rounded-sm px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
            value={selectedBaseId || ""}
            onChange={(e) => setSelectedBaseId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">ALL BASES</option>
            {bases?.map(base => (
              <option key={base.id} value={base.id}>{base.name}</option>
            ))}
          </select>
          <select 
            className="bg-card border border-border text-sm rounded-sm px-3 py-2 text-foreground focus:ring-1 focus:ring-primary focus:outline-none font-mono"
            value={selectedType || ""}
            onChange={(e) => setSelectedType(e.target.value || undefined)}
          >
            <option value="">ALL TYPES</option>
            <option value="VEHICLE">VEHICLES</option>
            <option value="WEAPON">WEAPONS</option>
            <option value="AMMUNITION">AMMUNITION</option>
            <option value="COMMUNICATION">COMMS</option>
          </select>
          <button className="bg-secondary text-secondary-foreground p-2 rounded-sm border border-border hover:bg-secondary/80">
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-card/50 rounded-sm" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              label="Opening Balance" 
              value={stats?.openingBalance || 0} 
              icon={Box} 
              description="Start of period asset count"
            />
            <StatsCard 
              label="Net Movement" 
              value={stats?.netMovement || 0} 
              icon={Activity} 
              trend={stats?.netMovement && stats.netMovement > 0 ? "up" : "down"}
              trendValue={stats?.netMovement ? (stats.netMovement > 0 ? "+" : "") + stats.netMovement : "0"}
              onClick={() => setIsNetMovementOpen(true)}
              className="border-primary/20"
            />
            <StatsCard 
              label="Closing Balance" 
              value={stats?.closingBalance || 0} 
              icon={Wallet} 
              description="Current total asset count"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Movement Chart */}
            <div className="glass-panel p-6 rounded-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                Movement Analysis
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movementData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} fontFamily="Share Tech Mono" />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} fontFamily="Rajdhani" width={100} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Chart */}
            <div className="glass-panel p-6 rounded-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-primary" />
                Asset Status Distribution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="square" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Net Movement Detail Dialog */}
      <Dialog open={isNetMovementOpen} onOpenChange={setIsNetMovementOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl uppercase tracking-wider font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Net Movement Breakdown
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono text-xs">
              Formula: Purchases + Transfer In - Transfer Out
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded border border-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded text-emerald-500">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="font-medium">Purchases</span>
              </div>
              <span className="font-mono text-lg font-bold text-emerald-500">+{stats?.purchases || 0}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded border border-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded text-blue-500">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <span className="font-medium">Transfers In</span>
              </div>
              <span className="font-mono text-lg font-bold text-blue-500">+{stats?.transfersIn || 0}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded border border-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-red-500/20 p-2 rounded text-red-500">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <span className="font-medium">Transfers Out</span>
              </div>
              <span className="font-mono text-lg font-bold text-red-500">-{stats?.transfersOut || 0}</span>
            </div>

            <div className="border-t-2 border-dashed border-border pt-4 mt-2 flex justify-between items-center">
              <span className="font-bold uppercase tracking-wider">Total Net Movement</span>
              <span className={clsx("font-mono text-2xl font-bold", (stats?.netMovement || 0) >= 0 ? "text-primary" : "text-destructive")}>
                {(stats?.netMovement || 0) > 0 ? "+" : ""}{stats?.netMovement || 0}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
