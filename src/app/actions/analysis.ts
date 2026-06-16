"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TargetType } from "@/types/database";

export interface CreateAnalysisInput {
  name: string;
  target_type: TargetType;
  target: string;
  source_url: string;
  model: string;
  budget_cap_usd: number;
  cadence_minutes: number;
}

export async function createAnalysis(input: CreateAnalysisInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      target_type: input.target_type,
      target: input.target.trim(),
      sources: [input.source_url.trim()],
      model: input.model,
      budget_cap_usd: input.budget_cap_usd,
      cadence_minutes: input.cadence_minutes,
      status: "live",
      next_run_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/app");
  return { ok: true, id: data.id };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/");
}
