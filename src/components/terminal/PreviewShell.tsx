"use client";

import { useEffect, useState } from "react";
import { TerminalShell } from "@/components/terminal/TerminalShell";
import {
  MOCK_ANALYSES,
  MOCK_SIGNALS,
} from "@/lib/preview/mock-data";
import { loadSettings } from "@/lib/ui/settings-store";
import type { ShellStats } from "@/components/terminal/ui";

function previewStats(): ShellStats {
  const spend = MOCK_ANALYSES.reduce((s, a) => s + Number(a.spend_usd), 0);
  const budget = MOCK_ANALYSES.reduce((s, a) => s + Number(a.budget_cap_usd), 0);
  return {
    watches: MOCK_ANALYSES.length,
    live: MOCK_ANALYSES.filter((a) => a.status === "live").length,
    signals: MOCK_SIGNALS.length,
    spend,
    budget,
  };
}

export function PreviewShell({ children }: { children: React.ReactNode }) {
  const [userLabel, setUserLabel] = useState("Preview mode");

  useEffect(() => {
    const s = loadSettings("demo@vigilant.app");
    setUserLabel(s.profile.name);
  }, []);

  return (
    <TerminalShell
      basePath="/preview"
      userLabel={userLabel}
      footerNote="mock data · no backend"
      stats={previewStats()}
      demo
    >
      {children}
    </TerminalShell>
  );
}
