/**
 * @fileoverview Ultra-Cheap Canary Test: Preview No Processing Without Start
 * 
 * ChatGPT Feedback: "Add one ultra-cheap canary test (optional but powerful)"
 * 
 * This test locks in the "session_id ≠ processing" invariant forever.
 * It verifies that loading a preview page with a valid session_id but auto_generate=false
 * does NOT show "Generating..." UI after hydration.
 * 
 * This future-proofs the exact bug that caused "first-load only" issues:
 * - UI showing "processing" just because session_id exists in URL
 * - Even when controller hasn't started (status === 'idle')
 * 
 * Key Principle: session_id is an identifier, NOT a state signal.
 */

import { test, expect, Page } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

test.describe("Preview No Processing Without Start (Canary Test)", () => {
  test("should NOT show Generating... UI when session_id exists but auto_generate=false", async ({ page, context }) => {
    // CRITICAL: Start with fresh browser context (no cookies, no storage)
    await resetStorage(page, context);

    // Seed sessionStorage with mock birth details (simulates valid input available)
    const mockInput = {
      name: "Test User",
      dob: "1990-01-01",
      tob: "10:00",
      place: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
      gender: "Female",
      timezone: "Asia/Kolkata",
    };
    await page.evaluate((input) => {
      sessionStorage.setItem("aiAstrologyInput", JSON.stringify(input));
      sessionStorage.setItem("aiAstrologyReportType", "year-analysis");
    }, mockInput);

    // Navigate to preview page with valid session_id but WITHOUT auto_generate=true
    // This simulates a scenario where session_id exists but generation should NOT start automatically
    const validSessionId = `valid_session_${Date.now()}_test`;
    const previewUrl = `/ai-astrology/preview?session_id=${validSessionId}&reportType=year-analysis`;
    // CRITICAL: Notice no auto_generate=true - generation should NOT start automatically
    
    await page.goto(previewUrl, { waitUntil: "domcontentloaded" });

    // Wait for hydration to complete (React state settles)
    await page.waitForTimeout(2000); // 2 seconds should be enough for hydration

    // CRITICAL ASSERTION 1: UI should NOT show "Generating..." just because session_id exists in URL
    // This is the core bug: UI showing processing when controller hasn't started
    // If isProcessingUI is driven by URL params (session_id), this will fail
    // If isProcessingUI is driven by controller status (correct), this will pass
    const generatingText = await page.locator('text=/Generating|Processing|Creating your report/').isVisible().catch(() => false);
    const spinnerVisible = await page.locator('[data-testid="generation-spinner"], .animate-spin').isVisible().catch(() => false);
    
    // CRITICAL: Both should be false - UI must NOT show processing state
    expect(
      generatingText,
      "UI must NOT show 'Generating...' text when session_id exists but auto_generate=false. session_id is an identifier, NOT a state signal. Controller status (idle) should drive UI, not URL params."
    ).toBe(false);
    
    expect(
      spinnerVisible,
      "UI must NOT show spinner when session_id exists but auto_generate=false. Controller status (idle) should drive UI, not URL params."
    ).toBe(false);

    // CRITICAL ASSERTION 2: Timer should NOT be visible (no generation started)
    const timerText = await page.locator('text=/Elapsed:|\\d+\\s*s|Taking longer/').isVisible().catch(() => false);
    expect(
      timerText,
      "Timer must NOT be visible when session_id exists but auto_generate=false. Timer should only appear when generation actually starts (controller status !== 'idle')."
    ).toBe(false);

    // CRITICAL ASSERTION 3: No network requests to generate-report endpoint
    // This verifies that controller.start() was NOT called
    const generationRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/ai-astrology/generate-report") && request.method() === "POST") {
        generationRequests.push(`${request.method()} ${url}`);
      }
    });

    // Wait a bit to ensure no delayed requests
    await page.waitForTimeout(3000);

    // CRITICAL: No POST to generate-report should have occurred
    const postRequests = generationRequests.filter((req) => req.startsWith("POST"));
    expect(
      postRequests.length,
      "No POST to generate-report should occur when auto_generate=false. Controller should remain idle until user explicitly starts generation."
    ).toBe(0);
  });

  test("should show Generating... UI ONLY when controller actually starts (auto_generate=true)", async ({ page, context }) => {
    // CRITICAL: This is the positive case - when auto_generate=true, UI SHOULD show processing
    // This ensures we didn't break the normal flow

    await resetStorage(page, context);

    // Seed sessionStorage with mock birth details
    const mockInput = {
      name: "Test User",
      dob: "1990-01-01",
      tob: "10:00",
      place: "Mumbai",
      latitude: 19.0760,
      longitude: 72.8777,
      gender: "Female",
      timezone: "Asia/Kolkata",
    };
    await page.evaluate((input) => {
      sessionStorage.setItem("aiAstrologyInput", JSON.stringify(input));
      sessionStorage.setItem("aiAstrologyReportType", "year-analysis");
    }, mockInput);

    // Navigate with auto_generate=true - this SHOULD start generation
    const validSessionId = `valid_session_${Date.now()}_test`;
    const previewUrl = `/ai-astrology/preview?session_id=${validSessionId}&reportType=year-analysis&auto_generate=true`;
    
    await page.goto(previewUrl, { waitUntil: "domcontentloaded" });

    // Wait for generation to start (controller should enter verifying/generating/polling)
    await page.waitForTimeout(5000); // 5 seconds should be enough for generation to start

    // CRITICAL ASSERTION: UI SHOULD show processing when controller actually starts
    // This verifies the correct behavior (controller status drives UI, not URL params)
    const generatingText = await page.locator('text=/Generating|Processing|Creating your report/').isVisible().catch(() => false);
    const spinnerVisible = await page.locator('[data-testid="generation-spinner"], .animate-spin').isVisible().catch(() => false);
    
    // At least one should be true when generation is actually happening
    const isProcessing = generatingText || spinnerVisible;
    expect(
      isProcessing,
      "UI SHOULD show processing when auto_generate=true and controller actually starts. This verifies controller status drives UI correctly."
    ).toBe(true);
  });
});

