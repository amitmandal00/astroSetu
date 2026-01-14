/**
 * useReportGenerationController Hook
 * 
 * Owns generation + polling + cancellation.
 * Implements single-flight guard and cancellation contract.
 * 
 * This prevents:
 * - Multiple poll loops running simultaneously
 * - Stale attempts updating state
 * - Polling continuing after unmount/stage change
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { AIAstrologyInput, ReportType, ReportContent } from '@/lib/ai-astrology/types';
import {
  type ReportGenerationStatus,
  type ReportGenerationState,
  createInitialState,
  transitionState,
} from '@/lib/reportGenerationStateMachine';

export interface ReportGenerationProgress {
  current: number;
  total: number;
  currentReport: string | null;
}

export interface UseReportGenerationControllerReturn {
  // State
  status: ReportGenerationStatus;
  reportId: string | null;
  error: string | null;
  startTime: number | null;
  progress: ReportGenerationProgress | null;
  reportContent: ReportContent | null;
  // CRITICAL FIX 2 (ChatGPT): Add active attempt tracking for controller-sync matching
  activeAttemptId: string | null;
  activeReportType: ReportType | null;

  // Actions
  start: (
    input: AIAstrologyInput,
    reportType: ReportType,
    options?: {
      paymentToken?: string;
      sessionId?: string;
      paymentIntentId?: string;
    }
  ) => Promise<void>;
  cancel: () => void;
  retry: () => void;
}

export function useReportGenerationController(): UseReportGenerationControllerReturn {
  // State machine state
  const [state, setState] = useState<ReportGenerationState>(createInitialState());
  const [progress, setProgress] = useState<ReportGenerationProgress | null>(null);
  const [reportContent, setReportContent] = useState<ReportContent | null>(null);

  // CRITICAL: Single-flight guard
  const activeAttemptIdRef = useRef<string | null>(null);
  const activeReportTypeRef = useRef<ReportType | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate unique attempt ID
  const generateAttemptId = useCallback(() => {
    return `attempt-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }, []);

  // Cancel current attempt
  const cancel = useCallback(() => {
    // Abort polling
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear poll interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Clear active attempt
    activeAttemptIdRef.current = null;
    activeReportTypeRef.current = null;

    // Reset state to idle (use createInitialState to avoid transition issues)
    setState(createInitialState());
    setProgress(null);
    setReportContent(null);
  }, []);

  // Poll for report status
  const pollForReport = useCallback(
    async (
      reportId: string,
      attemptId: string,
      abortSignal: AbortSignal,
      maxAttempts: number = 30,
      pollInterval: number = 2000
    ) => {
      let pollAttempts = 0;

      const poll = async (): Promise<void> => {
        // CRITICAL: Check if this is still the active attempt
        if (activeAttemptIdRef.current !== attemptId) {
          console.log('[POLLING] Aborted - stale attempt');
          return;
        }

        // CRITICAL: Check if aborted
        if (abortSignal.aborted) {
          console.log('[POLLING] Aborted - signal aborted');
          return;
        }

        try {
          pollAttempts++;
          const response = await fetch(
            `/api/ai-astrology/generate-report?reportId=${reportId}`,
            { signal: abortSignal }
          );

          // CRITICAL: Check again after fetch (might have been aborted during fetch)
          if (activeAttemptIdRef.current !== attemptId || abortSignal.aborted) {
            return;
          }

          // CRITICAL FIX (ChatGPT): Don't throw on !response - handle abort/cancel gracefully
          // If response is null/undefined, it's likely due to abort/cancel, not a real error
          if (!response) {
            // Check if aborted - if so, silently return (not an error)
            if (abortSignal.aborted || activeAttemptIdRef.current !== attemptId) {
              console.log('[POLLING] No response - aborted or stale attempt');
              return;
            }
            // Only throw if not aborted (genuine network error)
            throw new Error('Polling failed: No response received');
          }

          if (!response.ok) {
            throw new Error(`Polling failed: ${response.status}`);
          }

          const data = await response.json();

          // CRITICAL: Check again after JSON parse
          if (activeAttemptIdRef.current !== attemptId || abortSignal.aborted) {
            return;
          }

          if (data.ok && data.data) {
            if (data.data.status === 'completed') {
              // CRITICAL: Final check before updating state
              if (activeAttemptIdRef.current !== attemptId || abortSignal.aborted) {
                return;
              }

              // Update state atomically
              setState((prev) =>
                transitionState(prev, 'completed', {
                  reportId: data.data.reportId,
                  error: null,
                })
              );
              setReportContent(data.data.content);
              return; // Success - stop polling
            } else if (data.data.status === 'processing') {
              // Still processing - continue polling
              if (pollAttempts < maxAttempts) {
                pollIntervalRef.current = setTimeout(() => {
                  poll();
                }, pollInterval);
              } else {
                // Max attempts reached
                if (activeAttemptIdRef.current !== attemptId || abortSignal.aborted) {
                  return;
                }
                setState((prev) =>
                  transitionState(prev, 'timeout', {
                    error: 'Report generation timed out',
                  })
                );
              }
            } else if (data.data.status === 'failed') {
              // Report failed
              if (activeAttemptIdRef.current !== attemptId || abortSignal.aborted) {
                return;
              }
              setState((prev) =>
                transitionState(prev, 'failed', {
                  error: data.data.error || 'Report generation failed',
                })
              );
            }
          }
        } catch (error: any) {
          // Ignore abort errors
          if (error.name === 'AbortError' || abortSignal.aborted) {
            return;
          }

          // CRITICAL: Check if still active attempt
          if (activeAttemptIdRef.current !== attemptId) {
            return;
          }

          console.error('[POLLING] Error:', error);

          // Retry on error (unless max attempts reached)
          if (pollAttempts < maxAttempts) {
            pollIntervalRef.current = setTimeout(() => {
              poll();
            }, pollInterval);
          } else {
            setState((prev) =>
              transitionState(prev, 'failed', {
                error: error.message || 'Polling failed',
              })
            );
          }
        }
      };

      // Start polling
      poll();
    },
    []
  );

  // Start report generation
  const start = useCallback(
    async (
      input: AIAstrologyInput,
      reportType: ReportType,
      options?: {
        paymentToken?: string;
        sessionId?: string;
        paymentIntentId?: string;
      }
    ) => {
      // CRITICAL: Cancel any existing attempt (single-flight guard)
      cancel();

      // Create new attempt
      const attemptId = generateAttemptId();
      activeAttemptIdRef.current = attemptId;
      activeReportTypeRef.current = reportType; // CRITICAL FIX 2: Track active report type
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Transition to verifying
      setState((prev) =>
        transitionState(prev, 'verifying', {
          startTime: Date.now(),
          error: null,
        })
      );

      try {
        // Build API URL with session_id if available
        let apiUrl = '/api/ai-astrology/generate-report';
        const isPaid = reportType !== 'life-summary';
        if (options?.sessionId && isPaid) {
          apiUrl = `/api/ai-astrology/generate-report?session_id=${encodeURIComponent(options.sessionId)}`;
        }

        // Call API to generate report
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input,
            reportType,
            paymentToken: isPaid ? options?.paymentToken : undefined,
            paymentIntentId: isPaid ? options?.paymentIntentId : undefined,
            sessionId: isPaid ? (options?.sessionId || undefined) : undefined,
          }),
          signal: abortController.signal,
        });

        // CRITICAL: Check if still active attempt
        if (activeAttemptIdRef.current !== attemptId || abortController.signal.aborted) {
          return; // Stale attempt - ignore
        }

        if (!response.ok) {
          const errorData = await response.json();
          setState((prev) =>
            transitionState(prev, 'failed', {
              error: errorData.error || 'Report generation failed',
            })
          );
          return;
        }

        const data = await response.json();

        // CRITICAL: Check again after JSON parse
        if (activeAttemptIdRef.current !== attemptId || abortController.signal.aborted) {
          return;
        }

        if (data.ok && data.data) {
          if (data.data.status === 'completed') {
            // Report completed immediately
            setState((prev) =>
              transitionState(prev, 'completed', {
                reportId: data.data.reportId,
                error: null,
              })
            );
            setReportContent(data.data.content);
          } else if (data.data.status === 'processing') {
            // Report is processing - start polling
            setState((prev) =>
              transitionState(prev, 'polling', {
                reportId: data.data.reportId,
                error: null,
              })
            );

            // Start polling
            await pollForReport(
              data.data.reportId,
              attemptId,
              abortController.signal
            );
          } else {
            // Other status
            setState((prev) =>
              transitionState(prev, 'failed', {
                error: data.error || 'Unknown status',
              })
            );
          }
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }

        // CRITICAL: Check if still active attempt
        if (activeAttemptIdRef.current !== attemptId) {
          return;
        }

        console.error('[GENERATION] Error:', error);
        setState((prev) =>
          transitionState(prev, 'failed', {
            error: error.message || 'Report generation failed',
          })
        );
      }
    },
    [cancel, generateAttemptId, pollForReport]
  );

  // Retry (reset to idle, then user can start again)
  const retry = useCallback(() => {
    cancel();
    setState(createInitialState());
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    status: state.status,
    reportId: state.reportId,
    error: state.error,
    startTime: state.startTime,
    progress,
    reportContent,
    // CRITICAL FIX 2: Expose active attempt tracking for controller-sync matching
    activeAttemptId: activeAttemptIdRef.current,
    activeReportType: activeReportTypeRef.current,
    start,
    cancel,
    retry,
  };
}

