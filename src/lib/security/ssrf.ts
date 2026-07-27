import { lookup } from "dns/promises";
import { isIP } from "net";

/**
 * SSRF protection for outbound fetches of user-supplied URLs.
 *
 * Vigilante fetches arbitrary company URLs on the server. Without validation
 * that turns the deployment into an open proxy into the private network and
 * cloud metadata service. We therefore:
 *   1. allow only http(s) and reject embedded credentials,
 *   2. resolve the hostname and reject any resolved IP that is private,
 *      loopback, link-local (incl. 169.254.169.254 metadata), CGNAT, etc.,
 *   3. re-validate every redirect hop (redirect: "manual").
 */

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 5_000_000; // 5 MB cap per page

export class BlockedUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlockedUrlError";
  }
}

function ipToLong(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = value * 256 + n;
  }
  return value >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const long = ipToLong(ip);
  if (long === null) return true; // unparseable → treat as unsafe
  const inRange = (base: string, maskBits: number) => {
    const baseLong = ipToLong(base)!;
    const mask = maskBits === 0 ? 0 : (0xffffffff << (32 - maskBits)) >>> 0;
    return (long & mask) === (baseLong & mask);
  };
  return (
    inRange("0.0.0.0", 8) || // "this" network
    inRange("10.0.0.0", 8) || // private
    inRange("100.64.0.0", 10) || // CGNAT
    inRange("127.0.0.0", 8) || // loopback
    inRange("169.254.0.0", 16) || // link-local (incl. 169.254.169.254 metadata)
    inRange("172.16.0.0", 12) || // private
    inRange("192.0.0.0", 24) || // IETF protocol assignments
    inRange("192.0.2.0", 24) || // TEST-NET-1
    inRange("192.168.0.0", 16) || // private
    inRange("198.18.0.0", 15) || // benchmarking
    inRange("198.51.100.0", 24) || // TEST-NET-2
    inRange("203.0.113.0", 24) || // TEST-NET-3
    inRange("224.0.0.0", 4) || // multicast
    inRange("240.0.0.0", 4) // reserved / broadcast
  );
}

function isPrivateIPv6(raw: string): boolean {
  const ip = raw.toLowerCase().split("%")[0]; // drop zone id
  if (ip === "::1" || ip === "::" || ip === "0:0:0:0:0:0:0:1") return true;
  // IPv4-mapped / -compatible: ::ffff:a.b.c.d or ::a.b.c.d
  const mapped = ip.match(/(?:::ffff:|::)(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  const first = ip.split(":")[0] ?? "";
  const head = parseInt(first || "0", 16);
  if (Number.isNaN(head)) return true;
  if ((head & 0xfe00) === 0xfc00) return true; // fc00::/7 unique-local
  if ((head & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
  if ((head & 0xffc0) === 0xfec0) return true; // fec0::/10 site-local (deprecated)
  if ((head & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) return isPrivateIPv6(ip);
  return true; // not a literal IP → treat as unsafe
}

/**
 * Validate a URL and its resolved IPs. Throws BlockedUrlError when the target
 * is not a safe, public http(s) endpoint. Returns the parsed URL.
 */
export async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new BlockedUrlError("invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new BlockedUrlError(`blocked protocol: ${url.protocol}`);
  }
  if (url.username || url.password) {
    throw new BlockedUrlError("credentials in URL are not allowed");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (!host) throw new BlockedUrlError("missing host");

  const lowered = host.toLowerCase();
  if (lowered === "localhost" || lowered.endsWith(".localhost") || lowered.endsWith(".internal")) {
    throw new BlockedUrlError(`blocked host: ${host}`);
  }

  // Literal IP in the URL — check directly (no DNS needed).
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new BlockedUrlError(`blocked private IP: ${host}`);
    return url;
  }

  // Resolve every address the hostname maps to and reject if any is private.
  let addresses: { address: string }[];
  try {
    addresses = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new BlockedUrlError(`DNS resolution failed for ${host}`);
  }
  if (addresses.length === 0) throw new BlockedUrlError(`no DNS records for ${host}`);
  for (const { address } of addresses) {
    if (isPrivateAddress(address)) {
      throw new BlockedUrlError(`${host} resolves to blocked IP ${address}`);
    }
  }
  return url;
}

export interface SafeFetchOptions {
  headers?: Record<string, string>;
  method?: string;
  timeoutMs?: number;
  maxBytes?: number;
}

/**
 * fetch() replacement that validates the target (and every redirect hop) with
 * assertPublicUrl before connecting. Redirects are followed manually so each
 * Location is re-validated — `redirect: "follow"` would let a public URL bounce
 * to an internal one.
 */
export async function safeFetch(
  rawUrl: string,
  opts: SafeFetchOptions = {}
): Promise<Response> {
  const { headers, method = "GET", timeoutMs = 15_000, maxBytes = MAX_RESPONSE_BYTES } = opts;
  let currentUrl = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicUrl(currentUrl);
    const res = await fetch(currentUrl, {
      method,
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });

    // Manual redirect handling with per-hop revalidation.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res;
      if (hop === MAX_REDIRECTS) throw new BlockedUrlError("too many redirects");
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    // Guard against oversized bodies (billing / memory).
    const len = Number(res.headers.get("content-length") ?? "0");
    if (len && len > maxBytes) {
      throw new BlockedUrlError(`response too large (${len} bytes)`);
    }
    return res;
  }
  throw new BlockedUrlError("too many redirects");
}
