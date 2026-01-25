/**
 * Unit Tests for Report Generator Fallback Logic
 * 
 * Tests critical fallback scenarios:
 * 1. ensureMinimumSections adds fallback sections when AI returns 0 sections
 * 2. Year-analysis fallback sections are properly added
 * 3. parseAIResponse handles empty/invalid responses correctly
 */

import { describe, it, expect } from 'vitest';
import { ensureMinimumSections, __test_parseAIResponse } from '@/lib/ai-astrology/reportGenerator';
import type { ReportContent } from '@/lib/ai-astrology/types';

describe('ensureMinimumSections - Year Analysis Fallback', () => {
  it('should add fallback sections when year-analysis report has 0 sections', () => {
    const emptyReport: ReportContent = {
      title: 'Year Analysis Report',
      sections: [],
      summary: '',
      generatedAt: new Date().toISOString(),
    };

    const result = ensureMinimumSections(emptyReport, 'year-analysis');

    // Should have at least 4 sections (minimum required for paid reports)
    expect(result.sections.length).toBeGreaterThanOrEqual(4);
    
    // Should have expected year-analysis sections
    const sectionTitles = result.sections.map(s => s.title.toLowerCase());
    expect(sectionTitles.some(title => 
      title.includes('year strategy') || 
      title.includes('year theme') || 
      title.includes('quarter') ||
      title.includes('best periods')
    )).toBe(true);
  });

  it('should add fallback sections when year-analysis report has weak placeholder content', () => {
    const weakReport: ReportContent = {
      title: 'Year Analysis Report',
      sections: [
        {
          title: 'Overview',
          content: "We're preparing your personalized insights. This is a simplified view of your report.",
        },
      ],
      summary: '',
      generatedAt: new Date().toISOString(),
    };

    const result = ensureMinimumSections(weakReport, 'year-analysis');

    // Should replace weak content with proper fallback sections
    expect(result.sections.length).toBeGreaterThanOrEqual(4);
    
    // Should not contain placeholder content
    const allContent = result.sections.map(s => s.content).join(' ').toLowerCase();
    expect(allContent).not.toContain("we're preparing");
    expect(allContent).not.toContain("simplified view");
  });

  it('should ensure year-analysis report meets minimum word count (800 words)', () => {
    const emptyReport: ReportContent = {
      title: 'Year Analysis Report',
      sections: [],
      summary: '',
      generatedAt: new Date().toISOString(),
    };

    const result = ensureMinimumSections(emptyReport, 'year-analysis');

    // Calculate total word count
    const totalWords = result.sections.reduce((sum, section) => {
      const contentWords = section.content?.split(/\s+/).length || 0;
      const bulletWords = section.bullets?.join(' ').split(/\s+/).length || 0;
      return sum + contentWords + bulletWords;
    }, 0);

    // Should meet minimum 800 words requirement
    expect(totalWords).toBeGreaterThanOrEqual(800);
  });

  it('should add all required year-analysis sections when starting with 0 sections', () => {
    const emptyReport: ReportContent = {
      title: 'Year Analysis Report',
      sections: [],
      summary: '',
      generatedAt: new Date().toISOString(),
    };

    const result = ensureMinimumSections(emptyReport, 'year-analysis');

    const sectionTitles = result.sections.map(s => s.title.toLowerCase());
    
    // Check for key year-analysis sections
    const hasYearStrategy = sectionTitles.some(t => t.includes('year strategy') || t.includes('strategic focus'));
    const hasYearTheme = sectionTitles.some(t => t.includes('year theme') || t.includes('overall theme'));
    const hasQuarterly = sectionTitles.some(t => t.includes('quarter'));
    const hasBestPeriods = sectionTitles.some(t => t.includes('best periods') || t.includes('favorable periods'));
    const hasLowReturn = sectionTitles.some(t => t.includes('low-return') || t.includes('challenging periods'));
    const hasWhatToDo = sectionTitles.some(t => t.includes('what to do') || t.includes('action items'));

    expect(hasYearStrategy).toBe(true);
    expect(hasYearTheme).toBe(true);
    expect(hasQuarterly).toBe(true);
    expect(hasBestPeriods).toBe(true);
    expect(hasLowReturn).toBe(true);
    expect(hasWhatToDo).toBe(true);
  });
});

describe('parseAIResponse - Year Analysis Empty Response', () => {
  it('should handle empty AI response for year-analysis and trigger fallback', () => {
    const emptyResponse = '';
    
    const result = __test_parseAIResponse(emptyResponse, 'year-analysis');

    // Should return a report with sections (from fallback)
    expect(result).toBeDefined();
    expect(result.sections).toBeDefined();
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.title).toBe('Year Analysis Report');
  });

  it('should handle invalid JSON response for year-analysis', () => {
    const invalidJsonResponse = 'This is not valid JSON { invalid }';
    
    const result = __test_parseAIResponse(invalidJsonResponse, 'year-analysis');

    // Should fallback to regex parsing or use fallback sections
    expect(result).toBeDefined();
    expect(result.sections).toBeDefined();
    expect(result.sections.length).toBeGreaterThan(0);
  });

  it('should handle response with 0 meaningful sections for year-analysis', () => {
    const responseWithPlaceholders = `
      Overview
      We're preparing your personalized insights. This is a simplified view.
      
      Next Steps
      For a complete analysis, please try generating the report again.
    `;
    
    const result = __test_parseAIResponse(responseWithPlaceholders, 'year-analysis');

    // Should detect weak content and use fallback sections
    expect(result.sections.length).toBeGreaterThanOrEqual(4);
    
    // Should not contain placeholder content
    const allContent = result.sections.map(s => s.content).join(' ').toLowerCase();
    expect(allContent).not.toContain("we're preparing");
    expect(allContent).not.toContain("try generating the report again");
  });
});

describe('ensureMinimumSections - Other Report Types', () => {
  it('should add fallback sections for career-money when sections < minimum', () => {
    const emptyReport: ReportContent = {
      title: 'Career & Money Path Report',
      sections: [],
      summary: '',
      generatedAt: new Date().toISOString(),
    };

    const result = ensureMinimumSections(emptyReport, 'career-money');

    // Should have at least 6 sections (minimum for career-money)
    expect(result.sections.length).toBeGreaterThanOrEqual(6);
  });

  it('should add fallback sections for full-life when sections < minimum', () => {
    const emptyReport: ReportContent = {
      title: 'Full Life Report',
      sections: [],
      summary: '',
      generatedAt: new Date().toISOString(),
    };

    const result = ensureMinimumSections(emptyReport, 'full-life');

    // Should have at least 4 sections initially, then add more to meet word count
    expect(result.sections.length).toBeGreaterThanOrEqual(4);
    
    // Should meet minimum 1300 words requirement
    const totalWords = result.sections.reduce((sum, section) => {
      const contentWords = section.content?.split(/\s+/).length || 0;
      const bulletWords = section.bullets?.join(' ').split(/\s+/).length || 0;
      return sum + contentWords + bulletWords;
    }, 0);
    
    expect(totalWords).toBeGreaterThanOrEqual(1300);
  });
});

