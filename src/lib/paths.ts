/** Prefix for fetch/API paths when hosted under a subpath (e.g. GitHub Pages). */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isStaticGithubPages(): boolean {
  return process.env.NEXT_PUBLIC_GITHUB_PAGES === "true";
}
