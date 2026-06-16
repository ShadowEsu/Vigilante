"use client";

import { useEffect, useRef, useState } from "react";
import { useAlerts } from "./AlertsContext";

export function FlashToasts() {
  const { alerts } = useAlerts();
  const [visible, setVisible] = useState<string[]>([]);
  const [dismissing, setDismissing] = useState<Set<string>>(new Set());
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = alerts.filter(
      (a) =>
        (a.severity === "high" || a.severity === "med") &&
        !shownRef.current.has(a.id)
    );
    const top = fresh.slice(0, 2);
    if (top.length === 0) return;

    top.forEach((a) => shownRef.current.add(a.id));
    setVisible((v) => Array.from(new Set([...v, ...top.map((a) => a.id)])));

    const timers = top.map((a, i) =>
      setTimeout(() => {
        setDismissing((s) => new Set(s).add(a.id));
        setTimeout(() => {
          setVisible((v) => v.filter((x) => x !== a.id));
          setDismissing((s) => {
            const n = new Set(s);
            n.delete(a.id);
            return n;
          });
        }, 300);
      }, 4500 + i * 1200)
    );
    return () => timers.forEach(clearTimeout);
  }, [alerts]);

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-3 right-3 z-[100] flex flex-col gap-2 pointer-events-none">
      {visible.map((id) => {
        const alert = alerts.find((a) => a.id === id);
        if (!alert) return null;
        const isHigh = alert.severity === "high";
        return (
          <div
            key={id}
            className={`pointer-events-auto w-72 border px-3 py-2.5 backdrop-blur-sm ${
              dismissing.has(id) ? "animate-[flash-out_0.3s_ease-in_forwards]" : "animate-[flash-in_0.35s_ease-out]"
            } ${
              isHigh
                ? "border-term-yellow/50 bg-black/95 shadow-[0_0_20px_rgba(220,220,170,0.15)]"
                : "border-term-blue/50 bg-black/95 shadow-[0_0_20px_rgba(86,156,214,0.15)]"
            }`}
          >
            <div className="flex items-start gap-2">
              <span
                className={`mt-0.5 w-1.5 h-1.5 shrink-0 rounded-full animate-live-pulse ${
                  isHigh ? "bg-term-yellow" : "bg-term-blue"
                }`}
              />
              <div>
                <div className="text-[10px] text-term-dim uppercase tracking-wide">
                  New signal
                </div>
                <div className="text-t-sm text-term-fg mt-0.5 leading-snug">
                  {alert.title}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
