export type ExtraWidgetId = "live_tickers" | "newsletters" | "scan_log";

export const EXTRA_WIDGET_META: Record<
  ExtraWidgetId,
  { label: string; num: string; title: string }
> = {
  live_tickers: { label: "Live tickers", num: "05", title: "LIVE TICKERS" },
  newsletters: { label: "Newsletters", num: "06", title: "NEWSLETTERS" },
  scan_log: { label: "Scan log", num: "·", title: "RECENT SCANS" },
};

export const DEFAULT_EXTRA_WIDGETS: ExtraWidgetId[] = [];

export interface ScanLogEntry {
  id: string;
  watch: string;
  status: "ok" | "change" | "error";
  durationMs: number;
  costUsd: number;
  at: string;
  note: string;
}

export interface InsightItem {
  id: string;
  title: string;
  source: string;
  summary: string;
  at: string;
  tag?: string;
}

/** @deprecated use ExtraWidgetId */
export type WidgetId = ExtraWidgetId | "stats" | "activity" | "by_type" | "watchlists" | "signals" | "brief" | "spend";

export const WIDGET_META: Record<string, { label: string; defaultOn: boolean; span: string }> = {
  live_tickers: { label: "Live tickers", defaultOn: false, span: "1" },
  newsletters: { label: "Newsletters", defaultOn: false, span: "1" },
  scan_log: { label: "Scan log", defaultOn: false, span: "2" },
};

export const DEFAULT_WIDGETS: WidgetId[] = [];

export const MOCK_SCAN_LOG: ScanLogEntry[] = [
  { id: "s1", watch: "Acme Corp — Pricing", status: "change", durationMs: 4200, costUsd: 0.08, at: new Date(Date.now() - 45 * 60000).toISOString(), note: "2 signals detected" },
  { id: "s2", watch: "Jane Doe — LinkedIn", status: "ok", durationMs: 3100, costUsd: 0.05, at: new Date(Date.now() - 2 * 3600000).toISOString(), note: "no change" },
  { id: "s3", watch: "Acme Corp — Pricing", status: "ok", durationMs: 3900, costUsd: 0.07, at: new Date(Date.now() - 6 * 3600000).toISOString(), note: "no change" },
  { id: "s4", watch: "NVDA ticker watch", status: "error", durationMs: 1200, costUsd: 0.0, at: new Date(Date.now() - 26 * 3600000).toISOString(), note: "paused — skipped" },
  { id: "s5", watch: "Jane Doe — LinkedIn", status: "change", durationMs: 2800, costUsd: 0.04, at: new Date(Date.now() - 30 * 3600000).toISOString(), note: "1 signal" },
  { id: "s6", watch: "Acme Corp — Pricing", status: "ok", durationMs: 4100, costUsd: 0.08, at: new Date(Date.now() - 48 * 3600000).toISOString(), note: "no change" },
];

export const MOCK_INSIGHTS = {
  stock: [
    { id: "st1", title: "NVDA +2.4% on data-center guidance", source: "Market feed", summary: "Volume 1.2× avg; watch paused but ticker still tracked in insights.", at: "Jun 14 · 4:12 PM", tag: "NVDA" },
    { id: "st2", title: "Acme peer COMP down 3% after earnings", source: "Comparables", summary: "Sector rotation signal; may pressure Acme pricing narrative.", at: "Jun 14 · 11:00 AM", tag: "COMP" },
  ] as InsightItem[],
  patents: [
    { id: "p1", title: "US20240123456 — ML inference on edge", source: "USPTO", summary: "Assignee matches Acme subsidiary; filed Mar 2024, published last week.", at: "Jun 13 · 9:00 AM", tag: "ACME" },
    { id: "p2", title: "EP4123456 — Pricing optimization system", source: "EPO", summary: "Broad claims on dynamic SaaS pricing; monitor for product overlap.", at: "Jun 11 · 2:30 PM" },
  ] as InsightItem[],
  newsletters: [
    { id: "n1", title: "Stratechery: The AI bundling wave", source: "Newsletter", summary: "Mentions enterprise pricing shifts; relevant to Acme watch.", at: "Jun 14 · 7:00 AM" },
    { id: "n2", title: "Benedict's Newsletter: Hiring freezes ending", source: "Newsletter", summary: "Hiring signals align with Acme sales role postings.", at: "Jun 12 · 6:00 AM" },
  ] as InsightItem[],
  insider: [
    { id: "i1", title: "Jane Doe — board advisor appointment", source: "SEC / press", summary: "New advisory role at Horizon Labs; VP Product signal corroborated.", at: "Jun 14 · 3:00 PM", tag: "FORM 8-K" },
    { id: "i2", title: "Acme CFO sold 12k shares", source: "Form 4", summary: "10b5-1 plan; not necessarily bearish but worth logging.", at: "Jun 10 · 5:45 PM" },
  ] as InsightItem[],
  investments: [
    { id: "v1", title: "Horizon Labs Series B — $42M", source: "Crunchbase", summary: "Jane Doe watch target; AI infra focus.", at: "Jun 13 · 10:00 AM", tag: "SERIES B" },
    { id: "v2", title: "Acme acquires DataPipe (rumor)", source: "Tech press", summary: "Unconfirmed; would explain pricing/product expansion signals.", at: "Jun 09 · 1:00 PM" },
  ] as InsightItem[],
};

export const MOCK_AGENT_THREADS = [
  { id: "t1", title: "Acme pricing this week", updated: "2m ago" },
  { id: "t2", title: "Jane Doe hiring signals", updated: "1h ago" },
  { id: "t3", title: "NVDA watch resume", updated: "2d ago" },
];

export const MOCK_AGENT_MESSAGES = [
  { role: "user" as const, text: "What changed at Acme this week?" },
  {
    role: "watcher" as const,
    text: "Acme raised Pro pricing 12% on Jun 14 and shipped an annual-discount banner the same day. Two pricing/promo signals plus 3 new sales roles point to an upmarket, higher-ACV push.",
    meta: "3 sources · acme corp · confidence 82%",
  },
];
