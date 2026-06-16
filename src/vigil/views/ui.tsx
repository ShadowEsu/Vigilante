"use client";

import { useId, useState } from "react";
import type { ActivityDay } from "../utils";

export const FONT = "'JetBrains Mono', ui-monospace, monospace";
export const BORDER = "rgba(255,255,255,0.07)";
export const BORDER_LIGHT = "rgba(255,255,255,0.05)";
export const PANEL_PAD = "30px 32px";
export const PANEL_GAP = 18;

export function scrollthin(extra?: string) {
  return extra ? `scrollthin ${extra}` : "scrollthin";
}

export function VigilBtn({
  children,
  onClick,
  disabled,
  variant = "ghost",
  accent,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "ghost" | "primary" | "danger";
  accent?: boolean;
}) {
  const base: React.CSSProperties = {
    background: variant === "primary" ? "rgba(255,255,255,0.08)" : "transparent",
    border: `1px solid ${
      variant === "danger"
        ? "rgba(252,140,140,0.35)"
        : accent
          ? "rgba(110,155,230,0.45)"
          : "rgba(255,255,255,0.16)"
    }`,
    padding: "5px 12px",
    font: "inherit",
    fontSize: 11,
    letterSpacing: "0.1em",
    color:
      variant === "danger"
        ? disabled
          ? "rgba(252,140,140,0.4)"
          : "#FC8C8C"
        : disabled
          ? "rgba(255,255,255,0.28)"
          : accent
            ? "rgba(110,207,230,0.95)"
            : "rgba(255,255,255,0.72)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "border-color 0.15s, background 0.15s, color 0.15s",
    flexShrink: 0,
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={base} className="vigil-btn">
      {children}
    </button>
  );
}

export function SectionHead({
  num,
  title,
  right,
  titleSize = 10,
  marginBottom = 12,
}: {
  num: string;
  title: string;
  right?: string;
  titleSize?: number;
  marginBottom?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.15em" }}>{num}</span>
      <span style={{ fontSize: titleSize, color: "rgba(255,255,255,0.5)", letterSpacing: "0.22em", fontWeight: 500 }}>{title}</span>
      <span style={{ flex: 1, height: 1, background: BORDER }} />
      {right && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", letterSpacing: "0.1em" }}>{right}</span>
      )}
    </div>
  );
}

export function PageSectionHead({
  num,
  title,
  right,
  marginBottom = 26,
}: {
  num: string;
  title: string;
  right?: string;
  marginBottom?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", letterSpacing: "0.15em" }}>{num}</span>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: "0.22em", fontWeight: 500 }}>{title}</span>
      <span style={{ flex: 1, height: 1, background: BORDER }} />
      {right && (
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.1em" }}>{right}</span>
      )}
    </div>
  );
}

interface ActivityChartProps {
  w?: number;
  h?: number;
  height?: string;
  data?: ActivityDay[];
}

export function ActivityChart({ w = 340, h = 78, height = "78px", data = [] }: ActivityChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const gid = useId().replace(/:/g, "");
  const chartData = data.length > 0 ? data : Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
      count: 0,
      fullDate: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
      isoDate: d.toISOString().slice(0, 10),
    };
  });

  const pad = { t: 14, r: 8, b: 22, l: 4 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const maxV = Math.max(...chartData.map((d) => d.count), 1);
  const pts = chartData.map((d, i) => ({
    x: pad.l + (i / Math.max(chartData.length - 1, 1)) * iw,
    y: pad.t + ih - (d.count / maxV) * ih,
    count: d.count,
    day: d.day,
    fullDate: d.fullDate,
  }));

  let path = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const mx = (pts[i - 1].x + pts[i].x) / 2;
    path += ` C${mx.toFixed(1)},${pts[i - 1].y.toFixed(1)} ${mx.toFixed(1)},${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
  }
  const area = `${path} L${(pad.l + iw).toFixed(1)},${(pad.t + ih).toFixed(1)} L${pad.l},${(pad.t + ih).toFixed(1)} Z`;
  const len = iw * 2.2;
  const hoverPt = hovered !== null ? pts[hovered] : null;
  const rangeLabel =
    chartData.length >= 2
      ? `${chartData[0].fullDate} → ${chartData[chartData.length - 1].fullDate}`
      : "";

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ width: "100%", height, display: "block", overflow: "visible", flexShrink: 0 }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <line
            key={i}
            x1={pad.l}
            y1={pad.t + ih * (1 - f)}
            x2={pad.l + iw}
            y2={pad.t + ih * (1 - f)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.72)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: len,
            strokeDashoffset: len,
            animation: "chartDraw 1.4s cubic-bezier(0.4,0,0.2,1) forwards 0.6s",
          }}
        />
        {pts.map((pt, i) => (
          <g key={pt.day}>
            <rect
              x={pt.x - iw / chartData.length / 2}
              y={pad.t}
              width={iw / chartData.length}
              height={ih + pad.b}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHovered(i)}
            />
            {hovered === i && (
              <>
                <line
                  x1={pt.x}
                  y1={pad.t}
                  x2={pt.x}
                  y2={pad.t + ih}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={1}
                  strokeDasharray="2 3"
                />
                <circle cx={pt.x} cy={pt.y} r={4} fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
              </>
            )}
          </g>
        ))}
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={7} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={2.5} fill="rgba(255,255,255,0.9)" />
        <text x={pad.l} y={h - 4} fill="rgba(255,255,255,0.28)" fontSize={9} letterSpacing="0.06em">
          {chartData[0]?.day}
        </text>
        <text x={pad.l + iw} y={h - 4} fill="rgba(255,255,255,0.28)" fontSize={9} textAnchor="end" letterSpacing="0.06em">
          {chartData[chartData.length - 1]?.day}
        </text>
      </svg>
      {hoverPt && (
        <div
          style={{
            position: "absolute",
            left: `${(hoverPt.x / w) * 100}%`,
            top: 0,
            transform: "translate(-50%, -100%)",
            marginTop: -6,
            padding: "8px 10px",
            background: "rgba(12,12,12,0.98)",
            border: "1px solid rgba(255,255,255,0.14)",
            fontSize: 10,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.78)",
            letterSpacing: "0.04em",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 5,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.42)", marginBottom: 2 }}>{hoverPt.fullDate}</div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.95)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{hoverPt.count}</span>
            <span style={{ color: "rgba(255,255,255,0.45)" }}> {hoverPt.count === 1 ? "scan" : "scans"}</span>
          </div>
        </div>
      )}
      {rangeLabel && (
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", marginTop: 6, letterSpacing: "0.05em" }}>
          {rangeLabel} · hover chart for daily counts
        </div>
      )}
    </div>
  );
}
