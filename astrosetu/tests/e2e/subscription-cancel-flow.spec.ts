import { test, expect } from "@playwright/test";

/**
 * E2E Regression: Cancel subscription flow should work from the subscription dashboard UI.
 *
 * We mock the billing endpoints to keep the test deterministic/offline:
 * - GET /api/billing/subscription -> active
 * - POST /api/billing/subscription/cancel -> cancel_at_period_end=true
 */

test.describe("Subscription cancel flow", () => {
  test("active subscription → cancel → UI shows canceled-at-period-end", async ({ page }) => {
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

    const activePayload = {
      ok: true,
      data: {
        status: "active",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        planInterval: "month",
      },
    };
    const canceledPayload = {
      ok: true,
      data: {
        status: "active",
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
        planInterval: "month",
      },
    };

    await page.route("**/api/billing/subscription", async (route) => {
      const req = route.request();
      if (req.method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(activePayload) });
        return;
      }
      await route.continue();
    });

    await page.route("**/api/billing/subscription/cancel", async (route) => {
      const req = route.request();
      if (req.method() === "POST") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(canceledPayload) });
        return;
      }
      await route.continue();
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("billing-subscription-status")).toContainText(/Active/i, { timeout: 15000 });
    await expect(page.getByTestId("billing-subscription-cancel")).toBeVisible();
    await page.getByTestId("billing-subscription-cancel").click();

    await expect(page.getByTestId("billing-subscription-confirm-cancel")).toBeVisible();
    await page.getByTestId("billing-subscription-confirm-cancel").click();

    await expect(page.getByTestId("billing-subscription-status")).toContainText(/Canceled/i, { timeout: 15000 });
  });
});


