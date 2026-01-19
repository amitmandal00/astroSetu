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
  "real reports provide",
  "would appear here in a real report",
  "this is test data",
  "mock insight",
  "enable real mode",
  "mock report summary",
  "this is a mock report",
  "(mock data)",
  "mock data",
  "mock report",
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
  
  // CRITICAL FIX: Check custom fields for mock content
  // Check timeWindows
  if (report.timeWindows) {
    for (const window of report.timeWindows) {
      if (window.description && containsMockContent(window.description)) return true;
      if (window.title && containsMockContent(window.title)) return true;
    }
  }
  
  // Check recommendations
  if (report.recommendations) {
    for (const rec of report.recommendations) {
      if (rec.category && containsMockContent(rec.category)) return true;
      if (rec.items) {
        for (const item of rec.items) {
          if (containsMockContent(item)) return true;
        }
      }
    }
  }
  
  // Check phaseBreakdown
  if (report.phaseBreakdown) {
    for (const phase of report.phaseBreakdown) {
      if (phase.theme && containsMockContent(phase.theme)) return true;
      if (phase.majorInfluences && containsMockContent(phase.majorInfluences)) return true;
    }
  }
  
  // Check majorTransitions
  if (report.majorTransitions) {
    for (const transition of report.majorTransitions) {
      if (transition.description && containsMockContent(transition.description)) return true;
    }
  }
  
  // Check longTermOpportunities
  if (report.longTermOpportunities) {
    for (const opp of report.longTermOpportunities) {
      if (opp.description && containsMockContent(opp.description)) return true;
    }
  }
  
  // Check decisionOptions
  if (report.decisionOptions) {
    for (const option of report.decisionOptions) {
      if (option.option && containsMockContent(option.option)) return true;
    }
  }
  
  // Check other custom fields
  if (report.phaseTheme && containsMockContent(report.phaseTheme)) return true;
  if (report.yearTheme && containsMockContent(report.yearTheme)) return true;
  if (report.decisionContext && containsMockContent(report.decisionContext)) return true;
  if (report.recommendedTiming && containsMockContent(report.recommendedTiming)) return true;
  if (report.factorsToConsider) {
    for (const factor of report.factorsToConsider) {
      if (containsMockContent(factor)) return true;
    }
  }
  
  return false;
}

/**
 * Strip mock content from a report
 * Replaces mock sections with generic placeholder content
 * @param report - The report content to clean
 * @param forceStrip - If true, always strip mock content regardless of environment (for client-side preview)
 */
