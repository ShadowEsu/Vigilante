import { AUTO_MODEL, HAIKU_MODEL, SONNET_MODEL } from "./pricing";
import { aiEnabled, llmBackend, llmBackendLabel } from "./llm-client";

/**
 * `??` only falls back on undefined, but an env var declared-but-empty in
 * .env.local (e.g. `AGENT_DETECT_MODEL=`) is the empty string — which passed
 * through and blanked every model ID. `||` is correct here.
 */
function envModel(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function envNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value?.trim());
  return Number.isFinite(parsed) && value?.trim() ? parsed : fallback;
}

/**
 * On FreeLLMAPI, default every stage to the "auto" router so requests land on
 * whichever free-tier provider is healthy. Pinned Claude IDs stay the default
 * when talking to Anthropic directly.
 */
const DEFAULT_MODELS =
  llmBackend() === "freellmapi"
    ? { detect: AUTO_MODEL, brief: AUTO_MODEL, ask: AUTO_MODEL }
    : { detect: HAIKU_MODEL, brief: SONNET_MODEL, ask: SONNET_MODEL };

/** Central AI + pipeline configuration — single source for integrations. */
export const AGENT_CONFIG = {
  version: "1.1.0",
  pipeline: "vigilante-intel-v1",

  models: {
    detect: envModel(process.env.AGENT_DETECT_MODEL, DEFAULT_MODELS.detect),
    brief: envModel(process.env.AGENT_BRIEF_MODEL, DEFAULT_MODELS.brief),
    ask: envModel(process.env.AGENT_ASK_MODEL, DEFAULT_MODELS.ask),
  },

  llm: {
    backend: llmBackend(),
    label: llmBackendLabel(),
  },

  limits: {
    maxSourceChars: envNumber(process.env.AGENT_MAX_SOURCE_CHARS, 12_000),
    maxSignalsPerRun: envNumber(process.env.AGENT_MAX_SIGNALS, 24),
    defaultCadenceMinutes: envNumber(process.env.AGENT_DEFAULT_CADENCE_MIN, 1440),
    defaultBudgetUsd: envNumber(process.env.AGENT_DEFAULT_BUDGET_USD, 10),
  },

  features: {
    ai: aiEnabled(),
    search: Boolean(
      process.env.SERPER_API_KEY ||
        (process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID)
    ),
    sec: true,
    gemini: Boolean(process.env.GOOGLE_API_KEY),
    cron: Boolean(process.env.CRON_SECRET),
    webhooks: Boolean(process.env.WEBHOOK_URL || process.env.VIGILANTE_SLACK_WEBHOOK_URL),
  },

  storage: {
    mode: (process.env.VIGILANTE_STORAGE ?? "local") as "local" | "supabase",
    supabase: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
  },
} as const;

export type PipelineStage =
  | "discover"
  | "fetch"
  | "diff"
  | "extract"
  | "brief"
  | "persist"
  | "notify";

export type AgentCapability = keyof typeof AGENT_CONFIG.features;
