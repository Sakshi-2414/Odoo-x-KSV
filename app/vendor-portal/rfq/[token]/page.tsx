"use client";


import { useState } from "react";
import { Boxes, Calendar, Send, Upload, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fmtCurrency, fmtDate } from "@/utils/formatters";



const rfq = {
  number: "RFQ-2026-0042",
  title: "100 Dell Laptops — Core i7",
  buyer: "Acme Corporation",
  deadline: "2026-06-12T23:59:00Z",
  delivery: "2026-07-01",
  items: [
    { name: "Dell Latitude 7430", qty: 100, unit: "units", specs: "Core i7, 16GB RAM, 512GB SSD" },
  ],
};

export default function VendorPortal() {
  const [submitted, setSubmitted] = useState(false);
  const [unit, setUnit] = useState(765);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
        <div className="max-w-md text-center rounded-2xl border bg-card p-10 space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-success/15 flex items-center justify-center">
            <Check className="h-7 w-7 text-success" />
          </div>
          <h1 className="font-display text-2xl font-semibold">Quotation submitted</h1>
          <p className="text-sm text-muted-foreground">
            Thanks! Acme Corporation will review your quotation. You'll receive an email decision after the deadline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center"><Boxes className="h-4 w-4 text-primary-foreground" /></div>
            <div>
              <div className="font-display font-semibold text-sm">VendorBridge AI</div>
              <div className="text-[11px] text-sidebar-muted">Vendor Quotation Portal</div>
            </div>
          </div>
          <div className="text-right text-xs">
            <div className="text-sidebar-muted">Quoting for</div>
            <div className="font-medium">{rfq.buyer}</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* RFQ Summary */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-muted-foreground">{rfq.number}</div>
              <h1 className="font-display text-2xl font-semibold mt-1">{rfq.title}</h1>
            </div>
            <div className="rounded-full bg-warning/15 text-warning-foreground text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Deadline: {fmtDate(rfq.deadline)}
            </div>
          </div>
          <div className="mt-4 rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-left px-4 py-2.5">Item</th><th className="text-right px-4 py-2.5">Qty</th><th className="text-left px-4 py-2.5">Specs</th></tr>
              </thead>
              <tbody>
                {rfq.items.map((it) => (
                  <tr key={it.name} className="border-t">
                    <td className="px-4 py-3 font-medium">{it.name}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{it.qty}</td>
                    <td className="px-4 py-3 text-muted-foreground">{it.specs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quotation form */}
        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          className="rounded-2xl border bg-card p-6 space-y-5"
        >
          <h2 className="font-display text-lg font-semibold">Your Quotation</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-1.5 sm:col-span-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Unit price (USD)</span>
              <input
                type="number"
                value={unit}
                onChange={(e) => setUnit(Number(e.target.value))}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </label>
            <div className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Line total</span>
              <div className="rounded-lg border bg-muted px-3 py-2 text-sm font-semibold tabular-nums">{fmtCurrency(unit * rfq.items[0].qty)}</div>
            </div>
            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Delivery date</span>
              <input type="date" defaultValue={rfq.delivery} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Payment terms</span>
              <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                <option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Cash on delivery</option>
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Validity (days)</span>
              <input type="number" defaultValue={30} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</span>
            <textarea rows={3} placeholder="Warranty, support, additional terms…" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
          </label>

          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">Attachments</div>
            <div className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground hover:bg-muted/40 cursor-pointer">
              <Upload className="h-5 w-5 mx-auto mb-2" />
              <div>Drop files here or click to upload</div>
              <div className="text-xs mt-1">Quotation PDF, specs, datasheets</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button type="button" variant="outline"><FileText className="h-4 w-4 mr-1.5" /> Save draft</Button>
            <Button type="submit" className="gap-1.5"><Send className="h-4 w-4" /> Submit quotation</Button>
          </div>
        </form>
      </main>
    </div>
  );
}
