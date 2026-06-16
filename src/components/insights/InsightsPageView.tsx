"use client";

import { useState } from "react";
import type { InsightItem } from "@/lib/preview/mock-extended";
import { PageFrame, SectionHeader } from "@/components/terminal/ui";
import { typeColor } from "@/lib/ui/type-colors";

const TABS = [
  { id: "stock" as const, label: "STOCK" },
  { id: "patents" as const, label: "PATENTS" },
  { id: "newsletters" as const, label: "NEWSLETTERS" },
  { id: "insider" as const, label: "INSIDER" },
  { id: "investments" as const, label: "INVESTMENTS" },
];

type TabId = (typeof TABS)[number]["id"];

interface InsightsPageViewProps {
  data: Record<TabId, InsightItem[]>;
}

export function InsightsPageView({ data }: InsightsPageViewProps) {
  const [tab, setTab] = useState<TabId>("stock");
  const items = data[tab];
  const tabColor = typeColor(tab);

  return (
    <PageFrame>
      <SectionHeader num="03" title="INSIGHTS" right={`${items.length} in ${tab}`} />
      <div className="flex gap-5 border-b border-edge mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="bg-transparent border-none font-mono text-[11px] tracking-widest pb-2 cursor-pointer"
            style={{
              color: tab === t.id ? typeColor(t.id) : "rgba(255,255,255,0.3)",
              borderBottom:
                tab === t.id ? `1px solid ${typeColor(t.id)}` : "1px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-0 border border-edge" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="px-4 py-4 border-b last:border-0"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] leading-snug" style={{ color: tabColor }}>
                {item.title}
              </div>
              <p className="text-[11px] text-muted mt-2 leading-relaxed max-w-[60ch]">
                {item.summary}
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] tracking-wide">
                <span style={{ color: typeColor(tab) }}>{item.source}</span>
                <span className="text-faint">·</span>
                <span className="text-muted">{item.at}</span>
                {item.tag && (
                  <>
                    <span className="text-faint">·</span>
                    <span style={{ color: typeColor("pricing") }}>{item.tag}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {!items.length && (
          <p className="px-4 py-8 text-xs text-muted text-center">No insights in this category.</p>
        )}
      </div>
    </PageFrame>
  );
}
