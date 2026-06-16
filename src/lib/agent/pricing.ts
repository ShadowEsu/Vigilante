// Token pricing per 1M tokens (USD) — update as provider pricing changes
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-haiku-3-5-20241022": { input: 0.8, output: 4.0 },
  "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
  // Phase 2: Gemini pricing plug-in
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = PRICING[model] ?? PRICING["claude-3-5-sonnet-20241022"];
  const cost =
    (inputTokens / 1_000_000) * rates.input +
    (outputTokens / 1_000_000) * rates.output;
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export const HAIKU_MODEL = "claude-haiku-3-5-20241022";
export const SONNET_MODEL = "claude-3-5-sonnet-20241022";
