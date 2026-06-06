"use client";

import Link from "next/link";

import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { fmtCurrency, fmtRelative } from "@/utils/formatters";



export default function QuotationsPage() {
  const { data: QUOTATIONS = [], isLoading, error } = useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const res = await fetch("/api/quotations");
      if (!res.ok) throw new Error("Failed to fetch Quotations");
      return res.json();
    },
  });
  
  // We don't fetch RFQS here right now, we can just display quotation data
  // Or we can mock the RFQ ref for now if it's missing in quotation endpoint
  // Let's assume quotation has an rfq_number returned by the backend

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading Quotations...</div>;
  if (error) return <div className="p-10 text-center text-destructive">Error loading Quotations</div>;

  return (
    <>
      <TopBar title="All Quotations" subtitle={`${QUOTATIONS.length} active quotations across RFQs`} />
      <div className="p-6 max-w-[1600px] w-full">
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Quote #</th>
                <th className="text-left px-5 py-3">RFQ</th>
                <th className="text-left px-5 py-3">Vendor</th>
                <th className="text-right px-5 py-3">Total</th>
                <th className="text-center px-5 py-3">Delivery</th>
                <th className="text-center px-5 py-3">AI Score</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {QUOTATIONS.map((q: any) => {
                return (
                  <tr key={q.id} className="border-t hover:bg-muted/40">
                    <td className="px-5 py-3.5 font-mono text-xs">{q.quote_number}</td>
                    <td className="px-5 py-3.5">
                      <Link href={`/rfqs/${q.rfq_id}`} className="text-primary hover:underline text-xs font-mono">{q.rfq_id?.substring(0, 8)}...</Link>
                    </td>
                    <td className="px-5 py-3.5 font-medium">{q.vendor_name}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{fmtCurrency(q.total)}</td>
                    <td className="px-5 py-3.5 text-center">{q.delivery_days}d</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">{q.ai_score.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={q.status} /></td>
                    <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">{fmtRelative(q.submitted_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
