import { LEGAL } from "../config";
import type { LegalDocument } from "../types";

const C = LEGAL;

export const acceptableUsePolicy: LegalDocument = {
  slug: "acceptable-use",
  title: "Acceptable Use Policy",
  summary: "Permitted and prohibited uses of the Vigilant platform.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. Purpose",
      paragraphs: [
        `This Acceptable Use Policy ("AUP") supplements our Terms of Service and applies to all users of ${C.productDisplayName}. Violations may result in suspension or termination.`,
      ],
    },
    {
      heading: "2. Permitted uses",
      paragraphs: ["You may use the Service for lawful purposes such as:"],
      bullets: [
        "Competitive and market intelligence based on public information.",
        "Monitoring companies, products, or public announcements you have a legitimate business interest in.",
        "Investment research and due diligence on publicly traded entities.",
        "Internal security or brand monitoring for organizations you represent.",
      ],
    },
    {
      heading: "3. Prohibited uses",
      paragraphs: ["You may not use the Service to:"],
      bullets: [
        "Violate any applicable law, regulation, or third-party terms of service.",
        "Access non-public, password-protected, or paywalled content without authorization.",
        "Bypass robots.txt, rate limits, CAPTCHAs, or technical access controls.",
        "Monitor individuals for stalking, harassment, doxxing, or non-consensual surveillance.",
        "Collect sensitive personal data (health, financial account credentials, government IDs) without lawful basis.",
        "Infringe intellectual property, trade secrets, or privacy rights.",
        "Transmit malware, probe systems without authorization, or disrupt the Service.",
        "Resell, sublicense, or provide unauthorized access to the Service.",
        "Use outputs as automated decision-making about individuals without human review where prohibited.",
        "Misrepresent AI-generated content as human-verified fact in regulated contexts.",
      ],
    },
    {
      heading: "4. Target configuration responsibility",
      paragraphs: [
        `You are solely responsible for Targets you configure. Before monitoring a website or entity, confirm you have authority and a lawful basis to do so.`,
        `We may disable Targets or features that appear to facilitate abuse or legal risk.`,
      ],
    },
    {
      heading: "5. Rate limits and fair use",
      paragraphs: [
        `Automated fetching and agent runs consume shared infrastructure. You must respect plan limits, budget caps, and reasonable request rates. We may throttle or suspend accounts that degrade Service performance.`,
      ],
    },
    {
      heading: "6. Reporting abuse",
      paragraphs: [
        `Report suspected violations to ${C.legalEmail}. Include relevant URLs, account details, and description of the concern.`,
      ],
    },
  ],
};

export const cookiePolicy: LegalDocument = {
  slug: "cookies",
  title: "Cookie Policy",
  summary: "How Vigilant uses cookies and similar storage technologies.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. Overview",
      paragraphs: [
        `This Cookie Policy explains how ${C.companyLegalName} uses cookies, local storage, and similar technologies on ${C.websiteUrl} and the ${C.productName} application.`,
      ],
    },
    {
      heading: "2. What we use",
      paragraphs: ["We use the following categories:"],
      bullets: [
        "Strictly necessary: authentication session tokens, CSRF protection, and security preferences required to operate the Service.",
        "Functional: sidebar width, scan settings, and UI preferences stored in localStorage.",
        "Analytics (if enabled): aggregated usage metrics to understand feature adoption and performance.",
      ],
    },
    {
      heading: "3. Third-party cookies",
      paragraphs: [
        `Authentication is provided through Supabase, which may set cookies necessary for sign-in and session management. Payment processors may set cookies during checkout.`,
      ],
    },
    {
      heading: "4. Your choices",
      paragraphs: [
        `Strictly necessary technologies cannot be disabled while using the authenticated Service. You may clear browser storage or uninstall the mobile app to remove local preferences.`,
        `Where required by law, we will present a consent banner before setting non-essential cookies.`,
      ],
    },
    {
      heading: "5. Contact",
      paragraphs: [`Questions: ${C.privacyEmail}`],
    },
  ],
};

export const eula: LegalDocument = {
  slug: "eula",
  title: "End User License Agreement",
  summary: "Software license for Vigilant web and mobile applications.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. License grant",
      paragraphs: [
        `Subject to your compliance with our Terms of Service and this EULA, ${C.companyLegalName} grants you a limited, revocable, non-exclusive, non-transferable license to install and use the ${C.productName} client software (web PWA, iOS, and Android applications) solely for your internal business use.`,
      ],
    },
    {
      heading: "2. Restrictions",
      paragraphs: ["You may not:"],
      bullets: [
        "Copy, modify, or distribute the software except as expressly permitted.",
        "Reverse engineer or decompile the software except where law permits.",
        "Remove proprietary notices or circumvent license or security controls.",
        "Use the software to build a competing product or service.",
      ],
    },
    {
      heading: "3. Open-source components",
      paragraphs: [
        `The Service may include open-source software subject to separate licenses. Those licenses govern the applicable components and prevail over this EULA where they conflict.`,
      ],
    },
    {
      heading: "4. Updates",
      paragraphs: [
        `We may provide updates, patches, or changes automatically. Updates are part of the licensed software and subject to this EULA unless accompanied by different terms.`,
      ],
    },
    {
      heading: "5. Ownership",
      paragraphs: [
        `The software is licensed, not sold. ${C.productDisplayName} retains all rights not expressly granted.`,
      ],
    },
    {
      heading: "6. Termination",
      paragraphs: [
        `This license ends when your account is terminated or you stop using the Service. Upon termination, you must cease use and delete local copies where applicable.`,
      ],
    },
    {
      heading: "7. App Store and Google Play",
      paragraphs: [
        `If you obtained the mobile app from the Apple App Store or Google Play, you also agree that Apple and Google are not parties to this EULA, are not responsible for the app, and have no warranty or support obligations. Apple and its subsidiaries are third-party beneficiaries of this EULA where required by App Store terms.`,
      ],
    },
    {
      heading: "8. Disclaimer and liability",
      paragraphs: [
        `THE SOFTWARE IS PROVIDED "AS IS." LIABILITY LIMITATIONS IN OUR TERMS OF SERVICE APPLY TO THIS EULA.`,
      ],
    },
    {
      heading: "9. Contact",
      paragraphs: [`${C.legalEmail}`],
    },
  ],
};
