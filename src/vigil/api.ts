/** Parse a fetch response as JSON; surface HTML/error pages as readable messages. */
export async function fetchJson<T extends Record<string, unknown>>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  const res = await fetch(url, init);
  const text = await res.text();
  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    const isHtml = /^\s*</.test(text);
    const hint = isHtml
      ? "Server returned HTML instead of JSON — restart with: npm run dev, then open http://localhost:3000/preview"
      : text.slice(0, 160) || "Invalid server response";
    throw new Error(hint);
  }
  return { ok: res.ok, status: res.status, data };
}
