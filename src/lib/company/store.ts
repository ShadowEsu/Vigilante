import { AGENT_CONFIG } from "@/lib/agent/config";
import * as fsStore from "./store-fs";
import * as sbStore from "./store-supabase";
import type { Company, CompanyDashboard, PageChange, ScanLogEntry } from "./types";

export { ReadOnlyStoreError } from "./store-errors";

/**
 * Persistence dispatcher.
 *
 * VIGILANTE_STORAGE=supabase (with NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY set) routes every read/write to Postgres so the app
 * works on Vercel's read-only filesystem and persists across reloads.
 *
 * Anything else falls back to the local-filesystem JSON store (store-fs.ts),
 * which is what local `npm run dev` uses.
 */
const useSupabase =
  AGENT_CONFIG.storage.mode === "supabase" && AGENT_CONFIG.storage.supabase;

const backend = useSupabase ? sbStore : fsStore;

export function storageBackend(): "supabase" | "local" {
  return useSupabase ? "supabase" : "local";
}

export const isReadOnlyStore = backend.isReadOnlyStore;
export const hashContent = backend.hashContent;

export const listCompanies = backend.listCompanies;
export const getCompany = backend.getCompany;
export const createCompany = backend.createCompany;
export const updateCompany = backend.updateCompany;
export const deleteCompany = backend.deleteCompany;

export const listDocuments = backend.listDocuments;
export const upsertDocuments = backend.upsertDocuments;

export const listInsiderMoves = backend.listInsiderMoves;
export const upsertInsiderMoves = backend.upsertInsiderMoves;

export const listNewsletters = backend.listNewsletters;
export const upsertNewsletters = backend.upsertNewsletters;

export const listIntelHighlights = backend.listIntelHighlights;
export const replaceIntelHighlights = backend.replaceIntelHighlights;

export const getLatestBrief = backend.getLatestBrief;
export const saveBrief = backend.saveBrief;

export const listScanLog = backend.listScanLog;
export const addScanLog = backend.addScanLog;

export const listChanges = backend.listChanges;
export const saveChanges = backend.saveChanges;

export const getSnapshot = backend.getSnapshot;
export const saveSnapshot = backend.saveSnapshot;

// ── Dashboard composition (backend-agnostic) ─────────────────────────────────

function buildActivity(
  scanLog: ScanLogEntry[],
  changes: PageChange[] = []
): { day: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of scanLog) {
    counts.set(s.date, (counts.get(s.date) ?? 0) + Math.max(s.findings, 1));
  }
  for (const c of changes) {
    if (c.is_baseline) continue;
    const day = new Date(c.detected_at).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }));
  }
  return days.map((day) => ({ day, count: counts.get(day) ?? 0 }));
}

export async function getCompanyDashboard(companyId: string): Promise<CompanyDashboard | null> {
  const company = await backend.getCompany(companyId);
  if (!company) return null;
  const raw = company as Company & { signal_count?: number };
  const normalized: Company = {
    ...company,
    pages_indexed: company.pages_indexed ?? raw.signal_count ?? 0,
  };
  const [documents, insider, newsletters, changes, brief, scanLog, intelHighlights] =
    await Promise.all([
      backend.listDocuments(companyId),
      backend.listInsiderMoves(companyId),
      backend.listNewsletters(companyId),
      backend.listChanges(companyId),
      backend.getLatestBrief(companyId),
      backend.listScanLog(companyId),
      backend.listIntelHighlights(companyId),
    ]);
  return {
    company: normalized,
    documents,
    insider,
    newsletters,
    changes,
    brief,
    scanLog,
    activity: buildActivity(scanLog, changes),
    intelHighlights,
  };
}

export async function getAllDashboards(): Promise<CompanyDashboard[]> {
  const companies = await backend.listCompanies();
  const dashboards = await Promise.all(companies.map((c) => getCompanyDashboard(c.id)));
  return dashboards.filter((d): d is CompanyDashboard => d !== null);
}
