/**
 * Unit Tests for useReportGenerationController Hook
 * Tests the hook that manages report generation with state machine and cancellation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReportGenerationController } from '@/hooks/useReportGenerationController';
import type { AIAstrologyInput } from '@/lib/ai-astrology/types';

// Mock fetch
global.fetch = vi.fn() as any;

describe('useReportGenerationController Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should start in idle state', () => {
      const { result } = renderHook(() => useReportGenerationController());
      
      expect(result.current.status).toBe('idle');
      expect(result.current.reportId).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.startTime).toBeNull();
      expect(result.current.reportContent).toBeNull();
    });
  });

  describe('Single-Flight Guard', () => {
    it('should cancel previous attempt when starting new one', async () => {
      const { result } = renderHook(() => useReportGenerationController());
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };
      
      // Start first attempt
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-1' } }),
        })
      );
      
      act(() => {
        result.current.start(input, 'life-summary');
      });
      
      await waitFor(() => {
        expect(result.current.status).toBe('polling');
      });
      
      const firstAttemptId = result.current.reportId;
      
      // Start second attempt (should cancel first)
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-2' } }),
        })
      );
      
      act(() => {
        result.current.start(input, 'life-summary');
      });
      
      await waitFor(() => {
        expect(result.current.status).toBe('polling');
      });
      
      // Should have new report ID
      expect(result.current.reportId).toBe('report-2');
      expect(result.current.reportId).not.toBe(firstAttemptId);
    });
  });

  describe('Cancellation', () => {
    it('should cancel current attempt', async () => {
      const { result } = renderHook(() => useReportGenerationController());
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };
      
      // Start attempt
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-1' } }),
        })
      );
      
      act(() => {
        result.current.start(input, 'life-summary');
      });
      
      await waitFor(() => {
        expect(result.current.status).toBe('polling');
      });
      
      // Cancel
      act(() => {
        result.current.cancel();
      });
      
      // Should return to idle
      expect(result.current.status).toBe('idle');
      expect(result.current.reportId).toBeNull();
    });
  });

  describe('State Transitions', () => {
    it('should transition from idle to verifying to generating', async () => {
      const { result } = renderHook(() => useReportGenerationController());
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };
      
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({ 
            ok: true, 
            data: { 
              status: 'completed', 
              reportId: 'report-1', 
              content: { title: 'Test Report', sections: [] } 
            } 
          }),
        })
      );
      
      await act(async () => {
        await result.current.start(input, 'life-summary');
      });
      
      // Should transition through states
      await waitFor(
        () => {
          expect(result.current.status).toBe('completed');
        },
        { timeout: 3000 }
      );
      
      expect(result.current.reportId).toBe('report-1');
      expect(result.current.reportContent).not.toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors', async () => {
      const { result } = renderHook(() => useReportGenerationController());
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };
      
      (global.fetch as any).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: async () => ({ error: 'API Error' }),
        })
      );
      
      act(() => {
        result.current.start(input, 'life-summary');
      });
      
      await waitFor(() => {
        expect(result.current.status).toBe('failed');
      });
      
      expect(result.current.error).toBe('API Error');
    });
  });

  describe('Payment Support', () => {
    it('should accept payment options', async () => {
      const { result } = renderHook(() => useReportGenerationController());
      
      const input: AIAstrologyInput = {
        name: 'Test User',
        dob: '1990-01-01',
        tob: '12:00',
        place: 'Mumbai',
      };
      
      (global.fetch as any).mockImplementationOnce((url: string, options: any) => {
        const body = JSON.parse(options.body);
        expect(body.paymentToken).toBe('token-123');
        expect(body.sessionId).toBe('session-123');
        
        return Promise.resolve({
          ok: true,
          json: async () => ({ 
            ok: true, 
            data: { 
              status: 'completed', 
              reportId: 'report-1', 
              content: { title: 'Test Report', sections: [] } 
            } 
          }),
        });
      });
      
      await act(async () => {
        await result.current.start(input, 'marriage-timing', {
          paymentToken: 'token-123',
          sessionId: 'session-123',
          paymentIntentId: 'intent-123',
        });
      });
      
      await waitFor(
        () => {
          expect(result.current.status).toBe('completed');
        },
        { timeout: 3000 }
      );
    });
  });
});

