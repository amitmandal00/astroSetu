# 🚀 Testing Quick Start Guide

## What Cursor Just Set Up For You

✅ **Vitest** - Fast unit testing framework  
✅ **React Testing Library** - Component testing utilities  
✅ **Test Configuration** - Ready to use  
✅ **Example Tests** - Sample test file for validators  

---

## 📦 Install Dependencies

```bash
cd astrosetu
npm install
```

This will install:
- `vitest` - Testing framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `jsdom` - DOM environment for tests
- `@vitest/coverage-v8` - Coverage reporting

---

## 🧪 Run Your First Test

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode (auto-rerun on file changes)
npm run test:unit:watch

# Run with coverage report
npm run test:unit:coverage
```

---

## 📝 What Was Created

### 1. `vitest.config.ts`
- Configured Vitest with React support
- Set up path aliases (`@/lib`, `@/components`, etc.)
- Configured coverage reporting
- Set coverage thresholds (70% lines, 70% functions)

### 2. `tests/setup.ts`
- Test environment setup
- Next.js router mocks
- Environment variable mocks

### 3. `tests/unit/lib/validators.test.ts`
- **Example test file** showing how to test validation schemas
- 50+ test cases covering:
  - Valid inputs
  - Invalid inputs
  - Edge cases
  - Error scenarios

---

## 🎯 Next Steps: Use Cursor to Generate More Tests

### 1. Test a Component

**Ask Cursor:**
> "Generate React Testing Library tests for the AI Astrology input form component. Test form validation, user interactions, and submission."

**Cursor will:**
- Create test file
- Test user interactions
- Test form validation
- Test error states
- Test success flows

### 2. Test an API Route

**Ask Cursor:**
> "Create unit tests for the `/api/ai-astrology` route. Test success cases, validation errors, and mock OpenAI responses."

**Cursor will:**
- Create test file
- Mock external APIs
- Test all code paths
- Test error handling

### 3. Test a Utility Function

**Ask Cursor:**
> "Generate comprehensive tests for [function name]. Include edge cases and error scenarios."

**Cursor will:**
- Analyze the function
- Generate test cases
- Cover all branches
- Test edge cases

---

## 📊 View Coverage Report

After running `npm run test:unit:coverage`:

```bash
# Open coverage report in browser
open coverage/index.html
```

This shows:
- Which code is tested
- Which code needs tests
- Coverage percentages

---

## 🔄 Daily Workflow

### When Writing New Code:

1. **Write the code**
2. **Ask Cursor:** "Generate tests for this code"
3. **Run tests:** `npm run test:unit:watch`
4. **Verify coverage:** Ensure > 70% coverage
5. **Commit with confidence**

### When Fixing a Bug:

1. **Ask Cursor:** "Write a test that reproduces this bug"
2. **Run the test** (it should fail)
3. **Fix the bug**
4. **Run the test** (it should pass)
5. **Commit the fix + test**

### When Refactoring:

1. **Run existing tests:** `npm run test:unit`
2. **Refactor the code**
3. **Run tests again:** Ensure all pass
4. **Ask Cursor:** "Update tests for this refactored code if needed"

---

## 🎓 Example: Testing a Component

Let's say you have a `Button` component. Ask Cursor:

> "Generate React Testing Library tests for this Button component. Test all props, click handlers, disabled states, and accessibility."

**Cursor will generate:**

```typescript
// tests/unit/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '@/components/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>);
    expect(screen.getByText('Click')).toBeDisabled();
  });

  // ... more tests
});
```

---

## 🎯 Coverage Goals

- **Week 1**: 50% coverage (critical paths)
- **Week 2**: 70% coverage (most code)
- **Week 3**: 80% coverage (comprehensive)
- **Week 4**: 85%+ coverage (polish)

---

## 💡 Pro Tips

1. **Start Small**: Test one component/function at a time
2. **Use Cursor**: Ask it to generate tests - it's fast and comprehensive
3. **Watch Mode**: Use `npm run test:unit:watch` during development
4. **Coverage First**: Focus on high-impact code first
5. **Test Behavior**: Test what the code does, not how it does it

---

## 🐛 Troubleshooting

### Tests not finding modules?

Check `vitest.config.ts` - path aliases should match your `tsconfig.json`.

### React components not rendering?

Make sure `@vitejs/plugin-react` is installed and configured.

### Coverage not working?

Run: `npm run test:unit:coverage` and check `coverage/` folder.

---

## 📚 Learn More

- **Vitest Docs**: https://vitest.dev/
- **React Testing Library**: https://testing-library.com/react
- **Testing Best Practices**: See `CURSOR_TESTING_AUTOMATION_GUIDE.md`

---

## ✅ You're Ready!

You now have:
- ✅ Testing framework set up
- ✅ Example tests to learn from
- ✅ Coverage reporting configured
- ✅ Cursor ready to generate more tests

**Next:** Ask Cursor to generate tests for your components and API routes!

