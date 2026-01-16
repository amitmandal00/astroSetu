import { test, expect } from "@playwright/test";

/**
 * E2E Regression: Subscription journey must complete without refresh loops.
 *
 * This uses the app's own MOCK_MODE create-checkout behavior:
 * - /api/ai-astrology/create-checkout returns a mock "test_session_subscription_*" and redirects to
 *   /ai-astrology/subscription/success?session_id=...
 * - success page calls /api/billing/subscription/verify-session which sets an HttpOnly cookie
 * - user lands on /ai-astrology/subscription and sees Active state
 *
 * Non-negotiable:
 * - After a reload, the subscription page should still render and should not bounce due to missing session_id recovery.
 */
test.describe("Subscription journey (no refresh loops)", () => {
  test("subscribe → success → dashboard becomes Active and survives refresh", async ({ page }) => {
    // Seed required input (subscription page currently expects it to initiate checkout)
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "aiAstrologyInput",
        JSON.stringify({
          name: "Amit Kumar Mandal",
          dob: "1984-11-26",
          tob: "10:30",
          place: "Noamundi, Jharkhand",
          gender: "Male",
          latitude: 22.16,
          longitude: 85.5,
          timezone: "Asia/Kolkata",
        })
      );
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /^Subscribe$/i }).click();

    // In MOCK_MODE we should route through the dedicated success page.
    await page.waitForURL(/\/ai-astrology\/subscription\/success\?session_id=test_session_subscription_/, {
      timeout: 15000,
    });

    // Success page redirects back to dashboard.
    await page.waitForURL(/\/ai-astrology\/subscription$/, { timeout: 15000 });

    // Should show active status from DB/API contract (test session path)
    await expect(page.getByTestId("billing-subscription-status")).toContainText(/Active/i, { timeout: 15000 });

    // Refresh should not break the journey.
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("billing-subscription-status")).toContainText(/Active/i, { timeout: 15000 });
  });
});


