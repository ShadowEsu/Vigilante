import { createHash, randomUUID } from "crypto";
import { createServiceClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Company,
  CompanyBrief,
  CompanyDocument,
  InsiderMove,
  IntelHighlight,
  NewsletterPost,
  PageChange,
  PageSnapshot,
  ScanLogEntry,
} from "./types";

/**
 * Production persistence backend (VIGILANTE_STORAGE=supabase).
 *
 * Mirrors the exported surface of store-fs.ts, but writes to Postgres via the
 * service-role key instead of the local filesystem — so it works on Vercel's
 * read-only serverless FS and survives page reloads / cold starts.
 *
 * Tables are defined in supabase/migrations/003_vigilante_intel.sql.
 */

let client: SupabaseClient | null = null;
function sb(): SupabaseClient {
  if (!client) client = createServiceClient();
  return client;
}

const T = {
  companies: "vigil_companies",
  documents: "vigil_documents",
  insider: "vigil_insider_moves",
  newsletters: "vigil_newsletters",
  intel: "vigil_intel_highlights",
  briefs: "vigil_briefs",
  scanLog: "vigil_scan_log",
  snapshots: "vigil_snapshots",
  changes: "vigil_changes",
} as const;

function fail(context: string, error: { message: string } | null): never {
  throw new Error(`Supabase ${context} failed: ${error?.message ?? "unknown error"}`);
}

// Postgres numeric columns can come back as strings — coerce the money/score fields.
function normalizeCompany(row: Record<string, unknown>): Company {
  return {
    ...(row as unknown as Company),
    spend_usd: Number(row.spend_usd ?? 0),
    budget_usd: Number(row.budget_usd ?? 0),
    pages_indexed: Number(row.pages_indexed ?? 0),
    sources: Array.isArray(row.sources) ? (row.sources as string[]) : [],
  };
}

function normalizeBrief(row: Record<string, unknown>): CompanyBrief {
  return {
    ...(row as unknown as CompanyBrief),
    confidence: Number(row.confidence ?? 0),
    sources: Number(row.sources ?? 0),
  };
}

// Filesystem store never throws read-only here — Postgres is always writable.
export function isReadOnlyStore(): boolean {
  return false;
}

export function hashContent(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

// ── Companies ────────────────────────────────────────────────────────────────

export async function listCompanies(): Promise<Company[]> {
  const { data, error } = await sb()
    .from(T.companies)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) fail("listCompanies", error);
  return (data ?? []).map(normalizeCompany);
}

export async function getCompany(id: string): Promise<Company | null> {
  const { data, error } = await sb().from(T.companies).select("*").eq("id", id).maybeSingle();
  if (error) fail("getCompany", error);
  return data ? normalizeCompany(data) : null;
}

async function getCompanyByDomain(domain: string): Promise<Company | null> {
  const { data, error } = await sb()
    .from(T.companies)
    .select("*")
    .ilike("domain", domain)
    .limit(1)
    .maybeSingle();
  if (error) fail("getCompanyByDomain", error);
  return data ? normalizeCompany(data) : null;
}

export async function createCompany(
  data: Omit<Company, "id" | "created_at">
): Promise<Company> {
  // Onboarding the same domain twice reuses the existing target rather than
  // creating a duplicate row (a unique index on lower(domain) also enforces it).
  const existing = await getCompanyByDomain(data.domain);
  if (existing) {
    const updated = await updateCompany(existing.id, {
      sources: data.sources,
      name: data.name,
      input: data.input,
      status: data.status,
    });
    return updated ?? existing;
  }

  const { data: row, error } = await sb().from(T.companies).insert(data).select("*").single();
  if (error) {
    // Lost a race on the unique index — fetch and return the winner.
    if (error.code === "23505") {
      const winner = await getCompanyByDomain(data.domain);
      if (winner) return winner;
    }
    fail("createCompany", error);
  }
  return normalizeCompany(row!);
}

