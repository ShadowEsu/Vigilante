import { NextResponse } from "next/server";
import { discoverCompanyUrls } from "@/lib/agent/search";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: string };
    const input = body.input?.trim();
    if (!input) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }
    const discovered = await discoverCompanyUrls(input);
    return NextResponse.json({ ok: true, ...discovered });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discover failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
