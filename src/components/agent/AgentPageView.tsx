"use client";

import Link from "next/link";
import { useState } from "react";
import { ACCENT } from "@/lib/ui/type-colors";

const EXAMPLES = [
  "> acme.com",
  "> track openai.com pricing + newsletters",
  "> monitor salesforce.com for hiring",
  "> jane doe linkedin insider intel",
];

interface Thread {
  id: string;
  title: string;
  updated: string;
}

interface Message {
  role: "user" | "watcher" | "sys";
  text: string;
  meta?: string;
}

interface WatcherPageViewProps {
  threads?: Thread[];
  initialMessages?: Message[];
}

export function WatcherPageView(_props: WatcherPageViewProps) {
  const [input, setInput] = useState("");
  const [target, setTarget] = useState<string | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  function submit() {
    const q = input.trim();
    if (!q) return;
    setTarget(q);
    setMessages((m) => [
      ...m,
      `Parsing target: ${q}`,
      "Detected company site — suggest pricing + newsletter watches.",
      "Ready to configure cadence and budget on the right.",
    ]);
    setInput("");
  }

  return (
    <div className="flex-1 min-h-0 grid font-mono" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <div
        className="flex flex-col min-h-0 border-r px-8 py-8"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] tracking-[0.2em]" style={{ color: ACCENT.cyan }}>
            :: AGENT
          </span>
          <span className="text-[10px] text-muted tracking-wide">watch setup assistant</span>
        </div>

        <p className="text-[13px] leading-[1.75] text-dim max-w-[48ch] mb-6">
          I&apos;m your watch setup agent. Tell me which company, website, or person you want to
          monitor — paste a URL or type a name.
        </p>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 text-[12px] text-muted">
          {messages.map((m, i) => (
            <p key={i} style={{ color: i === 0 ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)" }}>
              {m}
            </p>
          ))}
        </div>

        <div className="shrink-0 mt-4 flex items-center gap-2 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <span style={{ color: ACCENT.blue }}>agent&gt;</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="type a company, url, or person…"
            className="flex-1 border-none bg-transparent text-[13px]"
          />
          <span className="animate-pulse" style={{ color: ACCENT.green }}>
            ▌
          </span>
        </div>

        <p className="text-[10px] text-faint mt-4 tracking-wide">vigilant agent v0.5</p>
      </div>

      <div className="flex flex-col min-h-0 px-8 py-8">
        <div className="text-[11px] tracking-[0.14em] text-muted mb-6">[ WATCH CONFIG ]</div>

        {!target ? (
          <>
            <p className="text-[13px] text-dim mb-8">
              Target not configured yet. Type a URL or company name to begin.
            </p>
            <div className="text-[10px] tracking-[0.16em] text-muted mb-4">EXAMPLES</div>
            <ul className="space-y-3 text-[12px] text-dim">
              {EXAMPLES.map((ex) => (
                <li key={ex}>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(ex.replace(/^> /, ""));
                      setTarget(ex.replace(/^> /, ""));
                      setMessages(["Example loaded — adjust cadence and budget below."]);
                    }}
                    className="bg-transparent border-none p-0 font-mono text-left cursor-pointer hover:text-fg"
                  >
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="space-y-5 text-[12px]">
            <div>
              <div className="text-[10px] tracking-widest text-muted mb-2">TARGET</div>
              <div className="text-[14px] tracking-wide">{target}</div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-muted mb-2">TYPE</div>
              <div className="flex gap-4">
                <span style={{ color: ACCENT.gold }}>[x] company</span>
                <span className="text-muted">[ ] person</span>
                <span className="text-muted">[ ] ticker</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-muted mb-2">CADENCE</div>
              <div className="text-dim">every 6h</div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-muted mb-2">BUDGET</div>
              <div className="text-dim">$3.00 / month</div>
            </div>
            <Link
              href="/preview"
              className="mt-4 inline-block bg-transparent border px-4 py-2 font-mono text-[11px] tracking-wide no-underline"
              style={{ borderColor: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)" }}
            >
              [ create watch ]
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/** @deprecated use WatcherPageView */
export const AgentPageView = WatcherPageView;
