"use client";

import type { VigilState } from "../useVigil";
import { TerminalSearch } from "../TerminalSearch";

export function NewWatchView({ v }: { v: VigilState }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#000" }}>
      <TerminalSearch
        onComplete={(id) => {
          v.selectCompany(id);
          v.setView("overview");
        }}
        onRefresh={v.refreshCompanies}
      />
    </div>
  );
}
