import { LEGAL } from "../config";
import type { LegalDocument } from "../types";

const C = LEGAL;

export const privacyPolicy: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  summary: "How Vigilant collects, uses, and protects personal information.",
  lastUpdated: C.effectiveDate,
  sections: [
    {
      heading: "1. Scope",
      paragraphs: [
        `This Privacy Policy describes how ${C.companyLegalName} ("${C.productDisplayName}," "we," "us," or "our") processes personal information when you visit ${C.websiteUrl}, use the ${C.productName} web or mobile applications, or otherwise interact with our Service.`,
        `This Policy does not apply to third-party websites we link to or to information about your Targets that is obtained from public sources and processed on your behalf as part of the Service.`,
      ],
    },
    {
      heading: "2. Information we collect",
      paragraphs: ["We collect the following categories of information:"],
      bullets: [
        "Account information: email address, authentication tokens, organization name, and profile settings.",
        "Service data: Target configurations, monitored URLs, signals, briefs, usage logs, budget settings, and content you submit.",
        "Technical data: IP address, device type, browser, operating system, app version, and diagnostic logs.",
        "Usage data: feature interactions, API calls, agent run metadata, and spend metrics.",
        "Communications: support requests and email correspondence.",
        "Payment data: billing contact and transaction records processed by our payment provider (we do not store full payment card numbers).",
      ],
    },
    {
      heading: "3. How we use information",
      paragraphs: ["We use personal information to:"],
      bullets: [
        "Provide, operate, and maintain the Service, including authentication and agent runs.",
        "Process transactions and send billing-related communications.",
        "Send product notifications, security alerts, and service messages.",
        "Monitor performance, debug issues, and prevent fraud or abuse.",
        "Improve models, features, and reliability (using aggregated or de-identified data where feasible).",
        "Comply with legal obligations and enforce our terms.",
      ],
    },
    {
      heading: "4. Legal bases (EEA/UK)",
      paragraphs: [
        `Where GDPR or UK GDPR applies, we rely on: (a) contract performance to provide the Service; (b) legitimate interests in securing and improving the Service; (c) consent where required (e.g., non-essential cookies); and (d) legal obligation where applicable.`,
      ],
    },
    {
      heading: "5. AI and automated processing",
      paragraphs: [
        `The Service uses automated systems, including large language models from third-party providers, to analyze changes in public content and generate summaries. These systems process text derived from public pages and your configuration data.`,
        `We do not use your private account content to train public foundation models unless you opt in to a separate program or we disclose otherwise.`,
      ],
    },
    {
      heading: "6. How we share information",
      paragraphs: ["We may share personal information with:"],
      bullets: [
        "Service providers (subprocessors) that host infrastructure, process payments, deliver email, or provide AI APIs — see our Subprocessor List.",
        "Professional advisors and authorities when required by law or to protect rights and safety.",
        "Successors in connection with a merger, acquisition, or asset sale, subject to this Policy.",
      ],
    },
    {
      heading: "7. International transfers",
      paragraphs: [
        `We may process information in the United States and other countries. Where required, we use appropriate safeguards such as Standard Contractual Clauses for transfers from the EEA/UK.`,
      ],
    },
    {
      heading: "8. Retention",
      paragraphs: [
        `We retain personal information for as long as your account is active or as needed to provide the Service, comply with law, resolve disputes, and enforce agreements. You may request deletion subject to legal exceptions.`,
      ],
    },
    {
      heading: "9. Security",
      paragraphs: [
        `We implement administrative, technical, and organizational measures designed to protect personal information, including encryption in transit, access controls, and row-level security in our database layer. No method of transmission or storage is completely secure.`,
        `Report security concerns to ${C.securityEmail}.`,
      ],
    },
    {
      heading: "10. Your rights",
      paragraphs: [
        `Depending on your location, you may have rights to access, correct, delete, restrict, or port your personal information, and to object to or withdraw consent for certain processing.`,
        `California residents may have additional rights under the CCPA/CPRA. We do not sell personal information as defined by California law.`,
        `To exercise rights, contact ${C.privacyEmail}. We may verify your request before responding.`,
      ],
    },
    {
      heading: "11. Cookies and similar technologies",
      paragraphs: [
        `We use cookies and local storage for authentication, preferences, and analytics. See our Cookie Policy for details.`,
      ],
    },
    {
      heading: "12. Children",
      paragraphs: [
        `The Service is not directed to children under 16, and we do not knowingly collect their personal information.`,
      ],
    },
    {
      heading: "13. Changes",
      paragraphs: [
        `We may update this Policy from time to time. We will post the revised Policy with an updated date and provide additional notice for material changes where required.`,
      ],
    },
    {
      heading: "14. Contact",
      paragraphs: [
        `Privacy inquiries: ${C.privacyEmail}`,
        `Data protection contact: ${C.dpoEmail}`,
        `${C.companyLegalName}`,
        C.registeredAddress,
      ],
    },
  ],
};
