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
      className="launch-section launch-section--faq"
    >
      <div className={`launch-reveal ${visible ? "launch-reveal--visible" : ""}`}>
        <p className="launch-eyebrow">FAQ</p>
        <h2 id="faq-heading" className="launch-section-title">
          Questions teams ask before they switch.
        </h2>
      </div>
      <div className={`launch-reveal launch-reveal-delay-1 ${visible ? "launch-reveal--visible" : ""}`}>
        {LAUNCH_FAQ.map((item, i) => {
          const expanded = open === i;
          return (
            <div key={item.question} className={`launch-faq-item ${expanded ? "launch-faq-item--open" : ""}`}>
              <button
                type="button"
                className="launch-faq-trigger"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
              >
                <span>{item.question}</span>
                <span className="launch-faq-chevron" aria-hidden>
                  {expanded ? "−" : "+"}
                </span>
              </button>
              <div className={`launch-faq-panel ${expanded ? "launch-faq-panel--open" : ""}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
