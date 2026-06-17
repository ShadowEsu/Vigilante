/** Prefix for fetch(), `<a href>`, and absolute URLs — not for Next.js `<Link>` / router. */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Path for Next.js `<Link>` and `router` — basePath is applied automatically. */
export function appPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function isStaticGithubPages(): boolean {
  return process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
}

/** Live demo target — full app locally, homepage demo on static GitHub Pages. */
export function demoPath(): string {
  return isStaticGithubPages() ? "/#product" : "/preview";
}

/** Magic-link return URL — must match Supabase Auth → URL Configuration → Redirect URLs. */
export function getAuthCallbackUrl(): string {
  const path = withBasePath("/auth/callback");
  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${site}${path}`;
}

export function defaultPostAuthPath(): string {
  return isStaticGithubPages() ? appPath("/preview") : appPath("/app");
}
