import Link from "next/link";

import { ArrowLeft, Mail, Phone, MapPin, Edit, Ban } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { TrustScoreGauge } from "@/components/vendors/TrustScoreGauge";
import { Button } from "@/components/ui/button";
import { VENDORS, POS } from "@/utils/mock-data";
import { fmtCurrency, fmtDate, trustTier } from "@/utils/formatters";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";


import { notFound } from "next/navigation";
import React from "react";

export default function VendorDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const vendor = VENDORS.find((v) => v.id === id);
  if (!vendor) notFound();
  const v = vendor;
  const tier = trustTier(v.trust_score);
  const orders = POS.filter((p) => p.vendor_name === v.name);

  const breakdown = [
    { sig: "Price", value: 78 },
    { sig: "Delivery", value: v.on_time },
    { sig: "Response", value: Math.max(0, 100 - v.avg_response_days * 12) },
    { sig: "Win Rate", value: v.win_rate * 2.2 },
    { sig: "Dispute-Free", value: v.dispute_free },
  ];

  return (
    <>
      <TopBar title={v.name} subtitle={`${v.contact} · ${v.country}`} />
      <div className="p-6 max-w-[1600px] w-full space-y-6">
        <Link href="/vendors" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to vendors
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border bg-card p-6 text-center">
              <TrustScoreGauge score={v.trust_score} size="lg" />
              <div className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${tier.bg} ${tier.color}`}>
                {tier.label} Vendor
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                <Stat label="Total orders" value={String(v.total_orders)} />
                <Stat label="On-time" value={`${v.on_time}%`} />
                <Stat label="Avg response" value={`${v.avg_response_days}d`} />
                <Stat label="Win rate" value={`${v.win_rate}%`} />
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 space-y-3">
              <h3 className="font-display font-semibold">Contact</h3>
              <Row icon={Mail} text={v.email} />
              <Row icon={Phone} text="+1 (555) 240-9821" />
              <Row icon={MapPin} text={v.country} />
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1"><Edit className="h-3.5 w-3.5 mr-1.5" /> Edit</Button>
                <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive"><Ban className="h-3.5 w-3.5 mr-1.5" /> Blacklist</Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-display font-semibold mb-1">Trust Score Breakdown</h3>
              <p className="text-xs text-muted-foreground mb-4">5-signal composite score</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={breakdown}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="sig" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-2xl border bg-card">
              <div className="p-5 border-b">
                <h3 className="font-display font-semibold">Order History</h3>
              </div>
              {orders.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">No orders yet</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr className="border-b">
                      <th className="text-left px-5 py-3">PO</th>
                      <th className="text-left px-5 py-3">Issued</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-right px-5 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-5 py-3 font-mono text-xs">{o.po_number}</td>
                        <td className="px-5 py-3 text-muted-foreground">{fmtDate(o.issued_at)}</td>
                        <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-5 py-3 text-right font-medium tabular-nums">{fmtCurrency(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold font-display tabular-nums">{value}</div>
    </div>
  );
}
function Row({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="truncate">{text}</span>
    </div>
  );
}
