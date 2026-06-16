import type { CompanyDashboard, InsiderMove, NewsletterPost } from "@/lib/company/types";
import { TYPE_COLOR } from "@/vigil/data";
import { meter } from "@/vigil/utils";
export interface VigilLiveData {
  hasLiveData: boolean;
  companies: Array<{ id: string; name: string; domain: string; status: string; pages_indexed: number }>;
  selectedCompanyId: string | null;
  selectedCompany: {
    id: string;
    name: string;
    domain: string;
    pages_indexed: number;
    sources: string[];
    last_scraped_at: string | null;
  } | null;
  counters: { watches: number; live: number; pages: number; spend: number };
  selectedCounters: { watches: number; live: number; pages: number; spend: number };
  watchlists: ReturnType<typeof mapWatchlists>;
  documents: ReturnType<typeof mapDocuments>;
  insider: ReturnType<typeof mapInsider>;
  newsletters: ReturnType<typeof mapNewsletters>;
  changes: ReturnType<typeof mapChanges>;
  brief: ReturnType<typeof mapBrief> | null;
  scanLog: CompanyDashboard["scanLog"];
  activity: CompanyDashboard["activity"];
  intelHighlights: ReturnType<typeof mapIntelHighlights>;
  typeBarsData: ReturnType<typeof mapTypeBars>;
  companyIntelBars: ReturnType<typeof mapCompanyIntelBars>;
  selectedLastScanAt: string | null;
  loading: boolean;
  scraping: boolean;
  error: string | null;
}

function mapWatchlists(dashboards: CompanyDashboard[], cadenceLabel: string) {
  return dashboards.map((d) => {
    const w = d.company;
    const pct = Math.min(100, Math.round((w.spend_usd / Math.max(w.budget_usd, 0.01)) * 100));
    const m = meter(pct, 10);
    const isLive = w.status === "live";
    const scanning = w.status === "scanning";
    return {
      id: w.id,
      name: `${w.name} — MONITOR`,
      status: scanning ? "scanning" : isLive ? "live" : "paused",
      kind: "company",
      target: w.domain,
      cadence: cadenceLabel,
      pages: w.pages_indexed,
      spend: w.spend_usd,
      budget: w.budget_usd,
      pct,
      glyph: isLive ? "●" : "▌",
      glyphColor: isLive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
      glyphSize: isLive ? "9px" : "11px",
      glyphAnim: isLive ? "pulse 2.4s infinite" : "none",
      statusColor: scanning ? "rgba(255,255,255,0.65)" : isLive ? "rgba(255,255,255,0.48)" : "rgba(255,255,255,0.28)",
      fill: m.fill,
      track: m.track,
      spendStr: `$${w.spend_usd.toFixed(2)}`,
      budgetStr: `$${w.budget_usd.toFixed(2)}`,
      scanning,
      runLabel: scanning ? "···" : "run →",
      runColor: scanning ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.65)",
      lastScrapedAt: w.last_scraped_at ?? null,
    };
  });
}

