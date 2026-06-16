import { fetchPageHtml } from "./newsletter";

export interface ExtractedDocument {
  title: string;
  docType: string;
  category: string;
  url: string;
  excerpt: string;
}

const DOC_PATTERNS: { re: RegExp; type: string; category: string }[] = [
  { re: /10-?k|annual report/i, type: "SEC 10-K", category: "Financial filing" },
  { re: /10-?q|quarterly report/i, type: "SEC 10-Q", category: "Financial filing" },
  { re: /8-?k|current report/i, type: "SEC 8-K", category: "Material event" },
  { re: /s-?1|prospectus/i, type: "SEC S-1", category: "Share offering" },
  { re: /investor presentation|investor deck/i, type: "INVESTOR DECK", category: "Investor relations" },
  { re: /earnings call|earnings transcript/i, type: "EARNINGS", category: "Investor relations" },
  { re: /proxy statement|def 14a/i, type: "PROXY", category: "Governance" },
  { re: /share repurchase|stock buyback/i, type: "SHARE BUYBACK", category: "Capital allocation" },
  { re: /form 4|insider trading|insider purchase/i, type: "INSIDER FILING", category: "Share activity" },
  { re: /budget|spending plan|capital expenditure|capex/i, type: "SPEND REPORT", category: "Capital & spend" },
];

function resolveUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).href.split("#")[0];
  } catch {
    return null;
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractDocumentsFromText(
  text: string,
  sourceUrl: string,
  companyName: string
): ExtractedDocument[] {
  const found: ExtractedDocument[] = [];
  const seen = new Set<string>();

  for (const { re, type, category } of DOC_PATTERNS) {
    if (!re.test(text)) continue;
    const key = `${type}-${sourceUrl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const match = text.match(new RegExp(`.{0,60}${re.source}.{0,80}`, "i"));
    found.push({
      title: match ? match[0].trim().slice(0, 120) : `${companyName} — ${type}`,
      docType: type,
      category,
      url: sourceUrl,
      excerpt: match?.[0]?.trim().slice(0, 160) ?? `${type} referenced on monitored page`,
    });
  }

  return found.slice(0, 12);
}

export function extractDocumentsFromHtml(
  html: string,
  sourceUrl: string,
  companyName: string,
  plainText?: string
): ExtractedDocument[] {
  const found = extractDocumentsFromText(plainText ?? stripTags(html), sourceUrl, companyName);
  const seen = new Set(found.map((d) => d.url + d.docType));

  const anchorRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRe.exec(html)) !== null) {
    const href = match[1];
    const label = stripTags(match[2]).slice(0, 120);
    if (label.length < 4) continue;
    const resolved = resolveUrl(sourceUrl, href);
    if (!resolved) continue;

    const lower = `${label} ${resolved}`.toLowerCase();
    let docType = "LINK";
    let category = "Public document";

    if (/\.pdf/i.test(resolved) || /\.pdf/i.test(label)) {
      docType = "PDF";
      category = "Public document";
    } else if (/10-?k|annual/i.test(lower)) {
      docType = "SEC 10-K";
      category = "Financial filing";
    } else if (/10-?q|quarterly/i.test(lower)) {
      docType = "SEC 10-Q";
      category = "Financial filing";
    } else if (/8-?k/i.test(lower)) {
      docType = "SEC 8-K";
      category = "Material event";
    } else if (/form 4|insider/i.test(lower)) {
      docType = "INSIDER FILING";
      category = "Share activity";
    } else if (/investor|presentation|deck|earnings/i.test(lower)) {
      docType = "INVESTOR DECK";
      category = "Investor relations";
    } else if (/proxy|def 14a/i.test(lower)) {
      docType = "PROXY";
      category = "Governance";
    } else if (/capex|spend|budget|financial/i.test(lower)) {
      docType = "SPEND REPORT";
      category = "Capital & spend";
    } else if (!/investor|financial|filing|report|sec|pdf|annual|quarter/i.test(lower)) {
      continue;
    }

    const key = `${docType}-${resolved}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      title: label || resolved.split("/").pop() || "Document",
      docType,
      category,
      url: resolved,
      excerpt: `Linked from ${new URL(sourceUrl).hostname}`,
    });
    if (found.length >= 20) break;
  }

  return found;
}

export async function fetchAndExtractDocuments(
  sourceUrl: string,
  companyName: string,
  plainText: string
): Promise<ExtractedDocument[]> {
  try {
    const html = await fetchPageHtml(sourceUrl);
    return extractDocumentsFromHtml(html, sourceUrl, companyName, plainText);
  } catch {
    return extractDocumentsFromText(plainText, sourceUrl, companyName);
  }
}

export function isDocumentUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("investor") ||
    u.includes("/ir/") ||
    u.includes("sec.gov") ||
    u.includes("/financial") ||
    u.includes("/filings") ||
    u.includes("/annual") ||
    u.includes("/reports")
  );
}
