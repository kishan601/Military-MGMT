import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Shield, Crosshair } from "lucide-react";

export default function Login() {
  const { loginMutation } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
      <div className="max-w-md w-full glass-panel p-8 rounded-sm border border-primary/20 relative overflow-hidden">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

        <div className="relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-widest text-foreground uppercase">M.A.M.S.</h1>
            <p className="text-muted-foreground text-xs uppercase tracking-[0.3em] mt-1">Military Asset Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Officer ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-secondary/50 border border-border p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none rounded-sm transition-all"
                placeholder="ENTER ID"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Access Code</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-secondary/50 border border-border p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none rounded-sm transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-mono flex items-center gap-2">
                <Crosshair className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary text-primary-foreground py-3 font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loginMutation.isPending ? "Authenticating..." : "Initialize Session"}
                {!loginMutation.isPending && <Crosshair className="w-4 h-4 group-hover:rotate-90 transition-transform" />}
              </span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-[10px] text-muted-foreground font-mono">
              UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED. <br/>
              ALL ACTIONS ARE LOGGED AND MONITORED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
