export function meter(pct: number, n = 10) {
  const f = Math.round(pct / 100 * n);
  return { fill: "█".repeat(f), track: "░".repeat(n - f) };
}

export function typeBars(raw: [string, number][], max = 5, width = 14) {
  return raw.map(([t, c]) => {
    const f = Math.round((c / max) * width);
    return { label: t.toUpperCase(), count: c, fill: "█".repeat(f), track: "░".repeat(width - f) };
  });
}

export function formatClock(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`;
}

import type { ScanUnit } from "./data";

/** Precise relative time: "2h 14m 33s ago" or "just now" */
export function formatTimeAgo(isoOrDate: string | Date | null | undefined, now: Date = new Date()): string {
  if (!isoOrDate) return "—";
  const then = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(then.getTime())) return "—";
  const sec = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  if (min < 60) return remSec > 0 ? `${min}m ${remSec}s ago` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  if (hr < 24) return remMin > 0 ? `${hr}h ${remMin}m ${remSec}s ago` : `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

export function intervalToMs(interval: number, unit: ScanUnit): number {
  const n = Math.max(1, interval);
  const minute = 60_000;
  switch (unit) {
    case "minutes":
      return n * minute;
    case "hours":
      return n * 60 * minute;
    case "days":
      return n * 24 * 60 * minute;
    case "weeks":
      return n * 7 * 24 * 60 * minute;
    case "month":
      return n * 30 * 24 * 60 * minute;
    default:
      return n * 60 * minute;
  }
}

export function formatDurationUntil(targetMs: number, now: Date = new Date()): string {
  const sec = Math.max(0, Math.floor((targetMs - now.getTime()) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const remSec = sec % 60;
  if (min < 60) return remSec > 0 ? `${min}m ${remSec}s` : `${min}m`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return remMin > 0 ? `${hr}h ${remMin}m` : `${hr}h`;
}

const SCAN_RUNS_KEY = "vigil-scan-runs";

export function getScanRunsToday(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(SCAN_RUNS_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { date: string; count: number };
    const today = new Date().toISOString().slice(0, 10);
    return data.date === today ? data.count : 0;
  } catch {
    return 0;
  }
}

export function recordScanRun(): number {
  const today = new Date().toISOString().slice(0, 10);
  const count = getScanRunsToday() + 1;
  try {
    localStorage.setItem(SCAN_RUNS_KEY, JSON.stringify({ date: today, count }));
  } catch {
    /* ignore */
  }
  return count;
}

export interface ActivityDay {
  day: string;
  count: number;
  fullDate: string;
  isoDate: string;
}

/** Rolling 14-day buckets ending today; counts keyed by short label (e.g. "Jun 02"). */
export function buildRolling14DayActivity(
  source: { day: string; count: number }[] = [],
  countsByIndex?: number[]
): ActivityDay[] {
  const counts = new Map(source.map((d) => [d.day, d.count]));
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    const day = d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    const count = countsByIndex ? (countsByIndex[i] ?? 0) : (counts.get(day) ?? 0);
    return {
      day,
      count,
      fullDate: d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      isoDate: d.toISOString().slice(0, 10),
    };
  });
}
