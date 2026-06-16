import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getUserFromRequest } from "@/lib/supabase/auth-request";
import { runAnalysis } from "@/lib/agent/run";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, error: authError } = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: authError ?? "Unauthorized" },
      { status: 401 }
    );
  }

  const authHeader = request.headers.get("Authorization");
  const supabase =
    authHeader?.startsWith("Bearer ")
      ? createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: { autoRefreshToken: false, persistSession: false },
            global: { headers: { Authorization: authHeader } },
          }
        )
      : null;

  if (supabase) {
    const { data: analysis } = await supabase
      .from("analyses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const cookieClient = await createClient();
    const { data: analysis } = await cookieClient
      .from("analyses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
  }

  try {
    const result = await runAnalysis(id);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Run failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
