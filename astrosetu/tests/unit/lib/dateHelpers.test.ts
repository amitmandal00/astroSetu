/**
 * Unit Tests for Date Helpers
 * Tests: date calculations, ranges, formatting
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getDateContext,
  getYearAnalysisDateRange,
  getMarriageTimingWindows,
  getCareerTimingWindows,
  getMajorLifePhaseWindows,
  getQuarters,
  formatDateRange,
} from '@/lib/ai-astrology/dateHelpers';

describe('Date Helpers', () => {
  beforeEach(() => {
    // Mock current date to Jan 15, 2026 for consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDateContext', () => {
    it('returns current date information', () => {
      const context = getDateContext();
      expect(context.currentYear).toBe(2026);
      expect(context.currentMonth).toBe(1);
      expect(context.currentDay).toBe(15);
      expect(context.isoDate).toBe('2026-01-15');
      expect(context.currentDate).toBeInstanceOf(Date);
    });

    it('returns ISO date in YYYY-MM-DD format', () => {
      const context = getDateContext();
      expect(context.isoDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getYearAnalysisDateRange', () => {
    it('returns 12-month range from current date', () => {
      const range = getYearAnalysisDateRange();
      expect(range.startYear).toBe(2026);
      expect(range.startMonth).toBe(1);
      expect(range.endYear).toBe(2027);
      expect(range.endMonth).toBe(1);
    });

    it('returns valid date strings', () => {
      const range = getYearAnalysisDateRange();
      expect(range.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns human-readable description', () => {
      const range = getYearAnalysisDateRange();
      expect(range.description).toContain('January');
      expect(range.description).toContain('2026');
    });

    it('handles year boundary correctly', () => {
      // Set to December
      vi.setSystemTime(new Date('2026-12-15T10:00:00Z'));
      const range = getYearAnalysisDateRange();
      expect(range.startYear).toBe(2026);
      expect(range.startMonth).toBe(12);
      expect(range.endYear).toBe(2027);
    });
  });

  describe('getMarriageTimingWindows', () => {
    it('returns primary and secondary windows', () => {
      const windows = getMarriageTimingWindows();
      expect(windows.primaryWindowStart).toBeDefined();
      expect(windows.primaryWindowEnd).toBeDefined();
      expect(windows.secondaryWindowStart).toBeDefined();
      expect(windows.secondaryWindowEnd).toBeDefined();
    });

    it('returns descriptions for windows', () => {
      const windows = getMarriageTimingWindows();
      expect(windows.primaryDescription).toBeTruthy();
      expect(windows.secondaryDescription).toBeTruthy();
      expect(typeof windows.primaryDescription).toBe('string');
      expect(typeof windows.secondaryDescription).toBe('string');
    });

    it('returns timeline range', () => {
      const windows = getMarriageTimingWindows();
      expect(windows.timelineStart).toBeLessThan(windows.timelineEnd);
      expect(windows.timelineStart).toBe(2025);
      expect(windows.timelineEnd).toBe(2029);
    });
  });

  describe('getCareerTimingWindows', () => {
    it('returns three time windows', () => {
      const windows = getCareerTimingWindows();
      expect(windows.next12to18Months).toBeDefined();
      expect(windows.following2to3Years).toBeDefined();
      expect(windows.longTerm).toBeDefined();
    });

    it('returns descriptions for each window', () => {
      const windows = getCareerTimingWindows();
      expect(windows.next12to18Months.description).toBeTruthy();
      expect(windows.following2to3Years.description).toBeTruthy();
      expect(windows.longTerm.description).toBeTruthy();
    });

    it('returns timeline range', () => {
      const windows = getCareerTimingWindows();
      expect(windows.timelineStart).toBe(2025);
      expect(windows.timelineEnd).toBe(2031);
    });

    it('windows are in chronological order', () => {
      const windows = getCareerTimingWindows();
      expect(windows.next12to18Months.startYear).toBeLessThanOrEqual(
        windows.following2to3Years.startYear
      );
      expect(windows.following2to3Years.startYear).toBeLessThanOrEqual(
        windows.longTerm.startYear
      );
    });
  });

  describe('getMajorLifePhaseWindows', () => {
    it('returns 5-year window', () => {
      const windows = getMajorLifePhaseWindows();
      expect(windows.startYear).toBe(2026);
      expect(windows.endYear).toBe(2030);
    });

    it('returns year-by-year array', () => {
      const windows = getMajorLifePhaseWindows();
      expect(windows.yearByYear).toHaveLength(5);
      expect(windows.yearByYear[0]).toBe(2026);
      expect(windows.yearByYear[4]).toBe(2030);
    });

    it('returns description', () => {
      const windows = getMajorLifePhaseWindows();
      expect(windows.description).toBe('2026–2030');
    });
  });

  describe('getQuarters', () => {
    it('returns all four quarters', () => {
      const quarters = getQuarters();
      expect(quarters.q1).toBeDefined();
      expect(quarters.q2).toBeDefined();
      expect(quarters.q3).toBeDefined();
      expect(quarters.q4).toBeDefined();
    });

    it('each quarter has name, months, and description', () => {
      const quarters = getQuarters();
      expect(quarters.q1.name).toBe('Q1');
      expect(quarters.q1.months).toBe('Jan–Mar');
      expect(quarters.q1.description).toContain('Q1');
    });
  });

  describe('formatDateRange', () => {
    it('formats same year range', () => {
      const result = formatDateRange(2026, 2026);
      expect(result).toBe('2026');
    });

    it('formats multi-year range', () => {
      const result = formatDateRange(2026, 2030);
      expect(result).toBe('2026–2030');
    });

    it('formats same year with months', () => {
      const result = formatDateRange(2026, 2026, 1, 6);
      expect(result).toContain('Jan');
      expect(result).toContain('Jun');
      expect(result).toContain('2026');
    });
  });
});

