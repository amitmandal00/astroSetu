import { test, expect } from "@playwright/test";

/**
 * E2E Test: Input Token Flow
 * 
 * Verifies that preview page can load input data from input_token
 * even when sessionStorage is unavailable (incognito, Safari ITP, etc.)
 */
test.describe("Input Token Flow", () => {
  test("Preview page loads input from input_token when sessionStorage is empty", async ({ page, context }) => {
    // Clear all storage before test
    await context.clearCookies();
    await page.addInitScript(() => {
      // Mock sessionStorage to be empty/unavailable
      Object.defineProperty(window, "sessionStorage", {
        value: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
        },
        writable: true,
      });
    });

    // Mock input-session API to return test data
    await page.route("**/api/ai-astrology/input-session?token=*", async (route) => {
      const url = new URL(route.request().url());
      const token = url.searchParams.get("token");
      
      if (token && token.startsWith("test_token_")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            data: {
              input: {
                name: "Test User",
                dob: "1990-01-01",
                tob: "12:00:00",
                place: "Mumbai, Maharashtra, India",
                latitude: 19.0760,
                longitude: 72.8777,
                gender: "Male",
                timezone: "Asia/Kolkata",
              },
              reportType: "year-analysis",
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({
            ok: false,
            error: "Invalid or expired token",
            code: "TOKEN_NOT_FOUND",
          }),
        });
      }
    });

    // Navigate to preview with input_token
    await page.goto("/ai-astrology/preview?reportType=year-analysis&input_token=test_token_123");

    // Verify page loads without redirect loop
    await page.waitForLoadState("networkidle");

    // Verify input data is loaded (check for user name or report type)
    const reportTitle = page.getByText(/Year Analysis|Unlock Your Year/i);
    await expect(reportTitle).toBeVisible({ timeout: 10000 });

    // Verify no redirect to input page
    await expect(page).toHaveURL(/\/preview/, { timeout: 5000 });
  });

  test("Preview page shows 'Start again' when input_token is invalid", async ({ page }) => {
    // Mock input-session API to return 404
    await page.route("**/api/ai-astrology/input-session?token=*", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Invalid or expired token",
          code: "TOKEN_NOT_FOUND",
        }),
      });
    });

    // Navigate to preview with invalid token
    await page.goto("/ai-astrology/preview?reportType=year-analysis&input_token=invalid_token");

    // Wait for error to appear
    const errorMessage = page.getByText(/expired|start again|invalid/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Verify "Start again" button appears
    const startAgainButton = page.getByRole("button", { name: /start again|try again/i });
    await expect(startAgainButton).toBeVisible({ timeout: 5000 });
  });
});

