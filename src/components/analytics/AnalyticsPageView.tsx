"use client";

import type { ReactNode } from "react";
import type { Analysis, Signal } from "@/types/database";
import { PageFrame, SectionHeader } from "@/components/terminal/ui";
import type { ScanLogEntry } from "@/lib/preview/mock-extended";
import { TypeBarChart } from "@/components/charts/TypeBarChart";
import { ACCENT } from "@/lib/ui/type-colors";

interface AnalyticsPageViewProps {
  analyses: Analysis[];
  signals: Signal[];
  scanLog: ScanLogEntry[];
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

function formatCadence(minutes: number): string {
  if (minutes < 120) return "hourly";
  if (minutes < 1440) return `every ${Math.round(minutes / 60)}h`;
  if (minutes === 1440) return "daily";
  return `every ${Math.round(minutes / 1440)}d`;
}

function formatLastRun(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function dayLabel(offsetFromEnd: number, total: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (total - 1 - offsetFromEnd));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AnalyticsPageView({ analyses, signals, scanLog }: AnalyticsPageViewProps) {
  const days = buildDayBuckets(signals, 14);
  const maxDay = Math.max(...days, 1);
  const byType = countByType(signals);
  const liveCount = analyses.filter((a) => a.status === "live").length;
  const totalSpend = analyses.reduce((s, a) => s + Number(a.spend_usd), 0);

  const byWatch = analyses.map((a) => ({
    name: a.name,
    signals: signals.filter((s) => s.analysis_id === a.id).length,
    spend: Number(a.spend_usd),
    budget: Number(a.budget_cap_usd),
    cadence: formatCadence(a.cadence_minutes),
    lastRun: formatLastRun(a.last_run_at),
  }));

  return (
    <PageFrame>
      <SectionHeader num="01" title="ANALYTICS" />

      <div className="flex flex-wrap gap-10 mb-8 font-mono">
        <Kpi
          value={
            <>
              {liveCount}
              <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 20 }}>/{analyses.length}</span>
            </>
          }
          label="WATCHES LIVE"
          color={ACCENT.green}
        />
        <Kpi value={signals.length} label="SIGNALS DETECTED" color={ACCENT.blue} />
        <Kpi value={`$${totalSpend.toFixed(2)}`} label="SPEND MTD" color={ACCENT.gold} />
        <Kpi value="1.1s" label="AVG SCAN TIME" />
      </div>

      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <div className="text-[10px] tracking-[0.18em] text-muted mb-3">14-DAY SIGNAL ACTIVITY</div>
          <div className="flex items-end gap-1 h-28 mb-2">
            {days.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full flex flex-col justify-end gap-px"
                  style={{ height: 72 }}
                >
                  {Array.from({ length: Math.max(1, Math.round((v / maxDay) * 8)) }).map((_, j) => (
                    <div
                      key={j}
                      style={{
                        height: 6,
                        background:
                          i === days.length - 1 ? ACCENT.blue : "rgba(255,255,255,0.22)",
                      }}
                    />
                  ))}
                </div>
                <span className="text-[8px] text-faint tabular-nums whitespace-nowrap">
                  {dayLabel(i, days.length)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] tracking-[0.18em] text-muted mb-4">BY SIGNAL TYPE</div>
          <TypeBarChart rows={byType} showZeros />
        </div>
      </div>

      <div className="mb-10">
        <div className="text-[10px] tracking-[0.18em] text-muted mb-3">BY WATCH</div>
        <div className="border font-mono text-[12px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div
            className="grid gap-3 px-4 py-3 text-[9px] tracking-[0.16em] text-muted border-b"
            style={{
              gridTemplateColumns: "1.5fr 72px 80px 80px 96px 1fr",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <span>WATCH</span>
            <span>SIGNALS</span>
            <span>SPEND</span>
            <span>BUDGET</span>
            <span>CADENCE</span>
            <span>LAST RUN</span>
          </div>
          {byWatch.map((w) => (
            <div
              key={w.name}
              className="grid gap-3 px-4 py-3 border-b last:border-0"
              style={{
                gridTemplateColumns: "1.5fr 72px 80px 80px 96px 1fr",
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <span className="truncate">{w.name}</span>
              <span className="tabular-nums" style={{ color: ACCENT.blue }}>
                {w.signals}
              </span>
              <span className="tabular-nums text-muted">${w.spend.toFixed(2)}</span>
              <span className="tabular-nums text-muted">${w.budget.toFixed(2)}</span>
              <span className="text-muted">{w.cadence}</span>
              <span className="text-muted text-[11px] truncate">{w.lastRun}</span>
            </div>
          ))}
        </div>
      </div>

      <SectionHeader num="·" title="SCAN LOG" right={`${scanLog.length} entries`} />
      <div className="border font-mono text-[12px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div
          className="grid gap-3 px-4 py-3 text-[9px] tracking-[0.16em] text-muted border-b"
          style={{
            gridTemplateColumns: "140px 1.2fr 72px 80px 72px",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <span>DATE</span>
          <span>WATCH</span>
          <span>SIGNALS</span>
          <span>DURATION</span>
          <span>COST</span>
        </div>
        {scanLog.map((row) => (
          <div
            key={row.id}
            className="grid gap-3 px-4 py-3 border-b last:border-0"
            style={{
              gridTemplateColumns: "140px 1.2fr 72px 80px 72px",
              borderColor: "rgba(255,255,255,0.05)",
            }}
          >
            <span className="text-muted tabular-nums">
              {new Date(row.at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="truncate">{row.watch}</span>
            <span className="tabular-nums" style={{ color: ACCENT.blue }}>
              {row.status === "change" ? row.note.match(/\d+/)?.[0] ?? "1" : "0"}
            </span>
            <span className="tabular-nums text-muted">{(row.durationMs / 1000).toFixed(1)}s</span>
            <span className="tabular-nums text-muted">${row.costUsd.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </PageFrame>
  );
}

function Kpi({
  value,
  label,
  color,
}: {
  value: ReactNode;
  label: string;
  color?: string;
}) {
  return (
    <div>
      <div className="overview-kpi" style={{ color: color ?? "rgba(255,255,255,0.95)" }}>
        {value}
      </div>
      <div className="text-[9px] tracking-[0.2em] text-muted mt-2">{label}</div>
    </div>
  );
}
