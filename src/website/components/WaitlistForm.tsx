"use client";

import { useState } from "react";
import { formatUsdMonthly, maskEmail } from "@/lib/billing/format-price";
import { PLANS } from "@/lib/billing/plans";
import { submitWaitlistSignup } from "@/lib/waitlist/client";
import { useLaunchCheckout } from "../context/LaunchCheckoutContext";

type WaitlistVariant = "hero" | "footer";

export function WaitlistForm({
  variant = "hero",
  onSuccess,
}: {
  variant?: WaitlistVariant;
  onSuccess?: () => void;
}) {
  const { plan, promo, quote } = useLaunchCheckout();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honey, setHoney] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedQuote, setConfirmedQuote] = useState(quote);

  const isFooter = variant === "footer";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await submitWaitlistSignup({
        email,
        company: company || undefined,
        role: role || undefined,
        plan_tier: plan,
        promo_code: promo?.code,
        _honey: honey,
      });
      if (result.quote) setConfirmedQuote(result.quote);
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const dueLabel =
    plan === "custom"
      ? "custom pricing"
      : plan === "growth" && promo
        ? `${formatUsdMonthly(confirmedQuote.dueMonthlyUsd)} · 3 AI agents`
        : formatUsdMonthly(confirmedQuote.dueMonthlyUsd);

  const ctaLabel =
    plan === "growth" && promo
      ? `Join — 3 agents · ${formatUsdMonthly(confirmedQuote.dueMonthlyUsd)}`
      : "Join waitlist";

  if (done) {
    return (
      <div
        style={{
          padding: isFooter ? "28px 32px" : "24px 28px",
          border: "1px solid rgba(74, 222, 128, 0.35)",
          background: "rgba(74, 222, 128, 0.06)",
          fontSize: isFooter ? 15 : 14,
          color: "#4ADE80",
          letterSpacing: "0.04em",
          width: "100%",
        }}
      >
        You&apos;re on the list ({PLANS[plan].name} · {dueLabel}). Check {maskEmail(email)} — we sent a confirmation. Workspace opens soon, santai.
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div className="launch-waitlist-plan-tag">
        Plan: <strong>{PLANS[plan].name}</strong> · {dueLabel}
        {promo && <span style={{ color: "#4ADE80", marginLeft: 8 }}>· {promo.code}</span>}
        <a href="#pricing" style={{ marginLeft: 10, color: "rgba(255,255,255,0.4)", fontSize: 10 }}>
          change
        </a>
      </div>
      <form
        onSubmit={submit}
        style={{
          display: "flex",
          flexDirection: isFooter ? "column" : "row",
          gap: isFooter ? 14 : 10,
          width: "100%",
          alignItems: isFooter ? "stretch" : "center",
        }}
      >
        <input
          type="text"
          name="_honey"
          value={honey}
          onChange={(e) => setHoney(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="launch-waitlist-honey"
        />
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className={`launch-waitlist-input ${isFooter ? "launch-waitlist-input--footer" : ""}`}
        />
        {isFooter ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="launch-waitlist-input launch-waitlist-input--footer"
            />
            <input
              type="text"
              placeholder="Role (e.g. PM, Investor)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="launch-waitlist-input launch-waitlist-input--footer"
            />
          </div>
        ) : (
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="launch-waitlist-input"
            style={{ maxWidth: 220, flex: "1 1 180px" }}
          />
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={{
            padding: isFooter ? "16px 28px" : "14px 22px",
            fontSize: isFooter ? 13 : 12,
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
            width: isFooter ? "100%" : "auto",
          }}
        >
          {loading ? "…" : ctaLabel}
        </button>
        {error && (
          <p style={{ fontSize: 13, color: "#FC8C8C", margin: 0, width: "100%", textAlign: isFooter ? "center" : "left" }}>
            {error}
          </p>
        )}
      </form>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", margin: "10px 0 0", letterSpacing: "0.04em" }}>
        No payment today — we only email you about access. Your address stays private.
      </p>
    </div>
  );
}
