"use client";

import { useState } from "react";

export function HoverTip({
  children,
  tip,
  width = 320,
}: {
  children: React.ReactNode;
  tip: React.ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && tip && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "100%",
            marginTop: 8,
            zIndex: 20,
            width,
            padding: "12px 14px",
            background: "rgba(12,12,12,0.98)",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            fontSize: 11,
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.72)",
            letterSpacing: "0.03em",
            pointerEvents: "none",
          }}
        >
          {tip}
        </div>
      )}
    </div>
  );
}
