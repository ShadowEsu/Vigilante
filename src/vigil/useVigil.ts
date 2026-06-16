"use client";

import type { CompanyDashboard } from "@/lib/company/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ACTIVITY,
  BRIEF,
  CADENCE,
  DEFAULT_SCAN_SETTINGS,
  DEFAULT_DISPLAY_SETTINGS,
  formatScanSchedule,
  CHANGES,
  DOCUMENTS,
  mockBlogKeywordsFor,
  mockInsiderFor,
  INVESTMENTS,
  NEWSLETTERS,
  SCAN_LOG,
  STOCKS,
  TYPE_COLOR,
  INTEL_TYPE_BARS,
  WATCHES,
  WIDGET_DEFS,
  DEFAULT_WIDGETS,
  type ViewId,
  type WidgetKey,
  SCAN_UNITS,
} from "./data";
import { buildLiveData } from "./live-data";
import { categorizeSourceUrl, getCompanyProfile } from "./company-profile";
import {
  buildCompetitorCompare,
  buildIntelTimeline,
  buildKeywordTrends,
  buildSignalCoverage,
  buildSourceBreakdown,
} from "./intel";
import { formatTimeAgo, formatDurationUntil, getScanRunsToday, intervalToMs, meter, recordScanRun, buildRolling14DayActivity } from "./utils";

