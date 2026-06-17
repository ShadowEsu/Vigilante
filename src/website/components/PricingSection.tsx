"use client";

import Link from "next/link";
import { formatUsdMonthly } from "@/lib/billing/format-price";
import { PLANS, type PlanTier } from "@/lib/billing/plans";
import { LAUNCH } from "../copy";
import { useLaunchCheckout } from "../context/LaunchCheckoutContext";
import { useInView } from "../hooks/useInView";

const SELECTABLE: PlanTier[] = ["growth", "free", "team"];

function formatDue(plan: PlanTier, due: number) {
  if (plan === "custom") return "Custom";
  return formatUsdMonthly(due);
}

export function PricingSection() {
  const { ref, visible } = useInView<HTMLElement>(0.12);
  const {
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
  } = useLaunchCheckout();

  return (
    <section
      id="pricing"
      ref={ref}
      style={{ padding: "80px 28px 100px", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className={`launch-reveal ${visible ? "launch-reveal--visible" : ""}`}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>PRICING</div>
        <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.85rem)", fontWeight: 600, margin: "0 0 12px", letterSpacing: "-0.02em", maxWidth: "22ch" }}>
          {LAUNCH.sections.pricingTitle}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", margin: "0 0 16px", maxWidth: "52ch", lineHeight: 1.6 }}>
          {LAUNCH.sections.pricingSub}
        </p>
        <div className="launch-hero-offer" style={{ marginBottom: 20 }}>
          <span className="launch-hero-offer-main">{LAUNCH.offer.badge}</span>
          <span className="launch-hero-offer-promo">{LAUNCH.offer.promo}</span>
        </div>
        {foundingEligible && (
          <div className="launch-founding-banner">
            <span className="launch-founding-pulse" />
            First {foundingRemaining} signups: <strong>$10/mo credit × 6 months</strong> on top — applied automatically
          </div>
        )}
      </div>

      <div className={`launch-plan-picker launch-reveal launch-reveal-delay-1 ${visible ? "launch-reveal--visible" : ""}`}>
        {SELECTABLE.map((tier) => {
          const def = PLANS[tier];
          const selected = plan === tier;
          const tierQuote = tier === plan ? quote : null;
          const due = tierQuote?.dueMonthlyUsd ?? def.monthlyUsd ?? 0;
          const featured = tier === "growth";
          return (
            <button
              key={tier}
              type="button"
              className={`launch-plan-option ${selected ? "launch-plan-option--selected" : ""} ${featured ? "launch-plan-option--featured" : ""}`}
              onClick={() => setPlan(tier)}
            >
              {featured && <div className="launch-plan-featured-tag">MOST POPULAR</div>}
              <div className="launch-plan-option-price">
                {def.monthlyUsd === null ? "—" : def.monthlyUsd === 0 ? "$0" : `$${def.monthlyUsd}`}
              </div>
              <div className="launch-plan-option-label">{def.agents}</div>
              {selected && (
                <div className="launch-plan-option-due">
                  due at launch: {formatDue(tier, due)}
                </div>
              )}
            </button>
          );
        })}
        <button
          type="button"
          className={`launch-plan-option launch-plan-option--custom ${plan === "custom" ? "launch-plan-option--selected" : ""}`}
          onClick={() => setPlan("custom")}
        >
          <div className="launch-plan-option-price">—</div>
          <div className="launch-plan-option-label">Custom</div>
        </button>
      </div>

      <div
        className={`launch-pricing-checkout launch-reveal launch-reveal-delay-2 ${visible ? "launch-reveal--visible" : ""}`}
      >
        <div className="launch-pricing-summary">
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>YOUR SELECTION</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{PLANS[plan].name} · {PLANS[plan].agents}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{quote.note}</div>
          {promo && (
            <div style={{ fontSize: 11, color: "#4ADE80", marginTop: 10, letterSpacing: "0.06em" }}>
              ✓ {promo.code} — {promo.label}
            </div>
          )}
          {quote.foundingEligible && quote.foundingCreditUsd > 0 && (
            <div style={{ fontSize: 11, color: "#6E9BE6", marginTop: 6, letterSpacing: "0.06em" }}>
              ✓ Founding credit: ${quote.foundingCreditUsd}/mo × {quote.foundingMonths} months
            </div>
          )}
        </div>

        <div className="launch-promo-box">
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>PROMO CODE</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyPromo())}
              placeholder="Vigilante"
              className="launch-waitlist-input"
              style={{ flex: "1 1 160px", maxWidth: "100%" }}
              spellCheck={false}
            />
            <button type="button" className="btn-ghost" onClick={() => applyPromo()} disabled={promoLoading} style={{ fontSize: 11 }}>
              {promoLoading ? "…" : "[ APPLY ]"}
            </button>
            {promo && (
              <button type="button" className="btn-ghost" onClick={clearPromo} style={{ fontSize: 11 }}>
                [ CLEAR ]
              </button>
            )}
          </div>
          {promoError && <p style={{ fontSize: 12, color: "#FC8C8C", margin: "8px 0 0" }}>{promoError}</p>}
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", margin: "10px 0 0", letterSpacing: "0.04em" }}>
            <button type="button" className="launch-promo-chip" onClick={() => applyPromo("VIGILANTE")}>VIGILANTE</button> — 50% off 3 AI agents ($5/mo at launch)
          </p>
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: "center" }}>
        <Link href="#waitlist" className="btn-primary" style={{ textDecoration: "none", fontSize: 12 }}>
          [ JOIN WAITLIST — {formatDue(plan, quote.dueMonthlyUsd).toUpperCase()} AT LAUNCH ]
        </Link>
      </div>
    </section>
  );
}
