"use client";

import { TopBar } from "@/components/layout/TopBar";
import { ACTIVITY } from "@/utils/mock-data";

export default function ActivityPage() {
  return (
    <>
      <TopBar title="Activity Log" subtitle="Recent actions and system events" />
      <div className="p-6 max-w-[1600px] w-full">
        <div className="rounded-2xl border bg-card">
          <ul className="divide-y">
            {ACTIVITY.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-4 hover:bg-muted/40 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{a.who}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
