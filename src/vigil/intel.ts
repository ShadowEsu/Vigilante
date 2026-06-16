import type { CompanyDashboard } from "@/lib/company/types";
import { TYPE_COLOR } from "./data";
import { categorizeSourceUrl } from "./company-profile";
import { meter } from "./utils";

/** Industry-standard CI signal types (pricing daily, hiring weekly, etc.) */
export const CI_SIGNALS = [
  { id: "pricing", label: "PRICING", cadence: "Daily", color: TYPE_COLOR.pricing, watch: "Tiers, list prices, packaging, annual discounts, enterprise CTAs" },
  { id: "product", label: "PRODUCT", cadence: "Daily", color: TYPE_COLOR.site, watch: "Changelogs, feature launches, release notes, roadmap hints" },
  { id: "hiring", label: "HIRING", cadence: "Weekly", color: TYPE_COLOR.hiring, watch: "Open roles, team growth, geo expansion, skill signals (ML, security)" },
  { id: "newsletter", label: "CONTENT", cadence: "Weekly", color: TYPE_COLOR.newsletter, watch: "Blog posts, press releases, messaging & positioning shifts" },
  { id: "document", label: "FILINGS", cadence: "Monthly", color: TYPE_COLOR.document, watch: "SEC filings, investor decks, annual reports, Form 4" },
  { id: "insider", label: "EXEC / ORG", cadence: "Weekly", color: TYPE_COLOR.insider, watch: "Leadership moves, departures, layoffs, key hires" },
  { id: "promo", label: "PROMO", cadence: "Weekly", color: TYPE_COLOR.promo, watch: "Discounts, campaigns, partner announcements" },
  { id: "investments", label: "CAPITAL", cadence: "Monthly", color: TYPE_COLOR.investments, watch: "Funding, M&A, share activity, capex guidance" },
] as const;

const SOURCE_LABEL_COLOR: Record<string, string> = {
  PRICING: TYPE_COLOR.pricing,
  CAREERS: TYPE_COLOR.hiring,
  INVESTOR: TYPE_COLOR.document,
  NEWS: TYPE_COLOR.newsletter,
  REVIEWS: TYPE_COLOR.newsletter,
  CORPORATE: TYPE_COLOR.site,
  SITE: TYPE_COLOR.site,
};

export interface BarRow {
  label: string;
  color: string;
  count: number;
  fill: string;
  track: string;
}

export interface IntelTimelineItem {
  id: string;
  at: string;
  type: string;
  typeLabel: string;
  color: string;
  title: string;
  summary: string;
  url?: string;
  severity?: "high" | "med" | "low";
}

export interface KeywordTrend {
  term: string;
  count: number;
  fill: string;
  track: string;
}

export interface CompetitorRow {
  id: string;
  name: string;
  domain: string;
  pages: number;
  changes: number;
  docs: number;
  posts: number;
  insider: number;
  lastScan: string | null;
  fill: string;
  track: string;
  intelScore: number;
}

export interface SignalCoverageRow {
  id: string;
  label: string;
  cadence: string;
  color: string;
  watch: string;
  covered: boolean;
  sourceCount: number;
}

export function buildSourceBreakdown(sources: string[]): BarRow[] {
  const counts = new Map<string, number>();
  for (const url of sources) {
    const label = categorizeSourceUrl(url);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const raw = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...raw.map(([, c]) => c), 1);
  const W = 14;
  return raw.map(([label, count]) => {
    const f = Math.round((count / max) * W);
    return {
      label,
      color: SOURCE_LABEL_COLOR[label] ?? "rgba(255,255,255,0.55)",
      count,
      fill: "█".repeat(f),
      track: "░".repeat(W - f),
    };
  });
}

export function buildSignalCoverage(
  sources: string[],
  counts: { changes: number; documents: number; newsletters: number; insider: number }
): SignalCoverageRow[] {
  const labels = new Set(sources.map(categorizeSourceUrl));
  const hasPricing = labels.has("PRICING") || counts.changes > 0;
  const hasHiring = labels.has("CAREERS") || counts.insider > 0;
  const hasNews = labels.has("NEWS") || counts.newsletters > 0;
  const hasFilings = labels.has("INVESTOR") || counts.documents > 0;
  const hasProduct = sources.length > 0 || counts.changes > 0;

  const coveredMap: Record<string, boolean> = {
    pricing: hasPricing,
    product: hasProduct,
    hiring: hasHiring,
    newsletter: hasNews,
    document: hasFilings,
    insider: counts.insider > 0,
    promo: counts.changes > 0,
    investments: counts.documents > 0,
  };

  return CI_SIGNALS.map((s) => ({
    id: s.id,
    label: s.label,
    cadence: s.cadence,
    color: s.color,
    watch: s.watch,
    covered: coveredMap[s.id] ?? false,
    sourceCount:
      s.id === "pricing" ? (labels.has("PRICING") ? 1 : 0) :
      s.id === "hiring" ? (labels.has("CAREERS") ? 1 : 0) :
      s.id === "newsletter" ? counts.newsletters :
      s.id === "document" ? counts.documents :
      s.id === "insider" ? counts.insider :
      counts.changes,
  }));
}

