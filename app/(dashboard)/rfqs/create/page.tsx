"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2, Sparkles, Building2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { VENDORS } from "@/utils/mock-data";
import { TrustScoreGauge } from "@/components/vendors/TrustScoreGauge";
import { cn } from "@/lib/utils";



const STEPS = ["Details", "Items", "Vendors"] as const;

export default function CreateRFQ() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([{ name: "", qty: 1, unit: "units", specs: "" }]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>(VENDORS.slice(0, 3).map((v) => v.id));

  const toggleVendor = (id: string) =>
    setSelectedVendors((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <TopBar title="Create new RFQ" subtitle="3 steps · Auto-saved" action={<Button size="sm" variant="outline">Save draft</Button>} />

      <div className="p-6 max-w-4xl w-full space-y-6">
        <Link href="/rfqs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to RFQs
        </Link>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold border-2",
                  i < step && "bg-primary text-primary-foreground border-primary",
                  i === step && "border-primary text-primary",
                  i > step && "border-border text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <div className={cn("text-sm font-medium", i === step ? "text-foreground" : "text-muted-foreground")}>{label}</div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border ml-2" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-5">
          {step === 0 && (
            <>
              <h2 className="font-display text-lg font-semibold">RFQ Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Title">
                  <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g. 100 Dell Laptops" />
                </Field>
                <Field label="Category">
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>IT Equipment</option>
                    <option>Office Furniture</option>
                    <option>Datacenter</option>
                    <option>Office Supplies</option>
                  </select>
                </Field>
                <Field label="Budget (USD)">
                  <input type="number" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="80000" />
                </Field>
                <Field label="Priority">
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm">
                    <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                  </select>
                </Field>
                <Field label="Submission Deadline">
                  <input type="date" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </Field>
                <Field label="Expected Delivery">
                  <input type="date" className="w-full rounded-lg border bg-background px-3 py-2 text-sm" />
                </Field>
              </div>
              <Field label="Description">
                <textarea rows={4} className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Provide context for vendors…" />
              </Field>
              <div className="rounded-xl bg-primary-soft/60 border border-primary/20 p-4 flex gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong>AI suggestion:</strong> Based on your specs, similar RFQs averaged $75,000–$90,000. Your budget is well-positioned.
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Line Items</h2>
                <Button size="sm" variant="outline" onClick={() => setItems([...items, { name: "", qty: 1, unit: "units", specs: "" }])}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add item
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((it, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 rounded-xl border bg-background p-3">
                    <input placeholder="Item name" className="col-span-4 rounded-md border bg-card px-2.5 py-2 text-sm" />
                    <input type="number" placeholder="Qty" className="col-span-2 rounded-md border bg-card px-2.5 py-2 text-sm" />
                    <input placeholder="Unit" className="col-span-2 rounded-md border bg-card px-2.5 py-2 text-sm" />
                    <input placeholder="Specifications" className="col-span-3 rounded-md border bg-card px-2.5 py-2 text-sm" />
                    <button
                      onClick={() => setItems(items.filter((_, x) => x !== i))}
                      className="col-span-1 rounded-md border bg-card hover:bg-destructive/10 hover:text-destructive flex items-center justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI-recommended vendors
              </h2>
              <p className="text-sm text-muted-foreground -mt-3">Top vendors matched by category and trust score</p>
              <div className="space-y-2">
                {VENDORS.map((v) => {
                  const sel = selectedVendors.includes(v.id);
                  return (
                    <button
                      key={v.id}
                      onClick={() => toggleVendor(v.id)}
                      className={cn(
                        "w-full flex items-center gap-4 rounded-xl border p-3 text-left transition-all",
                        sel ? "border-primary bg-primary-soft/50" : "bg-background hover:border-primary/30",
                      )}
                    >
                      <div
                        className={cn(
                          "h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0",
                          sel ? "bg-primary border-primary" : "border-border",
                        )}
                      >
                        {sel && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{v.name}</div>
                        <div className="text-xs text-muted-foreground">{v.category.join(", ")} · {v.country}</div>
                      </div>
                      <TrustScoreGauge score={v.trust_score} size="sm" />
                    </button>
                  );
                })}
              </div>
              <div className="rounded-xl border-2 border-dashed p-4 text-sm text-muted-foreground text-center">
                {selectedVendors.length} vendors selected · invitation emails will be sent on publish
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={() => nav({ to: "/rfqs" })} className="gap-1.5">
                <Check className="h-4 w-4" /> Publish RFQ
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
