# 🧪 Cursor Testing Automation Guide
## Minimizing Manual Testing with AI-Assisted Automation

This guide shows how to use Cursor's AI capabilities to set up comprehensive automated testing, reducing manual testing to a minimum.

---

## 📊 Current Testing Status

### ✅ What You Already Have
- **E2E Tests**: Playwright configured with 14 test files
- **Test Helpers**: Reusable test utilities (`test-helpers.ts`)
- **Mock Mode**: MOCK_MODE for cost-effective testing
- **CI Integration**: Playwright configured for CI/CD

### ❌ What's Missing (High Impact)
- **Unit Tests**: No unit tests for components/utilities
- **Component Tests**: No React component testing
- **API Route Tests**: No isolated API testing
- **Visual Regression**: No screenshot comparison tests
- **Accessibility Tests**: Limited automated a11y testing
- **Integration Tests**: Limited API integration tests

---

## 🎯 Testing Strategy: The Testing Pyramid

```
        /\
       /  \     E2E Tests (You have this ✅)
      /____\    
     /      \   Integration Tests (Add this)
    /________\  
   /          \  Unit Tests (Add this - HIGHEST IMPACT)
  /____________\
```

**Goal**: Move from mostly E2E tests to a balanced pyramid with:
- **70% Unit Tests** (fast, cheap, catch bugs early)
- **20% Integration Tests** (API routes, component integration)
- **10% E2E Tests** (critical user journeys - you have this)

---

## 🚀 Step 1: Set Up Unit Testing Framework

### Why Unit Tests?
- ⚡ **Fast**: Run in milliseconds vs minutes for E2E
- 💰 **Cheap**: No API costs, no browser overhead
- 🐛 **Early Detection**: Catch bugs before they reach E2E
- 🔄 **Confidence**: Refactor safely with test coverage

### Setup with Cursor

**Ask Cursor:**
> "Set up Vitest for unit testing React components and utilities in this Next.js project. Configure it to work alongside Playwright."

**Expected Result:**
- Vitest installed and configured
- Test scripts added to `package.json`
- Example test files created
- TypeScript support configured

---

## 🧩 Step 2: Generate Component Tests with Cursor

### Example: Test a Form Component

**Ask Cursor:**
> "Create unit tests for the AI Astrology input form component. Test form validation, field interactions, and submission logic. Use React Testing Library and Vitest."

**What Cursor Will Generate:**
```typescript
// tests/unit/components/AIInputForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AIInputForm from '@/components/AIInputForm';

describe('AIInputForm', () => {
  it('validates required fields', async () => {
    render(<AIInputForm />);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = vi.fn();
    render(<AIInputForm onSubmit={onSubmit} />);
    // ... fill form and submit
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  });
});
```

### Components to Test (Priority Order)

1. **Form Components** (High Priority)
   - AI Astrology Input Form
   - Contact Form
   - Kundli Form
   - Match Form

2. **UI Components** (Medium Priority)
   - Button
   - Input
   - Modal
   - Card

3. **Business Logic** (High Priority)
   - Date/time calculations
   - Coordinate resolution
   - Form validation logic
   - Payment calculations

**Ask Cursor for each:**
> "Generate comprehensive unit tests for [ComponentName]. Include edge cases, error handling, and accessibility checks."

---

## 🔌 Step 3: Test API Routes in Isolation

### Why Test API Routes Separately?
- Test without browser overhead
- Mock external dependencies (OpenAI, Prokerala)
- Test error scenarios easily
- Faster feedback loop

### Example: Test AI Astrology API

**Ask Cursor:**
> "Create unit tests for the AI astrology API route. Test success cases, error handling, validation, and mock OpenAI/Prokerala responses."

