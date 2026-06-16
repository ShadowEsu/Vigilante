export const TYPE_COLOR: Record<string, string> = {
  pricing: "#E3B341",
  promo: "#D178C9",
  hiring: "#6FCF8E",
  person: "#5BC8D6",
  site: "#6E9BE6",
  newsletter: "#E8956D",
  document: "#A78BFA",
  insider: "#FC8C8C",
  stock: "#4ADE80",
  investments: "#60A5FA",
};

export const CADENCE = ["every 1h", "every 6h", "daily", "weekly"] as const;

export const SCAN_UNITS = ["minutes", "hours", "days", "weeks", "month"] as const;
export type ScanUnit = (typeof SCAN_UNITS)[number];

export const DEFAULT_SCAN_SETTINGS = {
  interval: 6,
  unit: "hours" as ScanUnit,
  maxPerDay: 4,
};

export const FONT_SCALE_PRESETS = [
  { label: "COMPACT", value: 1 },
  { label: "DEFAULT", value: 1.1 },
  { label: "COMFORT", value: 1.2 },
  { label: "LARGE", value: 1.3 },
] as const;

export const DEFAULT_DISPLAY_SETTINGS = { fontScale: 1.1 };

export function formatScanSchedule(interval: number, unit: ScanUnit): string {
  const n = Math.max(1, interval);
  const labels: Record<ScanUnit, string> = {
    minutes: n === 1 ? "minute" : "minutes",
    hours: n === 1 ? "hour" : "hours",
    days: n === 1 ? "day" : "days",
    weeks: n === 1 ? "week" : "weeks",
    month: "month",
  };
  return `every ${n} ${labels[unit]}`;
}

export const WIDGET_DEFS = {
  usage: { label: "USAGE ANALYTICS", desc: "Your watches, spend, and scan activity" },
  watchlists: { label: "WATCHLISTS", desc: "Live status of active watches" },
  company_analytics: { label: "COMPANY ANALYTICS", desc: "Intel breakdown, signal coverage, source map" },
  sources: { label: "SOURCE MAP", desc: "Indexed URLs grouped by intel category" },
  timeline: { label: "INTEL TIMELINE", desc: "Unified feed — changes, docs, content, org moves" },
  compare: { label: "TARGET COMPARE", desc: "Side-by-side intel density across watches" },
  changes: { label: "CHANGES FEED", desc: "Page diffs detected from snapshots" },
  brief: { label: "BRIEF", desc: "AI-generated intelligence summary" },
  insider: { label: "INSIDER INTEL", desc: "Hires, departures, layoffs, role changes" },
  stock: { label: "LIVE TICKERS", desc: "Stock prices and market movements" },
  newsletters: { label: "NEWSLETTERS", desc: "Blog posts, keyword trends, content" },
  documents: { label: "DOCUMENTS", desc: "Filings, spend reports, share activity" },
} as const;

export const DEFAULT_WIDGETS: Record<WidgetKey, boolean> = {
  usage: true,
  watchlists: true,
  company_analytics: true,
  sources: true,
  timeline: true,
  compare: true,
  changes: true,
  brief: true,
  insider: true,
  stock: true,
  newsletters: true,
  documents: true,
};

export type WidgetKey = keyof typeof WIDGET_DEFS;
export type ViewId =
  | "overview"
  | "analytics"
  | "watchlists"
  | "changes"
  | "brief"
  | "documents"
  | "insights"
  | "newsletter"
  | "market"
  | "ai"
  | "settings"
  | "new";

export const NAV: { id: ViewId; idx: string; label: string; hint: string }[] = [
  { id: "overview", idx: "01", label: "OVERVIEW", hint: "⌘1" },
  { id: "analytics", idx: "02", label: "ANALYTICS", hint: "⌘2" },
  { id: "watchlists", idx: "03", label: "WATCHLISTS", hint: "⌘3" },
  { id: "changes", idx: "04", label: "CHANGES", hint: "⌘4" },
  { id: "brief", idx: "05", label: "BRIEF", hint: "⌘5" },
  { id: "documents", idx: "06", label: "DOCUMENTS", hint: "⌘6" },
  { id: "insights", idx: "07", label: "INSIGHTS", hint: "⌘7" },
  { id: "newsletter", idx: "08", label: "NEWS", hint: "⌘8" },
  { id: "market", idx: "09", label: "MARKET", hint: "⌘9" },
  { id: "ai", idx: "10", label: "AI", hint: "⌘K" },
  { id: "settings", idx: "11", label: "SETTINGS", hint: "⌘," },
];

