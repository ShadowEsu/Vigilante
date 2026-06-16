"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { VigilState } from "../useVigil";
import type { ScanUnit } from "../data";
import { TYPE_COLOR } from "../data";
import { BORDER, PageSectionHead, scrollthin } from "./ui";
import {
  DEFAULT_SETTINGS,
  NOTIFY_SIGNAL_TYPES,
  loadSettings,
  saveSettings,
  type SignalNotifyPrefs,
  type SignalNotifyType,
  type UserSettings,
} from "@/lib/ui/settings-store";
import { meter } from "../utils";
import { LEGAL } from "@/lib/legal/config";
import { FONT_SCALE_PRESETS } from "../data";

const INTERVAL_PRESETS: Record<ScanUnit, number[]> = {
  minutes: [15, 30, 45, 60],
  hours: [1, 3, 6, 12, 24],
  days: [1, 2, 3, 7],
  weeks: [1, 2, 4],
  month: [1],
};

export function SettingsView({ v }: { v: VigilState }) {
  const { scanSettings, setScanSettings, scanScheduleLabel } = v;
  const presets = INTERVAL_PRESETS[scanSettings.unit];

  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [revealedKey, setRevealedKey] = useState<"supabase" | "openai" | "slack" | null>(null);
  const [slackTesting, setSlackTesting] = useState(false);

  useEffect(() => {
    const s = loadSettings();
    setSettings(s);
    setUrlDraft(s.integrations.supabaseUrl);
    if (s.display?.fontScale) v.setFontScale(s.display.fontScale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const persistSettings = useCallback(
    (next: UserSettings) => {
      setSettings(next);
      saveSettings(next);
      flash("✓ saved");
    },
    [flash]
  );

  const toggleNotify = (type: SignalNotifyType, channel: keyof SignalNotifyPrefs) => {
    const prefs = settings.signalNotifications[type];
    persistSettings({
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
  const watchesUsed = v.hasLiveData ? v.counters.watches : billing.watchesUsed;
  const watchesLimit = billing.watchesLimit;
  const watchPct = watchesLimit ? Math.round((watchesUsed / watchesLimit) * 100) : 0;
  const watchMeter = meter(watchPct, 10);

  return (
    <div className={scrollthin()} style={{ height: "100%", overflow: "auto", padding: "28px 36px", background: "#000" }}>
      <PageSectionHead num="11" title="SETTINGS" marginBottom={24} />

      {toast && (
        <div
          style={{
            marginBottom: 20,
            padding: "10px 14px",
            border: "1px solid rgba(110,207,142,0.35)",
            color: "#6ECF8E",
            background: "rgba(110,207,142,0.08)",
            fontSize: 11,
            letterSpacing: "0.06em",
          }}
        >
          {toast}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        {[
          ["AI", v.systemStatus?.ai],
          ["SEARCH", v.systemStatus?.search],
          ["SEC", v.systemStatus?.sec ?? true],
          ["STORAGE", true],
        ].map(([label, ok]) => (
          <span
            key={String(label)}
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              padding: "6px 12px",
              border: `1px solid ${ok ? "rgba(74,222,128,0.35)" : BORDER}`,
              color: ok ? "#4ADE80" : "rgba(255,255,255,0.35)",
            }}
          >
            {ok ? "●" : "○"} {label}
          </span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <div style={{ border: `1px solid ${BORDER}`, padding: "18px 20px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>ACCOUNT</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{initials}</div>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>{profile.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>{profile.plan} · {watchesUsed}/{watchesLimit} watches</div>
            </div>
          </div>
        </div>
        <div style={{ border: `1px solid ${BORDER}`, padding: "18px 20px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>BILLING</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>{profile.plan} · {billing.planPrice}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Next {billing.nextBill}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 8 }}>
            <span style={{ letterSpacing: 1 }}>
              <span style={{ color: "rgba(255,255,255,0.52)" }}>{watchMeter.fill}</span>
              <span style={{ color: "rgba(255,255,255,0.1)" }}>{watchMeter.track}</span>
            </span>{" "}
            {watchPct}%
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>APPEARANCE</div>
      <div style={{ border: `1px solid ${BORDER}`, padding: "18px 22px", marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", marginBottom: 14 }}>Text size across Brief, Insights, and main panels</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FONT_SCALE_PRESETS.map((preset) => {
            const active = Math.abs(v.fontScale - preset.value) < 0.01;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  v.setFontScale(preset.value);
                  persistSettings({
                    ...settings,
                    display: { ...settings.display, fontScale: preset.value },
                  });
                }}
                style={{
                  background: active ? "rgba(255,255,255,0.08)" : "transparent",
                  border: `1px solid ${active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
                  padding: "8px 14px",
                  font: "inherit",
                  fontSize: Math.round(12 * preset.value),
                  letterSpacing: "0.08em",
                  color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>SCAN SCHEDULE</div>
      <div style={{ border: `1px solid ${BORDER}`, padding: "18px 22px", marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "14px 20px", fontSize: 12, alignItems: "center" }}>
          <span style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em" }}>INTERVAL</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              type="number"
              min={1}
              max={999}
              value={scanSettings.interval}
              onChange={(e) => {
                setScanSettings({ interval: Math.max(1, parseInt(e.target.value, 10) || 1) });
                flash("✓ schedule saved");
              }}
              style={{
                width: 64,
                border: `1px solid ${BORDER}`,
                padding: "6px 10px",
                fontVariantNumeric: "tabular-nums",
                color: "rgba(255,255,255,0.9)",
                background: "transparent",
              }}
            />
            <select
              value={scanSettings.unit}
              onChange={(e) => {
                const unit = e.target.value as ScanUnit;
                const first = INTERVAL_PRESETS[unit][0];
                setScanSettings({ unit, interval: first });
                flash("✓ schedule saved");
              }}
              style={{
                border: `1px solid ${BORDER}`,
                padding: "6px 10px",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "0.06em",
                cursor: "pointer",
                background: "#111",
              }}
            >
              {v.scanUnits.map((u) => (
                <option key={u} value={u} style={{ background: "#111" }}>
                  {u.toUpperCase()}
                </option>
              ))}
            </select>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{scanScheduleLabel}</span>
          </div>

          <span style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em" }}>QUICK SET</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {presets.map((n) => {
              const active = scanSettings.interval === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setScanSettings({ interval: n });
                    flash("✓ schedule saved");
                  }}
                  style={{
                    background: active ? "rgba(255,255,255,0.08)" : "transparent",
                    border: `1px solid ${active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)"}`,
                    padding: "5px 12px",
                    font: "inherit",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                  }}
                >
                  {n} {scanSettings.unit}
                </button>
              );
            })}
          </div>

          <span style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.08em" }}>MAX / DAY</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="number"
              min={1}
              max={48}
              value={scanSettings.maxPerDay}
              onChange={(e) => {
                setScanSettings({ maxPerDay: Math.min(48, Math.max(1, parseInt(e.target.value, 10) || 1)) });
                flash("✓ schedule saved");
              }}
              style={{
                width: 64,
                border: `1px solid ${BORDER}`,
                padding: "6px 10px",
                fontVariantNumeric: "tabular-nums",
                color: "rgba(255,255,255,0.9)",
                background: "transparent",
              }}
            />
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
              full index runs per target per 24h · {v.scanRunsToday}/{scanSettings.maxPerDay} used today
              {v.nextScanIn ? ` · next auto-scan ${v.nextScanIn}` : ""}
            </span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 9.5, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>NOTIFICATIONS</div>
      <div style={{ border: `1px solid ${BORDER}`, marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, fontSize: 9.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.32)" }}>
          <span>INTEL TYPE</span><span style={{ textAlign: "center" }}>EMAIL</span><span style={{ textAlign: "center" }}>SLACK</span><span style={{ textAlign: "center" }}>DIGEST</span>
        </div>
        {NOTIFY_SIGNAL_TYPES.map((row) => {
          const prefs = settings.signalNotifications[row.id];
          const color = TYPE_COLOR[row.id] || "rgba(255,255,255,0.6)";
          return (
            <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", alignItems: "center", padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color, fontSize: 12, letterSpacing: "0.06em" }}>{row.label}</span>
              {(["email", "slack", "digest"] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleNotify(row.id, ch)}
                  style={{
                    textAlign: "center",
                    background: "transparent",
                    border: "none",
                    font: "inherit",
                    fontSize: 12,
                    color: prefs[ch] ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                  }}
                >
                  {prefs[ch] ? "[x]" : "[ ]"}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.38)", marginBottom: 14 }}>INTEGRATIONS</div>
      <div style={{ border: `1px solid ${BORDER}`, marginBottom: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 90px", alignItems: "center", padding: "15px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)" }}>SLACK</span>
          <div>
            <div style={{ fontSize: 12, color: integrations.slack ? "#4ADE80" : "rgba(255,255,255,0.45)" }}>
              {integrations.slack ? "● Connected" : "○ Not connected"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", marginTop: 4 }}>Incoming webhook for intel alerts</div>
          </div>
          <button
            type="button"
            onClick={() =>
              persistSettings({
                ...settings,
                integrations: { ...integrations, slack: !integrations.slack },
              })
            }
            style={{ justifySelf: "end", background: "transparent", border: "1px solid rgba(255,255,255,0.13)", padding: "4px 10px", font: "inherit", fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
          >
            {integrations.slack ? "[ on ]" : "[ off ]"}
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "8px 16px", padding: "15px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 12, alignItems: "center" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)" }}>WEBHOOK URL</span>
          <input
            value={integrations.slackWebhookUrl}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                integrations: { ...s.integrations, slackWebhookUrl: e.target.value },
              }))
            }
            onBlur={() =>
              persistSettings({
                ...settings,
                integrations: { ...settings.integrations, slackWebhookUrl: integrations.slackWebhookUrl },
              })
            }
            placeholder="https://hooks.slack.com/services/..."
            style={{ border: `1px solid ${BORDER}`, padding: "8px 10px", background: "transparent", color: "rgba(255,255,255,0.8)", font: "inherit", fontSize: 12 }}
          />
          <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)" }}>CHANNEL</span>
          <input
            value={integrations.slackChannel}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                integrations: { ...s.integrations, slackChannel: e.target.value },
              }))
            }
            onBlur={() =>
              persistSettings({
                ...settings,
                integrations: { ...settings.integrations, slackChannel: integrations.slackChannel },
              })
            }
            placeholder="#competitive-intel"
            style={{ border: `1px solid ${BORDER}`, padding: "8px 10px", background: "transparent", color: "rgba(255,255,255,0.8)", font: "inherit", fontSize: 12 }}
          />
        </div>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <button
            type="button"
            disabled={slackTesting || !integrations.slackWebhookUrl}
            onClick={async () => {
              setSlackTesting(true);
              try {
                const res = await fetch("/api/integrations/slack", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    webhookUrl: integrations.slackWebhookUrl,
                    channel: integrations.slackChannel,
                    company: v.selectedCompany?.name,
                    message: `Vigilante connected — you'll receive pricing, filing, and activity alerts for ${v.selectedCompany?.name ?? "monitored targets"}.`,
                  }),
                });
                const data = await res.json();
                if (data.ok) {
                  persistSettings({
                    ...settings,
                    integrations: { ...integrations, slack: true },
                  });
                  flash("✓ slack test sent");
                } else {
                  flash(data.error ?? "Slack test failed");
                }
              } catch {
                flash("Slack test failed");
              } finally {
                setSlackTesting(false);
              }
            }}
            style={{ background: "transparent", border: "1px solid rgba(110,155,230,0.45)", padding: "6px 12px", font: "inherit", fontSize: 11, color: "rgba(110,207,230,0.95)", cursor: slackTesting ? "wait" : "pointer" }}
          >
            {slackTesting ? "[ sending… ]" : "[ test slack ]"}
          </button>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)" }}>Uses your webhook — alerts fire when notification toggles above include Slack</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 90px", alignItems: "center", padding: "15px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)" }}>SUPABASE URL</span>
          {editingUrl ? (
            <input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", background: "transparent", border: "none", borderBottom: `1px solid ${BORDER}`, font: "inherit" }}
            />
          ) : (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.52)" }}>{integrations.supabaseUrl}</span>
          )}
          <button
            type="button"
            onClick={() => {
              if (editingUrl) {
                persistSettings({ ...settings, integrations: { ...integrations, supabaseUrl: urlDraft } });
                setEditingUrl(false);
              } else {
                setUrlDraft(integrations.supabaseUrl);
                setEditingUrl(true);
              }
            }}
            style={{ justifySelf: "end", background: "transparent", border: "1px solid rgba(255,255,255,0.13)", padding: "4px 10px", font: "inherit", fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
          >
            {editingUrl ? "[ save ]" : "[ edit ]"}
          </button>
        </div>
        {(["supabase", "openai"] as const).map((key, idx, arr) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 90px",
              alignItems: "center",
              padding: "15px 16px",
              borderBottom: idx === arr.length - 1 ? "none" : "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(255,255,255,0.38)" }}>{key === "supabase" ? "SUPABASE KEY" : "OPENAI KEY"}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", letterSpacing: "0.1em" }}>
              {revealedKey === key ? (key === "supabase" ? integrations.supabaseKey : integrations.openaiKey) : "•••••••••••••••••••••••••"}
            </span>
            <button
              type="button"
              onClick={() => {
                setRevealedKey(revealedKey === key ? null : key);
                if (revealedKey !== key) flash("✓ key revealed (demo)");
              }}
              style={{ justifySelf: "end", background: "transparent", border: "1px solid rgba(255,255,255,0.13)", padding: "4px 10px", font: "inherit", fontSize: 10, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", cursor: "pointer" }}
            >
              {revealedKey === key ? "[ hide ]" : "[ reveal ]"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER}`, fontSize: 10, color: "rgba(255,255,255,0.32)", letterSpacing: "0.05em", lineHeight: 1.8 }}>
        {LEGAL.companyLegalName} · {LEGAL.registeredAddress} ·{" "}
        <Link href="/legal" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Legal →</Link>
      </div>
    </div>
  );
}
