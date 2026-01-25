/**
 * Failure Classification Module
 * Classifies generation failures as RETRYABLE or FATAL
 * Based on ChatGPT Payment Safety Recommendations
 */

import type { GenerationResultState, GenerationResult } from "./types";

// Re-export for convenience
export type { GenerationResult };

/**
 * Classifies an error into SUCCESS, RETRYABLE_FAILURE, or FATAL_FAILURE
 * 
 * RETRYABLE_FAILURE: Errors that might succeed on retry
 * - OpenAI timeout
 * - Prokerala slow response
 * - Temporary API failure
 * - Network timeout
 * - Validation failed but fixable (placeholder content, short content)
 * 
 * FATAL_FAILURE: Errors that won't succeed on retry
 * - Missing birth data
 * - Unsupported location
 * - Internal logic error
 * - Repeated placeholder output after retry
 * - Invalid input data
 */
export function classifyFailure(
  error: Error | string | unknown,
  errorCode?: string,
  context?: {
    retryCount?: number;
    hasPlaceholderContent?: boolean;
    validationFailed?: boolean;
    isTimeout?: boolean;
    isNetworkError?: boolean;
  }
): GenerationResult {
  const errorMessage = typeof error === "string" ? error : error instanceof Error ? error.message : String(error);
  const errorName = error instanceof Error ? error.name : undefined;
  
  // Default context
  const retryCount = context?.retryCount || 0;
  const maxRetries = 2; // Maximum 2 retries (ChatGPT recommendation: 1-2 retries max)
  
  // If we've already retried max times, it's fatal
  if (retryCount >= maxRetries) {
    return {
      state: "FATAL_FAILURE",
      error: `Failed after ${retryCount} retries: ${errorMessage}`,
      errorCode: errorCode || "MAX_RETRIES_EXCEEDED",
      canRetry: false,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for timeout errors (retryable)
  if (context?.isTimeout || errorMessage.toLowerCase().includes("timeout") || errorName === "TimeoutError") {
    return {
      state: "RETRYABLE_FAILURE",
      error: errorMessage,
      errorCode: errorCode || "TIMEOUT",
      canRetry: true,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for network errors (retryable)
  if (context?.isNetworkError || 
      errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("econnrefused") ||
      errorMessage.toLowerCase().includes("enotfound") ||
      errorName === "NetworkError") {
    return {
      state: "RETRYABLE_FAILURE",
      error: errorMessage,
      errorCode: errorCode || "NETWORK_ERROR",
      canRetry: true,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for OpenAI API errors (usually retryable)
  if (errorMessage.toLowerCase().includes("openai") ||
      errorMessage.toLowerCase().includes("rate limit") ||
      errorMessage.toLowerCase().includes("429") ||
      errorMessage.toLowerCase().includes("server error") ||
      errorMessage.toLowerCase().includes("503") ||
      errorMessage.toLowerCase().includes("502")) {
    return {
      state: "RETRYABLE_FAILURE",
      error: errorMessage,
      errorCode: errorCode || "API_ERROR",
      canRetry: true,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for Prokerala slow response (retryable)
  if (errorMessage.toLowerCase().includes("prokerala") ||
      errorMessage.toLowerCase().includes("slow response")) {
    return {
      state: "RETRYABLE_FAILURE",
      error: errorMessage,
      errorCode: errorCode || "PROKERALA_SLOW",
      canRetry: true,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for validation failures (retryable if fixable)
  if (context?.validationFailed) {
    // Placeholder content is retryable (might be fixed on retry)
    if (context.hasPlaceholderContent) {
      return {
        state: "RETRYABLE_FAILURE",
        error: errorMessage,
        errorCode: errorCode || "VALIDATION_FAILED_PLACEHOLDER",
        canRetry: true,
        retryCount,
        maxRetries,
      };
    }
    
    // Other validation failures might be fixable
    if (errorCode === "VALIDATION_FAILED" || errorCode === "MISSING_SECTIONS") {
      return {
        state: "RETRYABLE_FAILURE",
        error: errorMessage,
        errorCode: errorCode || "VALIDATION_FAILED",
        canRetry: true,
        retryCount,
        maxRetries,
      };
    }
  }
  
  // Check for missing/invalid input data (fatal - won't succeed on retry)
  if (errorMessage.toLowerCase().includes("missing") && 
      (errorMessage.toLowerCase().includes("birth") || 
       errorMessage.toLowerCase().includes("input") ||
       errorMessage.toLowerCase().includes("data"))) {
    return {
      state: "FATAL_FAILURE",
      error: errorMessage,
      errorCode: errorCode || "MISSING_INPUT_DATA",
      canRetry: false,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for unsupported location (fatal)
  if (errorMessage.toLowerCase().includes("unsupported") && 
      errorMessage.toLowerCase().includes("location")) {
    return {
      state: "FATAL_FAILURE",
      error: errorMessage,
      errorCode: errorCode || "UNSUPPORTED_LOCATION",
      canRetry: false,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for internal logic errors (fatal)
  if (errorMessage.toLowerCase().includes("internal") ||
      errorMessage.toLowerCase().includes("logic error") ||
      errorCode === "INTERNAL_ERROR") {
    return {
      state: "FATAL_FAILURE",
      error: errorMessage,
      errorCode: errorCode || "INTERNAL_ERROR",
      canRetry: false,
      retryCount,
      maxRetries,
    };
  }
  
  // Check for mock content detected (fatal - shouldn't happen in production)
  if (errorCode === "MOCK_CONTENT_DETECTED") {
    return {
      state: "FATAL_FAILURE",
      error: errorMessage,
      errorCode: "MOCK_CONTENT_DETECTED",
      canRetry: false,
      retryCount,
      maxRetries,
    };
  }
  
  // Default: if we can't classify, assume retryable (safer - allows retry)
  // But log a warning
  console.warn("[FAILURE_CLASSIFICATION] Unclassified error, defaulting to RETRYABLE:", {
    errorMessage,
    errorCode,
    context,
  });
  
  return {
    state: "RETRYABLE_FAILURE",
    error: errorMessage,
    errorCode: errorCode || "UNKNOWN_ERROR",
    canRetry: true,
    retryCount,
    maxRetries,
  };
}

/**
 * Creates a SUCCESS result
 */
export function createSuccessResult(): GenerationResult {
  return {
    state: "SUCCESS",
    canRetry: false,
    retryCount: 0,
    maxRetries: 2,
  };
}

