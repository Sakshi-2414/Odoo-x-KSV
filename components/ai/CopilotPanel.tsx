import { useState } from "react";
import { Sparkles, X, Send, FileText, BarChart3, Shield, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_REPLIES: Record<string, string> = {
  default:
    "I analyzed your procurement data. Based on category trends, vendor trust scores, and current quotations, here's what I recommend — would you like me to draft an RFQ or pull a comparison report?",
  rfq:
    "I'll create that RFQ for you. I've pre-filled the form with 100 laptops, $80,000 budget, and recommended 5 vendors with avg trust score 82. Review and publish when ready.",
  compare:
    "TechPro Supplies wins overall (AI score 87.4) — $76,500 at 14 days delivery, 91% on-time history. FastTech is fastest (10 days). GlobalSup is 7% over budget and trust score 58.",
  status:
    "12 RFQs active, 3 approvals pending. PO-2026-0018 is 3 days delayed — FastTech notified, expecting update by end of day.",
};

type Msg = { role: "user" | "ai"; text: string };

export function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "ai", text: "Hi Sarah — I'm your AI Procurement Officer. Ask me to create an RFQ, compare quotes, or surface risks." },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    const lower = text.toLowerCase();
    const reply =
      lower.includes("rfq") || lower.includes("create")
        ? SAMPLE_REPLIES.rfq
        : lower.includes("compare") || lower.includes("quote")
          ? SAMPLE_REPLIES.compare
          : lower.includes("status") || lower.includes("delay")
            ? SAMPLE_REPLIES.status
            : SAMPLE_REPLIES.default;
    setMessages((m) => [...m, { role: "user", text }, { role: "ai", text: reply }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-info px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 transition-transform",
          open && "hidden",
        )}
      >
        <Sparkles className="h-4 w-4" />
        Ask AI Copilot
      </button>

      {open && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-card border-l shadow-2xl flex flex-col animate-in slide-in-from-right">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-info flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold">VendorBridge AI</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Gemini 2.5 Flash · Online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2.5", m.role === "user" && "flex-row-reverse")}>
                <div
                  className={cn(
                    "h-7 w-7 shrink-0 rounded-full flex items-center justify-center",
                    m.role === "ai"
                      ? "bg-gradient-to-br from-primary to-info text-white"
                      : "bg-muted text-foreground",
                  )}
                >
                  {m.role === "ai" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%]",
                    m.role === "ai" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { icon: FileText, label: "Create RFQ" },
                { icon: BarChart3, label: "Compare Quotes" },
                { icon: Shield, label: "Check Risks" },
              ].map((q) => (
                <button
                  key={q.label}
                  onClick={() => send(q.label)}
                  className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs hover:bg-muted"
                >
                  <q.icon className="h-3 w-3" /> {q.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about procurement…"
                className="flex-1 rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary p-2.5 text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
