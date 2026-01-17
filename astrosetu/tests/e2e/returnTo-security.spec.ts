import { test, expect } from "@playwright/test";

/**
 * E2E Test: ReturnTo Security
 * 
 * Verifies that dangerous returnTo paths are blocked (external URLs, paths outside /ai-astrology/)
 */
test.describe("ReturnTo Security", () => {
  test("External URL in returnTo is ignored (uses default safe route)", async ({ page }) => {
    // Navigate to input page with external URL in returnTo
    await page.goto("/ai-astrology/input?reportType=life-summary&returnTo=https://evil.com/phishing");

    // Fill form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    
    // Wait for coordinates to resolve
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });

    // Submit form
    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Wait for navigation (should go to preview, not evil.com)
    await page.waitForURL(/\/preview/, { timeout: 15000 });

    // CRITICAL: Verify URL is preview (safe route), not external
    const url = page.url();
    expect(url).toMatch(/\/ai-astrology\/preview/);
    expect(url).not.toMatch(/evil\.com/);
    expect(url).not.toMatch(/https:\/\//);
  });

  test("Path outside /ai-astrology/ in returnTo is ignored", async ({ page }) => {
    // Navigate to input page with dangerous path in returnTo
    await page.goto("/ai-astrology/input?reportType=life-summary&returnTo=/admin/sensitive");

    // Fill and submit form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[placeholder*="Place"]', "Mumbai, Maharashtra, India");
    await page.waitForSelector('text=Coordinates resolved', { timeout: 10000 });

    const submitButton = page.getByRole("button", { name: /submit|continue|generate/i });
    await submitButton.click();

    // Wait for navigation (should go to preview, not /admin/sensitive)
    await page.waitForURL(/\/preview/, { timeout: 15000 });

    // Verify URL is preview (safe route), not /admin/
    const url = page.url();
    expect(url).toMatch(/\/ai-astrology\/preview/);
    expect(url).not.toMatch(/\/admin\//);
  });
});

