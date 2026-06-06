import { trustTier } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export function TrustScoreGauge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const tier = trustTier(score);
  const dim = size === "sm" ? 36 : size === "md" ? 56 : 80;
  const stroke = size === "sm" ? 4 : size === "md" ? 5 : 7;
  const r = (dim - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (score / 100) * C;

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle cx={dim / 2} cy={dim / 2} r={r} strokeWidth={stroke} className="stroke-muted fill-none" />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className={cn("fill-none transition-all", tier.color)}
            stroke="currentColor"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-display font-semibold tabular-nums", size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-lg")}>
            {Math.round(score)}
          </span>
        </div>
      </div>
      {size !== "sm" && <span className={cn("text-[10px] font-semibold uppercase tracking-wide", tier.color)}>{tier.label}</span>}
    </div>
  );
}
