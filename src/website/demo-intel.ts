import type { DiscoverResult } from "@/vigil/TerminalSearch";

export function demoSignalCategories(sources: string[]): string[] {
  const cats = new Set<string>();
  for (const url of sources) {
    const u = url.toLowerCase();
    if (/pricing|plans|billing/.test(u)) cats.add("PRICING");
    if (/career|jobs|hiring/.test(u)) cats.add("HIRING");
    if (/investor|ir\/|sec\.gov|edgar|10-k|governance|proxy/.test(u)) cats.add("SEC");
    if (/g2\.com|trustpilot|capterra/.test(u)) cats.add("REVIEWS");
    if (/blog|news|press|newsroom/.test(u)) cats.add("NEWS");
    if (/about|company/.test(u)) cats.add("CORPORATE");
  }
  if (cats.size === 0) cats.add("SITE");
  return Array.from(cats).slice(0, 5);
}

export function demoInsightItems(discovered: DiscoverResult) {
  const name = discovered.name.toUpperCase();
  const count = discovered.sources.length;
  const hasInvestor = discovered.sources.some((s) => /investor|sec|edgar/i.test(s));
  const hasPricing = discovered.sources.some((s) => /pricing|plans/i.test(s));
  const hasCareers = discovered.sources.some((s) => /career|jobs/i.test(s));

  const items = [
    {
      cat: "COVERAGE",
      amt: String(count),
      text: `${count} reachable sources mapped across ${discovered.domain}`,
      color: "#6E9BE6",
    },
  ];

  if (hasInvestor) {
    items.push({
      cat: "FINANCIAL",
      amt: "",
      text: `Investor relations and SEC filings indexed for ${name}`,
      color: "#60A5FA",
    });
  }
  if (hasPricing) {
    items.push({
      cat: "PRICING",
      amt: "",
      text: `Pricing and packaging pages queued for change detection`,
      color: "#E3B341",
    });
  }
  if (hasCareers) {
    items.push({
      cat: "CORPORATE",
      amt: "",
      text: `Careers velocity and hiring signals on watch for ${name}`,
      color: "#FC8C8C",
    });
  }

  if (items.length < 3) {
    items.push({
      cat: "ACTIVITY",
      amt: "",
      text: `Baseline scan complete — next diff run scheduled against ${discovered.domain}`,
      color: "#6FCF8E",
    });
  }

  return items.slice(0, 3);
}

export function demoBriefCopy(discovered: DiscoverResult): string {
  const cats = demoSignalCategories(discovered.sources).join(", ");
  return `Initial intel pass indexed ${discovered.sources.length} reachable sources for ${discovered.name}. Signal coverage: ${cats}. Monitoring ${discovered.domain} for pricing, filings, governance, and product changes. Next scan will diff against these baselines.`;
}

export const DEMO_FALLBACK: DiscoverResult = {
  name: "Stripe",
  domain: "stripe.com",
  sources: [
    "https://stripe.com/pricing",
    "https://stripe.com/jobs",
    "https://investors.stripe.com",
    "https://stripe.com/newsroom",
  ],
};
