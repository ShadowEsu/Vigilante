"use client";

import type { VigilState } from "../useVigil";
import { BORDER } from "./ui";
import { CompanyLogo } from "../brand";

export function CompanyPicker({ v }: { v: VigilState }) {
  const companies = v.companies;

  if (companies.length === 0) {
    return (
      <div
        style={{
          padding: "18px 24px",
          borderBottom: `1px solid ${BORDER}`,
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.06em",
        }}
      >
        No targets yet — add one in the terminal below.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "16px 22px 18px",
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.32)",
          marginBottom: 10,
        }}
      >
        ACTIVE TARGET · sections 01–09 filter to selection
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {companies.map((c) => {
          const active = v.selectedCompanyId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => v.selectCompany(c.id)}
              className="vigil-fade-in"
              style={{
                flex: companies.length <= 3 ? "1 1 200px" : undefined,
                minWidth: 160,
                padding: "16px 20px",
                background: active
                  ? `linear-gradient(135deg, rgba(110,155,230,0.1) 0%, rgba(255,255,255,0.04) 100%)`
                  : "rgba(255,255,255,0.02)",
                border: active ? "1px solid rgba(110,155,230,0.45)" : "1px solid rgba(255,255,255,0.1)",
                font: "inherit",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s, background 0.15s, transform 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <CompanyLogo domain={c.domain} name={c.name} size={32} />
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {c.name}
                </div>
              </div>
              <div style={{ fontSize: 12, color: active ? "rgba(74,222,128,0.75)" : "rgba(255,255,255,0.35)", letterSpacing: "0.04em" }}>
                {c.domain} · {c.pages_indexed} pages · {c.status}
              </div>
            </button>
          );
        })}
      </div>
      {v.selectedCompany && (
        <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em" }}>
          Monitoring {v.selectedCompany.name} only · last scan {v.lastScanAgo}
          {v.nextScanIn ? ` · next scheduled ${v.nextScanIn}` : ""}
        </div>
      )}
    </div>
  );
}
