"use client";

import { LAUNCH } from "../copy";
import { useInView } from "../hooks/useInView";

function StepBlock({ step, last, index }: { step: (typeof LAUNCH.steps)[0]; last?: boolean; index: number }) {
  const { ref, visible } = useInView<HTMLDivElement>(0.2);
  return (
    <div
      ref={ref}
      className={`launch-reveal launch-reveal-delay-${Math.min(index + 1, 4)} ${visible ? "launch-reveal--visible" : ""}`}
      style={{ position: "relative", paddingLeft: 48, paddingBottom: last ? 0 : 40 }}
    >
      {!last && <div className="launch-step-line" />}
      <div
        className="launch-step-badge"
        style={{
          borderColor: `${step.accent}55`,
          color: step.accent,
        }}
      >
        {step.num}
      </div>
      <h3 style={{ fontSize: 13, letterSpacing: "0.2em", color: step.accent, margin: "0 0 8px", fontWeight: 500 }}>
        {step.title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.52)", margin: 0, maxWidth: "44ch" }}>
        {step.body}
      </p>
    </div>
  );
}

export function FeatureWalkthrough() {
  const { ref, visible } = useInView<HTMLElement>(0.1);
  return (
    <section id="how" ref={ref} style={{ padding: "88px 28px", maxWidth: 1100, margin: "0 auto" }}>
      <div className={`launch-reveal ${visible ? "launch-reveal--visible" : ""}`}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 40px", maxWidth: "18ch" }}>
          {LAUNCH.sections.howTitle}
        </h2>
      </div>
      <div style={{ marginTop: 4 }}>
        {LAUNCH.steps.map((step, i) => (
          <StepBlock key={step.num} step={step} last={i === LAUNCH.steps.length - 1} index={i} />
        ))}
      </div>
    </section>
  );
}
