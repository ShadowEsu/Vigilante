"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Analysis, Signal } from "@/types/database";
import { HIGH_SEV_COLOR, LIVE_COLOR, STATUS_COLOR } from "@/lib/ui/type-colors";

export interface LiveEvent {
  id: string;
  kind: "scan" | "signal" | "status";
  title: string;
  detail: string;
  at: number;
}

interface LiveActivityFeedProps {
  analyses: Analysis[];
  signals: Signal[];
  demo?: boolean;
}

const KIND_STYLE = {
  scan: { label: "LIVE SCAN", color: LIVE_COLOR },
  signal: { label: "NEW SIGNAL", color: HIGH_SEV_COLOR },
  status: { label: "WATCH UPDATE", color: STATUS_COLOR.change },
} as const;

function buildTemplates(analyses: Analysis[], signals: Signal[]): Omit<LiveEvent, "id" | "at">[] {
  const out: Omit<LiveEvent, "id" | "at">[] = [];

  for (const a of analyses.filter((x) => x.status === "live")) {
    out.push({
      kind: "scan",
      title: a.name,
      detail: "scan complete · checking sources",
    });
    out.push({
      kind: "status",
      title: a.name,
      detail: `next run in ${Math.round(a.cadence_minutes / 60)}h`,
    });
  }

  for (const s of signals.slice(0, 6)) {
    out.push({
      kind: "signal",
      title: s.title,
      detail: analyses.find((a) => a.id === s.analysis_id)?.name ?? "watchlist",
    });
  }

  return out.length
    ? out
    : [
        {
          kind: "status" as const,
          title: "Vigilante",
          detail: "monitoring idle · add a watchlist to begin",
        },
      ];
}

export function LiveActivityFeed({ analyses, signals, demo = false }: LiveActivityFeedProps) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const templates = useRef(buildTemplates(analyses, signals));
  const idx = useRef(0);

  useEffect(() => {
    templates.current = buildTemplates(analyses, signals);
  }, [analyses, signals]);

  const pushEvent = useCallback(() => {
    const pool = templates.current;
    const tpl = pool[idx.current % pool.length];
    idx.current += 1;
    const event: LiveEvent = {
      ...tpl,
      id: `${Date.now()}-${idx.current}`,
      at: Date.now(),
    };
    setEvents((prev) => [event, ...prev].slice(0, 4));
  }, []);

  useEffect(() => {
    if (!demo) return;
    const boot = setTimeout(pushEvent, 1200);
    const timer = setInterval(pushEvent, 14000 + Math.random() * 8000);
    return () => {
      clearTimeout(boot);
      clearInterval(timer);
    };
  }, [demo, pushEvent]);

  const dismiss = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  if (!events.length) return null;

  return (
    <div className="shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      {events.map((event) => {
        const style = KIND_STYLE[event.kind];
        return (
          <div
            key={event.id}
            className="flex items-center gap-4 px-6 py-3 border-b last:border-b-0 text-[13px] tracking-wide"
            style={{
              borderColor: "rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <span
              className="text-[10px] font-medium tracking-[0.2em] shrink-0"
              style={{ color: style.color }}
            >
              {style.label}
            </span>
            <span className="text-faint shrink-0">|</span>
            <span className="truncate font-medium">{event.title}</span>
            <span className="text-muted truncate hidden sm:inline">{event.detail}</span>
            <button
              type="button"
              onClick={() => dismiss(event.id)}
              className="ml-auto shrink-0 bg-transparent border-none text-faint cursor-pointer text-[11px] hover:text-dim"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
