"use client";


import { useState, useEffect } from "react";
import { Download, Share2, Calendar, Sparkles, Loader2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { fmtCurrency } from "@/utils/formatters";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { cn } from "@/lib/utils";

const TABS = ["Spend Overview", "Vendor Performance", "Efficiency", "AI Insights"] as const;

export default function ReportsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Spend Overview");
  const [data, setData] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [dashRes, vendorRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/vendors")
        ]);
        if (dashRes.ok) setData(await dashRes.json());
        if (vendorRes.ok) setVendors(await vendorRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];
  const pie = [
    { name: "IT Equipment", value: 312000 },
    { name: "Office", value: 142000 },
    { name: "Datacenter", value: 189000 },
    { name: "Logistics", value: 78000 },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <TopBar
        title="Reports & Analytics"
        subtitle="Procurement intelligence · Jan – Jun 2026"
        action={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5"><Calendar className="h-4 w-4" /> Date range</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><Share2 className="h-4 w-4" /> Share</Button>
            <Button size="sm" className="gap-1.5"><Download className="h-4 w-4" /> Export</Button>
          </div>
        }
      />

      <div className="p-6 max-w-[1600px] w-full space-y-6">
        <div className="flex flex-wrap gap-1.5 border-b">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Spend Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
              <h3 className="font-display font-semibold mb-1">Monthly Spend by Category</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data?.spendByMonth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} formatter={(v: number) => fmtCurrency(v)} />
                  <Legend />
                  <Bar dataKey="IT" stackId="a" fill="var(--color-chart-1)" />
                  <Bar dataKey="Office" stackId="a" fill="var(--color-chart-2)" />
                  <Bar dataKey="Datacenter" stackId="a" fill="var(--color-chart-4)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-display font-semibold mb-1">Spend by Category</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "Vendor Performance" && (
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-display font-semibold mb-3">Top Vendors by Trust Score</h3>
            <div className="space-y-2.5">
              {vendors.sort((a, b) => b.trust_score - a.trust_score).slice(0, 10).map((v) => (
                <div key={v.id} className="flex items-center gap-3">
                  <div className="w-40 text-sm truncate">{v.name}</div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-info" style={{ width: `${v.trust_score}%` }} />
                  </div>
                  <div className="w-12 text-right tabular-nums text-sm font-medium">{v.trust_score}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Efficiency" && (
          <div className="rounded-2xl border bg-card p-5">
            <h3 className="font-display font-semibold mb-1">RFQ-to-PO Cycle Time</h3>
            <p className="text-xs text-muted-foreground mb-3">Days to convert an RFQ into an issued PO</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { m: "Jan", days: 22 }, { m: "Feb", days: 18 }, { m: "Mar", days: 14 },
                { m: "Apr", days: 11 }, { m: "May", days: 9 }, { m: "Jun", days: 7 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} unit="d" />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="days" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {tab === "AI Insights" && (
          <div className="rounded-2xl border bg-gradient-to-br from-primary-soft/40 to-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold">Executive Summary — June 2026</h3>
            </div>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>Procurement activity is up <strong>14%</strong> month-over-month, driven by IT equipment refresh and datacenter expansion. AI-driven vendor selection saved an estimated <strong>$31,200 (12.4%)</strong> vs benchmark pricing.</p>
              <p>Cycle time improved from 22 days (Jan) to <strong>7 days (Jun)</strong> — a 68% reduction directly tied to one-click PO generation and AI-assisted approvals.</p>
              <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                <li><strong>Recommendation:</strong> Consolidate Office supplies — top 3 vendors handle 89% of spend. Renegotiate paper contract for Q3.</li>
                <li><strong>Risk:</strong> FastTech Corp on-time rate dropped from 91% to 84% — monitor over next 4 POs.</li>
                <li><strong>Opportunity:</strong> Cloud9 Networks has Elite trust score (90) — expand allocation by 20%.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
