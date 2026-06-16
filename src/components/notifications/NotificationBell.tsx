"use client";

import { useEffect, useRef, useState } from "react";
import { useAlerts, type AlertItem } from "./AlertsContext";

export function NotificationBell() {
  const { alerts, unreadCount, markAllRead } = useAlerts();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const recent = alerts.slice(0, 5);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) markAllRead();
        }}
        className="text-muted hover:text-fg text-xs"
        aria-label="Notifications"
      >
        alerts{unreadCount > 0 && <span className="text-fg ml-1">({unreadCount})</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 border border-edge bg-bg z-50">
          <div className="px-3 py-2 border-b border-edge flex justify-between text-[11px]">
            <span className="text-muted">Notifications</span>
            <span className="text-muted">{alerts.length}</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {recent.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted">None</p>
            ) : (
              recent.map((item) => <Row key={item.id} item={item} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ item }: { item: AlertItem }) {
  return (
    <div className="px-3 py-2 border-b border-edge last:border-0 text-xs">
      <p className="text-fg leading-snug">{item.title}</p>
      <p className="text-muted mt-0.5 text-[11px]">
        {item.source && `${item.source} · `}
        {formatRelative(item.createdAt)}
      </p>
    </div>
  );
}

function formatRelative(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
