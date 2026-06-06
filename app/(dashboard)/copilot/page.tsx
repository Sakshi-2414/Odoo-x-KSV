"use client";

import { TopBar } from "@/components/layout/TopBar";

export default function CopilotPage() {
  return (
    <>
      <TopBar title="AI Copilot" subtitle="Your intelligent procurement assistant" />
      <div className="p-6 max-w-[1600px] w-full flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-xl font-display font-semibold">AI Copilot</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The standalone AI Copilot interface is currently under construction. You can still use the Copilot panel from the dashboard!
          </p>
        </div>
      </div>
    </>
  );
}
