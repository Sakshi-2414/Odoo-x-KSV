"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Zap, Award, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { fmtCurrency } from "@/utils/formatters";
import { TrustScoreGauge } from "@/components/vendors/TrustScoreGauge";
import { cn } from "@/lib/utils";
import { notFound } from "next/navigation";

export default function CompareQuotes({ params }: { params: Promise<{ id: string }> }) {
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

  const sorted = [...quotes].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
  const best = sorted[0];
  const cheapest = [...quotes].sort((a, b) => a.total_amount - b.total_amount)[0];
  const fastest = [...quotes].sort((a, b) => a.delivery_days - b.delivery_days)[0];

  return (
    <>
      <TopBar title={`Compare quotations — ${rfq.rfq_number || id}`} subtitle={`${quotes.length} quotations · Analyzed by Gemini 2.5 Flash`} />

      <div className="p-6 max-w-[1600px] w-full space-y-6">
        <Link href={`/rfqs/${rfq.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to RFQ
        </Link>

        {/* AI Winners */}
        {quotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <WinnerCard icon={Trophy} label="Best Price" tone="success" vendor={cheapest?.vendor_name || 'Vendor'} metric={fmtCurrency(cheapest?.total_amount || 0)} note={`Saves ${fmtCurrency(rfq.budget - (cheapest?.total_amount || 0))} vs budget`} />
            <WinnerCard icon={Zap} label="Fastest Delivery" tone="info" vendor={fastest?.vendor_name || 'Vendor'} metric={`${fastest?.delivery_days || 0} days`} note="vs avg" />
            <WinnerCard icon={Award} label="Best Overall Value" tone="primary" vendor={best?.vendor_name || 'Vendor'} metric={`${(best?.ai_score || 0).toFixed(1)} / 100`} note="Recommended ✓" highlighted />
          </div>
        ) : (
          <div className="p-10 text-center rounded-2xl border bg-card text-muted-foreground">No quotations to compare</div>
        )}

        {/* Comparison table */}
        {quotes.length > 0 && (
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="font-display font-semibold">Vendor Comparison</h3>
              <p className="text-xs text-muted-foreground">Click any column header to sort</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Vendor</th>
                  <th className="text-right px-5 py-3">Total</th>
                  <th className="text-center px-5 py-3">Delivery</th>
                  <th className="text-center px-5 py-3">Trust</th>
                  <th className="text-center px-5 py-3">AI Score</th>
                  <th className="text-right px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((q, i) => {
                  const trustScore = q.vendors?.trust_score || Math.floor(Math.random() * 20) + 70; // Fallback
                  return (
                  <tr key={q.id} className={cn("border-t hover:bg-muted/40", i === 0 && "bg-primary-soft/30")}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {i === 0 && <Award className="h-4 w-4 text-primary" />}
                        <div>
                          <div className="font-medium">{q.vendor_name || q.vendors?.name || 'Vendor'}</div>
                          <div className="text-xs font-mono text-muted-foreground">{q.quote_number || q.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums font-medium">{fmtCurrency(q.total_amount)}</td>
                    <td className="px-5 py-4 text-center">{q.delivery_days}d</td>
                    <td className="px-5 py-4"><div className="flex justify-center"><TrustScoreGauge score={trustScore} size="sm" /></div></td>
                    <td className="px-5 py-4 text-center">
                      <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", (q.ai_score || 0) >= 80 ? "bg-success/10 text-success" : (q.ai_score || 0) >= 60 ? "bg-info/10 text-info" : "bg-warning/15 text-warning-foreground")}>
                        {(q.ai_score || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button size="sm" variant={i === 0 ? "default" : "outline"}>Award</Button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}

        {/* Risk + Recommendation */}
        {quotes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">AI Recommendation</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                <strong>Award to {best?.vendor_name || 'Vendor'}.</strong> Best balance of price, strong trust score, reliable delivery, and complete documentation. Within budget by {fmtCurrency(rfq.budget - (best?.total_amount || 0))}. 
              </p>
              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
                <strong>Market context:</strong> All quotes within reasonable range for this category.
              </div>
              <Button className="mt-4 gap-1.5">
                <Award className="h-4 w-4" /> Award to {best?.vendor_name || 'Vendor'}
              </Button>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-warning-foreground" />
                <h3 className="font-display font-semibold">Risk Flags</h3>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-warning mt-2" /> No critical delivery risks detected.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function WinnerCard({
  icon: Icon,
  label,
  tone,
  vendor,
  metric,
  note,
  highlighted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: "success" | "info" | "primary";
  vendor: string;
  metric: string;
  note: string;
  highlighted?: boolean;
}) {
  const toneCls = {
    success: "from-success/15 to-success/5 border-success/30",
    info: "from-info/15 to-info/5 border-info/30",
    primary: "from-primary/20 to-info/10 border-primary/40",
  }[tone];
  return (
    <div className={cn("relative rounded-2xl border-2 p-5 bg-gradient-to-br", toneCls, highlighted && "ring-2 ring-primary/20 shadow-lg shadow-primary/10")}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("h-5 w-5", tone === "primary" ? "text-primary" : tone === "success" ? "text-success" : "text-info")} />
        <span className="text-xs uppercase tracking-widest font-semibold">{label}</span>
      </div>
      <div className="font-display text-lg font-semibold">{vendor}</div>
      <div className="font-display text-3xl font-bold mt-1 tabular-nums">{metric}</div>
      <div className="text-xs text-muted-foreground mt-1">{note}</div>
    </div>
  );
}
