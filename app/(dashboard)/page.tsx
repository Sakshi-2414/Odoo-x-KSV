"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  FileText,
  CheckSquare,
  DollarSign,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  Star,
  ArrowRight,
  Loader2
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fmtCurrency, fmtRelative } from "@/utils/formatters";
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  const { metrics, activities, spendByMonth, aiRecs, riskAlerts } = data;

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
                <Sparkles className="h-3.5 w-3.5" /> AI Briefing · {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <h2 className="font-display text-2xl font-semibold">Good morning!</h2>
              <p className="text-sm text-white/90 max-w-2xl">
                You have <strong>{metrics.pendingApprovals} approvals</strong> waiting, and an active risk alert detected on a recent supply chain update.
              </p>
            </div>
            <Link href="/copilot"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/25 backdrop-blur transition-all"
            >
              Open AI Copilot <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Active RFQs" value={metrics.activeRfqs.toString()} hint="Live RFQs" icon={FileText} delta={{ value: "+1", up: true }} />
          <MetricCard label="Pending Approvals" value={metrics.pendingApprovals.toString()} hint="Action required" icon={CheckSquare} tone="warning" />
          <MetricCard label="Total Spend" value={fmtCurrency(metrics.totalSpend)} icon={DollarSign} delta={{ value: "+12% MoM", up: true }} />
          <MetricCard label="Risk Score" value={`${metrics.riskScore} / Low`} hint="Green status" icon={ShieldAlert} tone="success" />
        </div>

        {/* Trackers & Analytics */}
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
              <BarChart data={spendByMonth} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => `$${v}k`}
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
              {aiRecs.map((r: any, i: number) => (
                <li key={i} className="flex gap-3 rounded-lg p-3 hover:bg-muted/40">
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-primary-soft flex items-center justify-center">
                    {r.type === "award" ? <DollarSign className="h-3.5 w-3.5 text-success" /> : <AlertTriangle className="h-3.5 w-3.5 text-warning-foreground" />}
                  </div>
                  <div>
                    <strong className="text-sm">{r.title}</strong>
                    <p className="text-xs text-muted-foreground leading-snug">{r.reason}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card">
            <div className="p-5 border-b">
              <h3 className="font-display font-semibold">Vendor Risk Alerts</h3>
              <p className="text-xs text-muted-foreground">Live feed · most critical first</p>
            </div>
            <ul className="divide-y">
              {riskAlerts.map((r: any, i: number) => (
                <li key={i} className="flex gap-3 p-4">
                  <div className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${r.level === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning-foreground"}`}>
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{r.message}</div>
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
              {activities?.length > 0 ? activities.map((a: any) => (
                <li key={a.id} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/30">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="text-xs flex-1">
                    <div><strong className="text-foreground">{a.actor_name || 'System'}</strong> <span className="text-muted-foreground">{a.action} {a.entity_type}</span></div>
                    <div className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                </li>
              )) : (
                <div className="text-center p-4 text-sm text-muted-foreground">No recent activity</div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
