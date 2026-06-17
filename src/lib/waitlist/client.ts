import { quotePlan, type PlanTier } from "@/lib/billing/plans";
import { foundingSlotsRemaining, isFoundingEligible, validatePromoCode } from "@/lib/billing/promo";
import { createClient } from "@/lib/supabase/client";
import { isStaticGithubPages, withBasePath } from "@/lib/paths";
import { submitWaitlistToFormSubmit } from "@/lib/waitlist/formsubmit";

class WaitlistApiUnavailable extends Error {
  constructor() {
    super("Waitlist API unavailable");
    this.name = "WaitlistApiUnavailable";
  }
}

function hasBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) return false;
  if (url.includes("placeholder") || key.includes("placeholder")) return false;
  if (!url.includes("supabase.co")) return false;
  return true;
}

function waitlistPostUrl(): string | null {
  const remote = process.env.NEXT_PUBLIC_WAITLIST_API_URL?.trim();
  if (remote) return remote.replace(/\/$/, "");
  if (isStaticGithubPages()) return null;
  return withBasePath("/api/waitlist");
}

async function resolveWaitlistQuote(body: {
  plan_tier: PlanTier;
  promo_code?: string;
}) {
  let discount_percent = 0;
  let promo_code: string | null = null;
  if (body.promo_code?.trim()) {
    const promo = validatePromoCode(body.promo_code);
    if (!promo.valid) throw new Error(promo.error ?? "Invalid promo code");
    discount_percent = promo.percentOff ?? 0;
    promo_code = promo.code ?? null;
  }

  let signupCount = 0;
  if (hasBrowserSupabase()) {
    try {
      const supabase = createClient();
      const { data: countData, error: countError } = await supabase.rpc("waitlist_public_count");
      if (!countError && typeof countData === "number") signupCount = countData;
    } catch {
      /* use 0 */
    }
  }

  const foundingEligible = isFoundingEligible(signupCount);
  const quote = quotePlan(body.plan_tier, {
    percentOff: discount_percent,
    promoCode: promo_code,
    foundingEligible,
  });

  return { quote, promo_code, discount_percent, foundingEligible };
}

async function submitViaApi(body: {
  email: string;
  company?: string;
  role?: string;
  plan_tier: PlanTier;
  promo_code?: string;
}) {
  const url = waitlistPostUrl();
  if (!url) throw new WaitlistApiUnavailable();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";
  const raw = await res.text();

  if (!contentType.includes("application/json")) {
    throw new WaitlistApiUnavailable();
  }

  let data: { error?: string; quote?: ReturnType<typeof quotePlan> } = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new WaitlistApiUnavailable();
  }

  if (!res.ok) throw new Error(data.error ?? "Signup failed");
  return { quote: data.quote };
}

async function submitViaSupabase(
  body: {
    email: string;
    company?: string;
    role?: string;
    plan_tier: PlanTier;
    promo_code?: string;
  },
  meta: Awaited<ReturnType<typeof resolveWaitlistQuote>>
) {
  const supabase = createClient();
  const { error } = await supabase.from("waitlist").insert({
    email: body.email.trim().toLowerCase(),
    company: body.company?.trim() || null,
    role: body.role?.trim() || null,
    source: "launch",
    plan_tier: body.plan_tier,
    promo_code: meta.promo_code,
    discount_percent: meta.discount_percent || null,
    founding_credit: meta.foundingEligible && meta.quote.foundingCreditUsd > 0,
    due_monthly_usd: meta.quote.dueMonthlyUsd,
  });

  if (error) {
    if (error.code === "23505") return { duplicate: true };
    if (error.code === "42501" || error.message.includes("row-level security")) {
      throw new Error("Waitlist permissions not configured. Run website/supabase/waitlist.sql in Supabase.");
    }
    if (error.message.includes("does not exist")) {
      throw new Error("Waitlist table missing. Run website/supabase/waitlist.sql in Supabase.");
    }
    throw new Error(error.message);
  }
  return {};
}

export async function fetchWaitlistCount(): Promise<number> {
  const apiUrl = waitlistPostUrl();
  if (apiUrl) {
    try {
      const countUrl = apiUrl.endsWith("/waitlist") ? apiUrl : withBasePath("/api/waitlist");
      const res = await fetch(countUrl);
      if (res.ok) {
        const data = (await res.json()) as { count?: number };
        if (typeof data.count === "number") return data.count;
      }
    } catch {
      /* fall through */
    }
  }

  if (!hasBrowserSupabase()) {
    const stored = typeof window !== "undefined" ? Number(localStorage.getItem("vigilante_waitlist_bump") || 0) : 0;
    return 412 + (Number.isFinite(stored) ? stored : 0);
  }

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
  if (waitlistPostUrl()) {
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
  const meta = await resolveWaitlistQuote(body);

  if (waitlistPostUrl()) {
    try {
      const result = await submitViaApi(body);
      await submitWaitlistToFormSubmit(body, result.quote ?? meta.quote).catch(() => undefined);
      return { quote: result.quote ?? meta.quote };
    } catch (err) {
      if (!(err instanceof WaitlistApiUnavailable) && err instanceof Error && err.name !== "WaitlistApiUnavailable") {
        throw err;
      }
    }
  }

  await submitWaitlistToFormSubmit(body, meta.quote);

  if (hasBrowserSupabase()) {
    try {
      await submitViaSupabase(body, meta);
    } catch {
      /* FormSubmit already delivered the signup */
    }
  }

  if (typeof window !== "undefined") {
    const bump = Number(localStorage.getItem("vigilante_waitlist_bump") || 0) + 1;
    localStorage.setItem("vigilante_waitlist_bump", String(bump));
  }

  return { quote: meta.quote };
}
