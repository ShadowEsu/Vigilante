"use client";

import type { VigilState } from "../useVigil";
import { BORDER, PageSectionHead, scrollthin } from "./ui";

export function AgentView({ v }: { v: VigilState }) {
  const cfg = v.agentConfig;
  const agentStage = v.agentStage;
  const hasTarget = agentStage >= 1 && !!cfg.name;
  const hasTracks = agentStage >= 2 && cfg.signals.length > 0;
  const showSettings = agentStage >= 3;
  const showDeploy = agentStage >= 3 && agentStage < 4;
  const showDone = agentStage >= 4;

  const agentTracks = cfg.signals.map((s) => ({
    name: s.toUpperCase(),
    color: v.typeColor[s] || "rgba(255,255,255,0.6)",
  }));

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "60% 40%", minHeight: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column", padding: "28px 32px", borderRight: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <PageSectionHead num="06" title="AGENT" right="watch setup assistant" marginBottom={22} />
        <div className={scrollthin()} style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
          {v.agentLog.map((m, i) =>
            m.role === "user" ? (
              <div key={i} style={{ display: "flex", gap: 12, fontSize: 13, animation: "slideIn 0.2s ease both" }}>
                <span style={{ color: "rgba(255,255,255,0.38)", flexShrink: 0 }}>›</span>
                <span style={{ color: "rgba(255,255,255,0.92)" }}>{m.text}</span>
              </div>
            ) : (
              <div key={i} style={{ paddingLeft: 22, maxWidth: "64ch", animation: "fadeUp 0.25s ease both" }}>
                <div style={{ fontSize: 13, lineHeight: 1.78, color: "rgba(255,255,255,0.65)" }}>{m.text}</div>
                {m.meta && <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.28)", marginTop: 7, letterSpacing: "0.06em" }}>{m.meta}</div>}
              </div>
            )
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 11, borderTop: `1px solid ${BORDER}`, paddingTop: 16, marginTop: 16, flexShrink: 0 }}>
          <span style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>agent&gt;</span>
          <input
            value={v.agentInput}
            onChange={(e) => v.setAgentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && v.agentSubmit()}
            placeholder="type a URL or company name…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "rgba(255,255,255,0.92)", font: "inherit", fontSize: 13, caretColor: "rgba(255,255,255,0.92)" }}
          />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.06em" }}>↵ send</span>
        </div>
      </div>
      <div className={scrollthin()} style={{ overflow: "auto", padding: "24px 28px", background: "rgba(255,255,255,0.008)" }}>
        <div style={{ fontSize: 9.5, letterSpacing: "0.2em", color: "rgba(255,255,255,0.38)", marginBottom: 22, fontWeight: 500 }}>[ WATCH CONFIG ]</div>
        {!hasTarget && (
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", lineHeight: 2.1, marginBottom: 28 }}>
              Target not configured yet.
              <br />
              Type a URL or company name to begin.
            </div>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", letterSpacing: "0.14em", marginBottom: 12 }}>EXAMPLES</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 2.3 }}>
              <div>› acme.com</div>
              <div>› track openai.com pricing + newsletters</div>
              <div>› monitor salesforce.com for hiring</div>
              <div>› jane doe linkedin insider intel</div>
            </div>
          </div>
        )}
        {hasTarget && (
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "16px 18px", marginBottom: 14, animation: "fadeUp 0.25s ease both" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>TARGET</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.92)", marginBottom: 6, fontWeight: 500 }}>{cfg.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", letterSpacing: "0.04em" }}>{cfg.url}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 6, letterSpacing: "0.1em" }}>TYPE: {cfg.type}</div>
          </div>
        )}
        {hasTracks && (
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "16px 18px", marginBottom: 14, animation: "fadeUp 0.3s ease both" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>INTEL TRACKS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {agentTracks.map((s) => (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.45)" }}>✓</span>
                  <span style={{ color: s.color, letterSpacing: "0.08em" }}>{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {showSettings && (
          <div style={{ border: "1px solid rgba(255,255,255,0.1)", padding: "16px 18px", marginBottom: 18, animation: "fadeUp 0.35s ease both" }}>
            <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.32)", marginBottom: 12 }}>SCHEDULE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ color: "rgba(255,255,255,0.38)", width: 72 }}>CADENCE</span>
                <span>{cfg.cadence}</span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ color: "rgba(255,255,255,0.38)", width: 72 }}>BUDGET</span>
                <span>${cfg.budget} / mo</span>
              </div>
            </div>
          </div>
        )}
        {showDeploy && (
          <button
            type="button"
            onClick={v.agentDeploy}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(255,255,255,0.28)",
              padding: "14px 22px",
              font: "inherit",
              fontSize: 12,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.92)",
              cursor: "pointer",
              animation: "fadeUp 0.4s ease both",
            }}
          >
            [ DEPLOY WATCH ]
          </button>
        )}
        {showDone && (
          <div style={{ border: "1px solid rgba(255,255,255,0.14)", padding: "16px 18px", fontSize: 12, color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}>
            <div style={{ color: "rgba(255,255,255,0.9)", marginBottom: 6 }}>✓ WATCH DEPLOYED</div>
            <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>First scan queued — documents, newsletters, and insider intel appear in Overview within 2–4 min.</div>
          </div>
        )}
      </div>
    </div>
  );
}
