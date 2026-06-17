import { pipelineStatus } from "@/lib/agent/pipeline";
import { apiOk } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const pipeline = pipelineStatus();
  return apiOk({
    status: "ok",
    product: "VIGILANTE",
    entity: "Vigilant Intelligence, Inc.",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    pipeline,
  });
}
