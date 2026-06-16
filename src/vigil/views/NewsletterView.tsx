"use client";

import type { VigilState } from "../useVigil";
import { CompanyLogo, newsletterThumb } from "../brand";
import { PageShell } from "./layout";
import { BORDER, PageSectionHead } from "./ui";
import { ExternalLink, shortUrl } from "./links";

export function NewsletterView({ v }: { v: VigilState }) {
  const posts = v.newsletters;
  const selected = v.companies.find((c) => c.id === v.selectedCompanyId);
  const domain = selected?.domain;

  return (
    <PageShell>
      <PageSectionHead
        num="08"
        title="NEWSLETTERS"
        right={selected ? selected.name : `${posts.length} POSTS`}
      />
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", marginBottom: 28, maxWidth: "58ch", lineHeight: 1.65 }}>
        Recent posts indexed from your targets&apos; blogs, news, and newsletter pages.
      </div>
      {v.scraping && (
        <div style={{ padding: "14px 18px", border: `1px solid ${BORDER}`, marginBottom: 24, fontSize: 13, color: "rgba(255,255,255,0.55)", animation: "scanBeat 1.2s infinite" }}>
          INDEXING — fetching blog & newsletter pages…
        </div>
      )}
      {posts.length === 0 ? (
        <div style={{ padding: "48px 0", fontSize: 14, color: "rgba(255,255,255,0.32)" }}>
          No newsletter posts yet. Add a company (e.g. stripe.com) in TARGETS.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {posts.map((n, i) => {
            const thumb = newsletterThumb(n.url, domain);
            return (
              <div
                key={`${n.name}-${n.subject}`}
                className="vigil-fade-in"
                style={{
                  border: `1px solid ${BORDER}`,
                  background: "linear-gradient(160deg, rgba(232,149,109,0.06) 0%, transparent 60%)",
                  overflow: "hidden",
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                {thumb && (
                  <div
                    style={{
                      height: 100,
                      background: `linear-gradient(135deg, rgba(232,149,109,0.15) 0%, rgba(0,0,0,0.4) 100%), url(${thumb}) center/cover no-repeat`,
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  />
                )}
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <CompanyLogo domain={domain} name={n.name} size={28} />
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500, flex: 1 }}>{n.name}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", flexShrink: 0 }}>
                      {"company" in n ? (n as { company: string }).company : ""} · {n.ago}
                    </span>
                  </div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.78)", marginBottom: 12, lineHeight: 1.5 }}>{n.subject}</div>
                  {n.url && (
                    <div style={{ marginBottom: 12 }}>
                      <ExternalLink href={n.url} style={{ fontSize: 12 }}>{shortUrl(n.url)}</ExternalLink>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(n.changes ?? []).map((c) => (
                      <div key={c} style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>+ {c}</div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
