"use client";

import type { VigilState } from "../useVigil";
import { CompanyLogo } from "../brand";
import { PageShell } from "./layout";
import { BORDER, PageSectionHead, VigilBtn } from "./ui";
import { ExternalLink, shortUrl } from "./links";

export function DocumentsView({ v }: { v: VigilState }) {
  const domain = v.selectedCompany?.domain;
  return (
    <PageShell>
      <PageSectionHead num="06" title="DOCUMENTS" right={`${v.documents.length} INDEXED`} />
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 24, lineHeight: 1.6 }}>
        SEC filings, investor decks, and financial documents from your monitored companies.
      </div>

      {v.recentDocuments.length > 0 && (
        <>
          <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(167,139,250,0.85)", marginBottom: 16 }}>MOST RECENT</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 36 }}>
            {v.recentDocuments.map((d, i) => (
              <div
                key={`${d.title}-${d.url}-${i}`}
                className="vigil-fade-in"
                style={{
                  padding: "22px 24px",
                  border: `1px solid ${BORDER}`,
                  background: "linear-gradient(135deg, rgba(167,139,250,0.06) 0%, transparent 100%)",
                }}
              >
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <CompanyLogo domain={domain} name={d.title} size={40} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#A78BFA", border: "1px solid rgba(167,139,250,0.25)", padding: "2px 8px" }}>{d.docType}</span>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.92)", marginTop: 10, lineHeight: 1.45 }}>{d.title}</div>
                    {d.excerpt && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", marginTop: 8, lineHeight: 1.55 }}>{d.excerpt}</div>}
                    {d.url && (
                      <div style={{ marginTop: 10 }}>
                        <ExternalLink href={d.url} style={{ fontSize: 12 }}>{shortUrl(d.url)}</ExternalLink>
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 8 }}>{d.ago}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {v.secFilings.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.45)" }}>SEC EDGAR</span>
            <VigilBtn onClick={() => v.openSec()} accent>VIEW ALL SEC →</VigilBtn>
          </div>
          <div style={{ border: `1px solid ${BORDER}`, marginBottom: 32 }}>
            {v.secFilings.slice(0, 5).map((d, i) => (
              // EDGAR can return the same document URL more than once.
              <div key={`sec-${d.url}-${i}`} style={{ display: "flex", gap: 16, padding: "16px 20px", borderBottom: `1px solid rgba(255,255,255,0.04)`, fontSize: 13 }}>
                <span style={{ color: "#A78BFA", fontSize: 11, letterSpacing: "0.08em", width: 72, flexShrink: 0 }}>{d.docType}</span>
                <span style={{ flex: 1, color: "rgba(255,255,255,0.85)" }}>{d.title}</span>
                {d.url && <ExternalLink href={d.url} style={{ fontSize: 11 }}>EDGAR →</ExternalLink>}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.38)", marginBottom: 16 }}>BY SECTION</div>
      {v.documentsByCategory.map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${BORDER}` }}>
            {cat.toUpperCase()} · {items.length}
          </div>
          {items.map((d, di) => (
            <div key={`${cat}-${d.title}-${di}`} style={{ padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 13 }}>
              <div style={{ color: "rgba(255,255,255,0.88)", marginBottom: 6 }}>{d.title}</div>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
                <span>{d.docType}</span>
                {d.url && <ExternalLink href={d.url}>{shortUrl(d.url)}</ExternalLink>}
                <span>{d.ago}</span>
              </div>
              {d.excerpt && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", marginTop: 8, lineHeight: 1.5 }}>{d.excerpt}</div>}
            </div>
          ))}
        </div>
      ))}
      {v.documents.length === 0 && (
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.32)", padding: "32px 0" }}>No documents indexed yet.</div>
      )}
    </PageShell>
  );
}
