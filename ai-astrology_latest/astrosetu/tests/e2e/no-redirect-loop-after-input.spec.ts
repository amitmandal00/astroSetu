import { test, expect } from "@playwright/test";
import { resetStorage } from "./helpers/storage";

test.describe("No Redirect Loop After Input Submit", () => {
  test("purchase yearly analysis → input → preview with input_token → NO redirect back to input", async ({ page }) => {
    // Start clean, then hit preview (simulating purchase button click)
    await resetStorage(page);
    await page.goto("/ai-astrology/preview?reportType=year-analysis");

    // Should redirect to input page
    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 3000 });
    
    // Wait for form to load, then fill birth details
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    await page.waitForTimeout(1000);

    // Submit form
    await page.getByRole("button", { name: /submit|continue|generate/i }).click();

    // Should navigate to preview with input_token
    await page.waitForURL(/\/ai-astrology\/preview.*input_token=/, { timeout: 3000 });
    expect(page.url()).toContain("input_token=");
    expect(page.url()).toContain("reportType=year-analysis");

    // Wait for token to load (should show "Loading your details..." briefly)
    await page.waitForTimeout(2000);

    // CRITICAL: Should NOT redirect back to input
    // Should stay on preview page
    await page.waitForTimeout(3000); // Wait longer to ensure no redirect
    expect(page.url()).toContain("/ai-astrology/preview");
    expect(page.url()).not.toContain("/ai-astrology/input");
    
    // Should NOT show "Enter Your Birth Details" card
    await expect(page.getByText("Enter Your Birth Details")).not.toBeVisible();
    
    // Should NOT show "Redirecting..." stuck screen
    await expect(page.getByText("Redirecting...")).not.toBeVisible();
    
    // Should show purchase button or report content
    const hasPurchaseButton = await page.getByRole("button", { name: /purchase/i }).isVisible().catch(() => false);
    const hasReportContent = await page.getByText(/AI Astrology Report|Your Report/i).isVisible().catch(() => false);
    expect(hasPurchaseButton || hasReportContent).toBe(true);
  });

  test("bundle reports → input → preview with input_token → NO redirect back to input", async ({ page }) => {
    await resetStorage(page);
    await page.goto("/ai-astrology/input?reportType=year-analysis&bundleType=any-2&bundleReports=year-analysis,career-money");

    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: /submit|continue|generate/i }).click();

    await page.waitForURL(/\/ai-astrology\/preview.*input_token=/, { timeout: 3000 });
    expect(page.url()).toContain("input_token=");

    await page.waitForTimeout(2000);

    // Should NOT redirect back to input
    await page.waitForTimeout(3000);
    expect(page.url()).toContain("/ai-astrology/preview");
    expect(page.url()).not.toContain("/ai-astrology/input");
    
    await expect(page.getByText("Enter Your Birth Details")).not.toBeVisible();
    await expect(page.getByText("Redirecting...")).not.toBeVisible();
  });

  test("free life summary → input → preview with input_token → NO redirect back to input", async ({ page }) => {
    await resetStorage(page);
    await page.goto("/ai-astrology/preview?reportType=life-summary");

    await page.waitForURL(/\/ai-astrology\/input/, { timeout: 3000 });

    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="dob"]', "1990-01-01");
    await page.fill('input[name="tob"]', "12:00");
    await page.fill('input[name="place"]', "Mumbai");
    await page.waitForTimeout(1000);

    await page.getByRole("button", { name: /submit|continue|generate/i }).click();

    await page.waitForURL(/\/ai-astrology\/preview.*input_token=/, { timeout: 3000 });
    expect(page.url()).toContain("input_token=");

    await page.waitForTimeout(2000);

    // Should NOT redirect back to input
    await page.waitForTimeout(3000);
    expect(page.url()).toContain("/ai-astrology/preview");
    expect(page.url()).not.toContain("/ai-astrology/input");
    
    await expect(page.getByText("Enter Your Birth Details")).not.toBeVisible();
    await expect(page.getByText("Redirecting...")).not.toBeVisible();
  });
});

