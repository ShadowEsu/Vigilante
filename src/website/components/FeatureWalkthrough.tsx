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
          boxShadow: visible ? `0 0 24px ${step.accent}22` : undefined,
        }}
      >
        {step.num}
      </div>
      <h3 style={{ fontSize: 13, letterSpacing: "0.2em", color: step.accent, margin: "0 0 8px", fontWeight: 500 }}>
        {step.title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.52)", margin: "0 0 10px", maxWidth: "44ch" }}>
        {step.body}
      </p>
      {"hint" in step && step.hint && (
        <p style={{ fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.28)", margin: 0 }}>
          {step.hint}
        </p>
      )}
    </div>
  );
}

export function FeatureWalkthrough() {
  const { ref, visible } = useInView<HTMLElement>(0.1);
  return (
    <section id="how" ref={ref} className="launch-section">
      <div className={`launch-reveal ${visible ? "launch-reveal--visible" : ""}`}>
        <p className="launch-eyebrow">HOW IT WORKS</p>
        <h2 className="launch-section-title">{LAUNCH.sections.howTitle}</h2>
      </div>
      <div style={{ marginTop: 4 }}>
        {LAUNCH.steps.map((step, i) => (
          <StepBlock key={step.num} step={step} last={i === LAUNCH.steps.length - 1} index={i} />
        ))}
      </div>
    </section>
  );
}