export type CompanyKey = "GOOGLE" | "STRIPE";

export const BLOG_KEYWORDS: Record<CompanyKey, string[]> = {
  GOOGLE: ["Gemini", "AI", "Android", "Cloud", "DeepMind", "Pixel", "Workspace", "Search"],
  STRIPE: ["Payments", "Billing", "Connect", "Radar", "Treasury", "Issuing", "Capital", "Sigma"],
};

export const WATCHES = [
  { id: "google", name: "GOOGLE — MONITOR", status: "live", kind: "company", target: "google.com", cadence: "every 6h", pages: 7, spend: 0, budget: 5.0, pct: 0 },
  { id: "stripe", name: "STRIPE — MONITOR", status: "live", kind: "company", target: "stripe.com", cadence: "every 6h", pages: 6, spend: 0, budget: 5.0, pct: 0 },
];

export const ACTIVITY = [
  { day: "Jun 01", count: 1 }, { day: "Jun 02", count: 1 }, { day: "Jun 03", count: 2 },
  { day: "Jun 04", count: 1 }, { day: "Jun 05", count: 2 }, { day: "Jun 06", count: 3 },
  { day: "Jun 07", count: 2 }, { day: "Jun 08", count: 2 }, { day: "Jun 09", count: 3 },
  { day: "Jun 10", count: 4 }, { day: "Jun 11", count: 5 }, { day: "Jun 12", count: 3 },
  { day: "Jun 13", count: 6 }, { day: "Jun 14", count: 8 },
];

export const SCAN_LOG = [
  { date: "Jun 14", time: "08:33 PM", watch: "Acme Corp — Pricing", findings: 3, ms: "1.2s", cost: "$0.04" },
  { date: "Jun 14", time: "07:18 PM", watch: "Acme Corp — Pricing", findings: 1, ms: "0.9s", cost: "$0.03" },
  { date: "Jun 14", time: "04:18 PM", watch: "Jane Doe — LinkedIn", findings: 1, ms: "0.8s", cost: "$0.02" },
  { date: "Jun 13", time: "07:18 PM", watch: "Acme Corp — Pricing", findings: 1, ms: "1.1s", cost: "$0.04" },
];

export const STOCKS = [
  { ticker: "NVDA", price: "124.50", chg: "+3.2%", dir: "▲", note: "insider buy Jun 12 · $2.1M block", spark: "▁▂▁▃▄▅▄▆▇▆▇█▇█" },
  { ticker: "CRM", price: "218.30", chg: "-1.1%", dir: "▼", note: "earnings beat Jun 10 · +8% AH", spark: "█▇▆▇▅▆▄▅▃▄▃▂▃▂" },
  { ticker: "MSFT", price: "420.10", chg: "+0.4%", dir: "→", note: "Azure growth +29% YoY", spark: "▄▄▅▄▅▅▄▅▄▄▅▄▅▅" },
];

