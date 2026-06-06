import Link from "next/link";

import { ArrowLeft, Trophy, Zap, Award, AlertTriangle, Sparkles } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { RFQS, QUOTATIONS } from "@/utils/mock-data";
import { fmtCurrency } from "@/utils/formatters";
import { TrustScoreGauge } from "@/components/vendors/TrustScoreGauge";
import { cn } from "@/lib/utils";



import { notFound } from "next/navigation";
import React from "react";

export default function CompareQuotes({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const rfq = RFQS.find((r) => r.id === id);
  if (!rfq) notFound();
  const quotes = QUOTATIONS.filter((q) => q.rfq_id === id);
  const sorted = [...quotes].sort((a, b) => b.ai_score - a.ai_score);
  const best = sorted[0];
  const cheapest = [...quotes].sort((a, b) => a.total - b.total)[0];
  const fastest = [...quotes].sort((a, b) => a.delivery_days - b.delivery_days)[0];

  return (
    <>
      <TopBar title={`Compare quotations — ${rfq.rfq_number}`} subtitle={`${quotes.length} quotations · Analyzed by Gemini 2.5 Flash`} />

      <div className="p-6 max-w-[1600px] w-full space-y-6">
        <Link href={`/rfqs/${rfq.id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to RFQ
        </Link>

        {/* AI Winners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WinnerCard icon={Trophy} label="Best Price" tone="success" vendor={cheapest.vendor_name} metric={fmtCurrency(cheapest.total)} note={`Saves ${fmtCurrency(rfq.budget - cheapest.total)} vs budget`} />
          <WinnerCard icon={Zap} label="Fastest Delivery" tone="info" vendor={fastest.vendor_name} metric={`${fastest.delivery_days} days`} note="vs 18d category avg" />
          <WinnerCard icon={Award} label="Best Overall Value" tone="primary" vendor={best.vendor_name} metric={`${best.ai_score.toFixed(1)} / 100`} note="Recommended ✓" highlighted />
        </div>

        {/* Comparison table */}
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
                <th className="text-right px-5 py-3">Unit Price</th>
                <th className="text-center px-5 py-3">Delivery</th>
                <th className="text-center px-5 py-3">Payment</th>
                <th className="text-center px-5 py-3">Trust</th>
                <th className="text-center px-5 py-3">AI Score</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((q, i) => (
                <tr key={q.id} className={cn("border-t hover:bg-muted/40", i === 0 && "bg-primary-soft/30")}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {i === 0 && <Award className="h-4 w-4 text-primary" />}
                      <div>
                        <div className="font-medium">{q.vendor_name}</div>
                        <div className="text-xs font-mono text-muted-foreground">{q.quote_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums font-medium">{fmtCurrency(q.total)}</td>
                  <td className="px-5 py-4 text-right tabular-nums text-muted-foreground">${q.unit_price}</td>
                  <td className="px-5 py-4 text-center">{q.delivery_days}d</td>
                  <td className="px-5 py-4 text-center text-muted-foreground">{q.payment_terms}</td>
                  <td className="px-5 py-4"><div className="flex justify-center"><TrustScoreGauge score={q.trust_score} size="sm" /></div></td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn("rounded-md px-2 py-1 text-xs font-semibold", q.ai_score >= 80 ? "bg-success/10 text-success" : q.ai_score >= 60 ? "bg-info/10 text-info" : "bg-warning/15 text-warning-foreground")}>
                      {q.ai_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button size="sm" variant={i === 0 ? "default" : "outline"}>Award</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk + Recommendation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold">AI Recommendation</h3>
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">
              <strong>Award to TechPro Supplies.</strong> Best balance of price ($765/unit), strong trust score (87), reliable delivery (91% on-time), and complete documentation. Within budget by $3,500. FastTech is 10% faster but trust score is 13 pts lower. GlobalSup is $5,500 over the best price with the weakest delivery history.
            </p>
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
              <strong>Market context:</strong> Average laptop procurement in this spec range: $790–$840/unit. All quotes within reasonable range.
            </div>
            <Button className="mt-4 gap-1.5">
              <Award className="h-4 w-4" /> Award to TechPro Supplies
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning-foreground" />
              <h3 className="font-display font-semibold">Risk Flags</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-warning mt-2" /> NewVendor Inc — first-time vendor, no delivery history</li>
              <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-warning mt-2" /> GlobalSup Industries — trust score (58) below trusted threshold</li>
              <li className="flex gap-2"><div className="h-1.5 w-1.5 rounded-full bg-info mt-2" /> Quote variance: $73,900 – $82,000 (10% spread)</li>
            </ul>
          </div>
        </div>
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
