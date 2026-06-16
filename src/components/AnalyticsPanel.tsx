"use client";

import type { Signal } from "@/types/database";
import { SectionHeader } from "@/components/terminal/ui";
import { sparkline } from "@/lib/ui/ascii";
import { TypeBarChart } from "@/components/charts/TypeBarChart";
import { ACCENT } from "@/lib/ui/type-colors";

interface AnalyticsPanelProps {
  signals: Signal[];
  liveAgents: number;
  totalAgents: number;
  totalSpend: number;
  totalBudget: number;
  overview?: boolean;
}

function buildDayBuckets(signals: Signal[], numDays: number): number[] {
  const buckets = Array(numDays).fill(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const signal of signals) {
    const d = new Date(signal.created_at);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
    if (diff >= 0 && diff < numDays) buckets[numDays - 1 - diff]++;
  }
  return buckets;
}

function countByType(signals: Signal[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const s of signals) counts.set(s.type, (counts.get(s.type) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function sparkColor(dim: boolean, isLast: boolean): string {
  if (isLast) return "#6E9BE6";
  if (!dim) return "rgba(255,255,255,0.75)";
  return "rgba(255,255,255,0.32)";
}

export function AnalyticsPanel({
  signals,
  liveAgents,
  totalAgents,
  totalSpend,
  overview = false,
}: AnalyticsPanelProps) {
  const days = buildDayBuckets(signals, 14);
  const spark = sparkline(days.length ? days : [0]);
  const byType = countByType(signals);
  const peak = Math.max(...days, 0);
  const avg = days.length ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : "0";

  return (
    <>
      {overview && <SectionHeader num="01" title="ANALYTICS" />}
      <div className="flex gap-10 mb-7">
        <div>
          <div className="overview-kpi">
            <span style={{ color: "#6FCF8E" }}>{liveAgents}</span>
            <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 20 }}>/{totalAgents}</span>
          </div>
          <div className="text-[9px] tracking-[0.2em] text-muted mt-2">WATCHES LIVE</div>
        </div>
        <div>
          <div className="overview-kpi" style={{ color: "#6E9BE6" }}>
            {signals.length}
          </div>
          <div className="text-[9px] tracking-[0.2em] text-muted mt-2">SIGNALS · 14D</div>
        </div>
        <div>
          <div className="overview-kpi" style={{ color: "#E3B341" }}>
            ${totalSpend.toFixed(2)}
          </div>
          <div className="text-[9px] tracking-[0.2em] text-muted mt-2">SPEND · MTD</div>
        </div>
      </div>

      <div className="text-[10px] tracking-[0.18em] text-muted mb-2.5">14-DAY ACTIVITY</div>
      <div className="text-[26px] leading-none tracking-[3px] font-mono">
        {spark.map((c, i) => (
          <span key={i} style={{ color: sparkColor(c.dim, i === spark.length - 1) }}>
            {c.ch}
          </span>
        ))}
      </div>
      <div className="text-[10px] text-muted mt-2.5 tracking-wide">
        peak {peak} · avg {avg} · trend{" "}
        <span style={{ color: (days.at(-1) ?? 0) >= (days.at(-2) ?? 0) ? ACCENT.green : ACCENT.pink }}>
          {(days.at(-1) ?? 0) >= (days.at(-2) ?? 0) ? "↑" : "↓"}
        </span>
      </div>

      <div className="text-[10px] tracking-[0.18em] text-muted mt-7 mb-4">BY TYPE</div>
      <TypeBarChart rows={byType} />
    </>
  );
}
