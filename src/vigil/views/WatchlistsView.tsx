"use client";

import type { VigilState } from "../useVigil";
import { CompanyLogo } from "../brand";
import { PageShell } from "./layout";
import { BORDER, PageSectionHead, VigilBtn } from "./ui";

export function WatchlistsView({ v }: { v: VigilState }) {
  return (
    <PageShell>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <PageSectionHead num="03" title="WATCHLISTS" right={`${v.allWatchlists.length} ACTIVE`} marginBottom={0} />
        <div style={{ marginLeft: "auto" }}>
          <VigilBtn onClick={() => v.setView("new")} accent>[ + NEW WATCH ]</VigilBtn>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28, lineHeight: 1.6, maxWidth: "58ch" }}>
        Live monitors across your directory — status, cadence, spend, and indexed pages at a glance.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {v.allWatchlists.map((w, i) => (
          <div
            key={w.id}
            className="vigil-fade-in"
            style={{
              padding: "24px 26px",
              border: `1px solid ${BORDER}`,
              background: w.status === "live"
                ? "linear-gradient(145deg, rgba(74,222,128,0.06) 0%, rgba(255,255,255,0.02) 100%)"
                : "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <CompanyLogo domain={w.target} name={w.name} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.92)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {w.name}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)" }}>{w.target}</div>
              </div>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: "0.08em", color: w.statusColor, flexShrink: 0 }}>
                <span style={{ fontSize: w.glyphSize, color: w.glyphColor, animation: w.glyphAnim }}>{w.glyph}</span>
                {w.status.toUpperCase()}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              {[
                { label: "PAGES", value: w.pages, color: "#6E9BE6" },
                { label: "CADENCE", value: w.cadence, color: "rgba(255,255,255,0.65)" },
                { label: "SPEND", value: `${w.spendStr} / ${w.budgetStr}`, color: "#A78BFA" },
                { label: "LAST RUN", value: "lastRunAgo" in w ? w.lastRunAgo : "—", color: "rgba(255,255,255,0.55)" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.32)", marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontSize: 13, color: stat.color, fontVariantNumeric: "tabular-nums" }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em", flexShrink: 0 }}>BUDGET</span>
              <span style={{ letterSpacing: 1, flex: 1 }}>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>{w.fill}</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>{w.track}</span>
              </span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{w.pct}%</span>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <VigilBtn onClick={w.onRun} disabled={w.scanning} variant="primary" accent>
                {w.runLabel}
              </VigilBtn>
              {v.hasLiveData && (
                <VigilBtn
                  variant="danger"
                  disabled={v.deletingTargets}
                  onClick={() => {
                    if (window.confirm(`Remove ${w.name} from your directory?`)) v.deleteTargets([w.id]);
                  }}
                >
                  REMOVE
                </VigilBtn>
              )}
              <VigilBtn onClick={() => v.selectCompany(w.id)}>VIEW</VigilBtn>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>
        {!v.hasLiveData ? "Add a target to activate live watches — demo rows open the terminal." : `${v.allWatchlists.length} watch(es) · scheduled ${v.scanScheduleLabel}`}
      </div>
    </PageShell>
  );
}
