import type { DetectedSignal } from "@/types/database";
import { isCareersUrl } from "./insider";
import { isDocumentUrl } from "./documents";
import { detectSignals, type LlmUsage } from "./llm";
import { aiEnabled } from "./llm-client";
import type { ChangeType, DetectedPageChange } from "./snapshot";

/**
 * The three monitoring agents the product is built around, plus a general
 * fallback for pages that belong to none of them.
 *
 * Until now these existed only as marketing copy: the local pipeline hashed
 * page text and guessed a category from keywords in the URL, so a pricing
 * change and a footer tweak were indistinguishable once hashes differed. Each
 * agent here contributes a domain-specific brief to the diff prompt, so the
 * model reports what actually changed rather than that *something* did.
 */
export type AgentId = "pricing" | "filings" | "hiring" | "general";

export interface Agent {
  id: AgentId;
  label: string;
  /** Claims a source URL for this agent. */
  matches: (url: string) => boolean;
  /** Domain guidance injected into the diff prompt. */
  focus: string;
  /** Signal type applied when the model returns something off-domain. */
  defaultType: DetectedSignal["type"];
}

export const AGENTS: Agent[] = [
  {
    id: "pricing",
    label: "Pricing Agent",
    matches: (url) => /pricing|\/plans|\/price|billing|\/cost/i.test(url),
    defaultType: "pricing",
    focus: `You are monitoring a PRICING page. Prioritise, in order:
1. Price changes — any tier whose amount moved, and the direction (old → new).
2. Plan structure — tiers added, removed, renamed, or merged.
3. Packaging — limits, quotas, seats, or features moved between tiers.
4. Commercial terms — trial length, billing period, discounts, promotions.
Report a price movement even if only one tier changed. Ignore copy rewrites,
testimonials, logo strips, and FAQ wording that leave the numbers intact.`,
  },
  {
    id: "filings",
    label: "Filings Agent",
    matches: (url) =>
      isDocumentUrl(url) || /investor|\/ir\b|sec\.gov|edgar|10-k|10-q|8-k|annual|proxy|governance|shareholder/i.test(url),
    defaultType: "market",
    focus: `You are monitoring an INVESTOR RELATIONS / SEC FILINGS page. Prioritise:
1. New filings — form type (10-K, 10-Q, 8-K, S-1, DEF 14A) and what it covers.
2. Reported figures — revenue, margin, guidance, and how they moved.
3. Corporate actions — M&A, buybacks, dividends, splits, restructuring.
4. Governance — board or executive changes, auditor changes, material events.
Always carry exact dollar amounts, percentages, and period labels into the
detail. Ignore boilerplate disclaimers and unchanged archive links.`,
  },
  {
    id: "hiring",
    label: "Hiring Agent",
    matches: (url) => isCareersUrl(url) || /career|\/jobs|hiring|\/join|greenhouse|lever\.co|ashbyhq/i.test(url),
    defaultType: "hiring",
    focus: `You are monitoring a HIRING / CAREERS page. Prioritise:
1. Net headcount direction — roles opened vs. removed since the last snapshot.
2. Function concentration — which teams are growing (sales, eng, infra, AI/ML).
3. Seniority and leadership — VP/Director/C-level openings signal strategy.
4. Geographic expansion — new offices, regions, or remote eligibility.
Treat a cluster of roles in one function as a strategic signal and say what it
implies. Ignore perks, culture copy, and benefits boilerplate.`,
  },
];

const GENERAL_AGENT: Agent = {
  id: "general",
  label: "Site Agent",
  matches: () => true,
  defaultType: "site",
  focus: `You are monitoring a general marketing or corporate page. Prioritise
product launches, positioning shifts, new customers or partners, and market
expansion. Ignore navigation, cookie banners, and legal boilerplate.`,
};

export function resolveAgent(url: string): Agent {
  return AGENTS.find((a) => a.matches(url)) ?? GENERAL_AGENT;
}

/** Maps a model-reported signal type onto the stored change taxonomy. */
function toChangeType(signalType: DetectedSignal["type"], fallback: ChangeType): ChangeType {
  switch (signalType) {
    case "pricing":
      return "pricing";
    case "promo":
      return "promo";
    case "hiring":
      return "hiring";
    case "newsletter":
      return "newsletter";
    case "market":
    case "expansion":
      return "document";
    case "site":
    case "person":
      return "site";
    default:
      return fallback;
  }
}

const SEVERITY_RANK: Record<DetectedSignal["severity"], number> = {
  high: 3,
  med: 2,
  low: 1,
};

export interface AgentAnalysis {
  agent: AgentId;
  agentLabel: string;
  signals: DetectedSignal[];
  usage: LlmUsage;
}

/**
 * Runs the agent that owns this URL over a real (non-baseline) diff.
 *
 * Returns null rather than throwing when AI is unavailable or the provider
 * rejects the call — free tiers rate-limit aggressively, and one throttled
 * page must not abort a whole scan. Callers keep their heuristic result.
 */
export async function analyzePageChange(params: {
  sourceUrl: string;
  oldText: string;
  newText: string;
  companyName: string;
}): Promise<AgentAnalysis | null> {
  if (!aiEnabled()) return null;

  const agent = resolveAgent(params.sourceUrl);

  try {
    const { signals, usage } = await detectSignals(
      params.oldText,
      params.newText,
      params.companyName,
      params.sourceUrl,
      agent.focus
    );
    if (signals.length === 0) return null;

    return { agent: agent.id, agentLabel: agent.label, signals, usage };
  } catch {
    return null;
  }
}

/**
 * Rewrites a heuristic change with what the agent actually found, keeping the
 * hashes (which are ground truth) and falling back field-by-field.
 */
export function applyAgentAnalysis(
  base: DetectedPageChange,
  analysis: AgentAnalysis
): DetectedPageChange {
  const ranked = [...analysis.signals].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  );
  const headline = ranked[0];
  if (!headline) return base;

  const change_type = toChangeType(headline.type, base.change_type);

  return {
    ...base,
    change_type,
    title: `${headline.title} — ${analysis.agentLabel}`,
    summary: headline.detail || base.summary,
    // Every signal becomes a bullet so secondary findings survive.
    bullets: ranked.map((s) => `${s.title}: ${s.detail}`).slice(0, 5),
    // The model may raise severity but not lower it below what the change
    // class warrants — it rated a 33% price rise "low", and a competitor
    // repricing is exactly what a subscriber is paying to be alerted about.
    severity: maxSeverity(headline.severity, baselineSeverityFor(change_type)),
  };
}

/** Floor severity by change class, mirroring the heuristic pipeline's weighting. */
function baselineSeverityFor(type: ChangeType): DetectedSignal["severity"] {
  if (type === "pricing" || type === "promo") return "high";
  if (type === "hiring" || type === "document") return "med";
  return "low";
}

function maxSeverity(
  a: DetectedSignal["severity"],
  b: DetectedSignal["severity"]
): DetectedSignal["severity"] {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}
