import { filterReachableUrls } from "./fetch";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

const SEARCH_QUERIES = (company: string, domain: string) => [
  `${company} official website`,
  `site:${domain} pricing plans`,
  `site:${domain} careers jobs hiring`,
  `site:${domain} blog news press newsroom`,
  `site:${domain} investor relations IR annual report`,
  `site:${domain} governance proxy board`,
  `site:${domain} SEC filing 10-K 10-Q`,
  `site:${domain} trust security compliance`,
  `site:${domain} about company`,
];

const REVIEW_QUERIES = (company: string) => [
  `"${company}" site:g2.com reviews`,
  `"${company}" site:trustpilot.com`,
];

const DISCOVERY_QUERIES = (input: string) => [
  `${input} official website`,
  `"${input}" company`,
  `${input} startup`,
  `${input} crunchbase`,
  `${input} site:.io OR site:.co OR site:.ai`,
];

/** Curated sources for brands where blind /pricing /news paths 404. */
const KNOWN_BRANDS: Record<string, { domain: string; sources: string[] }> = {
  google: {
    domain: "google.com",
    sources: [
      "https://about.google/",
      "https://blog.google/",
      "https://careers.google.com/",
      "https://investor.google.com/",
      "https://abc.xyz/investor/",
    ],
  },
  alphabet: {
    domain: "google.com",
    sources: [
      "https://about.google/",
      "https://blog.google/",
      "https://investor.google.com/",
      "https://abc.xyz/investor/",
    ],
  },
  microsoft: {
    domain: "microsoft.com",
    sources: [
      "https://www.microsoft.com/en-us/investor",
      "https://blogs.microsoft.com/",
      "https://careers.microsoft.com/",
      "https://www.microsoft.com/en-us/about",
      "https://www.microsoft.com/en-us/newsroom",
    ],
  },
  stripe: {
    domain: "stripe.com",
    sources: [
      "https://stripe.com/pricing",
      "https://stripe.com/blog",
      "https://stripe.com/newsroom",
      "https://stripe.com/jobs",
      "https://stripe.com/docs",
    ],
  },
  apple: {
    domain: "apple.com",
    sources: [
      "https://investor.apple.com/",
      "https://www.apple.com/newsroom/",
      "https://www.apple.com/careers/us/",
    ],
  },
  amazon: {
    domain: "amazon.com",
    sources: [
      "https://ir.aboutamazon.com/",
      "https://www.aboutamazon.com/news",
      "https://www.amazon.jobs/",
    ],
  },
  meta: {
    domain: "meta.com",
    sources: [
      "https://investor.atmeta.com/",
      "https://about.meta.com/news/",
      "https://www.metacareers.com/",
    ],
  },
  netflix: {
    domain: "netflix.com",
    sources: [
      "https://ir.netflix.net/",
      "https://about.netflix.com/",
      "https://jobs.netflix.com/",
    ],
  },
};

export async function searchWeb(query: string, limit = 5): Promise<SearchResult[]> {
  const serperKey = process.env.SERPER_API_KEY;
  if (serperKey) {
    try {
      const res = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: limit }),
        signal: AbortSignal.timeout(15_000),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          organic?: Array<{ title?: string; link?: string; snippet?: string }>;
        };
        return (data.organic ?? [])
          .filter((r) => r.link)
          .map((r) => ({
            title: r.title ?? "",
            url: r.link!,
            snippet: r.snippet ?? "",
          }));
      }
    } catch {
      /* fall through */
    }
  }

  const cseKey = process.env.GOOGLE_CSE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  if (cseKey && cseId) {
    try {
      const url = new URL("https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("key", cseKey);
      url.searchParams.set("cx", cseId);
      url.searchParams.set("q", query);
      url.searchParams.set("num", String(Math.min(limit, 10)));
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(15_000) });
      if (res.ok) {
        const data = (await res.json()) as {
          items?: Array<{ title?: string; link?: string; snippet?: string }>;
        };
        return (data.items ?? []).map((r) => ({
          title: r.title ?? "",
          url: r.link ?? "",
          snippet: r.snippet ?? "",
        }));
      }
    } catch {
      /* fall through */
    }
  }

  return [];
}

export function normalizeDomain(input: string): string {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.split("/")[0].split("?")[0];
  if (s.includes(".") && !s.includes(" ")) return s;
  return s.replace(/\s+/g, "");
}

export function guessDomainFromName(name: string): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
  return slug ? `${slug}.com` : "example.com";
}

const SKIP_HOSTS = /linkedin\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|youtube\.com|wikipedia\.org|crunchbase\.com|pitchbook\.com|bloomberg\.com|reuters\.com/i;

const REVIEW_HOSTS = /g2\.com|trustpilot\.com|capterra\.com|gartner\.com/i;

function slugFromName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function hostMatchesName(host: string, name: string): boolean {
  const slug = slugFromName(name);
  if (!slug || slug.length < 3) return false;
  const h = host.replace(/^www\./, "").split(".")[0];
  return h.includes(slug) || slug.includes(h);
}

