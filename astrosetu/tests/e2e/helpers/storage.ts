import type { BrowserContext, Page } from "@playwright/test";

const ABOUT_BLANK = "about:blank";

export async function resetStorage(page: Page, context?: BrowserContext) {
  if (context) {
    await context.clearCookies();
  }

  const currentUrl = page.url();
  if (!currentUrl || currentUrl === ABOUT_BLANK) {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  }

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

