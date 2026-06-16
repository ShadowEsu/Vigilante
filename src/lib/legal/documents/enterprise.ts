import { LEGAL } from "../config";
import type { LegalDocument } from "../types";

const C = LEGAL;

export const dataProcessingAgreement: LegalDocument = {
  slug: "dpa",
  title: "Data Processing Agreement",
  summary: "GDPR-aligned data processing terms for business customers.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. Introduction",
      paragraphs: [
        `This Data Processing Agreement ("DPA") forms part of the agreement between ${C.companyLegalName} ("Processor") and the customer entity ("Controller") using the ${C.productName} Service where Processor processes Personal Data on Controller's behalf.`,
        `This DPA applies when Controller is subject to GDPR, UK GDPR, or similar data protection laws and Personal Data is processed through the Service.`,
      ],
    },
    {
      heading: "2. Definitions",
      paragraphs: [
        `"Personal Data," "Processing," "Controller," "Processor," "Sub-processor," and "Data Subject" have the meanings in applicable data protection law.`,
        `"Customer Personal Data" means Personal Data submitted to or generated within the Service by or on behalf of Controller, excluding data Processor processes as a controller (e.g., billing contact for Controller's account with Processor).`,
      ],
    },
    {
      heading: "3. Roles and instructions",
      paragraphs: [
        `Controller determines purposes and means of Processing Customer Personal Data. Processor Processes Customer Personal Data only on documented instructions from Controller, including as configured through the Service and as necessary to provide, secure, and support the Service.`,
        `Controller instructs Processor to Process Customer Personal Data to deliver target-intelligence monitoring, authentication, storage, notifications, and related features described in the Terms of Service.`,
      ],
    },
    {
      heading: "4. Processor obligations",
      paragraphs: ["Processor will:"],
      bullets: [
        "Process Customer Personal Data only as instructed and for the duration of the agreement.",
        "Ensure personnel with access are bound by confidentiality obligations.",
        "Implement appropriate technical and organizational security measures.",
        "Assist Controller with Data Subject requests where feasible, using available tools or support channels.",
        "Notify Controller without undue delay after becoming aware of a Personal Data breach affecting Customer Personal Data.",
        "Delete or return Customer Personal Data upon termination, subject to legal retention requirements.",
        "Make available information necessary to demonstrate compliance and allow audits upon reasonable notice, no more than once per year unless required by a supervisory authority.",
      ],
    },
    {
      heading: "5. Sub-processors",
      paragraphs: [
        `Controller authorizes Processor to engage Sub-processors listed in our Subprocessor List. Processor will impose data protection obligations on Sub-processors substantially similar to this DPA.`,
        `Processor will notify Controller of new Sub-processors and provide opportunity to object on reasonable grounds relating to data protection.`,
      ],
    },
    {
      heading: "6. International transfers",
      paragraphs: [
        `Where Customer Personal Data is transferred outside the EEA/UK, Processor will implement appropriate safeguards, including Standard Contractual Clauses where required.`,
        `Upon request, Processor will provide applicable transfer mechanisms.`,
      ],
    },
    {
      heading: "7. Controller obligations",
      paragraphs: [
        `Controller represents it has lawful basis to Process Customer Personal Data and to instruct Processor. Controller is responsible for Target configuration, notices to Data Subjects where required, and accuracy of instructions.`,
      ],
    },
    {
      heading: "8. Liability",
      paragraphs: [
        `Each party's liability under this DPA is subject to the limitations in the Terms of Service. Nothing in this DPA limits either party's liability where prohibited by law.`,
      ],
    },
    {
      heading: "9. Precedence",
      paragraphs: [
        `If there is a conflict between this DPA and the Terms of Service regarding Processing of Customer Personal Data, this DPA controls.`,
      ],
    },
    {
      heading: "10. Contact",
      paragraphs: [
        `Data protection inquiries: ${C.dpoEmail}`,
        `${C.companyLegalName}`,
        C.registeredAddress,
      ],
    },
  ],
};

