import { createHash } from "crypto";
import { isDocumentUrl } from "./documents";
import { isCareersUrl } from "./insider";
import { isNewsletterUrl } from "./newsletter";

export type ChangeType = "pricing" | "promo" | "hiring" | "site" | "newsletter" | "document";

export function pathLabel(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname === "/" ? u.hostname : `${u.hostname}${u.pathname}`.slice(0, 56);
  } catch {
    return url.slice(0, 56);
  }
}

/** Strip noise so hash compares meaningful body content only */
export function normalizePageContent(text: string): string {
  let t = text
    .replace(/\b(cookie|privacy policy|terms of service|subscribe to our newsletter)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return t.slice(0, 10_000);
}

export function hashNormalizedContent(text: string): string {
  return createHash("sha256").update(normalizePageContent(text), "utf8").digest("hex");
}

function extractPrices(text: string): string[] {
  return Array.from(text.matchAll(/\$[\d,]+(?:\.\d{2})?/g)).map((m) => m[0]);
}

export function computeChangeBullets(oldText: string, newText: string): string[] {
  const bullets: string[] = [];

  const oldPrices = extractPrices(oldText);
  const newPrices = extractPrices(newText);
  const addedPrices = newPrices.filter((p) => !oldPrices.includes(p));
  const removedPrices = oldPrices.filter((p) => !newPrices.includes(p));
  if (addedPrices.length > 0) {
    bullets.push(`New price points: ${addedPrices.slice(0, 4).join(", ")}`);
  }
  if (removedPrices.length > 0) {
    bullets.push(`Removed price points: ${removedPrices.slice(0, 4).join(", ")}`);
  }

  const oldWords = new Set(
    normalizePageContent(oldText)
      .split(/\W+/)
      .filter((w) => w.length > 4)
  );
  const newSentences = newText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);

  for (const sentence of newSentences) {
    const words = sentence.toLowerCase().split(/\W+/);
    const novel = words.filter((w) => w.length > 4 && !oldWords.has(w)).length;
    if (novel >= 3) {
      bullets.push(sentence.slice(0, 140));
    }
    if (bullets.length >= 4) break;
  }

  const oldLen = oldText.split(/\s+/).length;
  const newLen = newText.split(/\s+/).length;
  const delta = newLen - oldLen;
  if (Math.abs(delta) > 40) {
    bullets.push(
      delta > 0
        ? `Page grew ~${delta} words since last snapshot`
        : `Page shrank ~${Math.abs(delta)} words since last snapshot`
    );
  }

  return bullets.length > 0 ? bullets.slice(0, 5) : ["Content updated on monitored page"];
}

export function classifyChangeType(url: string, text: string, bullets: string[]): ChangeType {
  const u = url.toLowerCase();
  const blob = `${text} ${bullets.join(" ")}`.toLowerCase();

  if (u.includes("pricing") || u.includes("/plans") || u.includes("/price")) return "pricing";
  if (/\$[\d,]+/.test(bullets.join(" "))) return "pricing";
  if (isCareersUrl(url) || u.includes("/jobs") || u.includes("careers")) return "hiring";
  if (/hiring|open role|job opening|we're hiring/.test(blob)) return "hiring";
  if (isNewsletterUrl(url)) return "newsletter";
  if (isDocumentUrl(url) || /10-k|investor|filing|sec/.test(u)) return "document";
  if (/discount|promo|sale|\d+% off|limited time/.test(blob)) return "promo";
  return "site";
}

function severityFor(type: ChangeType, isBaseline: boolean): "high" | "med" | "low" {
  if (isBaseline) return "low";
  if (type === "pricing" || type === "promo") return "high";
  if (type === "hiring" || type === "document") return "med";
  return "med";
}

export interface DetectedPageChange {
  change_type: ChangeType;
  title: string;
  summary: string;
  bullets: string[];
  severity: "high" | "med" | "low";
  is_baseline: boolean;
  hash_before: string | null;
  hash_after: string;
}

export function detectPageChange(
  sourceUrl: string,
  oldText: string | null,
  newText: string,
  _companyName: string
): DetectedPageChange | null {
  const hashAfter = hashNormalizedContent(newText);
  const label = pathLabel(sourceUrl);

  if (!oldText) {
    const wordCount = newText.split(/\s+/).filter(Boolean).length;
    const change_type = classifyChangeType(sourceUrl, newText, []);
    return {
      change_type,
      title: `Page indexed — ${label}`,
      summary: `Baseline snapshot stored (${wordCount} words)`,
      bullets: [`Monitoring started on ${label}`],
      severity: "low",
      is_baseline: true,
      hash_before: null,
      hash_after: hashAfter,
    };
  }

  const hashBefore = hashNormalizedContent(oldText);
  if (hashBefore === hashAfter) return null;

  const bullets = computeChangeBullets(oldText, newText);
  const change_type = classifyChangeType(sourceUrl, newText, bullets);

  return {
    change_type,
    title: `${change_type.toUpperCase()} change — ${label}`,
    summary: bullets[0] ?? "Page content changed",
    bullets,
    severity: severityFor(change_type, false),
    is_baseline: false,
    hash_before: hashBefore,
    hash_after: hashAfter,
  };
}