export function useVigil() {
  const [view, setView] = useState<ViewId>("overview");
  const [now, setNow] = useState(new Date());
  const [relativeNow, setRelativeNow] = useState(new Date());
  const [running, setRunning] = useState<string | null>(null);
  const [insightTab, setInsightTab] = useState<"activity" | "stock" | "documents" | "sec" | "newsletters" | "insider" | "investments">("activity");
  const [configuring, setConfiguring] = useState(false);
  const [widgets, setWidgets] = useState<Record<WidgetKey, boolean>>(DEFAULT_WIDGETS);
  const [sidebarWidth, setSidebarWidthState] = useState(244);
  const [dashboards, setDashboards] = useState<CompanyDashboard[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [companyInput, setCompanyInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [counters, setCounters] = useState({ pages: 0, watches: 0, live: 0, spend: 0 });
  const [askInput, setAskInput] = useState("");
  const [askLog, setAskLog] = useState<{ role: string; text: string; meta?: string }[]>([
    { role: "sys", text: "ASK VIGILANTE — query your monitored companies in natural language." },
  ]);
  const [agentInput, setAgentInput] = useState("");
  const [agentLog, setAgentLog] = useState<{ role: string; text: string; meta?: string }[]>([
    { role: "agent", text: "I'm your watch setup agent. Tell me which company or website to monitor — I'll discover sources and index them.", meta: "vigilante agent v1.0" },
  ]);
  const [agentStage, setAgentStage] = useState(0);
  const [agentConfig, setAgentConfig] = useState({ name: "", url: "", type: "company", signals: [] as string[], cadence: "", budget: "" });
  const [nw, setNw] = useState({ url: "", type: "company", cadence: 1, budget: "3.00", email: true, slack: false, created: false });
  const [scanSettings, setScanSettingsState] = useState(DEFAULT_SCAN_SETTINGS);
  const [fontScale, setFontScaleState] = useState(DEFAULT_DISPLAY_SETTINGS.fontScale);
  const [nextScanAt, setNextScanAt] = useState<number | null>(null);
  const [scanRunsToday, setScanRunsToday] = useState(0);
  const [markedTargetIds, setMarkedTargetIds] = useState<string[]>([]);
  const [deletingTargets, setDeletingTargets] = useState(false);
  const [askLoading, setAskLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{
    ai: boolean;
    search: boolean;
    sec: boolean;
    entity: string;
  } | null>(null);
  const runTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const w = localStorage.getItem("vigil-sidebar-width");
      if (w) {
        const n = parseInt(w, 10);
        if (n >= 200 && n <= 420) setSidebarWidthState(n);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vigil-widgets");
      if (raw) setWidgets((prev) => ({ ...DEFAULT_WIDGETS, ...prev, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
  }, []);

  const setSidebarWidth = useCallback((w: number) => {
    const clamped = Math.min(420, Math.max(200, w));
    setSidebarWidthState(clamped);
    try {
      localStorage.setItem("vigil-sidebar-width", String(clamped));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vigil-display-settings");
      if (raw) {
        const parsed = JSON.parse(raw) as { fontScale?: number };
        if (parsed.fontScale && parsed.fontScale >= 0.9 && parsed.fontScale <= 1.4) {
          setFontScaleState(parsed.fontScale);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setFontScale = useCallback((scale: number) => {
    const clamped = Math.min(1.4, Math.max(0.9, scale));
    setFontScaleState(clamped);
    try {
      localStorage.setItem("vigil-display-settings", JSON.stringify({ fontScale: clamped }));
    } catch {
      /* ignore */
    }
  }, []);

  const fs = useCallback((px: number) => Math.round(px * fontScale * 10) / 10, [fontScale]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vigil-scan-settings");
      if (raw) setScanSettingsState({ ...DEFAULT_SCAN_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const setScanSettings = useCallback((patch: Partial<typeof DEFAULT_SCAN_SETTINGS>) => {
    setScanSettingsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem("vigil-scan-settings", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const refreshCompanies = useCallback(async (selectId?: string | null) => {
    try {
      const res = await fetch("/api/companies", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { dashboards?: CompanyDashboard[] };
      const list = data.dashboards ?? [];
      setDashboards(list);
      setMarkedTargetIds((prev) => prev.filter((id) => list.some((d) => d.company.id === id)));
      setSelectedCompanyId((prev) => {
        if (selectId !== undefined) return selectId;
        if (prev && list.some((d) => d.company.id === prev)) return prev;
        return list[0]?.company.id ?? null;
      });
      setApiError(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to load companies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCompanies();
  }, [refreshCompanies]);

  useEffect(() => {
    fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSystemStatus({ ai: !!d.ai, search: !!d.search, sec: !!d.sec, entity: d.entity ?? "Vigilant Intelligence, Inc." }))
      .catch(() => setSystemStatus({ ai: false, search: false, sec: true, entity: "Vigilant Intelligence, Inc." }));
  }, []);

  const toggleTargetMark = useCallback((id: string, forceOn?: boolean) => {
    setMarkedTargetIds((prev) => {
      const has = prev.includes(id);
      if (forceOn === true && has) return prev;
      if (forceOn === true) return [...prev, id];
      if (has) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  }, []);

  const clearTargetMarks = useCallback(() => setMarkedTargetIds([]), []);

  const deleteTargets = useCallback(
    async (ids: string[]) => {
      const unique = Array.from(new Set(ids.filter(Boolean)));
      if (unique.length === 0) return;
      setDeletingTargets(true);
      setApiError(null);
      try {
        for (const id of unique) {
          const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { error?: string }).error ?? "Delete failed");
          }
        }
        setMarkedTargetIds((prev) => prev.filter((id) => !unique.includes(id)));
        const deletingActive = unique.includes(selectedCompanyId ?? "");
        await refreshCompanies(deletingActive ? null : undefined);
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setDeletingTargets(false);
      }
    },
    [refreshCompanies, selectedCompanyId]
  );

  const deleteMarkedTargets = useCallback(async () => {
    await deleteTargets(markedTargetIds);
  }, [deleteTargets, markedTargetIds]);

  useEffect(() => {
    setScanRunsToday(getScanRunsToday());
  }, [scraping]);

  const scanScheduleLabel = formatScanSchedule(scanSettings.interval, scanSettings.unit);

  const live = useMemo(
    () =>
      buildLiveData(dashboards, selectedCompanyId, {
        loading,
        scraping,
        error: apiError,
        scanScheduleLabel,
      }),
    [dashboards, selectedCompanyId, loading, scraping, apiError, scanScheduleLabel]
  );

  const hasLive = live.hasLiveData;

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    const relative = setInterval(() => setRelativeNow(new Date()), 30_000);
    const target = hasLive
      ? live.selectedCounters
      : { pages: 12, watches: 2, live: 2, spend: 0 };
    const dur = 1800;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setCounters({
        pages: Math.round(e * target.pages),
        watches: Math.round(e * target.watches),
        live: Math.round(e * target.live),
        spend: Math.round(e * target.spend),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        const m: Record<string, ViewId> = {
          "1": "overview", "2": "analytics", "3": "watchlists", "4": "changes",
          "5": "brief", "6": "documents", "7": "insights", "8": "newsletter",
          "9": "market", k: "ai", ",": "settings", n: "new",
        };
        const v = m[e.key.toLowerCase()];
        if (v) { e.preventDefault(); setView(v); }
      } else if (e.key === "Escape") {
        if (configuring) setConfiguring(false);
        else if (view === "new") setView("overview");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { clearInterval(clock); clearInterval(relative); window.removeEventListener("keydown", onKey); };
  }, [configuring, view, hasLive, live.selectedCounters]);

  const scheduleNextScan = useCallback(() => {
    const ms = intervalToMs(scanSettings.interval, scanSettings.unit);
    setNextScanAt(Date.now() + ms);
  }, [scanSettings.interval, scanSettings.unit]);

  useEffect(() => {
    scheduleNextScan();
  }, [scheduleNextScan]);

  const runCompanyScrape = useCallback(async (companyId: string, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setRunning(companyId);
      setScraping(true);
    }
    try {
      const res = await fetch(`/api/companies/${companyId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scrape failed");
      recordScanRun();
      setScanRunsToday(getScanRunsToday());
      scheduleNextScan();
      if (data.dashboard) {
        setDashboards((prev) => {
          const next = prev.filter((d) => d.company.id !== companyId);
          next.unshift(data.dashboard as CompanyDashboard);
          return next;
        });
      } else {
        await refreshCompanies(companyId);
      }
    } catch (err) {
      if (!silent) setApiError(err instanceof Error ? err.message : "Scrape failed");
    } finally {
      if (!silent) {
        setScraping(false);
        setRunning(null);
      }
    }
  }, [refreshCompanies, scheduleNextScan]);

  useEffect(() => {
    if (!hasLive || !selectedCompanyId) return;
    const ms = intervalToMs(scanSettings.interval, scanSettings.unit);
    const timer = setInterval(() => {
      if (getScanRunsToday() >= scanSettings.maxPerDay) return;
      if (scraping || running) return;
      runCompanyScrape(selectedCompanyId, { silent: true });
    }, ms);
    return () => clearInterval(timer);
  }, [hasLive, selectedCompanyId, scanSettings.interval, scanSettings.unit, scanSettings.maxPerDay, scraping, running, runCompanyScrape]);

  const addCompany = useCallback(async () => {
    const input = companyInput.trim();
    if (!input) return;
    setScraping(true);
    setApiError(null);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add company");
      setCompanyInput("");
      await refreshCompanies(data.company?.id ?? null);
      setView("overview");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to add company");
    } finally {
      setScraping(false);
    }
  }, [companyInput, refreshCompanies]);

  const animSpend = `$${(counters.spend / 100).toFixed(2)}`;

  const mockWatchlists = useMemo(() => WATCHES.map((w) => {
    const m = meter(w.pct, 10);
    const busy = running === w.id;
    const isLive = w.status === "live";
    return {
      ...w,
      glyph: isLive ? "●" : "▌",
      glyphColor: isLive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
      glyphSize: isLive ? "9px" : "11px",
      glyphAnim: isLive ? "pulse 2.4s infinite" : "none",
      statusColor: isLive ? "rgba(255,255,255,0.48)" : "rgba(255,255,255,0.28)",
      fill: m.fill,
      track: m.track,
      spendStr: `$${w.spend.toFixed(2)}`,
      budgetStr: `$${w.budget.toFixed(2)}`,
      scanning: busy,
      runLabel: busy ? "···" : "run →",
      runColor: busy ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.65)",
      onRun: () => setView("new"),
    };
  }), [running, setView]);

  const allWatchlists = useMemo(() => {
    const cadence = scanScheduleLabel;
    if (!hasLive) {
      return mockWatchlists.map((w) => ({ ...w, cadence, lastRunAgo: "—" }));
    }
    return live.watchlists.map((w) => ({
      ...w,
      cadence,
      lastRunAgo: formatTimeAgo(w.lastScrapedAt, now),
      scanning: running === w.id || w.scanning,
      runLabel: running === w.id || w.scanning ? "···" : "run →",
      onRun: () => runCompanyScrape(w.id),
    }));
  }, [hasLive, live.watchlists, mockWatchlists, now, running, runCompanyScrape, scanScheduleLabel]);

  const watchlists = useMemo(() => {
    const cadence = scanScheduleLabel;
    if (!hasLive) {
      return mockWatchlists
        .filter((w) => !selectedCompanyId || w.id === selectedCompanyId)
        .map((w) => ({ ...w, cadence, lastRunAgo: "—" }));
    }
    const list = live.watchlists.filter((w) => w.id === selectedCompanyId);
    return list.map((w) => ({
      ...w,
      cadence,
      lastRunAgo: formatTimeAgo(w.lastScrapedAt, now),
      scanning: running === w.id || w.scanning,
      runLabel: running === w.id || w.scanning ? "···" : "run →",
      onRun: () => runCompanyScrape(w.id),
    }));
  }, [hasLive, live.watchlists, live.selectedCompany, mockWatchlists, now, running, runCompanyScrape, scanScheduleLabel, selectedCompanyId]);

  const mockTypeBars = useMemo(() => {
    const W = 14;
    const maxT = Math.max(...INTEL_TYPE_BARS.map(([, c]) => c), 1);
    return INTEL_TYPE_BARS.map(([t, c]) => {
      const f = Math.round((c / maxT) * W);
      return { label: t.toUpperCase(), color: TYPE_COLOR[t] || "rgba(255,255,255,0.6)", count: c, fill: "█".repeat(f), track: "░".repeat(W - f) };
    });
  }, []);

  const typeBarsData = hasLive && live.typeBarsData.length > 0 ? live.typeBarsData : mockTypeBars;

  const mockCompanyIntelBars = useMemo(() => {
    const W = 14;
    const maxT = Math.max(...INTEL_TYPE_BARS.map(([, c]) => c), 1);
    return INTEL_TYPE_BARS.map(([t, c]) => {
      const f = Math.round((c / maxT) * W);
      return { label: t.toUpperCase(), color: TYPE_COLOR[t] || "rgba(255,255,255,0.6)", count: c, fill: "█".repeat(f), track: "░".repeat(W - f) };
    });
  }, []);

  const companyIntelBars = hasLive && live.companyIntelBars.length > 0 ? live.companyIntelBars : mockCompanyIntelBars;

  const activityChartData = useMemo(() => {
    if (hasLive && live.activity.length > 0) {
      return buildRolling14DayActivity(live.activity);
    }
    return buildRolling14DayActivity([], ACTIVITY.map((d) => d.count));
  }, [hasLive, live.activity]);

  const maxAct = Math.max(...activityChartData.map((d) => d.count), 1);
  const activityRows = activityChartData.map((dd) => {
    const f = Math.round((dd.count / maxAct) * 20);
    return { ...dd, fill: "█".repeat(f), track: "░".repeat(20 - f) };
  });

  const activityStats = useMemo(() => {
    const counts = activityRows.map((r) => r.count);
    const peak = Math.max(...counts, 0);
    const avg = counts.length ? (counts.reduce((a, b) => a + b, 0) / counts.length).toFixed(1) : "0";
    const trend = counts.length >= 2 && counts[counts.length - 1] > counts[counts.length - 2] ? "↑" : counts.length >= 2 && counts[counts.length - 1] < counts[counts.length - 2] ? "↓" : "→";
    return { peak, avg, trend };
  }, [activityRows]);

  const scanLog = hasLive && live.scanLog.length > 0 ? live.scanLog : SCAN_LOG;

  const lastScanAgo = formatTimeAgo(
    live.selectedLastScanAt ?? (scanLog[0] as { created_at?: string } | undefined)?.created_at,
    now
  );

  const brief = useMemo(() => {
    if (hasLive && live.brief) {
      return {
        title: live.brief.title,
        body: live.brief.body,
        sources: live.brief.sources,
        confidence: live.brief.confidence,
        date: live.brief.date,
        time: live.brief.time,
      };
    }
    if (hasLive) {
      const name = live.selectedCompany?.name ?? "Target";
      const indexed = live.selectedCompany?.pages_indexed ?? 0;
      return {
        title: `${name} — NO BRIEF YET`,
        body:
          indexed === 0
            ? `Scan failed or no pages were reachable. Use Rediscover in Settings to remap sources, then run a full scan. Dead guessed URLs (e.g. /newsletter, /ir) are now filtered automatically.`
            : `${indexed} page(s) indexed but no brief saved. Run another scan — the first pass builds baselines and writes an intel summary from investor relations, governance, and content surfaces.`,
        sources: indexed,
        confidence: 0,
        date: "—",
        time: "—",
      };
    }
    return BRIEF;
  }, [hasLive, live.brief, live.selectedCompany]);
  const confM = meter(("confidence" in brief ? brief.confidence : BRIEF.confidence), 10);

  const newsletters = useMemo(() => {
    const list = hasLive && live.newsletters.length > 0 ? live.newsletters : NEWSLETTERS;
    return list.map((n, i) => {
      const scrapedAt = "scrapedAt" in n ? (n as { scrapedAt?: string }).scrapedAt : "scraped_at" in n ? (n as { scraped_at?: string }).scraped_at : undefined;
      return {
        ...n,
        url: "url" in n ? (n as { url?: string }).url : "",
        changes: "changes" in n && Array.isArray(n.changes) ? n.changes : [],
        change0: ("changes" in n && n.changes?.[0]) || "",
        change1: ("changes" in n && n.changes?.[1]) || "",
        change2: ("changes" in n && n.changes?.[2]) || "",
        ago: formatTimeAgo(scrapedAt, relativeNow),
        animDelay: `${i * 0.08}s`,
      };
    });
  }, [hasLive, live.newsletters, relativeNow]);

  const selectedCompanyName = live.selectedCompany?.name ?? dashboards.find((d) => d.company.id === selectedCompanyId)?.company.name ?? "GOOGLE";

  const enrichChange = (c: (typeof CHANGES)[number], i: number) => ({
    ...c,
    summary: c.summary,
    bullets: c.bullets ?? [],
    sev: c.severity === "high" ? "▲" : c.is_baseline ? "○" : "·",
    sevColor: c.severity === "high" ? "rgba(255,255,255,0.9)" : c.is_baseline ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.28)",
    typeLabel: c.is_baseline ? "INDEXED" : c.change_type.toUpperCase(),
    color: TYPE_COLOR[c.change_type] || TYPE_COLOR.site,
    leftBorder: `inset 3px 0 0 ${c.is_baseline ? "rgba(255,255,255,0.2)" : TYPE_COLOR[c.change_type] || TYPE_COLOR.site}`,
    animDelay: `${i * 0.04}s`,
    opacity: c.is_baseline ? 0.72 : 1,
  });

  const changes = useMemo(() => {
    let list: ReturnType<typeof enrichChange>[] = [];

    if (hasLive && live.changes.length > 0) {
      list = live.changes.map((c, i) => ({
        ...c,
        ...enrichChange(
          {
            change_type: c.change_type,
            title: c.title,
            summary: c.summary,
            source_url: c.source_url,
            source_label: c.source_label,
            detected_at: c.detectedAt ?? c.detected_at,
            severity: c.severity,
            is_baseline: c.is_baseline,
            bullets: c.bullets,
          },
          i
        ),
      }));
    } else if (hasLive && live.selectedCompany?.sources?.length) {
      list = live.selectedCompany.sources.slice(0, live.selectedCompany.pages_indexed).map((url, i) =>
        enrichChange(
          {
            change_type: "site",
            title: `PAGE INDEXED — ${url.replace(/^https?:\/\//, "")}`,
            summary: "Baseline snapshot stored — run again to detect diffs",
            source_url: url,
            source_label: url,
            detected_at: live.selectedCompany!.last_scraped_at ?? new Date().toISOString(),
            severity: "low" as const,
            is_baseline: true,
            bullets: ["First index pass complete"],
          },
          i
        )
      );
    } else {
      list = CHANGES.map((c, i) => enrichChange(c, i));
    }

    return list.map((c) => ({
      ...c,
      ago: formatTimeAgo("detectedAt" in c ? (c as { detectedAt?: string }).detectedAt : "detected_at" in c ? (c as { detected_at?: string }).detected_at : undefined, relativeNow),
    }));
  }, [hasLive, live.changes, live.selectedCompany, relativeNow]);

  const changesTop = changes.slice(0, 6);
  const changesCount = changes.filter((c) => !c.is_baseline).length;

  const documents = useMemo(() => {
    const list = hasLive && live.documents.length > 0 ? live.documents : DOCUMENTS;
    return list.map((d, i) => ({
      ...d,
      url: "url" in d ? (d as { url?: string }).url : "",
      ago: formatTimeAgo("scrapedAt" in d ? (d as { scrapedAt?: string }).scrapedAt : "scraped_at" in d ? (d as { scraped_at?: string }).scraped_at : undefined, relativeNow),
      animDelay: `${i * 0.06}s`,
    }));
  }, [hasLive, live.documents, relativeNow]);

  const documentsByCategory = useMemo(() => {
    const groups = new Map<string, typeof documents>();
    for (const d of documents) {
      const cat = ("category" in d && d.category) || ("docType" in d && d.docType) || "Other";
      const key = String(cat);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(d);
    }
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [documents]);

  const INVESTOR_DOC_CATEGORIES = useMemo(
    () =>
      new Set([
        "Financial filing",
        "Investor relations",
        "Share activity",
        "Governance",
        "Material event",
        "Share offering",
        "Capital allocation",
        "Capital & spend",
        "SEC filing",
      ]),
    []
  );

  const recentDocuments = useMemo(() => {
    const ts = (d: (typeof documents)[number]) => {
      const raw =
        ("scrapedAt" in d && d.scrapedAt) ||
        ("scraped_at" in d && (d as { scraped_at?: string }).scraped_at) ||
        "";
      const t = new Date(String(raw)).getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    const isInvestorDoc = (d: (typeof documents)[number]) => {
      const cat = String(("category" in d && d.category) || "");
      const type = String(("docType" in d && d.docType) || "");
      return (
        INVESTOR_DOC_CATEGORIES.has(cat) ||
        /SEC|INVESTOR|INSIDER|PROXY|EARNINGS|FILING|SPEND|10-K|10-Q|8-K|FORM 4/i.test(type)
      );
    };
    const sorted = [...documents].sort((a, b) => ts(b) - ts(a));
    const investor = sorted.filter(isInvestorDoc);
    return (investor.length > 0 ? investor : sorted).slice(0, 5);
  }, [documents, INVESTOR_DOC_CATEGORIES]);

  const secFilings = useMemo(() => {
    return documents
      .filter((d) => {
        const cat = String(("category" in d && d.category) || "");
        const type = String(("docType" in d && d.docType) || "");
        return cat === "SEC filing" || /10-K|10-Q|8-K|DEF 14A|S-1|FORM 4|SEC/i.test(type);
      })
      .slice(0, 12);
  }, [documents]);

  const insider = useMemo(() => {
    const mockList = mockInsiderFor(selectedCompanyName);
    const list = hasLive && live.insider.length > 0 ? live.insider : mockList;
    return list.map((item, i) => ({
      ...item,
      sev: item.moveType === "DEPARTED" || item.moveType === "LAYOFF" ? "▲" : "·",
      sevColor: item.moveType === "DEPARTED" || item.moveType === "LAYOFF" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
      animDelay: `${i * 0.05}s`,
    }));
  }, [hasLive, live.insider, selectedCompanyName]);

  const blogKeywords = useMemo(() => {
    const fromMock = mockBlogKeywordsFor(selectedCompanyName);
    const fromPosts = newsletters.flatMap((n) => (n.changes ?? []).slice(0, 1)).filter(Boolean);
    const merged = [...fromMock];
    for (const kw of fromPosts.slice(0, 4)) {
      const word = kw.split(" ").slice(0, 3).join(" ");
      if (word && !merged.includes(word)) merged.push(word);
    }
    return merged.slice(0, 10);
  }, [newsletters, selectedCompanyName]);

  const nextScanIn = nextScanAt ? `in ${formatDurationUntil(nextScanAt, now)}` : null;

  const insiderTop = insider;

  const companyProfile = useMemo(
    () => getCompanyProfile(live.selectedCompany?.name, live.selectedCompany?.domain),
    [live.selectedCompany]
  );

  const sourceDirectories = useMemo(() => {
    const sources = live.selectedCompany?.sources ?? [];
    return sources.map((url) => ({ url, label: categorizeSourceUrl(url) }));
  }, [live.selectedCompany]);

  const sourceBreakdown = useMemo(
    () => buildSourceBreakdown(live.selectedCompany?.sources ?? []),
    [live.selectedCompany]
  );

  const signalCoverage = useMemo(
    () =>
      buildSignalCoverage(live.selectedCompany?.sources ?? [], {
        changes: changes.filter((c) => !c.is_baseline).length,
        documents: documents.length,
        newsletters: newsletters.length,
        insider: insider.length,
      }),
    [live.selectedCompany, changes, documents, newsletters, insider]
  );

  const keywordTrends = useMemo(
    () => buildKeywordTrends(newsletters, mockBlogKeywordsFor(selectedCompanyName)),
    [newsletters, selectedCompanyName]
  );

  const intelHighlights = useMemo(() => {
    const list = hasLive ? live.intelHighlights : [];
    return list.map((h) => ({
      ...h,
      ago: formatTimeAgo(h.scrapedAt, relativeNow),
      color:
        h.category === "valuation" ? "#A78BFA" :
        h.category === "transaction" ? "#60A5FA" :
        h.category === "leverage" ? "#E3B341" :
        h.category === "corporate_action" ? "#FC8C8C" :
        h.category === "financial" ? "#6E9BE6" :
        "rgba(255,255,255,0.55)",
      categoryLabel: h.category.replace(/_/g, " ").toUpperCase(),
    }));
  }, [hasLive, live.intelHighlights, relativeNow]);

  const intelTimeline = useMemo(() => {
    const timeline = buildIntelTimeline({
      changes,
      documents,
      insider,
      newsletters,
    });
    const fromHighlights = intelHighlights.slice(0, 8).map((h) => ({
      id: h.id,
      at: h.scrapedAt,
      type: h.category,
      typeLabel: h.categoryLabel,
      color: h.color,
      title: h.title,
      summary: h.detail,
      url: h.sourceUrl,
      severity: (h.category === "corporate_action" || h.category === "transaction" ? "high" : "med") as "high" | "med" | "low",
    }));
    const merged = [...fromHighlights, ...timeline]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 24);
    return merged.map((item) => ({
      ...item,
      ago: formatTimeAgo(item.at, relativeNow),
    }));
  }, [changes, documents, insider, newsletters, intelHighlights, relativeNow]);

  const investments = useMemo(() => {
    if (hasLive && intelHighlights.length > 0) {
      const financial = intelHighlights.filter((h) =>
        ["transaction", "valuation", "financial", "leverage"].includes(h.category)
      );
      if (financial.length > 0) {
        return financial.slice(0, 12).map((h) => ({
          type: h.categoryLabel,
          target: h.title,
          amount: h.amount ?? "—",
          company: selectedCompanyName,
          note: h.detail,
          date: h.ago,
          url: h.sourceUrl,
        }));
      }
    }
    return INVESTMENTS;
  }, [hasLive, intelHighlights, selectedCompanyName]);

  const competitorCompare = useMemo(() => {
    const rows = hasLive ? buildCompetitorCompare(dashboards) : [];
    return rows.map((r) => ({
      ...r,
      lastScanAgo: formatTimeAgo(r.lastScan, relativeNow),
    }));
  }, [hasLive, dashboards, relativeNow]);

  const stocks = STOCKS.map((s, i) => ({
    ...s,
    chgColor: s.dir === "▲" ? "#4ADE80" : s.dir === "▼" ? "#FC8C8C" : "rgba(255,255,255,0.6)",
    borderRight: i < STOCKS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
  }));

  const scanSelectedTarget = useCallback(() => {
    if (selectedCompanyId) runCompanyScrape(selectedCompanyId);
    else setView("new");
  }, [selectedCompanyId, runCompanyScrape, setView]);

  const rediscoverSelected = useCallback(async () => {
    if (!selectedCompanyId) return;
    setScraping(true);
    try {
      const res = await fetch(`/api/companies/${selectedCompanyId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rediscover: true }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Rediscover failed");
      await refreshCompanies(selectedCompanyId);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Rediscover failed");
    } finally {
      setScraping(false);
    }
  }, [selectedCompanyId, refreshCompanies]);

  function buildAskContext() {
    const dash = dashboards.find((d) => d.company.id === selectedCompanyId);
    if (!dash) return "";
    const parts: string[] = [];
    if (dash.brief?.body) parts.push(`Brief: ${dash.brief.body}`);
    for (const c of dash.changes.filter((x) => !x.is_baseline).slice(0, 5)) {
      parts.push(`Change [${c.change_type}]: ${c.title} — ${c.summary}`);
    }
    for (const d of dash.documents.slice(0, 5)) {
      parts.push(`Document [${d.doc_type}]: ${d.title} — ${d.excerpt}`);
    }
    for (const n of dash.newsletters.slice(0, 3)) {
      parts.push(`Newsletter: ${n.subject} — ${n.excerpt}`);
    }
    return parts.join("\n");
  }

  function askAnswer(q: string) {
    const l = q.toLowerCase();
    const dash = dashboards.find((d) => d.company.id === selectedCompanyId);
    const company = dash?.company;
    if (company && (l.includes(company.name.toLowerCase()) || l.includes(company.domain))) {
      const docs = dash?.documents ?? [];
      const moves = dash?.insider ?? [];
      const parts: string[] = [];
      if (docs.length) parts.push(`${docs.length} documents indexed`);
      if (moves.length) parts.push(`${moves.length} org movements tracked`);
      if (dash?.brief?.body) parts.push(dash.brief.body.slice(0, 120));
      return {
        text: parts.length ? parts.join(". ") : `No intel yet for ${company.name}. Add a target in the terminal.`,
        meta: `${dash?.company.pages_indexed ?? 0} pages · ${company.domain}`,
      };
    }
    if (l.includes("acme") || l.includes("pric")) return { text: "Acme raised Pro pricing 12% on Jun 14 and shipped an annual-discount banner.", meta: "4 sources · acme corp · confidence 82%" };
    return { text: hasLive ? `Monitoring ${dashboards.length} companies. Select one in TARGETS or ask about a specific domain.` : "Add a company in the terminal to start monitoring.", meta: "vigil" };
  }

  function agentAnswer(q: string) {
    const stage = agentStage;
    const l = q.toLowerCase();
    const urlM = q.match(/(https?:\/\/[^\s]+)|([\w-]+\.(com|io|co|net|org|ai|app|dev))/i);
    if (stage === 0) {
      const raw = urlM ? urlM[0] : q.trim();
      const display = raw.replace(/https?:\/\//, "").replace(/^www\./, "").slice(0, 40);
      return { text: `Got it — tracking ${display}. I'll discover pricing, careers, blog, and investor URLs. Adding to TARGETS now…`, meta: "target confirmed", configUpdate: { name: display, url: raw, type: "company" }, newStage: 1, deployInput: raw };
    }
    if (stage === 1) {
      const tracks = ["pricing", "careers", "site", "newsletter", "documents", "insider"];
      if (l.includes("document") || l.includes("sec") || l.includes("filing")) tracks.push("filings");
      return { text: `Monitoring ${tracks.join(", ")}. Hit deploy to index on next scheduled run.`, meta: `${tracks.length} intel tracks`, configUpdate: { signals: tracks }, newStage: 2 };
    }
    if (stage === 2) {
      return { text: "Config complete — hit [ DEPLOY WATCH ] to index now.", meta: "ready", configUpdate: { cadence: "every 6h", budget: "3.00" }, newStage: 3 };
    }
    return { text: "Watch is configured. Hit [ DEPLOY WATCH ] to activate.", meta: "", configUpdate: {}, newStage: stage };
  }

  const toggleWidget = useCallback((k: WidgetKey) => {
    setWidgets((w) => {
      const next = { ...w, [k]: !w[k] };
      try {
        localStorage.setItem("vigil-widgets", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return {
    view, setView, now, configuring, setConfiguring, widgets,
    toggleWidget,
    widgetDefs: WIDGET_DEFS,
    counters, animSpend,
    watchlists, allWatchlists, changes, changesTop, changesCount, documents, documentsByCategory, recentDocuments, secFilings, insider, insiderTop,
    typeBarsData, companyIntelBars, activityStats, lastScanAgo, brief, confFill: confM.fill, confTrack: confM.track,
    activityRows, activityChartData, scanLog, stocks, newsletters, blogKeywords, keywordTrends,
    companyProfile, sourceDirectories, sourceBreakdown, signalCoverage, intelTimeline, competitorCompare,
    intelHighlights,
    selectedCompany: live.selectedCompany,
    nextScanIn, scanRunsToday,
    sidebarWidth, setSidebarWidth,
    investments, insightTab, setInsightTab,
    fontScale, setFontScale, fs,
    openDocuments: () => {
      setView("documents");
    },
    openSec: () => {
      setView("documents");
      setInsightTab("sec");
    },
    scanSelectedTarget,
    rediscoverSelected,
    systemStatus,
    askLoading,
    companies: live.companies,
    selectedCompanyId,
    selectCompany: setSelectedCompanyId,
    markedTargetIds,
    toggleTargetMark,
    clearTargetMarks,
    deleteTargets,
    deleteMarkedTargets,
    deletingTargets,
    companyInput,
    setCompanyInput,
    addCompany,
    runCompanyScrape,
    refreshCompanies,
    hasLiveData: hasLive,
    loading,
    scraping,
    apiError,
    askInput, setAskInput, askLog,
    askSubmit: async () => {
      const q = askInput.trim();
      if (!q || askLoading) return;
      setAskLog((log) => [...log, { role: "you", text: q }]);
      setAskInput("");
      setAskLoading(true);
      const dash = dashboards.find((d) => d.company.id === selectedCompanyId);
      const companyName = dash?.company.name;
      try {
        if (systemStatus?.ai) {
          const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: q, context: buildAskContext(), company: companyName }),
          });
          const data = await res.json();
          if (res.ok && data.answer) {
            setAskLog((log) => [...log, { role: "vigil", text: data.answer, meta: `claude · ${companyName ?? "vigil"}` }]);
            return;
          }
        }
      } catch {
        /* fall through to rules */
      } finally {
        setAskLoading(false);
      }
      const a = askAnswer(q);
      setAskLog((log) => [...log, { role: "vigil", text: a.text, meta: a.meta }]);
    },
    agentInput, setAgentInput, agentLog, agentStage, agentConfig,
    agentSubmit: () => {
      const q = agentInput.trim();
      if (!q) return;
      const ans = agentAnswer(q) as ReturnType<typeof agentAnswer> & { deployInput?: string };
      setAgentLog((log) => [...log, { role: "user", text: q, meta: "" }, { role: "agent", text: ans.text, meta: ans.meta }]);
      setAgentConfig((c) => ({ ...c, ...ans.configUpdate }));
      setAgentStage(ans.newStage);
      setAgentInput("");
      if (ans.deployInput && ans.newStage === 1) {
        setCompanyInput(ans.deployInput);
      }
    },
    agentDeploy: async () => {
      const input = agentConfig.url || agentConfig.name || companyInput;
      if (input) {
        setCompanyInput(input);
        setScraping(true);
        try {
          const res = await fetch("/api/companies", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input }),
          });
          const data = await res.json();
          if (res.ok) {
            await refreshCompanies(data.company?.id ?? null);
            setAgentLog((log) => [...log, { role: "agent", text: `Watch deployed for ${data.company?.name ?? input}. Indexed ${data.discovered?.length ?? 0} sources.`, meta: "deployed ✓" }]);
          } else {
            setAgentLog((log) => [...log, { role: "agent", text: data.error ?? "Deploy failed", meta: "error" }]);
          }
        } finally {
          setScraping(false);
        }
      }
      setAgentStage(4);
    },
    nw, setNw, cadenceLabel: CADENCE[nw.cadence],
    cadenceStep: (d: number) => setNw((n) => ({ ...n, cadence: (n.cadence + d + CADENCE.length) % CADENCE.length })),
    createWatch: () => {
      if (nw.url.trim()) {
        setCompanyInput(nw.url.trim());
        addCompany();
      }
      setNw((n) => ({ ...n, created: true }));
    },
    typeColor: TYPE_COLOR,
    scanSettings,
    setScanSettings,
    scanScheduleLabel,
    scanUnits: SCAN_UNITS,
  };
}

export type VigilState = ReturnType<typeof useVigil>;
