/**
 * @fileoverview E2E Test: Subscription ReturnTo Contract
 * 
 * ChatGPT Feedback: This test verifies that the subscription flow correctly
 * uses returnTo parameter to bring users back to subscription page after entering birth details.
 * 
 * This test verifies:
 * - Subscription page redirects to input with returnTo=/ai-astrology/subscription
 * - Input page respects returnTo and navigates back to subscription after submission
 * - User journey: Subscription → Input (with returnTo) → Returns to Subscription
 */

import { test, expect, Page } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

test.describe("Subscription ReturnTo Contract", () => {
  test("Subscription → Input (with returnTo) → Returns to Subscription", async ({ page, context }) => {
    // CRITICAL: Start with fresh browser context (no cookies, no storage)
    // This simulates a new user visiting subscription page without birth details
    await resetStorage(page, context);

    // Step 1: Navigate to subscription page
    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    // Step 2: Should redirect to input page with correct returnTo and flow params
    // Subscription page checks for savedInput in sessionStorage - if missing, redirects to input
    await page.waitForURL(/\/ai-astrology\/input\?.*reportType=life-summary.*flow=subscription.*returnTo=%2Fai-astrology%2Fsubscription/, { timeout: 10000 });
    
    // Verify URL contains required params
    const currentUrl = page.url();
    expect(currentUrl, "Should redirect to input page with returnTo parameter").toContain("/ai-astrology/input");
    expect(currentUrl, "Should include returnTo=/ai-astrology/subscription").toContain("returnTo=%2Fai-astrology%2Fsubscription");
    expect(currentUrl, "Should include flow=subscription").toContain("flow=subscription");
    expect(currentUrl, "Should include reportType=life-summary").toContain("reportType=life-summary");

    // Step 3: Fill the birth details form
    // Name
    await page.fill('input[type="text"][placeholder*="name" i], input[name="name"]', "Test User");
    
    // Date of Birth
    await page.fill('input[type="date"]', "1990-01-01");
    
    // Time of Birth
    await page.fill('input[type="time"]', "10:00");
    
    // Place of Birth (using autocomplete or direct input)
    const placeInput = page.locator('input[placeholder*="place" i], input[placeholder*="city" i], input[name="place"]');
    await placeInput.fill("Mumbai");
    await page.waitForTimeout(1000); // Wait for autocomplete suggestions
    // Try to select from dropdown if available, otherwise just use the entered value
    const suggestion = page.locator('.autocomplete-suggestion, [role="option"]').first();
    const hasSuggestion = await suggestion.isVisible().catch(() => false);
    if (hasSuggestion) {
      await suggestion.click();
    }

    // Gender (optional)
    const genderSelect = page.locator('select[name="gender"], select').first();
    const hasGenderSelect = await genderSelect.isVisible().catch(() => false);
    if (hasGenderSelect) {
      await genderSelect.selectOption("Female");
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Get"), button:has-text("Continue")').first();
    await submitButton.click();

    // Step 4: Should return to subscription page after submission
    // Input page checks for returnTo parameter and navigates there instead of preview
    // ChatGPT Feedback: "subscription-returnTo.spec.ts must assert final URL equals /ai-astrology/subscription"
    await page.waitForURL(/\/ai-astrology\/subscription/, { timeout: 10000 });
    
    // CRITICAL ASSERTION: Final URL must exactly equal /ai-astrology/subscription (not just contain it)
    const finalUrl = page.url();
    const finalUrlPath = new URL(finalUrl).pathname;
    expect(
      finalUrlPath,
      "Final URL path must exactly equal /ai-astrology/subscription after input submission"
    ).toBe("/ai-astrology/subscription");
    
    // Verify subscription page content is visible
    const subscriptionContent = await page.locator('text=/Monthly AI Astrology Outlook|Subscribe/i').isVisible().catch(() => false);
    expect(subscriptionContent, "Subscription page content should be visible").toBe(true);
  });

  test("Input page respects returnTo parameter (not always redirect to preview)", async ({ page, context }) => {
    // CRITICAL: This test directly verifies that input/page.tsx respects returnTo
    // ChatGPT Feedback: "You do not route to returnTo" - but we verified it DOES (lines 211-214)
    // This test proves it works correctly

    await resetStorage(page, context);

    // Navigate directly to input page WITH returnTo parameter
    const returnToPath = "/ai-astrology/subscription";
    const inputUrl = `/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=${encodeURIComponent(returnToPath)}`;
    await page.goto(inputUrl, { waitUntil: "domcontentloaded" });

    // Fill the form
    await page.fill('input[type="text"][placeholder*="name" i], input[name="name"]', "Test User");
    await page.fill('input[type="date"]', "1990-01-01");
    await page.fill('input[type="time"]', "10:00");
    const placeInput = page.locator('input[placeholder*="place" i], input[placeholder*="city" i], input[name="place"]');
    await placeInput.fill("Mumbai");
    await page.waitForTimeout(1000);

    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Get"), button:has-text("Continue")').first();
    await submitButton.click();

    // CRITICAL ASSERTION: Should navigate to returnTo path, NOT to preview
    await page.waitForURL(/\/ai-astrology\/subscription/, { timeout: 10000 });
    
    const finalUrl = page.url();
    expect(finalUrl, "Should navigate to returnTo path").toContain(returnToPath);
    expect(finalUrl, "Should NOT navigate to preview page").not.toContain("/preview");
  });
});

