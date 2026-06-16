"use client";

import type { VigilState } from "../useVigil";
import { TYPE_COLOR } from "../data";
import { BORDER, PageSectionHead, scrollthin } from "./ui";
import { ExternalLink, shortUrl } from "./links";

const TABS = [
  { id: "activity" as const, label: "ACTIVITY", color: "#6E9BE6" },
  { id: "insider" as const, label: "INSIDER", color: TYPE_COLOR.insider },
  { id: "investments" as const, label: "FINANCE", color: TYPE_COLOR.investments },
  { id: "documents" as const, label: "DOCUMENTS", color: TYPE_COLOR.document },
  { id: "sec" as const, label: "SEC", color: "#A78BFA" },
  { id: "newsletters" as const, label: "NEWS", color: TYPE_COLOR.newsletter },
  { id: "stock" as const, label: "MARKET", color: TYPE_COLOR.stock },
];

const CATEGORY_DESC: Record<string, string> = {
  valuation: "Market cap, enterprise value, worth",
  financial: "Revenue, earnings, profit, cash flow",
  transaction: "M&A, funding, deals, IPO",
  leverage: "Debt, credit facilities, bonds",
  corporate_action: "Buybacks, dividends, leadership, layoffs",
  activity: "Launches, partnerships, expansion",
};

