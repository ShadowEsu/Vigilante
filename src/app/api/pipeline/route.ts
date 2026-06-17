import { pipelineStatus } from "@/lib/agent/pipeline";
import { apiOk } from "@/lib/api/http";

export const dynamic = "force-dynamic";

/** Integration discovery — models, stages, feature flags. */
export async function GET() {
  return apiOk({ pipeline: pipelineStatus() });
}