export const subprocessors: LegalDocument = {
  slug: "subprocessors",
  title: "Subprocessors",
  summary: "Third-party service providers that process data on our behalf.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. Overview",
      paragraphs: [
        `${C.productDisplayName} uses the following Sub-processors to host and deliver the Service. We evaluate vendors for security and contractual data protection commitments.`,
      ],
    },
    {
      heading: "2. Current subprocessors",
      paragraphs: ["As of the date below, our primary Sub-processors include:"],
      bullets: [
        "Supabase, Inc. — authentication, PostgreSQL database hosting, and file storage (United States).",
        "Vercel, Inc. — web application hosting and edge delivery (United States).",
        "Anthropic, PBC — large language model API for change detection and brief generation (United States).",
        "Google LLC — optional Gemini API and search discovery where enabled (United States).",
        "Stripe, Inc. — payment processing when billing is enabled (United States).",
        "Email delivery provider — transactional email for magic links and notifications (vendor at deployment).",
        "Serper / Google Custom Search (optional) — URL discovery for watch onboarding.",
      ],
    },
    {
      heading: "3. Updates",
      paragraphs: [
        `We will update this list before engaging a new Sub-processor that Processes Customer Personal Data. Enterprise customers may subscribe to change notifications at ${C.privacyEmail}.`,
      ],
    },
    {
      heading: "4. Contact",
      paragraphs: [`Questions: ${C.privacyEmail}`],
    },
  ],
};

export const securityOverview: LegalDocument = {
  slug: "security",
  title: "Security Overview",
  summary: "Technical and organizational measures that protect the Service.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. Architecture",
      paragraphs: [
        `The Service uses multi-tenant PostgreSQL with row-level security (RLS) so each account accesses only its own watches, snapshots, signals, and briefs.`,
        `Privileged keys for agent runs and LLM APIs are held server-side only; web and mobile clients authenticate with user-scoped tokens.`,
      ],
    },
    {
      heading: "2. Authentication and access",
      paragraphs: [
        `Sign-in uses magic-link email authentication via Supabase Auth. Sessions use secure HTTP-only cookies on web and platform secure storage on mobile.`,
        `Internal access follows least-privilege principles.`,
      ],
    },
    {
      heading: "3. Encryption",
      paragraphs: [
        `Data in transit is protected with TLS. Data at rest is encrypted by our cloud infrastructure providers. Secrets are stored as environment variables, not in source control.`,
      ],
    },
    {
      heading: "4. Application controls",
      paragraphs: [
        `API routes validate input. Budget caps and pause controls limit runaway AI spend. Dependency updates and vulnerability monitoring are recommended for all deployments.`,
      ],
    },
    {
      heading: "5. Monitoring and incidents",
      paragraphs: [
        `We log application errors, authentication events, and usage for reliability and security. Report suspected incidents to ${C.securityEmail}.`,
        `We will notify affected customers of breaches affecting personal data as required by law and our DPA.`,
      ],
    },
    {
      heading: "6. Responsible disclosure",
      paragraphs: [
        `We welcome responsible vulnerability reports at ${C.securityEmail}. Please include reproduction steps and avoid accessing other customers' data.`,
      ],
    },
    {
      heading: "7. Compliance roadmap",
      paragraphs: [
        `Formal certifications (e.g., SOC 2) may be pursued as the product matures. Contact ${C.legalEmail} for enterprise security questionnaires.`,
      ],
    },
  ],
};

export const intelligenceDisclaimer: LegalDocument = {
  slug: "disclaimer",
  title: "Intelligence & AI Disclaimer",
  summary: "Important limitations on monitoring outputs and AI-generated content.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. Not professional advice",
      paragraphs: [
        `${C.productDisplayName} provides informational tools only. Outputs are not legal, financial, investment, tax, compliance, or security advice. Consult qualified professionals before acting on information from the Service.`,
      ],
    },
    {
      heading: "2. Public information limitations",
      paragraphs: [
        `The Service analyzes publicly accessible sources that may be incomplete, outdated, inaccurate, or misinterpreted. We do not verify every fact in source material or in generated summaries.`,
        `Absence of a signal does not mean an event did not occur. Presence of a signal does not guarantee accuracy or significance.`,
      ],
    },
    {
      heading: "3. AI-generated content",
      paragraphs: [
        `Automated systems, including large language models, may produce incorrect, misleading, or fabricated content ("hallucinations"). Always corroborate critical findings with primary sources.`,
        `Model behavior may change when providers update their systems.`,
      ],
    },
    {
      heading: "4. No warranty of fitness",
      paragraphs: [
        `We do not warrant that the Service is suitable for regulated decision-making, trading algorithms, employment decisions, or law enforcement without independent human review and validation.`,
      ],
    },
    {
      heading: "5. Third-party sources",
      paragraphs: [
        `We are not responsible for content, availability, or policies of third-party websites. Links and excerpts are for convenience and do not imply endorsement.`,
      ],
    },
    {
      heading: "6. Your responsibility",
      paragraphs: [
        `You are responsible for how you use outputs, including compliance with insider trading rules, material non-public information policies, privacy law, and contractual confidentiality obligations.`,
      ],
    },
    {
      heading: "7. Contact",
      paragraphs: [`${C.legalEmail}`],
    },
  ],
};
