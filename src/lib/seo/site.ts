/** Canonical site URL — include subpath for GitHub Pages (e.g. /Vigilante). */
const DEFAULT_SITE_URL = "https://shadowesu.github.io/Vigilante";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base.endsWith(normalized)) return base;
  return `${base}${normalized}`;
}

export const SEO = {
  siteName: "Vigilante",
  legalName: "Vigilant Intelligence, Inc.",
  tagline: "Competitive intelligence monitoring with AI agents",
  defaultTitle: "Vigilante — AI Competitive Intelligence & Competitor Monitoring",
  defaultDescription:
    "Monitor competitor pricing, SEC filings, hiring pages, and product changes with 3 AI agents. Daily diffs, sourced briefs, and Slack alerts from $10/mo.",
  locale: "en_US",
  twitterHandle: "@vigilantapp",
  supportEmail: "support@vigilant.app",
  keywords: [
    "competitive intelligence",
    "competitor analysis",
    "competitor monitoring",
    "competitive intelligence software",
    "competitor tracking tool",
    "pricing page monitoring",
    "SEC EDGAR monitoring",
    "competitor intelligence platform",
    "AI competitive analysis",
    "competitor research automation",
    "market intelligence",
    "competitive benchmarking",
  ],
} as const;
