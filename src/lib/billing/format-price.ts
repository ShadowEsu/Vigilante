/** Numeric pricing display — e.g. $10/mo, $0/mo */

export function formatUsdMonthly(amount: number): string {
  const n = Math.round(amount * 100) / 100;
  if (n === 0) return "$0/mo";
  const label = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `$${label}/mo`;
}

export function formatUsd(amount: number): string {
  const n = Math.round(amount * 100) / 100;
  const label = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return `$${label}`;
}

export function maskEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at < 1) return "your inbox";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const masked =
    local.length <= 2
      ? `${local[0] ?? ""}*`
      : `${local[0]}${"*".repeat(Math.min(3, local.length - 2))}${local.slice(-1)}`;
  return `${masked}@${domain}`;
}
