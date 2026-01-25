import { test, expect } from "@playwright/test";

/**
 * E2E Test: Checkout Attempt ID
 * 
 * Verifies that checkout attempt ID appears in error UI when API fails
 */
test.describe("Checkout Attempt ID", () => {
  test("Error UI shows checkout attempt ID when API fails", async ({ page }) => {
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

    // Navigate to preview page
    await page.goto("/ai-astrology/preview?reportType=year-analysis&auto_generate=false");
    await page.waitForLoadState("networkidle");

    // Click purchase button
    const purchaseButton = page.getByRole("button", { name: /Purchase.*Year Analysis/i });
    await purchaseButton.click();

    // Wait for error to appear (should be within 15 seconds due to timeout)
    const errorMessage = page.getByText(/Checkout|error|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 20000 });

    // CRITICAL: Verify error contains "Ref:" with attempt ID (format: "Ref: ABC12345")
    const errorWithRef = page.getByText(/Ref:\s*[A-Z0-9]{8}/i);
    await expect(errorWithRef).toBeVisible({ timeout: 2000 });

    // Verify attempt ID format (8 alphanumeric chars)
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/Ref:\s*[A-Z0-9]{8}/i);
  });
});

