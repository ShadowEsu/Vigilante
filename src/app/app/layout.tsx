import { createClient } from "@/lib/supabase/server";
import type { Analysis } from "@/types/database";
import { AppShell } from "@/components/terminal/AppShell";
import type { ShellStats } from "@/components/terminal/ui";

async function loadStats(userId: string): Promise<ShellStats> {
  const supabase = await createClient();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, status, spend_usd, budget_cap_usd")
    .eq("user_id", userId)
    .returns<Pick<Analysis, "id" | "status" | "spend_usd" | "budget_cap_usd">[]>();

  const list = analyses ?? [];
  const ids = list.map((a) => a.id);

  let signalCount = 0;
  if (ids.length > 0) {
    const { count } = await supabase
      .from("signals")
      .select("*", { count: "exact", head: true })
      .in("analysis_id", ids);
    signalCount = count ?? 0;
  }

  return {
    watches: list.length,
    live: list.filter((a) => a.status === "live").length,
    signals: signalCount,
    spend: list.reduce((s, a) => s + Number(a.spend_usd), 0),
    budget: list.reduce((s, a) => s + Number(a.budget_cap_usd), 0),
  };
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stats = user ? await loadStats(user.id) : { watches: 0, live: 0, signals: 0, spend: 0, budget: 0 };

  return (
    <AppShell userEmail={user?.email} stats={stats}>
      {children}
    </AppShell>
  );
}
