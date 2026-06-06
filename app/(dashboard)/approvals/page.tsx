"use client";


import { useState } from "react";
import { Check, X, ArrowUpRight, Sparkles, Clock } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fmtCurrency, fmtRelative } from "@/utils/formatters";
import { cn } from "@/lib/utils";



export default function ApprovalsPage() {
  const { data: APPROVALS = [], isLoading, error } = useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      const res = await fetch("/api/approvals");
      if (!res.ok) throw new Error("Failed to fetch Approvals");
      return res.json();
    },
  });

  const [selected, setSelected] = useState(APPROVALS[0]?.id || "");
  const item = APPROVALS.find((a: any) => a.id === selected) || APPROVALS[0];

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading Approvals...</div>;
  if (error) return <div className="p-10 text-center text-destructive">Error loading Approvals</div>;
  if (!APPROVALS.length) return <div className="p-10 text-center text-muted-foreground">No approvals pending.</div>;

  return (
    <>
      <TopBar title="Approval Queue" subtitle={`${APPROVALS.length} items awaiting decision`} />

      <div className="p-6 max-w-[1600px] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-display font-semibold">Pending Items</h3>
            </div>
            <ul className="divide-y max-h-[600px] overflow-y-auto">
              {APPROVALS.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setSelected(a.id)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-muted/40 transition-colors",
                      a.id === selected && "bg-primary-soft/40 border-l-2 border-primary",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{a.entity_ref}</span>
                      <StatusBadge status={a.priority} />
                    </div>
                    <div className="font-medium text-sm">{a.title}</div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-medium tabular-nums">{fmtCurrency(a.amount)}</span>
                      <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {fmtRelative(a.submitted_at)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 rounded-2xl border bg-card p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-muted-foreground">{item.entity_ref}</div>
                <h2 className="font-display text-xl font-semibold">{item.title}</h2>
                <div className="mt-1 text-sm text-muted-foreground">Requested by {item.requested_by} · {fmtRelative(item.submitted_at)}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-2xl font-bold tabular-nums">{fmtCurrency(item.amount)}</div>
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-primary-soft/60 to-transparent border border-primary/20 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-display text-sm font-semibold">AI Recommendation</span>
                <span className="ml-auto text-[10px] font-semibold rounded-full bg-primary text-primary-foreground px-2 py-0.5">94% confidence</span>
              </div>
              <p className="text-sm leading-relaxed">{item.ai_recommendation}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Tile label="Requested" value={fmtRelative(item.submitted_at)} />
              <Tile label="Due by" value={fmtRelative(item.due_by)} />
              <Tile label="Type" value={item.entity_type.replace(/_/g, " ")} />
              <Tile label="Priority" value={item.priority} />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Add a comment</label>
              <textarea
                rows={3}
                className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                placeholder="Optional context for the audit trail…"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Button className="gap-1.5 flex-1"><Check className="h-4 w-4" /> Approve</Button>
              <Button variant="outline" className="gap-1.5 flex-1 text-destructive hover:text-destructive">
                <X className="h-4 w-4" /> Reject
              </Button>
              <Button variant="outline" className="gap-1.5">
                <ArrowUpRight className="h-4 w-4" /> Escalate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium capitalize">{value}</div>
    </div>
  );
}
