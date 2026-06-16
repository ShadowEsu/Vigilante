"use client";

import { useAlerts } from "./AlertsContext";

export function NewsTicker() {
  const { alerts } = useAlerts();

  if (alerts.length === 0) return null;

  const items = alerts.slice(0, 8);
  const doubled = [...items, ...items];

  return (
    <div className="border-b border-term-line bg-surface/80 shrink-0 overflow-hidden">
      <div className="flex items-center h-7">
        <div className="shrink-0 px-3 flex items-center gap-1.5 border-r border-term-line h-full">
          <span className="w-1.5 h-1.5 rounded-full bg-term-blue animate-live-pulse" />
          <span className="text-[10px] text-term-blue uppercase tracking-wider">Live</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="flex whitespace-nowrap animate-[ticker_28s_linear_infinite] hover:[animation-play-state:paused]">
            {doubled.map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className="inline-flex items-center px-6 text-[10px] text-term-dim"
              >
                <span
                  className={
                    item.severity === "high"
                      ? "text-term-yellow"
                      : item.severity === "med"
                        ? "text-term-blue"
                        : "text-term-dim"
                  }
                >
                  {item.severity === "high" ? "● " : "○ "}
                </span>
                <span className="text-term-fg">{item.title}</span>
                <span className="mx-3 text-term-line">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
