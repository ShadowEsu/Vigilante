"use client";

import { useState } from "react";
import type { VigilState } from "../useVigil";
import { BORDER, PageSectionHead, scrollthin } from "./ui";

type Stock = VigilState["stocks"][number];

function StockDetail({ stock, onClose }: { stock: Stock; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        animation: "fadeUp 0.2s ease both",
      }}
    >
      <div style={{ borderBottom: `1px solid ${BORDER}`, padding: "16px 28px", display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          onClick={onClose}
          style={{ background: "transparent", border: `1px solid ${BORDER}`, padding: "6px 14px", font: "inherit", fontSize: 11, color: "rgba(255,255,255,0.65)", cursor: "pointer", letterSpacing: "0.08em" }}
        >
          ← BACK
        </button>
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.06em" }}>{stock.ticker}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>MARKET DETAIL</span>
      </div>

      <div className={scrollthin()} style={{ flex: 1, overflow: "auto", padding: "32px 40px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 8 }}>
          <span style={{ fontSize: 56, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.96)" }}>${stock.price}</span>
          <span style={{ fontSize: 22, color: stock.chgColor, fontWeight: 500 }}>{stock.dir} {stock.chg}</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 36, letterSpacing: "0.06em" }}>Today · preview data</div>

        <div style={{ border: `1px solid ${BORDER}`, padding: "28px 32px", marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>14-DAY ACTIVITY</div>
          <div style={{ fontSize: 36, letterSpacing: 4, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{stock.spark}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{stock.note}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "OPEN", value: `$${(parseFloat(stock.price) * 0.99).toFixed(2)}` },
            { label: "HIGH", value: `$${(parseFloat(stock.price) * 1.02).toFixed(2)}` },
            { label: "LOW", value: `$${(parseFloat(stock.price) * 0.97).toFixed(2)}` },
            { label: "MKT CAP", value: "—" },
            { label: "P/E", value: "—" },
            { label: "VOLUME", value: "—" },
          ].map((row) => (
            <div key={row.label} style={{ padding: "16px 18px", border: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.32)", marginBottom: 6 }}>{row.label}</div>
              <div style={{ fontSize: 15, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.85)" }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MarketView({ v }: { v: VigilState }) {
  const [selected, setSelected] = useState<Stock | null>(null);

  return (
    <>
      {selected && <StockDetail stock={selected} onClose={() => setSelected(null)} />}
      <div className={scrollthin()} style={{ height: "100%", overflow: "auto", padding: "28px 36px", background: "#000" }}>
        <PageSectionHead num="09" title="MARKET" right="LIVE TICKERS" />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 24, letterSpacing: "0.05em" }}>
          Click a ticker for full detail · connect live feeds in production
        </div>
        <div style={{ border: `1px solid ${BORDER}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "72px 104px 88px minmax(140px,1fr) 1fr", padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.32)" }}>
            <span>TICKER</span><span>PRICE</span><span>CHANGE</span><span>14D ACTIVITY</span><span>LATEST INTEL</span>
          </div>
          {v.stocks.map((s) => (
            <button
              key={s.ticker}
              type="button"
              onClick={() => setSelected(s)}
              style={{
                display: "grid",
                gridTemplateColumns: "72px 104px 88px minmax(140px,1fr) 1fr",
                alignItems: "center",
                width: "100%",
                padding: "18px 16px",
                borderBottom: `1px solid ${BORDER}`,
                background: "transparent",
                border: "none",
                borderBottomWidth: 1,
                borderBottomStyle: "solid",
                borderBottomColor: BORDER,
                font: "inherit",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.96)" }}>{s.ticker}</span>
              <span style={{ fontSize: 15, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.9)" }}>${s.price}</span>
              <span style={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums", color: s.chgColor, fontWeight: 500 }}>{s.dir} {s.chg}</span>
              <span style={{ fontSize: 20, letterSpacing: 2, color: "rgba(255,255,255,0.38)" }}>{s.spark}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.note}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
