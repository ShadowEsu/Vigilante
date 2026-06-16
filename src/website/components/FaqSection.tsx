"use client";

import { useState } from "react";
import { LAUNCH_FAQ } from "../seo-faq";
import { useInView } from "../hooks/useInView";

export function FaqSection() {
  const { ref, visible } = useInView<HTMLElement>(0.1);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      ref={ref}
      aria-labelledby="faq-heading"
      style={{
        padding: "80px 28px 100px",
        maxWidth: 800,
        margin: "0 auto",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className={`launch-reveal ${visible ? "launch-reveal--visible" : ""}`}>
        <p style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>FAQ</p>
        <h2
          id="faq-heading"
          style={{ fontSize: "clamp(1.4rem, 3vw, 1.85rem)", fontWeight: 600, margin: "0 0 32px", letterSpacing: "-0.02em" }}
        >
          Competitive intelligence, answered.
        </h2>
      </div>
      <div className={`launch-reveal launch-reveal-delay-1 ${visible ? "launch-reveal--visible" : ""}`}>
        {LAUNCH_FAQ.map((item, i) => {
          const expanded = open === i;
          return (
            <div
              key={item.question}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 0" }}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  color: "inherit",
                  font: "inherit",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: 1.5,
                  padding: 0,
                }}
              >
                {item.question}
              </button>
              {expanded && (
                <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.48)", margin: "12px 0 0" }}>
                  {item.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
