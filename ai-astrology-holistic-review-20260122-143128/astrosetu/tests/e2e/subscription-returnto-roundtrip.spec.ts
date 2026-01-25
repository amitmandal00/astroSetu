import { test, expect } from "@playwright/test";
import { fillInputForm } from "./test-helpers";

/**
 * E2E Regression: Subscription onboarding should not drop users into free-report preview.
 *
 * If the subscription page is opened without aiAstrologyInput in sessionStorage,
 * it should redirect to input with returnTo=/ai-astrology/subscription and flow=subscription.
 * After submitting details, it must navigate back to /ai-astrology/subscription.
 */
test.describe("Subscription onboarding returnTo roundtrip", () => {
  test("subscription → input onboarding → returns to subscription dashboard", async ({ page }) => {
    // Ensure clean browser storage (simulate first-time user)
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto("/ai-astrology/subscription", { waitUntil: "domcontentloaded" });

    // Should redirect to input with returnTo
    await page.waitForURL(/\/ai-astrology\/input\?.*flow=subscription.*returnTo=%2Fai-astrology%2Fsubscription/, {
      timeout: 15000,
    });

    await fillInputForm(page);

    // After onboarding, should return to subscription dashboard (not preview).
    await page.waitForURL(/\/ai-astrology\/subscription$/, { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Monthly AI Astrology Outlook/i })).toBeVisible();
  });
});


