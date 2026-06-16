import { FOUNDING_LIMIT } from "./plans";

export const PROMO_CODES = {
  VIGILANTE: {
    code: "VIGILANTE",
    percentOff: 50,
    label: "50% off — 3 AI agents for $5/mo",
  },
} as const;

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function validatePromoCode(raw: string): {
  valid: boolean;
  code?: string;
  percentOff?: number;
  label?: string;
  error?: string;
} {
  const code = normalizePromoCode(raw);
  if (!code) return { valid: false, error: "Enter a promo code" };

  if (code === PROMO_CODES.VIGILANTE.code) {
    return {
      valid: true,
      code: PROMO_CODES.VIGILANTE.code,
      percentOff: PROMO_CODES.VIGILANTE.percentOff,
      label: PROMO_CODES.VIGILANTE.label,
    };
  }

  return { valid: false, error: "Invalid promo code" };
}

export function foundingSlotsRemaining(signupCount: number): number {
  return Math.max(0, FOUNDING_LIMIT - signupCount);
}

export function isFoundingEligible(signupCount: number): boolean {
  return signupCount < FOUNDING_LIMIT;
}
