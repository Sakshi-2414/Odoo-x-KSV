"use client";

import { TopBar } from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { fmtRelative } from "@/utils/formatters";

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/activities");
        if (res.ok) setActivities(await res.json());
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

  return (
    <>
      <TopBar title="Activity Log" subtitle="Recent actions and system events" />
      <div className="p-6 max-w-[1600px] w-full">
        <div className="rounded-2xl border bg-card">
          {activities.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">No recent activity</div>
          ) : (
            <ul className="divide-y">
              {activities.map((a) => (
                <li key={a.id} className="flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{a.who || a.user_id || 'System'}</span>{" "}
                      <span className="text-muted-foreground">{a.action || a.title}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{a.time || fmtRelative(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
