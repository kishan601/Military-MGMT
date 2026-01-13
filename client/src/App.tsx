import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import Purchases from "@/pages/Purchases";
import Transfers from "@/pages/Transfers";
import Assignments from "@/pages/Assignments";
import UserManagement from "@/pages/admin/UserManagement";
import BaseManagement from "@/pages/admin/BaseManagement";
import { Loader2 } from "lucide-react";

// Protected Route Wrapper
function ProtectedRoute({ component: Component, adminOnly }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (adminOnly && user.role !== "ADMIN") {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/assets">
        <ProtectedRoute component={Assets} />
      </Route>
      <Route path="/purchases">
        <ProtectedRoute component={Purchases} />
      </Route>
      <Route path="/transfers">
        <ProtectedRoute component={Transfers} />
      </Route>
      <Route path="/assignments">
        <ProtectedRoute component={Assignments} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={UserManagement} adminOnly />
      </Route>
      <Route path="/admin/bases">
        <ProtectedRoute component={BaseManagement} adminOnly />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
