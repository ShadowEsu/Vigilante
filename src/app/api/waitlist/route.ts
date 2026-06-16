import { NextResponse } from "next/server";
import { quotePlan, type PlanTier } from "@/lib/billing/plans";
import { isFoundingEligible, validatePromoCode } from "@/lib/billing/promo";
import {
  createWaitlistClient,
  getWaitlistSignupCount,
  hasSupabaseConfig,
} from "@/lib/supabase/waitlist";
import { addWaitlistLocal, countWaitlistLocal } from "@/lib/waitlist/store";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PLANS: PlanTier[] = ["free", "growth", "team", "custom"];
const DISPLAY_OFFSET = 412;

const CORS_ORIGINS = [
  "https://shadowesu.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowed = CORS_ORIGINS.some((o) => origin === o || origin.startsWith(`${o}/`));
  if (!allowed) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonWithCors(request: Request, body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...corsHeaders(request), ...(init?.headers ?? {}) },
  });
}

async function getSignupCount(): Promise<number> {
  const supabaseCount = await getWaitlistSignupCount();
  if (supabaseCount !== null) return supabaseCount;
  return countWaitlistLocal();
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request) {
  try {
    const count = await getSignupCount();
    return jsonWithCors(request, { count: count + DISPLAY_OFFSET, storage: hasSupabaseConfig() ? "supabase" : "local" });
  } catch {
    return jsonWithCors(request, { count: DISPLAY_OFFSET });
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
      return jsonWithCors(request, { ok: false, error: "Valid email required" }, { status: 400 });
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
        return jsonWithCors(request, { ok: false, error: promo.error }, { status: 400 });
      }
      discount_percent = promo.percentOff ?? 0;
      promo_code = promo.code ?? null;
    }

    const quote = quotePlan(plan_tier, {
      percentOff: discount_percent,
      promoCode: promo_code,
      foundingEligible,
    });

    if (process.env.NODE_ENV === "production" && !hasSupabaseConfig()) {
      return jsonWithCors(
        request,
        {
          ok: false,
          error: "Waitlist not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
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

    if (hasSupabaseConfig()) {
      const supabase = createWaitlistClient();
      const { error } = await supabase.from("waitlist").insert(payload);

      if (error) {
        if (error.code === "23505") {
          return jsonWithCors(request, { ok: true, duplicate: true, quote });
        }
        throw error;
      }

      return jsonWithCors(request, {
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

    return jsonWithCors(request, {
      ok: true,
      storage: "local",
      quote,
      foundingRemaining: Math.max(0, 100 - signupCount - 1),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Waitlist signup failed";
    if (message.includes("Already on")) {
      return jsonWithCors(request, { ok: true, duplicate: true });
    }
    return jsonWithCors(request, { ok: false, error: message }, { status: 500 });
  }
}
