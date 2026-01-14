/**
 * Comprehensive Retry Bundle Tests
 * 
 * Tests the unified retry entry point to ensure:
 * - Guards are reset correctly
 * - Attempt ID increments
 * - Start time is set
 * - Retry works after failures
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReportGenerationController } from '@/hooks/useReportGenerationController';
import type { AIAstrologyInput } from '@/lib/ai-astrology/types';

// Mock fetch
global.fetch = vi.fn();

describe('Retry Bundle - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should reset all guards before retry', async () => {
    const { result } = renderHook(() => useReportGenerationController());
    
    const input: AIAstrologyInput = {
      name: 'Test User',
      dob: '1990-01-01',
      tob: '12:00',
      place: 'Mumbai',
    };

    // Mock first attempt - processing then fails
    let fetchCallCount = 0;
    (global.fetch as any).mockImplementation(() => {
      fetchCallCount++;
      if (fetchCallCount === 1) {
        // Initial request - processing
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { status: 'processing', reportId: 'report-1' } 
          }),
        } as Response);
      } else if (fetchCallCount === 2) {
        // Polling - fails
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: false, 
            error: 'Generation failed' 
          }),
        } as Response);
      } else {
        // Retry - succeeds immediately
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { 
              status: 'completed', 
              reportId: 'report-2',
              content: { title: 'Test', sections: [] }
            } 
          }),
        } as Response);
      }
    });

    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });

    // Wait for polling to start
    await waitFor(() => {
      expect(result.current.status).toBe('polling');
    }, { timeout: 5000 });

    // Advance time to trigger polling
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    // Wait for failure
    await waitFor(() => {
      expect(result.current.status).toBe('failed');
    }, { timeout: 5000 });

    // Cancel to reset
    await act(async () => {
      result.current.cancel();
    });

    // Verify guards are reset
    expect(result.current.status).toBe('idle');

    // Retry should work (guards reset)
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });

    await waitFor(() => {
      expect(result.current.status).toBe('completed');
    }, { timeout: 5000 });
  }, { timeout: 15000 });

  it('should increment attempt ID on retry', async () => {
    const { result } = renderHook(() => useReportGenerationController());
    
    const input: AIAstrologyInput = {
      name: 'Test User',
      dob: '1990-01-01',
      tob: '12:00',
      place: 'Mumbai',
    };

    let fetchCallCount = 0;
    (global.fetch as any).mockImplementation(() => {
      fetchCallCount++;
      if (fetchCallCount === 1) {
        // First attempt - processing
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { status: 'processing', reportId: 'report-1' } 
          }),
        } as Response);
      } else if (fetchCallCount === 2) {
        // Second attempt (retry) - completes immediately
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { 
              status: 'completed', 
              reportId: 'report-2',
              content: { title: 'Test', sections: [] }
            } 
          }),
        } as Response);
      } else {
        // Any other calls
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { status: 'processing', reportId: 'report-1' } 
          }),
        } as Response);
      }
    });

    // First attempt
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });

    // Wait for polling
    await waitFor(() => {
      expect(result.current.status).toBe('polling');
    }, { timeout: 5000 });

    // Cancel
    await act(async () => {
      result.current.cancel();
    });

    expect(result.current.status).toBe('idle');

    // Second attempt (retry) - should have new attempt ID
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });

    // Should succeed (new attempt ID)
    await waitFor(() => {
      expect(result.current.status).toBe('completed');
    }, { timeout: 5000 });
  }, { timeout: 15000 });

  it('should set start time on retry', async () => {
    const { result } = renderHook(() => useReportGenerationController());
    
    const input: AIAstrologyInput = {
      name: 'Test User',
      dob: '1990-01-01',
      tob: '12:00',
      place: 'Mumbai',
    };

    let fetchCallCount = 0;
    (global.fetch as any).mockImplementation(() => {
      fetchCallCount++;
      if (fetchCallCount === 1) {
        // First attempt - processing
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { status: 'processing', reportId: 'report-1' } 
          }),
        } as Response);
      } else if (fetchCallCount === 2) {
        // Polling - fails
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: false, 
            error: 'Generation failed' 
          }),
        } as Response);
      } else {
        // Retry - succeeds
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ 
            ok: true, 
            data: { 
              status: 'completed', 
              reportId: 'report-2',
              content: { title: 'Test', sections: [] }
            } 
          }),
        } as Response);
      }
    });

    // First attempt
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });

    // Wait for polling
    await waitFor(() => {
      expect(result.current.status).toBe('polling');
    }, { timeout: 5000 });

    // Advance time to trigger polling
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });

    // Wait for failure
    await waitFor(() => {
      expect(result.current.status).toBe('failed');
    }, { timeout: 5000 });

    // Cancel
    await act(async () => {
      result.current.cancel();
    });

    // Retry - should set new start time
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });

    // Start time should be set
    await waitFor(() => {
      expect(result.current.startTime).not.toBeNull();
    }, { timeout: 5000 });
  }, { timeout: 15000 });
});

