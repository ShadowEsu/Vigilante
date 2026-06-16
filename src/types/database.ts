export type TargetType = "company" | "person" | "ticker";
export type AnalysisStatus = "live" | "paused";
export type SignalSeverity = "low" | "med" | "high";
export type SignalType =
  | "pricing"
  | "promo"
  | "hiring"
  | "site"
  | "market"
  | "expansion"
  | "person"
  | "newsletter";

export interface Profile {
  id: string;
  created_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  name: string;
  target_type: TargetType;
  target: string;
  sources: string[];
  cadence_minutes: number;
  model: string;
  budget_cap_usd: number;
  spend_usd: number;
  status: AnalysisStatus;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

export interface Snapshot {
  id: string;
  analysis_id: string;
  source_url: string;
  content_hash: string;
  raw_text: string;
  fetched_at: string;
}

export interface Signal {
  id: string;
  analysis_id: string;
  type: SignalType | string;
  title: string;
  detail: string;
  severity: SignalSeverity;
  source_url: string;
  created_at: string;
}

export interface Brief {
  id: string;
  analysis_id: string;
  title: string;
  body: string;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  analysis_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  created_at: string;
}

export interface DetectedSignal {
  type: SignalType;
  title: string;
  detail: string;
  severity: SignalSeverity;
}

export interface RunAnalysisResult {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  signalsCreated?: number;
  briefCreated?: boolean;
  baselineCreated?: boolean;
  error?: string;
}

export const MODEL_OPTIONS = [
  { value: "claude-sonnet", label: "Claude Sonnet" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Phase 2)" },
] as const;

export const TARGET_TYPE_OPTIONS: { value: TargetType; label: string }[] = [
  { value: "company", label: "Company" },
  { value: "person", label: "Person" },
  { value: "ticker", label: "Ticker" },
];

export const CADENCE_OPTIONS = [
  { value: 60, label: "Every hour" },
  { value: 360, label: "Every 6 hours" },
  { value: 1440, label: "Daily" },
  { value: 10080, label: "Weekly" },
];
