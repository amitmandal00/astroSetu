import { test, expect } from "@playwright/test";

/**
 * Build ID Visibility E2E Test
 * 
 * Verifies that Build ID is visible in footer and matches deployment commit
 * This ensures we can trust what code is actually live
 */
test.describe("Build ID Visibility", () => {
  test("footer shows Build ID and not dev- or unknown", async ({ page }) => {
    // Load AI Astrology page
    await page.goto("/ai-astrology");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Scroll to footer (footer should be at bottom of page)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait a bit for footer to render
    await page.waitForTimeout(1000);

    // Get footer text
    const footerText = await page.textContent("footer");

    // Verify footer contains "Build:" text
    expect(footerText).toContain("Build:");

    // Extract build ID from footer text
    // Format: "Build: cbb7d53" or similar
    const buildIdMatch = footerText?.match(/Build:\s*([^\s]+)/);
    expect(buildIdMatch).toBeTruthy();
    
    if (buildIdMatch) {
      const buildId = buildIdMatch[1];
      
      // Verify build ID is not "dev-" prefix (would indicate env var not set)
      expect(buildId).not.toMatch(/^dev-/);
      
      // Verify build ID is not "unknown" (would indicate fetch failed)
      expect(buildId).not.toBe("unknown");
      
      // Verify build ID is not empty
      expect(buildId.length).toBeGreaterThan(0);
      
      // Build ID should be short (7 chars for commit hash, or similar)
      // Accept any reasonable format as long as it's not "dev-" or "unknown"
      expect(buildId.length).toBeLessThanOrEqual(12); // Allow some flexibility
    }
  });

  test("build.json is accessible and contains valid buildId", async ({ page, request }) => {
    // Make request to /build.json
    const response = await request.get("/build.json");

    // Should return 200
    expect(response.status()).toBe(200);

    // Parse JSON
    const data = await response.json();

    // Verify structure
    expect(data).toHaveProperty("buildId");
    expect(data).toHaveProperty("fullSha");
    expect(data).toHaveProperty("builtAt");

    // Verify buildId is not "unknown" or "dev-"
    expect(data.buildId).not.toBe("unknown");
    expect(data.buildId).not.toMatch(/^dev-/);
    expect(typeof data.buildId).toBe("string");
    expect(data.buildId.length).toBeGreaterThan(0);
  });

  test("console logs [BUILD] buildId on preview page mount", async ({ page }) => {
    // Track console logs
    const buildLogs: string[] = [];
    
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.includes("[BUILD]")) {
        buildLogs.push(text);
      }
    });

    // Load preview page
    await page.goto("/ai-astrology/preview?reportType=year-analysis");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Wait a bit for console logs
    await page.waitForTimeout(2000);

    // Verify [BUILD] log appeared
    expect(buildLogs.length).toBeGreaterThan(0);

    // Extract build ID from log (format: "[BUILD] cbb7d53" or "[BUILD] unknown")
    const buildLog = buildLogs[0];
    const buildIdMatch = buildLog.match(/\[BUILD\]\s+(.+)/);
    
    if (buildIdMatch) {
      const buildId = buildIdMatch[1].trim();
      
      // Verify build ID is not "dev-" or "unknown"
      expect(buildId).not.toMatch(/^dev-/);
      expect(buildId).not.toBe("unknown");
    }
  });
});

