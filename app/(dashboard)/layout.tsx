"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { CopilotPanel } from "@/components/ai/CopilotPanel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
      <CopilotPanel />
    </div>
  );
}
