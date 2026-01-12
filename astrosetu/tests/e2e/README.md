# E2E Tests for Report Generation

These tests verify the critical report generation journeys as recommended by ChatGPT's feedback.

## Tests Overview

### Core Functionality Tests

#### 1. `free-report.spec.ts`
Tests free report (life-summary) end-to-end flow:
- Form submission
- Report generation
- Report display

#### 2. `paid-report.spec.ts`
Tests paid report (year-analysis) end-to-end flow:
- Form submission
- Payment flow (may be bypassed in MOCK_MODE)
- Report generation
- Report display

#### 3. `payment-flow.spec.ts`
Tests payment success redirects to preview correctly:
- Payment prompt appearance
- Payment → preview redirect
- Payment verification

#### 4. `polling-completion.spec.ts`
Tests stuck screen prevention:
- Polling stops when status=completed
- No infinite loading state
- Timer stops when complete

#### 5. `retry-flow.spec.ts`
Tests retry functionality:
- Retry button appears on error
- Retry succeeds without duplicate charges
- Idempotency prevents duplicate API calls

### Extended Coverage Tests

#### 6. `bundle-reports.spec.ts`
Tests bundle report generation:
- any-2 bundle reports
- all-3 bundle reports
- Multiple report generation flow

#### 7. `all-report-types.spec.ts`
Tests all report types to ensure they work:
- marriage-timing
- career-money
- full-life
- major-life-phase
- decision-support

#### 8. `form-validation.spec.ts`
Tests form validation and error handling:
- Empty form submission
- Invalid date formats
- Missing required fields
- Coordinate resolution
- Field validation rules

#### 9. `navigation-flows.spec.ts`
Tests navigation scenarios:
- Back button navigation
- Direct URL navigation
- Browser refresh
- Multiple page navigation
- Data persistence across navigation

#### 10. `session-storage.spec.ts`
Tests session storage persistence:
- Form data saved
- Report type saved
- Bundle data saved
- Data availability after navigation

#### 11. `edge-cases.spec.ts`
Tests edge cases and boundary conditions:
- Long names
- Historical dates
- Special characters
- Midnight/end-of-day times
- Rapid form interactions
- Autocomplete edge cases

## Running Tests

### Prerequisites
1. Install dependencies: `npm install`
2. Ensure MOCK_MODE is enabled (tests use MOCK_MODE automatically via webServer config)

### Run All Tests
```bash
npm run test:e2e
```

### Run Tests with UI
```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (see browser)
```bash
npm run test:e2e:headed
```

### Run Tests in Debug Mode
```bash
npm run test:e2e:debug
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/free-report.spec.ts
```

### Run Tests by Category
```bash
# Core functionality only
npx playwright test tests/e2e/free-report.spec.ts tests/e2e/paid-report.spec.ts

# Extended coverage
npx playwright test tests/e2e/bundle-reports.spec.ts tests/e2e/all-report-types.spec.ts

# Validation and edge cases
npx playwright test tests/e2e/form-validation.spec.ts tests/e2e/edge-cases.spec.ts
```

## Test Configuration

Tests use:
- **MOCK_MODE=true** - Prevents OpenAI/Prokerala API calls
- **Base URL**: `http://localhost:3001` (configured in playwright.config.ts)
- **Test Data**: Amit Kumar Mandal (see test-helpers.ts)

## Expected Behavior

With MOCK_MODE enabled:
- Reports generate quickly (1.5-3 seconds)
- No API costs
- Tests run faster
- More reliable (no external API dependencies)

## Troubleshooting

### Tests Fail: "Server not running"
- Ensure dev server is running: `npm run dev`
- Or let Playwright start it automatically (webServer config)

### Tests Fail: "Element not found"
- Check if form structure changed
- Update selectors in test-helpers.ts
- Run with `--headed` to see what's happening

### Tests Timeout
- Check if MOCK_MODE is enabled
- Verify server is responding
- Increase timeout in test if needed

## Adding New Tests

1. Create new `.spec.ts` file in `tests/e2e/`
2. Use test-helpers.ts for shared functions
3. Follow existing test patterns
4. Use MOCK_MODE for fast, cost-free testing

