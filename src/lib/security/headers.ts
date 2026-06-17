/** Standard HTTP security headers for Vigilante (Next.js server + middleware). */
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
};

/** CSP tuned for static export + Supabase auth/waitlist. */
export function contentSecurityPolicy(isDev: boolean): string {
  const connect = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://formsubmit.co",
  ];
  if (isDev) connect.push("http://localhost:*", "ws://localhost:*");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self' https://formsubmit.co",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connect.join(" ")}`,
    "upgrade-insecure-requests",
  ].join("; ");
}

export function applySecurityHeaders(headers: Headers, isDev = false): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
  headers.set("Content-Security-Policy", contentSecurityPolicy(isDev));
  if (!isDev) {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
}
