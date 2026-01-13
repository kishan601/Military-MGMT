import { useQuery, useMutation } from "@tanstack/react-query";
import { User, ROLES } from "@shared/schema";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, UserPlus, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function UserManagement() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", role: ROLES.LOGISTICS });

  const { data: users, isLoading } = useQuery<User[]>({ 
    queryKey: ["/api/admin/users"] 
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsOpen(false);
      setFormData({ username: "", password: "", role: ROLES.LOGISTICS });
      toast({ title: "Success", description: "Personnel added successfully" });
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
          <h1 className="text-3xl font-bold tracking-tight text-white uppercase">User Management</h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">Personnel Authorization Control</p>
        </div>
        <Button className="gap-2" onClick={() => setIsOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Add Personnel
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="uppercase font-bold tracking-wider">Add New Personnel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                placeholder="Callsign/Username"
              />
            </div>
            <div className="space-y-2">
              <Label>Temporary Password</Label>
              <Input 
                type="password"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                placeholder="********"
              />
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select 
                value={formData.role} 
                onValueChange={v => setFormData({...formData, role: v as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ROLES.ADMIN}>ADMIN</SelectItem>
                  <SelectItem value={ROLES.COMMANDER}>COMMANDER</SelectItem>
                  <SelectItem value={ROLES.LOGISTICS}>LOGISTICS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createUserMutation.mutate(formData)}
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Authorize Personnel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Authorized Personnel Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-muted-foreground uppercase text-xs font-bold">Username</TableHead>
                <TableHead className="text-muted-foreground uppercase text-xs font-bold">Access Level</TableHead>
                <TableHead className="text-muted-foreground uppercase text-xs font-bold">Assigned Base</TableHead>
                <TableHead className="text-muted-foreground uppercase text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((u) => (
                <TableRow key={u.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold">{u.username}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === ROLES.ADMIN ? "default" : "secondary"} className="font-mono text-[10px]">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.baseId || "GLOBAL"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
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
