import { NextResponse } from "next/server";
import { runCompanyScrape, rediscoverCompany } from "@/lib/company/company-run";
import { getCompanyDashboard } from "@/lib/company/store";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json().catch(() => ({}))) as { rediscover?: boolean };
    if (body.rediscover) {
      await rediscoverCompany(params.id);
    }
    const result = await runCompanyScrape(params.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    const dashboard = await getCompanyDashboard(params.id);
    return NextResponse.json({ ...result, dashboard });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scrape failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
