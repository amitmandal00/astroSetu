# DO NOT TOUCH MAP

**Purpose**: Prevent Cursor from breaking critical paths during autopilot mode.

**Last Updated**: 2026-01-25

---

## 🚨 CRITICAL - DO NOT MODIFY WITHOUT EXPLICIT APPROVAL

These files/paths are **critical** to MVP compliance and payment protection. Any changes require explicit approval and must pass `npm run ci:critical` before commit.

### 1. Report Generation Route
**File**: `astrosetu/src/app/api/ai-astrology/generate-report/route.ts`

**Why Critical**:
- Implements MVP Rule #4: "Failures are terminal"
- Implements MVP Rule #3: "Payment captured only after success"
- Contains deterministic fallback logic (no external API calls)
- Contains payment cancellation logic
- Contains MVP safety logging

**Safe Changes**:
- Logging improvements (non-functional)
- Type annotations
- Code comments

**Forbidden Changes**:
- Adding automatic retries/repair attempts
- Changing validation failure handling (must remain terminal)
- Changing payment capture timing (must be after success only)
- Adding external API calls in fallback path
- Removing MVP safety log lines

---

### 2. Payment Capture/Cancel Routes
**Files**:
- `astrosetu/src/app/api/ai-astrology/capture-payment/route.ts`
- `astrosetu/src/app/api/ai-astrology/cancel-payment/route.ts`
- `astrosetu/src/app/api/ai-astrology/create-checkout/route.ts`
- `astrosetu/src/app/api/ai-astrology/verify-payment/route.ts`

**Why Critical**:
- Implements MVP Rule #3: "Payment captured only after success"
- Protects users from incorrect charges
- Contains production payment bypass logic

**Safe Changes**:
- Logging improvements
- Error message improvements

**Forbidden Changes**:
- Changing payment capture timing
- Removing payment cancellation logic
- Changing production payment bypass behavior (must be gated by env flags)

---

### 3. Input Session Token Flow
**File**: `astrosetu/src/app/api/ai-astrology/input-session/route.ts`

**Why Critical**:
- Implements idempotency for input sessions
- Prevents duplicate token generation
- Critical for preventing stuck states

**Safe Changes**:
- Logging improvements
- Token expiration time adjustments (with approval)

**Forbidden Changes**:
- Removing idempotency checks
- Changing token generation logic
- Removing expiration logic

---

### 4. Preview Page Polling & State Management
**File**: `astrosetu/src/app/ai-astrology/preview/page.tsx`

**Why Critical**:
- Implements MVP Rule #5: "Refreshing the page must not change backend state"
- Contains single-flight generation controller
- Prevents duplicate generation requests
- Contains bundle generation logic (currently frozen behind feature flag)

**Safe Changes**:
- UI styling
- Loading state messages
- Error message text

**Forbidden Changes**:
- Removing single-flight controller logic
- Changing polling behavior (must remain idempotent)
- Removing idempotency checks
- Enabling bundle generation without feature flag (must remain frozen)

**Specific Sections to Avoid**:
- `useReportGenerationController` hook usage
- `generateReport` function (single report generation)
- `generateBundleReports` function (bundle generation - currently frozen)
- Polling logic (`useEffect` hooks that poll for report status)
- Idempotency checks (`isGeneratingRef`, `generationAttemptRef`)

---

### 5. Report Validation Logic
**File**: `astrosetu/src/lib/ai-astrology/reportGenerator.ts`

**Functions**:
- `validateReportBeforeCompletion`
- `ensureMinimumSections`

**Why Critical**:
- Implements MVP Rule #7: "Quality Guarantees"
- Contains deterministic fallback logic (no external API calls)
- Prevents delivery of empty/thin reports

**Safe Changes**:
- Adjusting minimum word counts (with approval)
- Adjusting minimum section counts (with approval)
- Logging improvements

**Forbidden Changes**:
- Adding external API calls to validation/fallback
- Removing validation checks
- Changing fallback to use OpenAI/Prokerala (must remain deterministic)

---

### 6. Idempotency Caching
**Files**:
- `astrosetu/src/lib/ai-astrology/reportCache.ts`
- Any file that calls `cacheReport` or `getCachedReport`

**Why Critical**:
- Implements MVP Rule #8: "Same input must always produce same outcome"
- Prevents duplicate OpenAI calls
- Prevents cost leakage

