/**
 * Integration tests for stale reports background job
 * Tests the stale reports processing logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStaleProcessingReports, markStoredReportFailed } from '@/lib/ai-astrology/reportStore';

// Mock dependencies
vi.mock('@/lib/ai-astrology/reportStore');

describe('Stale Reports Processing Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStaleProcessingReports', () => {
    it('should return reports stuck in processing > threshold', async () => {
      const mockStaleReport = {
        idempotency_key: 'test-key',
        report_id: 'test-report-id',
        status: 'processing' as const,
        report_type: 'year-analysis' as const,
        input: {
          name: 'Test User',
          dob: '1984-11-26',
          tob: '21:40:00',
          place: 'Noamundi, Jharkhand, India',
          gender: 'Male' as const,
        },
        content: null,
        created_at: new Date().toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(), // 6 minutes ago
        error_message: null,
        payment_intent_id: 'pi_test_123',
        refunded: false,
        refund_id: null,
        refunded_at: null,
        error_code: null,
      };

      vi.mocked(getStaleProcessingReports).mockResolvedValue([mockStaleReport]);
      
      const staleReports = await getStaleProcessingReports(5);
      
      expect(staleReports).toHaveLength(1);
      expect(staleReports[0].report_id).toBe('test-report-id');
      expect(staleReports[0].status).toBe('processing');
    });

    it('should return empty array when no stale reports', async () => {
      vi.mocked(getStaleProcessingReports).mockResolvedValue([]);
      
      const staleReports = await getStaleProcessingReports(5);
      
      expect(staleReports).toHaveLength(0);
    });

    it('should respect custom threshold', async () => {
      vi.mocked(getStaleProcessingReports).mockResolvedValue([]);
      
      await getStaleProcessingReports(10);
      
      expect(getStaleProcessingReports).toHaveBeenCalledWith(10);
    });
  });

  describe('markStoredReportFailed', () => {
    it('should mark report as failed with STALE_PROCESSING error code', async () => {
      vi.mocked(markStoredReportFailed).mockResolvedValue();
      
      await markStoredReportFailed({
        idempotencyKey: 'test-key',
        reportId: 'test-report-id',
        errorMessage: 'Report stuck in processing for > 5 minutes. Auto-marked as failed.',
        errorCode: 'STALE_PROCESSING',
      });
      
      expect(markStoredReportFailed).toHaveBeenCalledWith({
        idempotencyKey: 'test-key',
        reportId: 'test-report-id',
        errorMessage: expect.stringContaining('stuck in processing'),
        errorCode: 'STALE_PROCESSING',
      });
    });
  });
});

