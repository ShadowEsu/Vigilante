import type { Analysis, Brief, Signal } from "@/types/database";
import { TerminalPanel } from "./TerminalPanel";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { AgentsPanel } from "@/components/AgentsPanel";
import { SignalsPanel } from "@/components/SignalsPanel";
import { BriefPanel } from "@/components/BriefPanel";
import { DashboardAlertsSync } from "@/components/notifications/DashboardAlertsSync";

interface DashboardViewProps {
  analyses: Analysis[];
  signals: Signal[];
  latestBrief: Brief | null;
  analysisNames: Map<string, string>;
}

export function DashboardView({
  analyses,
  signals,
  latestBrief,
  analysisNames,
}: DashboardViewProps) {
  const totalSpend = analyses.reduce((s, a) => s + Number(a.spend_usd), 0);
  const totalBudget = analyses.reduce((s, a) => s + Number(a.budget_cap_usd), 0);
  const liveCount = analyses.filter((a) => a.status === "live").length;

  return (
    <>
      <DashboardAlertsSync signals={signals} analysisNames={analysisNames} />
      <div
        className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2"
        style={{ gridTemplateRows: "1fr 1fr", gridTemplateColumns: "1fr 1fr" }}
      >
        <TerminalPanel className="border-r border-b border-edge">
          <AnalyticsPanel
            signals={signals}
            liveAgents={liveCount}
            totalAgents={analyses.length}
            totalSpend={totalSpend}
            totalBudget={totalBudget}
            overview
          />
        </TerminalPanel>

        <TerminalPanel className="border-b border-edge">
          <AgentsPanel analyses={analyses} overview />
        </TerminalPanel>

        <TerminalPanel className="border-r border-edge">
          <SignalsPanel signals={signals} analysisNames={analysisNames} overview />
        </TerminalPanel>

        <TerminalPanel>
          <BriefPanel brief={latestBrief} overview />
        </TerminalPanel>
      </div>
    </>
  );
}
