/** Central legal entity metadata — update before production launch. */
export const LEGAL = {
  companyLegalName: "Vigilant Intelligence, Inc.",
  productName: "VIGILANTE",
  productDisplayName: "Vigilante",
  tagline: "Target Intelligence",
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vigilant.app",
  supportEmail: "support@vigilant.app",
  legalEmail: "legal@vigilant.app",
  privacyEmail: "privacy@vigilant.app",
  dpoEmail: "privacy@vigilant.app",
  securityEmail: "security@vigilant.app",
  registeredAddress: "251 Little Falls Drive, Wilmington, DE 19808, United States",
  businessLicense: "Delaware C-Corporation",
  einNote: "EIN available upon request for enterprise contracts",
  governingLaw: "State of Delaware, United States",
  governingLawShort: "Delaware",
  effectiveDate: "June 15, 2026",
  version: "1.0",
} as const;

export const LEGAL_LINKS = [
  { slug: "terms", title: "Terms of Service" },
  { slug: "privacy", title: "Privacy Policy" },
  { slug: "acceptable-use", title: "Acceptable Use Policy" },
  { slug: "cookies", title: "Cookie Policy" },
  { slug: "eula", title: "End User License Agreement" },
  { slug: "dpa", title: "Data Processing Agreement" },
  { slug: "subprocessors", title: "Subprocessors" },
  { slug: "security", title: "Security Overview" },
  { slug: "disclaimer", title: "Intelligence & AI Disclaimer" },
] as const;

export type LegalSlug = (typeof LEGAL_LINKS)[number]["slug"];
