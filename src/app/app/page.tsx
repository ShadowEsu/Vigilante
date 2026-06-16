import { createClient } from "@/lib/supabase/server";
import type { Analysis, Brief, Signal } from "@/types/database";
import { WidgetDashboard } from "@/components/dashboard/WidgetDashboard";
import { MOCK_SCAN_LOG } from "@/lib/preview/mock-extended";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .returns<Analysis[]>();

  const analysisIds = (analyses ?? []).map((a) => a.id);

  let signals: Signal[] = [];
  let latestBrief: Brief | null = null;

  if (analysisIds.length > 0) {
    const { data: signalRows } = await supabase
      .from("signals")
      .select("*")
      .in("analysis_id", analysisIds)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<Signal[]>();

    signals = signalRows ?? [];

    const { data: briefRows } = await supabase
      .from("briefs")
      .select("*")
      .in("analysis_id", analysisIds)
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<Brief[]>();

    latestBrief = briefRows?.[0] ?? null;
  }

  const analysisMap = new Map((analyses ?? []).map((a) => [a.id, a.name]));

  const scanLog = MOCK_SCAN_LOG.map((row, i) => ({
    ...row,
    id: `app-${i}`,
    watch: analyses?.[i % Math.max(analyses?.length ?? 1, 1)]?.name ?? row.watch,
  }));

  return (
    <WidgetDashboard
      analyses={analyses ?? []}
      signals={signals}
      latestBrief={latestBrief}
      analysisNames={analysisMap}
      scanLog={scanLog}
    />
  );
}
