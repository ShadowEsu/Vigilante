"use client";

import { useEffect, useRef } from "react";
import type { VigilState } from "../useVigil";
import { BORDER, PageSectionHead, VigilBtn } from "./ui";

const PROMPTS = [
  "What changed on pricing?",
  "Summarize recent SEC filings",
  "Any hiring signals?",
  "Latest newsletter highlights",
  "Compare to last scan",
];

export function AIView({ v }: { v: VigilState }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasChat = v.askLog.some((m) => m.role === "you" || m.role === "vigil");

  useEffect(() => {
    if (hasChat) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [v.askLog, v.askLoading, hasChat]);

  if (!hasChat) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000" }}>
        <div style={{ padding: "24px 36px 0", flexShrink: 0 }}>
          <PageSectionHead num="10" title="AI" marginBottom={0} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 36px" }}>
          <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 500, color: "rgba(255,255,255,0.88)", marginBottom: 12, letterSpacing: "-0.02em" }}>
              What would you like to know?
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", lineHeight: 1.65, margin: "0 0 28px" }}>
              Ask about changes, filings, newsletters, or hiring across your monitored targets.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
              {PROMPTS.map((p) => (
                <VigilBtn key={p} onClick={() => v.setAskInput(p)} accent>
                  {p}
                </VigilBtn>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `1px solid ${BORDER}`,
                padding: "14px 18px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <span style={{ color: "#4ade80", fontSize: 14 }}>ai&gt;</span>
              <input
                value={v.askInput}
                onChange={(e) => v.setAskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !v.askLoading && v.askSubmit()}
                placeholder="ask about your targets…"
                disabled={v.askLoading}
                autoFocus
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.92)", font: "inherit", fontSize: 14, textAlign: "left" }}
              />
              <VigilBtn onClick={() => v.askSubmit()} disabled={v.askLoading || !v.askInput.trim()} variant="primary">
                {v.askLoading ? "···" : "SEND"}
              </VigilBtn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000" }}>
      <div style={{ padding: "24px 36px 0", flexShrink: 0 }}>
        <PageSectionHead num="10" title="AI" right="INTELLIGENCE ASSISTANT" marginBottom={12} />
      </div>

      <div className="scrollthin" style={{ flex: 1, overflow: "auto", padding: "16px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
        {v.askLog.map((m, i) => {
          if (m.role === "sys") return null;
          if (m.role === "you") {
            return (
              <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "72%", padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, fontSize: 13, lineHeight: 1.55 }}>
                  {m.text}
                </div>
              </div>
            );
          }
          return (
            <div key={i} style={{ maxWidth: "78%", paddingLeft: 4 }}>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.72)" }}>{m.text}</div>
              {m.meta && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 6 }}>{m.meta}</div>}
            </div>
          );
        })}
        {v.askLoading && (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", animation: "scanBeat 1.2s infinite" }}>thinking…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: `1px solid ${BORDER}`, padding: "14px 36px", flexShrink: 0 }}>
        <span style={{ color: "#4ade80", fontSize: 13 }}>ai&gt;</span>
        <input
          value={v.askInput}
          onChange={(e) => v.setAskInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !v.askLoading && v.askSubmit()}
          placeholder="ask about your targets…"
          disabled={v.askLoading}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.92)", font: "inherit", fontSize: 13 }}
        />
        <VigilBtn onClick={() => v.askSubmit()} disabled={v.askLoading || !v.askInput.trim()} variant="primary">
          {v.askLoading ? "···" : "SEND"}
        </VigilBtn>
      </div>
    </div>
  );
}
