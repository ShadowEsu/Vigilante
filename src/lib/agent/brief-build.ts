import { generateOnboardingBrief } from "./llm";
import { pathLabel } from "./snapshot";

export interface ScrapedPageIntel {
  url: string;
  label: string;
  category: string;
  excerpt: string;
}

export interface OnboardingIntel {
  companyName: string;
  domain: string;
  pages: ScrapedPageIntel[];
  documentCount: number;
  documentTypes: string[];
  secForms: string[];
  newsletterCount: number;
  insiderCount: number;
  highlights: Array<{ category: string; title: string; detail: string; amount?: string }>;
}

function cleanExcerpt(text: string, max = 220): string {
  return text
    .replace(/&deg;/g, "°")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function excerptFromPageText(text: string): string {
  const cleaned = cleanExcerpt(text, 400);
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 24);
  return cleanExcerpt(sentences[0] ?? cleaned, 220);
}

export function buildTemplateBrief(intel: OnboardingIntel): { title: string; body: string; confidence: number } {
  const { companyName, pages, documentCount, documentTypes, secForms, newsletterCount, insiderCount } = intel;

  const byCategory = new Map<string, string[]>();
  for (const p of pages) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p.label);
    byCategory.set(p.category, list);
  }

  const surfaces: string[] = [];
  for (const [cat, labels] of Array.from(byCategory.entries())) {
    surfaces.push(`${cat.toLowerCase()} (${labels.slice(0, 2).join(", ")})`);
  }

  const parts: string[] = [];

  parts.push(
    `${companyName} initial intel pass indexed ${pages.length} reachable source${pages.length === 1 ? "" : "s"} on ${intel.domain}.`
  );

  if (surfaces.length > 0) {
    parts.push(`Active surfaces: ${surfaces.slice(0, 5).join("; ")}.`);
  }

  if (secForms.length > 0) {
    parts.push(
      `SEC EDGAR: ${secForms.slice(0, 4).join(", ")} on file — monitor 10-K/10-Q for revenue guidance, 8-K for material events, DEF 14A for governance.`
    );
  } else if (documentCount > 0) {
    parts.push(
      `${documentCount} investor document${documentCount === 1 ? "" : "s"} indexed (${documentTypes.slice(0, 3).join(", ") || "filings & IR materials"}).`
    );
  }

  if (newsletterCount > 0) {
    parts.push(`${newsletterCount} content post${newsletterCount === 1 ? "" : "s"} captured from blog/news surfaces.`);
  }

  if (insiderCount > 0) {
    parts.push(`${insiderCount} org/hiring signal${insiderCount === 1 ? "" : "s"} from careers pages.`);
  }

  const { highlights } = intel;
  if (highlights.length > 0) {
    const money = highlights.filter((h) => h.amount).slice(0, 3);
    const actions = highlights.filter((h) => h.category === "corporate_action" || h.category === "transaction").slice(0, 2);
    if (money.length > 0) {
      parts.push(
        `Financial signals: ${money.map((h) => h.detail.slice(0, 100)).join(" · ")}.`
      );
    }
    if (actions.length > 0) {
      parts.push(
        `Corporate actions: ${actions.map((h) => h.detail.slice(0, 90)).join(" · ")}.`
      );
    }
    const valuations = highlights.filter((h) => h.category === "valuation").slice(0, 1);
    if (valuations.length > 0) {
      parts.push(valuations[0].detail);
    }
  }

  parts.push("Next scan will diff against these baselines — pricing, governance, and IR changes surface first.");

  return {
    title: `${companyName} — Initial Intel Baseline`,
    body: parts.join(" "),
    confidence: Math.min(72, 48 + pages.length * 3 + (secForms.length > 0 ? 10 : 0)),
  };
}

export async function buildIntelBrief(intel: OnboardingIntel): Promise<{ title: string; body: string; confidence: number }> {
  const template = buildTemplateBrief(intel);

  if (!process.env.ANTHROPIC_API_KEY || intel.pages.length === 0) {
    return template;
  }

  try {
    const llm = await generateOnboardingBrief(intel);
    return {
      title: llm.title,
      body: llm.body,
      confidence: Math.min(82, template.confidence + 8),
    };
  } catch {
    return template;
  }
}

export function pageIntelFromScrape(
  url: string,
  text: string,
  category: string
): ScrapedPageIntel {
  return {
    url,
    label: pathLabel(url),
    category,
    excerpt: excerptFromPageText(text),
  };
}
