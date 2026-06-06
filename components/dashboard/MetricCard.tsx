import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: { value: string; up?: boolean };
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneRing: Record<string, string> = {
    default: "from-primary/20 to-info/20 text-primary",
    success: "from-success/20 to-success/10 text-success",
    warning: "from-warning/20 to-warning/10 text-warning-foreground",
    danger: "from-destructive/20 to-destructive/10 text-destructive",
  };

  return (
    <div className="group rounded-2xl border bg-card p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-semibold tabular-nums">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {Icon && (
          <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center", toneRing[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {delta && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {delta.up ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className={cn("font-medium", delta.up ? "text-success" : "text-destructive")}>{delta.value}</span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}
