import { test, expect } from "@playwright/test";

/**
 * CRITICAL FIX (ChatGPT): Subscribe must never silently return (no-op)
 * 
 * This test ensures that when subscription page has no input, clicking Subscribe
 * navigates to /input within 2s (NOT silent no-op).
 * 
 * Root cause: handleSubscribe() had `if (!input) return;` causing silent no-op.
 * Fix: Replace silent return with redirect to input page.
 */
test.describe("Subscription No-Op Prevented", () => {
  test("subscribe button redirects to input when no input exists", async ({ page }) => {
    // Clear sessionStorage to ensure no input exists
    await page.goto("/ai-astrology/subscription");
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Navigate to subscription page with no input
    await page.goto("/ai-astrology/subscription");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click Subscribe button
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    await expect(subscribeButton).toBeVisible();
    await subscribeButton.click();

    // CRITICAL: Assert within 2s that navigation to /ai-astrology/input happens
    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 2000 });

    // Verify we're on input page with correct params
    const currentUrl = page.url();
    expect(currentUrl).toContain("/ai-astrology/input");
    expect(currentUrl).toContain("reportType=life-summary");
    expect(currentUrl).toContain("flow=subscription");
    expect(currentUrl).toContain("returnTo=/ai-astrology/subscription");
  });

  test("subscribe button shows error message when no input exists", async ({ page }) => {
    // Clear sessionStorage
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Navigate to subscription page
    await page.goto("/ai-astrology/subscription");
    await page.waitForLoadState("networkidle");

    // Click Subscribe button
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    await subscribeButton.click();

    // CRITICAL: Assert that error message appears (not silent no-op)
    // The error message should say "Please enter birth details to subscribe"
    const errorMessage = page.getByText(/please enter birth details/i);
    await expect(errorMessage).toBeVisible({ timeout: 2000 });
  });

  test("subscribe button does NOT cause silent no-op (page stays same)", async ({ page }) => {
    // Clear sessionStorage
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Navigate to subscription page
    const initialUrl = "/ai-astrology/subscription";
    await page.goto(initialUrl);
    await page.waitForLoadState("networkidle");

    // Click Subscribe button
    const subscribeButton = page.getByRole("button", { name: /subscribe/i });
    await subscribeButton.click();

    // CRITICAL: Wait a bit and check that URL changed (not silent no-op)
    await page.waitForTimeout(500);
    const currentUrl = page.url();
    
    // Either we're on input page (redirect happened) OR error message is visible (not silent)
    const isOnInputPage = currentUrl.includes("/ai-astrology/input");
    const hasErrorMessage = await page.getByText(/please enter birth details/i).isVisible().catch(() => false);
    
    expect(isOnInputPage || hasErrorMessage).toBe(true);
    expect(currentUrl === initialUrl && !hasErrorMessage).toBe(false); // NOT silent no-op
  });
});

