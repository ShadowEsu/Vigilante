/**
 * Unified agent pipeline entry points.
 * Supabase analyses (auth) + local company store (demo/preview) share the same AI stages.
 */
import { AGENT_CONFIG, type PipelineStage } from "./config";
import { runAnalysis } from "./run";
import { onboardCompany, runCompanyScrape, rediscoverCompany } from "@/lib/company/company-run";

export { AGENT_CONFIG, type PipelineStage };
export { runAnalysis };
export { onboardCompany, runCompanyScrape, rediscoverCompany };

export const PIPELINE_STAGES: PipelineStage[] = [
  "discover",
  "fetch",
  "diff",
  "extract",
  "brief",
  "persist",
  "notify",
];

export function pipelineStatus() {
  return {
    version: AGENT_CONFIG.version,
    pipeline: AGENT_CONFIG.pipeline,
    stages: PIPELINE_STAGES,
    models: AGENT_CONFIG.models,
    features: AGENT_CONFIG.features,
    storage: AGENT_CONFIG.storage,
  };
}
