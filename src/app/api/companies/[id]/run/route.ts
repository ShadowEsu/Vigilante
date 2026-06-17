import { NextResponse } from "next/server";
import { runCompanyScrape, rediscoverCompany } from "@/lib/company/company-run";
import { getCompanyDashboard } from "@/lib/company/store";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { rediscover?: boolean };
    if (body.rediscover) {
      await rediscoverCompany(id);
    }
    const result = await runCompanyScrape(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    const dashboard = await getCompanyDashboard(id);
    return NextResponse.json({ ...result, dashboard });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