**What Cursor Will Generate:**
```typescript
// tests/unit/api/ai-astrology.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/ai-astrology/route';

describe('AI Astrology API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required fields', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('generates report successfully', async () => {
    vi.mock('openai', () => ({
      OpenAI: vi.fn(() => ({
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{ message: { content: 'Mock report' } }],
            }),
          },
        },
      })),
    }));

    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        dob: '1990-01-01',
        // ... other fields
      }),
    });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

**API Routes to Test:**
- `/api/ai-astrology/*` (all report types)
- `/api/contact`
- `/api/payment/*`
- `/api/wallet/*`

**Ask Cursor:**
> "Generate unit tests for all API routes in `/app/api`. Include success cases, error handling, and edge cases."

---

## 🎨 Step 4: Visual Regression Testing

### Why Visual Tests?
- Catch UI regressions automatically
- Verify responsive design
- Ensure consistent styling
- Test across browsers

### Setup with Playwright Visual Comparisons

**Ask Cursor:**
> "Add visual regression testing to the existing Playwright setup. Create screenshot comparison tests for key pages and components."

**What Cursor Will Add:**
```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('home page matches baseline', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home-page.png');
  });

  test('kundli form matches baseline', async ({ page }) => {
    await page.goto('/kundli');
    await expect(page).toHaveScreenshot('kundli-form.png');
  });
});
```

---

## ♿ Step 5: Automated Accessibility Testing

### Why A11y Tests?
- Legal compliance (WCAG 2.1)
- Better UX for all users
- Catch issues before production
- SEO benefits

**Ask Cursor:**
> "Add automated accessibility testing using @axe-core/playwright. Test all pages for WCAG 2.1 AA compliance and generate reports."

**What Cursor Will Add:**
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## 🔄 Step 6: Integration Tests

### Test Component + API Integration

**Ask Cursor:**
> "Create integration tests that test React components calling API routes. Use MSW (Mock Service Worker) to mock API responses."

**What Cursor Will Generate:**
```typescript
// tests/integration/report-generation.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import ReportPage from '@/app/ai-astrology/preview/page';

const server = setupServer(
  rest.post('/api/ai-astrology', (req, res, ctx) => {
    return res(ctx.json({ report: 'Mock report content' }));
  })
);

describe('Report Generation Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('displays report after API call', async () => {
    render(<ReportPage />);
    await waitFor(() => {
      expect(screen.getByText(/report/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📝 Step 7: Test Coverage Reports

### Track What's Tested

**Ask Cursor:**
> "Configure test coverage reporting with Vitest. Set up coverage thresholds and generate HTML reports. Add coverage to CI/CD."

**What Cursor Will Add:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
```

---

## 🤖 Step 8: AI-Powered Test Generation Workflow

### Daily Workflow with Cursor

1. **After Writing a Component:**
   ```
   "Generate unit tests for this component. Include edge cases and error handling."
   ```

2. **After Adding an API Route:**
   ```
   "Create tests for this API route. Test success, validation, and error cases."
   ```

3. **Before Committing:**
   ```
   "Run all tests and fix any failures. Ensure coverage is above 80%."
   ```

4. **When Fixing a Bug:**
   ```
   "Write a test that reproduces this bug, then fix it so the test passes."
   ```

5. **When Refactoring:**
   ```
   "Update tests for this refactored code. Ensure all tests still pass."
   ```

---

## 📋 Recommended Test Coverage Goals

### Phase 1: Critical Path (Week 1)
- ✅ Form validation logic (100% coverage)
- ✅ Payment flow logic (100% coverage)
- ✅ API route validation (100% coverage)
- ✅ Error handling (100% coverage)

### Phase 2: Components (Week 2)
- ✅ All form components (80% coverage)
- ✅ All UI components (70% coverage)
- ✅ Business logic utilities (90% coverage)

### Phase 3: Integration (Week 3)
- ✅ Component + API integration (70% coverage)
- ✅ E2E critical paths (already have)
- ✅ Visual regression (key pages)

### Phase 4: Polish (Week 4)
- ✅ Accessibility (all pages)
- ✅ Performance tests
- ✅ Edge cases

---

## 🛠️ Quick Commands Reference

### Run Tests
```bash
# Unit tests (fast)
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (existing)
npm run test:e2e

# All tests
npm run test:all

# Watch mode (during development)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Generate Tests with Cursor
1. Select a file/component
2. Ask: "Generate comprehensive tests for this"
3. Review generated tests
4. Run tests to verify
5. Commit tests with code

---

## 🎯 What Manual Testing Remains?

After implementing the above, you'll only need manual testing for:

1. **Visual Design Review** (10% of time)
   - Design consistency
   - Brand alignment
   - Subjective UX decisions

2. **Exploratory Testing** (5% of time)
   - Unexpected user flows
   - Creative edge cases
   - User acceptance testing

3. **Device-Specific Testing** (5% of time)
   - Physical device testing
   - Touch interactions
   - Device-specific bugs

**Total Manual Testing: ~20% of testing time** (down from 100%!)

---

## 📊 Expected Results

### Before (Current State)
- ⏱️ **E2E Tests**: 5-10 minutes per run
- 🧪 **Test Coverage**: ~20% (E2E only)
- 🐛 **Bug Detection**: Late (in E2E or production)
- 💰 **Cost**: High (API calls in tests)

### After (With Full Automation)
- ⚡ **Unit Tests**: < 30 seconds
- 🧪 **Test Coverage**: 80%+
- 🐛 **Bug Detection**: Early (in unit tests)
- 💰 **Cost**: Low (mocked APIs)
- ✅ **Confidence**: High (comprehensive coverage)

---

## 🚀 Getting Started: Your First Test

### Example: Test a Utility Function

1. **Find a utility function** (e.g., date formatting)
2. **Ask Cursor:**
   > "Create unit tests for this function. Test all edge cases including invalid inputs, timezones, and boundary conditions."
3. **Review and run tests**
4. **Commit with confidence**

### Example: Test a Component

1. **Open a component file**
2. **Ask Cursor:**
   > "Generate React Testing Library tests for this component. Test user interactions, props, and edge cases."
3. **Run tests and verify**
4. **Add to test suite**

---

## 💡 Pro Tips

1. **Test-Driven Development (TDD)**
   - Write tests first, then code
   - Ask Cursor: "Write tests for this feature before implementing it"

2. **Test Maintenance**
   - When tests break, ask Cursor: "Fix these failing tests"
   - Keep tests updated with code changes

3. **Test Documentation**
   - Ask Cursor: "Add JSDoc comments to these tests explaining what they verify"

4. **Continuous Improvement**
   - Review coverage reports
   - Ask Cursor: "Identify untested code paths and generate tests for them"

---

## 📚 Next Steps

1. **Set up Vitest** (Ask Cursor to do this)
2. **Generate first unit test** (Pick a utility function)
3. **Add component tests** (Start with forms)
4. **Add API route tests** (Start with critical routes)
5. **Set up coverage reporting** (Track progress)
6. **Add to CI/CD** (Automate test runs)

---

## 🎉 Summary

**Cursor can help you:**
- ✅ Set up testing frameworks automatically
- ✅ Generate comprehensive test suites
- ✅ Maintain and update tests
- ✅ Achieve 80%+ test coverage
- ✅ Reduce manual testing to ~20%

**Start by asking Cursor:**
> "Set up Vitest for unit testing and generate example tests for the AI astrology input form component."

Then gradually expand coverage using the strategies above!

