export interface Company {
  id: string;
  name: string;
  domain: string;
  input: string;
  sources: string[];
  status: "live" | "paused" | "scanning";
  spend_usd: number;
  budget_usd: number;
  /** Pages indexed on last full scan */
  pages_indexed: number;
  last_scraped_at: string | null;
  created_at: string;
}

export interface CompanyDocument {
  id: string;
  company_id: string;
  title: string;
  doc_type: string;
  category: string;
  url: string;
  excerpt: string;
  scraped_at: string;
}

export interface InsiderMove {
  id: string;
  company_id: string;
  person: string;
  role: string;
  move_type: string;
  note: string;
  date: string;
  scraped_at: string;
  source_url?: string;
}

export interface NewsletterPost {
  id: string;
  company_id: string;
  name: string;
  subject: string;
  url: string;
  excerpt: string;
  changes: string[];
  received: string;
  scraped_at: string;
}

export interface CompanyBrief {
  id: string;
  company_id: string;
  title: string;
  body: string;
  confidence: number;
  sources: number;
  created_at: string;
}

export type IntelHighlightCategory =
  | "valuation"
  | "financial"
  | "transaction"
  | "leverage"
  | "corporate_action"
  | "activity";

export interface IntelHighlight {
  id: string;
  company_id: string;
  category: IntelHighlightCategory;
  title: string;
  detail: string;
  amount?: string;
  source_url: string;
  source_label: string;
  scraped_at: string;
}

export interface ScanLogEntry {
  id: string;
  company_id: string;
  date: string;
  time: string;
  watch: string;
  findings: number;
  ms: string;
  cost: string;
  created_at: string;
}

export interface PageSnapshot {
  company_id: string;
  source_url: string;
  content_hash: string;
  raw_text: string;
  fetched_at: string;
}

export type ChangeType = "pricing" | "promo" | "hiring" | "site" | "newsletter" | "document";

export interface PageChange {
  id: string;
  company_id: string;
  source_url: string;
  source_label: string;
  change_type: ChangeType;
  title: string;
  summary: string;
  bullets: string[];
  severity: "high" | "med" | "low";
  is_baseline: boolean;
  hash_before: string | null;
  hash_after: string;
  detected_at: string;
}

export interface CompanyDashboard {
  company: Company;
  documents: CompanyDocument[];
  insider: InsiderMove[];
  newsletters: NewsletterPost[];
  changes: PageChange[];
  brief: CompanyBrief | null;
  scanLog: ScanLogEntry[];
  activity: { day: string; count: number }[];
  intelHighlights: IntelHighlight[];
}

export interface CreateCompanyResult {
  ok: boolean;
  company?: Company;
  error?: string;
  discovered?: string[];
  steps?: string[];
  run?: RunCompanyResult;
}

export interface RunCompanyResult {
  ok: boolean;
  steps: string[];
  newslettersFound?: number;
  documentsFound?: number;
  insiderMovesFound?: number;
  sourcesScraped?: number;
  changesFound?: number;
  briefGenerated?: boolean;
  error?: string;
}
