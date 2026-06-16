import { quotePlan, type PlanTier } from "@/lib/billing/plans";
import { foundingSlotsRemaining, isFoundingEligible, validatePromoCode } from "@/lib/billing/promo";
import { createClient } from "@/lib/supabase/client";
import { withBasePath } from "@/lib/paths";

function hasBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return false;
  if (url.includes("placeholder") || key.includes("placeholder")) return false;
  return true;
}

export async function fetchWaitlistCount(): Promise<number> {
  try {
    const res = await fetch(withBasePath("/api/waitlist"));
    if (res.ok) {
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === "number") return data.count;
    }
  } catch {
    /* static hosting — fall through */
  }

  if (!hasBrowserSupabase()) return 412;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("waitlist_public_count");
    if (!error && typeof data === "number") return data + 412;
  } catch {
    /* ignore */
  }
  return 412;
}

export async function fetchPromoMeta(): Promise<{ foundingRemaining: number; foundingEligible: boolean }> {
  try {
    const res = await fetch(withBasePath("/api/promo"));
    if (res.ok) {
      const d = (await res.json()) as { foundingRemaining?: number; foundingEligible?: boolean };
      return {
        foundingRemaining: d.foundingRemaining ?? 100,
        foundingEligible: d.foundingEligible ?? true,
      };
    }
  } catch {
    /* static hosting */
  }

  if (!hasBrowserSupabase()) {
    return { foundingRemaining: 100, foundingEligible: true };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("waitlist_public_count");
    const count = !error && typeof data === "number" ? data : 0;
    return {
      foundingRemaining: foundingSlotsRemaining(count),
      foundingEligible: isFoundingEligible(count),
    };
  } catch {
    return { foundingRemaining: 100, foundingEligible: true };
  }
}

export function applyPromoClient(code: string, plan: PlanTier) {
  const result = validatePromoCode(code);
  if (!result.valid) throw new Error(result.error ?? "Invalid promo code");
  return {
    code: result.code!,
    percentOff: result.percentOff!,
    label: result.label!,
    quote: quotePlan(plan, {
      percentOff: result.percentOff,
      promoCode: result.code,
      promoLabel: result.label,
      foundingEligible: true,
    }),
  };
}

export async function submitWaitlistSignup(body: {
  email: string;
  company?: string;
  role?: string;
  plan_tier: PlanTier;
  promo_code?: string;
}) {
  try {
    const res = await fetch(withBasePath("/api/waitlist"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    let data: { error?: string; quote?: ReturnType<typeof quotePlan> } = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      if (!res.ok) throw new Error("Server error — try again");
    }
    if (!res.ok) throw new Error(data.error ?? "Signup failed");
    return { quote: data.quote };
  } catch (apiErr) {
    if (!hasBrowserSupabase()) throw apiErr;

    let discount_percent = 0;
    let promo_code: string | null = null;
    if (body.promo_code?.trim()) {
      const promo = validatePromoCode(body.promo_code);
      if (!promo.valid) throw new Error(promo.error ?? "Invalid promo code");
      discount_percent = promo.percentOff ?? 0;
      promo_code = promo.code ?? null;
    }

    const supabase = createClient();
    const { data: countData } = await supabase.rpc("waitlist_public_count");
    const signupCount = typeof countData === "number" ? countData : 0;
    const foundingEligible = isFoundingEligible(signupCount);
    const quote = quotePlan(body.plan_tier, {
      percentOff: discount_percent,
      promoCode: promo_code,
      foundingEligible,
    });

    const { error } = await supabase.from("waitlist").insert({
      email: body.email.trim().toLowerCase(),
      company: body.company?.trim() || null,
      role: body.role?.trim() || null,
      source: "launch",
      plan_tier: body.plan_tier,
      promo_code,
      discount_percent: discount_percent || null,
      founding_credit: quote.foundingEligible && quote.foundingCreditUsd > 0,
      due_monthly_usd: quote.dueMonthlyUsd,
    });

    if (error) {
      if (error.code === "23505") return { quote, duplicate: true };
      throw new Error(error.message);
    }
    return { quote };
  }
}
