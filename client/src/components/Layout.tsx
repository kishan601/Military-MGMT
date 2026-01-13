import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Shield, 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  ShoppingCart, 
  Users, 
  LogOut,
  Menu,
  X,
  Crosshair,
  User
} from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { ROLES } from "@shared/schema";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/assets", label: "Asset Inventory", icon: Package },
    { href: "/transfers", label: "Transfers", icon: ArrowRightLeft },
    { href: "/purchases", label: "Purchases", icon: ShoppingCart, role: [ROLES.ADMIN, ROLES.COMMANDER] },
    { href: "/assignments", label: "Assignments", icon: Users },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.role || (user && item.role.includes(user.role as any))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/50 backdrop-blur-md sticky top-0 h-screen">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-wider text-foreground leading-none">M.A.M.S.</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Tactical Logistics</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase tracking-wider transition-all duration-200 border-l-2",
                  isActive 
                    ? "border-primary bg-primary/10 text-primary" 
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 bg-background/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center border border-border">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.username}</p>
              <p className="text-xs text-muted-foreground truncate font-mono">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-sm transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Disengage
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden border-b border-border/50 bg-card/50 p-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
         <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-wider">M.A.M.S.</span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground">
           {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden flex flex-col pt-20 px-6 animate-in slide-in-from-top-10">
          <nav className="space-y-4">
            {filteredNavItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center gap-4 py-3 text-lg font-medium border-b border-border/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5 text-primary" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => logoutMutation.mutate()}
              className="flex items-center gap-4 py-3 text-lg font-medium text-destructive w-full text-left"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
