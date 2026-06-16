import { createClient } from "@supabase/supabase-js";

export function hasSupabaseConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anon) return false;
  if (url.includes("placeholder") || anon.includes("placeholder")) return false;
  return url.includes("supabase.co");
}

/** Service role when configured; otherwise anon (waitlist RLS allows public insert). */
export function createWaitlistClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (serviceKey && !serviceKey.includes("placeholder")) {
    return createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getWaitlistSignupCount(): Promise<number | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = createWaitlistClient();
  const { data, error } = await supabase.rpc("waitlist_public_count");
  if (!error && typeof data === "number") return data;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (serviceKey && !serviceKey.includes("placeholder")) {
    const { count, error: countError } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    if (!countError && count !== null) return count;
  }

  return null;
}
