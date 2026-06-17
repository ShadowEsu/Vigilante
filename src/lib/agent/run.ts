import { createServiceClient } from "@/lib/supabase/admin";
import { eventId } from "@/lib/integrations/events";
import { dispatchEvent, pipelineVersion } from "@/lib/integrations/notify";
import { fetchPageText, hashContent } from "./fetch";
import {
  detectSignals,
  generateBrief,
  type LlmUsage,
} from "./llm";
import { calculateCost } from "./pricing";
import type { Analysis, DetectedSignal, RunAnalysisResult } from "@/types/database";

function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function runAnalysis(analysisId: string): Promise<RunAnalysisResult> {
  const supabase = createServiceClient();

  const { data: analysis, error: loadError } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .single<Analysis>();

  if (loadError || !analysis) {
    return { ok: false, error: loadError?.message ?? "Analysis not found" };
  }

  if (analysis.status !== "live") {
    return { ok: true, skipped: true, reason: "Analysis is paused" };
  }

  if (Number(analysis.spend_usd) >= Number(analysis.budget_cap_usd)) {
    return { ok: true, skipped: true, reason: "Budget cap reached" };
  }

  const sources: string[] = Array.isArray(analysis.sources)
    ? analysis.sources
    : [];

  if (sources.length === 0) {
    return { ok: false, error: "No sources configured" };
  }

  const allDetected: Array<DetectedSignal & { source_url: string }> = [];
  const usageRecords: LlmUsage[] = [];
  let baselineCreated = false;

  for (const sourceUrl of sources) {
    let newText: string;
    try {
      newText = await fetchPageText(sourceUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Fetch failed";
      return { ok: false, error: `Source fetch failed (${sourceUrl}): ${message}` };
    }

    const newHash = hashContent(newText);

    const { data: latestSnapshot } = await supabase
      .from("snapshots")
      .select("*")
      .eq("analysis_id", analysisId)
      .eq("source_url", sourceUrl)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestSnapshot && latestSnapshot.content_hash === newHash) {
      continue;
    }

    const isChange = Boolean(latestSnapshot);

    await supabase.from("snapshots").insert({
      analysis_id: analysisId,
      source_url: sourceUrl,
      content_hash: newHash,
      raw_text: newText,
    });

    if (!isChange) {
      // First snapshot — baseline only; detection runs on subsequent changes
      baselineCreated = true;
      continue;
    }

    const result = await detectSignals(
      latestSnapshot!.raw_text,
      newText,
      analysis.target,
      sourceUrl
    );
    const detected = result.signals;
    usageRecords.push(result.usage);

    for (const signal of detected) {
      allDetected.push({ ...signal, source_url: sourceUrl });
    }
  }

  let briefCreated = false;

  if (allDetected.length > 0) {
    const briefResult = await generateBrief(
      allDetected,
      analysis.target,
      analysis.model
    );
    usageRecords.push(briefResult.usage);

    await supabase.from("signals").insert(
      allDetected.map((s) => ({
        analysis_id: analysisId,
        type: s.type,
        title: s.title,
        detail: s.detail,
        severity: s.severity,
        source_url: s.source_url,
      }))
    );

    await supabase.from("briefs").insert({
      analysis_id: analysisId,
      title: briefResult.title,
      body: briefResult.body,
    });

    briefCreated = true;

    const nowIso = new Date().toISOString();
    await dispatchEvent({
      id: eventId(),
      type: "signals.detected",
      created_at: nowIso,
      pipeline_version: pipelineVersion(),
      data: {
        target: analysis.target,
        analysis_id: analysisId,
        count: allDetected.length,
        signals: allDetected.map((s) => ({
          type: s.type,
          title: s.title,
          severity: s.severity,
          source_url: s.source_url,
        })),
      },
    });

    await dispatchEvent({
      id: eventId(),
      type: "brief.created",
      created_at: nowIso,
      pipeline_version: pipelineVersion(),
      data: {
        target: analysis.target,
        title: briefResult.title,
        body: briefResult.body,
        source: "analysis",
        analysis_id: analysisId,
        signal_count: allDetected.length,
        url: `${appBaseUrl()}/app`,
      },
    });
  }

  let totalCost = 0;
  for (const usage of usageRecords) {
    const cost = calculateCost(
      usage.model,
      usage.inputTokens,
      usage.outputTokens
    );
    totalCost += cost;

    await supabase.from("usage").insert({
      analysis_id: analysisId,
      model: usage.model,
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      cost_usd: cost,
    });
  }

  const now = new Date();
  const nextRun = new Date(now.getTime() + analysis.cadence_minutes * 60_000);

  await supabase
    .from("analyses")
    .update({
      last_run_at: now.toISOString(),
      next_run_at: nextRun.toISOString(),
      spend_usd: Number(analysis.spend_usd) + totalCost,
    })
    .eq("id", analysisId);

  const result: RunAnalysisResult = {
    ok: true,
    signalsCreated: allDetected.length,
    briefCreated,
    baselineCreated,
  };

  await dispatchEvent({
    id: eventId(),
    type: "analysis.completed",
    created_at: new Date().toISOString(),
    pipeline_version: pipelineVersion(),
    data: {
      analysis_id: analysisId,
      target: analysis.target,
      signals_created: allDetected.length,
      brief_created: briefCreated,
      baseline_created: baselineCreated,
    },
  });

  return result;
}
