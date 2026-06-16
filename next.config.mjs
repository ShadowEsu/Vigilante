/** @type {import('next').NextConfig} */
const isGithubPages =
  process.env.GITHUB_PAGES === "true" && process.env.NODE_ENV !== "development";
const repoBase = process.env.GITHUB_PAGES_BASE_PATH || "/Vigilante";
const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      ...(isDev ? [] : ["upgrade-insecure-requests"]),
    ].join("; "),
  },
  ...(isDev
    ? []
    : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: repoBase,
        assetPrefix: repoBase.endsWith("/") ? repoBase : `${repoBase}/`,
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  env: {
    NEXT_PUBLIC_GITHUB_PAGES: isGithubPages ? "true" : "false",
    NEXT_PUBLIC_BASE_PATH: isGithubPages ? repoBase : "",
  },
  poweredByHeader: false,
  ...(!isGithubPages
    ? {
        async headers() {
          return [{ source: "/:path*", headers: securityHeaders }];
        },
      }
    : {}),
};

export default nextConfig;
