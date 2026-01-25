# Mock Mode Guide

**Purpose:** Mock mode allows you to test the entire report generation flow without calling OpenAI or Prokerala APIs, saving costs and enabling faster development/testing.

---

## How to Enable Mock Mode

### Option 1: Environment Variable

Add to `.env.local`:
```bash
MOCK_MODE=true
```

### Option 2: Temporary Testing

For a single test run:
```bash
MOCK_MODE=true npm run dev
```

---

## What Mock Mode Does

When `MOCK_MODE=true`:

1. **Bypasses OpenAI API calls** - No GPT-4 calls are made
2. **Bypasses Prokerala API calls** - No astrology API calls are made
3. **Returns realistic mock data** - Uses fixtures that match real report structure
4. **Simulates API delays** - Adds 1.5-3 second delays for realistic testing
5. **Caches mock reports** - Mock reports are cached for idempotency testing

---

## Mock Report Structure

Mock reports include:
- ✅ All required fields matching `ReportContent` type
- ✅ Realistic structure (sections, summaries, recommendations)
- ✅ Report IDs that follow the same format
- ✅ Timestamps and metadata

**Note:** Mock data is clearly labeled as test data in the content.

---

## Use Cases

### 1. E2E Testing
Run Playwright/Cypress tests without spending money:
```bash
MOCK_MODE=true npm run test:e2e
```

### 2. Development
Test UI changes without API costs:
```bash
MOCK_MODE=true npm run dev
```

### 3. CI/CD
Run tests in CI without API keys:
```bash
MOCK_MODE=true npm run test
```

---

## Limitations

- Mock reports are **not personalized** - Same content for all inputs
- Mock reports are **clearly labeled** as test data
- Payment verification still works (if Stripe is configured)
- Idempotency caching still works (uses mock data)

---

## Disabling Mock Mode

To use real APIs:
1. Remove `MOCK_MODE=true` from `.env.local`, OR
2. Set `MOCK_MODE=false` in `.env.local`

**Default:** Mock mode is **disabled** by default (requires explicit `MOCK_MODE=true`)

---

## Testing with Mock Mode

### Test Free Reports
```bash
MOCK_MODE=true npm run dev
# Navigate to /ai-astrology/input?reportType=life-summary
# Fill form and submit
# Report will be generated instantly with mock data
```

### Test Paid Reports
```bash
MOCK_MODE=true npm run dev
# Navigate to paid report flow
# Payment verification works normally
# Report generation uses mock data
```

### Test Bundle Reports
```bash
MOCK_MODE=true npm run dev
# Navigate to bundle purchase
# All reports in bundle use mock data
```

---

## Mock Fixtures Location

Mock fixtures are defined in:
- `src/lib/ai-astrology/mocks/fixtures.ts`

To customize mock data, edit this file.

---

## Integration with Tests

Mock mode is automatically used when `MOCK_MODE=true` is set in the environment. Your E2E tests should set this:

```typescript
// playwright.config.ts
process.env.MOCK_MODE = 'true';
```

---

## Troubleshooting

### Mock mode not working?
1. Check `.env.local` has `MOCK_MODE=true`
2. Restart dev server after changing env vars
3. Check server logs for `[MOCK MODE]` messages

### Want to test real APIs?
1. Remove or set `MOCK_MODE=false`
2. Ensure OpenAI/Prokerala keys are configured
3. Restart server

---

## Related Files

- `src/lib/ai-astrology/mocks/fixtures.ts` - Mock data fixtures
- `src/app/api/ai-astrology/generate-report/route.ts` - Mock mode check
- `REPORT_GENERATION_STATE_MACHINE.md` - State machine documentation

