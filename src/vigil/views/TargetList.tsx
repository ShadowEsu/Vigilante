"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CompanyLogo } from "../brand";
import type { VigilState } from "../useVigil";

interface ContextMenu {
  x: number;
  y: number;
  companyId: string;
}

export function TargetList({ v }: { v: VigilState }) {
  const [menu, setMenu] = useState<ContextMenu | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const marked = v.markedTargetIds;
  const markedCount = marked.length;

  const closeMenu = useCallback(() => setMenu(null), []);

  const confirmDelete = (ids: string[], label: string) => {
    if (!window.confirm(`Remove ${label} from your directory? This cannot be undone.`)) return;
    v.deleteTargets(ids);
  };

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest?.("[data-target-menu]")) return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu, closeMenu]);

  const onContextMenu = (e: React.MouseEvent, companyId: string) => {
    e.preventDefault();
    if (!marked.includes(companyId)) {
      v.toggleTargetMark(companyId, true);
    }
    setMenu({ x: e.clientX, y: e.clientY, companyId });
  };

  const menuCompany = menu ? v.companies.find((c) => c.id === menu.companyId) : null;
  const deleteCount = markedCount > 0 ? markedCount : menu ? 1 : 0;

  return (
    <div ref={listRef}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)" }}>TARGETS</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {markedCount > 0 && (
            <>
              <button
                type="button"
                onClick={() => confirmDelete(marked, `${markedCount} target${markedCount > 1 ? "s" : ""}`)}
                disabled={v.deletingTargets}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: v.deletingTargets ? "rgba(252,140,140,0.45)" : "#FC8C8C",
                  cursor: v.deletingTargets ? "wait" : "pointer",
                }}
              >
                [ delete {markedCount} ]
              </button>
              <button
                type="button"
                onClick={() => v.clearTargetMarks()}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.38)",
                  cursor: "pointer",
                }}
              >
                [ clear ]
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => v.setView("new")}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              font: "inherit",
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.45)",
              cursor: "pointer",
            }}
          >
            [ + add ]
          </button>
        </div>
      </div>

      {v.companies.length > 0 && (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em", marginBottom: 8 }}>
          click × to remove · [ ] to multi-select
        </div>
      )}

      <div style={{ maxHeight: 160, overflowY: "auto" }} className="scrollthin">
        {v.companies.length === 0 && !v.loading && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: "0.04em", padding: "4px 0" }}>
            no targets yet
          </div>
        )}
        {v.companies.map((c) => {
          const active = v.selectedCompanyId === c.id;
          const checked = marked.includes(c.id);
          return (
            <div
              key={c.id}
              onContextMenu={(e) => onContextMenu(e, c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 3,
                background: checked ? "rgba(252,140,140,0.06)" : active ? "rgba(255,255,255,0.06)" : "transparent",
                borderLeft: active ? "2px solid rgba(255,255,255,0.75)" : checked ? "2px solid rgba(252,140,140,0.45)" : "2px solid transparent",
              }}
            >
              <button
                type="button"
                aria-label={checked ? "Deselect target" : "Select target for deletion"}
                onClick={(e) => {
                  e.stopPropagation();
                  v.toggleTargetMark(c.id);
                }}
                style={{
                  flexShrink: 0,
                  width: 20,
                  padding: "6px 0 6px 4px",
                  background: "transparent",
                  border: "none",
                  font: "inherit",
                  fontSize: 10,
                  color: checked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.28)",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                {checked ? "[x]" : "[ ]"}
              </button>
              <button
                type="button"
                onClick={() => v.selectCompany(c.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flex: 1,
                  minWidth: 0,
                  padding: "6px 4px 6px 0",
                  background: "transparent",
                  border: "none",
                  font: "inherit",
                  cursor: "pointer",
                  textAlign: "left",
                  color: active ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.5)",
                }}
              >
                <CompanyLogo domain={c.domain} name={c.name} size={22} />
                <span style={{ fontSize: 7, color: c.status === "scanning" ? "#E3B341" : active ? "#4ADE80" : "rgba(255,255,255,0.35)" }}>
                  {c.status === "scanning" ? "◌" : "●"}
                </span>
                <span style={{ fontSize: 12, letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                  {c.pages_indexed}
                </span>
              </button>
              <button
                type="button"
                aria-label={`Remove ${c.name}`}
                title={`Remove ${c.name}`}
                disabled={v.deletingTargets}
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete([c.id], c.name);
                }}
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  border: "none",
                  font: "inherit",
                  fontSize: 16,
                  color: v.deletingTargets ? "rgba(252,140,140,0.3)" : "rgba(252,140,140,0.65)",
                  cursor: v.deletingTargets ? "wait" : "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {menu && (
        <div
          data-target-menu
          style={{
            position: "fixed",
            left: menu.x,
            top: menu.y,
            zIndex: 200,
            minWidth: 168,
            background: "rgba(10,10,10,0.98)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.55)",
            padding: "4px 0",
          }}
        >
          {menuCompany && (
            <div style={{ padding: "8px 12px 6px", fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.06em", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {menuCompany.name}
            </div>
          )}
          <button
            type="button"
            data-target-menu
            onClick={() => {
              closeMenu();
              v.selectCompany(menu.companyId);
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              font: "inherit",
              fontSize: 12,
              letterSpacing: "0.05em",
              color: "rgba(255,255,255,0.72)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            View target
          </button>
          <button
            type="button"
            data-target-menu
            disabled={v.deletingTargets}
            onClick={() => {
              closeMenu();
              const ids = markedCount > 0 ? marked : [menu.companyId];
              const label = markedCount > 1 ? `${markedCount} targets` : menuCompany?.name ?? "target";
              confirmDelete(ids, label);
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              font: "inherit",
              fontSize: 12,
              letterSpacing: "0.05em",
              color: v.deletingTargets ? "rgba(252,140,140,0.45)" : "#FC8C8C",
              cursor: v.deletingTargets ? "wait" : "pointer",
              textAlign: "left",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            Delete{deleteCount > 1 ? ` ${deleteCount} targets` : " target"}
          </button>
        </div>
      )}
    </div>
  );
}
