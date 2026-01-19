/**
 * Mock Content Guard
 * Prevents mock/test content from appearing in production PDFs and reports
 * 
 * CRITICAL: This is a non-negotiable production safety measure
 */

import type { ReportContent } from "./types";

/**
 * Mock content indicators that must be stripped in production
 */
const MOCK_INDICATORS = [
  "mock report generated for testing",
  "enable real mode by setting",
  "MOCK_MODE",
  "mock data for development",
  "real reports use",
  "this is test data",
  "mock insight",
  "enable real mode",
];

/**
 * Check if content contains mock indicators
 */
export function containsMockContent(content: string): boolean {
  if (!content) return false;
  const lowerContent = content.toLowerCase();
  return MOCK_INDICATORS.some(indicator => lowerContent.includes(indicator.toLowerCase()));
}

/**
 * Check if a ReportContent object contains mock content
 */
export function reportContainsMockContent(report: ReportContent): boolean {
  // Check summary
  if (report.summary && containsMockContent(report.summary)) return true;
  
  // Check executive summary
  if (report.executiveSummary && containsMockContent(report.executiveSummary)) return true;
  
  // Check key insights
  if (report.keyInsights) {
    for (const insight of report.keyInsights) {
      if (containsMockContent(insight)) return true;
    }
  }
  
  // Check sections
  if (report.sections) {
    for (const section of report.sections) {
      if (section.title && containsMockContent(section.title)) return true;
      if (section.content && containsMockContent(section.content)) return true;
      if (section.bullets) {
        for (const bullet of section.bullets) {
          if (containsMockContent(bullet)) return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * Strip mock content from a report
 * Replaces mock sections with generic placeholder content
 */
export function stripMockContent(report: ReportContent): ReportContent {
  const isProduction = process.env.NODE_ENV === "production" && process.env.MOCK_MODE !== "true";
  
  // If not production or in mock mode, return as-is (will be watermarked later)
  if (!isProduction) {
    return report;
  }
  
  // In production, strip mock content
  const cleanedReport: ReportContent = {
    ...report,
  };
  
  // Clean sections
  if (report.sections) {
    cleanedReport.sections = report.sections
      .filter(section => {
        // Remove sections that are clearly mock
        if (section.title && containsMockContent(section.title)) return false;
        if (section.content && containsMockContent(section.content)) return false;
        return true;
      })
      .map(section => {
        // Clean bullets within sections
        let cleanedBullets = section.bullets;
        if (section.bullets) {
          cleanedBullets = section.bullets.filter(bullet => !containsMockContent(bullet));
        }
        
        // Clean content
        let cleanedContent = section.content;
        if (section.content && containsMockContent(section.content)) {
          // Replace mock content with generic placeholder
          cleanedContent = "Detailed analysis will be generated based on your birth chart.";
        }
        
        return {
          ...section,
          content: cleanedContent,
          bullets: cleanedBullets,
        };
      });
  }
  
  // Clean summary
  if (report.summary && containsMockContent(report.summary)) {
    cleanedReport.summary = "This report provides personalized insights based on your birth chart analysis.";
  }
  
  // Clean executive summary
  if (report.executiveSummary && containsMockContent(report.executiveSummary)) {
    cleanedReport.executiveSummary = "Comprehensive analysis based on your unique astrological chart.";
  }
  
  // Clean key insights
  if (report.keyInsights) {
    cleanedReport.keyInsights = report.keyInsights.filter(insight => !containsMockContent(insight));
  }
  
  return cleanedReport;
}

/**
 * Check if we should watermark PDFs (mock mode or test sessions)
 */
export function shouldWatermarkPDF(): boolean {
  return process.env.MOCK_MODE === "true" || process.env.NODE_ENV !== "production";
}

/**
 * Get watermark text for PDFs
 */
export function getPDFWatermark(): string {
  if (process.env.MOCK_MODE === "true") {
    return "TEST / INTERNAL USE ONLY";
  }
  if (process.env.NODE_ENV !== "production") {
    return "DEVELOPMENT BUILD";
  }
  return ""; // No watermark in production
}

