"use client";

import Link from "next/link";

import { useState } from "react";
import { Search, Plus, MapPin, Mail, Award } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { TrustScoreGauge } from "@/components/vendors/TrustScoreGauge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { trustTier, fmtDate } from "@/utils/formatters";
import { cn } from "@/lib/utils";



const TIERS = ["All", "Elite", "Trusted", "Good", "Average", "Review", "High Risk"] as const;

export default function VendorsPage() {
  const [tier, setTier] = useState<(typeof TIERS)[number]>("All");
  const [q, setQ] = useState("");

  const { data: VENDORS = [], isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await fetch("/api/vendors");
      if (!res.ok) throw new Error("Failed to fetch Vendors");
      return res.json();
    },
  });

  const filtered = VENDORS.filter((v: any) => {
    const t = trustTier(v.trust_score).label;
    const matchTier = tier === "All" || t === tier;
    const matchQ = !q || v.name.toLowerCase().includes(q.toLowerCase()) || (v.category && v.category.some((c: string) => c.toLowerCase().includes(q.toLowerCase())));
    return matchTier && matchQ;
  });

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Loading Vendors...</div>;
  if (error) return <div className="p-10 text-center text-destructive">Error loading Vendors</div>;

  return (
    <>
      <TopBar
        title="Vendors"
        subtitle={`${VENDORS.length} vendors · ${VENDORS.filter((v) => v.trust_score >= 70).length} trusted+`}
        action={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add vendor</Button>}
      />

      <div className="p-6 space-y-5 max-w-[1600px] w-full">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search vendor or category…"
              className="w-full rounded-lg border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TIERS.map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  tier === t ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((v) => {
            const t = trustTier(v.trust_score);
            return (
              <Link key={v.id}
                href={`/vendors/${v.id}`}
                className="group rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display font-semibold truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {v.country}
                    </div>
                  </div>
                  <TrustScoreGauge score={v.trust_score} size="md" />
                </div>
                <div className="mt-4 flex flex-wrap gap-1">
                  {v.category.map((c) => (
                    <span key={c} className="text-[10px] font-medium rounded-full bg-muted px-2 py-0.5">
                      {c}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-sm font-semibold tabular-nums">{v.total_orders}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Orders</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold tabular-nums">{v.on_time}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">On time</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold tabular-nums">{v.win_rate}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Win rate</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {v.email}</span>
                </div>
                <div className={cn("mt-3 -mx-5 -mb-5 rounded-b-2xl px-5 py-2 text-[11px] font-semibold flex items-center gap-1.5", t.bg, t.color)}>
                  <Award className="h-3 w-3" /> {t.label} · Last order {fmtDate(v.last_order)}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
