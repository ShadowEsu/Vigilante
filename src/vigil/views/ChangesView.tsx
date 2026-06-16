"use client";

import type { VigilState } from "../useVigil";
import { BORDER, PageSectionHead, scrollthin } from "./ui";
import { ExternalLink, shortUrl } from "./links";
import { HoverTip } from "./HoverTip";

export function ChangesView({ v }: { v: VigilState }) {
  return (
    <div className={scrollthin()} style={{ height: "100%", overflow: "auto", padding: "28px 36px", background: "#000" }}>
      <PageSectionHead num="04" title="CHANGES FEED" right={`${v.changesCount} DETECTED`} />
      {v.changes.length === 0 && (
        <div style={{ padding: "32px 0", fontSize: 12, color: "rgba(255,255,255,0.32)", letterSpacing: "0.05em" }}>
          No changes yet. Add a target and run a second index pass to detect diffs.
        </div>
      )}
      <div style={{ borderTop: `1px solid ${BORDER}` }}>
        {v.changes.map((c, i) => (
          <HoverTip
            key={`${c.title}-${c.source_url ?? i}`}
            width={360}
            tip={
              <div>
                <div style={{ marginBottom: 8 }}>{c.summary}</div>
                {(c.bullets ?? []).map((b: string) => (
                  <div key={b}>· {b}</div>
                ))}
              </div>
            }
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "130px 16px 80px 1fr",
                alignItems: "center",
                gap: 12,
                padding: "14px 8px 14px 14px",
                borderBottom: `1px solid ${BORDER}`,
                boxShadow: c.leftBorder,
                fontSize: 12,
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{c.ago}</span>
              <span style={{ color: c.sevColor, textAlign: "center" }}>{c.sev}</span>
              <span style={{ color: c.color, fontSize: 10, letterSpacing: "0.1em", fontWeight: 500 }}>{c.typeLabel}</span>
              <div style={{ minWidth: 0, overflow: "hidden" }}>
                <div style={{ color: "rgba(255,255,255,0.88)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                {c.source_url && (
                  <div style={{ marginTop: 4 }}>
                    <ExternalLink href={c.source_url} style={{ fontSize: 10 }}>{shortUrl(c.source_url)}</ExternalLink>
                  </div>
                )}
              </div>
            </div>
          </HoverTip>
        ))}
      </div>
    </div>
  );
}
