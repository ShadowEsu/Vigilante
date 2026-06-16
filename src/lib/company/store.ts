import { createHash, randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  Company,
  CompanyBrief,
  CompanyDashboard,
  CompanyDocument,
  InsiderMove,
  IntelHighlight,
  NewsletterPost,
  PageChange,
  PageSnapshot,
  ScanLogEntry,
} from "./types";

const DATA_DIR = path.join(process.cwd(), ".data", "vigil");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePath(name: string) {
  return path.join(DATA_DIR, name);
}

async function readJson<T>(name: string, fallback: T): Promise<T> {
  await ensureDir();
  try {
    const raw = await fs.readFile(filePath(name), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(name: string, data: unknown) {
  await ensureDir();
  await fs.writeFile(filePath(name), JSON.stringify(data, null, 2), "utf8");
}

export async function listCompanies(): Promise<Company[]> {
  const companies = await readJson<Company[]>("companies.json", []);
  return companies.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function getCompany(id: string): Promise<Company | null> {
  const companies = await listCompanies();
  return companies.find((c) => c.id === id) ?? null;
}

export async function createCompany(data: Omit<Company, "id" | "created_at">): Promise<Company> {
  const companies = await listCompanies();
  const company: Company = {
    ...data,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  companies.unshift(company);
  await writeJson("companies.json", companies);
  return company;
}

export async function updateCompany(id: string, patch: Partial<Company>): Promise<Company | null> {
  const companies = await listCompanies();
  const idx = companies.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  companies[idx] = { ...companies[idx], ...patch };
  await writeJson("companies.json", companies);
  return companies[idx];
}

export async function deleteCompany(id: string): Promise<boolean> {
  const companies = await listCompanies();
  const next = companies.filter((c) => c.id !== id);
  if (next.length === companies.length) return false;
  await writeJson("companies.json", next);
  for (const file of ["documents", "insider", "newsletters", "briefs", "scan-log", "snapshots", "changes", "intel-highlights"] as const) {
    const items = await readJson<Record<string, unknown>[]>(`${file}.json`, []);
    await writeJson(
      `${file}.json`,
      items.filter((item) => (item as { company_id?: string }).company_id !== id)
    );
  }
  return true;
}

async function listByCompany<T extends { company_id: string }>(
  file: string,
  companyId: string
): Promise<T[]> {
  const items = await readJson<T[]>(file, []);
  return items
    .filter((item) => item.company_id === companyId)
    .sort((a, b) => {
      const aDate = (a as { created_at?: string; scraped_at?: string }).created_at
        ?? (a as { scraped_at?: string }).scraped_at
        ?? "";
      const bDate = (b as { created_at?: string; scraped_at?: string }).created_at
        ?? (b as { scraped_at?: string }).scraped_at
        ?? "";
      return bDate.localeCompare(aDate);
    });
}

export async function listDocuments(companyId: string): Promise<CompanyDocument[]> {
  return listByCompany<CompanyDocument>("documents.json", companyId);
}

export async function upsertDocuments(docs: Omit<CompanyDocument, "id">[]): Promise<CompanyDocument[]> {
  const all = await readJson<CompanyDocument[]>("documents.json", []);
  const created: CompanyDocument[] = [];
  for (const doc of docs) {
    const existing = all.find(
      (d) => d.company_id === doc.company_id && (d.url === doc.url && d.doc_type === doc.doc_type)
    );
    if (existing) {
      Object.assign(existing, doc, { scraped_at: new Date().toISOString() });
      created.push(existing);
    } else {
      const item: CompanyDocument = { ...doc, id: randomUUID() };
      all.unshift(item);
      created.push(item);
    }
  }
  await writeJson("documents.json", all);
  return created;
}

export async function listInsiderMoves(companyId: string): Promise<InsiderMove[]> {
  return listByCompany<InsiderMove>("insider.json", companyId);
}

export async function upsertInsiderMoves(moves: Omit<InsiderMove, "id">[]): Promise<InsiderMove[]> {
  const all = await readJson<InsiderMove[]>("insider.json", []);
  const created: InsiderMove[] = [];
  for (const move of moves) {
    const existing = all.find(
      (m) => m.company_id === move.company_id && m.role === move.role && m.move_type === move.move_type
    );
    if (existing) {
      Object.assign(existing, move, { scraped_at: new Date().toISOString() });
      created.push(existing);
    } else {
      const item: InsiderMove = { ...move, id: randomUUID() };
      all.unshift(item);
      created.push(item);
    }
  }
  await writeJson("insider.json", all);
  return created;
}

export async function listNewsletters(companyId: string): Promise<NewsletterPost[]> {
  return listByCompany<NewsletterPost>("newsletters.json", companyId);
}

export async function upsertNewsletters(posts: Omit<NewsletterPost, "id">[]): Promise<NewsletterPost[]> {
  const all = await readJson<NewsletterPost[]>("newsletters.json", []);
  const created: NewsletterPost[] = [];
  for (const post of posts) {
    const existing = all.find(
      (p) => p.company_id === post.company_id && (p.url === post.url || p.subject === post.subject)
    );
    if (existing) {
      Object.assign(existing, post, { scraped_at: new Date().toISOString() });
      created.push(existing);
    } else {
      const item: NewsletterPost = { ...post, id: randomUUID() };
      all.unshift(item);
      created.push(item);
    }
  }
  await writeJson("newsletters.json", all);
  return created;
}

export async function listIntelHighlights(companyId: string): Promise<IntelHighlight[]> {
  return listByCompany<IntelHighlight>("intel-highlights.json", companyId);
}

export async function replaceIntelHighlights(
  companyId: string,
  highlights: Omit<IntelHighlight, "id" | "company_id">[]
): Promise<IntelHighlight[]> {
  const all = await readJson<IntelHighlight[]>("intel-highlights.json", []);
  const rest = all.filter((h) => h.company_id !== companyId);
  const now = new Date().toISOString();
  const created: IntelHighlight[] = highlights.map((h) => ({
    ...h,
    id: randomUUID(),
    company_id: companyId,
    scraped_at: h.scraped_at ?? now,
  }));
  await writeJson("intel-highlights.json", [...created, ...rest].slice(0, 2000));
  return created;
}

export async function getLatestBrief(companyId: string): Promise<CompanyBrief | null> {
  const briefs = await listByCompany<CompanyBrief>("briefs.json", companyId);
  return briefs[0] ?? null;
}

export async function saveBrief(brief: Omit<CompanyBrief, "id">): Promise<CompanyBrief> {
  const all = await readJson<CompanyBrief[]>("briefs.json", []);
  const item: CompanyBrief = { ...brief, id: randomUUID() };
  all.unshift(item);
  await writeJson("briefs.json", all);
  return item;
}

export async function listScanLog(companyId: string): Promise<ScanLogEntry[]> {
  return listByCompany<ScanLogEntry>("scan-log.json", companyId);
}

export async function addScanLog(entry: Omit<ScanLogEntry, "id">): Promise<ScanLogEntry> {
  const all = await readJson<ScanLogEntry[]>("scan-log.json", []);
  const item: ScanLogEntry = { ...entry, id: randomUUID() };
  all.unshift(item);
  await writeJson("scan-log.json", all);
  return item;
}

export async function listChanges(companyId: string): Promise<PageChange[]> {
  return listByCompany<PageChange>("changes.json", companyId);
}

export async function saveChanges(changes: Omit<PageChange, "id">[]): Promise<PageChange[]> {
  if (changes.length === 0) return [];
  const all = await readJson<PageChange[]>("changes.json", []);
  const created: PageChange[] = changes.map((c) => ({ ...c, id: randomUUID() }));
  all.unshift(...created);
  if (all.length > 800) all.length = 800;
  await writeJson("changes.json", all);
  return created;
}

export async function getSnapshot(
  companyId: string,
  sourceUrl: string
): Promise<PageSnapshot | null> {
  const all = await readJson<PageSnapshot[]>("snapshots.json", []);
  const matches = all
    .filter((s) => s.company_id === companyId && s.source_url === sourceUrl)
    .sort((a, b) => b.fetched_at.localeCompare(a.fetched_at));
  return matches[0] ?? null;
}

export async function saveSnapshot(snapshot: PageSnapshot): Promise<void> {
  const all = await readJson<PageSnapshot[]>("snapshots.json", []);
  all.unshift(snapshot);
  if (all.length > 500) all.length = 500;
  await writeJson("snapshots.json", all);
}

export function hashContent(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

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
  const company = await getCompany(companyId);
  if (!company) return null;
  const raw = company as Company & { signal_count?: number };
  const normalized: Company = {
    ...company,
    pages_indexed: company.pages_indexed ?? raw.signal_count ?? 0,
  };
  const documents = await listDocuments(companyId);
  const insider = await listInsiderMoves(companyId);
  const newsletters = await listNewsletters(companyId);
  const changes = await listChanges(companyId);
  const brief = await getLatestBrief(companyId);
  const scanLog = await listScanLog(companyId);
  const intelHighlights = await listIntelHighlights(companyId);
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
  const companies = await listCompanies();
  const dashboards = await Promise.all(companies.map((c) => getCompanyDashboard(c.id)));
  return dashboards.filter((d): d is CompanyDashboard => d !== null);
}
