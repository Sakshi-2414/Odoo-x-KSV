"use client";

import { TopBar } from "@/components/layout/TopBar";

export default function UsersPage() {
  return (
    <>
      <TopBar title="Users" subtitle="Manage organizational access" />
      <div className="p-6 max-w-[1600px] w-full flex items-center justify-center min-h-[500px]">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <h2 className="text-xl font-display font-semibold">User Management</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The user management console is currently in development.
          </p>
        </div>
      </div>
    </>
  );
}
