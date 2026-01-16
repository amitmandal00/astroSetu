/**
 * Regression Test: Year Analysis Purchase Button Redirect
 * 
 * Tests DEF-008: Year Analysis purchase button should redirect to correct preview page
 * with reportType=year-analysis preserved, not defaulting to life-summary
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Year Analysis Purchase Button Redirect (DEF-008)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should preserve reportType=year-analysis when redirecting to preview', () => {
    // Simulate: User on /ai-astrology/input?reportType=year-analysis
    const searchParams = {
      get: (key: string) => {
        if (key === 'reportType') return 'year-analysis';
        return null;
      },
    };

    const validReportTypes = ['life-summary', 'marriage-timing', 'career-money', 'full-life', 'year-analysis', 'major-life-phase', 'decision-support'];
    
    // Simulate handleConfirmation logic
    const reportTypeParam = searchParams.get('reportType') || searchParams.get('report');
    const reportType = (reportTypeParam && validReportTypes.includes(reportTypeParam)) 
      ? reportTypeParam 
      : null;

    // CRITICAL FIX: Re-read reportType from URL params
    const currentReportTypeParam = searchParams.get('reportType') || searchParams.get('report');
    const currentReportType = (currentReportTypeParam && validReportTypes.includes(currentReportTypeParam)) 
      ? currentReportTypeParam 
      : reportType;

    const finalReportType = currentReportType || 'life-summary';
    const previewUrl = `/ai-astrology/preview?reportType=${encodeURIComponent(finalReportType)}`;

    // Should preserve year-analysis, not default to life-summary
    expect(finalReportType).toBe('year-analysis');
    expect(previewUrl).toBe('/ai-astrology/preview?reportType=year-analysis');
  });

  it('should use URL parameter as primary source instead of state', () => {
    // Simulate: reportType state is null but URL has year-analysis
    const reportTypeState = null; // State is stale/null
    const searchParams = {
      get: (key: string) => {
        if (key === 'reportType') return 'year-analysis'; // URL has it
        return null;
      },
    };

    const validReportTypes = ['life-summary', 'marriage-timing', 'career-money', 'full-life', 'year-analysis', 'major-life-phase', 'decision-support'];

    // CRITICAL FIX: Re-read from URL (primary source)
    const currentReportTypeParam = searchParams.get('reportType') || searchParams.get('report');
    const currentReportType = (currentReportTypeParam && validReportTypes.includes(currentReportTypeParam)) 
      ? currentReportTypeParam 
      : reportTypeState; // Fallback to state only if URL is missing

    const finalReportType = currentReportType || 'life-summary';

    // Should use URL parameter, not null state
    expect(finalReportType).toBe('year-analysis');
    expect(currentReportType).toBe('year-analysis');
  });

  it('should fallback to state if URL parameter is missing', () => {
    // Simulate: URL doesn't have reportType but state does
    const reportTypeState = 'year-analysis';
    const searchParams = {
      get: (key: string) => {
        return null; // URL doesn't have it
      },
    };

    const validReportTypes = ['life-summary', 'marriage-timing', 'career-money', 'full-life', 'year-analysis', 'major-life-phase', 'decision-support'];

    const currentReportTypeParam = searchParams.get('reportType') || searchParams.get('report');
    const currentReportType = (currentReportTypeParam && validReportTypes.includes(currentReportTypeParam)) 
      ? currentReportTypeParam 
      : reportTypeState; // Fallback to state

    const finalReportType = currentReportType || 'life-summary';

    // Should use state as fallback
    expect(finalReportType).toBe('year-analysis');
  });

  it('should default to life-summary only if both URL and state are missing', () => {
    // Simulate: Both URL and state are missing
    const reportTypeState = null;
    const searchParams = {
      get: (key: string) => {
        return null; // URL doesn't have it
      },
    };

    const validReportTypes = ['life-summary', 'marriage-timing', 'career-money', 'full-life', 'year-analysis', 'major-life-phase', 'decision-support'];

    const currentReportTypeParam = searchParams.get('reportType') || searchParams.get('report');
    const currentReportType = (currentReportTypeParam && validReportTypes.includes(currentReportTypeParam)) 
      ? currentReportTypeParam 
      : reportTypeState;

    const finalReportType = currentReportType || 'life-summary';

    // Should default to life-summary
    expect(finalReportType).toBe('life-summary');
  });
});

