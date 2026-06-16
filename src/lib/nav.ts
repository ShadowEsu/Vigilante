export const NAV_ITEMS = [
  { href: "", idx: "01", label: "OVERVIEW", hint: "⌘1" },
  { href: "/analytics", idx: "02", label: "ANALYTICS", hint: "⌘2" },
  { href: "/insights", idx: "03", label: "INSIGHTS", hint: "⌘3" },
  { href: "/agents", idx: "04", label: "WATCHLISTS", hint: "⌘4" },
  { href: "/signals", idx: "05", label: "SIGNALS", hint: "⌘5" },
  { href: "/agent", idx: "06", label: "AI WATCHER", hint: "⌘6" },
  { href: "/new", idx: "07", label: "NEW TARGET", hint: "⌘N" },
  { href: "/settings", idx: "08", label: "SETTINGS", hint: "⌘," },
] as const;

export function navPageTitle(pathname: string, basePath: string): string {
  const rest = pathname.replace(basePath, "").replace(/^\//, "");
  if (!rest) return "OVERVIEW";
  const segment = rest.split("/")[0];
  const match = NAV_ITEMS.find((n) => n.href === `/${segment}` || (segment === "" && n.href === ""));
  return match?.label ?? "OVERVIEW";
}

export function navIsActive(pathname: string, basePath: string, href: string): boolean {
  const full = `${basePath}${href}`;
  if (href === "") return pathname === basePath || pathname === `${basePath}/`;
  return pathname === full || pathname.startsWith(`${full}/`);
}
