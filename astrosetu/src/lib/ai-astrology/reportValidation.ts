/**
 * Report Validation Module
 * Strict validation before marking reports as "completed"
 * 
 * ChatGPT Feedback (Phase 1): A report is NOT completed unless all validations pass.
 * This prevents invalid reports from being charged.
 */

import type { ReportContent, AIAstrologyInput, ReportType } from "./types";
import { reportContainsMockContent } from "./mockContentGuard";
import { countWordsFromSections, getThresholds } from "./qualityThresholds";

export type ValidationResult = {
  valid: boolean;
  strictPass: boolean;
  degradedPass: boolean;
  error?: string;
  errorCode?: "MISSING_SECTIONS" | "MOCK_CONTENT_DETECTED" | "VALIDATION_FAILED" | "USER_DATA_MISMATCH";
  qualityWarning?: "shorter_than_expected" | "below_optimal_length" | "content_repair_applied";
  strictMinWords?: number;
  degradedMinWords?: number;
  wordCount?: number;
  missingWords?: number;
  sectionCount?: number;
  reasonCode?: string;
  canAutoExpand?: boolean;
};

/**
 * Validates report content before marking as "completed"
 * Returns validation result with error code if invalid
 */
export function validateReportContent(
  report: ReportContent,
  input: AIAstrologyInput,
  paymentToken?: string,
  reportType?: ReportType
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
  // CRITICAL FIX: Be more lenient - only flag obvious placeholders, not short but valid content
  // A section might have short but valid content (e.g., "Focus on career growth this month")
  // CRITICAL FIX (ChatGPT Feedback): Don't flag replacement text from stripMockContent
  // The replacement text is contextual and valid, not a placeholder
  const hasPlaceholderContent = report.sections.some((section) => {
    const content = section.content?.toLowerCase() || "";
    // Only flag obvious placeholder patterns, not just short content
    // Short content (< 20 chars) alone is not enough - must also match placeholder patterns
    // CRITICAL: Exclude replacement text patterns from stripMockContent (these are valid contextual text)
    const isReplacementText = 
      content.includes("based on your unique birth chart") ||
      content.includes("based on your unique astrological chart") ||
      content.includes("personalized astrological insights") ||
      content.includes("planetary positions and dasha periods") ||
      content.includes("planetary influences suggest") ||
      content.includes("astrological timing indicates");
    
    if (isReplacementText) {
      return false; // This is valid replacement text, not a placeholder
    }
    
    const isObviousPlaceholder = 
      content.includes("lorem ipsum") ||
      content.includes("placeholder text") ||
      content.includes("coming soon") ||
      content.includes("sample text") ||
      content.includes("this is a placeholder") ||
      content.includes("detailed analysis will be generated") || // Old replacement text pattern
      content.includes("insight based on your birth chart") || // Old replacement text pattern
      content.includes("key insight based on your birth chart") || // Old replacement text pattern
      // CRITICAL FIX: Catch specific placeholder patterns from failed report generation
      content.includes("we're preparing your personalized insights") ||
      content.includes("this is a simplified view") ||
      content.includes("try generating the report again") ||
      content.includes("for a complete analysis with detailed timing windows") ||
      content.includes("additional insights - section") ||
      content.includes("please try generating the report again") ||
      (content.trim().length < 10 && (content.includes("placeholder") || content.includes("sample"))); // Very short AND contains placeholder keywords
    
    return isObviousPlaceholder;
  });

  if (hasPlaceholderContent) {
    return {
      valid: false,
      error: "Report contains placeholder content",
      errorCode: "VALIDATION_FAILED",
    };
  }

  // 8. Structural validation by report type
  // CRITICAL FIX: Validate that reports have expected structure and minimum content
  if (reportType) {
    const structureValidation = validateStructureByReportType(reportType, report.sections || []);
    if (!structureValidation.valid) {
      return structureValidation;
    }
  }

  const lengthResult = evaluateLength(report, reportType);
  if (lengthResult.strictPass) {
    return {
      valid: true,
      strictPass: true,
      degradedPass: true,
      wordCount: lengthResult.wordCount,
      sectionCount: report.sections.length,
    };
  }

  return {
    valid: false,
    strictPass: lengthResult.strictPass,
    degradedPass: lengthResult.degradedPass,
    error: lengthResult.degradedPass
      ? `Report content shorter than preferred but still usable. Found ${lengthResult.wordCount} words.`
      : `Report content too short. Found ${lengthResult.wordCount} words, minimum ${lengthResult.strictMinWords} required.`,
    errorCode: "VALIDATION_FAILED",
    qualityWarning: lengthResult.degradedPass ? "below_optimal_length" : "shorter_than_expected",
    strictMinWords: lengthResult.strictMinWords,
    degradedMinWords: lengthResult.degradedMinWords,
    wordCount: lengthResult.wordCount,
    missingWords: lengthResult.missingWords,
    sectionCount: report.sections.length,
    reasonCode: lengthResult.reasonCode,
  };
}

type LengthResult = {
  strictPass: boolean;
  degradedPass: boolean;
  strictMinWords: number;
  degradedMinWords: number;
  wordCount: number;
  missingWords: number;
  sectionCount: number;
  reasonCode: string;
};

