/**
 * Unit Tests for Report Validation
 * 
 * Tests for soft validation logic, especially year-analysis validation
 */

import { describe, it, expect } from 'vitest';
import { validateReportContent } from '@/lib/ai-astrology/reportValidation';
import type { ReportContent, ReportType } from '@/lib/ai-astrology/types';

describe('reportValidation - Soft Validation for Year-Analysis', () => {
  const mockInput = {
    name: 'Test User',
    dob: '1984-11-26',
    tob: '21:40:00',
    place: 'Noamundi, Jharkhand, India',
    gender: 'Male' as const,
  };

  describe('year-analysis soft validation', () => {
    it('should always return valid=true for year-analysis, even with missing expected sections', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [
          { title: 'Introduction', content: 'Some content here' }, // Not an expected section
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      // CRITICAL: Year-analysis should NEVER fail validation due to missing expected sections
      // The soft validation in validateStructureByReportType should allow this
      expect(result.valid).toBe(true);
      expect(result.qualityWarning).toBe('below_optimal_length');
      expect(result.canAutoExpand).toBe(true);
      // Should not have error or errorCode for soft validation
      expect(result.error).toBeUndefined();
      expect(result.errorCode).toBeUndefined();
    });

    it('should fail initial validation for year-analysis with 0 sections (before soft validation)', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      // Initial validation fails before soft validation applies
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('MISSING_SECTIONS');
    });

    it('should return valid=true for year-analysis with insufficient word count', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [
          { 
            title: 'Year Strategy', 
            content: 'Content word '.repeat(50) // ~100 words, below 750 minimum
          },
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      // Soft validation should allow this with a warning
      expect(result.valid).toBe(true);
      expect(result.qualityWarning).toBe('below_optimal_length');
      expect(result.canAutoExpand).toBe(true);
    });

    it('should return valid=true for year-analysis with word count between 600-750', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [
          { 
            title: 'Year Strategy', 
            content: 'Content word '.repeat(350) // ~700 words, between 600-750
          },
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      // Should pass with "shorter_than_expected" warning (between 600-750 words)
      expect(result.valid).toBe(true);
      expect(result.qualityWarning).toBe('shorter_than_expected');
      expect(result.canAutoExpand).toBe(true);
    });

    it('should return valid=true for year-analysis with sufficient sections and words', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [
          { 
            title: 'Year Strategy', 
            content: 'Content word '.repeat(400) // ~800 words, above 750 minimum
          },
          { 
            title: 'Year Theme', 
            content: 'More content word '.repeat(200) // ~600 words additional
          },
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      expect(result.valid).toBe(true);
      expect(result.qualityWarning).toBeUndefined();
    });

    it('should count words from both content and bullets', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [
          { 
            title: 'Year Strategy', 
            content: 'Content word '.repeat(50), // ~100 words
            bullets: ['Bullet point word '.repeat(25), 'Another bullet word '.repeat(25)] // ~100 words
          },
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      // Total should be ~200 words, still below 750
      expect(result.valid).toBe(true);
      expect(result.qualityWarning).toBe('below_optimal_length');
      expect(result.canAutoExpand).toBe(true);
    });
  });

  describe('other report types - hard validation', () => {
    it('should fail validation for other report types with missing sections', () => {
      const report: ReportContent = {
        title: 'Career Money Report',
        sections: [],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'career-money');
      
      // Other report types should still have hard validation
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('MISSING_SECTIONS');
    });

    it('should fail validation for other report types with insufficient word count', () => {
      const report: ReportContent = {
        title: 'Career Money Report',
        sections: [
          { 
            title: 'Overview', 
            content: 'Short content'.repeat(10) // ~130 words, below 700 minimum
          },
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'career-money');
      
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('VALIDATION_FAILED');
      expect(result.canAutoExpand).toBe(true); // Can still auto-expand
    });
  });

  describe('quality warnings', () => {
    it('should set qualityWarning for year-analysis with missing expected sections', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [
          { title: 'Only One Section', content: 'Some content here' }, // Not an expected section
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      // Should pass with warning (soft validation)
      expect(result.valid).toBe(true);
      expect(result.qualityWarning).toBe('below_optimal_length');
      expect(result.canAutoExpand).toBe(true);
    });

    it('should set qualityWarning for year-analysis with low word count', () => {
      const report: ReportContent = {
        title: 'Year Analysis',
        sections: [
          { 
            title: 'Year Strategy', 
            content: 'Content word '.repeat(20) // ~40 words, very low
          },
        ],
        generatedAt: new Date().toISOString(),
      };

      const result = validateReportContent(report, mockInput, undefined, 'year-analysis');
      
      // Should pass with warning (soft validation)
      expect(result.valid).toBe(true);
      expect(result.qualityWarning).toBe('below_optimal_length');
      expect(result.canAutoExpand).toBe(true);
    });
  });
});

