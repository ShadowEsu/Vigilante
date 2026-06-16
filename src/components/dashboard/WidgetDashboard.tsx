"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Analysis, Brief, Signal } from "@/types/database";
import {
  DEFAULT_EXTRA_WIDGETS,
  EXTRA_WIDGET_META,
  type ExtraWidgetId,
  type ScanLogEntry,
} from "@/lib/preview/mock-extended";
import { loadPinnedWatches, savePinnedWatches } from "@/lib/ui/dashboard-store";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { AgentsPanel } from "@/components/AgentsPanel";
import { SignalsPanel } from "@/components/SignalsPanel";
import { BriefPanel } from "@/components/BriefPanel";
import { LiveTickersPanel } from "@/components/dashboard/LiveTickersPanel";
import { NewslettersPanel } from "@/components/dashboard/NewslettersPanel";
import { PinnedWatchCard } from "@/components/dashboard/PinnedWatchCard";
import { SectionHeader } from "@/components/terminal/ui";
import { DashboardAlertsSync } from "@/components/notifications/DashboardAlertsSync";
import { LiveActivityFeed } from "@/components/notifications/LiveActivityFeed";
import { STATUS_COLOR } from "@/lib/ui/type-colors";

const EXTRA_STORAGE_KEY = "vigilant-dashboard-extra";

interface WidgetDashboardProps {
  analyses: Analysis[];
  signals: Signal[];
  latestBrief: Brief | null;
  analysisNames: Map<string, string>;
  scanLog?: ScanLogEntry[];
  demoLive?: boolean;
}

function loadExtraWidgets(): ExtraWidgetId[] {
  if (typeof window === "undefined") return DEFAULT_EXTRA_WIDGETS;
  try {
    const raw = localStorage.getItem(EXTRA_STORAGE_KEY);
    if (!raw) return DEFAULT_EXTRA_WIDGETS;
    const parsed = JSON.parse(raw) as ExtraWidgetId[];
    return parsed.filter((id) => id in EXTRA_WIDGET_META);
  } catch {
    return DEFAULT_EXTRA_WIDGETS;
  }
}