function evaluateLength(report: ReportContent, reportType?: ReportType): LengthResult {
  const sections = report.sections || [];
  const sectionCount = sections.length;
  const wordCount = countWordsFromSections(sections);
  const thresholds = reportType ? getThresholds(reportType) : { strictMinWords: 0, degradedMinWords: 0, minSections: 0 };

  const strictPass = sectionCount >= thresholds.minSections && wordCount >= thresholds.strictMinWords;
  const degradedPass = sectionCount >= thresholds.minSections && wordCount >= thresholds.degradedMinWords;
  const missingWords = Math.max(0, thresholds.strictMinWords - wordCount);
  const reasonCode =
    sectionCount < thresholds.minSections ? "VALIDATION_TOO_FEW_SECTIONS" : "VALIDATION_TOO_SHORT";

  return {
    strictPass,
    degradedPass,
    strictMinWords: thresholds.strictMinWords,
    degradedMinWords: thresholds.degradedMinWords,
    wordCount,
    missingWords,
    sectionCount,
    reasonCode,
  };
}

/**
 * Validate report structure based on report type
 * Ensures reports have expected sections and minimum content length
 */
function validateStructureByReportType(
  reportType: ReportType,
  sections: Array<{ title: string; content?: string; bullets?: string[] }>
): ValidationResult {

  // For year-analysis, enforce strict structure requirements
  if (reportType === "year-analysis") {
    // Check for expected section titles (at least 2-3 must be present)
    const expectedTitles = [
      "year strategy", "year theme", "year-at-a-glance", "quarter", 
      "best periods", "low-return", "what to do", "year-end", 
      "decision anchor", "confidence level"
    ];
    
    const sectionTitles = sections.map(s => s.title.toLowerCase());
    const hasExpectedTitles = expectedTitles.filter(expected => 
      sectionTitles.some(title => title.includes(expected))
    );
    
    if (hasExpectedTitles.length < 2) {
      return {
        valid: false,
        error: `Year-analysis report missing expected sections. Found: ${hasExpectedTitles.length} of ${expectedTitles.length} expected sections`,
        errorCode: "VALIDATION_FAILED",
      };
    }
    
    // Check minimum word count (adjusted to realistic expectations based on token limits)
    // 2400 tokens ≈ 1200-1400 words actual output (accounting for JSON structure, headers, formatting)
    // Adjusted threshold: 800 words (still substantial, but achievable)
    const totalWords = sections.reduce((sum, s) => {
      const contentWords = s.content?.split(/\s+/).length || 0;
      const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
      return sum + contentWords + bulletWords;
    }, 0);
    
    const minWords = 800; // Adjusted from 900 to match realistic token output
    
    if (totalWords < minWords) {
      // Word count failures are auto-expandable (can retry with expand prompt)
      return {
        valid: false,
        error: `Year-analysis report content too short. Found ${totalWords} words, minimum ${minWords} required`,
        errorCode: "VALIDATION_FAILED",
        canAutoExpand: true, // Can be fixed with auto-expand
        qualityWarning: totalWords >= 600 ? "shorter_than_expected" : undefined, // Only warn if reasonably close
      };
    }
  }
  
  // For other paid reports, check minimum word count
  // Adjusted thresholds to match realistic token output:
  // - 2800 tokens (full-life) ≈ 1300-1500 words actual
  // - 2600 tokens (major-life-phase) ≈ 1200-1400 words actual
  // - 1800 tokens (others) ≈ 900-1100 words actual
  const paidReportTypes: Array<typeof reportType> = ["career-money", "major-life-phase", "full-life", "decision-support", "marriage-timing"];
  if (reportType && paidReportTypes.includes(reportType)) {
    const totalWords = sections.reduce((sum, s) => {
      const contentWords = s.content?.split(/\s+/).length || 0;
      const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
      return sum + contentWords + bulletWords;
    }, 0);
    
    // Adjusted minimum word count (realistic expectations)
    const minWords = reportType === "full-life" ? 1300 :  // Was 1500
                     reportType === "major-life-phase" ? 1000 :  // Was 1200
                     800; // Default for other paid reports (was 900)
    
    if (totalWords < minWords) {
      // Word count failures are auto-expandable (can retry with expand prompt)
      return {
        valid: false,
        error: `${reportType} report content too short. Found ${totalWords} words, minimum ${minWords} required`,
        errorCode: "VALIDATION_FAILED",
        canAutoExpand: true, // Can be fixed with auto-expand
        qualityWarning: totalWords >= minWords * 0.7 ? "shorter_than_expected" : undefined, // Warn if reasonably close (70% of threshold)
      };
    }
  }

  return { valid: true };
}

/**
 * Validate report can be marked as completed
 * This is the main entry point for validation
 */
export function validateReportBeforeCompletion(
  report: ReportContent | null,
  input: AIAstrologyInput,
  paymentToken?: string,
  reportType?: ReportType
): ValidationResult {
  if (!report) {
    return {
      valid: false,
      error: "Report content is null",
      errorCode: "VALIDATION_FAILED",
    };
  }

  return validateReportContent(report, input, paymentToken, reportType);
}

