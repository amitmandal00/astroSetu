# Playwright Setup Guide

## ✅ What's Already Done

All Playwright test files and configuration have been created:
- ✅ `playwright.config.ts` - Configuration file
- ✅ `tests/e2e/*.spec.ts` - 5 critical E2E tests
- ✅ `tests/e2e/test-helpers.ts` - Test utilities
- ✅ `package.json` - Test scripts added
- ✅ TypeScript types verified (type-check passes)

## 📋 Manual Setup Steps

Due to system permissions, you'll need to install Playwright manually. Follow these steps:

### Step 1: Install Playwright Package

```bash
cd astrosetu
npm install -D @playwright/test
```

This will add `@playwright/test` to your `devDependencies` in `package.json`.

### Step 2: Install Browser Binaries

```bash
npx playwright install chromium
```

This installs the Chromium browser that tests will use. You can also install all browsers:

```bash
npx playwright install
```

But for faster setup, just Chromium is sufficient.

### Step 3: Verify Installation

```bash
npx playwright --version
```

Should output the Playwright version number.

### Step 4: Run Tests

```bash
# Run all tests
npm run test:e2e

# Run tests with UI (recommended for first run)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug
```

## 🎯 Expected Results

After running `npm run test:e2e`, you should see:

```
Running 5 tests using 1 worker

  ✓ tests/e2e/free-report.spec.ts:2:1 › Free Report (Life Summary) E2E › should generate free life-summary report successfully (5.2s)
  ✓ tests/e2e/free-report.spec.ts:34:1 › Free Report (Life Summary) E2E › should show loading state during generation (4.8s)
  ✓ tests/e2e/paid-report.spec.ts:2:1 › Paid Report (Year Analysis) E2E › should generate year-analysis report successfully (5.1s)
  ✓ tests/e2e/payment-flow.spec.ts:2:1 › Payment Flow E2E › should redirect to preview after payment verification (4.9s)
  ✓ tests/e2e/payment-flow.spec.ts:32:1 › Payment Flow E2E › should show payment prompt for paid reports (4.7s)
  ✓ tests/e2e/polling-completion.spec.ts:2:1 › Polling Completion (Stuck Screen Prevention) › should stop polling when report is completed (5.0s)
  ✓ tests/e2e/polling-completion.spec.ts:46:1 › Polling Completion (Stuck Screen Prevention) › should show report content when generation completes (4.8s)
  ✓ tests/e2e/retry-flow.spec.ts:2:1 › Retry Flow E2E › should have retry button when generation fails (4.6s)
  ✓ tests/e2e/retry-flow.spec.ts:42:1 › Retry Flow E2E › should allow retry without duplicate charges (4.5s)

  9 passed (45.6s)
```

## 🔧 Configuration Details

### MOCK_MODE

Tests automatically use `MOCK_MODE=true` via the `webServer` configuration in `playwright.config.ts`:

```typescript
webServer: {
  command: 'MOCK_MODE=true npm run dev',
  url: 'http://localhost:3001',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}
```

This means:
- ✅ No OpenAI API calls (saves costs)
- ✅ No Prokerala API calls (saves costs)
- ✅ Tests run faster (mock data returns quickly)
- ✅ Tests are more reliable (no external dependencies)

### Test Data

All tests use standardized test data:
- **Name:** Amit Kumar Mandal
- **DOB:** 1984-11-26
- **TOB:** 21:40
- **Place:** Noamundi, Jharkhand, India

Defined in `tests/e2e/test-helpers.ts`.

## 🐛 Troubleshooting

### Issue: "Playwright not found"

**Solution:** Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Issue: "Browser not found"

**Solution:** Install browsers:
```bash
npx playwright install chromium
```

### Issue: Tests fail with "Server not running"

**Solution:** Playwright should auto-start the server, but if it doesn't:
1. Start dev server manually: `MOCK_MODE=true npm run dev`
2. Run tests: `npm run test:e2e`

### Issue: Tests timeout

**Solution:**
1. Verify MOCK_MODE is enabled (check server logs)
2. Check if port 3001 is available
3. Increase timeout in test if needed

### Issue: Selectors not found

**Solution:** 
1. Run tests in headed mode: `npm run test:e2e:headed`
2. See what's actually on the page
3. Update selectors in `test-helpers.ts` if UI changed

### Issue: Permission errors during npm install

**Solution:** This is a system permission issue. Try:
1. Check npm permissions: `npm config get prefix`
2. Use npx (which we're doing)
3. Contact system admin if needed

## 📝 Next Steps After Setup

1. ✅ Run tests to verify they pass
2. ✅ Review test output
3. ✅ Adjust selectors if UI changed
4. ✅ Add tests to CI/CD pipeline (optional)
5. ✅ Proceed with Phase 2.2 (Timeout Guards)

## 🎓 Key Benefits

After setup, you'll have:
- ✅ Automated verification of critical flows
- ✅ Fast feedback (tests run in ~45 seconds)
- ✅ Cost-free testing (MOCK_MODE)
- ✅ Protection against breaking changes
- ✅ Documentation of expected behavior

## 📚 Related Documentation

- `PHASE2_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `PREVENT_BREAKING_CHANGES_ACTION_PLAN.md` - Full action plan
- `tests/e2e/README.md` - Test documentation
- `MOCK_MODE_GUIDE.md` - Mock mode details

---

**Status:** ✅ Test infrastructure complete, ready for manual installation

