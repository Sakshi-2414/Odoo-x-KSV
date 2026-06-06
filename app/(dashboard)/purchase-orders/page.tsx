"use client";

import Link from "next/link";

import { Download, Mail } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fmtCurrency, fmtDate } from "@/utils/formatters";



export default function POPage() {
  const { data: POS = [], isLoading, error } = useQuery({
    queryKey: ["pos"],
    queryFn: async () => {
      const res = await fetch("/api/purchase-orders");
      if (!res.ok) throw new Error("Failed to fetch Purchase Orders");
      return res.json();
    },
  });

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading Purchase Orders...</div>;
  if (error) return <div className="p-10 text-center text-destructive">Error loading Purchase Orders</div>;

  return (
    <>
      <TopBar title="Purchase Orders" subtitle={`${POS.length} POs · ${fmtCurrency(POS.reduce((s, p) => s + p.total, 0))} total value`} />
      <div className="p-6 max-w-[1600px] w-full">
        <div className="rounded-2xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">PO #</th>
                <th className="text-left px-5 py-3">RFQ Ref</th>
                <th className="text-left px-5 py-3">Vendor</th>
                <th className="text-right px-5 py-3">Amount</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Issued</th>
                <th className="text-left px-5 py-3">Delivery</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {POS.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/40">
                  <td className="px-5 py-3.5 font-mono text-xs">
                    <Link href={`/purchase-orders/${p.id}`} className="text-primary hover:underline">{p.po_number}</Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{p.rfq_number}</td>
                  <td className="px-5 py-3.5 font-medium">{p.vendor_name}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{fmtCurrency(p.total)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{fmtDate(p.issued_at)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{fmtDate(p.delivery_date)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Download className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Mail className="h-3.5 w-3.5" /></Button>
                    </div>
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
