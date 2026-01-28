import { test, expect } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

/**
 * CRITICAL FIX (ChatGPT): Preview must never show "Redirecting..." dead-state
 * 
 * This test ensures that when preview page has reportType in URL but no input,
 * it redirects to /input within 2s (NOT stuck on preview with "Redirecting...").
 * 
 * Root cause: hasReportTypeInUrl was gating redirect, causing "Redirecting..." to show forever.
 * Fix: Remove hasReportTypeInUrl gating, only show "Redirecting..." when redirectInitiatedRef.current === true.
 */
test.describe("Preview No Dead Redirecting State", () => {
  test("preview with reportType but no input redirects to input within 2s", async ({ page }) => {
    // Clear sessionStorage to ensure no input exists
    await resetStorage(page);

    // Navigate to preview with reportType but no input
    await page.goto("/ai-astrology/preview?reportType=life-summary");

    // CRITICAL: Assert within 2s that location is /ai-astrology/input (NOT stuck on preview)
    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 2000 });

    // Verify we're on input page (not stuck on preview with "Redirecting...")
    const currentUrl = page.url();
    expect(currentUrl).toContain("/ai-astrology/input");
    expect(currentUrl).toContain("reportType=life-summary");
    expect(currentUrl).not.toContain("/preview");
  });

  test("preview with reportType=year-analysis but no input redirects to input within 2s", async ({ page }) => {
    // Clear sessionStorage to ensure no input exists
    await resetStorage(page);

    // Navigate to preview with reportType but no input
    await page.goto("/ai-astrology/preview?reportType=year-analysis");

    // CRITICAL: Assert within 2s that location is /ai-astrology/input (NOT stuck on preview)
    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 2000 });

    // Verify we're on input page
    const currentUrl = page.url();
    expect(currentUrl).toContain("/ai-astrology/input");
    expect(currentUrl).toContain("reportType=year-analysis");
  });

  test("preview does NOT show 'Redirecting...' UI unless redirect was actually initiated", async ({ page }) => {
    // Clear sessionStorage
    await resetStorage(page);

    // Navigate to preview with reportType but no input
    await page.goto("/ai-astrology/preview?reportType=life-summary");

    // CRITICAL: Check that "Redirecting..." text does NOT appear (unless redirect was initiated)
    // If redirectInitiatedRef is false, we should see "Enter Your Birth Details" card instead
    const redirectingText = await page.textContent("body");
    
    // If redirect hasn't been initiated yet, we should see "Enter Your Birth Details" (not "Redirecting...")
    // OR we should be redirected to /input (which means redirect was initiated and succeeded)
    const isOnInputPage = page.url().includes("/ai-astrology/input");
    const hasRedirectingText = redirectingText?.includes("Redirecting...") || false;
    
    // Either we're on input page (redirect succeeded) OR we see "Enter Your Birth Details" (not "Redirecting...")
    expect(isOnInputPage || !hasRedirectingText).toBe(true);
  });
});

