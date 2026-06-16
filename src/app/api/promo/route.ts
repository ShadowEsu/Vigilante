import { NextResponse } from "next/server";
import { quotePlan } from "@/lib/billing/plans";
import type { PlanTier } from "@/lib/billing/plans";
import { foundingSlotsRemaining, isFoundingEligible, validatePromoCode } from "@/lib/billing/promo";
import { countWaitlistLocal } from "@/lib/waitlist/store";
import { createServiceClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function hasLiveSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) return false;
  if (url.includes("placeholder") || serviceKey.includes("placeholder")) return false;
  return true;
}

async function getSignupCount(): Promise<number> {
  if (hasLiveSupabase()) {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });
    if (!error && count !== null) return count;
  }
  return countWaitlistLocal();
}

export async function GET() {
  try {
    const count = await getSignupCount();
    const remaining = foundingSlotsRemaining(count);
    return NextResponse.json({
      foundingLimit: 100,
      foundingRemaining: remaining,
      foundingEligible: isFoundingEligible(count),
      foundingOffer: "$10/mo credit for 6 months",
      promoHint: "VIGILANTE — 50% off",
    });
  } catch {
    return NextResponse.json({
      foundingLimit: 100,
      foundingRemaining: 100,
      foundingEligible: true,
      foundingOffer: "$10/mo credit for 6 months",
      promoHint: "VIGILANTE — 50% off",
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: string; plan?: string };
    const plan = (body.plan ?? "free") as PlanTier;
    const result = validatePromoCode(body.code ?? "");

    if (!result.valid) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    const count = await getSignupCount();
    const quote = quotePlan(plan, {
      percentOff: result.percentOff,
      promoCode: result.code,
      promoLabel: result.label,
      foundingEligible: isFoundingEligible(count),
    });

    return NextResponse.json({
      ok: true,
      code: result.code,
      percentOff: result.percentOff,
      label: result.label,
      quote,
      foundingRemaining: foundingSlotsRemaining(count),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Promo check failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
