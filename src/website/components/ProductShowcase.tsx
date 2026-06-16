"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { TerminalSearch, type DiscoverResult } from "@/vigil/TerminalSearch";
import {
  DEMO_FALLBACK,
  demoBriefCopy,
  demoInsightItems,
  demoSignalCategories,
} from "../demo-intel";

const SCENES = [
  { id: "terminal", label: "DISCOVER" },
  { id: "overview", label: "OVERVIEW" },
  { id: "insights", label: "INSIGHTS" },
  { id: "brief", label: "BRIEF" },
] as const;

type SceneId = (typeof SCENES)[number]["id"];

function OverviewScene({ discovered }: { discovered: DiscoverResult }) {
  const categories = demoSignalCategories(discovered.sources);
  const name = discovered.name.toUpperCase();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 280, fontSize: 11 }}>
      <div style={{ padding: "18px 20px", borderRight: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>01 USAGE</div>
        <div className="launch-metric" style={{ fontSize: 32, color: "#4ADE80" }}>1</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>{name} watch live</div>
      </div>
      <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>04 SOURCES</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 6 }}>{discovered.sources.length} URLs indexed</div>
        <div style={{ fontSize: 10, color: "#4ADE80" }}>{discovered.domain}</div>
      </div>
      <div style={{ padding: "18px 20px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>SIGNAL COVERAGE</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((s) => (
            <span key={s} style={{ fontSize: 9, color: "#4ADE80" }}>● {s}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>TARGET</div>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{discovered.name}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{discovered.domain}</div>
      </div>
    </div>
  );
}

function InsightsScene({ discovered }: { discovered: DiscoverResult }) {
  const items = demoInsightItems(discovered);
  return (
    <div style={{ padding: "18px 22px", minHeight: 280 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
        07 INSIGHTS · {discovered.name.toUpperCase()}
      </div>
      {items.map((item) => (
        <div key={item.cat} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: item.color, border: `1px solid ${item.color}44`, padding: "2px 8px" }}>{item.cat}</span>
            {item.amt && <span style={{ fontSize: 13, fontWeight: 600 }}>{item.amt}</span>}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{item.text}</div>
        </div>
      ))}
    </div>
  );
}

function BriefScene({ discovered }: { discovered: DiscoverResult }) {
  return (
    <div style={{ padding: "22px 26px", minHeight: 280 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.16em", color: "rgba(255,255,255,0.28)", marginBottom: 12 }}>VIGILANTE INTEL · DEMO</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.94)", marginBottom: 14, lineHeight: 1.4 }}>
        {discovered.name} — competitive intel baseline
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.8, color: "rgba(255,255,255,0.58)", margin: 0 }}>
        {demoBriefCopy(discovered)}
      </p>
      <div style={{ marginTop: 16, fontSize: 10, color: "rgba(255,255,255,0.32)" }}>
        [ {discovered.sources.length} SOURCES ] · DEMO PREVIEW
      </div>
    </div>
  );
}

export function ProductShowcase() {
  const [scene, setScene] = useState<SceneId>("terminal");
  const [discovered, setDiscovered] = useState<DiscoverResult | null>(null);

  const preview = discovered ?? DEMO_FALLBACK;

  const handleDemoComplete = useCallback((result: DiscoverResult) => {
    setDiscovered(result);
    setScene("overview");
  }, []);

  const selectScene = (id: SceneId) => {
    setScene(id);
  };

  return (
    <div className="launch-browser" style={{ position: "relative" }}>
      <div className="launch-scan-line" />
      <div className="launch-browser-chrome">
        <span className="launch-browser-dot" />
        <span className="launch-browser-dot" />
        <span className="launch-browser-dot launch-browser-dot--live" />
        <span style={{ flex: 1, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>
          vigilante.app / demo
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {SCENES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => selectScene(s.id)}
              disabled={s.id !== "terminal" && !discovered}
              style={{
                background: scene === s.id ? "rgba(255,255,255,0.08)" : "transparent",
                border: `1px solid ${scene === s.id ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)"}`,
                padding: "4px 10px",
                font: "inherit",
                fontSize: 9,
                letterSpacing: "0.1em",
                color: scene === s.id ? "rgba(255,255,255,0.85)" : discovered || s.id === "terminal" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.18)",
                cursor: discovered || s.id === "terminal" ? "pointer" : "not-allowed",
                opacity: discovered || s.id === "terminal" ? 1 : 0.55,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", minHeight: 340 }}>
        <div style={{ display: scene === "terminal" ? "block" : "none" }}>
          <TerminalSearch demo embed onDemoComplete={handleDemoComplete} />
        </div>
        {scene === "overview" && <OverviewScene discovered={preview} />}
        {scene === "insights" && <InsightsScene discovered={preview} />}
        {scene === "brief" && <BriefScene discovered={preview} />}
      </div>

      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          fontSize: 10,
          letterSpacing: "0.06em",
          color: "rgba(255,255,255,0.32)",
        }}
      >
        <span>
          {discovered
            ? `${discovered.name} · ${discovered.sources.length} sources`
            : "Type a company — live discovery"}
        </span>
        <Link href="/preview" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
          open full app →
        </Link>
      </div>
    </div>
  );
}
