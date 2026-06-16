/** Prefix for fetch/API paths when hosted under a subpath (e.g. GitHub Pages). */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isStaticGithubPages(): boolean {
  return process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
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
  return isStaticGithubPages() ? withBasePath("/preview") : withBasePath("/app");
}