export function InsightsView({ v }: { v: VigilState }) {
  const tab = v.insightTab;
  const fs = v.fs;

  return (
    <div className={scrollthin()} style={{ height: "100%", overflow: "auto", padding: "28px 36px", background: "#000" }}>
      <PageSectionHead num="07" title="INSIGHTS" right={`${v.intelHighlights.length} SIGNALS`} marginBottom={20} />
      <p style={{ fontSize: fs(13), color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: "0 0 24px", maxWidth: "62ch" }}>
        Transcribed from indexed pages — valuations, transactions, leverage, corporate actions, and recent company activity.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => v.setInsightTab(t.id)}
              className="vigil-fade-in"
              style={{
                background: active ? `${t.color}18` : "rgba(255,255,255,0.02)",
                border: `1px solid ${active ? `${t.color}55` : BORDER}`,
                padding: "10px 18px",
                font: "inherit",
                cursor: "pointer",
                color: active ? t.color : "rgba(255,255,255,0.42)",
                fontSize: fs(12),
                letterSpacing: "0.1em",
                transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 28 }}>
        {tab === "activity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {v.intelHighlights.length === 0 ? (
              <div style={{ fontSize: fs(14), color: "rgba(255,255,255,0.35)", lineHeight: 1.65 }}>
                No transcribed signals yet. Run a full scan — financial amounts, corporate actions, and activity are extracted from investor relations, news, and corporate pages.
              </div>
            ) : (
              v.intelHighlights.map((h) => (
                <div
                  key={h.id}
                  className="vigil-fade-in"
                  style={{
                    padding: "20px 24px",
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${h.color}`,
                    background: `linear-gradient(90deg, ${h.color}08 0%, transparent 100%)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: fs(10), letterSpacing: "0.1em", color: h.color, border: `1px solid ${h.color}44`, padding: "3px 10px" }}>
                      {h.categoryLabel}
                    </span>
                    {h.amount && (
                      <span style={{ fontSize: fs(15), fontWeight: 600, color: "rgba(255,255,255,0.88)", fontVariantNumeric: "tabular-nums" }}>
                        {h.amount}
                      </span>
                    )}
                    <span style={{ fontSize: fs(11), color: "rgba(255,255,255,0.28)", marginLeft: "auto" }}>{h.ago}</span>
                  </div>
                  <div style={{ fontSize: fs(14), color: "rgba(255,255,255,0.9)", marginBottom: 8, lineHeight: 1.45 }}>{h.title}</div>
                  <p style={{ fontSize: fs(13), color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "0 0 10px" }}>{h.detail}</p>
                  <div style={{ fontSize: fs(11), color: "rgba(255,255,255,0.32)" }}>
                    {CATEGORY_DESC[h.category] ?? "Intel signal"} ·{" "}
                    <ExternalLink href={h.sourceUrl} style={{ fontSize: fs(11) }}>{h.sourceLabel || shortUrl(h.sourceUrl)}</ExternalLink>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "stock" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {v.stocks.map((s) => (
              <div
                key={s.ticker}
                className="vigil-fade-in"
                style={{
                  padding: "22px 24px",
                  border: `1px solid ${BORDER}`,
                  background: `linear-gradient(145deg, ${s.chgColor}10 0%, transparent 60%)`,
                }}
              >
                <div style={{ fontSize: fs(20), fontWeight: 700, letterSpacing: "0.06em", marginBottom: 8 }}>{s.ticker}</div>
                <div style={{ fontSize: fs(24), fontWeight: 500, marginBottom: 8 }}>${s.price}</div>
                <div style={{ fontSize: fs(14), color: s.chgColor, marginBottom: 12 }}>{s.dir} {s.chg}</div>
                <div style={{ fontSize: fs(22), letterSpacing: 3, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>{s.spark}</div>
                <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{s.note}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "sec" && (
          <div>
            {v.secFilings.length === 0 ? (
              <div style={{ fontSize: fs(14), color: "rgba(255,255,255,0.32)", lineHeight: 1.6 }}>
                No SEC filings yet. Add a public company and run a scan — EDGAR is queried automatically.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {v.secFilings.map((d) => (
                  <div
                    key={`${d.title}-${d.url}`}
                    className="vigil-fade-in"
                    style={{
                      padding: "20px 24px",
                      border: `1px solid ${BORDER}`,
                      borderLeft: "3px solid #A78BFA",
                      background: "linear-gradient(90deg, rgba(167,139,250,0.06) 0%, transparent 100%)",
                    }}
                  >
                    <span style={{ fontSize: fs(10), letterSpacing: "0.08em", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.25)", padding: "2px 8px" }}>{d.docType}</span>
                    <div style={{ fontSize: fs(16), color: "rgba(255,255,255,0.9)", marginTop: 12, lineHeight: 1.45 }}>{d.title}</div>
                    {d.excerpt && <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.42)", marginTop: 10, lineHeight: 1.55 }}>{d.excerpt}</div>}
                    <div style={{ display: "flex", gap: 14, marginTop: 12, fontSize: fs(12) }}>
                      {d.url && <ExternalLink href={d.url}>{shortUrl(d.url)}</ExternalLink>}
                      <span style={{ color: "rgba(255,255,255,0.28)" }}>{d.ago}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "documents" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {(v.recentDocuments.length > 0 ? v.recentDocuments : v.documents.slice(0, 8)).map((d) => (
              <div
                key={`recent-${d.title}-${d.url}`}
                className="vigil-fade-in"
                style={{
                  padding: "20px 22px",
                  border: `1px solid ${BORDER}`,
                  background: "linear-gradient(135deg, rgba(167,139,250,0.05) 0%, transparent 100%)",
                }}
              >
                <span style={{ fontSize: fs(10), letterSpacing: "0.08em", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.22)", padding: "2px 8px" }}>{d.docType}</span>
                <div style={{ fontSize: fs(15), color: "rgba(255,255,255,0.9)", marginTop: 12, lineHeight: 1.45 }}>{d.title}</div>
                {d.excerpt && <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.4)", marginTop: 8, lineHeight: 1.55 }}>{d.excerpt}</div>}
                {d.url && (
                  <div style={{ marginTop: 10 }}>
                    <ExternalLink href={d.url} style={{ fontSize: fs(12) }}>{shortUrl(d.url)}</ExternalLink>
                  </div>
                )}
                <div style={{ fontSize: fs(11), color: "rgba(255,255,255,0.28)", marginTop: 8 }}>{d.ago}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "newsletters" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {v.newsletters.map((n) => (
              <div key={`${n.name}-${n.subject}`} className="vigil-fade-in" style={{ padding: "20px 22px", border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: fs(15), color: "rgba(255,255,255,0.9)", fontWeight: 500, marginBottom: 8 }}>{n.name}</div>
                <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.58)", marginBottom: 10 }}>{n.subject}</div>
                {n.url && <ExternalLink href={n.url} style={{ fontSize: fs(12) }}>{shortUrl(n.url)}</ExternalLink>}
                <div style={{ fontSize: fs(11), color: "rgba(255,255,255,0.28)", marginTop: 8 }}>{n.company} · {n.ago}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "insider" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {v.insider.map((item) => (
              <div
                key={`${item.person}-${item.date}`}
                className="vigil-fade-in"
                style={{
                  padding: "18px 22px",
                  border: `1px solid ${BORDER}`,
                  borderLeft: `3px solid ${item.sev === "▲" ? TYPE_COLOR.insider : "rgba(255,255,255,0.15)"}`,
                  background: "linear-gradient(90deg, rgba(252,140,140,0.04) 0%, transparent 100%)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ color: item.sev === "▲" ? TYPE_COLOR.insider : "rgba(255,255,255,0.28)", fontSize: fs(14) }}>{item.sev}</span>
                  <span style={{ fontSize: fs(11), color: TYPE_COLOR.insider, letterSpacing: "0.08em" }}>{item.moveType}</span>
                  <span style={{ color: "rgba(255,255,255,0.92)", fontSize: fs(16), flex: 1 }}>
                    {"source_url" in item && item.source_url ? (
                      <ExternalLink href={item.source_url as string}>{item.person}</ExternalLink>
                    ) : (
                      item.person
                    )}
                  </span>
                  <span style={{ fontSize: fs(12), color: "rgba(255,255,255,0.32)" }}>{item.date}</span>
                </div>
                <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{item.role} · {item.company}</div>
                <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.38)", lineHeight: 1.5 }}>{item.note}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "investments" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {v.investments.map((item, i) => (
              <div
                key={`${item.target}-${item.date}-${i}`}
                className="vigil-fade-in"
                style={{
                  padding: "20px 22px",
                  border: `1px solid ${BORDER}`,
                  background: "linear-gradient(135deg, rgba(96,165,250,0.06) 0%, transparent 100%)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: fs(10), color: TYPE_COLOR.investments, border: `1px solid ${TYPE_COLOR.investments}44`, padding: "2px 8px" }}>{item.type}</span>
                  <span style={{ fontSize: fs(16), color: "rgba(255,255,255,0.9)", flex: 1 }}>{item.target}</span>
                  <span style={{ fontSize: fs(16), color: "rgba(255,255,255,0.65)", fontVariantNumeric: "tabular-nums" }}>{item.amount}</span>
                </div>
                <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{item.note}</div>
                {"url" in item && typeof (item as { url?: string }).url === "string" && (item as { url: string }).url && (
                  <div style={{ marginTop: 8 }}>
                    <ExternalLink href={(item as { url: string }).url} style={{ fontSize: fs(11) }}>{shortUrl((item as { url: string }).url)}</ExternalLink>
                  </div>
                )}
                <div style={{ fontSize: fs(11), color: "rgba(255,255,255,0.28)", marginTop: 8 }}>{item.company} · {item.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
