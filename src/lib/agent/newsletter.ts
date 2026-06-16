import { fetchPageText } from "./fetch";

export interface ExtractedPost {
  title: string;
  url: string;
  excerpt: string;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function resolveUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).href.split("#")[0];
  } catch {
    return null;
  }
}

export async function extractNewsletterPosts(
  pageUrl: string,
  companyName: string,
  html?: string
): Promise<ExtractedPost[]> {
  let rawHtml = html;
  if (!rawHtml) {
    try {
      const response = await fetch(pageUrl, {
        headers: { "User-Agent": "VigilBot/1.0", Accept: "text/html" },
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) return [];
      rawHtml = await response.text();
    } catch {
      return [];
    }
  }

  const posts: ExtractedPost[] = [];
  const seen = new Set<string>();

  const linkRe = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]{8,200}?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(rawHtml)) !== null) {
    const href = match[1];
    const text = stripTags(match[2]);
    if (text.length < 12 || text.length > 140) continue;
    if (/^(read more|learn more|subscribe|sign up|home|about|contact)$/i.test(text)) continue;
    const resolved = resolveUrl(pageUrl, href);
    if (!resolved || seen.has(resolved)) continue;
    if (!resolved.includes(new URL(pageUrl).hostname)) continue;
    seen.add(resolved);
    posts.push({
      title: `${companyName} Update`,
      url: resolved,
      excerpt: text,
    });
    if (posts.length >= 8) break;
  }

  const hRe = /<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi;
  while ((match = hRe.exec(rawHtml)) !== null) {
    const text = stripTags(match[1]);
    if (text.length < 10 || text.length > 120) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    posts.push({
      title: `${companyName} Digest`,
      url: pageUrl,
      excerpt: text,
    });
    if (posts.length >= 10) break;
  }

  return posts.slice(0, 6);
}

export async function summarizeChanges(
  oldText: string,
  newText: string
): Promise<string[]> {
  const oldWords = new Set(oldText.toLowerCase().split(/\W+/).filter((w) => w.length > 4));
  const newSentences = newText.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
  const novel = newSentences
    .filter((s) => {
      const words = s.toLowerCase().split(/\W+/);
      const newWordCount = words.filter((w) => w.length > 4 && !oldWords.has(w)).length;
      return newWordCount >= 3;
    })
    .slice(0, 3)
    .map((s) => s.slice(0, 120));
  return novel.length > 0 ? novel : ["Content updated on monitored page"];
}

export function isNewsletterUrl(url: string): boolean {
  const u = url.toLowerCase();
  return (
    u.includes("/blog") ||
    u.includes("/news") ||
    u.includes("/newsletter") ||
    u.includes("/press") ||
    u.includes("/updates") ||
    u.includes("/articles")
  );
}

export async function fetchPageHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "User-Agent": "VigilBot/1.0", Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

export { fetchPageText };
