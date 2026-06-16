import type { Analysis, Signal } from "@/types/database";
import { SectionHeader } from "@/components/terminal/ui";
import { meter } from "@/lib/ui/ascii";
import { LIVE_COLOR, typeColor } from "@/lib/ui/type-colors";

interface PinnedWatchCardProps {
  analysis: Analysis;
  latestSignal?: Signal;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function PinnedWatchCard({ analysis, latestSignal }: PinnedWatchCardProps) {
  const spend = Number(analysis.spend_usd);
  const budget = Number(analysis.budget_cap_usd);
  const pct = budget > 0 ? (spend / budget) * 100 : 0;
  const m = meter(pct, 12);
  const isLive = analysis.status === "live";

  return (
    <>
      <SectionHeader
        num="◆"
        title={analysis.name.toUpperCase()}
        right={isLive ? "LIVE" : analysis.status.toUpperCase()}
        size="lg"
      />
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-[14px]">
          <span style={{ color: isLive ? LIVE_COLOR : "rgba(255,255,255,0.35)" }}>
            {isLive ? "●" : "▌"}
          </span>
          <span className="capitalize" style={{ color: typeColor(analysis.target_type) }}>
            {analysis.target_type}
          </span>
          <span className="text-dim">·</span>
          <span className="text-dim truncate">{analysis.target}</span>
        </div>

        {latestSignal ? (
          <div className="border-l-2 pl-4" style={{ borderColor: typeColor(latestSignal.type) }}>
            <div className="text-[15px] leading-snug">{latestSignal.title}</div>
            <div className="text-[12px] text-muted mt-1.5 tracking-wide">
              <span className="uppercase" style={{ color: typeColor(latestSignal.type) }}>
                {latestSignal.type}
              </span>
              <span> · {formatRelative(latestSignal.created_at)}</span>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-muted">No signals yet.</p>
        )}

        <div className="flex items-center justify-between text-[12px] text-muted pt-1">
          <span>last scan {formatRelative(analysis.last_run_at)}</span>
          <span className="tabular-nums">
            <span style={{ color: pct >= 90 ? "#E3B341" : "#6E9BE6" }}>{m.fill}</span>
            <span className="text-faint">{m.track}</span>
            <span className="ml-2">
              ${spend.toFixed(2)}
              <span className="text-faint"> / ${budget.toFixed(2)}</span>
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
