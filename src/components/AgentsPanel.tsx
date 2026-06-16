import type { Analysis } from "@/types/database";
import { SectionHeader } from "@/components/terminal/ui";
import { meter } from "@/lib/ui/ascii";
import { LIVE_COLOR, typeColor } from "@/lib/ui/type-colors";
import { RunNowButton } from "./RunNowButton";

interface AgentsPanelProps {
  analyses: Analysis[];
  overview?: boolean;
  sectionNum?: string;
}

export function AgentsPanel({
  analyses,
  overview = false,
  sectionNum = "02",
}: AgentsPanelProps) {
  const live = analyses.filter((a) => a.status === "live").length;
  const shown = overview ? analyses : analyses;

  return (
    <>
      <SectionHeader
        num={sectionNum}
        title="WATCHLISTS"
        right={`${live} LIVE`}
      />
      {!shown.length ? (
        <p className="text-xs text-muted">No watchlists.</p>
      ) : (
        <div className="mt-1">
          {shown.map((analysis) => {
            const spend = Number(analysis.spend_usd);
            const budget = Number(analysis.budget_cap_usd);
            const pct = budget > 0 ? (spend / budget) * 100 : 0;
            const m = meter(pct, 10);
            const isLive = analysis.status === "live";

            return (
              <div
                key={analysis.id}
                className="py-4 border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="text-[9px]"
                    style={{ color: isLive ? LIVE_COLOR : "rgba(255,255,255,0.3)" }}
                  >
                    {isLive ? "●" : "▌"}
                  </span>
                  <span className="flex-1 text-[12.5px] tracking-wide truncate font-mono">
                    {analysis.name}
                  </span>
                  <span
                    className="text-[10px] tracking-widest uppercase"
                    style={{ color: isLive ? LIVE_COLOR : "rgba(255,255,255,0.3)" }}
                  >
                    {analysis.status}
                  </span>
                  <RunNowButton analysisId={analysis.id} />
                </div>
                <div className="flex items-center gap-3 mt-2 pl-5 text-[11px] text-muted font-mono">
                  <span className="flex-1 truncate tracking-wide capitalize">
                    <span style={{ color: typeColor(analysis.target_type) }}>{analysis.target_type}</span>
                    <span> · {analysis.target}</span>
                  </span>
                  <span className="tracking-wide shrink-0">
                    <span style={{ color: pct >= 90 ? "#E3B341" : "#6E9BE6" }}>{m.fill}</span>
                    <span className="text-faint">{m.track}</span>
                  </span>
                  <span className="tabular-nums shrink-0">
                    ${spend.toFixed(2)}
                    <span className="text-faint"> / ${budget.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
