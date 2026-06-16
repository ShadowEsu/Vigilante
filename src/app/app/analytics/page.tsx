import { createClient } from "@/lib/supabase/server";
import type { Analysis, Signal } from "@/types/database";
import { AnalyticsPageView } from "@/components/analytics/AnalyticsPageView";
import { MOCK_SCAN_LOG } from "@/lib/preview/mock-extended";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user!.id)
    .returns<Analysis[]>();

  const ids = (analyses ?? []).map((a) => a.id);
  let signals: Signal[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from("signals")
      .select("*")
      .in("analysis_id", ids)
      .order("created_at", { ascending: false })
      .returns<Signal[]>();
    signals = data ?? [];
  }

  const scanLog = MOCK_SCAN_LOG.map((row, i) => ({
    ...row,
    watch: analyses?.[i % Math.max(analyses?.length ?? 1, 1)]?.name ?? row.watch,
  }));

  return (
    <AnalyticsPageView analyses={analyses ?? []} signals={signals} scanLog={scanLog} />
  );
}
