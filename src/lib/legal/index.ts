import type { LegalDocument } from "./types";
import { acceptableUsePolicy, cookiePolicy, eula } from "./documents/policies";
import {
  dataProcessingAgreement,
  intelligenceDisclaimer,
  securityOverview,
  subprocessors,
} from "./documents/enterprise";
import { privacyPolicy } from "./documents/privacy";
import { termsOfService } from "./documents/terms";

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  terms: termsOfService,
  privacy: privacyPolicy,
  "acceptable-use": acceptableUsePolicy,
  cookies: cookiePolicy,
  eula,
  dpa: dataProcessingAgreement,
  subprocessors,
  security: securityOverview,
  disclaimer: intelligenceDisclaimer,
};

export const LEGAL_SLUGS = Object.keys(LEGAL_DOCUMENTS);

export function getLegalDocument(slug: string): LegalDocument | undefined {
  return LEGAL_DOCUMENTS[slug];
}
