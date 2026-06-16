export type IntelCategory =
  | "valuation"
  | "financial"
  | "transaction"
  | "leverage"
  | "corporate_action"
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

function firstMoney(text: string): string | undefined {
  const m = text.match(MONEY);
  return m?.[0]?.trim();
}

function cleanSentence(s: string): string {
  return s.replace(/\s+/g, " ").trim().slice(0, 220);
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

  for (const { category, re, label } of PATTERNS) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    let count = 0;
    while ((match = re.exec(text)) !== null && count < 4) {
      const start = Math.max(0, match.index - 20);
      const chunk = text.slice(start, match.index + match[0].length + 80);
      const sentences = splitSentences(chunk);
      const sentence = cleanSentence(sentences.find((s) => re.test(s)) ?? match[0]);
      re.lastIndex = match.index + 1;

      const key = `${category}-${sentence.slice(0, 60)}`;
      if (seen.has(key) || sentence.length < 24) continue;
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

  for (const sentence of splitSentences(text).slice(0, 40)) {
    const amount = firstMoney(sentence);
    if (!amount) continue;
    const lower = sentence.toLowerCase();
    let category: IntelCategory = "financial";
    if (/acqui|merger|raised|funding|deal|invest/.test(lower)) category = "transaction";
    else if (/market cap|valuation|worth/.test(lower)) category = "valuation";
    else if (/debt|leverage|credit|bond/.test(lower)) category = "leverage";
    else if (/buyback|repurchase|dividend|layoff|appoint|resign/.test(lower)) category = "corporate_action";

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
