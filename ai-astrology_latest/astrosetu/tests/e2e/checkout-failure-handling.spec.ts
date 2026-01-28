import { test, expect } from "@playwright/test";

/**
 * E2E Test: Checkout Failure Handling
 * 
 * Verifies that when checkout API fails, UI shows error and stops loading
 * (not stuck in "processing" state forever)
 */
test.describe("Checkout Failure Handling", () => {
  test("Purchase button shows error and stops loading when checkout API fails", async ({ page }) => {
    // Intercept checkout API to return 500 error
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Checkout configuration error",
          code: "CHECKOUT_CONFIG_ERROR",
        }),
      });
    });

    // Navigate to preview page with input data
    await page.goto("/ai-astrology/preview?reportType=year-analysis&auto_generate=false");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Find and click purchase button
    const purchaseButton = page.getByRole("button", { name: /Purchase.*Year Analysis/i });
    await expect(purchaseButton).toBeVisible();
    
    // Click purchase button
    await purchaseButton.click();

    // Wait for error to appear (should be within 15 seconds due to timeout)
    const errorMessage = page.getByText(/Checkout|error|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 20000 });

    // Verify loading state is cleared (button should be clickable again)
    await expect(purchaseButton).toBeEnabled({ timeout: 5000 });

    // Verify no infinite spinner
    const spinner = page.locator('[role="status"]').or(page.locator('.animate-spin'));
    await expect(spinner).not.toBeVisible({ timeout: 2000 });
  });

  test("Purchase button times out after 15 seconds and shows error", async ({ page }) => {
    // Intercept checkout API to hang (never respond)
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      // Don't fulfill - let it hang
      // In real scenario, this would timeout after 15s
    });

    // Navigate to preview page
    await page.goto("/ai-astrology/preview?reportType=year-analysis&auto_generate=false");
    await page.waitForLoadState("networkidle");

    // Click purchase button
    const purchaseButton = page.getByRole("button", { name: /Purchase.*Year Analysis/i });
    await purchaseButton.click();

    // Wait for timeout error (should appear within 20 seconds)
    const timeoutError = page.getByText(/timed out|timeout/i);
    await expect(timeoutError).toBeVisible({ timeout: 25000 });

    // Verify loading state is cleared
    await expect(purchaseButton).toBeEnabled({ timeout: 5000 });
  });
});

