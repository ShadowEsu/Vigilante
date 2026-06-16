export interface CompanyProfile {
  description: string;
  valuation: string;
  revenue: string;
  employees: string;
  stage: string;
  funding: string;
  public: boolean;
  monitoringFocus: string[];
  competitiveNotes: string;
}

const KNOWN: Record<string, CompanyProfile> = {
  GOOGLE: {
    description: "Global technology company — search, cloud (GCP), Android, YouTube, and AI (Gemini/DeepMind).",
    valuation: "$2.1T",
    revenue: "$307B ARR",
    employees: "182,000",
    stage: "PUBLIC",
    funding: "NASDAQ: GOOG",
    public: true,
    monitoringFocus: ["Gemini & AI product launches", "Cloud pricing & enterprise packaging", "Android / Pixel hardware", "Regulatory & antitrust filings", "Leadership & DeepMind org moves"],
    competitiveNotes: "Watch pricing pages daily — ~43% change monthly industry-wide. Blog (The Keyword) signals roadmap before press. Careers spikes in ML roles precede product announcements.",
  },
  STRIPE: {
    description: "Financial infrastructure for the internet — payments, billing, Connect, and embedded finance APIs.",
    valuation: "$65B",
    revenue: "$1B+ ARR (est.)",
    employees: "8,000",
    stage: "LATE STAGE",
    funding: "$8.7B raised",
    public: false,
    monitoringFocus: ["Payments & Billing API pricing", "Connect / Treasury / Issuing expansion", "Developer docs & changelog", "Enterprise sales hiring", "Blog product launches"],
    competitiveNotes: "Pricing and docs change frequently — developer-facing signals ship before marketing. Jobs page growth in enterprise AE roles signals upmarket push.",
  },
  MICROSOFT: {
    description: "Enterprise software and cloud — Azure, Office 365, Windows, LinkedIn, GitHub, and AI (Copilot).",
    valuation: "$3.1T",
    revenue: "$245B ARR",
    employees: "228,000",
    stage: "PUBLIC",
    funding: "NASDAQ: MSFT",
    public: true,
    monitoringFocus: ["Azure & Copilot pricing", "Enterprise cloud packaging", "SEC filings & earnings", "Governance & board proxy", "Newsroom product launches"],
    competitiveNotes: "Investor site at microsoft.com/en-us/investor — not /ir. Blog at blogs.microsoft.com. Watch 10-Q for Azure growth commentary.",
  },
};

function inferStage(domain: string, publicCo: boolean): string {
  if (publicCo) return "PUBLIC";
  if (domain.endsWith(".io") || domain.endsWith(".ai")) return "GROWTH";
  return "PRIVATE";
}

export function getCompanyProfile(
  name?: string,
  domain?: string
): CompanyProfile {
  const key = (name ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (KNOWN[key]) return KNOWN[key];
  if (domain?.includes("google")) return KNOWN.GOOGLE;
  if (domain?.includes("stripe")) return KNOWN.STRIPE;
  if (domain?.includes("microsoft")) return KNOWN.MICROSOFT;

  const label = name || domain?.split(".")[0] || "Target";
  const isPublic = /\.(com)$/.test(domain ?? "") && !domain?.includes("startup");
  return {
    description: `${label} — monitored target. Run scans to index pricing, hiring, filings, and newsletter intel.`,
    valuation: "—",
    revenue: "—",
    employees: "—",
    stage: inferStage(domain ?? "", isPublic),
    funding: isPublic ? "—" : "Private / pre-IPO",
    public: isPublic,
    monitoringFocus: [
      "Pricing & product packaging",
      "Investor relations & SEC filings (10-K, 10-Q, 8-K)",
      "Governance & proxy (DEF 14A, board changes)",
      "Careers / hiring velocity",
      "Blog, press & positioning",
      "Third-party reviews (G2, Trustpilot)",
    ],
    competitiveNotes:
      "Run Rediscover after onboarding to validate URLs. IR and governance filings update monthly; pricing and careers weekly. SEC EDGAR auto-indexes for public companies.",
  };
}

export function categorizeSourceUrl(url: string): string {
  const u = url.toLowerCase();
  if (/g2\.com|trustpilot|capterra|gartner/.test(u)) return "REVIEWS";
  if (/pricing|plans|billing/.test(u)) return "PRICING";
  if (/career|jobs|hiring/.test(u)) return "CAREERS";
  if (/investor|ir\/|sec\.gov|edgar|10-k|annual|governance|proxy/.test(u)) return "INVESTOR";
  if (/blog|news|press|newsletter/.test(u)) return "NEWS";
  if (/about|company/.test(u)) return "CORPORATE";
  return "SITE";
}