function mapDocuments(docs: CompanyDashboard["documents"]) {
  return docs.map((d, i) => ({
    ...d,
    company: d.title.split("—")[0]?.trim() || "",
    docType: d.doc_type,
    url: d.url,
    filed: new Date(d.scraped_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    scrapedAt: d.scraped_at,
    animDelay: `${i * 0.06}s`,
  }));
}
function mapInsider(moves: InsiderMove[], companyName = "") {
  return moves.map((m, i) => ({
    ...m,
    company: companyName,
    moveType: m.move_type,
    source_url: m.source_url,
    sev: m.move_type === "DEPARTED" || m.move_type === "LAYOFF" ? "▲" : "·",
    sevColor: m.move_type === "DEPARTED" || m.move_type === "LAYOFF" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
    animDelay: `${i * 0.05}s`,
  }));
}

function mapChanges(changes: CompanyDashboard["changes"]) {
  return changes.map((c, i) => ({
    ...c,
    changeType: c.change_type,
    sourceLabel: c.source_label,
    source_url: c.source_url,
    detectedAt: c.detected_at,
    sev: c.severity === "high" ? "▲" : c.is_baseline ? "·" : "·",
    sevColor: c.severity === "high" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
    typeLabel: c.change_type.toUpperCase(),
    color: TYPE_COLOR[c.change_type] || TYPE_COLOR.site,
    leftBorder: `inset 3px 0 0 ${TYPE_COLOR[c.change_type] || TYPE_COLOR.site}`,
    animDelay: `${i * 0.04}s`,
  }));
}
function mapNewsletters(posts: NewsletterPost[]) {
  return posts.map((n, i) => ({
    ...n,
    company: n.name.split("—")[0]?.trim() ?? n.name,
    url: n.url,
    scrapedAt: n.scraped_at,
    changes: n.changes.length ? n.changes : [n.excerpt],
    change0: n.changes[0] ?? n.excerpt,
    change1: n.changes[1] ?? "",
    change2: n.changes[2] ?? "",
    animDelay: `${i * 0.08}s`,
  }));
}
function mapIntelHighlights(highlights: CompanyDashboard["intelHighlights"]) {
  return highlights.map((h, i) => ({
    ...h,
    sourceUrl: h.source_url,
    sourceLabel: h.source_label,
    scrapedAt: h.scraped_at,
    animDelay: `${i * 0.05}s`,
  }));
}

function mapBrief(dashboard: CompanyDashboard | null) {
  if (!dashboard?.brief) return null;
  const b = dashboard.brief;
  const d = new Date(b.created_at);
  return {
    title: b.title,
    body: b.body,
    sources: b.sources,
    confidence: b.confidence,
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

function mapAllInsider(dashboards: CompanyDashboard[]) {
  const out: ReturnType<typeof mapInsider> = [];
  for (const d of dashboards) {
    out.push(...mapInsider(d.insider, d.company.name));
  }
  return out;
}

function mapCompanyIntelBars(dashboard: CompanyDashboard | null) {
  if (!dashboard) return [];
  const counts = new Map<string, number>();
  for (const doc of dashboard.documents) counts.set("document", (counts.get("document") ?? 0) + 1);
  for (const n of dashboard.newsletters) counts.set("newsletter", (counts.get("newsletter") ?? 0) + 1);
  for (const ins of dashboard.insider) counts.set("insider", (counts.get("insider") ?? 0) + 1);
  for (const ch of dashboard.changes) {
    if (!ch.is_baseline) counts.set(ch.change_type, (counts.get(ch.change_type) ?? 0) + 1);
  }
  const raw = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  if (raw.length === 0) return [];
  const maxT = Math.max(...raw.map(([, c]) => c), 1);
  const W = 14;
  return raw.map(([t, c]) => {
    const f = Math.round((c / maxT) * W);
    return {
      label: t.toUpperCase(),
      color: TYPE_COLOR[t] || "rgba(255,255,255,0.6)",
      count: c,
      fill: "█".repeat(f),
      track: "░".repeat(W - f),
    };
  });
}

function mapTypeBars(dashboards: CompanyDashboard[]) {
  const counts = new Map<string, number>();
  for (const d of dashboards) {
    for (const doc of d.documents) counts.set("document", (counts.get("document") ?? 0) + 1);
    for (const n of d.newsletters) counts.set("newsletter", (counts.get("newsletter") ?? 0) + 1);
    for (const ins of d.insider) counts.set("insider", (counts.get("insider") ?? 0) + 1);
    for (const ch of d.changes) {
      if (!ch.is_baseline) counts.set(ch.change_type, (counts.get(ch.change_type) ?? 0) + 1);
    }
  }
  const raw = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  if (raw.length === 0) return [];
  const maxT = Math.max(...raw.map(([, c]) => c), 1);
  const W = 14;
  return raw.map(([t, c]) => {
    const f = Math.round((c / maxT) * W);
    return {
      label: t.toUpperCase(),
      color: TYPE_COLOR[t] || "rgba(255,255,255,0.6)",
      count: c,
      fill: "█".repeat(f),
      track: "░".repeat(W - f),
    };
  });
}

export function buildLiveData(
  dashboards: CompanyDashboard[],
  selectedId: string | null,
  opts: {
    loading?: boolean;
    scraping?: boolean;
    error?: string | null;
    scanScheduleLabel?: string;
  } = {}
): VigilLiveData {
  const companies = dashboards.map((d) => ({
    id: d.company.id,
    name: d.company.name,
    domain: d.company.domain,
    status: d.company.status,
    pages_indexed: d.company.pages_indexed,
  }));

  const selected =
    dashboards.find((d) => d.company.id === selectedId) ??
    dashboards[0] ??
    null;

  const totalPages = dashboards.reduce((s, d) => s + d.company.pages_indexed, 0);
  const liveCount = dashboards.filter((d) => d.company.status === "live").length;
  const totalSpend = dashboards.reduce((s, d) => s + d.company.spend_usd, 0);
  const cadenceLabel = opts.scanScheduleLabel ?? "every 6 hours";
  const selPages = selected?.company.pages_indexed ?? 0;
  const selSpend = selected ? Math.round(selected.company.spend_usd * 100) : 0;

  return {
    hasLiveData: dashboards.length > 0,
    companies,
    selectedCompanyId: selected?.company.id ?? null,
    selectedCompany: selected
      ? {
          id: selected.company.id,
          name: selected.company.name,
          domain: selected.company.domain,
          pages_indexed: selected.company.pages_indexed,
          sources: selected.company.sources,
          last_scraped_at: selected.company.last_scraped_at,
        }
      : null,
    counters: {
      watches: dashboards.length,
      live: liveCount,
      pages: totalPages,
      spend: Math.round(totalSpend * 100),
    },
    selectedCounters: {
      watches: 1,
      live: selected?.company.status === "live" ? 1 : 0,
      pages: selPages,
      spend: selSpend,
    },
    watchlists: mapWatchlists(dashboards, cadenceLabel),
    documents: mapDocuments(selected ? selected.documents : dashboards.flatMap((d) => d.documents)),
    insider: selected
      ? mapInsider(selected.insider, selected.company.name)
      : mapAllInsider(dashboards),
    newsletters: mapNewsletters(selected ? selected.newsletters : dashboards.flatMap((d) => d.newsletters)),
    changes: mapChanges(selected ? selected.changes : dashboards.flatMap((d) => d.changes)),
    brief: mapBrief(selected),
    scanLog: selected?.scanLog ?? [],
    activity: selected?.activity ?? [],
    intelHighlights: mapIntelHighlights(
      selected ? selected.intelHighlights : dashboards.flatMap((d) => d.intelHighlights)
    ),
    typeBarsData: mapTypeBars(dashboards),
    companyIntelBars: mapCompanyIntelBars(selected),
    selectedLastScanAt: selected?.company.last_scraped_at ?? null,
    loading: opts.loading ?? false,
    scraping: opts.scraping ?? false,
    error: opts.error ?? null,
  };
}
