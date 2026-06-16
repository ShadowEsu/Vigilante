"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export interface AlertItem {
  id: string;
  title: string;
  severity: string;
  createdAt: string;
  source?: string;
}

interface AlertsContextValue {
  alerts: AlertItem[];
  setAlerts: (alerts: AlertItem[]) => void;
  unreadCount: number;
  markAllRead: () => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlertsState] = useState<AlertItem[]>([]);
  const [lastReadAt, setLastReadAt] = useState(() => Date.now());

  const setAlerts = useCallback((next: AlertItem[]) => {
    setAlertsState(next);
  }, []);

  const unreadCount = useMemo(() => {
    return alerts.filter(
      (a) => new Date(a.createdAt).getTime() > lastReadAt
    ).length;
  }, [alerts, lastReadAt]);

  const markAllRead = useCallback(() => {
    setLastReadAt(Date.now());
  }, []);

  const value = useMemo(
    () => ({ alerts, setAlerts, unreadCount, markAllRead }),
    [alerts, setAlerts, unreadCount, markAllRead]
  );

  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) {
    throw new Error("useAlerts must be used within AlertsProvider");
  }
  return ctx;
}
