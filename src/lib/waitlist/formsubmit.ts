import type { PlanTier } from "@/lib/billing/plans";
import { formatUsdMonthly } from "@/lib/billing/format-price";
import { quotePlan } from "@/lib/billing/plans";

/** FormSubmit.co — emails waitlist signups (works on static GitHub Pages). */
export const WAITLIST_NOTIFY_EMAIL =
  process.env.WAITLIST_NOTIFY_EMAIL?.trim() ||
  process.env.NEXT_PUBLIC_WAITLIST_NOTIFY_EMAIL?.trim() ||
  "regradeteam@gmail.com";

type Quote = ReturnType<typeof quotePlan>;

const AUTORESPONSE = `You're on the Vigilante waitlist — mantap!

We saved your spot. No charge today. We'll email you when your workspace is ready.

— Vigilant Intelligence, Inc.`;

export async function submitWaitlistToFormSubmit(
  body: {
    email: string;
    company?: string;
    role?: string;
    plan_tier: PlanTier;
    promo_code?: string;
    _honey?: string;
  },
  quote: Quote
): Promise<void> {
  if (body._honey?.trim()) {
    throw new Error("Signup blocked.");
  }

  const email = body.email.trim().toLowerCase();
  const dueLabel = formatUsdMonthly(quote.dueMonthlyUsd);

  const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(WAITLIST_NOTIFY_EMAIL)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      _subject: `Vigilante waitlist — ${email}`,
      _template: "table",
      _captcha: "false",
      _honey: "",
      _autoresponse: AUTORESPONSE,
      _replyto: email,
      email,
      company: body.company?.trim() || "—",
      role: body.role?.trim() || "—",
      plan: body.plan_tier,
      promo_code: body.promo_code?.trim() || "—",
      due_at_launch: dueLabel,
      founding_credit: quote.foundingEligible && quote.foundingCreditUsd > 0 ? "yes" : "no",
      source: "Vigilante waitlist",
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const raw = await res.text();
  let data: { success?: string; message?: string } = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    /* non-JSON */
  }

  if (!res.ok) {
    const msg = data.message || raw || `HTTP ${res.status}`;
    throw new Error(
      msg.toLowerCase().includes("activate")
        ? "Waitlist email not activated yet — check the inbox for FormSubmit and click the activation link, then try again."
        : `Waitlist email failed (${msg.slice(0, 120)})`
    );
  }

  if (!data.success && !raw.toLowerCase().includes("thank")) {
    throw new Error("Waitlist email could not be confirmed — try again in a moment.");
  }
}
