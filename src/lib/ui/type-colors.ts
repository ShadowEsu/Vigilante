/** Signal / category colors from Vigilant design spec */
export const TYPE_COLOR: Record<string, string> = {
  pricing: "#E3B341",
  promo: "#D178C9",
  hiring: "#6FCF8E",
  person: "#5BC8D6",
  site: "#6E9BE6",
  company: "#6E9BE6",
  ticker: "#E3B341",
  stock: "#E3B341",
  patents: "#B48CDE",
  patent: "#B48CDE",
  newsletter: "#E8A87C",
  newsletters: "#E8A87C",
  insider: "#E07A7A",
  filing: "#6FCF8E",
  investments: "#6E9BE6",
};

export const STATUS_COLOR = {
  live: "#6FCF8E",
  paused: "#8B8B96",
  ok: "#5C5C66",
  change: "#E3B341",
  error: "#D178C9",
  connected: "#6FCF8E",
  off: "#5C5C66",
} as const;

export const ACCENT = {
  green: "#6FCF8E",
  blue: "#6E9BE6",
  gold: "#E3B341",
  pink: "#D178C9",
  cyan: "#5BC8D6",
} as const;

export function typeColor(type: string): string {
  return TYPE_COLOR[type.toLowerCase()] ?? "rgba(255,255,255,0.55)";
}

export const LIVE_COLOR = ACCENT.green;
export const HIGH_SEV_COLOR = ACCENT.gold;

export function navAccent(label: string): string {
  const map: Record<string, string> = {
    OVERVIEW: ACCENT.blue,
    ANALYTICS: ACCENT.gold,
    INSIGHTS: ACCENT.cyan,
    WATCHLISTS: ACCENT.green,
    SIGNALS: ACCENT.pink,
    "AI WATCHER": ACCENT.blue,
    "NEW TARGET": ACCENT.gold,
    SETTINGS: "#8B8B96",
  };
  return map[label] ?? "rgba(255,255,255,0.55)";
}
