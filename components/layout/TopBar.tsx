import { Bell, Search, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function TopBar({ title, subtitle, action }: { title?: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur px-6">
      <div className="flex-1 min-w-0">
        {title && <h1 className="font-display text-lg font-semibold truncate">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>

      <div className="hidden md:flex relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          className="w-full rounded-lg border bg-secondary/50 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-background"
          placeholder="Search RFQs, vendors, POs…"
        />
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd>
      </div>

      {action ?? (
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/rfqs/create">
            <Plus className="h-4 w-4" /> New RFQ
          </Link>
        </Button>
      )}

      <button className="relative rounded-lg border p-2 hover:bg-muted transition-colors">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
      </button>
    </header>
  );
}
