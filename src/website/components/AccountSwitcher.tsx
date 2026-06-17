"use client";

import { useState } from "react";
import Link from "next/link";
import { LAUNCH } from "../copy";
import { appPath, demoPath } from "@/lib/paths";

export function AccountSwitcher() {
  const [active, setActive] = useState(0);
  const persona = LAUNCH.personas[active];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 280px) 1fr", gap: 24, alignItems: "stretch" }} className="launch-persona-grid">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>
          ACCOUNTS
        </div>
        {LAUNCH.personas.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`launch-persona-card ${i === active ? "launch-persona-card--active" : ""}`}
            onClick={() => setActive(i)}
            style={{ textAlign: "left", background: "transparent", font: "inherit", color: "inherit" }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.42)" }}>{p.role} · {p.org}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 8 }}>{p.email}</div>
          </button>
        ))}
        <Link
          href={appPath("/auth")}
          className="btn-ghost"
          style={{ marginTop: 8, textAlign: "center", textDecoration: "none", padding: "12px", display: "block" }}
        >
          [ Sign in with magic link ]
        </Link>
      </div>

      <div className="launch-browser launch-workspace-preview" style={{ animation: "fadeUp 0.5s ease both" }} key={persona.id}>
        <div className="launch-browser-chrome">
          <span className="launch-browser-dot launch-browser-dot--live" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            {persona.email} → workspace
          </span>
        </div>
        <div style={{ padding: "22px 26px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.32)", marginBottom: 16 }}>
            YOUR WATCHES
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {persona.watches.map((w) => (
              <span
                key={w}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  padding: "8px 14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                ● {w}
              </span>
            ))}
          </div>
          <div
            style={{
              padding: "16px 18px",
              borderLeft: "3px solid #6E9BE6",
              background: "linear-gradient(90deg, rgba(110,155,230,0.08) 0%, transparent 100%)",
            }}
          >
            <div style={{ fontSize: 10, color: "#6E9BE6", letterSpacing: "0.1em", marginBottom: 8 }}>LATEST SIGNAL</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.88)", lineHeight: 1.5 }}>{persona.highlight}</div>
          </div>
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <Link href={demoPath()} className="btn-primary" style={{ textDecoration: "none", fontSize: 11 }}>
              Open dashboard
            </Link>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", alignSelf: "center" }}>
              Isolated per account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
