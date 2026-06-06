"use client";

import Link from "next/link";

import { useState } from "react";
import { Plus, Filter, Calendar } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fmtCurrency, fmtDate } from "@/utils/formatters";
import { cn } from "@/lib/utils";



const STATUSES = ["all", "draft", "active", "under_review", "awarded", "closed"] as const;

export default function RFQList() {
  const [filter, setFilter] = useState<(typeof STATUSES)[number]>("all");

  const { data: RFQS = [], isLoading, error } = useQuery({
    queryKey: ["rfqs"],
    queryFn: async () => {
      const res = await fetch("/api/rfqs");
      if (!res.ok) throw new Error("Failed to fetch RFQs");
      return res.json();
    },
  });

  const rfqs = filter === "all" ? RFQS : RFQS.filter((r: any) => r.status === filter);

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading RFQs...</div>;
  if (error) return <div className="p-10 text-center text-destructive">Error loading RFQs</div>;

  return (
    <>
      <TopBar
        title="Request for Quotations"
        subtitle={`${RFQS.length} total · ${RFQS.filter((r) => r.status === "active" || r.status === "under_review").length} active`}
        action={
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/rfqs/create"><Plus className="h-4 w-4" /> New RFQ</Link>
          </Button>
        }
      />

      <div className="p-6 space-y-5 max-w-[1600px] w-full">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium capitalize",
                  filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted",
                )}
              >
                {s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="gap-1.5"><Filter className="h-4 w-4" /> Filters</Button>
        </div>

        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-5 py-3">RFQ #</th>
                <th className="text-left px-5 py-3">Title</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Priority</th>
                <th className="text-right px-5 py-3">Budget</th>
                <th className="text-center px-5 py-3">Quotes</th>
                <th className="text-left px-5 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {rfqs.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/40 cursor-pointer">
                  <td className="px-5 py-3.5 font-mono text-xs">
                    <Link href={`/rfqs/${r.id}`}>{r.rfq_number}</Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link href={`/rfqs/${r.id}`} className="font-medium hover:text-primary">{r.title}</Link>
                    <div className="text-xs text-muted-foreground">by {r.owner}</div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{r.category}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3.5"><StatusBadge status={r.priority} /></td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums">{fmtCurrency(r.budget)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="text-xs font-medium tabular-nums">{r.quotes_received}/{r.vendors_invited}</span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {fmtDate(r.submission_deadline)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
