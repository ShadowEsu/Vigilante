"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "./launch.css";
import { LAUNCH } from "./copy";
import { useInView } from "./hooks/useInView";
import { WaitlistForm } from "./components/WaitlistForm";
import { ProductShowcase } from "./components/ProductShowcase";
import { AccountSwitcher } from "./components/AccountSwitcher";
import { FeatureWalkthrough } from "./components/FeatureWalkthrough";
import { LaunchMarquee } from "./components/LaunchMarquee";
import { PricingSection } from "./components/PricingSection";
import { LaunchGrid3d } from "./components/LaunchGrid3d";
import { FaqSection } from "./components/FaqSection";
import { LaunchCheckoutProvider } from "./context/LaunchCheckoutContext";
import { fetchWaitlistCount } from "@/lib/waitlist/client";
import { LegalFooterLinks } from "@/components/legal/LegalPage";

export function LaunchPage() {
  return (
    <LaunchCheckoutProvider>
      <LaunchPageInner />
    </LaunchCheckoutProvider>
  );
}

function LaunchPageInner() {
  const [scrolled, setScrolled] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(412);
  const hero = useInView<HTMLElement>(0.05);
  const diff = useInView<HTMLElement>(0.12);
  const accounts = useInView<HTMLElement>(0.12);
  const cta = useInView<HTMLElement>(0.15);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetchWaitlistCount().then(setWaitlistCount);
  }, []);

  return (
    <div className="launch-root">
      <LaunchGrid3d />
      <div className="launch-ambient" aria-hidden>
        <div className="launch-orb launch-orb--a" />
        <div className="launch-orb launch-orb--b" />
      </div>
      <div className="launch-noise" aria-hidden />
      <div className="launch-vignette" aria-hidden />

      <div className="launch-page-content">
        <header>
        <nav className={`launch-nav ${scrolled ? "launch-nav--scrolled" : ""}`} aria-label="Primary">
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
            <span style={{ width: 26, height: 26, border: "1px solid rgba(255,255,255,0.45)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>V</span>
            <span style={{ fontSize: 13, letterSpacing: "0.22em", fontWeight: 600 }}>{LAUNCH.brand}</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 11, letterSpacing: "0.1em" }}>
            <a href="#product" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>DEMO</a>
            <a href="#how" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>HOW</a>
            <a href="#pricing" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>PRICING</a>
            <a href="#faq" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>FAQ</a>
            <Link href="/competitive-intelligence" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>GUIDE</Link>
            <a href="#waitlist" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>WAITLIST</a>
            <Link href="/auth" className="btn-ghost" style={{ textDecoration: "none" }}>[ SIGN IN ]</Link>
            <Link href="/preview" className="btn-primary" style={{ textDecoration: "none" }}>[ LIVE DEMO ]</Link>
          </div>
        </nav>
        </header>

        <main>
        <section
          ref={hero.ref}
          style={{ position: "relative", padding: "140px 28px 80px", maxWidth: 1100, margin: "0 auto" }}
        >
          <div className="launch-grid-bg" />
          <div className="launch-hero-glow" />

          <div className={`launch-reveal ${hero.visible ? "launch-reveal--visible" : ""}`}>
            <div className="launch-hero-offer" style={{ marginBottom: 20 }}>
              <span className="launch-hero-offer-main">{LAUNCH.offer.badge}</span>
              <span className="launch-hero-offer-promo">{LAUNCH.offer.promo}</span>
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", marginBottom: 20 }}>
              {waitlistCount.toLocaleString()} ON THE WAITLIST · {LAUNCH.offer.edge}
            </div>
            <h1
              style={{
                fontSize: "clamp(2rem, 5.5vw, 3.5rem)",
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
                margin: "0 0 20px",
                maxWidth: "14ch",
              }}
            >
              {LAUNCH.hero.headline}
            </h1>
          </div>

          <p
            className={`launch-reveal launch-reveal-delay-1 ${hero.visible ? "launch-reveal--visible" : ""}`}
            style={{ fontSize: "clamp(1rem, 2vw, 1.1rem)", lineHeight: 1.65, color: "rgba(255,255,255,0.5)", margin: "0 0 36px", maxWidth: "42ch" }}
          >
            {LAUNCH.hero.subhead}
          </p>

          <div
            id="waitlist"
            className={`launch-reveal launch-reveal-delay-2 ${hero.visible ? "launch-reveal--visible" : ""}`}
            style={{ maxWidth: 640, marginBottom: 64 }}
          >
            <WaitlistForm />
          </div>

          <div className={`launch-reveal launch-reveal-delay-3 ${hero.visible ? "launch-reveal--visible" : ""}`} id="product">
            <ProductShowcase />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 14, textAlign: "center", letterSpacing: "0.08em" }}>
              {LAUNCH.sections.demoHint}{" "}
              <Link href="/preview" style={{ color: "rgba(255,255,255,0.5)" }}>/preview</Link>
            </p>
          </div>
        </section>

        <LaunchMarquee />

        <FeatureWalkthrough />

        <section
          ref={diff.ref}
          style={{ padding: "80px 28px 100px", maxWidth: 1100, margin: "0 auto" }}
        >
          <div className={`launch-reveal ${diff.visible ? "launch-reveal--visible" : ""}`}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>WHY VIGILANTE</div>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.85rem)", fontWeight: 600, margin: "0 0 36px", letterSpacing: "-0.02em", maxWidth: "16ch" }}>
              {LAUNCH.sections.whyTitle}
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {LAUNCH.differentiators.map((d, i) => (
              <div
                key={d.title}
                className={`launch-diff-card launch-reveal launch-reveal-delay-${i + 1} ${diff.visible ? "launch-reveal--visible" : ""}`}
              >
                <h3 style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.78)", margin: "0 0 10px" }}>{d.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.45)", margin: 0 }}>{d.body}</p>
              </div>
            ))}
          </div>
        </section>

        <PricingSection />

        <FaqSection />

        <section
          id="accounts"
          ref={accounts.ref}
          style={{ padding: "80px 28px 100px", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className={`launch-reveal ${accounts.visible ? "launch-reveal--visible" : ""}`} style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>WORKSPACES</div>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.85rem)", fontWeight: 600, margin: 0, letterSpacing: "-0.02em", maxWidth: "18ch" }}>
              {LAUNCH.sections.accountsTitle}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 14, maxWidth: "40ch", lineHeight: 1.6 }}>
              {LAUNCH.sections.accountsBody}
            </p>
          </div>
          <div className={`launch-reveal launch-reveal-delay-2 ${accounts.visible ? "launch-reveal--visible" : ""}`}>
            <AccountSwitcher />
          </div>
        </section>

        <section
          ref={cta.ref}
          style={{
            padding: "80px 28px 100px",
            textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "linear-gradient(180deg, transparent 0%, rgba(110,155,230,0.05) 100%)",
          }}
        >
          <div className={`launch-reveal ${cta.visible ? "launch-reveal--visible" : ""}`}>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 600, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
              {LAUNCH.sections.ctaTitle}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.42)", margin: "0 auto 32px", maxWidth: "36ch", lineHeight: 1.6 }}>
              {LAUNCH.sections.ctaBody}
            </p>
            <div style={{ maxWidth: 760, width: "100%", margin: "0 auto" }}>
              <WaitlistForm variant="footer" onSuccess={() => setWaitlistCount((c) => c + 1)} />
            </div>
            <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/preview" className="btn-primary" style={{ textDecoration: "none" }}>
                [ TRY LIVE DEMO ]
              </Link>
              <Link href="/auth" className="btn-ghost" style={{ textDecoration: "none" }}>
                [ SIGN IN ]
              </Link>
            </div>
          </div>
        </section>
        </main>

        <footer style={{ padding: "32px 28px 48px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <nav style={{ textAlign: "center", marginBottom: 16, fontSize: 10, letterSpacing: "0.1em" }} aria-label="Footer">
            <Link href="/competitive-intelligence" style={{ color: "rgba(255,255,255,0.35)", marginRight: 16, textDecoration: "none" }}>
              Competitive Intelligence Guide
            </Link>
            <Link href="/legal" style={{ color: "rgba(255,255,255,0.35)", marginRight: 16, textDecoration: "none" }}>
              Legal
            </Link>
            <a href="https://github.com/ShadowEsu/Vigilante" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
              GitHub
            </a>
          </nav>
          <LegalFooterLinks className="justify-center" />
          <p style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 16, letterSpacing: "0.08em" }}>
            VIGILANTE — competitive intelligence
          </p>
        </footer>
      </div>
    </div>
  );
}
