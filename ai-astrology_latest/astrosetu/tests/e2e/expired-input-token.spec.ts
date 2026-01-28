import { test, expect } from "@playwright/test";

/**
 * E2E Test: Expired Input Token
 * 
 * Verifies that expired input_token shows "Start again" within 2s
 */
test.describe("Expired Input Token", () => {
  test("Expired input_token shows 'Start again' within 2 seconds", async ({ page }) => {
    // Mock input-session API to return 410 (expired)
    await page.route("**/api/ai-astrology/input-session?token=expired_token*", async (route) => {
      await route.fulfill({
        status: 410,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Token has expired. Please start again.",
          code: "TOKEN_EXPIRED",
        }),
      });
    });

    // Navigate to preview with expired token
    await page.goto("/ai-astrology/preview?reportType=year-analysis&input_token=expired_token_123");

    // Wait for error to appear within 2 seconds
    const errorMessage = page.getByText(/expired|start again|invalid/i);
    await expect(errorMessage).toBeVisible({ timeout: 3000 });

    // Verify "Start again" button appears
    const startAgainButton = page.getByRole("button", { name: /start again|try again/i });
    await expect(startAgainButton).toBeVisible({ timeout: 1000 });
  });
});