export function buildKeywordTrends(
  newsletters: Array<{ subject?: string; changes?: string[]; excerpt?: string }>,
  seedKeywords: string[]
): KeywordTrend[] {
  const freq = new Map<string, number>();
  for (const kw of seedKeywords) freq.set(kw, (freq.get(kw) ?? 0) + 2);

  const bump = (text: string) => {
    const words = text.split(/\s+/).filter((w) => w.length > 3);
    for (const w of words.slice(0, 6)) {
      const clean = w.replace(/[^a-zA-Z0-9]/g, "");
      if (clean.length < 4) continue;
      const key = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
      if (key.length > 18) continue;
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
  };

  for (const n of newsletters) {
    if (n.subject) bump(n.subject);
    for (const c of n.changes ?? []) bump(c);
    if (n.excerpt) bump(n.excerpt);
  }

  const sorted = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const max = Math.max(...sorted.map(([, c]) => c), 1);
  const W = 12;
  return sorted.map(([term, count]) => {
    const f = Math.round((count / max) * W);
    return { term, count, fill: "█".repeat(f), track: "░".repeat(W - f) };
  });
}

export function buildIntelTimeline(input: {
  changes: Array<{
    id?: string;
    title: string;
    summary?: string;
    change_type?: string;
    typeLabel?: string;
    color?: string;
    source_url?: string;
    detected_at?: string;
    detectedAt?: string;
    severity?: string;
    is_baseline?: boolean;
  }>;
  documents: Array<{ id?: string; title: string; docType?: string; doc_type?: string; url?: string; scraped_at?: string; scrapedAt?: string; excerpt?: string }>;
  insider: Array<{ id?: string; person: string; role?: string; moveType?: string; move_type?: string; note?: string; date?: string; source_url?: string }>;
  newsletters: Array<{ id?: string; subject: string; name?: string; url?: string; scraped_at?: string; scrapedAt?: string; excerpt?: string }>;
}): IntelTimelineItem[] {
  const items: IntelTimelineItem[] = [];

  for (const c of input.changes) {
    const at = c.detectedAt ?? c.detected_at;
    if (!at) continue;
    const type = c.change_type ?? "site";
    items.push({
      id: c.id ?? `ch-${c.title}`,
      at,
      type,
      typeLabel: c.typeLabel ?? type.toUpperCase(),
      color: c.color ?? TYPE_COLOR[type] ?? TYPE_COLOR.site,
      title: c.title,
      summary: c.summary ?? (c.is_baseline ? "Baseline snapshot indexed" : "Page change detected"),
      url: c.source_url,
      severity: c.severity as IntelTimelineItem["severity"],
    });
  }

  for (const d of input.documents) {
    const at = d.scrapedAt ?? d.scraped_at;
    if (!at) continue;
    items.push({
      id: d.id ?? `doc-${d.title}`,
      at,
      type: "document",
      typeLabel: (d.docType ?? d.doc_type ?? "DOCUMENT").toUpperCase(),
      color: TYPE_COLOR.document,
      title: d.title,
      summary: d.excerpt?.slice(0, 120) ?? "Document indexed from investor or filings page",
      url: d.url,
    });
  }

  for (const m of input.insider) {
    items.push({
      id: m.id ?? `ins-${m.person}`,
      at: new Date().toISOString(),
      type: "insider",
      typeLabel: (m.moveType ?? m.move_type ?? "ORG").toUpperCase(),
      color: TYPE_COLOR.insider,
      title: m.person,
      summary: `${m.role ?? ""} · ${m.note ?? ""}`.trim(),
      url: m.source_url,
    });
  }

  for (const n of input.newsletters) {
    const at = n.scrapedAt ?? n.scraped_at;
    if (!at) continue;
    items.push({
      id: n.id ?? `nw-${n.subject}`,
      at,
      type: "newsletter",
      typeLabel: "CONTENT",
      color: TYPE_COLOR.newsletter,
      title: n.subject,
      summary: n.name ?? n.excerpt ?? "Blog or newsletter post indexed",
      url: n.url,
    });
  }

  return items
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 24);
}

export function buildCompetitorCompare(dashboards: CompanyDashboard[]): CompetitorRow[] {
  if (dashboards.length === 0) return [];
  const rows = dashboards.map((d) => {
    const changes = d.changes.filter((c) => !c.is_baseline).length;
    const docs = d.documents.length;
    const posts = d.newsletters.length;
    const insider = d.insider.length;
    const intelScore = changes * 3 + docs * 2 + posts + insider * 2 + d.company.pages_indexed;
    return {
      id: d.company.id,
      name: d.company.name,
      domain: d.company.domain,
      pages: d.company.pages_indexed,
      changes,
      docs,
      posts,
      insider,
      lastScan: d.company.last_scraped_at,
      intelScore,
      fill: "",
      track: "",
    };
  });
  const max = Math.max(...rows.map((r) => r.intelScore), 1);
  const W = 14;
  return rows.map((r) => {
    const f = Math.round((r.intelScore / max) * W);
    const m = meter(Math.round((r.intelScore / max) * 100), W);
    return { ...r, fill: m.fill, track: m.track };
  });
}
