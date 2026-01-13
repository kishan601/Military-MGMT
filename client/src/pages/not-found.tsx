import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="glass-panel p-8 text-center max-w-md w-full border-destructive/20">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-destructive animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-4 font-mono text-destructive tracking-widest">404</h1>
        <p className="text-xl text-foreground font-bold uppercase tracking-wider mb-2">Sector Not Found</p>
        <p className="text-muted-foreground mb-8 text-sm">
          The coordinates you are trying to access do not exist in the system database.
        </p>

        <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold uppercase tracking-wider text-sm transition-colors border border-border w-full rounded-sm">
          Return to Base
        </Link>
      </div>
    </div>
  );
}
