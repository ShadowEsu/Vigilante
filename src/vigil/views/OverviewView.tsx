"use client";

import type { VigilState } from "../useVigil";
import type { WidgetKey } from "../data";
import { ActivityChart, BORDER, BORDER_LIGHT, PANEL_PAD, SectionHead, scrollthin } from "./ui";
import { ExternalLink, shortUrl } from "./links";
import { CompanyPicker } from "./CompanyPicker";
import { HoverTip } from "./HoverTip";

const panel: React.CSSProperties = {
  borderRight: `1px solid ${BORDER}`,
  borderBottom: `1px solid ${BORDER}`,
  padding: PANEL_PAD,
  overflow: "auto",
};

export function OverviewView({ v }: { v: VigilState }) {
  const wd = (k: WidgetKey) => (v.widgets[k] ? "block" : "none");
  const { counters } = v;

  const widgetCards = (Object.keys(v.widgetDefs) as WidgetKey[]).map((k) => {
    const def = v.widgetDefs[k];
    const active = v.widgets[k];
    return {
      key: k,
      label: def.label,
      desc: def.desc,
      active,
      glyph: active ? "[x]" : "[ ]",
      color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.42)",
    };
  });

  const newslettersTop = v.newsletters.slice(0, 3);
  const insiderTop = v.insiderTop.slice(0, 5);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000" }}>
      <CompanyPicker v={v} />

      <div
        style={{
          height: 46,
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          padding: "0 22px",
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.06em",
          flexShrink: 0,
          overflow: "hidden",
          flexWrap: "nowrap",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ marginRight: 14, flexShrink: 0 }}>
          WATCHES <span style={{ color: "rgba(255,255,255,0.88)" }}>{counters.watches}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.1)", marginRight: 14 }}>|</span>
        <span style={{ marginRight: 14, flexShrink: 0 }}>
          LIVE <span style={{ color: "rgba(255,255,255,0.88)" }}>{counters.live}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.1)", marginRight: 14 }}>|</span>
        <span style={{ marginRight: 14, flexShrink: 0 }}>
          PAGES <span style={{ color: "rgba(255,255,255,0.88)" }}>{counters.pages}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.1)", marginRight: 14 }}>|</span>
        <span style={{ marginRight: 14, flexShrink: 0 }}>
          CHANGES <span style={{ color: "rgba(255,255,255,0.88)" }}>{v.changesCount}</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.1)", marginRight: 14 }}>|</span>
        <span style={{ marginRight: 14, flexShrink: 0 }}>
          SPEND <span style={{ color: "rgba(255,255,255,0.88)" }}>{v.animSpend}</span>/$5.00
        </span>
        <span style={{ color: "rgba(255,255,255,0.1)", marginRight: 14 }}>|</span>
        <span style={{ flexShrink: 0 }}>
          LAST SCAN <span style={{ color: "rgba(255,255,255,0.88)" }}>{v.lastScanAgo}</span>
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => v.setConfiguring(!v.configuring)}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.16)",
            padding: "5px 12px",
            font: "inherit",
            fontSize: 10,
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.65)",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          [ ⊞ CONFIGURE ]
        </button>
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {v.configuring && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(0,0,0,0.96)", overflow: "auto" }}>
            <div style={{ padding: 36, maxWidth: 920 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.22em", fontWeight: 500 }}>CONFIGURE DASHBOARD</span>
                <span style={{ flex: 1, height: 1, background: BORDER }} />
                <button
                  type="button"
                  onClick={() => v.setConfiguring(false)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.18)",
                    padding: "5px 14px",
                    font: "inherit",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    color: "rgba(255,255,255,0.65)",
                    cursor: "pointer",
                  }}
                >
                  [ × DONE ]
                </button>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em", marginBottom: 26 }}>
                select which panels appear on your overview
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {widgetCards.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => v.toggleWidget(c.key)}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      padding: "18px 18px",
                      font: "inherit",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      color: c.color,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                      <span style={{ fontSize: 12 }}>{c.glyph}</span>
                      <span style={{ fontSize: 11, letterSpacing: "0.13em", fontWeight: 500 }}>{c.label}</span>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", lineHeight: 1.55 }}>{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className={scrollthin()}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            height: "100%",
            overflow: "auto",
            alignContent: "start",
          }}
        >
          {/* 01 USAGE */}
          <div style={{ ...panel, display: wd("usage") }}>
            <SectionHead num="01" title="USAGE ANALYTICS" />
            <div style={{ display: "flex", gap: 0, margin: "22px 0 24px", border: `1px solid ${BORDER}` }}>
              <div style={{ flex: 1, padding: "16px 20px", borderRight: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.96)" }}>
                  {counters.watches}<span style={{ fontSize: 22, color: "rgba(255,255,255,0.22)", fontWeight: 400 }}>/3</span>
                </div>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.38)", marginTop: 10 }}>LIVE</div>
              </div>
              <div style={{ flex: 1, padding: "16px 20px", borderRight: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, color: "rgba(255,255,255,0.96)", fontVariantNumeric: "tabular-nums" }}>{counters.pages}</div>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.38)", marginTop: 10 }}>PAGES</div>
              </div>
              <div style={{ flex: 1, padding: "16px 20px" }}>
                <div style={{ fontSize: 38, fontWeight: 600, lineHeight: 1, color: "rgba(255,255,255,0.96)", fontVariantNumeric: "tabular-nums" }}>{v.animSpend}</div>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.38)", marginTop: 10 }}>MTD SPEND</div>
              </div>
            </div>
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 10 }}>14-DAY ACTIVITY</div>
            <ActivityChart w={480} h={100} height="100px" data={v.activityChartData} />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 8, letterSpacing: "0.06em", display: "flex", gap: 14 }}>
              <span>peak {v.activityStats.peak}</span>
              <span>avg {v.activityStats.avg}</span>
              <span>trend {v.activityStats.trend}</span>
            </div>
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", margin: "22px 0 12px" }}>BY TYPE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {v.typeBarsData.map((t) => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                  <span style={{ width: 80, color: t.color, letterSpacing: "0.07em" }}>{t.label}</span>
                  <span style={{ letterSpacing: 1 }}>
                    <span style={{ color: "rgba(255,255,255,0.58)" }}>{t.fill}</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>{t.track}</span>
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.45)", marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 02 WATCHLISTS */}
          <div style={{ ...panel, display: wd("watchlists") }}>
            <SectionHead num="02" title="WATCHLISTS" right={`${v.watchlists.length} LIVE`} />
            {v.watchlists.map((w) => (
              <div key={w.id} style={{ padding: "16px 0", borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: w.glyphSize, color: w.glyphColor, animation: w.glyphAnim }}>{w.glyph}</span>
                  <span style={{ flex: 1, color: "rgba(255,255,255,0.9)", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</span>
                  <span style={{ fontSize: 10, letterSpacing: "0.12em", color: w.statusColor }}>{w.status}</span>
                  <button type="button" onClick={w.onRun} style={{ background: "transparent", border: "none", font: "inherit", cursor: "pointer", fontSize: 11, color: w.runColor }}>
                    {w.runLabel}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, paddingLeft: 18, fontSize: 11, color: "rgba(255,255,255,0.32)" }}>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.kind} · {w.target}</span>
                  <span style={{ letterSpacing: 1 }}>
                    <span style={{ color: "rgba(255,255,255,0.48)" }}>{w.fill}</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>{w.track}</span>
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{w.spendStr}/{w.budgetStr}</span>
                </div>
                {w.scanning && (
                  <div style={{ padding: "8px 0 0 18px", fontSize: 10.5, color: "rgba(255,255,255,0.5)", animation: "scanBeat 1.2s infinite" }}>
                    SCANNING ── indexing pages
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 03 COMPANY ANALYTICS */}
          <div style={{ ...panel, display: wd("company_analytics") }}>
            <SectionHead num="03" title="COMPANY ANALYTICS" />
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", margin: "18px 0 12px" }}>INTEL BY TYPE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
              {v.companyIntelBars.map((t) => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                  <span style={{ width: 86, color: t.color, letterSpacing: "0.07em" }}>{t.label}</span>
                  <span style={{ letterSpacing: 1 }}>
                    <span style={{ color: "rgba(255,255,255,0.58)" }}>{t.fill}</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>{t.track}</span>
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.45)", marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>{t.count}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 12 }}>DOCUMENTS BY SECTION</div>
            {v.documentsByCategory.slice(0, 4).map(([cat, items]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, fontSize: 12 }}>
                <span style={{ flex: 1, color: "rgba(255,255,255,0.72)", letterSpacing: "0.06em" }}>{cat.toUpperCase()}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>{items.length}</span>
              </div>
            ))}
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", margin: "22px 0 10px" }}>SIGNAL COVERAGE</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", lineHeight: 1.55, marginBottom: 12, maxWidth: "42ch" }}>
              Industry playbook — pricing & product daily; hiring & content weekly; filings monthly.
            </div>
            {v.signalCoverage.slice(0, 6).map((s) => (
              <HoverTip key={s.id} width={340} tip={<div>{s.watch}</div>}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 11, cursor: "default" }}>
                  <span style={{ width: 14, color: s.covered ? "#4ADE80" : "rgba(255,255,255,0.2)", fontSize: 10 }}>{s.covered ? "●" : "○"}</span>
                  <span style={{ width: 72, color: s.color, letterSpacing: "0.06em" }}>{s.label}</span>
                  <span style={{ flex: 1, color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{s.cadence}</span>
                  <span style={{ color: "rgba(255,255,255,0.28)", fontVariantNumeric: "tabular-nums" }}>{s.sourceCount}</span>
                </div>
              </HoverTip>
            ))}
          </div>

          {/* SOURCE MAP */}
          <div style={{ ...panel, display: wd("sources") }}>
            <SectionHead num="—" title="SOURCE MAP" right={`${v.sourceDirectories.length} URLS`} />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", lineHeight: 1.55, margin: "16px 0 14px", maxWidth: "44ch" }}>
              Indexed pages grouped by intel category — pricing changes fastest (~43% monthly in industry data).
            </div>
            {v.sourceBreakdown.map((row) => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 12 }}>
                <span style={{ width: 72, color: row.color, letterSpacing: "0.07em" }}>{row.label}</span>
                <span style={{ letterSpacing: 1, flex: 1 }}>
                  <span style={{ color: "rgba(255,255,255,0.58)" }}>{row.fill}</span>
                  <span style={{ color: "rgba(255,255,255,0.1)" }}>{row.track}</span>
                </span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontVariantNumeric: "tabular-nums" }}>{row.count}</span>
              </div>
            ))}
            {v.sourceDirectories.slice(0, 5).map((s) => (
              <div key={s.url} style={{ fontSize: 10, padding: "6px 0", borderBottom: `1px solid ${BORDER_LIGHT}`, display: "flex", gap: 10 }}>
                <span style={{ color: "rgba(255,255,255,0.35)", width: 64, flexShrink: 0 }}>{s.label}</span>
                <ExternalLink href={s.url} style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortUrl(s.url)}</ExternalLink>
              </div>
            ))}
          </div>

          {/* 04 CHANGES */}
          <div style={{ ...panel, display: wd("changes") }}>
            <SectionHead num="04" title="CHANGES FEED" right={`${v.changesCount} DETECTED`} />
            {v.changesTop.map((c, i) => (
              <HoverTip
                key={`${c.title}-${c.source_url ?? c.source_label ?? i}`}
                width={360}
                tip={
                  <div>
                    <div style={{ color: "rgba(255,255,255,0.9)", marginBottom: 6 }}>{c.title}</div>
                    <div style={{ marginBottom: 8 }}>{c.summary}</div>
                    {(c.bullets ?? []).map((b: string) => (
                      <div key={b}>· {b}</div>
                    ))}
                  </div>
                }
              >
                <div style={{ display: "flex", gap: 12, padding: "13px 0 13px 12px", borderBottom: `1px solid ${BORDER_LIGHT}`, boxShadow: c.leftBorder }}>
                  <span style={{ fontSize: 11, color: c.sevColor, width: 10, textAlign: "center", flexShrink: 0 }}>{c.sev}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "rgba(255,255,255,0.92)", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                    <div style={{ fontSize: 10.5, marginTop: 4, letterSpacing: "0.06em" }}>
                      <span style={{ color: c.color }}>{c.typeLabel}</span>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}> · {c.ago}</span>
                    </div>
                    {c.source_url && (
                      <div style={{ marginTop: 4, minWidth: 0, overflow: "hidden" }}>
                        <ExternalLink href={c.source_url} style={{ fontSize: 10 }}>{shortUrl(c.source_url)}</ExternalLink>
                      </div>
                    )}
                  </div>
                </div>
              </HoverTip>
            ))}
            {v.changesCount > 6 && (
              <button type="button" onClick={() => v.setView("changes")} style={{ marginTop: 10, background: "transparent", border: "none", font: "inherit", fontSize: 10, color: "rgba(255,255,255,0.4)", cursor: "pointer", letterSpacing: "0.08em" }}>
                view all →
              </button>
            )}
          </div>

          {/* INTEL TIMELINE */}
          <div style={{ ...panel, display: wd("timeline") }}>
            <SectionHead num="—" title="INTEL TIMELINE" right={`${v.intelTimeline.length} EVENTS`} />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", lineHeight: 1.55, margin: "14px 0 12px" }}>
              Unified feed — changes, filings, content, and org signals in one chronological view.
            </div>
            {v.intelTimeline.slice(0, 8).map((item) => (
              <HoverTip key={item.id} width={360} tip={<div>{item.summary}</div>}>
                <div style={{ display: "flex", gap: 12, padding: "11px 0", borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", width: 52, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{item.ago}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.88)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                    <div style={{ fontSize: 10, marginTop: 3 }}>
                      <span style={{ color: item.color }}>{item.typeLabel}</span>
                      <span style={{ color: "rgba(255,255,255,0.28)" }}> · {item.summary.slice(0, 60)}{item.summary.length > 60 ? "…" : ""}</span>
                    </div>
                  </div>
                </div>
              </HoverTip>
            ))}
          </div>

          {/* 05 BRIEF */}
          <div style={{ ...panel, display: wd("brief") }}>
            <SectionHead num="05" title="BRIEF" />
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", letterSpacing: "0.16em", margin: "18px 0 12px" }}>INTELLIGENCE BRIEF</div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "rgba(255,255,255,0.96)", marginBottom: 12, lineHeight: 1.35 }}>{v.brief.title}</div>
            <div style={{ height: 1, background: BORDER, marginBottom: 14 }} />
            <p style={{ fontSize: 12.5, lineHeight: 1.82, color: "rgba(255,255,255,0.58)", margin: "0 0 14px" }}>{v.brief.body}</p>
            <div style={{ fontSize: 9.5, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>MONITORING FOCUS</div>
            <ul style={{ margin: "0 0 14px", paddingLeft: 18, fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65 }}>
              {v.companyProfile.monitoringFocus.slice(0, 4).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div style={{ height: 1, background: BORDER, marginBottom: 14 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 10.5, color: "rgba(255,255,255,0.38)" }}>
              <span>[ {v.brief.sources} SOURCES ]</span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                CONFIDENCE
                <span style={{ letterSpacing: 1 }}>
                  <span style={{ color: "rgba(255,255,255,0.62)" }}>{v.confFill}</span>
                  <span style={{ color: "rgba(255,255,255,0.1)" }}>{v.confTrack}</span>
                </span>
                {v.brief.confidence}%
              </span>
            </div>
            <button type="button" onClick={() => v.setView("brief")} style={{ marginTop: 12, background: "transparent", border: "none", font: "inherit", fontSize: 10, color: "rgba(255,255,255,0.35)", cursor: "pointer", letterSpacing: "0.08em" }}>
              full brief →
            </button>
          </div>

          {/* 06 INSIDER */}
          <div style={{ ...panel, display: wd("insider") }}>
            <SectionHead num="06" title="INSIDER INTEL" />
            {insiderTop.map((item, i) => (
              // Scraped org signals frequently share a person ("—") and a date,
              // so the composite key alone collides and React drops rows.
              <HoverTip key={`${item.person}-${item.date}-${i}`} width={320} tip={<div>{item.note}</div>}>
                <div style={{ padding: "15px 0", borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <span style={{ color: item.sevColor, fontSize: 11, width: 12, textAlign: "center" }}>{item.sev}</span>
                    <span style={{ fontSize: 10, color: v.typeColor.insider, letterSpacing: "0.08em" }}>{item.moveType}</span>
                    <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.person}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)" }}>{item.date}</span>
                  </div>
                  <div style={{ paddingLeft: 24, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{item.role} · {item.company}</div>
                </div>
              </HoverTip>
            ))}
          </div>

          {/* TARGET COMPARE */}
          {v.competitorCompare.length > 1 && (
            <div style={{ ...panel, display: wd("compare"), gridColumn: "1 / -1", padding: "18px 28px" }}>
              <SectionHead num="—" title="TARGET COMPARE" right={`${v.competitorCompare.length} WATCHES`} />
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", margin: "12px 0 16px", maxWidth: "56ch", lineHeight: 1.55 }}>
                Intel density score combines page changes, documents, content posts, and org signals — hover a row for detail.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 56px 56px 56px 56px 80px", gap: 12, padding: "8px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 9.5, letterSpacing: "0.14em", color: "rgba(255,255,255,0.32)" }}>
                <span>TARGET</span><span>INTEL DENSITY</span><span>CHNG</span><span>DOCS</span><span>POSTS</span><span>ORG</span><span>LAST SCAN</span>
              </div>
              {v.competitorCompare.map((row) => (
                <HoverTip
                  key={row.id}
                  width={320}
                  tip={<div>{row.pages} pages indexed · {row.domain}</div>}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr 56px 56px 56px 56px 80px",
                      gap: 12,
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: `1px solid ${BORDER_LIGHT}`,
                      fontSize: 12,
                      cursor: "default",
                      background: v.selectedCompanyId === row.id ? "rgba(255,255,255,0.03)" : "transparent",
                    }}
                  >
                    <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: v.selectedCompanyId === row.id ? 600 : 400 }}>{row.name}</span>
                    <span style={{ letterSpacing: 1 }}>
                      <span style={{ color: "rgba(255,255,255,0.55)" }}>{row.fill}</span>
                      <span style={{ color: "rgba(255,255,255,0.1)" }}>{row.track}</span>
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.changes}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.docs}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.posts}</span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontVariantNumeric: "tabular-nums" }}>{row.insider}</span>
                    <span style={{ color: "rgba(255,255,255,0.32)", fontSize: 10 }}>{row.lastScanAgo}</span>
                  </div>
                </HoverTip>
              ))}
            </div>
          )}

          {/* 07 LIVE TICKERS — full width */}
          <div style={{ ...panel, display: wd("stock"), gridColumn: "1 / -1", padding: "16px 28px" }}>
            <SectionHead
              num="07"
              title="LIVE TICKERS"
              right={v.stocks.length > 0 ? `${v.stocks.length} TRACKED` : "NOT CONFIGURED"}
            />
            {v.stocks.length === 0 && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 12, lineHeight: 1.7 }}>
                No market data provider connected — ticker prices are not part of the
                monitoring pipeline. Public-company signals still arrive via SEC EDGAR
                filings in section 09.
              </div>
            )}
            <div style={{ display: "flex", gap: 0, marginTop: 12 }}>
              {v.stocks.map((s) => (
                <button
                  key={s.ticker}
                  type="button"
                  onClick={() => v.setView("market")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "0 20px 0 0",
                    marginRight: 20,
                    minWidth: 0,
                    background: "transparent",
                    border: "none",
                    borderRight: s.borderRight,
                    font: "inherit",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.96)" }}>{s.ticker}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>${s.price}</span>
                  <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: s.chgColor, fontWeight: 500 }}>{s.dir} {s.chg}</span>
                  <span style={{ fontSize: 19, letterSpacing: 2, color: "rgba(255,255,255,0.38)" }}>{s.spark}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.note}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 08 NEWSLETTERS */}
          <div style={{ ...panel, display: wd("newsletters") }}>
            <SectionHead num="08" title="NEWSLETTERS" />
            <div style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", margin: "16px 0 10px" }}>KEYWORD TRENDS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              {v.keywordTrends.slice(0, 6).map((kw) => (
                <div key={kw.term} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                  <span style={{ width: 88, color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kw.term}</span>
                  <span style={{ letterSpacing: 1, flex: 1 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>{kw.fill}</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>{kw.track}</span>
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.32)", fontVariantNumeric: "tabular-nums", width: 20, textAlign: "right" }}>{kw.count}</span>
                </div>
              ))}
            </div>
            {newslettersTop.map((n, ni) => (
              <div key={`${n.name}-${n.subject}-${ni}`} style={{ padding: "14px 0", borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 5 }}>
                  <span style={{ flex: 1, color: "rgba(255,255,255,0.88)", fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{n.ago}</span>
                </div>
                <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginBottom: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.subject}</div>
                {(n.changes ?? []).slice(0, 2).map((c) => (
                  <div key={c} style={{ fontSize: 10, color: "rgba(255,255,255,0.32)" }}>+ {c}</div>
                ))}
              </div>
            ))}
          </div>

          {/* 09 DOCUMENTS */}
          <div style={{ ...panel, display: wd("documents") }}>
            <SectionHead num="09" title="DOCUMENTS" right={`${v.documents.length} INDEXED`} />
            {v.documentsByCategory.map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${BORDER_LIGHT}` }}>
                  {cat.toUpperCase()}
                </div>
                {items.slice(0, 3).map((d, i) => (
                  // EDGAR returns many filings sharing a form type ("FORM 4"),
                  // so category+title is not unique.
                  <div key={`${cat}-${d.title}-${i}`} style={{ padding: "10px 0", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", lineHeight: 1.4, marginBottom: 4 }}>{d.title}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", display: "flex", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
                      <span>{d.docType}</span>
                      {d.url && <ExternalLink href={d.url} style={{ fontSize: 10 }}>{shortUrl(d.url)}</ExternalLink>}
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <button type="button" onClick={() => v.openDocuments()} style={{ background: "transparent", border: "none", font: "inherit", fontSize: 10, color: "rgba(255,255,255,0.35)", cursor: "pointer", letterSpacing: "0.08em" }}>
              all documents →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
