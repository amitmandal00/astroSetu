import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "@/app/api/ai-astrology/report-worker/route";
import type { AIAstrologyInput, ReportType } from "@/lib/ai-astrology/types";
import {
  getStoredReportByReportId,
  markStoredReportCompleted,
  markStoredReportFailed,
  updateStoredReportHeartbeat,
} from "@/lib/ai-astrology/reportStore";
import {
  generateFullLifeReport,
  generateYearAnalysisReport,
} from "@/lib/ai-astrology/reportGenerator";
import { validateReportBeforeCompletion } from "@/lib/ai-astrology/reportValidation";
import { applyDeterministicFallback_NO_API } from "@/lib/ai-astrology/deterministicFallback";

/**
 * Integration Test: Report Worker Lifecycle
 * 
 * ChatGPT Feedback: Tests that async worker route correctly handles report processing
 * 
 * This test ensures:
 * - Worker refuses if report not in "processing" status
 * - Worker completes and marks completed on success
 * - Worker applies deterministic fallback when validation fails
 * - Worker marks failed on terminal error
 * - Worker handles year-analysis degradation correctly
 * 
 * Success Criteria:
 * - Report status transitions: processing → completed OR processing → failed
 * - Validation failures trigger deterministic fallback
 * - Terminal failures mark as failed
 * - Year-analysis can degrade gracefully
 */

// Mock report store
vi.mock("@/lib/ai-astrology/reportStore", () => ({
  getStoredReportByReportId: vi.fn(),
  markStoredReportCompleted: vi.fn(),
  markStoredReportFailed: vi.fn(),
  updateStoredReportHeartbeat: vi.fn(),
}));

// Mock report generators
vi.mock("@/lib/ai-astrology/reportGenerator", () => ({
  generateFullLifeReport: vi.fn(),
  generateYearAnalysisReport: vi.fn(),
}));

// Mock validation
vi.mock("@/lib/ai-astrology/reportValidation", () => ({
  validateReportBeforeCompletion: vi.fn(),
}));

// Mock deterministic fallback
vi.mock("@/lib/ai-astrology/deterministicFallback", () => ({
  applyDeterministicFallback_NO_API: vi.fn(),
}));

