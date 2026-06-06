"use client";

import Link from "next/link";

import {
  FileText,
  CheckSquare,
  DollarSign,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Star,
  ArrowRight,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmtCurrency, fmtRelative } from "@/utils/formatters";
import {
  RFQS,
  APPROVALS,
  SPEND_BY_MONTH,
  RISK_ALERTS,
  AI_RECS,
  ACTIVITY,
} from "@/utils/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";



export default function Dashboard() {
  return (
    <>
      <TopBar title="Command Center" subtitle="Live procurement operations" />

      <div className="p-6 space-y-6 max-w-[1600px] w-full">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-info p-6 text-primary-foreground">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-6 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/70">
                <Sparkles className="h-3.5 w-3.5" /> AI Briefing · 8:42 AM
              </div>
              <h2 className="font-display text-2xl font-semibold">Good morning, Sarah.</h2>
              <p className="text-sm text-white/90 max-w-2xl">
                You have <strong>3 approvals</strong> waiting (1 overdue), 2 active risks on FastTech deliveries, and TechPro Supplies is recommended for RFQ-2026-0042 with confidence 87.4.
              </p>
            </div>
            <Link href="/copilot"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25 backdrop-blur"
            >
              Open AI Copilot <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Active RFQs" value="12" hint="+3 this week" icon={FileText} delta={{ value: "+25%", up: true }} />
          <MetricCard label="Pending Approvals" value="3" hint="1 overdue" icon={CheckSquare} tone="warning" />
          <MetricCard label="Month Spend" value={fmtCurrency(248400)} icon={DollarSign} delta={{ value: "+12% MoM", up: true }} />
          <MetricCard label="Risk Score" value="24 / Low" hint="Green status" icon={ShieldAlert} tone="success" />
        </div>

        {/* Trackers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-display font-semibold">Live RFQ Tracker</h3>
                <p className="text-xs text-muted-foreground">Quotation progress in real time</p>
              </div>
              <Link href="/rfqs" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="divide-y">
              {RFQS.slice(0, 5).map((rfq) => {
                const progress = Math.round((rfq.quotes_received / Math.max(rfq.vendors_invited, 1)) * 100);
                return (
                  <Link key={rfq.id}
                    href={`/rfqs/${rfq.id}`}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                  >
                    <div className="col-span-5 min-w-0">
                      <div className="text-sm font-medium truncate">{rfq.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">{rfq.rfq_number}</div>
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary to-info" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">
                          {rfq.quotes_received}/{rfq.vendors_invited}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2"><StatusBadge status={rfq.status} /></div>
                    <div className="col-span-1 text-right text-sm font-medium tabular-nums">{fmtCurrency(rfq.budget)}</div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-display font-semibold">Pending Approvals</h3>
                <p className="text-xs text-muted-foreground">Sorted by urgency</p>
              </div>
              <Link href="/approvals" className="text-xs text-primary hover:underline">View all →</Link>
            </div>
            <div className="divide-y">
              {APPROVALS.map((a) => (
                <Link
                  key={a.id}
                  href="/approvals"
                  className="block px-5 py-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{a.entity_ref}</span>
                    <StatusBadge status={a.priority} />
                  </div>
                  <div className="text-sm font-medium truncate">{a.title}</div>
                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium tabular-nums">{fmtCurrency(a.amount)}</span>
                    <span className="text-muted-foreground">{fmtRelative(a.submitted_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics + AI Recs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold">Spend Analytics</h3>
                <p className="text-xs text-muted-foreground">6-month spend by category</p>
              </div>
              <Link href="/reports" className="text-xs text-primary hover:underline">Full report →</Link>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={SPEND_BY_MONTH} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="IT" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Office" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Datacenter" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="p-5 border-b flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold">AI Recommendations</h3>
            </div>
            <ul className="p-3 space-y-1">
              {AI_RECS.map((r) => (
                <li key={r.id} className="flex gap-3 rounded-lg p-3 hover:bg-muted/40">
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-primary-soft flex items-center justify-center">
                    {r.icon === "star" && <Star className="h-3.5 w-3.5 text-primary" />}
                    {r.icon === "alert" && <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground" />}
                    {r.icon === "dollar" && <DollarSign className="h-3.5 w-3.5 text-success" />}
                  </div>
                  <p className="text-sm leading-snug">{r.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card">
            <div className="p-5 border-b">
              <h3 className="font-display font-semibold">Vendor Risk Alerts</h3>
              <p className="text-xs text-muted-foreground">Live feed · most critical first</p>
            </div>
            <ul className="divide-y">
              {RISK_ALERTS.map((r) => (
                <li key={r.id} className="flex gap-3 p-4">
                  <div
                    className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${
                      r.severity === "critical"
                        ? "bg-destructive/10 text-destructive"
                        : r.severity === "high"
                          ? "bg-warning/15 text-warning-foreground"
                          : "bg-info/10 text-info"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{r.title}</div>
                      <span className="text-xs text-muted-foreground">{r.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="p-5 border-b">
              <h3 className="font-display font-semibold">Recent Activity</h3>
            </div>
            <ul className="p-3 space-y-1">
              {ACTIVITY.map((a) => (
                <li key={a.id} className="flex items-start gap-3 rounded-lg p-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="text-xs flex-1">
                    <div><strong className="text-foreground">{a.who}</strong> <span className="text-muted-foreground">{a.action}</span></div>
                    <div className="text-muted-foreground">{a.time}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