export async function updateCompany(
  id: string,
  patch: Partial<Company>
): Promise<Company | null> {
  const { id: _omitId, created_at: _omitCreated, ...clean } = patch;
  void _omitId;
  void _omitCreated;
  const { data, error } = await sb()
    .from(T.companies)
    .update(clean)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) fail("updateCompany", error);
  return data ? normalizeCompany(data) : null;
}

export async function deleteCompany(id: string): Promise<boolean> {
  // Child rows are removed by ON DELETE CASCADE.
  const { data, error } = await sb().from(T.companies).delete().eq("id", id).select("id");
  if (error) fail("deleteCompany", error);
  return (data ?? []).length > 0;
}

// ── Documents ────────────────────────────────────────────────────────────────

export async function listDocuments(companyId: string): Promise<CompanyDocument[]> {
  const { data, error } = await sb()
    .from(T.documents)
    .select("*")
    .eq("company_id", companyId)
    .order("scraped_at", { ascending: false });
  if (error) fail("listDocuments", error);
  return (data ?? []) as CompanyDocument[];
}

export async function upsertDocuments(
  docs: Omit<CompanyDocument, "id">[]
): Promise<CompanyDocument[]> {
  if (docs.length === 0) return [];
  const now = new Date().toISOString();
  const rows = docs.map((d) => ({ ...d, id: randomUUID(), scraped_at: now }));
  const { data, error } = await sb()
    .from(T.documents)
    .upsert(rows, { onConflict: "company_id,url,doc_type" })
    .select("*");
  if (error) fail("upsertDocuments", error);
  return (data ?? []) as CompanyDocument[];
}

// ── Insider moves ────────────────────────────────────────────────────────────

export async function listInsiderMoves(companyId: string): Promise<InsiderMove[]> {
  const { data, error } = await sb()
    .from(T.insider)
    .select("*")
    .eq("company_id", companyId)
    .order("scraped_at", { ascending: false });
  if (error) fail("listInsiderMoves", error);
  return (data ?? []) as InsiderMove[];
}

export async function upsertInsiderMoves(
  moves: Omit<InsiderMove, "id">[]
): Promise<InsiderMove[]> {
  if (moves.length === 0) return [];
  const companyId = moves[0].company_id;
  const existing = await listInsiderMoves(companyId);
  const toInsert: (Omit<InsiderMove, "id"> & { id: string })[] = [];
  const result: InsiderMove[] = [];
  for (const move of moves) {
    const match = existing.find(
      (m) => m.company_id === move.company_id && m.role === move.role && m.move_type === move.move_type
    );
    if (match) {
      const { data } = await sb()
        .from(T.insider)
        .update({ ...move, scraped_at: new Date().toISOString() })
        .eq("id", match.id)
        .select("*")
        .maybeSingle();
      if (data) result.push(data as InsiderMove);
    } else {
      toInsert.push({ ...move, id: randomUUID() });
    }
  }
  if (toInsert.length > 0) {
    const { data, error } = await sb().from(T.insider).insert(toInsert).select("*");
    if (error) fail("upsertInsiderMoves", error);
    result.push(...((data ?? []) as InsiderMove[]));
  }
  return result;
}

// ── Newsletters ──────────────────────────────────────────────────────────────

export async function listNewsletters(companyId: string): Promise<NewsletterPost[]> {
  const { data, error } = await sb()
    .from(T.newsletters)
    .select("*")
    .eq("company_id", companyId)
    .order("scraped_at", { ascending: false });
  if (error) fail("listNewsletters", error);
  return (data ?? []) as NewsletterPost[];
}

export async function upsertNewsletters(
  posts: Omit<NewsletterPost, "id">[]
): Promise<NewsletterPost[]> {
  if (posts.length === 0) return [];
  const companyId = posts[0].company_id;
  const existing = await listNewsletters(companyId);
  const toInsert: (Omit<NewsletterPost, "id"> & { id: string })[] = [];
  const result: NewsletterPost[] = [];
  for (const post of posts) {
    const match = existing.find(
      (p) => p.company_id === post.company_id && (p.url === post.url || p.subject === post.subject)
    );
    if (match) {
      const { data } = await sb()
        .from(T.newsletters)
        .update({ ...post, scraped_at: new Date().toISOString() })
        .eq("id", match.id)
        .select("*")
        .maybeSingle();
      if (data) result.push(data as NewsletterPost);
    } else {
      toInsert.push({ ...post, id: randomUUID() });
    }
  }
  if (toInsert.length > 0) {
    const { data, error } = await sb().from(T.newsletters).insert(toInsert).select("*");
    if (error) fail("upsertNewsletters", error);
    result.push(...((data ?? []) as NewsletterPost[]));
  }
  return result;
}

