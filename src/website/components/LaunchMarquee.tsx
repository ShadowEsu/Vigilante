"use client";

import { LAUNCH } from "../copy";

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const track = [...items, ...items];
  return (
    <div className={`launch-marquee-row ${reverse ? "launch-marquee-row--reverse" : ""}`}>
      <div className="launch-marquee-track">
        {track.map((label, i) => (
          <span key={`${label}-${i}`} className="launch-marquee-item">
            <span className="launch-marquee-dot" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LaunchMarquee() {
  return (
    <div className="launch-marquee-band" aria-hidden>
      <MarqueeRow items={LAUNCH.marquee.rowA} />
      <MarqueeRow items={LAUNCH.marquee.rowB} reverse />
    </div>
  );
}