**Safe Changes**:
- Cache expiration time adjustments (with approval)
- Logging improvements

**Forbidden Changes**:
- Removing idempotency checks
- Changing cache key generation
- Removing cache invalidation logic

---

## ✅ SAFE TO REFACTOR

These areas are safe to modify without explicit approval (but still run tests):

### 1. UI Components (Non-Critical)
- `astrosetu/src/components/ui/*` (Card, Button, Badge, etc.)
- `astrosetu/src/app/ai-astrology/input/page.tsx` (UI only, no generation logic)
- `astrosetu/src/app/ai-astrology/faq/page.tsx`
- Footer/Header components

**Safe Changes**:
- Styling
- Copy/text
- Layout
- Accessibility improvements

---

### 2. Non-Payment Pages
- `astrosetu/src/app/terms/page.tsx`
- `astrosetu/src/app/privacy/page.tsx`
- `astrosetu/src/app/disclaimer/page.tsx`
- `astrosetu/src/app/refund/page.tsx`
- `astrosetu/src/app/contact/page.tsx`

**Safe Changes**:
- All content changes
- Styling
- Layout

---

### 3. PDF Generation
**File**: `astrosetu/src/lib/ai-astrology/pdfGenerator.ts`

**Safe Changes**:
- PDF formatting
- Styling
- Layout improvements

**Forbidden Changes**:
- Removing PDF generation (required feature)

---

### 4. Test Files
**Files**: `astrosetu/tests/**/*.test.ts`

**Safe Changes**:
- Adding new tests
- Improving test coverage
- Fixing flaky tests

**Forbidden Changes**:
- Removing critical path tests
- Disabling tests without fixing root cause

---

## 🔒 BUNDLE LOGIC - FROZEN

**Status**: Bundles are **frozen** behind feature flag `NEXT_PUBLIC_BUNDLES_ENABLED=false` (default).

**Why Frozen**:
- Current implementation uses client-side orchestration (violates MVP Rule #2: "Worker is the only execution path")
- Does not meet MVP conditions for bundle-level payment capture
- Increases complexity and failure surface area

**Files Affected**:
- `astrosetu/src/app/ai-astrology/bundle/page.tsx` (shows "paused" message when disabled)
- `astrosetu/src/app/ai-astrology/preview/page.tsx` (bundle generation disabled)

**To Re-enable**:
1. Implement server-orchestrated bundle generation (new endpoint: `/api/ai-astrology/generate-bundle`)
2. Implement bundle-level payment capture (one PaymentIntent per bundle)
3. Implement bundle status tracking (single bundle status, not per-item)
4. Update MVP goals documentation
5. Get explicit approval
6. Set `NEXT_PUBLIC_BUNDLES_ENABLED=true` in production

**DO NOT**:
- Remove bundle freeze checks
- Enable bundles without server-orchestration
- Change bundle payment logic without meeting MVP conditions

---

## 📋 CHANGE APPROVAL PROCESS

### For Critical Files:
1. **Read this document** - Understand why the file is critical
2. **Propose change** - Explain what you're changing and why
3. **Get approval** - Explicit approval required
4. **Run tests** - `npm run ci:critical` must pass
5. **Verify MVP compliance** - Check against MVP goals
6. **Commit** - Include reference to this document

### For Safe Files:
1. **Make change** - No approval needed
2. **Run tests** - `npm test` should pass
3. **Commit** - Standard commit process

---

## 🚦 MVP COMPLIANCE CHECKLIST

Before modifying any critical file, verify:

- [ ] Change does not violate MVP Rule #1: "Frontend never generates reports"
- [ ] Change does not violate MVP Rule #2: "Worker is the only execution path"
- [ ] Change does not violate MVP Rule #3: "Payment is captured only after success"
- [ ] Change does not violate MVP Rule #4: "Failures are terminal and visible"
- [ ] Change does not violate MVP Rule #5: "Refreshing the page must not change backend state"
- [ ] Change does not violate MVP Rule #6: "No build is pushed unless build + tests are green"
- [ ] Change does not violate MVP Rule #7: "No new abstractions without explicit approval"
- [ ] Change does not violate MVP Rule #8: "Same input must always produce same outcome"

---

## 📝 NOTES

- This document should be updated when critical paths change
- When adding new critical files, add them to this document
- When removing critical files, mark them as "deprecated" first, then remove after approval

---

**Last Review**: 2026-01-25  
**Next Review**: When critical paths change