// ── Intel highlights ─────────────────────────────────────────────────────────

export async function listIntelHighlights(companyId: string): Promise<IntelHighlight[]> {
  const { data, error } = await sb()
    .from(T.intel)
    .select("*")
    .eq("company_id", companyId)
    .order("scraped_at", { ascending: false });
  if (error) fail("listIntelHighlights", error);
  return (data ?? []) as IntelHighlight[];
}

export async function replaceIntelHighlights(
  companyId: string,
  highlights: Omit<IntelHighlight, "id" | "company_id">[]
): Promise<IntelHighlight[]> {
  const del = await sb().from(T.intel).delete().eq("company_id", companyId);
  if (del.error) fail("replaceIntelHighlights(delete)", del.error);
  if (highlights.length === 0) return [];
  const now = new Date().toISOString();
  const rows = highlights.map((h) => ({
    ...h,
    id: randomUUID(),
    company_id: companyId,
    amount: h.amount ?? null,
    scraped_at: h.scraped_at ?? now,
  }));
  const { data, error } = await sb().from(T.intel).insert(rows).select("*");
  if (error) fail("replaceIntelHighlights(insert)", error);
  return (data ?? []) as IntelHighlight[];
}

// ── Briefs ───────────────────────────────────────────────────────────────────

export async function getLatestBrief(companyId: string): Promise<CompanyBrief | null> {
  const { data, error } = await sb()
    .from(T.briefs)
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("getLatestBrief", error);
  return data ? normalizeBrief(data) : null;
}

export async function saveBrief(brief: Omit<CompanyBrief, "id">): Promise<CompanyBrief> {
  const { data, error } = await sb().from(T.briefs).insert(brief).select("*").single();
  if (error) fail("saveBrief", error);
  return normalizeBrief(data!);
}

// ── Scan log ─────────────────────────────────────────────────────────────────

export async function listScanLog(companyId: string): Promise<ScanLogEntry[]> {
  const { data, error } = await sb()
    .from(T.scanLog)
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) fail("listScanLog", error);
  return (data ?? []) as ScanLogEntry[];
}

export async function addScanLog(entry: Omit<ScanLogEntry, "id">): Promise<ScanLogEntry> {
  const { data, error } = await sb().from(T.scanLog).insert(entry).select("*").single();
  if (error) fail("addScanLog", error);
  return data as ScanLogEntry;
}

// ── Changes ──────────────────────────────────────────────────────────────────

export async function listChanges(companyId: string): Promise<PageChange[]> {
  const { data, error } = await sb()
    .from(T.changes)
    .select("*")
    .eq("company_id", companyId)
    .order("detected_at", { ascending: false });
  if (error) fail("listChanges", error);
  return (data ?? []) as PageChange[];
}

export async function saveChanges(changes: Omit<PageChange, "id">[]): Promise<PageChange[]> {
  if (changes.length === 0) return [];
  const { data, error } = await sb().from(T.changes).insert(changes).select("*");
  if (error) fail("saveChanges", error);
  return (data ?? []) as PageChange[];
}

// ── Snapshots ────────────────────────────────────────────────────────────────

export async function getSnapshot(
  companyId: string,
  sourceUrl: string
): Promise<PageSnapshot | null> {
  const { data, error } = await sb()
    .from(T.snapshots)
    .select("*")
    .eq("company_id", companyId)
    .eq("source_url", sourceUrl)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("getSnapshot", error);
  return data ? (data as PageSnapshot) : null;
}

export async function saveSnapshot(snapshot: PageSnapshot): Promise<void> {
  const { error } = await sb().from(T.snapshots).insert(snapshot);
  if (error) fail("saveSnapshot", error);
}
