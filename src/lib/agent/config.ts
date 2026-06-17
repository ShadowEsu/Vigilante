import { HAIKU_MODEL, SONNET_MODEL } from "./pricing";

/** Central AI + pipeline configuration — single source for integrations. */
export const AGENT_CONFIG = {
  version: "1.1.0",
  pipeline: "vigilante-intel-v1",

  models: {
    detect: process.env.AGENT_DETECT_MODEL ?? HAIKU_MODEL,
    brief: process.env.AGENT_BRIEF_MODEL ?? SONNET_MODEL,
    ask: process.env.AGENT_ASK_MODEL ?? SONNET_MODEL,
  },

  limits: {
    maxSourceChars: Number(process.env.AGENT_MAX_SOURCE_CHARS ?? 12_000),
    maxSignalsPerRun: Number(process.env.AGENT_MAX_SIGNALS ?? 24),
    defaultCadenceMinutes: Number(process.env.AGENT_DEFAULT_CADENCE_MIN ?? 1440),
    defaultBudgetUsd: Number(process.env.AGENT_DEFAULT_BUDGET_USD ?? 10),
  },

  features: {
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
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
