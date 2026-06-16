"use client";

import { TerminalShell } from "@/components/terminal/TerminalShell";
import { signOut } from "@/app/actions/analysis";
import type { ShellStats } from "@/components/terminal/ui";

export function AppShell({
  userEmail,
  stats,
  children,
}: {
  userEmail?: string;
  stats: ShellStats;
  children: React.ReactNode;
}) {
  return (
    <TerminalShell
      basePath="/app"
      userLabel={userEmail ?? "Signed in"}
      stats={stats}
      footerAction={
        <form action={signOut}>
          <button
            type="submit"
            className="text-[10px] text-faint hover:text-fg bg-transparent border-none cursor-pointer font-mono p-0"
          >
            sign out
          </button>
        </form>
      }
    >
      {children}
    </TerminalShell>
  );
}
