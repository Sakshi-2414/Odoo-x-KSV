"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Mail, Check, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmtCurrency, fmtDate } from "@/utils/formatters";
import { notFound } from "next/navigation";

export default function PODetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/purchase-orders/${id}`);
        if (!res.ok) throw new Error("PO not found");
        setPo(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!po) return notFound();

  return (
    <>
      <TopBar title={po.po_number || id} subtitle={`Issued to ${po.vendor_name || po.vendors?.name || 'Vendor'}`} action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><Mail className="h-4 w-4" /> Email vendor</Button>
          <Button size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Download PDF</Button>
        </div>
      } />
      <div className="p-6 max-w-5xl w-full space-y-6">
        <Link href="/purchase-orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to POs
        </Link>

        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* PO Header */}
          <div className="bg-gradient-to-br from-primary to-info p-8 text-primary-foreground">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/70">Purchase Order</div>
                <div className="font-display text-3xl font-bold mt-1">{po.po_number || id}</div>
                <div className="text-sm text-white/80 mt-1">Reference: {po.rfq_number || po.rfq_id || 'N/A'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-white/70">Total</div>
                <div className="font-display text-3xl font-bold tabular-nums">{fmtCurrency(po.total_amount || po.total || 0)}</div>
                <div className="mt-2"><StatusBadge status={po.status} className="bg-white/15 text-white ring-white/20" /></div>
              </div>
            </div>
          </div>

          {/* Bill / Ship */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Bill to</div>
              <div className="font-semibold">Acme Corp</div>
              <div className="text-sm text-muted-foreground">500 Enterprise Way<br />San Francisco, CA 94107</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Vendor</div>
              <div className="font-semibold">{po.vendor_name || po.vendors?.name || 'Vendor'}</div>
              <div className="text-sm text-muted-foreground">Issued: {fmtDate(po.issued_at || po.created_at)}<br />Delivery: {fmtDate(po.delivery_date || po.created_at)}</div>
            </div>
          </div>

          {/* Line items */}
          <div className="p-6">
            <h3 className="font-display font-semibold mb-3">Line Items</h3>
            <table className="w-full text-sm rounded-xl overflow-hidden border">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5">Item</th>
                  <th className="text-right px-4 py-2.5">Qty</th>
                  <th className="text-right px-4 py-2.5">Unit</th>
                  <th className="text-right px-4 py-2.5">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-medium">Itemized goods per RFQ</td>
                  <td className="px-4 py-3 text-right">1</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtCurrency(po.total_amount || po.total || 0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">{fmtCurrency(po.total_amount || po.total || 0)}</td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/40">
                <tr><td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Subtotal</td><td className="px-4 py-2 text-right tabular-nums">{fmtCurrency(po.total_amount || po.total || 0)}</td></tr>
                <tr><td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Tax (0%)</td><td className="px-4 py-2 text-right tabular-nums">$0</td></tr>
                <tr className="font-semibold border-t"><td colSpan={3} className="px-4 py-3 text-right">Total</td><td className="px-4 py-3 text-right tabular-nums">{fmtCurrency(po.total_amount || po.total || 0)}</td></tr>
              </tfoot>
            </table>
          </div>

          {/* Timeline */}
          <div className="p-6 border-t bg-muted/20">
            <h3 className="font-display font-semibold mb-3">Status Timeline</h3>
            <div className="flex items-center justify-between gap-2">
              {["draft", "issued", "acknowledged", "delivered", "completed"].map((s, i, arr) => {
                const currentIdx = arr.indexOf(po.status || "issued");
                const done = i <= (currentIdx >= 0 ? currentIdx : 1);
                return (
                  <div key={s} className="flex-1 flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className="text-xs capitalize">{s.replace(/_/g, " ")}</span>
                    {i < arr.length - 1 && <div className={`h-px flex-1 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
