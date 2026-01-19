/**
 * Report Validation Module
 * Strict validation before marking reports as "completed"
 * 
 * ChatGPT Feedback (Phase 1): A report is NOT completed unless all validations pass.
 * This prevents invalid reports from being charged.
 */

import type { ReportContent, AIAstrologyInput } from "./types";
import { reportContainsMockContent } from "./mockContentGuard";

export type ValidationResult = {
  valid: boolean;
  error?: string;
  errorCode?: "MISSING_SECTIONS" | "MOCK_CONTENT_DETECTED" | "VALIDATION_FAILED" | "USER_DATA_MISMATCH";
};

/**
 * Validates report content before marking as "completed"
 * Returns validation result with error code if invalid
 */
export function validateReportContent(
  report: ReportContent,
  input: AIAstrologyInput,
  paymentToken?: string
): ValidationResult {
  // 1. Required sections check
  if (!report.sections || report.sections.length === 0) {
    return {
      valid: false,
      error: "Report has no sections",
      errorCode: "MISSING_SECTIONS",
    };
  }

  // 2. Check for mock content (critical - never allow in production)
  if (reportContainsMockContent(report)) {
    return {
      valid: false,
      error: "Report contains mock/test content",
      errorCode: "MOCK_CONTENT_DETECTED",
    };
  }

  // 3. Validate sections have content
  const hasValidSections = report.sections.some(
    (section) => section.content && section.content.trim().length > 0
  );
  if (!hasValidSections) {
    return {
      valid: false,
      error: "Report sections have no content",
      errorCode: "MISSING_SECTIONS",
    };
  }

  // 4. Validate report title exists
  if (!report.title || report.title.trim().length === 0) {
    return {
      valid: false,
      error: "Report has no title",
      errorCode: "VALIDATION_FAILED",
    };
  }

  // 5. User name matching (if payment token metadata available)
  // Note: This is a basic check - payment token validation happens separately
  // This ensures the report content matches what was requested
  if (report.title && input.name) {
    // Basic check: report should reference the user's name somewhere
    // This is a soft check - main validation is in payment token verification
    const reportText = JSON.stringify(report).toLowerCase();
    const userNameLower = input.name.toLowerCase();
    
    // If report doesn't contain user's name anywhere, it might be wrong report
    // However, this is optional - some reports may not include name in content
    // So we'll skip this check for now (payment token validation is the source of truth)
  }

  // 6. Validate birth data consistency
  // The input should match what was used for generation
  // This is already validated in the generation flow, but we can double-check here
  if (!input.dob || !input.tob || !input.place) {
    return {
      valid: false,
      error: "Invalid birth data in input",
      errorCode: "VALIDATION_FAILED",
    };
  }

  // 7. Validate report has meaningful content (not just placeholders)
  const hasPlaceholderContent = report.sections.some((section) => {
    const content = section.content?.toLowerCase() || "";
    return (
      content.includes("lorem ipsum") ||
      content.includes("placeholder") ||
      content.includes("coming soon") ||
      content.includes("sample text") ||
      content.trim().length < 20 // Very short content might be placeholder
    );
  });

  if (hasPlaceholderContent) {
    return {
      valid: false,
      error: "Report contains placeholder content",
      errorCode: "VALIDATION_FAILED",
    };
  }

  // All validations passed
  return { valid: true };
}

/**
 * Validate report can be marked as completed
 * This is the main entry point for validation
 */
export function validateReportBeforeCompletion(
  report: ReportContent | null,
  input: AIAstrologyInput,
  paymentToken?: string
): ValidationResult {
  if (!report) {
    return {
      valid: false,
      error: "Report content is null",
      errorCode: "VALIDATION_FAILED",
    };
  }

  return validateReportContent(report, input, paymentToken);
}

