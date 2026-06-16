import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ai: Boolean(process.env.ANTHROPIC_API_KEY),
    search: Boolean(process.env.SERPER_API_KEY || (process.env.GOOGLE_CSE_API_KEY && process.env.GOOGLE_CSE_ID)),
    sec: true,
    storage: "local",
    version: "1.0.0",
    product: "VIGILANTE",
    entity: "Vigilant Intelligence, Inc.",
  });
}
