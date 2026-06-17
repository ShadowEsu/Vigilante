import type { PlanTier } from "@/lib/billing/plans";
import { quotePlan } from "@/lib/billing/plans";

/** FormSubmit.co — emails waitlist signups on static GitHub Pages. */
export const WAITLIST_NOTIFY_EMAIL =
  process.env.NEXT_PUBLIC_WAITLIST_NOTIFY_EMAIL?.trim() || "regradeteam@gmail.com";

type Quote = ReturnType<typeof quotePlan>;

export async function submitWaitlistToFormSubmit(
  body: {
    email: string;
    company?: string;
    role?: string;
    plan_tier: PlanTier;
    promo_code?: string;
  },
  quote: Quote
) {
  const res = await fetch(`https://formsubmit.co/ajax/${WAITLIST_NOTIFY_EMAIL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      company: body.company?.trim() || "—",
      role: body.role?.trim() || "—",
      plan: body.plan_tier,
      promo_code: body.promo_code?.trim() || "—",
      due_monthly_usd: `$${quote.dueMonthlyUsd}`,
      founding_credit: quote.foundingEligible && quote.foundingCreditUsd > 0 ? "yes" : "no",
      source: "Vigilante waitlist",
      _subject: "New Vigilante waitlist signup",
      _template: "table",
      _captcha: "false",
    }),
  });

  if (!res.ok) {
    throw new Error("Waitlist email failed — try again in a moment.");
  }
}
