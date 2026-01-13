import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({ label, value, icon: Icon, trend, trendValue, description, className, onClick }: StatsCardProps) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "glass-panel p-6 rounded-sm relative overflow-hidden group transition-all duration-300 hover:border-primary/50",
        onClick && "cursor-pointer hover:bg-card/80",
        className
      )}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-24 h-24 text-primary" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground">
          <Icon className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-bold">{label}</span>
        </div>
        
        <div className="text-3xl font-bold font-mono text-foreground tracking-tight">
          {value}
        </div>
        
        {(trendValue || description) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {trendValue && (
              <span className={clsx(
                "font-bold px-1.5 py-0.5 rounded-xs",
                trend === "up" && "bg-primary/20 text-primary",
                trend === "down" && "bg-destructive/20 text-destructive",
                trend === "neutral" && "bg-secondary text-secondary-foreground"
              )}>
                {trendValue}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground truncate">{description}</span>
            )}
          </div>
        )}
      </div>

      {/* Corner accents */}
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-muted-foreground/20" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-muted-foreground/20" />
    </div>
  );
}
