export type IntelCategory =
  | "valuation"
  | "financial"
  | "transaction"
  | "leverage"
  | "corporate_action"
  | "pricing"
  | "activity";

export interface ExtractedIntel {
  category: IntelCategory;
  title: string;
  detail: string;
  amount?: string;
}

const MONEY = /\$[\d,.]+(?:\s?(?:billion|million|trillion|B|M|T|bn|mn))?|\b[\d,.]+\s?(?:billion|million|trillion)\s+(?:dollars|USD)\b/gi;

const PATTERNS: { category: IntelCategory; re: RegExp; label: string }[] = [
  { category: "valuation", re: /\b(market\s+cap|valuation|enterprise\s+value|worth)\b[^.]{0,120}/gi, label: "Valuation" },
  { category: "financial", re: /\b(revenue|earnings|profit|net\s+income|ARR|MRR|EBITDA|free\s+cash\s+flow)\b[^.]{0,140}/gi, label: "Financials" },
  { category: "transaction", re: /\b(acqui(?:red|sition|re)|merger|funding\s+round|raised|investment\s+of|IPO|buyout|deal\s+worth)\b[^.]{0,140}/gi, label: "Transaction" },
  { category: "leverage", re: /\b(debt|leverage|credit\s+facility|bond\s+issuance|loan|borrowings)\b[^.]{0,120}/gi, label: "Leverage" },
  { category: "corporate_action", re: /\b(share\s+repurchase|buyback|dividend|layoff|restructur|spin-?off|split|CEO|CFO|appointed|resigned)\b[^.]{0,140}/gi, label: "Corporate action" },
  { category: "activity", re: /\b(announced|launched|partnership|expanded|opened|closed|signed)\b[^.]{0,120}/gi, label: "Activity" },
];

/**
 * Navigation chrome, cookie banners and CTA strips share the page's text layer
 * with real prose. Left in, they match the keyword patterns above and surface
 * as intel — a nav bar containing the word "Revenue" became a "financial"
 * highlight reading "Revenue Products Solutions Developers Resources Pricing
 * Sign in Contact sales". These phrases mark a span as chrome.
 */
const BOILERPLATE = [
  "sign in", "sign up", "log in", "logout", "contact sales", "start now",
  "get started", "talk to sales", "book a demo", "request a demo", "guide me",
  "skip to content", "back to top", "cookie", "privacy policy",
  "terms of service", "all rights reserved", "subscribe", "newsletter",
  "follow us", "download the app", "accept all", "manage preferences",
  "change region", "select language", "site map", "sitemap",
];

/** Words that reliably appear in real sentences but not in nav item lists. */
const FUNCTION_WORDS = /\b(the|a|an|of|to|in|for|with|and|or|is|are|was|were|has|have|had|its|it|on|by|from|that|this|which|will|would|been|be|as|at|than|their|our)\b/gi;

const PRICING_CONTEXT = /\b(per\s+(?:month|year|user|seat|unit|transaction|1,?000|request|token)|\/\s?(?:mo|yr|month|year|user|seat)|billed\s+(?:monthly|annually|yearly)|pricing|price|plan|tier|subscription|free\s+trial|starts?\s+at|starting\s+at|\d\s?%\s*\+)\b/i;

function firstMoney(text: string): string | undefined {
  MONEY.lastIndex = 0;
  const m = MONEY.exec(text);
  if (!m) return undefined;

  // The extraction window can cut a figure in half, turning "$1.2 billion"
  // into "$1" — which then gets reported as the amount. If the match runs to
  // the end of a span that never reached sentence punctuation, it is a
  // fragment, not a figure.
  const endsAtCutoff = m.index + m[0].length >= text.length;
  if (endsAtCutoff && !/[.!?]\s*$/.test(text)) return undefined;

  return m[0].trim();
}

/** Approximate USD magnitude of a money string, for separating unit prices from corporate figures. */
function moneyMagnitude(amount: string): number {
  const num = Number(amount.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num)) return 0;
  const lower = amount.toLowerCase();
  if (/tr(illion)?\b|\bt\b/.test(lower)) return num * 1e12;
  if (/b(illion|n)?\b/.test(lower)) return num * 1e9;
  if (/m(illion|n)?\b/.test(lower)) return num * 1e6;
  return num;
}

function cleanSentence(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 220);
}

