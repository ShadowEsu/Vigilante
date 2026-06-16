"use client";

import { useCallback, useEffect, useRef } from "react";
import { NAV } from "./data";
import { TerminalSearch } from "./TerminalSearch";
import { TargetList } from "./views/TargetList";
import type { VigilState } from "./useVigil";
import { formatClock } from "./utils";
import { VigilBtn } from "./views/ui";

export function VigilShell({ v, children }: { v: VigilState; children: React.ReactNode }) {
  const clock = formatClock(v.now);
  const modeLabel = v.hasLiveData ? "◆ LIVE · monitoring active" : "◆ add a target below";
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(v.sidebarWidth);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startW.current = v.sidebarWidth;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [v.sidebarWidth]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      v.setSidebarWidth(startW.current + (e.clientX - startX.current));
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [v]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        background: "#000",
        color: "rgba(255,255,255,0.92)",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: Math.round(14 * v.fontScale),
        display: "grid",
        gridTemplateColumns: `${v.sidebarWidth}px 5px 1fr`,
        overflow: "hidden",
      }}
    >
      <aside style={{ display: "flex", flexDirection: "column", minHeight: 0, borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ padding: "20px 22px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, border: "1px solid rgba(255,255,255,0.45)", fontSize: 12, fontWeight: 600 }}>V</span>
          <span style={{ fontSize: 14, letterSpacing: "0.26em", color: "rgba(255,255,255,0.96)", fontWeight: 600 }}>VIGILANTE</span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.28)", letterSpacing: "0.1em" }}>v1.0</span>
        </div>

        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <TerminalSearch compact onComplete={(id) => v.selectCompany(id)} onRefresh={v.refreshCompanies} />
        </div>

        <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
          <TargetList v={v} />
          {v.apiError && <div style={{ marginTop: 6, fontSize: 9, color: "#FC8C8C", lineHeight: 1.35 }}>{v.apiError.slice(0, 100)}</div>}
        </div>

        <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 1, overflowY: "auto", minHeight: 0 }} className="scrollthin">
          {NAV.map((item) => {
            const active = v.view === item.id || (item.id === "watchlists" && v.view === "new");
            return (
              <button key={item.id} type="button" onClick={() => v.setView(item.id)} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "9px 12px",
                background: active ? "rgba(255,255,255,0.05)" : "transparent", border: "none",
                borderLeft: active ? "2px solid rgba(255,255,255,0.82)" : "2px solid transparent",
                font: "inherit", cursor: "pointer", color: active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.42)", textAlign: "left", width: "100%",
              }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", flexShrink: 0, width: 18 }}>{item.idx}</span>
                <span style={{ flex: 1, fontSize: 12.5, letterSpacing: "0.13em" }}>{item.label}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.04em" }}>{item.hint}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "14px 20px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, border: "1px solid rgba(255,255,255,0.28)", fontSize: 11, color: "rgba(255,255,255,0.75)", flexShrink: 0 }}>JD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)" }}>Vigilante</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.05em" }}>
                {v.systemStatus?.ai ? "AI ready" : "Pro · add API keys"}
              </div>
            </div>
            <button type="button" onClick={() => v.setView("settings")} style={{ background: "transparent", border: "none", padding: "4px 5px", font: "inherit", fontSize: 15, color: "rgba(255,255,255,0.32)", cursor: "pointer" }}>⚙</button>
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", marginTop: 9 }}>{modeLabel}</div>
        </div>
      </aside>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onMouseDown={onResizeStart}
        style={{
          cursor: "col-resize",
          background: "rgba(255,255,255,0.04)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
        title="Drag to resize"
      />

      <div style={{ display: "grid", gridTemplateRows: "auto 1fr", minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <header style={{ minHeight: 44, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10, padding: "6px 22px", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em", flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, color: "rgba(255,255,255,0.85)", flexShrink: 0 }}>
            <span className="vigil-status-dot" style={{ background: v.scraping ? "#E3B341" : v.hasLiveData ? "#4ADE80" : "rgba(255,255,255,0.35)", animation: v.scraping ? "scanBeat 1.2s infinite" : "pulse 2.4s infinite" }} />
            {v.scraping ? "INDEXING" : v.hasLiveData ? "LIVE" : "DEMO"}
          </span>
          <span style={{ color: "rgba(255,255,255,0.12)" }}>|</span>
          <span style={{ flexShrink: 0 }}>WATCHES <span style={{ color: "rgba(255,255,255,0.88)" }}>{v.counters.watches}</span></span>
          <span style={{ flexShrink: 0 }}>PAGES <span style={{ color: "rgba(255,255,255,0.88)" }}>{v.counters.pages}</span></span>
          <span style={{ flexShrink: 0 }}>SPEND <span style={{ color: "rgba(255,255,255,0.88)" }}>{v.animSpend}</span>/$5.00</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
            <VigilBtn onClick={() => v.setView("new")} accent>[ + TARGET ]</VigilBtn>
            <VigilBtn onClick={v.scanSelectedTarget} disabled={v.scraping || !v.hasLiveData}>[ SCAN NOW ]</VigilBtn>
            <VigilBtn onClick={v.rediscoverSelected} disabled={v.scraping || !v.selectedCompanyId}>[ REDISCOVER ]</VigilBtn>
            <VigilBtn onClick={() => v.setView("ai")} accent>[ AI ]</VigilBtn>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.55)", flexShrink: 0, marginLeft: 4 }} suppressHydrationWarning>{clock} UTC</span>
          </div>
        </header>
        <main style={{ minHeight: 0, minWidth: 0, overflow: "hidden", position: "relative" }}>{children}</main>
      </div>
    </div>
  );
}
