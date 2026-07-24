import { NextResponse } from "next/server";
import { listCompanies, getAllDashboards, ReadOnlyStoreError } from "@/lib/company/store";
import { onboardCompany } from "@/lib/company/company-run";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companies = await listCompanies();
    const dashboards = await getAllDashboards();
    return NextResponse.json({ companies, dashboards });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load companies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: string };
    const input = body.input?.trim();
    if (!input) {
      return NextResponse.json({ error: "input is required (company name or URL)" }, { status: 400 });
    }
    const result = await onboardCompany(input);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    // 503 + readOnly flag so the UI can show "demo is read-only" rather than a crash.
    if (err instanceof ReadOnlyStoreError) {
      return NextResponse.json({ error: err.message, readOnly: true }, { status: 503 });
    }
    const message = err instanceof Error ? err.message : "Failed to create company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