function countMatches(s: string, re: RegExp): number {
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`);
  return (s.match(r) ?? []).length;
}

/**
 * True when a span reads like a real sentence rather than a strip of UI labels.
 * Nav blobs carry no periods, so sentence splitting hands them over whole —
 * they have to be rejected on shape instead.
 */
function looksLikeProse(s: string): boolean {
  const lower = s.toLowerCase();
  if (BOILERPLATE.some((p) => lower.includes(p))) return false;

  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 6) return false;

  // Real prose leans on function words; nav lists barely use them.
  if (countMatches(s, FUNCTION_WORDS) < 2) return false;

  // Long runs of Capitalised Words are menus ("Products Solutions Developers").
  let run = 0;
  for (const w of words) {
    if (/^[A-Z][a-zA-Z]/.test(w)) {
      run++;
      if (run >= 5) return false;
    } else {
      run = 0;
    }
  }

  const capitalised = words.filter((w) => /^[A-Z]/.test(w)).length;
  if (capitalised / words.length > 0.55) return false;

  return true;
}

/**
 * Financial claims are only intel if they carry a figure. Vendor marketing
 * reuses the vocabulary constantly — "Increase revenue with selective retries
 * powered by machine learning" matched the `financial` pattern and surfaced as
 * a competitor's financials. Requiring money, a percentage, or a magnitude
 * keeps the reported numbers and drops the sales copy. Narrative categories
 * (corporate_action, activity, pricing) legitimately have no figure.
 */
const NUMERIC_EVIDENCE = /\$[\d,.]+|\b\d+(?:\.\d+)?\s?%|\b\d[\d,.]*\s?(?:billion|million|trillion|bn|mn)\b|\bQ[1-4]\s?\d{2,4}\b|\bFY\s?\d{2,4}\b/i;

function hasNumericEvidence(category: IntelCategory, sentence: string): boolean {
  if (category === "corporate_action" || category === "activity" || category === "pricing") {
    return true;
  }
  return NUMERIC_EVIDENCE.test(sentence);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 400);
}

export function extractIntelFromText(text: string, sourceLabel: string): ExtractedIntel[] {
  const found: ExtractedIntel[] = [];
  const seen = new Set<string>();

  // Split once against the full text so matches land on real sentence
  // boundaries. The old approach windowed ±20/+80 chars around each keyword,
  // which usually sliced through the middle of a sentence and produced
  // fragments like "revenue officer June 22, 2026 Product Stripe equips...".
  const allSentences = splitSentences(text);

  for (const { category, re, label } of PATTERNS) {
    let count = 0;
    for (const raw of allSentences) {
      if (count >= 4) break;
      re.lastIndex = 0;
      if (!re.test(raw)) continue;

      const sentence = cleanSentence(raw);
      const key = `${category}-${sentence.slice(0, 60)}`;
      if (seen.has(key) || sentence.length < 24) continue;
      if (!looksLikeProse(sentence)) continue;
      if (!hasNumericEvidence(category, sentence)) continue;
      seen.add(key);
      count++;

      const amount = firstMoney(sentence);
      found.push({
        category,
        title: amount ? `${label} · ${amount}` : label,
        detail: sentence,
        amount,
      });
    }
  }

  for (const sentence of allSentences.slice(0, 40)) {
    const amount = firstMoney(sentence);
    if (!amount) continue;
    if (!looksLikeProse(sentence)) continue;

    const lower = sentence.toLowerCase();
    const isPricing = PRICING_CONTEXT.test(sentence);
    const magnitude = moneyMagnitude(amount);

    let category: IntelCategory;
    if (/acqui|merger|raised|funding|deal|invest/.test(lower)) category = "transaction";
    else if (/market cap|valuation|worth/.test(lower)) category = "valuation";
    else if (/debt|leverage|credit|bond/.test(lower)) category = "leverage";
    else if (/buyback|repurchase|dividend|layoff|appoint|resign/.test(lower)) category = "corporate_action";
    else if (isPricing) category = "pricing";
    else if (magnitude > 0 && magnitude < 1000) {
      // A bare "$0.01" with no pricing context is a unit price stripped of its
      // surroundings, not a corporate financial. Reporting it as one is noise.
      continue;
    } else category = "financial";

    const key = `${category}-${sentence.slice(0, 60)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      category,
      title: `${sourceLabel} · ${amount}`,
      detail: cleanSentence(sentence),
      amount,
    });
    if (found.length >= 24) break;
  }

  return found.slice(0, 20);
}
