import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

/**
 * Resolve the authenticated user from cookie session (web) or Bearer token (mobile).
 */
export async function getUserFromRequest(
  request: Request
): Promise<{ user: User | null; error?: string }> {
  const authHeader = request.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (!token) {
      return { user: null, error: "Empty bearer token" };
    }

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { user: null, error: error?.message ?? "Invalid token" };
    }
    return { user: data.user };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user };
}
