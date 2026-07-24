// Token pricing per 1M tokens (USD) — update as provider pricing changes
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4.0 },
  "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-2.5-flash": { input: 0.3, output: 2.5 },
};

/**
 * Models served off a free tier cost nothing, so they must not accrue spend —
 * otherwise runs trip the per-analysis budget cap for no reason. "auto" is
 * FreeLLMAPI's router pseudo-model, which always lands on a free-tier provider.
 */
const FREE_MODELS = new Set(["auto"]);

export function isFreeModel(model: string): boolean {
  return FREE_MODELS.has(model) || model.startsWith("freellmapi/");
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  if (isFreeModel(model)) return 0;

  const rates = PRICING[model] ?? PRICING["claude-3-5-sonnet-20241022"];
  const cost =
    (inputTokens / 1_000_000) * rates.input +
    (outputTokens / 1_000_000) * rates.output;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

// Fixed: was "claude-haiku-3-5-20241022", which is not a real model ID and 404s.
export const HAIKU_MODEL = "claude-3-5-haiku-20241022";
export const SONNET_MODEL = "claude-3-5-sonnet-20241022";

/** FreeLLMAPI router pseudo-model — picks the best healthy free-tier model per request. */
export const AUTO_MODEL = "auto";
