"use client";

import { useEffect } from "react";
import type { Signal } from "@/types/database";
import { useAlerts } from "./AlertsContext";

interface DashboardAlertsSyncProps {
  signals: Signal[];
  analysisNames: Map<string, string>;
}

export function DashboardAlertsSync({
  signals,
  analysisNames,
}: DashboardAlertsSyncProps) {
  const { setAlerts } = useAlerts();
  const signalKey = signals.map((s) => `${s.id}:${s.created_at}`).join("|");
  const namesKey = JSON.stringify(Array.from(analysisNames.entries()));

  useEffect(() => {
    const names = new Map<string, string>(JSON.parse(namesKey));
    setAlerts(
      signals.map((s) => ({
        id: s.id,
        title: s.title,
        severity: s.severity,
        createdAt: s.created_at,
        source: names.get(s.analysis_id),
      }))
    );
  }, [signalKey, namesKey, setAlerts, signals]);

  return null;
}
