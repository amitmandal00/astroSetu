/**
 * MVP Regression Tests for AI Astrology Generate Report Route
 * 
 * Tests critical MVP compliance rules:
 * 1. No automatic retries/repair attempts (deterministic fallback only)
 * 2. Terminal failures cancel payment
 * 3. Payment captured only after success
 * 4. No duplicate OpenAI calls (idempotency)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai-astrology/generate-report/route';

// Mock OpenAI
const mockOpenAICreate = vi.fn();
vi.mock('openai', () => ({
  OpenAI: vi.fn(() => ({
    chat: {
      completions: {
        create: mockOpenAICreate,
      },
    },
  })),
}));

// Mock Prokerala
vi.mock('@/lib/prokeralaEnhanced', () => ({
  getKundli: vi.fn().mockResolvedValue({
    success: true,
    data: {
      lagna: { sign: 1, degree: 10 },
      planets: [],
    },
  }),
}));

// Mock payment capture
const mockCapturePayment = vi.fn();
vi.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      capture: mockCapturePayment,
      cancel: vi.fn().mockResolvedValue({ id: 'pi_test', status: 'canceled' }),
    },
  },
}));

// Mock report cache
vi.mock('@/lib/ai-astrology/reportCache', () => ({
  cacheReport: vi.fn(),
  getCachedReport: vi.fn().mockResolvedValue(null),
}));

// Mock stored report functions
vi.mock('@/lib/ai-astrology/storedReports', () => ({
  markStoredReportCompleted: vi.fn(),
  markStoredReportFailed: vi.fn(),
  getStoredReport: vi.fn().mockResolvedValue(null),
}));

describe('MVP Compliance - Generate Report Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.MOCK_MODE = 'false';
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.STRIPE_SECRET_KEY = 'sk_test';
    process.env.NEXT_PUBLIC_APP_URL = 'https://test.example.com';
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost/api/ai-astrology/generate-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  };

  const validInput = {
    name: 'Test User',
    dob: '1990-01-01',
    time: '12:00:00',
    place: 'Mumbai, Maharashtra, India',
    gender: 'Male',
    reportType: 'career-money' as const,
    paymentToken: 'test_token',
    sessionId: 'test_session',
  };

  describe('MVP Rule #4: Failures are Terminal (No Automatic Retries)', () => {
    it('should NOT call OpenAI twice when validation fails', async () => {
      // Mock OpenAI to return short content (validation failure)
      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              report: 'Short report',
              sections: ['Overview'],
            }),
          },
        }],
      });

      const request = createRequest(validInput);
      const response = await POST(request);
      const data = await response.json();

      // Should only call OpenAI once (no repair attempt)
      expect(mockOpenAICreate).toHaveBeenCalledTimes(1);

      // Should either:
      // A) Apply deterministic fallback and succeed with qualityWarning
      // B) Fail terminally
      if (data.ok) {
        // Fallback succeeded
        expect(data.data.qualityWarning).toBeDefined();
      } else {
        // Terminal failure
        expect(data.error).toBeDefined();
        expect(data.errorCode).toBeDefined();
      }
    });

    it('should NOT call OpenAI again after deterministic fallback', async () => {
      // Mock OpenAI to return placeholder content
      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              report: 'This is a placeholder report',
              sections: ['Placeholder Section'],
            }),
          },
        }],
      });

      const request = createRequest({
        ...validInput,
        reportType: 'year-analysis', // Year-analysis has placeholder detection
      });
      
      const response = await POST(request);
      const data = await response.json();

      // Should only call OpenAI once
      expect(mockOpenAICreate).toHaveBeenCalledTimes(1);

      // Should apply deterministic fallback (no second OpenAI call)
      // Either succeeds with fallback or fails terminally
      expect(data.ok || data.error).toBeTruthy();
    });
  });

  describe('MVP Rule #3: Payment Captured Only After Success', () => {
    it('should NOT capture payment when validation fails terminally', async () => {
      // Mock OpenAI to return invalid content
      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              report: '', // Empty report
              sections: [],
            }),
          },
        }],
      });

      const request = createRequest({
        ...validInput,
        paymentIntentId: 'pi_test_failure',
      });

      const response = await POST(request);
      const data = await response.json();

      // Should fail terminally
      expect(data.ok).toBe(false);

      // Payment should NOT be captured (mockCapturePayment should not be called)
      expect(mockCapturePayment).not.toHaveBeenCalled();
    });

    it('should capture payment ONLY after successful generation', async () => {
      // Mock OpenAI to return valid content
      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              report: 'This is a comprehensive career and money report with detailed analysis of your professional path, financial opportunities, and strategic timing for major career moves. It includes insights into your strengths, challenges, and recommendations for maximizing your earning potential.',
              sections: [
                'Career Overview',
                'Financial Opportunities',
                'Strategic Timing',
                'Recommendations',
              ],
            }),
          },
        }],
      });

      mockCapturePayment.mockResolvedValueOnce({
        id: 'pi_test',
        status: 'succeeded',
      });

      const request = createRequest({
        ...validInput,
        paymentIntentId: 'pi_test_success',
      });

      const response = await POST(request);
      const data = await response.json();

      // Should succeed
      expect(data.ok).toBe(true);
      expect(data.data.status).toBe('completed');

      // Payment should be captured AFTER success
      // Note: Payment capture is fire-and-forget, so we check it was called
      // In real scenario, it happens in background after response
      expect(mockCapturePayment).toHaveBeenCalled();
    });
  });

  describe('MVP Rule #8: Same Input = Same Outcome (Idempotency)', () => {
    it('should return cached report on duplicate request', async () => {
      const { getCachedReport } = await import('@/lib/ai-astrology/reportCache');
      
      // Mock cache to return existing report
      vi.mocked(getCachedReport).mockResolvedValueOnce({
        content: {
          report: 'Cached report',
          sections: ['Cached Section'],
        },
        reportType: 'career-money',
        input: validInput,
      });

      const request = createRequest(validInput);
      const response1 = await POST(request);
      const data1 = await response1.json();

      // Second request with same input
      const response2 = await POST(request);
      const data2 = await response2.json();

      // Should return same report (from cache)
      expect(data1.ok).toBe(true);
      expect(data2.ok).toBe(true);
      expect(data1.data.reportId).toBe(data2.data.reportId);

      // OpenAI should NOT be called (using cache)
      expect(mockOpenAICreate).not.toHaveBeenCalled();
    });
  });

  describe('MVP Rule #4: Deterministic Fallback (No External API Calls)', () => {
    it('should apply deterministic fallback without calling OpenAI', async () => {
      // Mock OpenAI to return content with insufficient sections
      mockOpenAICreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              report: 'Report with only 3 sections',
              sections: ['Section 1', 'Section 2', 'Section 3'],
            }),
          },
        }],
      });

      const request = createRequest({
        ...validInput,
        reportType: 'decision-support', // Requires 6 sections minimum
      });

      const response = await POST(request);
      const data = await response.json();

      // Should only call OpenAI once
      expect(mockOpenAICreate).toHaveBeenCalledTimes(1);

      // Should either:
      // A) Apply deterministic fallback and succeed with qualityWarning
      // B) Fail terminally if fallback also fails
      if (data.ok) {
        // Fallback succeeded - should have qualityWarning
        expect(data.data.qualityWarning).toBeDefined();
      } else {
        // Terminal failure
        expect(data.error).toBeDefined();
      }
    });
  });
});

