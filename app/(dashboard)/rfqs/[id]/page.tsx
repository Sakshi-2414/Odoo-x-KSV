"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, DollarSign, Building2, Sparkles, FileText, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmtCurrency, fmtDate, fmtRelative } from "@/utils/formatters";
import { notFound } from "next/navigation";

export default function RFQDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [rfq, setRfq] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [rfqRes, quotesRes] = await Promise.all([
          fetch(`/api/rfqs/${id}`),
          fetch(`/api/rfqs/${id}/quotations`)
        ]);
        if (!rfqRes.ok) throw new Error("RFQ not found");
        setRfq(await rfqRes.json());
        if (quotesRes.ok) setQuotes(await quotesRes.json());
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

  if (!rfq) return notFound();

  return (
    <>
      <TopBar
        title={rfq.title}
        subtitle={`${rfq.rfq_number || id} · ${rfq.category}`}
        action={
          <Button asChild size="sm" className="gap-1.5">
            <Link href={`/rfqs/${rfq.id}/quotations`}>
              <Sparkles className="h-4 w-4" /> AI compare ({quotes?.length || 0})
            </Link>
          </Button>
        }
      />

      <div className="p-6 max-w-[1600px] w-full space-y-6">
        <Link href="/rfqs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to RFQs
        </Link>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoTile icon={DollarSign} label="Budget" value={fmtCurrency(rfq.budget)} />
          <InfoTile icon={Calendar} label="Deadline" value={fmtDate(rfq.submission_deadline)} />
          <InfoTile icon={Building2} label="Quotes" value={`${quotes?.length || 0}`} />
          <InfoTile icon={FileText} label="Status" value={<StatusBadge status={rfq.status} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-display font-semibold mb-4">Line Items</h3>
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2.5">Item</th>
                      <th className="text-right px-4 py-2.5">Qty</th>
                      <th className="text-left px-4 py-2.5">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfq.items?.map((it: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-3 font-medium">{it.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{it.qty} {it.unit}</td>
                        <td className="px-4 py-3 text-muted-foreground">{it.specs || it.description}</td>
                      </tr>
                    ))}
                    {!rfq.items?.length && (
                      <tr><td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">No items found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border bg-card">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-display font-semibold">Received Quotations ({quotes?.length || 0})</h3>
                <Link href={`/rfqs/${rfq.id}/quotations`} className="text-xs text-primary hover:underline">
                  AI comparison →
                </Link>
              </div>
              {quotes?.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No quotations yet</div>
              ) : (
                <div className="divide-y">
                  {quotes?.map((q: any) => (
                    <div key={q.id} className="grid grid-cols-12 items-center gap-4 px-5 py-3.5">
                      <div className="col-span-4">
                        <div className="font-medium text-sm">{q.vendor_name || q.vendors?.name || 'Vendor'}</div>
                        <div className="text-xs font-mono text-muted-foreground">{q.quote_number || q.id}</div>
                      </div>
                      <div className="col-span-2 text-sm tabular-nums font-medium">{fmtCurrency(q.total_amount)}</div>
                      <div className="col-span-2 text-sm text-muted-foreground">{q.delivery_days} days</div>
                      <div className="col-span-2 text-sm">
                        <span className="rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary">
                          AI {q.ai_score ? q.ai_score.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <div className="col-span-2 text-right"><StatusBadge status={q.status} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-display font-semibold mb-3">Timeline</h3>
              <ol className="space-y-3 text-sm">
                <TLEvent label="RFQ created" by="System" time={fmtRelative(rfq.created_at)} done />
                <TLEvent label="Quotations received" by={`${quotes?.length || 0} vendors`} time="ongoing" done={quotes?.length > 0} />
                <TLEvent label="Award decision" by="Pending" time="—" />
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary-soft flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
      <div>
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-display font-semibold">{value}</div>
      </div>
    </div>
  );
}
function TLEvent({ label, by, time, done }: { label: string; by: string; time: string; done?: boolean }) {
  return (
    <li className="flex gap-3">
      <div className={`mt-1 h-2.5 w-2.5 rounded-full ${done ? "bg-primary" : "bg-muted ring-2 ring-border"}`} />
      <div>
        <div className={done ? "font-medium" : "text-muted-foreground"}>{label}</div>
        <div className="text-xs text-muted-foreground">{by} · {time}</div>
      </div>
    </li>
  );
}