export const DOCUMENTS = [
  { company: "Acme Corp", title: "FY2025 Annual Report (10-K)", docType: "SEC 10-K", category: "Financial filing", filed: "Jun 12", url: "https://acme.com/investors/annual-report-2025.pdf", excerpt: "Total R&D spend $48M · share repurchase $12M authorized", scraped_at: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { company: "Acme Corp", title: "Q1 Investor Presentation", docType: "INVESTOR DECK", category: "Investor relations", filed: "Jun 03", url: "https://acme.com/investors/q1-deck", excerpt: "Enterprise ARR $120M · 34% YoY growth", scraped_at: new Date(Date.now() - 11 * 86400_000).toISOString() },
  { company: "Competitor X", title: "Form 4 — Insider purchase", docType: "INSIDER FILING", category: "Share activity", filed: "May 28", url: "https://sec.gov/cgi-bin/form4?id=example", excerpt: "CEO acquired 15,000 shares at $42.10", scraped_at: new Date(Date.now() - 17 * 86400_000).toISOString() },
  { company: "Acme Corp", title: "Capital expenditure outlook", docType: "SPEND REPORT", category: "Capital & spend", filed: "May 14", url: "https://acme.com/investors/capex-outlook", excerpt: "FY26 capex guided $22–26M · infra expansion EMEA", scraped_at: new Date(Date.now() - 31 * 86400_000).toISOString() },
];

export const NEWSLETTERS = [
  { name: "Acme Product Digest", company: "Acme Corp", received: "Jun 14", subject: "Introducing Pro tier — now more powerful", url: "https://acme.com/blog/pro-tier-launch", scraped_at: new Date(Date.now() - 2 * 3600_000 - 14 * 60_000 - 33_000).toISOString(), changes: ["New pricing section added", "Hero changed to enterprise copy", "3 new feature announcements"] },
  { name: "Competitor Weekly", company: "Competitor X", received: "Jun 11", subject: "Summer launch preview — pricing changes", url: "https://competitorx.com/news/summer-preview", scraped_at: new Date(Date.now() - 3 * 86400_000 - 5 * 3600_000).toISOString(), changes: ["Pricing removed from nav", "New enterprise page linked", "Tone: mid-market → enterprise"] },
  { name: "Acme Growth Letter", company: "Acme Corp", received: "Jun 07", subject: "EMEA expansion: what's next", url: "https://acme.com/blog/emea-expansion", scraped_at: new Date(Date.now() - 7 * 86400_000 - 2 * 3600_000).toISOString(), changes: ["New EMEA sales team intro", "4 open roles linked", "Regional pricing hinted"] },
];

export const CHANGES = [
  { change_type: "pricing", title: "PRICING change — acme.com/pricing", summary: "New price points: $49/mo, $199/mo", source_url: "https://acme.com/pricing", source_label: "acme.com/pricing", detected_at: new Date(Date.now() - 45 * 60_000 - 12_000).toISOString(), severity: "high" as const, is_baseline: false, bullets: ["Pro tier raised from $39 to $49", "Annual discount banner added"] },
  { change_type: "hiring", title: "HIRING change — acme.com/careers", summary: "3× Enterprise AE (EMEA) roles posted", source_url: "https://acme.com/careers", source_label: "acme.com/careers", detected_at: new Date(Date.now() - 2 * 3600_000 - 18 * 60_000).toISOString(), severity: "med" as const, is_baseline: false, bullets: ["Page grew ~120 words since last snapshot"] },
  { change_type: "newsletter", title: "NEWSLETTER change — acme.com/blog", summary: "New post: Introducing Pro tier", source_url: "https://acme.com/blog", source_label: "acme.com/blog", detected_at: new Date(Date.now() - 28 * 3600_000).toISOString(), severity: "med" as const, is_baseline: false, bullets: ["New post linked from blog index"] },
  { change_type: "site", title: "Page indexed — acme.com/about", summary: "Baseline snapshot stored (842 words)", source_url: "https://acme.com/about", source_label: "acme.com/about", detected_at: new Date(Date.now() - 30 * 3600_000).toISOString(), severity: "low" as const, is_baseline: true, bullets: ["Monitoring started on acme.com/about"] },
];

export const INSIDER = [
  { moveType: "LEADERSHIP", person: "Sundar Pichai", role: "CEO", company: "Google", date: "Jun 15", note: "Listed on Google leadership / press pages", source_url: "https://blog.google/authors/sundar-pichai/" },
  { moveType: "LEADERSHIP", person: "Ruth Porat", role: "President & CIO", company: "Google", date: "Jun 15", note: "Executive leadership — Alphabet / Google", source_url: "https://blog.google/inside-google/company-announcements/ruth-porat/" },
  { moveType: "LEADERSHIP", person: "Philipp Schindler", role: "Chief Business Officer", company: "Google", date: "Jun 15", note: "Ads & commerce leadership", source_url: "https://blog.google/authors/philipp-schindler/" },
  { moveType: "LEADERSHIP", person: "Anat Ashkenazi", role: "CFO", company: "Google", date: "Jun 15", note: "Finance leadership", source_url: "https://blog.google/inside-google/company-announcements/anat-ashkenazi-cfo/" },
  { moveType: "ROLE POSTED", person: "Google careers", role: "120+ open roles", company: "Google", date: "Jun 14", note: "Active hiring on careers page", source_url: "https://careers.google.com/" },
];

export const INSIDER_STRIPE = [
  { moveType: "LEADERSHIP", person: "Patrick Collison", role: "CEO", company: "Stripe", date: "Jun 15", note: "Co-founder & CEO — leadership page", source_url: "https://stripe.com/newsroom/information" },
  { moveType: "LEADERSHIP", person: "John Collison", role: "President", company: "Stripe", date: "Jun 15", note: "Co-founder & President", source_url: "https://stripe.com/newsroom/information" },
  { moveType: "LEADERSHIP", person: "Will Gaybrick", role: "President, Product & Business", company: "Stripe", date: "Jun 15", note: "Product & business leadership", source_url: "https://stripe.com/newsroom/information" },
  { moveType: "LEADERSHIP", person: "Eileen O'Mara", role: "Chief Revenue Officer", company: "Stripe", date: "Jun 15", note: "Revenue leadership", source_url: "https://stripe.com/newsroom/information" },
  { moveType: "ROLE POSTED", person: "Stripe careers", role: "200+ open roles", company: "Stripe", date: "Jun 14", note: "Global hiring on jobs page", source_url: "https://stripe.com/jobs" },
];

export function companyKeyFromName(name: string): CompanyKey {
  return name.toUpperCase().includes("STRIPE") ? "STRIPE" : "GOOGLE";
}

export function mockInsiderFor(company: string) {
  return companyKeyFromName(company) === "STRIPE" ? INSIDER_STRIPE : INSIDER;
}

export function mockBlogKeywordsFor(company: string): string[] {
  return BLOG_KEYWORDS[companyKeyFromName(company)];
}

export const INVESTMENTS = [
  { company: "Acme Corp", type: "ACQUISITION", target: "DataSync AI", amount: "$12M", date: "Jun 10", note: "Data pipeline AI — may compete with your stack" },
  { company: "Acme Corp", type: "INVESTMENT", target: "Runway AI (Series A)", amount: "$4.5M", date: "May 28", note: "Portfolio AI bet — signals strategy shift" },
  { company: "Competitor X", type: "FUNDING", target: "Series B round", amount: "$45M", date: "May 15", note: "24mo runway — aggressive hiring expected" },
];

export const BRIEF = {
  title: "ACME MOVES UPMARKET ON PRICING",
  body: "Acme raised Pro pricing 12% and launched an annual discount push, signaling confidence and a hunt for higher-ACV customers. Combined with new EMEA hires and an SVP Engineering from Stripe, they may be preparing a regional expansion play worth monitoring closely.",
  date: "Jun 14",
  time: "08:33 PM",
  sources: 4,
  confidence: 82,
};

export const NOTIF_ROWS = [
  { label: "PRICING", color: TYPE_COLOR.pricing, email: "[x]", slack: "[ ]", digest: "[x]" },
  { label: "CHANGES", color: TYPE_COLOR.site, email: "[x]", slack: "[x]", digest: "[x]" },
  { label: "HIRING", color: TYPE_COLOR.hiring, email: "[x]", slack: "[ ]", digest: "[x]" },
  { label: "INSIDER", color: TYPE_COLOR.insider, email: "[x]", slack: "[x]", digest: "[x]" },
  { label: "NEWSLETTER", color: TYPE_COLOR.newsletter, email: "[x]", slack: "[ ]", digest: "[ ]" },
  { label: "DOCUMENTS", color: TYPE_COLOR.document, email: "[ ]", slack: "[ ]", digest: "[x]" },
  { label: "STOCK", color: TYPE_COLOR.stock, email: "[x]", slack: "[x]", digest: "[ ]" },
];

/** Intel category counts for analytics BY TYPE bars (demo) */
export const INTEL_TYPE_BARS: [string, number][] = [
  ["pricing", 5], ["hiring", 3], ["newsletter", 4], ["document", 3], ["insider", 2], ["site", 2],
];
