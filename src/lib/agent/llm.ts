import type { DetectedSignal } from "@/types/database";
import { AGENT_CONFIG } from "./config";
import { getLlmClient, llmBackend } from "./llm-client";

/** Throws when no backend is configured — callers already fall back to templates. */
function requireClient() {
  const client = getLlmClient();
  if (!client) {
    throw new Error(
      "No LLM backend configured — set ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN (FreeLLMAPI) or ANTHROPIC_API_KEY"
    );
  }
  return client;
}

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
  sourceUrl: string,
  /** Optional agent-specific brief telling the model what to prioritise. */
  focus?: string
): Promise<{ signals: DetectedSignal[]; usage: LlmUsage }> {
  const prompt = `You are a competitive intelligence analyst. Compare the OLD and NEW page content for target "${target}" (source: ${sourceUrl}).
${focus ? `\n${focus}\n` : ""}
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

  const model = AGENT_CONFIG.models.detect;
  const response = await requireClient().messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "[]";
  const signals = parseSignalsJson(text);

  return {
    signals,
    usage: {
      model,
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

  const model = AGENT_CONFIG.models.brief;
  // 600 was too tight: free-tier models are chattier than Sonnet and were
  // running out of budget mid-JSON, so the brief arrived truncated.
  const response = await requireClient().messages.create({
    model,
    max_tokens: 1600,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "{}";
  const parsed = parseBriefJson(text);

  return {
    ...parsed,
    usage: {
      model,
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
  const model = resolveBriefModel(analysisModel);

  const signalSummary = signals
    .map((s) => `[${s.type}/${s.severity}] ${s.title}: ${s.detail}`)
    .join("\n");

  const prompt = `Write a 2-3 sentence intelligence brief about changes detected for target "${target}".

Signals:
${signalSummary}

Return STRICT JSON only: {"title":"...","body":"..."}
Title: max 12 words. Body: 2-3 sentences on what changed and why it matters strategically.`;

  const response = await requireClient().messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "{}";
  const parsed = parseBriefJson(text);

  return {
    ...parsed,
    usage: {
      model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
  };
}

/**
 * Maps the UI-level model choice stored on an analysis (MODEL_OPTIONS) to a
 * concrete model ID. Previously this arg was accepted and then ignored, so
 * every brief silently ran on Sonnet regardless of what the user picked.
 *
 * Gemini used to hard-throw here ("Phase 2"). Through FreeLLMAPI it is just
 * another upstream provider, so it now resolves normally; against Anthropic
 * direct it falls back to the configured brief model rather than 404ing.
 */
function resolveBriefModel(analysisModel: string): string {
  const requested = analysisModel?.trim();
  if (!requested) return AGENT_CONFIG.models.brief;

  if (requested.startsWith("gemini")) {
    return llmBackend() === "freellmapi" ? requested : AGENT_CONFIG.models.brief;
  }

  // "claude-sonnet" is a UI alias, not a real model ID.
  if (requested === "claude-sonnet") return AGENT_CONFIG.models.brief;
  if (requested === "claude-haiku") return AGENT_CONFIG.models.detect;

  return requested;
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
  if (isRecord(json)) {
    return {
      title: String(json.title ?? "Intelligence Update").slice(0, 120),
      body: String(json.body ?? "").slice(0, 2000),
    };
  }

  // JSON.parse failed — usually because the model was cut off at max_tokens
  // mid-object. Salvage the fields by hand rather than dumping the raw
  // fragment into a user-visible brief (which is what used to happen).
  const salvaged = salvageBriefFields(raw);
  if (salvaged) return salvaged;

  return { title: "Intelligence Update", body: stripJsonNoise(raw).slice(0, 2000) };
}

/**
 * Pulls "title" and "body" out of a partial/malformed JSON object. Handles the
 * common truncation case where `body` opens but never closes.
 */
function salvageBriefFields(
  raw: string
): { title: string; body: string } | null {
  const title = raw.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1];

  // Closed body first; fall back to an unterminated one running to end-of-string.
  const body =
    raw.match(/"body"\s*:\s*"((?:[^"\\]|\\.)*)"/)?.[1] ??
    raw.match(/"body"\s*:\s*"((?:[^"\\]|\\.)*)$/)?.[1];

  if (!title && !body) return null;

  const unescape = (s: string) =>
    s.replace(/\\"/g, '"').replace(/\\n/g, " ").replace(/\\\\/g, "\\").trim();

  const cleanBody = body ? unescape(body) : "";

  return {
    title: (title ? unescape(title) : "Intelligence Update").slice(0, 120),
    // A truncated body is still useful prose, but trim a dangling partial word.
    body: cleanBody.replace(/\s+\S*$/, "").slice(0, 2000),
  };
}

/** Last resort: strip JSON scaffolding so the fallback body reads as prose. */
function stripJsonNoise(raw: string): string {
  return raw
    .replace(/```(?:json)?/gi, "")
    .replace(/^[\s{[]+/, "")
    .replace(/"(?:title|body)"\s*:\s*"?/gi, "")
    .replace(/["}\]]+\s*$/, "")
    .trim();
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
