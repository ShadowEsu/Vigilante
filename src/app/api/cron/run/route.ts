import { runAnalysis } from "@/lib/agent/run";
import { apiError, apiOk } from "@/lib/api/http";
import { assertCronAuthorized } from "@/lib/auth/cron";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return apiError("Cron not configured", 503, "SERVICE_UNAVAILABLE");
  }

  if (!assertCronAuthorized(request)) {
    return apiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const { data: due, error } = await supabase
    .from("analyses")
    .select("id, target")
    .eq("status", "live")
    .or(`next_run_at.is.null,next_run_at.lte."${now}"`)
    .order("next_run_at", { ascending: true, nullsFirst: true })
    .limit(Number(process.env.CRON_BATCH_SIZE ?? 10));

  if (error) {
    return apiError(error.message, 500, "INTERNAL_ERROR");
  }

  const results: Array<{ id: string; target: string; result: Awaited<ReturnType<typeof runAnalysis>> }> = [];

  for (const row of due ?? []) {
    const result = await runAnalysis(row.id);
    results.push({ id: row.id, target: row.target, result });
  }

  return apiOk({
    ran: results.length,
    results,
  });
}