describe("Report Worker Lifecycle", () => {
  const mockInput: AIAstrologyInput = {
    name: "Test User",
    dob: "1990-01-01",
    tob: "12:00",
    place: "Test City",
    gender: "Male",
    latitude: 0,
    longitude: 0,
    timezone: "UTC",
  };

  const mockReportId = "RPT-test-report-id";
  const mockIdempotencyKey = "test-idempotency-key";

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global fetch for payment capture/cancel
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 if report not found", async () => {
    // Arrange: Report doesn't exist
    vi.mocked(getStoredReportByReportId).mockResolvedValue(null);

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "year-analysis",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return 404
    expect(response.status).toBe(404);
    expect(data.ok).toBe(false);
    expect(data.error).toBe("Report not found");
    expect(markStoredReportCompleted).not.toHaveBeenCalled();
    expect(markStoredReportFailed).not.toHaveBeenCalled();
  });

  it("should return current status if report already completed", async () => {
    // Arrange: Report already completed
    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "completed",
      report_type: "year-analysis",
      input: mockInput,
      content: { title: "Test Report", sections: [] },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "year-analysis",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return current status without processing
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("completed");
    expect(data.message).toBe("Report already completed");
    expect(markStoredReportCompleted).not.toHaveBeenCalled();
    expect(markStoredReportFailed).not.toHaveBeenCalled();
  });

  it("should return current status if report already failed", async () => {
    // Arrange: Report already failed
    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "failed",
      report_type: "year-analysis",
      input: mockInput,
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: "Previous error",
    });

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "year-analysis",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should return current status without processing
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("failed");
    expect(data.message).toBe("Report already failed");
    expect(markStoredReportCompleted).not.toHaveBeenCalled();
    expect(markStoredReportFailed).not.toHaveBeenCalled();
  });

  it("should transition processing → completed on successful generation", async () => {
    // Arrange: Report in processing, generation succeeds, validation passes
    const mockReportContent = {
      title: "Year Analysis 2026",
      sections: [
        { title: "Year Theme", content: "Test content" },
        { title: "Career", content: "Test content" },
        { title: "Relationships", content: "Test content" },
        { title: "Health", content: "Test content" },
      ],
    };

    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "processing",
      report_type: "year-analysis",
      input: mockInput,
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    vi.mocked(generateYearAnalysisReport).mockResolvedValue(mockReportContent);
    vi.mocked(validateReportBeforeCompletion).mockReturnValue({ valid: true });
    vi.mocked(markStoredReportCompleted).mockResolvedValue();

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "year-analysis",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should mark as completed
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("completed");
    expect(markStoredReportCompleted).toHaveBeenCalledWith({
      idempotencyKey: mockIdempotencyKey,
      reportId: mockReportId,
      content: mockReportContent,
    });
    expect(markStoredReportFailed).not.toHaveBeenCalled();
  });

  it("should transition processing → failed on generation error", async () => {
    // Arrange: Report in processing, generation fails
    const errorMessage = "Report generation failed: OpenAI API error";

    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "processing",
      report_type: "year-analysis",
      input: mockInput,
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    vi.mocked(generateYearAnalysisReport).mockRejectedValue(new Error(errorMessage));
    vi.mocked(markStoredReportFailed).mockResolvedValue();

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "year-analysis",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should mark as failed
    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.status).toBe("failed");
    expect(markStoredReportFailed).toHaveBeenCalledWith({
      idempotencyKey: mockIdempotencyKey,
      reportId: mockReportId,
      errorCode: "GENERATION_ERROR",
      errorMessage: errorMessage,
    });
    expect(markStoredReportCompleted).not.toHaveBeenCalled();
  });

  it("should apply deterministic fallback when validation fails", async () => {
    // Arrange: Report in processing, validation fails, fallback succeeds
    const mockReportContent = {
      title: "Year Analysis 2026",
      sections: [{ title: "Test", content: "Short content" }],
    };

    const mockFallbackContent = {
      title: "Year Analysis 2026",
      sections: [
        { title: "Year Theme", content: "Fallback content" },
        { title: "Career", content: "Fallback content" },
        { title: "Relationships", content: "Fallback content" },
        { title: "Health", content: "Fallback content" },
      ],
    };

    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "processing",
      report_type: "year-analysis",
      input: mockInput,
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    vi.mocked(generateYearAnalysisReport).mockResolvedValue(mockReportContent);
    vi.mocked(validateReportBeforeCompletion)
      .mockReturnValueOnce({ 
        valid: false, 
        error: "Content too short", 
        errorCode: "VALIDATION_FAILED" 
      })
      .mockReturnValueOnce({ valid: true }); // Fallback validation passes
    vi.mocked(applyDeterministicFallback_NO_API).mockResolvedValue(mockFallbackContent);
    vi.mocked(markStoredReportCompleted).mockResolvedValue();

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "year-analysis",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should apply fallback and mark as completed
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("completed");
    expect(applyDeterministicFallback_NO_API).toHaveBeenCalledWith(
      mockReportContent,
      "year-analysis",
      "VALIDATION_FAILED"
    );
    expect(markStoredReportCompleted).toHaveBeenCalledWith({
      idempotencyKey: mockIdempotencyKey,
      reportId: mockReportId,
      content: mockFallbackContent,
    });
    expect(markStoredReportFailed).not.toHaveBeenCalled();
  });

  it("should allow degradation for year-analysis when content too short", async () => {
    // Arrange: Report in processing, validation fails, fallback also too short, but year-analysis can degrade
    const mockReportContent = {
      title: "Year Analysis 2026",
      sections: [{ title: "Test", content: "Short content" }],
    };

    const mockFallbackContent = {
      title: "Year Analysis 2026",
      sections: [
        { title: "Year Theme", content: "Fallback content" },
        { title: "Career", content: "Fallback content" },
      ],
    };

    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "processing",
      report_type: "year-analysis",
      input: mockInput,
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    vi.mocked(generateYearAnalysisReport).mockResolvedValue(mockReportContent);
    vi.mocked(validateReportBeforeCompletion)
      .mockReturnValueOnce({ 
        valid: false, 
        error: "Content too short", 
        errorCode: "VALIDATION_FAILED" 
      })
      .mockReturnValueOnce({ 
        valid: false, 
        error: "Year-analysis report content too short. Found 200 words, minimum 800 required",
        errorCode: "VALIDATION_FAILED" 
      }); // Fallback validation also fails (too short)
    vi.mocked(applyDeterministicFallback_NO_API).mockResolvedValue(mockFallbackContent);
    vi.mocked(markStoredReportCompleted).mockResolvedValue();

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "year-analysis",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should allow degradation for year-analysis and mark as completed
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("completed");
    expect(markStoredReportCompleted).toHaveBeenCalledWith({
      idempotencyKey: mockIdempotencyKey,
      reportId: mockReportId,
      content: mockFallbackContent,
    });
    expect(markStoredReportFailed).not.toHaveBeenCalled();
  });

  it("should fail terminal if fallback validation fails for non-year-analysis", async () => {
    // Arrange: Report in processing, validation fails, fallback also fails (not year-analysis)
    const mockReportContent = {
      title: "Full Life Report",
      sections: [{ title: "Test", content: "Short content" }],
    };

    const mockFallbackContent = {
      title: "Full Life Report",
      sections: [{ title: "Test", content: "Still short" }],
    };

    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "processing",
      report_type: "full-life",
      input: mockInput,
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    vi.mocked(generateFullLifeReport).mockResolvedValue(mockReportContent);
    vi.mocked(validateReportBeforeCompletion)
      .mockReturnValueOnce({ 
        valid: false, 
        error: "Content too short", 
        errorCode: "VALIDATION_FAILED" 
      })
      .mockReturnValueOnce({ 
        valid: false, 
        error: "Full-life report content too short. Found 100 words, minimum 1300 required",
        errorCode: "VALIDATION_FAILED" 
      }); // Fallback validation also fails
    vi.mocked(applyDeterministicFallback_NO_API).mockResolvedValue(mockFallbackContent);
    vi.mocked(markStoredReportFailed).mockResolvedValue();

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "full-life",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should mark as failed (terminal failure)
    expect(response.status).toBe(500);
    expect(data.ok).toBe(false);
    expect(data.status).toBe("failed");
    expect(markStoredReportFailed).toHaveBeenCalledWith({
      idempotencyKey: mockIdempotencyKey,
      reportId: mockReportId,
      errorCode: "GENERATION_ERROR",
      errorMessage: expect.stringContaining("Fallback validation failed"),
    });
    expect(markStoredReportCompleted).not.toHaveBeenCalled();
  });

  it("should handle full-life report type", async () => {
    // Arrange: Report in processing, full-life generation succeeds
    const mockReportContent = {
      title: "Full Life Report",
      sections: [
        { title: "Life Path", content: "Test content" },
        { title: "Career", content: "Test content" },
        { title: "Relationships", content: "Test content" },
        { title: "Health", content: "Test content" },
        { title: "Spiritual", content: "Test content" },
        { title: "Action Plan", content: "Test content" },
      ],
    };

    vi.mocked(getStoredReportByReportId).mockResolvedValue({
      idempotency_key: mockIdempotencyKey,
      report_id: mockReportId,
      status: "processing",
      report_type: "full-life",
      input: mockInput,
      content: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      error_message: null,
    });

    vi.mocked(generateFullLifeReport).mockResolvedValue(mockReportContent);
    vi.mocked(validateReportBeforeCompletion).mockReturnValue({ valid: true });
    vi.mocked(markStoredReportCompleted).mockResolvedValue();

    // Act: Call worker endpoint
    const request = new Request("http://localhost:3000/api/ai-astrology/report-worker", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId: mockReportId,
        reportType: "full-life",
        input: mockInput,
        idempotencyKey: mockIdempotencyKey,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Assert: Should mark as completed
    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.status).toBe("completed");
    expect(generateFullLifeReport).toHaveBeenCalledWith(mockInput, `worker-${mockReportId}`);
    expect(markStoredReportCompleted).toHaveBeenCalled();
  });
});

