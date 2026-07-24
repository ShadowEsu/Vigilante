import Anthropic from "@anthropic-ai/sdk";

/**
 * Single source of truth for the LLM client.
 *
 * Two supported backends, both spoken over the Anthropic Messages API:
 *
 *  1. FreeLLMAPI (default) — a self-hosted OpenAI/Anthropic-compatible proxy
 *     that aggregates free tiers from ~28 providers behind one endpoint.
 *     Set ANTHROPIC_BASE_URL + ANTHROPIC_AUTH_TOKEN (a `freellmapi-...` key).
 *
 *  2. Anthropic direct — set ANTHROPIC_API_KEY and leave the two above unset.
 *
 * Do NOT set ANTHROPIC_API_KEY alongside ANTHROPIC_AUTH_TOKEN. The SDK's
 * authHeaders() prefers x-api-key over the Bearer token whenever apiKey is
 * non-null, so a stray key silently bypasses FreeLLMAPI auth and the request
 * fails. We pass `apiKey: null` in proxy mode to make that impossible.
 */

export type LlmBackend = "freellmapi" | "anthropic" | "none";

function trimEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const AUTH_TOKEN = trimEnv(process.env.ANTHROPIC_AUTH_TOKEN);
const BASE_URL = trimEnv(process.env.ANTHROPIC_BASE_URL);
const API_KEY = trimEnv(process.env.ANTHROPIC_API_KEY);

export function llmBackend(): LlmBackend {
  if (AUTH_TOKEN) return "freellmapi";
  if (API_KEY) return "anthropic";
  return "none";
}

/** True when any LLM backend is configured. Gate AI features on this, never on a raw key. */
export function aiEnabled(): boolean {
  return llmBackend() !== "none";
}

let cached: Anthropic | null = null;

/**
 * Returns the shared client, or null when no backend is configured.
 * Callers must handle null — the app is designed to degrade to
 * template-generated briefs rather than fail.
 */
export function getLlmClient(): Anthropic | null {
  if (cached) return cached;

  const backend = llmBackend();
  if (backend === "none") return null;

  cached =
    backend === "freellmapi"
      ? new Anthropic({
          // FreeLLMAPI exposes the Messages API at <base>/v1/messages, which is
          // exactly where the SDK posts, so the bare base URL is correct here.
          baseURL: BASE_URL ?? "http://localhost:3001",
          authToken: AUTH_TOKEN,
          apiKey: null,
        })
      : new Anthropic({ apiKey: API_KEY });

  return cached;
}

/** Human-readable backend label for /api/health and /api/status. */
export function llmBackendLabel(): string {
  switch (llmBackend()) {
    case "freellmapi":
      return `freellmapi (${BASE_URL ?? "http://localhost:3001"})`;
    case "anthropic":
      return "anthropic-direct";
    default:
      return "not-configured";
  }
}
