import { createHash } from "crypto";
import { BlockedUrlError, safeFetch } from "@/lib/security/ssrf";

const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; VigilantBot/1.0; +https://vigilant.app)",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

export async function probeUrl(url: string): Promise<boolean> {
  try {
    const head = await safeFetch(url, {
      method: "HEAD",
      headers: FETCH_HEADERS,
      timeoutMs: 8_000,
    });
    if (head.ok) return true;
    if (head.status === 405 || head.status === 403) {
      return probeUrlWithGet(url);
    }
    if (head.status === 404 || head.status === 410) return false;
    if (head.status >= 400) return probeUrlWithGet(url);
    return true;
  } catch (err) {
    // A blocked (SSRF) target is never "reachable" — do not retry it with GET.
    if (err instanceof BlockedUrlError) return false;
    return probeUrlWithGet(url);
  }
}

async function probeUrlWithGet(url: string): Promise<boolean> {
  try {
    const res = await safeFetch(url, {
      headers: FETCH_HEADERS,
      timeoutMs: 12_000,
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("text/html") || ct.includes("text/plain") || ct.includes("application/json")) {
      return true;
    }
    return res.ok;
  } catch {
    return false;
  }
}

export { BlockedUrlError } from "@/lib/security/ssrf";

/** Keep only URLs that respond — used during discovery to drop guessed 404 paths. */
export async function filterReachableUrls(urls: string[], maxConcurrent = 6): Promise<string[]> {
  const unique = Array.from(new Set(urls));
  const ok: string[] = [];
  for (let i = 0; i < unique.length; i += maxConcurrent) {
    const batch = unique.slice(i, i + maxConcurrent);
    const checks = await Promise.all(
      batch.map(async (url) => ({ url, reachable: await probeUrl(url) }))
    );
    ok.push(...checks.filter((c) => c.reachable).map((c) => c.url));
  }
  return ok;
}

export async function fetchPageText(url: string): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await safeFetch(url, {
        headers: FETCH_HEADERS,
        timeoutMs: 30_000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const text = extractReadableText(html);
      if (text.length < 80 && attempt === 0) {
        await sleep(400);
        continue;
      }
      return text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error("Fetch failed");
      if (attempt === 0) await sleep(500);
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError?.message ?? "unknown"}`);
}

export function hashContent(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractReadableText(html: string): string {
  let text = html;

  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Prefer title and meta description for context
  const title = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
  const metaDesc = text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "";

  text = text.replace(/<[^>]+>/g, " ");

  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");

  text = text.replace(/\s+/g, " ").trim();

  const prefix = [title, metaDesc].filter(Boolean).join(" — ");
  const body = prefix ? `${prefix}. ${text}` : text;

  return body.slice(0, 14_000);
}