export function stripMockContent(report: ReportContent, forceStrip: boolean = false): ReportContent {
  const isProduction = process.env.NODE_ENV === "production" && process.env.MOCK_MODE !== "true";
  
  // If not production and not forcing, return as-is (will be watermarked later)
  // But if forceStrip is true (for client-side preview), always strip mock content
  if (!isProduction && !forceStrip) {
    return report;
  }
  
  // In production, strip mock content
  const cleanedReport: ReportContent = {
    ...report,
  };
  
  // CRITICAL FIX (ChatGPT Feedback): Sanitize sections instead of filtering them out
  // This prevents reports from appearing "too short" due to sections being removed
  // Only drop sections if they are truly invalid (null/undefined), not "mocky"
  if (report.sections) {
    cleanedReport.sections = report.sections
      .map(section => {
        // Only skip if section is truly invalid
        if (!section || (!section.title && !section.content && (!section.bullets || section.bullets.length === 0))) {
          return null; // Will filter these out at the end
        }

        // Clean title: replace mock content with sanitized version
        let cleanedTitle = section.title;
        if (section.title && containsMockContent(section.title)) {
          // Replace mock title with generic placeholder instead of removing the section
          cleanedTitle = section.title.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim() || "Report Section";
        }

        // Clean content: replace mock content with generic placeholder
        let cleanedContent = section.content;
        if (section.content && containsMockContent(section.content)) {
          // Replace mock content with generic placeholder instead of removing the section
          cleanedContent = "Detailed analysis will be generated based on your birth chart.";
        }

        // Clean bullets: replace mock bullets with generic placeholders, but keep section if it has title or other content
        let cleanedBullets = section.bullets;
        if (section.bullets && section.bullets.length > 0) {
          cleanedBullets = section.bullets
            .map(bullet => {
              if (containsMockContent(bullet)) {
                // CRITICAL FIX: Replace entire bullet with generic placeholder if it contains mock content
                // Don't try to remove just "(mock data)" markers - replace the whole thing
                return "Insight based on your birth chart.";
              }
              return bullet;
            })
            .filter(bullet => bullet && bullet.trim().length > 0); // Only remove truly empty bullets
        }
        
        return {
          ...section,
          title: cleanedTitle,
          content: cleanedContent,
          bullets: cleanedBullets,
        };
      })
      .filter(section => section !== null) as typeof report.sections; // Filter out nulls (invalid sections only)
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
  
  // CRITICAL FIX: Clean custom fields - timeWindows, recommendations, phaseBreakdown, etc.
  // These fields contain user-facing content and must be stripped of mock indicators
  
  // Clean timeWindows (used in marriage-timing, career-money)
  if (report.timeWindows && report.timeWindows.length > 0) {
    cleanedReport.timeWindows = report.timeWindows
      .map(window => ({
        ...window,
        title: window.title ? window.title.replace(/\s*\(mock data\)\s*/gi, "").trim() : window.title,
        description: window.description 
          ? window.description.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim()
          : window.description,
        actions: window.actions?.map(action => action.replace(/\s*\(mock data\)\s*/gi, "").trim()),
        avoidActions: window.avoidActions?.map(action => action.replace(/\s*\(mock data\)\s*/gi, "").trim()),
      }))
      .filter(window => {
        // Remove windows that are clearly mock
        if (window.description && containsMockContent(window.description)) {
          return false;
        }
        return true;
      });
  }
  
  // Clean recommendations (used in marriage-timing, career-money)
  if (report.recommendations && report.recommendations.length > 0) {
    cleanedReport.recommendations = report.recommendations
      .map(rec => ({
        ...rec,
        category: rec.category ? rec.category.replace(/\s*\(mock data\)\s*/gi, "").trim() : rec.category,
        items: rec.items?.map(item => item.replace(/\s*\(mock data\)\s*/gi, "").trim()).filter(item => !containsMockContent(item)),
      }))
      .filter(rec => rec.items && rec.items.length > 0); // Keep only recommendations with valid items
  }
  
  // Clean phaseBreakdown (major-life-phase)
  if (report.phaseBreakdown && report.phaseBreakdown.length > 0) {
    cleanedReport.phaseBreakdown = report.phaseBreakdown
      .map(phase => ({
        ...phase,
        year: phase.year ? phase.year.replace(/\s*\(mock data\)\s*/gi, "").trim() : phase.year,
        theme: phase.theme ? phase.theme.replace(/\s*\(mock data\)\s*/gi, "").trim() : phase.theme,
        focusAreas: phase.focusAreas?.map(area => area.replace(/\s*\(mock data\)\s*/gi, "").trim()).filter(area => !containsMockContent(area)),
        majorInfluences: phase.majorInfluences ? phase.majorInfluences.replace(/\s*\(mock data\)\s*/gi, "").trim() : phase.majorInfluences,
      }))
      .filter(phase => !containsMockContent(phase.theme || ""));
  }
  
  // Clean majorTransitions (major-life-phase)
  if (report.majorTransitions && report.majorTransitions.length > 0) {
    cleanedReport.majorTransitions = report.majorTransitions
      .map(transition => ({
        ...transition,
        timeframe: transition.timeframe ? transition.timeframe.replace(/\s*\(mock data\)\s*/gi, "").trim() : transition.timeframe,
        description: transition.description 
          ? transition.description.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim()
          : transition.description,
        preparation: transition.preparation?.map(item => item.replace(/\s*\(mock data\)\s*/gi, "").trim()).filter(item => !containsMockContent(item)),
      }))
      .filter(transition => {
        if (transition.description && containsMockContent(transition.description)) {
          return false;
        }
        return true;
      });
  }
  
  // Clean longTermOpportunities (major-life-phase)
  if (report.longTermOpportunities && report.longTermOpportunities.length > 0) {
    cleanedReport.longTermOpportunities = report.longTermOpportunities
      .map(opp => ({
        ...opp,
        category: opp.category ? opp.category.replace(/\s*\(mock data\)\s*/gi, "").trim() : opp.category,
        timeframe: opp.timeframe ? opp.timeframe.replace(/\s*\(mock data\)\s*/gi, "").trim() : opp.timeframe,
        description: opp.description 
          ? opp.description.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim()
          : opp.description,
        actionItems: opp.actionItems?.map(item => item.replace(/\s*\(mock data\)\s*/gi, "").trim()).filter(item => !containsMockContent(item)),
      }))
      .filter(opp => {
        if (opp.description && containsMockContent(opp.description)) {
          return false;
        }
        return true;
      });
  }
  
  // Clean decisionOptions (decision-support)
  if (report.decisionOptions && report.decisionOptions.length > 0) {
    cleanedReport.decisionOptions = report.decisionOptions
      .map(option => ({
        ...option,
        option: option.option ? option.option.replace(/\s*\(mock data\)\s*/gi, "").trim() : option.option,
        timeframe: option.timeframe ? option.timeframe.replace(/\s*\(mock data\)\s*/gi, "").trim() : option.timeframe,
        considerations: option.considerations?.map(consideration => consideration.replace(/\s*\(mock data\)\s*/gi, "").trim()).filter(consideration => !containsMockContent(consideration)),
      }))
      .filter(option => !containsMockContent(option.option || ""));
  }
  
  // Clean recommendedTiming (decision-support)
  if (report.recommendedTiming) {
    if (containsMockContent(report.recommendedTiming)) {
      // If recommendedTiming contains mock content, replace with generic placeholder
      cleanedReport.recommendedTiming = "The next few months show favorable alignment for decision-making based on your astrological chart.";
    } else {
      // Just remove any "(mock data)" markers if present
      cleanedReport.recommendedTiming = report.recommendedTiming.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim();
    }
  }
  
  // Clean factorsToConsider (decision-support)
  if (report.factorsToConsider && report.factorsToConsider.length > 0) {
    cleanedReport.factorsToConsider = report.factorsToConsider
      .map(factor => factor.replace(/\s*\(mock data\)\s*/gi, "").trim())
      .filter(factor => !containsMockContent(factor));
  }
  
  // Clean phaseTheme (major-life-phase)
  if (report.phaseTheme) {
    cleanedReport.phaseTheme = report.phaseTheme.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim();
  }
  
  // Clean yearTheme (year-analysis)
  if (report.yearTheme) {
    cleanedReport.yearTheme = report.yearTheme.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim();
  }
  
  // Clean decisionContext (decision-support)
  if (report.decisionContext) {
    if (containsMockContent(report.decisionContext)) {
      // If decisionContext contains mock content, replace with generic placeholder
      cleanedReport.decisionContext = "This report helps evaluate decision options based on astrological timing and your birth chart analysis.";
    } else {
      // Just remove any "(mock data)" markers if present
      cleanedReport.decisionContext = report.decisionContext.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim();
    }
  }
  
  // Clean quarterlyBreakdown, bestPeriods, cautionPeriods (year-analysis)
  if (report.quarterlyBreakdown) {
    cleanedReport.quarterlyBreakdown = report.quarterlyBreakdown.map(q => ({
      ...q,
      focusTheme: q.focusTheme ? q.focusTheme.replace(/\s*\(mock data\)\s*/gi, "").trim() : q.focusTheme,
      careerMoneyTone: q.careerMoneyTone ? q.careerMoneyTone.replace(/\s*\(mock data\)\s*/gi, "").trim() : q.careerMoneyTone,
      relationshipFocus: q.relationshipFocus ? q.relationshipFocus.replace(/\s*\(mock data\)\s*/gi, "").trim() : q.relationshipFocus,
    }));
  }
  
  if (report.bestPeriods) {
    cleanedReport.bestPeriods = report.bestPeriods
      .map(period => ({
        ...period,
        focus: period.focus ? period.focus.replace(/\s*\(mock data\)\s*/gi, "").trim() : period.focus,
        description: period.description 
          ? period.description.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim()
          : period.description,
      }))
      .filter(period => !containsMockContent(period.description || ""));
  }
  
  if (report.cautionPeriods) {
    cleanedReport.cautionPeriods = report.cautionPeriods
      .map(period => ({
        ...period,
        focus: period.focus ? period.focus.replace(/\s*\(mock data\)\s*/gi, "").trim() : period.focus,
        description: period.description 
          ? period.description.replace(/\s*\(mock data\)\s*/gi, "").replace(/\s*mock data\s*/gi, "").trim()
          : period.description,
      }))
      .filter(period => !containsMockContent(period.description || ""));
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

