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

async function flushMicrotasks() {
  // Ensure state updates from resolved promises are applied under fake timers.
  await act(async () => {
    await Promise.resolve();
  });
}

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

    // Mock: first start -> processing, first poll -> ok:false (fail), retry start -> completed
    let postCount = 0;
    (global.fetch as any).mockImplementation((url: string, options?: RequestInit) => {
      const isPost = options?.method === 'POST';
      if (isPost) {
        postCount++;
        if (postCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-1' } }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            data: { status: 'completed', reportId: 'report-2', content: { title: 'Test', sections: [] } },
          }),
        } as Response);
      }

      // Polling request
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ ok: false, error: 'Generation failed' }),
      } as Response);
    });

    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });
    await flushMicrotasks();

    // Polling runs immediately; ok:false should fail fast (no hanging timers).
    expect(result.current.status).toBe('failed');

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
    await flushMicrotasks();

    expect(result.current.status).toBe('completed');
  }, { timeout: 15000 });

  it('should increment attempt ID on retry', async () => {
    const { result } = renderHook(() => useReportGenerationController());
    
    const input: AIAstrologyInput = {
      name: 'Test User',
      dob: '1990-01-01',
      tob: '12:00',
      place: 'Mumbai',
    };

    let postCount = 0;
    (global.fetch as any).mockImplementation((url: string, options?: RequestInit) => {
      const isPost = options?.method === 'POST';
      if (isPost) {
        postCount++;
        if (postCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-1' } }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            data: { status: 'completed', reportId: 'report-2', content: { title: 'Test', sections: [] } },
          }),
        } as Response);
      }

      // Polling stays in processing; we don't advance timers in this test.
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-1' } }),
      } as Response);
    });

    // First attempt
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });
    await flushMicrotasks();

    expect(result.current.status).toBe('polling');
    const attemptId1 = result.current.activeAttemptId;
    expect(attemptId1).not.toBeNull();

    // Cancel
    await act(async () => {
      result.current.cancel();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.activeAttemptId).toBeNull();

    // Second attempt (retry) - should have new attempt ID
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });
    await flushMicrotasks();

    expect(result.current.status).toBe('completed');
    const attemptId2 = result.current.activeAttemptId;
    expect(attemptId2).not.toBeNull();
    expect(attemptId2).not.toBe(attemptId1);
  }, { timeout: 15000 });

  it('should set start time on retry', async () => {
    const { result } = renderHook(() => useReportGenerationController());
    
    const input: AIAstrologyInput = {
      name: 'Test User',
      dob: '1990-01-01',
      tob: '12:00',
      place: 'Mumbai',
    };

    let postCount = 0;
    (global.fetch as any).mockImplementation((url: string, options?: RequestInit) => {
      const isPost = options?.method === 'POST';
      if (isPost) {
        postCount++;
        if (postCount === 1) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-1' } }),
          } as Response);
        }
        // Retry attempt: keep it in processing so we can assert startTime is set while polling is active.
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-2' } }),
        } as Response);
      }

      // First attempt polling fails fast to get to a retry scenario.
      // Retry attempt polling stays in processing so startTime remains non-null while active.
      if (postCount >= 2) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ ok: true, data: { status: 'processing', reportId: 'report-2' } }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ ok: false, error: 'Generation failed' }),
      } as Response);
    });

    // First attempt
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });
    await flushMicrotasks();

    expect(result.current.status).toBe('failed');

    // Cancel
    await act(async () => {
      result.current.cancel();
    });

    // Retry - should set new start time
    await act(async () => {
      await result.current.start(input, 'marriage-timing');
    });
    await flushMicrotasks();

    // Start time should be set
    expect(result.current.status).toBe('polling');
    expect(result.current.startTime).not.toBeNull();
  }, { timeout: 15000 });
});

