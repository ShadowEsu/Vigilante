"use client";

import type { VigilState } from "../useVigil";
import { ActivityChart, BORDER, PageSectionHead, scrollthin } from "./ui";

export function AnalyticsView({ v }: { v: VigilState }) {
  return (
    <div className={scrollthin()} style={{ height: "100%", overflow: "auto", padding: "28px 36px", background: "#000" }}>
      <PageSectionHead num="02" title="USAGE ANALYTICS" right="14-DAY WINDOW" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36 }}>
        {[
          { label: "WATCHES LIVE", value: <>{v.counters.watches}<span style={{ fontSize: 18, color: "rgba(255,255,255,0.22)", fontWeight: 400 }}>/3</span></>, color: "#4ADE80" },
          { label: "PAGES INDEXED", value: v.counters.pages, color: "#6E9BE6" },
          { label: "SPEND MTD", value: v.animSpend, color: "#A78BFA" },
          { label: "LAST SCAN", value: v.lastScanAgo, color: "rgba(255,255,255,0.88)", small: true },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: "24px 26px",
              border: `1px solid ${BORDER}`,
              background: `linear-gradient(180deg, ${s.color}10 0%, transparent 100%)`,
            }}
          >
            <div style={{ fontSize: s.small ? 20 : 36, fontWeight: 600, color: s.color, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginTop: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>14-DAY SCAN ACTIVITY</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 20, lineHeight: 1.6, maxWidth: "58ch" }}>
          Daily index runs and detected changes for your selected target — hover bars for exact counts.
        </div>
        <ActivityChart w={720} h={180} height="180px" data={v.activityChartData} />
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.38)", marginTop: 12, display: "flex", gap: 20 }}>
          <span>peak {v.activityStats.peak}</span>
          <span>avg {v.activityStats.avg}</span>
          <span>trend {v.activityStats.trend}</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>DAILY BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {v.activityRows.map((r) => (
              <div key={r.isoDate ?? r.day} title={r.fullDate} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
                <span style={{ width: 52, color: "rgba(255,255,255,0.42)", flexShrink: 0 }}>{r.day}</span>
                <span style={{ letterSpacing: 1, flex: 1 }}>
                  <span style={{ color: "rgba(255,255,255,0.58)" }}>{r.fill}</span>
                  <span style={{ color: "rgba(255,255,255,0.1)" }}>{r.track}</span>
                </span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums", minWidth: 20, textAlign: "right" }}>{r.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>SCAN BUDGET UTILIZATION</div>
          {v.watchlists.map((w) => (
            <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, fontSize: 13 }}>
              <span style={{ fontSize: 9, color: w.glyphColor, flexShrink: 0 }}>{w.glyph}</span>
              <span style={{ flex: 1, minWidth: 0, color: "rgba(255,255,255,0.78)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</span>
              <span style={{ letterSpacing: 1, flexShrink: 0 }}>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>{w.fill}</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>{w.track}</span>
              </span>
              <span style={{ color: "rgba(255,255,255,0.48)", flexShrink: 0, fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "right" }}>{w.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <PageSectionHead num="—" title="COMPANY ANALYTICS" right={`${v.documents.length} DOCS · ${v.changesCount} CHANGES`} marginBottom={20} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>INTEL BY TYPE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {v.companyIntelBars.map((t) => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
                <span style={{ width: 96, color: t.color, letterSpacing: "0.07em" }}>{t.label}</span>
                <span style={{ letterSpacing: 1, flex: 1 }}>
                  <span style={{ color: "rgba(255,255,255,0.58)" }}>{t.fill}</span>
                  <span style={{ color: "rgba(255,255,255,0.1)" }}>{t.track}</span>
                </span>
                <span style={{ color: "rgba(255,255,255,0.48)", fontVariantNumeric: "tabular-nums" }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>SIGNAL COVERAGE</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, marginBottom: 14, maxWidth: "42ch" }}>
            What competitors typically track — pricing & product daily, hiring weekly, filings monthly.
          </div>
          {v.signalCoverage.map((s) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, fontSize: 12 }} title={s.watch}>
              <span style={{ width: 14, color: s.covered ? "#4ADE80" : "rgba(255,255,255,0.2)", fontSize: 10 }}>{s.covered ? "●" : "○"}</span>
              <span style={{ width: 80, color: s.color, letterSpacing: "0.06em" }}>{s.label}</span>
              <span style={{ flex: 1, color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{s.cadence}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontVariantNumeric: "tabular-nums" }}>{s.sourceCount}</span>
            </div>
          ))}
        </div>
      </div>

      {v.competitorCompare.length > 1 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>TARGET COMPARE</div>
          <div style={{ border: `1px solid ${BORDER}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 56px 56px 56px 56px 80px", gap: 12, padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.32)" }}>
              <span>TARGET</span><span>INTEL DENSITY</span><span>CHNG</span><span>DOCS</span><span>POSTS</span><span>ORG</span><span>LAST SCAN</span>
            </div>
            {v.competitorCompare.map((row) => (
              <div
                key={row.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 56px 56px 56px 56px 80px",
                  gap: 12,
                  alignItems: "center",
                  padding: "14px 18px",
                  borderBottom: `1px solid rgba(255,255,255,0.04)`,
                  fontSize: 13,
                  background: v.selectedCompanyId === row.id ? "rgba(255,255,255,0.03)" : "transparent",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.88)", fontWeight: v.selectedCompanyId === row.id ? 600 : 400 }}>{row.name}</span>
                <span style={{ letterSpacing: 1 }}>
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>{row.fill}</span>
                  <span style={{ color: "rgba(255,255,255,0.1)" }}>{row.track}</span>
                </span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.changes}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.docs}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.posts}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.insider}</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{row.lastScanAgo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {v.intelTimeline.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>INTEL TIMELINE</div>
          <div style={{ border: `1px solid ${BORDER}` }}>
            {v.intelTimeline.slice(0, 12).map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 16, padding: "14px 18px", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", width: 56, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{item.ago}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                    <span style={{ color: item.color }}>{item.typeLabel}</span>
                    <span> · {item.summary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>DOCUMENTS BY SECTION</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginBottom: 40 }}>
        <div>
          {v.documentsByCategory.map(([cat, items]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, fontSize: 13 }}>
              <span style={{ flex: 1, color: "rgba(255,255,255,0.75)", letterSpacing: "0.06em" }}>{cat.toUpperCase()}</span>
              <span style={{ color: "rgba(255,255,255,0.48)", fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>SOURCE MAP</div>
          {v.sourceBreakdown.map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, fontSize: 12 }}>
              <span style={{ width: 72, color: row.color, letterSpacing: "0.07em" }}>{row.label}</span>
              <span style={{ letterSpacing: 1, flex: 1 }}>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>{row.fill}</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>{row.track}</span>
              </span>
              <span style={{ color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)", marginBottom: 16 }}>SCAN LOG</div>
      <div style={{ border: `1px solid ${BORDER}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "130px minmax(160px,1.6fr) 80px 90px 70px", padding: "12px 18px", borderBottom: `1px solid ${BORDER}`, fontSize: 11, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>
          <span>DATE</span><span>WATCH</span><span>FINDINGS</span><span>DURATION</span><span>COST</span>
        </div>
        {v.scanLog.map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "130px minmax(160px,1.6fr) 80px 90px 70px", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
            <span style={{ color: "rgba(255,255,255,0.42)" }}>{r.date} {r.time}</span>
            <span style={{ color: "rgba(255,255,255,0.82)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.watch}</span>
            <span style={{ color: "rgba(255,255,255,0.58)" }}>{r.findings}</span>
            <span style={{ color: "rgba(255,255,255,0.48)" }}>{r.ms}</span>
            <span style={{ color: "rgba(255,255,255,0.48)" }}>{r.cost}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
