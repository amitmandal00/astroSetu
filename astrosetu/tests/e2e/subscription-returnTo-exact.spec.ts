import { test, expect } from "@playwright/test";

/**
 * E2E Test: Subscription ReturnTo Exact Navigation
 * 
 * Verifies that after providing birth details from subscription page,
 * user is returned to subscription page EXACT pathname (not preview)
 */
test.describe("Subscription ReturnTo Navigation", () => {
  test("Subscription → Input → Returns to Subscription (exact pathname)", async ({ page }) => {
    // Navigate to subscription page
    await page.goto("/ai-astrology/subscription");

    // Wait for redirect to input (if birth details missing)
    await page.waitForURL(/\/input/, { timeout: 10000 });

    // Verify returnTo parameter is present
    const url = page.url();
    expect(url).toContain("returnTo=");
    expect(url).toContain("flow=subscription");

    // Fill birth details form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    
    // Wait for coordinates to resolve
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });

    // Submit form
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Wait for navigation back to subscription
    await page.waitForURL(/\/subscription/, { timeout: 15000 });

    // CRITICAL: Verify EXACT pathname (not preview)
    expect(page.url()).toMatch(/\/ai-astrology\/subscription(\?|$)/);
    expect(page.url()).not.toMatch(/\/preview/);

    // Verify subscription page content is visible
    const subscriptionTitle = page.getByText(/Monthly AI Astrology Outlook|Subscription/i);
    await expect(subscriptionTitle).toBeVisible({ timeout: 5000 });
  });
});

