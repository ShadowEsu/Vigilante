import { createClient } from "@/lib/supabase/server";
import type { Analysis, Signal } from "@/types/database";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { SignalsPanel } from "@/components/SignalsPanel";

export default async function SignalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, name")
    .eq("user_id", user!.id)
    .returns<Pick<Analysis, "id" | "name">[]>();

  const analysisIds = (analyses ?? []).map((a) => a.id);
  const analysisMap = new Map((analyses ?? []).map((a) => [a.id, a.name]));

  let signals: Signal[] = [];
  if (analysisIds.length > 0) {
    const { data } = await supabase
      .from("signals")
      .select("*")
      .in("analysis_id", analysisIds)
      .order("created_at", { ascending: false })
      .limit(100)
      .returns<Signal[]>();
    signals = data ?? [];
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TerminalPanel className="flex-1">
        <SignalsPanel signals={signals} analysisNames={analysisMap} sectionNum="03" />
      </TerminalPanel>
    </div>
  );
}
