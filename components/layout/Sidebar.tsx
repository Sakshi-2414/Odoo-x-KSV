import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  FileText,
  ClipboardList,
  CheckSquare,
  Receipt,
  Wallet,
  Sparkles,
  BarChart3,
  FileBarChart,
  Building2,
  Users,
  Settings,
  Boxes,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string; icon: React.ComponentType<{ className?: string }>; badge?: string };

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard },
      { label: "Activity", to: "/activity", icon: Activity },
    ],
  },
  {
    title: "Procurement",
    items: [
      { label: "RFQs", to: "/rfqs", icon: FileText, badge: "12" },
      { label: "Quotations", to: "/quotations", icon: ClipboardList },
      { label: "Approvals", to: "/approvals", icon: CheckSquare, badge: "3" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Purchase Orders", to: "/purchase-orders", icon: Receipt },
      { label: "Invoices", to: "/invoices", icon: Wallet },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Copilot", to: "/copilot", icon: Sparkles },
      { label: "Reports", to: "/reports", icon: BarChart3 },
      { label: "Analytics", to: "/analytics", icon: FileBarChart },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Vendors", to: "/vendors", icon: Building2 },
      { label: "Users", to: "/users", icon: Users },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/90">
          <Boxes className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold">VendorBridge</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-muted">AI Procurement</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((sec) => (
          <div key={sec.title}>
            <div className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
              {sec.title}
            </div>
            <ul className="space-y-0.5">
              {sec.items.map((it) => {
                const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
                const Icon = it.icon;
                return (
                  <li key={it.to}>
                    <Link
                      href={it.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-active text-white border-l-2 border-primary -ml-px pl-[9px]"
                          : "text-sidebar-muted hover:text-white hover:bg-white/5",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{it.label}</span>
                      {it.badge && (
                        <span className="rounded-full bg-primary/30 text-white text-[10px] px-1.5 py-0.5 font-medium">
                          {it.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5 group relative">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-xs font-semibold text-white">
            SC
          </div>
          <div className="leading-tight flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Sarah Chen</div>
            <div className="text-[11px] text-sidebar-muted truncate">Procurement Manager</div>
          </div>
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-md transition-opacity"
            title="Log out"
          >
            <LogOut className="h-4 w-4 text-sidebar-muted" />
          </button>
        </div>
      </div>
    </aside>
  );
}
