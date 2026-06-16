"use client";

import type { VigilState } from "../useVigil";
import type { ViewId } from "../data";
import { BORDER, PageSectionHead, scrollthin } from "./ui";

export const GRADIENT_PAGE =
  "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(110,155,230,0.08) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(167,139,250,0.05) 0%, transparent 50%), #000";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={scrollthin(className)}
      style={{
        height: "100%",
        overflow: "auto",
        background: GRADIENT_PAGE,
        padding: "32px 40px 48px",
      }}
    >
      {children}
    </div>
  );
}

export function SectionCard({
  label,
  count,
  color,
  desc,
  onClick,
}: {
  label: string;
  count?: string | number;
  color: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="vigil-fade-in"
      style={{
        textAlign: "left",
        background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${color}33`,
        padding: "22px 24px",
        font: "inherit",
        cursor: "pointer",
        transition: "transform 0.15s, border-color 0.15s",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = `${color}55`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = `${color}33`;
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, letterSpacing: "0.14em", color, fontWeight: 600 }}>{label}</span>
        {count !== undefined && (
          <span style={{ fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.92)", fontVariantNumeric: "tabular-nums" }}>{count}</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", lineHeight: 1.5, letterSpacing: "0.03em" }}>{desc}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 12, letterSpacing: "0.08em" }}>open →</div>
    </button>
  );
}

export function HubGrid({ v }: { v: VigilState }) {
  const cards: { id: ViewId; label: string; count: string | number; color: string; desc: string }[] = [
    { id: "changes", label: "CHANGES", count: v.changesCount, color: "#6E9BE6", desc: "Page diffs & pricing updates" },
    { id: "brief", label: "BRIEF", count: v.brief.confidence + "%", color: "#E3B341", desc: "Intelligence summary" },
    { id: "documents", label: "DOCUMENTS", count: v.documents.length, color: "#A78BFA", desc: "SEC filings & investor docs" },
    { id: "newsletter", label: "NEWS", count: v.newsletters.length, color: "#E8956D", desc: "Blog & newsletter posts" },
    { id: "market", label: "MARKET", count: v.stocks.length, color: "#4ADE80", desc: "Live tickers & moves" },
    { id: "insights", label: "INSIGHTS", count: v.insider.length, color: "#FC8C8C", desc: "Insider & org intel" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 24 }}>
      {cards.map((c) => (
        <SectionCard key={c.id} label={c.label} count={c.count} color={c.color} desc={c.desc} onClick={() => v.setView(c.id)} />
      ))}
    </div>
  );
}

export function StatStrip({ v }: { v: VigilState }) {
  const stats = [
    { label: "WATCHES", value: v.counters.watches, color: "#4ADE80" },
    { label: "PAGES", value: v.counters.pages, color: "#6E9BE6" },
    { label: "CHANGES", value: v.changesCount, color: "#E3B341" },
    { label: "SPEND", value: v.animSpend, color: "#A78BFA" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 8 }}>
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            padding: "20px 22px",
            border: `1px solid ${BORDER}`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 600, color: s.color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
          <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginTop: 10 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
