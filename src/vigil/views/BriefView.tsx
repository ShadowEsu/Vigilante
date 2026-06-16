"use client";

import type { VigilState } from "../useVigil";
import { CompanyLogo } from "../brand";
import { BORDER, PageSectionHead, scrollthin } from "./ui";
import { ExternalLink, shortUrl } from "./links";

function MetricBlock({ label, value, color, fs }: { label: string; value: string; color?: string; fs: (n: number) => number }) {
  return (
    <div style={{ padding: "16px 18px", border: `1px solid ${BORDER}`, minWidth: 0 }}>
      <div style={{ fontSize: fs(10), letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: fs(17), fontWeight: 600, color: color ?? "rgba(255,255,255,0.9)", fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>{value}</div>
    </div>
  );
}

export function BriefView({ v }: { v: VigilState }) {
  const b = v.brief;
  const p = v.companyProfile;
  const domain = v.selectedCompany?.domain;
  const fs = v.fs;
  const topSignals = v.intelHighlights.slice(0, 6);

  return (
    <div className={scrollthin()} style={{ height: "100%", overflow: "auto", padding: "28px 36px", background: "#000" }}>
      <PageSectionHead num="05" title="INTELLIGENCE BRIEF" right={`${b.confidence}% CONFIDENCE`} />

      {v.selectedCompany && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${BORDER}` }}>
          <CompanyLogo domain={domain} name={v.selectedCompany.name} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: fs(20), fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.94)" }}>{v.selectedCompany.name}</div>
            <div style={{ fontSize: fs(13), color: "rgba(255,255,255,0.42)", marginTop: 4 }}>{domain}</div>
          </div>
          <span style={{ fontSize: 10, letterSpacing: "0.1em", color: p.public ? "#4ADE80" : "#E3B341", border: `1px solid ${p.public ? "rgba(74,222,128,0.3)" : "rgba(227,179,65,0.3)"}`, padding: "4px 10px" }}>
            {p.stage}
          </span>
        </div>
      )}

      <p style={{ fontSize: fs(14), lineHeight: 1.7, color: "rgba(255,255,255,0.55)", margin: "0 0 24px", maxWidth: "68ch" }}>{p.description}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 32 }}>
        <MetricBlock fs={fs} label="VALUATION" value={p.valuation} color="#A78BFA" />
        <MetricBlock fs={fs} label="REVENUE" value={p.revenue} color="#6E9BE6" />
        <MetricBlock fs={fs} label="EMPLOYEES" value={p.employees} />
        <MetricBlock fs={fs} label="FUNDING" value={p.funding} color="#E3B341" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 12 }}>MONITORING FOCUS</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: fs(13), color: "rgba(255,255,255,0.52)", lineHeight: 1.75 }}>
            {p.monitoringFocus.map((f) => (
              <li key={f} style={{ marginBottom: 6 }}>{f}</li>
            ))}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 12 }}>COMPETITIVE NOTES</div>
          <p style={{ fontSize: fs(13), lineHeight: 1.75, color: "rgba(255,255,255,0.48)", margin: 0 }}>{p.competitiveNotes}</p>
        </div>
      </div>

      <div style={{ border: `1px solid ${BORDER}`, padding: "28px 32px", marginBottom: 32 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.28)", marginBottom: 14 }}>VIGILANTE INTEL · {b.date} {b.time}</div>
        <h1 style={{ fontSize: fs(20), fontWeight: 600, color: "rgba(255,255,255,0.96)", lineHeight: 1.35, margin: "0 0 20px" }}>{b.title}</h1>
        <div style={{ height: 1, background: BORDER, marginBottom: 18 }} />
        <p style={{ fontSize: fs(14), lineHeight: 1.85, color: b.confidence === 0 ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.65)", margin: "0 0 20px", maxWidth: "62ch" }}>{b.body}</p>
        {b.confidence > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
          <span>[ {b.sources} SOURCES ]</span>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            CONFIDENCE
            <span style={{ letterSpacing: 1 }}>
              <span style={{ color: "rgba(255,255,255,0.62)" }}>{v.confFill}</span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>{v.confTrack}</span>
            </span>
            {b.confidence}%
          </span>
        </div>
        )}
      </div>

      {topSignals.length > 0 && (
        <>
          <div style={{ fontSize: fs(10), letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>KEY SIGNALS · FINANCE & ACTIVITY</div>
          <div style={{ border: `1px solid ${BORDER}`, marginBottom: 32 }}>
            {topSignals.map((h) => (
              <div key={h.id} style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: fs(10), color: h.color, letterSpacing: "0.08em" }}>{h.categoryLabel}</span>
                  {h.amount && <span style={{ fontSize: fs(14), fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{h.amount}</span>}
                  <span style={{ fontSize: fs(10), color: "rgba(255,255,255,0.28)", marginLeft: "auto" }}>{h.ago}</span>
                </div>
                <p style={{ fontSize: fs(13), lineHeight: 1.65, color: "rgba(255,255,255,0.58)", margin: 0 }}>{h.detail}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ fontSize: fs(10), letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>SOURCE DIRECTORIES</div>
      <div style={{ border: `1px solid ${BORDER}`, marginBottom: 28 }}>
        {v.sourceDirectories.length === 0 ? (
          <div style={{ padding: "18px 20px", fontSize: 12, color: "rgba(255,255,255,0.32)" }}>No source URLs indexed yet — run a scan on this target.</div>
        ) : (
          v.sourceDirectories.map((s) => (
            <div
              key={s.url}
              style={{
                display: "grid",
                gridTemplateColumns: "88px 1fr",
                gap: 16,
                padding: "12px 18px",
                borderBottom: `1px solid ${BORDER}`,
                fontSize: 12,
                alignItems: "start",
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <ExternalLink href={s.url}>{shortUrl(s.url)}</ExternalLink>
              </div>
            </div>
          ))
        )}
      </div>

      {v.recentDocuments.length > 0 && (
        <>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>CITED DOCUMENTS</div>
          <div style={{ border: `1px solid ${BORDER}` }}>
            {v.recentDocuments.slice(0, 5).map((d) => (
              <div key={`brief-${d.title}`} style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>{d.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <span>{d.docType}</span>
                  {d.url && <ExternalLink href={d.url} style={{ fontSize: 10 }}>{shortUrl(d.url)}</ExternalLink>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
