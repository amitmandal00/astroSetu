/**
 * MVP GUARANTEE: Deterministic Fallback Helper
 * 
 * ⚠️ CRITICAL: This function MUST NEVER call OpenAI, Prokerala, or any external API
 * 
 * This is a pure, deterministic function that adds static fallback sections to reports.
 * It is used when validation fails to ensure reports meet minimum requirements without
 * making additional API calls (which would violate MVP Rule #4 - no automatic retries).
 * 
 * Purpose:
 * - Add fallback sections when report content is too short or missing
 * - Ensure reports meet minimum word count requirements
 * - Replace placeholder content with meaningful fallback sections
 * 
 * MVP Compliance:
 * - ✅ No external API calls (OpenAI, Prokerala, etc.)
 * - ✅ Deterministic (same input = same output)
 * - ✅ Pure function (no side effects)
 * - ✅ Used only when validation fails (terminal failure path)
 * 
 * @param reportContent - The report content that failed validation
 * @param reportType - The type of report being generated
 * @param errorCode - The validation error code
 * @returns ReportContent with fallback sections applied
 */
export async function applyDeterministicFallback_NO_API(
  reportContent: any,
  reportType: string,
  errorCode?: string
): Promise<any> {
  // MVP GUARANTEE: This function must never call external APIs
  // All fallback content is static and deterministic
  
  const { ensureMinimumSections } = await import("@/lib/ai-astrology/reportGenerator");
  
  // P0 FIX #1: For year-analysis, ALWAYS replace content completely (not append)
  // If validation failed, the AI content is too short - replace with thick fallback template
  let fallbackContent = reportContent;
  
  if (reportType === "year-analysis") {
    // Check if content is too short or has placeholders
    const hasPlaceholderPhrases = fallbackContent.sections?.some((s: any) => {
      const content = s.content?.toLowerCase() || "";
      return content.includes("simplified view") || 
             content.includes("we're preparing") ||
             content.includes("try generating the report again") ||
             content.includes("additional insights - section") ||
             content.includes("placeholder") ||
             content.includes("coming soon");
    });
    
    // Calculate current word count
    const currentWordCount = fallbackContent.sections?.reduce((sum: number, s: any) => {
      const contentWords = s.content?.split(/\s+/).length || 0;
      const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
      return sum + contentWords + bulletWords;
    }, 0) || 0;
    
    // P0 FIX #1: If validation failed (errorCode present) OR content is too short OR has placeholders
    // COMPLETELY REPLACE with thick fallback template (do not merge/append)
    if (errorCode || hasPlaceholderPhrases || currentWordCount < 800 || !fallbackContent.sections || fallbackContent.sections.length === 0) {
      console.log("[YEAR-ANALYSIS FALLBACK] Replacing content completely with thick fallback template", {
        errorCode,
        hasPlaceholderPhrases,
        currentWordCount,
        sectionsCount: fallbackContent.sections?.length || 0,
      });
      
      // COMPLETELY REPLACE - start fresh with empty sections
      fallbackContent = {
        ...fallbackContent,
        sections: [],
      };
    }
  }
  
  // Apply deterministic fallback (ensureMinimumSections - no API calls)
  if (errorCode === "MOCK_CONTENT_DETECTED" || errorCode === "MISSING_SECTIONS" || 
      !fallbackContent || !fallbackContent.sections || fallbackContent.sections.length === 0) {
    // Empty, malformed, or missing sections - create minimal report with fallback
    console.log("[DETERMINISTIC_FALLBACK] Empty/missing sections detected - creating fallback report", {
      reportType,
      errorCode,
      hasSections: !!fallbackContent?.sections,
      sectionsCount: fallbackContent?.sections?.length || 0,
    });
    
    fallbackContent = ensureMinimumSections(
      fallbackContent || {
        title: reportType === "year-analysis" ? "Your Year Analysis" :
               reportType === "full-life" ? "Your Full Life Report" :
               reportType === "career-money" ? "Your Career & Money Report" :
               reportType === "marriage-timing" ? "Your Marriage Timing Report" :
               reportType === "major-life-phase" ? "Your Major Life Phase Report" :
               reportType === "decision-support" ? "Your Decision Support Report" :
               "Your Astrology Report",
        sections: [],
      },
      reportType as any
    );
    
    // CRITICAL: Log after ensureMinimumSections to verify sections were added
    console.log("[DETERMINISTIC_FALLBACK] After ensureMinimumSections", {
      reportType,
      sectionsCount: fallbackContent.sections?.length || 0,
      wordCount: fallbackContent.sections?.reduce((sum: number, s: any) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0) || 0,
    });
  } else {
    // Content exists but validation failed - try applying fallback to improve it
    console.log("[DETERMINISTIC_FALLBACK] Content exists but validation failed - applying fallback", {
      reportType,
      errorCode,
      sectionsCount: fallbackContent.sections?.length || 0,
    });
    
    fallbackContent = ensureMinimumSections(fallbackContent, reportType as any);
    
    // CRITICAL: Log after ensureMinimumSections to verify sections were added
    console.log("[DETERMINISTIC_FALLBACK] After ensureMinimumSections (existing content)", {
      reportType,
      sectionsCount: fallbackContent.sections?.length || 0,
      wordCount: fallbackContent.sections?.reduce((sum: number, s: any) => {
        const contentWords = s.content?.split(/\s+/).length || 0;
        const bulletWords = s.bullets?.join(" ").split(/\s+/).length || 0;
        return sum + contentWords + bulletWords;
      }, 0) || 0,
    });
  }
  
  return fallbackContent;
}

