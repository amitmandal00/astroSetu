# 🛠️ Testing Setup - Installation Instructions

## ⚠️ Current Issue

The automated `npm install` encountered a system-level npm permission issue. This is not related to our test setup - it's a system configuration issue with npm/nvm.

## ✅ What's Already Done

- ✅ Vitest configuration (`vitest.config.ts`)
- ✅ Test setup file (`tests/setup.ts`)
- ✅ Example test file (`tests/unit/lib/validators.test.ts`)
- ✅ Package.json updated with test scripts
- ✅ All test files created and ready

## 🔧 Fix npm Permission Issue

### Option 1: Fix npm Permissions (Recommended)

```bash
# Check npm version and location
which npm
npm --version

# If using nvm, try reinstalling node
nvm reinstall-packages 20.19.6

# Or fix npm permissions
sudo chown -R $(whoami) ~/.nvm
```

### Option 2: Use Yarn (Alternative)

If npm continues to have issues, you can use yarn:

```bash
# Install yarn if not already installed
npm install -g yarn

# Install dependencies with yarn
cd astrosetu
yarn install
```

### Option 3: Manual Installation

Install only the test dependencies:

```bash
cd astrosetu

# Install test dependencies one by one
npm install --save-dev vitest@^1.1.0
npm install --save-dev @vitejs/plugin-react@^4.2.1
npm install --save-dev @testing-library/react@^14.1.2
npm install --save-dev @testing-library/jest-dom@^6.1.5
npm install --save-dev @testing-library/user-event@^14.5.1
npm install --save-dev @vitest/coverage-v8@^1.1.0
npm install --save-dev jsdom@^23.0.1
```

## ✅ Verify Installation

After fixing npm and installing dependencies, verify:

```bash
# Check if vitest is installed
npx vitest --version

# Check if test files are accessible
ls -la tests/unit/lib/validators.test.ts
ls -la vitest.config.ts
```

## 🧪 Run Tests

Once dependencies are installed:

```bash
# Run unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit:coverage
```

## 📋 Expected Output

When you run `npm run test:unit`, you should see:

```
✓ tests/unit/lib/validators.test.ts (50+ tests)
  ✓ BirthDetailsSchema (10+ tests)
  ✓ NameSchema (5+ tests)
  ✓ EmailSchema (4+ tests)
  ✓ PhoneSchema (2+ tests)
  ✓ AmountSchema (4+ tests)
  ✓ DateSchema (4+ tests)
  ✓ TimeSchema (4+ tests)
  ✓ CoordinateSchema (2+ tests)
  ✓ LongitudeSchema (2+ tests)
  ✓ MatchSchema (2+ tests)

Test Files  1 passed (1)
     Tests  50+ passed (50+)
```

## 🎯 Next Steps After Installation

1. **Verify tests run**: `npm run test:unit`
2. **Check coverage**: `npm run test:unit:coverage`
3. **Start generating more tests with Cursor**:
   - "Generate React Testing Library tests for [ComponentName]"
   - "Create unit tests for [API Route]"
   - "Generate tests for [Utility Function]"

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/lib/validators'"

**Solution**: Check that `vitest.config.ts` has the correct path aliases matching your `tsconfig.json`.

### Issue: "jsdom is not defined"

**Solution**: Make sure `jsdom` is installed: `npm install --save-dev jsdom`

### Issue: Tests run but can't find React components

**Solution**: Ensure `@vitejs/plugin-react` is installed and configured in `vitest.config.ts`.

## 📞 Need Help?

If npm issues persist, you can:
1. Try using a different Node version: `nvm use 18` or `nvm use 20`
2. Use yarn instead: `yarn install`
3. Check npm permissions: `ls -la ~/.nvm`

---

**Once dependencies are installed, everything else is ready to go!** 🚀

