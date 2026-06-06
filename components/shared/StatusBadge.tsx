import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "indigo" | "amber";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-foreground/70 ring-border",
  info: "bg-info/10 text-info ring-info/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/15 text-warning-foreground ring-warning/30",
  danger: "bg-destructive/10 text-destructive ring-destructive/20",
  indigo: "bg-primary-soft text-primary ring-primary/20",
  amber: "bg-warning/15 text-warning-foreground ring-warning/30",
};

const statusMap: Record<string, Tone> = {
  draft: "neutral",
  active: "info",
  under_review: "amber",
  awarded: "indigo",
  closed: "neutral",
  cancelled: "danger",
  pending: "warning",
  approved: "success",
  rejected: "danger",
  escalated: "danger",
  submitted: "info",
  shortlisted: "indigo",
  issued: "info",
  acknowledged: "indigo",
  in_progress: "amber",
  delivered: "success",
  invoiced: "info",
  completed: "success",
  unpaid: "warning",
  partial: "amber",
  paid: "success",
  overdue: "danger",
  disputed: "danger",
  matched: "success",
  discrepancy: "danger",
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = statusMap[status] ?? "neutral";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize",
        toneClasses[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-muted-foreground": tone === "neutral",
        "bg-info": tone === "info",
        "bg-success": tone === "success",
        "bg-warning": tone === "warning" || tone === "amber",
        "bg-destructive": tone === "danger",
        "bg-primary": tone === "indigo",
      })} />
      {label}
    </span>
  );
}
