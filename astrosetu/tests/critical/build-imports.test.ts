/**
 * Critical Build Imports Test
 * 
 * This test ensures that all critical imports resolve correctly.
 * Missing modules will fail here before Vercel build, preventing deployment failures.
 * 
 * CRITICAL: This test must pass before any commit that adds new imports.
 */

describe("Critical Build Imports", () => {
  it("should resolve prompts.ts imports", async () => {
    // This will fail if futureWindows module is missing or path is incorrect
    await expect(
      import("../../src/lib/ai-astrology/prompts")
    ).resolves.toBeDefined();
  });
  
  it("should resolve futureWindows module", async () => {
    // This will fail if the file doesn't exist or exports are missing
    const module = await import("../../src/lib/time/futureWindows");
    expect(module.getCurrentYear).toBeDefined();
    expect(module.ensureFutureYear).toBeDefined();
    expect(module.filterFutureWindows).toBeDefined();
    expect(module.getDefaultYearAnalysisYear).toBeDefined();
  });
  
  it("should resolve dateHelpers module", async () => {
    // This will fail if the file doesn't exist
    await expect(
      import("../../src/lib/ai-astrology/dateHelpers")
    ).resolves.toBeDefined();
  });
  
  it("should resolve reportGenerator module", async () => {
    // This will fail if the file doesn't exist
    await expect(
      import("../../src/lib/ai-astrology/reportGenerator")
    ).resolves.toBeDefined();
  });
});

