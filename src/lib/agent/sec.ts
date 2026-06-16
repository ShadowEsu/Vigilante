/**
 * SEC EDGAR integration — free public API, no key required.
 * https://www.sec.gov/edgar/sec-api-documentation
 */

export interface SecFiling {
  form: string;
  filed: string;
  title: string;
  url: string;
  accession: string;
}

const SEC_HEADERS = {
  "User-Agent": "Vigilant Intelligence vigil@vigilant.app",
  Accept: "application/json",
};

let tickerCache: Record<string, { cik_str: number; ticker: string; title: string }> | null = null;

async function loadTickers(): Promise<typeof tickerCache> {
  if (tickerCache) return tickerCache;
  try {
    const res = await fetch("https://www.sec.gov/files/company_tickers.json", {
      headers: SEC_HEADERS,
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as Record<string, { cik_str: number; ticker: string; title: string }>;
    tickerCache = data;
    return data;
  } catch {
    return {};
  }
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Resolve CIK from company name or ticker symbol. */
export async function resolveCik(companyName: string, domain?: string): Promise<{ cik: string; ticker: string; name: string } | null> {
  const tickers = await loadTickers();
  if (!tickers || Object.keys(tickers).length === 0) return null;

  const slug = normalizeName(companyName);
  const domainSlug = domain ? normalizeName(domain.split(".")[0]) : "";

  for (const entry of Object.values(tickers)) {
    const tSlug = normalizeName(entry.ticker);
    const titleSlug = normalizeName(entry.title);
    if (tSlug === slug || titleSlug.includes(slug) || slug.includes(tSlug)) {
      return { cik: String(entry.cik_str).padStart(10, "0"), ticker: entry.ticker, name: entry.title };
    }
    if (domainSlug && (titleSlug.includes(domainSlug) || domainSlug.includes(tSlug))) {
      return { cik: String(entry.cik_str).padStart(10, "0"), ticker: entry.ticker, name: entry.title };
    }
  }
  return null;
}

/** Recent SEC filings for a public company. */
export async function fetchRecentFilings(companyName: string, domain?: string, limit = 8): Promise<SecFiling[]> {
  const resolved = await resolveCik(companyName, domain);
  if (!resolved) return [];

  try {
    const res = await fetch(`https://data.sec.gov/submissions/CIK${resolved.cik}.json`, {
      headers: SEC_HEADERS,
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as {
      name?: string;
      filings?: {
        recent?: {
          accessionNumber?: string[];
          filingDate?: string[];
          form?: string[];
          primaryDocument?: string[];
          primaryDocDescription?: string[];
        };
      };
    };

    const recent = data.filings?.recent;
    if (!recent?.form?.length) return [];

    const out: SecFiling[] = [];
    const n = Math.min(recent.form.length, limit * 2);
    const priority = new Set(["10-K", "10-Q", "8-K", "DEF 14A", "S-1", "4", "10-K/A", "10-Q/A"]);

    for (let i = 0; i < n && out.length < limit; i++) {
      const form = recent.form[i] ?? "";
      if (!priority.has(form) && !/10-|8-K|DEF|S-1|FORM 4/i.test(form)) continue;

      const accession = (recent.accessionNumber?.[i] ?? "").replace(/-/g, "");
      const primary = recent.primaryDocument?.[i] ?? "";
      const cikNum = resolved.cik.replace(/^0+/, "");
      const url = accession && primary
        ? `https://www.sec.gov/Archives/edgar/data/${cikNum}/${accession}/${primary}`
        : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${resolved.cik}&type=${encodeURIComponent(form)}`;

      out.push({
        form,
        filed: recent.filingDate?.[i] ?? "",
        title: recent.primaryDocDescription?.[i] || `${resolved.ticker} — ${form}`,
        url,
        accession: recent.accessionNumber?.[i] ?? "",
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function secEdgarSearchUrl(ticker: string): string {
  return `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(ticker)}&type=&dateb=&owner=include&count=40`;
}
