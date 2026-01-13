import { useQuery, useMutation } from "@tanstack/react-query";
import { Base } from "@shared/schema";
import { Layout } from "@/components/Layout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Landmark, Plus, Wallet } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function BaseManagement() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [budgetVal, setBudgetVal] = useState("");

  const { data: bases, isLoading } = useQuery<Base[]>({ 
    queryKey: ["/api/bases"] 
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, budget }: { id: number; budget: string }) => {
      const res = await apiRequest("PATCH", `/api/bases/${id}`, { budget });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bases"] });
      setEditingId(null);
      toast({ title: "Success", description: "Budget updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">Base Management</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">Installation & Budgetary Control</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Base
        </Button>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            <Landmark className="h-4 w-4 text-primary" />
            Active Military Installations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-muted-foreground uppercase text-xs font-bold">Base Name</TableHead>
                <TableHead className="text-muted-foreground uppercase text-xs font-bold">Location</TableHead>
                <TableHead className="text-muted-foreground uppercase text-xs font-bold">Commander</TableHead>
                <TableHead className="text-muted-foreground uppercase text-xs font-bold">Current Budget</TableHead>
                <TableHead className="text-muted-foreground uppercase text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bases?.map((b) => (
                <TableRow key={b.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{b.name}</TableCell>
                  <TableCell className="text-muted-foreground">{b.location}</TableCell>
                  <TableCell>{b.commander}</TableCell>
                  <TableCell>
                    {editingId === b.id ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          className="h-8 w-24 font-mono" 
                          value={budgetVal} 
                          onChange={(e) => setBudgetVal(e.target.value)}
                          type="number"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => {
                            console.log("Saving budget:", budgetVal);
                            updateBudgetMutation.mutate({ id: b.id, budget: budgetVal });
                          }}
                          disabled={updateBudgetMutation.isPending}
                        >
                          {updateBudgetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-primary font-mono font-bold">
                        <Wallet className="h-3 w-3" />
                        ${Number(b.budget).toLocaleString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingId(b.id);
                        setBudgetVal(b.budget || "0");
                      }}
                    >
                      Adjust Budget
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
}
