import { NextResponse } from "next/server";
import { quotePlan, type PlanTier } from "@/lib/billing/plans";
import { isFoundingEligible, validatePromoCode } from "@/lib/billing/promo";
import { createServiceClient } from "@/lib/supabase/admin";
import { addWaitlistLocal, countWaitlistLocal } from "@/lib/waitlist/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PLANS: PlanTier[] = ["free", "growth", "team", "custom"];

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
    const local = await countWaitlistLocal();
    return NextResponse.json({ count: local + 412 });
  } catch {
    return NextResponse.json({ count: 412 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      company?: string;
      role?: string;
      plan_tier?: string;
      promo_code?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? "";
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
    }

    const company = body.company?.trim().slice(0, 120) || null;
    const role = body.role?.trim().slice(0, 80) || null;
    const source = "launch";
    const plan_tier = VALID_PLANS.includes(body.plan_tier as PlanTier)
      ? (body.plan_tier as PlanTier)
      : "free";

    const signupCount = await getSignupCount();
    const foundingEligible = isFoundingEligible(signupCount);

    let discount_percent = 0;
    let promo_code: string | null = null;
    if (body.promo_code?.trim()) {
      const promo = validatePromoCode(body.promo_code);
      if (!promo.valid) {
        return NextResponse.json({ ok: false, error: promo.error }, { status: 400 });
      }
      discount_percent = promo.percentOff ?? 0;
      promo_code = promo.code ?? null;
    }

    const quote = quotePlan(plan_tier, {
      percentOff: discount_percent,
      promoCode: promo_code,
      foundingEligible,
    });

    if (process.env.NODE_ENV === "production" && !hasLiveSupabase()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Waitlist storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on your host.",
        },
        { status: 503 }
      );
    }

    const payload = {
      email,
      company,
      role,
      source,
      plan_tier,
      promo_code,
      discount_percent: discount_percent || null,
      founding_credit: quote.foundingEligible && quote.foundingCreditUsd > 0,
      due_monthly_usd: quote.dueMonthlyUsd,
    };

    if (hasLiveSupabase()) {
      const supabase = createServiceClient();
      const { error } = await supabase.from("waitlist").insert(payload);

      if (error) {
        if (error.code === "23505") {
          return NextResponse.json({ ok: true, duplicate: true });
        }
        throw error;
      }

      return NextResponse.json({
        ok: true,
        storage: "supabase",
        quote,
        foundingRemaining: Math.max(0, 100 - signupCount - 1),
      });
    }

    await addWaitlistLocal({
      email,
      company: company ?? undefined,
      role: role ?? undefined,
      source,
      plan_tier,
      promo_code: promo_code ?? undefined,
      discount_percent: discount_percent || undefined,
      founding_credit: payload.founding_credit,
      due_monthly_usd: quote.dueMonthlyUsd,
    });

    return NextResponse.json({
      ok: true,
      storage: "local",
      quote,
      foundingRemaining: Math.max(0, 100 - signupCount - 1),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Waitlist signup failed";
    if (message.includes("Already on")) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
