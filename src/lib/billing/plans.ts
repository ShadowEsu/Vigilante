export type PlanTier = "free" | "growth" | "team" | "custom";

export interface PlanDef {
  id: PlanTier;
  name: string;
  monthlyUsd: number | null;
  agents: string;
  detail: string;
  custom?: boolean;
}

export const PLANS: Record<PlanTier, PlanDef> = {
  free: {
    id: "free",
    name: "FREE",
    monthlyUsd: 0,
    agents: "2 agents",
    detail: "Daily diffs, briefs, SEC EDGAR",
  },
  growth: {
    id: "growth",
    name: "GROWTH",
    monthlyUsd: 10,
    agents: "3 AI agents",
    detail: "Full competitor analysis — discover, diff, brief",
  },
  team: {
    id: "team",
    name: "TEAM",
    monthlyUsd: 20,
    agents: "6+ agents",
    detail: "Higher limits, priority support",
  },
  custom: {
    id: "custom",
    name: "CUSTOM",
    monthlyUsd: null,
    agents: "Enterprise",
    detail: "SSO, custom sources, SLA",
    custom: true,
  },
};

export const FOUNDING_CREDIT_USD = 10;
export const FOUNDING_CREDIT_MONTHS = 6;
export const FOUNDING_LIMIT = 100;

export interface PricingQuote {
  plan: PlanTier;
  baseMonthlyUsd: number;
  percentOff: number;
  promoCode: string | null;
  promoLabel: string | null;
  foundingCreditUsd: number;
  foundingMonths: number;
  foundingEligible: boolean;
  dueMonthlyUsd: number;
  note: string;
}

export function quotePlan(
  plan: PlanTier,
  opts: {
    percentOff?: number;
    promoCode?: string | null;
    promoLabel?: string | null;
    foundingEligible?: boolean;
  } = {}
): PricingQuote {
  const def = PLANS[plan];
  const base = def.monthlyUsd ?? 0;
  const percentOff = opts.percentOff ?? 0;
  const foundingEligible = Boolean(opts.foundingEligible);
  const foundingCreditUsd = foundingEligible && base > 0 ? FOUNDING_CREDIT_USD : 0;

  const afterPromo = base * (1 - percentOff / 100);
  const dueMonthlyUsd = Math.max(0, afterPromo - foundingCreditUsd);

  let note = "No charge until your workspace opens.";
  if (plan === "free") {
    note = "Free forever for up to 2 agents.";
  } else if (foundingEligible && dueMonthlyUsd === 0) {
    note = `$0/mo for ${FOUNDING_CREDIT_MONTHS} months (founding credit), then $${afterPromo}/mo.`;
  } else if (foundingEligible && foundingCreditUsd > 0) {
    note = `$${dueMonthlyUsd}/mo for ${FOUNDING_CREDIT_MONTHS} months with $${foundingCreditUsd} credit, then $${afterPromo}/mo.`;
  } else if (percentOff > 0) {
    note = `$${dueMonthlyUsd}/mo with promo — billed when workspace opens.`;
  }

  return {
    plan,
    baseMonthlyUsd: base,
    percentOff,
    promoCode: opts.promoCode ?? null,
    promoLabel: opts.promoLabel ?? null,
    foundingCreditUsd,
    foundingMonths: foundingEligible ? FOUNDING_CREDIT_MONTHS : 0,
    foundingEligible,
    dueMonthlyUsd,
    note,
  };
}
