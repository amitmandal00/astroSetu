import { test, expect } from "@playwright/test";

/**
 * E2E Regression: Subscribe must redirect to Stripe Checkout URL (no refresh loops).
 *
 * We mock the create-checkout API to return a Stripe checkout URL and ensure the browser navigates there.
 * We also fulfill the external checkout page to keep tests offline/deterministic.
 */

test.describe("Billing - Subscribe flow", () => {
  test("Clicking Subscribe navigates to Stripe checkout URL", async ({ page }) => {
    // Seed input (subscription page requires it)
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
      sessionStorage.setItem("aiAstrologyPaymentSessionId", "cs_test_mock_subscription_session");
    });

    // Mock DB status call so page doesn't block on missing cookie.
    await page.route("**/api/billing/subscription**", async (route) => {
      const req = route.request();
      if (req.method() === "GET") {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, error: "session_id is required" }),
        });
        return;
      }
      await route.continue();
    });

    // Mock create-checkout to return a Stripe URL
    await page.route("**/api/ai-astrology/create-checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: {
            sessionId: "cs_test_123",
            url: "https://checkout.stripe.com/test-session",
          },
        }),
      });
    });

    // Fulfill the external Stripe page to keep the test offline/deterministic.
    await page.route("https://checkout.stripe.com/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<html><body><h1>Mock Stripe Checkout</h1></body></html>",
      });
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    // Click Subscribe and confirm navigation to Stripe domain
    await page.getByRole("button", { name: /^Subscribe$/i }).click();
    await page.waitForURL(/checkout\.stripe\.com\/test-session/, { timeout: 10000 });
    await expect(page.locator("h1")).toHaveText(/Mock Stripe Checkout/);
  });
});