function formatLastScan(analyses: Analysis[]): string {
  const times = analyses
    .map((a) => (a.last_run_at ? new Date(a.last_run_at).getTime() : 0))
    .filter((t) => t > 0);
  if (!times.length) return "—";
  const latest = Math.max(...times);
  const mins = Math.floor((Date.now() - latest) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function WidgetDashboard({
  analyses,
  signals,
  latestBrief,
  analysisNames,
  scanLog = [],
  demoLive = false,
}: WidgetDashboardProps) {
  const [extraWidgets, setExtraWidgets] = useState<ExtraWidgetId[]>(DEFAULT_EXTRA_WIDGETS);
  const [pinned, setPinned] = useState<string[]>([]);
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    setExtraWidgets(loadExtraWidgets());
    setPinned(loadPinnedWatches());
  }, []);

  const persistExtra = useCallback((next: ExtraWidgetId[]) => {
    setExtraWidgets(next);
    localStorage.setItem(EXTRA_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const persistPinned = useCallback(
    (next: string[]) => {
      const valid = next.filter((id) => analyses.some((a) => a.id === id));
      setPinned(valid);
      savePinnedWatches(valid);
    },
    [analyses]
  );

  const toggleExtra = (id: ExtraWidgetId) => {
    const next = extraWidgets.includes(id)
      ? extraWidgets.filter((w) => w !== id)
      : [...extraWidgets, id];
    persistExtra(next);
  };

  const togglePin = (id: string) => {
    const next = pinned.includes(id) ? pinned.filter((p) => p !== id) : [...pinned, id];
    persistPinned(next);
  };

  const latestByAnalysis = useMemo(() => {
    const map = new Map<string, Signal>();
    for (const s of signals) {
      if (!map.has(s.analysis_id)) map.set(s.analysis_id, s);
    }
    return map;
  }, [signals]);

  const pinnedAnalyses = useMemo(
    () => pinned.map((id) => analyses.find((a) => a.id === id)).filter(Boolean) as Analysis[],
    [pinned, analyses]
  );

  const totalSpend = analyses.reduce((s, a) => s + Number(a.spend_usd), 0);
  const totalBudget = analyses.reduce((s, a) => s + Number(a.budget_cap_usd), 0);
  const liveCount = analyses.filter((a) => a.status === "live").length;
  const highCount = signals.filter((s) => s.severity === "high").length;

  const hasExtras =
    extraWidgets.length > 0 || pinnedAnalyses.length > 0 || extraWidgets.includes("scan_log");

  return (
    <div className="vigilant-dashboard flex-1 min-h-0 flex flex-col">
      <DashboardAlertsSync signals={signals} analysisNames={analysisNames} />
      <LiveActivityFeed analyses={analyses} signals={signals} demo={demoLive} />

      <div className="overview-subbar">
        <span>
          WATCHES <span style={{ color: "rgba(255,255,255,0.85)" }}>{analyses.length}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.14)" }}>|</span>
        <span>
          LIVE <span style={{ color: "#6FCF8E" }}>{liveCount}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.14)" }}>|</span>
        <span>
          SIGNALS <span style={{ color: "#6E9BE6" }}>{signals.length}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.14)" }}>|</span>
        <span>
          HIGH <span style={{ color: "#E3B341" }}>△ {highCount}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.14)" }}>|</span>
        <span>
          SPEND{" "}
          <span className="tabular-nums" style={{ color: "#E3B341" }}>
            ${totalSpend.toFixed(2)}/${totalBudget.toFixed(2)}
          </span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.14)" }}>|</span>
        <span>LAST SCAN {formatLastScan(analyses)}</span>

        <button
          type="button"
          className="overview-configure-btn"
          onClick={() => setConfigOpen((o) => !o)}
        >
          {configOpen ? "[ CLOSE ]" : "[ ⊞ CONFIGURE ]"}
        </button>
      </div>

      {configOpen && (
        <div className="overview-config-panel">
          <p
            className="mb-3 tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}
          >
            ADD WIDGETS TO OVERVIEW
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(Object.keys(EXTRA_WIDGET_META) as ExtraWidgetId[]).map((id) => {
              const on = extraWidgets.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleExtra(id)}
                  className="font-mono border cursor-pointer tracking-wide"
                  style={{
                    fontSize: 11,
                    padding: "6px 12px",
                    borderColor: on ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.12)",
                    color: on ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.4)",
                    background: on ? "rgba(255,255,255,0.06)" : "transparent",
                  }}
                >
                  {on ? "[x]" : "[ + ]"} {EXTRA_WIDGET_META[id].label}
                </button>
              );
            })}
          </div>

          <p
            className="mb-3 tracking-[0.18em]"
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}
          >
            PIN WATCHLISTS
          </p>
          <div className="flex flex-wrap gap-2">
            {analyses.map((a) => {
              const on = pinned.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => togglePin(a.id)}
                  className="font-mono border cursor-pointer tracking-wide"
                  style={{
                    fontSize: 11,
                    padding: "6px 12px",
                    borderColor: on ? "#6FCF8E" : "rgba(255,255,255,0.12)",
                    color: on ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.4)",
                    background: on ? "rgba(111,207,142,0.08)" : "transparent",
                  }}
                >
                  {on ? "[★]" : "[ ]"} {a.name}
                </button>
              );
            })}
            {!analyses.length && (
              <span style={{ color: "rgba(255,255,255,0.35)" }}>No watchlists yet</span>
            )}
          </div>
        </div>
      )}

      <div className="vigilant-dashboard-grid flex-1 min-h-0">
        <div className="overview-quadrant">
          <AnalyticsPanel
            signals={signals}
            liveAgents={liveCount}
            totalAgents={analyses.length}
            totalSpend={totalSpend}
            totalBudget={totalBudget}
            overview
          />
        </div>

        <div className="overview-quadrant overview-quadrant--tr">
          <AgentsPanel analyses={analyses} overview sectionNum="02" />
        </div>

        <div className="overview-quadrant overview-quadrant--bl">
          <SignalsPanel signals={signals} analysisNames={analysisNames} overview sectionNum="03" />
        </div>

        <div className="overview-quadrant overview-quadrant--br">
          <BriefPanel brief={latestBrief} overview />
        </div>
      </div>

      {hasExtras && (
        <div className="overview-extras">
          {extraWidgets.includes("live_tickers") && (
            <div className="overview-quadrant">
              <LiveTickersPanel />
            </div>
          )}
          {extraWidgets.includes("newsletters") && (
            <div className="overview-quadrant overview-quadrant--tr">
              <NewslettersPanel />
            </div>
          )}
          {extraWidgets.includes("scan_log") && scanLog.length > 0 && (
            <div
              className="overview-quadrant"
              style={{ gridColumn: extraWidgets.includes("live_tickers") && extraWidgets.includes("newsletters") ? "1 / -1" : undefined }}
            >
              <SectionHeader num="·" title="RECENT SCANS" right={`${scanLog.length} entries`} />
              <ScanLogTable rows={scanLog.slice(0, 3)} dense />
            </div>
          )}
          {pinnedAnalyses.map((analysis, i) => (
            <div
              key={analysis.id}
              className={`overview-quadrant ${i % 2 === 1 ? "overview-quadrant--tr" : ""}`}
            >
              <PinnedWatchCard analysis={analysis} latestSignal={latestByAnalysis.get(analysis.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScanLogTable({
  rows,
  dense = false,
}: {
  rows: ScanLogEntry[];
  dense?: boolean;
}) {
  const statusColor = (s: ScanLogEntry["status"]) =>
    s === "change" ? STATUS_COLOR.change : s === "error" ? STATUS_COLOR.error : STATUS_COLOR.ok;

  const cols = dense ? "1fr 64px 56px 1fr" : "140px 1fr 64px 64px 1fr";

  return (
    <div className="border text-[13px] font-mono" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <div
        className="border-b"
        style={{
          display: "grid",
          gap: 12,
          padding: "12px 16px",
          gridTemplateColumns: cols,
          fontSize: 10,
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.35)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {!dense && <span>TIME</span>}
        <span>WATCH</span>
        <span>STATUS</span>
        <span>COST</span>
        {!dense && <span>NOTE</span>}
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          className="border-b last:border-0"
          style={{
            display: "grid",
            gap: 12,
            padding: "12px 16px",
            gridTemplateColumns: cols,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {!dense && (
            <span style={{ color: "rgba(255,255,255,0.35)" }}>
              {new Date(row.at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <span className="truncate">{row.watch}</span>
          <span style={{ color: statusColor(row.status) }}>{row.status}</span>
          <span style={{ color: "rgba(255,255,255,0.35)" }}>${row.costUsd.toFixed(2)}</span>
          {!dense && <span className="truncate text-muted">{row.note}</span>}
        </div>
      ))}
    </div>
  );
}
