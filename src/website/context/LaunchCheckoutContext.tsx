"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { quotePlan, type PlanTier, type PricingQuote } from "@/lib/billing/plans";

interface PromoState {
  code: string;
  percentOff: number;
  label: string;
}

interface LaunchCheckoutContextValue {
  plan: PlanTier;
  setPlan: (plan: PlanTier) => void;
  promoInput: string;
  setPromoInput: (v: string) => void;
  promo: PromoState | null;
  promoError: string | null;
  promoLoading: boolean;
  applyPromo: (overrideCode?: string) => Promise<void>;
  clearPromo: () => void;
  foundingRemaining: number;
  foundingEligible: boolean;
  quote: PricingQuote;
}

const LaunchCheckoutContext = createContext<LaunchCheckoutContextValue | null>(null);

export function LaunchCheckoutProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlanTier>("free");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoState | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [foundingRemaining, setFoundingRemaining] = useState(100);
  const [foundingEligible, setFoundingEligible] = useState(true);

  useEffect(() => {
    fetch("/api/promo")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.foundingRemaining === "number") setFoundingRemaining(d.foundingRemaining);
        if (typeof d.foundingEligible === "boolean") setFoundingEligible(d.foundingEligible);
      })
      .catch(() => {});
  }, []);

  const quote = useMemo(
    () =>
      quotePlan(plan, {
        percentOff: promo?.percentOff,
        promoCode: promo?.code ?? null,
        promoLabel: promo?.label ?? null,
        foundingEligible,
      }),
    [plan, promo, foundingEligible]
  );

  const applyPromo = useCallback(async (overrideCode?: string) => {
    const code = (overrideCode ?? promoInput).trim();
    if (overrideCode) setPromoInput(overrideCode);
    if (!code) {
      setPromo(null);
      setPromoError(null);
      return;
    }
    setPromoLoading(true);
    setPromoError(null);
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid promo code");
      setPromo({ code: data.code, percentOff: data.percentOff, label: data.label });
      if (typeof data.foundingRemaining === "number") setFoundingRemaining(data.foundingRemaining);
    } catch (err) {
      setPromo(null);
      setPromoError(err instanceof Error ? err.message : "Invalid promo code");
    } finally {
      setPromoLoading(false);
    }
  }, [plan, promoInput]);

  const clearPromo = useCallback(() => {
    setPromo(null);
    setPromoInput("");
    setPromoError(null);
  }, []);

  useEffect(() => {
    if (promo) applyPromo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const value = useMemo(
    () => ({
      plan,
      setPlan,
      promoInput,
      setPromoInput,
      promo,
      promoError,
      promoLoading,
      applyPromo,
      clearPromo,
      foundingRemaining,
      foundingEligible,
      quote,
    }),
    [plan, promoInput, promo, promoError, promoLoading, applyPromo, clearPromo, foundingRemaining, foundingEligible, quote]
  );

  return <LaunchCheckoutContext.Provider value={value}>{children}</LaunchCheckoutContext.Provider>;
}

export function useLaunchCheckout() {
  const ctx = useContext(LaunchCheckoutContext);
  if (!ctx) throw new Error("useLaunchCheckout must be used within LaunchCheckoutProvider");
  return ctx;
}
