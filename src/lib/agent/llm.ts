import Anthropic from "@anthropic-ai/sdk";
import type { DetectedSignal } from "@/types/database";
import { HAIKU_MODEL, SONNET_MODEL } from "./pricing";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VALID_TYPES = [
  "pricing",
  "promo",
  "hiring",
  "site",
  "market",
  "expansion",
  "person",
  "newsletter",
] as const;

const VALID_SEVERITIES = ["low", "med", "high"] as const;

export interface LlmUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export async function detectSignals(
  oldText: string,
  newText: string,
  target: string,
  sourceUrl: string
): Promise<{ signals: DetectedSignal[]; usage: LlmUsage }> {
  const prompt = `You are a competitive intelligence analyst. Compare the OLD and NEW page content for target "${target}" (source: ${sourceUrl}).

Identify meaningful changes. Return STRICT JSON only — a JSON array with zero or more objects. Each object must have:
- type: one of ${VALID_TYPES.join("|")}
- title: short headline (max 80 chars)
- detail: one sentence explaining what changed
- severity: one of low|med|high

If nothing meaningful changed (only timestamps, session IDs, ads, or noise), return [].

OLD CONTENT:
${oldText.slice(0, 4000)}

NEW CONTENT:
${newText.slice(0, 4000)}`;

  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "[]";
  const signals = parseSignalsJson(text);

  return {
    signals,
    usage: {
      model: HAIKU_MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

export async function generateOnboardingBrief(intel: {
  companyName: string;
  domain: string;
  pages: Array<{ label: string; category: string; excerpt: string }>;
  documentCount: number;
  documentTypes: string[];
  secForms: string[];
  newsletterCount: number;
  insiderCount: number;
  highlights: Array<{ category: string; title: string; detail: string; amount?: string }>;
}): Promise<{ title: string; body: string; usage: LlmUsage }> {
  const pageSummary = intel.pages
    .slice(0, 10)
    .map((p) => `[${p.category}] ${p.label}: ${p.excerpt}`)
    .join("\n");

  const highlightSummary = intel.highlights
    .slice(0, 12)
    .map((h) => `[${h.category}] ${h.title}: ${h.detail}`)
    .join("\n");

  const prompt = `You are a competitive intelligence analyst writing the FIRST baseline brief for "${intel.companyName}" (${intel.domain}).

Indexed pages:
${pageSummary}

Extracted financial & corporate signals:
${highlightSummary || "none yet"}

Documents: ${intel.documentCount} (${intel.documentTypes.slice(0, 5).join(", ") || "none"})
SEC filings: ${intel.secForms.slice(0, 5).join(", ") || "none resolved"}
Content posts: ${intel.newsletterCount}
Org/hiring signals: ${intel.insiderCount}

Write a 4-5 sentence intelligence brief covering:
1. What the company does and its market position
2. Valuation, revenue, transactions, leverage, or dollar amounts found
3. Recent corporate actions and material activity
4. Investor relations, governance filings, and SEC importance
5. What to watch on the next scan

Return STRICT JSON only: {"title":"...","body":"..."}
Title: max 10 words. Body: plain prose, no bullet points, strategic tone.`;

  const response = await anthropic.messages.create({
    model: SONNET_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "{}";
  const parsed = parseBriefJson(text);

  return {
    ...parsed,
    usage: {
      model: SONNET_MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

export async function generateBrief(
  signals: DetectedSignal[],
  target: string,
  analysisModel: string
): Promise<{ title: string; body: string; usage: LlmUsage }> {
  // Phase 2: Gemini wiring — route to Google SDK when analysisModel starts with "gemini"
  if (analysisModel.startsWith("gemini")) {
    throw new Error(
      "Gemini brief generation is Phase 2. Use claude-sonnet for now."
    );
  }

  const signalSummary = signals
    .map((s) => `[${s.type}/${s.severity}] ${s.title}: ${s.detail}`)
    .join("\n");

  const prompt = `Write a 2-3 sentence intelligence brief about changes detected for target "${target}".

Signals:
${signalSummary}

Return STRICT JSON only: {"title":"...","body":"..."}
Title: max 12 words. Body: 2-3 sentences on what changed and why it matters strategically.`;

  const response = await anthropic.messages.create({
    model: SONNET_MODEL,
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "{}";
  const parsed = parseBriefJson(text);

  return {
    ...parsed,
    usage: {
      model: SONNET_MODEL,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

function parseSignalsJson(raw: string): DetectedSignal[] {
  const json = extractJson(raw);
  if (!Array.isArray(json)) return [];

  return json
    .filter(isRecord)
    .map((item) => ({
      type: VALID_TYPES.includes(item.type as (typeof VALID_TYPES)[number])
        ? (item.type as DetectedSignal["type"])
        : "site",
      title: String(item.title ?? "Untitled signal").slice(0, 120),
      detail: String(item.detail ?? "").slice(0, 500),
      severity: VALID_SEVERITIES.includes(
        item.severity as (typeof VALID_SEVERITIES)[number]
      )
        ? (item.severity as DetectedSignal["severity"])
        : "low",
    }))
    .filter((s) => s.title && s.detail);
}

function parseBriefJson(raw: string): { title: string; body: string } {
  const json = extractJson(raw);
  if (!isRecord(json)) {
    return { title: "Intelligence Update", body: raw.slice(0, 500) };
  }
  return {
    title: String(json.title ?? "Intelligence Update").slice(0, 120),
    body: String(json.body ?? "").slice(0, 2000),
  };
}

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/[\[{][\s\S]*[\]}]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
