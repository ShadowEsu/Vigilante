"use client";

import type { VigilState } from "../useVigil";
import { ExternalLink, shortUrl } from "./links";

const INVESTOR_DOC_COLOR = "#A78BFA";

export function SidebarDocuments({ v }: { v: VigilState }) {
  const docs = v.recentDocuments;

  return (
    <div
      style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 14px 12px",
        flexShrink: 0,
        maxHeight: 280,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.32)" }}>RECENT DOCS</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => v.openSec()} style={{ background: "transparent", border: "none", padding: 0, font: "inherit", fontSize: 9, letterSpacing: "0.06em", color: "rgba(255,255,255,0.38)", cursor: "pointer" }}>
            [ sec → ]
          </button>
          <button type="button" onClick={() => v.openDocuments()} style={{ background: "transparent", border: "none", padding: 0, font: "inherit", fontSize: 9, letterSpacing: "0.06em", color: "rgba(255,255,255,0.38)", cursor: "pointer" }}>
            [ all → ]
          </button>
        </div>
      </div>
      <div className="scrollthin" style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
        {docs.length === 0 && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.04em", lineHeight: 1.5 }}>
            Filings & investor docs appear here after indexing a target.
          </div>
        )}
        {docs.map((d) => (
          <div
            key={`${d.title}-${d.url}`}
            style={{
              padding: "10px 0",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: "0.08em",
                  color: INVESTOR_DOC_COLOR,
                  border: "1px solid rgba(167,139,250,0.25)",
                  padding: "1px 5px",
                  flexShrink: 0,
                }}
              >
                {d.docType}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginLeft: "auto", flexShrink: 0 }}>{d.ago}</span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.82)",
                lineHeight: 1.4,
                marginBottom: 4,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {d.title}
            </div>
            {d.url && (
              <div style={{ marginBottom: 4 }}>
                <ExternalLink href={d.url} style={{ fontSize: 9.5 }}>
                  {shortUrl(d.url)}
                </ExternalLink>
              </div>
            )}
            {d.excerpt && (
              <div
                style={{
                  fontSize: 9.5,
                  color: "rgba(255,255,255,0.32)",
                  lineHeight: 1.45,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {d.excerpt}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
