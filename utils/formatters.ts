export const fmtCurrency = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

export const fmtNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const fmtRelative = (d: string | Date) => {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const trustTier = (score: number) => {
  if (score >= 85) return { label: "Elite", color: "text-success", bg: "bg-success/10", ring: "ring-success/30" };
  if (score >= 70) return { label: "Trusted", color: "text-success", bg: "bg-success/10", ring: "ring-success/30" };
  if (score >= 55) return { label: "Good", color: "text-info", bg: "bg-info/10", ring: "ring-info/30" };
  if (score >= 40) return { label: "Average", color: "text-warning", bg: "bg-warning/10", ring: "ring-warning/30" };
  if (score >= 25) return { label: "Review", color: "text-warning", bg: "bg-warning/15", ring: "ring-warning/40" };
  return { label: "High Risk", color: "text-destructive", bg: "bg-destructive/10", ring: "ring-destructive/30" };
};
