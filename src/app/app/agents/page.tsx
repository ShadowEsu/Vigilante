import { createClient } from "@/lib/supabase/server";
import type { Analysis } from "@/types/database";
import { TerminalPanel } from "@/components/terminal/TerminalPanel";
import { AgentsPanel } from "@/components/AgentsPanel";

export default async function AgentsPage() {
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

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <TerminalPanel className="flex-1">
        <AgentsPanel analyses={analyses ?? []} sectionNum="02" />
      </TerminalPanel>
    </div>
  );
}
