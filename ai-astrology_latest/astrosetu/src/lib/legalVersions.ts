/**
 * Legal Document Versions
 * 
 * Update these versions whenever legal documents are updated.
 * This allows the system to track which version users have consented to.
 */

export const LEGAL_VERSIONS = {
  terms: "2024-12-26",
  privacy: "2024-12-26",
  cookies: "2024-12-26",
  disclaimer: "2024-12-26"
} as const;

export type LegalDocumentType = keyof typeof LEGAL_VERSIONS;

export function getLegalVersion(docType: LegalDocumentType): string {
  return LEGAL_VERSIONS[docType];
}

export function getLegalUrl(docType: LegalDocumentType): string {
  const urls: Record<LegalDocumentType, string> = {
    terms: "/terms",
    privacy: "/privacy",
    cookies: "/cookies",
    disclaimer: "/disclaimer"
  };
  return urls[docType];
}