function knownBrand(input: string) {
  const slug = slugFromName(input);
  return KNOWN_BRANDS[slug] ?? null;
}

/** Pick the best company homepage from web search — works for startups and private cos. */
export async function resolveCompanyDomain(input: string): Promise<{ name: string; domain: string; fromSearch: boolean }> {
  const trimmed = input.trim();
  const normalized = normalizeDomain(trimmed);
  const looksLikeDomain = normalized.includes(".") && !normalized.includes(" ");

  const brand = knownBrand(trimmed);
  if (brand) {
    return { name: trimmed.toUpperCase(), domain: brand.domain, fromSearch: true };
  }

  if (looksLikeDomain) {
    const name = normalized.split(".")[0].replace(/-/g, " ").toUpperCase();
    return { name, domain: normalized.replace(/^www\./, ""), fromSearch: false };
  }

  const name = trimmed;
  const slug = slugFromName(name);

  for (const query of DISCOVERY_QUERIES(name)) {
    const results = await searchWeb(query, 8);
    for (const r of results) {
      try {
        const host = new URL(r.url).hostname.replace(/^www\./, "");
        if (SKIP_HOSTS.test(host)) continue;
        if (hostMatchesName(host, name) || r.title.toLowerCase().includes(slug)) {
          return { name: name.toUpperCase(), domain: host, fromSearch: true };
        }
      } catch {
        /* skip */
      }
    }
  }

  for (const tld of [".com", ".io", ".co", ".ai", ".dev", ".app"]) {
    const candidate = `${slug}${tld}`;
    const probe = await searchWeb(`site:${candidate}`, 2);
    if (probe.some((r) => r.url.includes(candidate))) {
      return { name: name.toUpperCase(), domain: candidate, fromSearch: true };
    }
  }

  return { name: name.toUpperCase(), domain: guessDomainFromName(name), fromSearch: false };
}

/** Minimal fallback paths — validated before storage. */
export function fallbackUrls(domain: string): string[] {
  const base = `https://${domain.replace(/^www\./, "")}`;
  return [
    base,
    `${base}/careers`,
    `${base}/jobs`,
    `${base}/about`,
    `${base}/pricing`,
    `${base}/investors`,
    `${base}/investor-relations`,
    `${base}/blog`,
    `${base}/newsroom`,
  ];
}

function knownBrandSources(input: string): string[] {
  const brand = knownBrand(input);
  return brand?.sources ?? [];
}

function prioritizeUrls(urls: string[], domain: string): string[] {
  const score = (url: string) => {
    const u = url.toLowerCase();
    if (/investor|\/ir\b|sec\.gov|annual|10-k|governance|proxy|def.?14a/.test(u)) return 100;
    if (/pricing|plans|careers|jobs|blog|newsroom|press|about/.test(u)) return 80;
    if (REVIEW_HOSTS.test(u)) return 50;
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      if (host === domain || host.endsWith(`.${domain}`)) return 70;
    } catch {
      /* skip */
    }
    return 10;
  };
  return [...urls].sort((a, b) => score(b) - score(a));
}

export async function discoverCompanyUrls(input: string): Promise<{
  name: string;
  domain: string;
  sources: string[];
  searchUsed: boolean;
}> {
  const resolved = await resolveCompanyDomain(input);
  const { name, domain } = resolved;

  const candidates = new Set<string>();
  let searchUsed = resolved.fromSearch;
  const rootHost = domain.replace(/^www\./, "");

  const hostMatches = (hostname: string) => {
    const h = hostname.replace(/^www\./, "");
    return h === rootHost || h.endsWith(`.${rootHost}`);
  };

  for (const url of knownBrandSources(input)) {
    candidates.add(url);
  }

  for (const query of SEARCH_QUERIES(name, domain)) {
    const results = await searchWeb(query, 5);
    if (results.length > 0) searchUsed = true;
    for (const r of results) {
      try {
        const u = new URL(r.url);
        if (hostMatches(u.hostname)) {
          candidates.add(r.url.split("#")[0]);
        }
      } catch {
        /* skip invalid */
      }
    }
  }

  for (const query of REVIEW_QUERIES(name)) {
    const results = await searchWeb(query, 3);
    if (results.length > 0) searchUsed = true;
    for (const r of results) {
      try {
        const host = new URL(r.url).hostname;
        if (REVIEW_HOSTS.test(host)) {
          candidates.add(r.url.split("#")[0]);
        }
      } catch {
        /* skip */
      }
    }
  }

  for (const url of fallbackUrls(domain)) {
    candidates.add(url);
  }

  const prioritized = prioritizeUrls(Array.from(candidates), rootHost);
  const reachable = await filterReachableUrls(prioritized.slice(0, 28), 5);

  const sources = prioritizeUrls(reachable, rootHost).slice(0, 18);

  if (sources.length === 0) {
    const home = `https://${rootHost}`;
    const ok = await filterReachableUrls([home], 1);
    if (ok.length > 0) sources.push(home);
  }

  return { name, domain, sources, searchUsed };
}
