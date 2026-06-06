"use client";

import Link from "next/link";

import { Check, AlertTriangle } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { fmtCurrency, fmtDate } from "@/utils/formatters";



export default function InvoicesPage() {
  const { data: INVOICES = [], isLoading, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices");
      if (!res.ok) throw new Error("Failed to fetch Invoices");
      return res.json();
    },
  });

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading Invoices...</div>;
  if (error) return <div className="p-10 text-center text-destructive">Error loading Invoices</div>;

  return (
    <>
      <TopBar title="Invoices" subtitle={`${INVOICES.length} invoices · 3-way match enabled`} />
      <div className="p-6 max-w-[1600px] w-full">
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Invoice #</th>
                <th className="text-left px-5 py-3">PO Ref</th>
                <th className="text-left px-5 py-3">Vendor</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Issued</th>
                <th className="text-left px-5 py-3">Due</th>
                <th className="text-center px-5 py-3">3-Way Match</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="border-t hover:bg-muted/40">
                  <td className="px-5 py-3.5 font-mono text-xs">
                    <Link href={`/invoices/${inv.id}`} className="text-primary hover:underline">{inv.invoice_number}</Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{inv.po_number}</td>
                  <td className="px-5 py-3.5 font-medium">{inv.vendor_name}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{fmtCurrency(inv.total)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{fmtDate(inv.issue_date)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{fmtDate(inv.due_date)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center gap-0.5">
                      {["PO", "RCP", "INV"].map((l) => (
                        <span key={l} className={`text-[9px] font-bold rounded px-1.5 py-0.5 flex items-center gap-0.5 ${inv.match_status === "matched" || inv.match_status === "approved" ? "bg-success/15 text-success" : inv.match_status === "discrepancy" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`}>
                          {inv.match_status === "discrepancy" ? <AlertTriangle className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />}
                          {l}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={inv.payment_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
