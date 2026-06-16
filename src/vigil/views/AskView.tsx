"use client";

import type { VigilState } from "../useVigil";
import { BORDER, PageSectionHead, VigilBtn, scrollthin } from "./ui";

const SUGGESTIONS = [
  "What changed on pricing recently?",
  "Summarize the latest SEC filings",
  "Any hiring or leadership signals?",
  "What did the last newsletter say?",
];

export function AskView({ v }: { v: VigilState }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "28px 40px" }}>
      <PageSectionHead
        num="06"
        title="ASK"
        right={v.systemStatus?.ai ? "CLAUDE · LIVE" : "RULES · ADD ANTHROPIC KEY"}
        marginBottom={22}
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {SUGGESTIONS.map((s) => (
          <VigilBtn key={s} onClick={() => { v.setAskInput(s); }} accent>
            {s}
          </VigilBtn>
        ))}
      </div>
      <div className={scrollthin()} style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 18, minHeight: 0 }}>
        {v.askLog.map((m, i) => {
          if (m.role === "sys") {
            return (
              <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em", lineHeight: 1.6 }}>
                {m.text}
              </div>
            );
          }
          if (m.role === "you") {
            return (
              <div key={i} className="vigil-fade-in" style={{ display: "flex", gap: 12, fontSize: 13 }}>
                <span style={{ color: "rgba(255,255,255,0.38)" }}>›</span>
                <span style={{ color: "rgba(255,255,255,0.92)" }}>{m.text}</span>
              </div>
            );
          }
          return (
            <div key={i} className="vigil-fade-in" style={{ paddingLeft: 24, maxWidth: "66ch" }}>
              <div style={{ fontSize: 13, lineHeight: 1.82, color: "rgba(255,255,255,0.65)" }}>{m.text}</div>
              {m.meta && <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)", marginTop: 9, letterSpacing: "0.06em" }}>{m.meta}</div>}
            </div>
          );
        })}
        {v.askLoading && (
          <div style={{ paddingLeft: 24, fontSize: 11, color: "rgba(255,255,255,0.38)", animation: "scanBeat 1.2s infinite" }}>
            analyzing indexed intel…
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 11, borderTop: `1px solid ${BORDER}`, paddingTop: 16, marginTop: 16, flexShrink: 0 }}>
        <span style={{ color: "rgba(255,255,255,0.45)" }}>vigil&gt;</span>
        <input
          value={v.askInput}
          onChange={(e) => v.setAskInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !v.askLoading && v.askSubmit()}
          placeholder="ask about your watches…"
          disabled={v.askLoading}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.92)", font: "inherit", fontSize: 13, caretColor: "rgba(255,255,255,0.92)" }}
        />
        <VigilBtn onClick={() => v.askSubmit()} disabled={v.askLoading || !v.askInput.trim()}>
          {v.askLoading ? "···" : "SEND"}
        </VigilBtn>
      </div>
    </div>
  );
}
