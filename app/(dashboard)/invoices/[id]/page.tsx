"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Check, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmtCurrency, fmtDate } from "@/utils/formatters";
import { notFound } from "next/navigation";

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [inv, setInv] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) throw new Error("Invoice not found");
        setInv(await res.json());
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

  if (!inv) return notFound();

  const matched = inv.match_status === "matched" || inv.match_status === "approved";

  return (
    <>
      <TopBar title={inv.invoice_number || id} subtitle={`From ${inv.vendor_name || inv.vendors?.name || 'Vendor'} · ${inv.purchase_orders?.po_number || inv.po_id}`} />
      <div className="p-6 max-w-5xl w-full space-y-6">
        <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card">
            <div className="p-6 border-b flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Invoice</div>
                <div className="font-display text-2xl font-bold">{inv.invoice_number || id}</div>
                <div className="text-sm text-muted-foreground mt-1">Issued {fmtDate(inv.issue_date || inv.created_at)} · Due {fmtDate(inv.due_date || inv.created_at)}</div>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl font-bold tabular-nums">{fmtCurrency(inv.total_amount || inv.total || 0)}</div>
                <StatusBadge status={inv.payment_status || inv.status} />
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Document preview</h3>
              <div className="aspect-[4/3] rounded-xl border-2 border-dashed bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
                Invoice PDF preview
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 ${matched ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"}`}>
              <div className="flex items-center gap-2 mb-3">
                {matched ? <Check className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
                <h3 className="font-display font-semibold">3-Way Match</h3>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  { label: "Purchase Order", ok: true },
                  { label: "Goods Receipt", ok: true },
                  { label: "Invoice", ok: matched },
                ].map((r) => (
                  <li key={r.label} className="flex items-center justify-between">
                    <span>{r.label}</span>
                    {r.ok ? <Check className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-destructive" />}
                  </li>
                ))}
              </ul>
              {!matched && (
                <div className="mt-3 rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                  Variance detected: invoice exceeds PO. Manual review required.
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5 space-y-2">
              <h3 className="font-display font-semibold mb-2">Actions</h3>
              <Button className="w-full gap-1.5"><Check className="h-4 w-4" /> Approve for payment</Button>
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">Raise dispute</Button>
              <Button variant="outline" className="w-full">Send reminder</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
