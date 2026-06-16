"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageFrame, SectionHeader } from "@/components/terminal/ui";
import { LegalFooterLinks } from "@/components/legal/LegalPage";
import {
  DEFAULT_SETTINGS,
  NOTIFY_SIGNAL_TYPES,
  loadSettings,
  saveSettings,
  type SignalNotifyPrefs,
  type SignalNotifyType,
  type UserSettings,
} from "@/lib/ui/settings-store";
import { ACCENT, typeColor } from "@/lib/ui/type-colors";
import { meter } from "@/lib/ui/ascii";

export function SettingsPageView({ email }: { email?: string }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  useEffect(() => {
    const s = loadSettings(email);
    setSettings(s);
    setUrlDraft(s.integrations.supabaseUrl);
  }, [email]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const persist = useCallback(
    (next: UserSettings) => {
      setSettings(next);
      saveSettings(next);
      flash("✓ saved");
    },
    [flash]
  );

  const toggleNotify = (type: SignalNotifyType, channel: keyof SignalNotifyPrefs) => {
    const prefs = settings.signalNotifications[type];
    persist({
      ...settings,
      signalNotifications: {
        ...settings.signalNotifications,
        [type]: { ...prefs, [channel]: !prefs[channel] },
      },
    });
  };

  const { profile, integrations, billing } = settings;
  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const watchPct = billing.watchesLimit
    ? Math.round((billing.watchesUsed / billing.watchesLimit) * 100)
    : 0;
  const watchMeter = meter(watchPct, 10);

  return (
    <PageFrame>
      <SectionHeader num="08" title="SETTINGS" />

      {toast && (
        <div
          className="mb-4 px-4 py-2 text-[11px] tracking-wide border font-mono"
          style={{
            borderColor: "rgba(110,207,142,0.35)",
            color: ACCENT.green,
            background: "rgba(110,207,142,0.08)",
          }}
        >
          {toast}
        </div>
      )}

      <div className="mb-10">
        <div className="text-[10px] tracking-[0.2em] text-muted mb-4">ACCOUNT</div>
        <div
          className="flex items-center gap-4 px-5 py-4 border font-mono"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          <span
            className="inline-flex items-center justify-center w-10 h-10 text-xs border shrink-0"
            style={{ borderColor: "rgba(255,255,255,0.25)" }}
          >
            {initials}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] tracking-wide">{profile.name}</div>
            <button
              type="button"
              className="mt-1 bg-transparent border-none p-0 font-mono text-[11px] cursor-pointer"
              style={{ color: ACCENT.blue }}
              onClick={() => flash("✓ logged out (demo)")}
            >
              [ logout ]
            </button>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-[10px] tracking-[0.2em] px-2 py-1 border inline-block mb-2"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: ACCENT.gold }}
            >
              {profile.plan.toUpperCase()}
            </div>
            <div className="text-[11px] text-muted">
              {billing.watchesUsed}/{billing.watchesLimit} watches used
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="text-[10px] tracking-[0.2em] text-muted mb-4">NOTIFICATIONS</div>
        <div className="border font-mono text-[12px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div
            className="grid gap-4 px-5 py-3 text-[9px] tracking-[0.16em] text-muted border-b"
            style={{
              gridTemplateColumns: "1fr 72px 72px 72px",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <span>SIGNAL TYPE</span>
            <span>EMAIL</span>
            <span>SLACK</span>
            <span>DIGEST</span>
          </div>
          {NOTIFY_SIGNAL_TYPES.map((row) => {
            const prefs = settings.signalNotifications[row.id];
            const color = typeColor(row.id);
            return (
              <div
                key={row.id}
                className="grid gap-4 px-5 py-3 border-b last:border-0 items-center"
                style={{
                  gridTemplateColumns: "1fr 72px 72px 72px",
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <span className="tracking-wide" style={{ color }}>
                  {row.label}
                </span>
                {(["email", "slack", "digest"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleNotify(row.id, ch)}
                    className="bg-transparent border-none font-mono text-[11px] cursor-pointer text-left"
                    style={{ color: prefs[ch] ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }}
                  >
                    {prefs[ch] ? "[x]" : "[ ]"}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-10">
        <div className="text-[10px] tracking-[0.2em] text-muted mb-4">INTEGRATIONS</div>
        <div className="border font-mono text-[12px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div
            className="flex items-center gap-4 px-5 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-[10px] tracking-widest text-muted w-36 shrink-0">SUPABASE URL</span>
            {editingUrl ? (
              <input
                value={urlDraft}
                onChange={(e) => setUrlDraft(e.target.value)}
                className="flex-1 bg-transparent border-b font-mono text-[12px]"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              />
            ) : (
              <span className="flex-1 truncate text-dim">{integrations.supabaseUrl}</span>
            )}
            {editingUrl ? (
              <button
                type="button"
                onClick={() => {
                  persist({
                    ...settings,
                    integrations: { ...integrations, supabaseUrl: urlDraft },
                  });
                  setEditingUrl(false);
                }}
                className="bg-transparent border-none font-mono text-[11px] cursor-pointer"
                style={{ color: ACCENT.green }}
              >
                [ save ]
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditingUrl(true)}
                className="bg-transparent border-none font-mono text-[11px] cursor-pointer text-muted"
              >
                [ edit ]
              </button>
            )}
          </div>
          <KeyRow label="SUPABASE KEY" onReset={() => flash("✓ key reset (demo)")} />
          <KeyRow label="OPENAI KEY" onReset={() => flash("✓ key reset (demo)")} />
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[10px] tracking-[0.2em] text-muted mb-4">BILLING</div>
        <div className="border font-mono text-[12px]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <BillingRow label="PLAN" value={`${profile.plan} — ${billing.planPrice}`} />
          <BillingRow label="NEXT BILL" value={billing.nextBill} />
          <div
            className="flex items-center gap-4 px-5 py-3 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-[10px] tracking-widest text-muted w-36 shrink-0">WATCHES</span>
            <span className="tabular-nums">
              {billing.watchesUsed}/{billing.watchesLimit}
            </span>
            <span className="tracking-wide text-[11px]">
              <span style={{ color: ACCENT.blue }}>{watchMeter.fill}</span>
              <span className="text-faint">{watchMeter.track}</span>
            </span>
            <span className="text-muted text-[11px]">{watchPct}%</span>
          </div>
          <BillingRow
            label="SIGNALS MTD"
            value={`${billing.signalsMtd} / unlimited`}
            valueColor={ACCENT.cyan}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="text-[10px] tracking-[0.2em] text-muted mb-4">LEGAL</div>
        <div className="border px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <LegalFooterLinks />
        </div>
      </div>
    </PageFrame>
  );
}

function BillingRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-3 border-b last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <span className="text-[10px] tracking-widest text-muted w-36 shrink-0">{label}</span>
      <span style={{ color: valueColor ?? "rgba(255,255,255,0.92)" }}>{value}</span>
    </div>
  );
}

function KeyRow({ label, onReset }: { label: string; onReset: () => void }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-3 border-b last:border-0"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <span className="text-[10px] tracking-widest text-muted w-36 shrink-0">{label}</span>
      <span className="flex-1 text-dim">••••••••••••••••</span>
      <button
        type="button"
        onClick={onReset}
        className="bg-transparent border-none font-mono text-[11px] cursor-pointer text-muted"
      >
        [ reset ]
      </button>
    </div>
  );
}
