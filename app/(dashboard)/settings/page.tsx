"use client";


import { useState } from "react";
import { Building, Users, Bell, Mail, Key, CreditCard, Workflow } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";



const TABS = [
  { id: "org", label: "Organization", icon: Building },
  { id: "users", label: "Users & Roles", icon: Users },
  { id: "workflow", label: "Approval Workflow", icon: Workflow },
  { id: "email", label: "Email Templates", icon: Mail },
  { id: "notifs", label: "Notifications", icon: Bell },
  { id: "api", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("org");

  return (
    <>
      <TopBar title="Settings" subtitle="Org configuration" />
      <div className="p-6 max-w-[1600px] w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <nav className="lg:col-span-1 space-y-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  tab === t.id ? "bg-primary-soft text-primary font-medium" : "hover:bg-muted",
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </nav>

          <div className="lg:col-span-4 rounded-2xl border bg-card p-6">
            {tab === "org" && (
              <div className="space-y-5">
                <h2 className="font-display text-lg font-semibold">Organization profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Organization name" value="Acme Corporation" />
                  <Field label="Slug" value="acme-corp" />
                  <Field label="Plan" value="Enterprise" />
                  <Field label="Country" value="United States" />
                </div>
                <div className="flex justify-end pt-4 border-t"><Button>Save changes</Button></div>
              </div>
            )}
            {tab === "users" && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-semibold">Users & Roles</h2>
                <div className="rounded-xl border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <tr><th className="text-left px-4 py-2.5">User</th><th className="text-left px-4 py-2.5">Email</th><th className="text-left px-4 py-2.5">Role</th><th className="text-left px-4 py-2.5">Department</th></tr>
                    </thead>
                    <tbody>
                      {[
                        ["Sarah Chen", "sarah@acme.com", "Manager", "Procurement"],
                        ["Daniel Park", "daniel@acme.com", "Officer", "IT"],
                        ["Lisa Wong", "lisa@acme.com", "Officer", "Operations"],
                        ["Mike Rivera", "mike@acme.com", "Admin", "Finance"],
                      ].map((row) => (
                        <tr key={row[1]} className="border-t">
                          <td className="px-4 py-3 font-medium">{row[0]}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                          <td className="px-4 py-3"><span className="rounded-full bg-primary-soft text-primary text-xs font-medium px-2 py-0.5">{row[2]}</span></td>
                          <td className="px-4 py-3 text-muted-foreground">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {tab === "workflow" && (
              <div className="space-y-4">
                <h2 className="font-display text-lg font-semibold">Approval Workflow</h2>
                <p className="text-sm text-muted-foreground">Define approval chains based on amount thresholds.</p>
                <div className="space-y-3">
                  {[
                    { range: "$0 – $5,000", chain: "Officer → Auto-approve" },
                    { range: "$5,000 – $50,000", chain: "Officer → Manager" },
                    { range: "$50,000 – $250,000", chain: "Officer → Manager → Director" },
                    { range: "$250,000+", chain: "Officer → Manager → Director → CFO" },
                  ].map((r) => (
                    <div key={r.range} className="rounded-xl border bg-background p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{r.range}</div>
                        <div className="text-xs text-muted-foreground">{r.chain}</div>
                      </div>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(tab === "email" || tab === "notifs" || tab === "api" || tab === "billing") && (
              <div className="space-y-3">
                <h2 className="font-display text-lg font-semibold capitalize">{TABS.find((t) => t.id === tab)!.label}</h2>
                <p className="text-sm text-muted-foreground">Configuration options for {TABS.find((t) => t.id === tab)!.label.toLowerCase()}.</p>
                <div className="rounded-xl border-2 border-dashed p-10 text-center text-sm text-muted-foreground">
                  Section content placeholder
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      <input defaultValue={value} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
    </label>
  );
}
