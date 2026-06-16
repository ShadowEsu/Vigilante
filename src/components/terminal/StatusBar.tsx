"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ShellStats } from "./ui";

export function StatusBar({
  stats,
  demo = false,
  title,
}: {
  stats: ShellStats;
  demo?: boolean;
  title?: string;
}) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    function tick() {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setClock(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}`);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="vigilant-statusbar shrink-0 h-[46px] border-b border-edge flex items-center gap-4 px-5 text-[11px] text-muted tracking-wide">
      {demo && (
        <>
          <span className="flex items-center gap-1.5" style={{ color: "#6FCF8E" }}>
            <span className="text-[8px]">●</span>
            LIVE DEMO
          </span>
          <span className="text-faint">|</span>
        </>
      )}
      {title && (
        <>
          <span className="text-dim tracking-wider">{title}</span>
          <span className="text-faint">|</span>
        </>
      )}
      <span>
        WATCHES <span style={{ color: "#6FCF8E" }}>{stats.watches}</span>
      </span>
      <span>
        SIGNALS <span style={{ color: "#6E9BE6" }}>{stats.signals}</span>
      </span>
      <span>
        SPEND{" "}
        <span className="tabular-nums" style={{ color: "#E3B341" }}>
          ${stats.spend.toFixed(2)} / ${stats.budget.toFixed(2)}
        </span>
      </span>
      <span className="ml-auto tabular-nums text-dim" suppressHydrationWarning>
        {clock} UTC
      </span>
      {demo && (
        <Link
          href="/auth"
          className="bg-transparent border font-mono text-[10px] tracking-wide cursor-pointer shrink-0 no-underline"
          style={{
            borderColor: "rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.6)",
            padding: "5px 12px",
          }}
        >
          [ connect supabase ]
        </Link>
      )}
    </header>
  );
}
