# 1-Hour Work Plan - E2E Test Fixes & Defect Regression
**Date**: 2026-01-18  
**Status**: 🚀 **EXECUTING**

---

## 🎯 Primary Objectives

1. **Fix E2E Test Failures** (51 failures - 71.8% failure rate)
2. **Verify All Reported Defects** (15 defects - DEF-001 to DEF-015)
3. **Plan Remaining Tasks** from conversation history

---

## ⏱️ Time Allocation

### Phase 1: Investigation (0-10 min) ✅ COMPLETE
- ✅ Identified root cause: Tests timing out when filling forms
- ✅ Private beta NOT blocking (middleware in wrong file, not active)
- ✅ Likely causes: Redirect loops or missing waits

### Phase 2: Quick Fixes (10-35 min) 🔄 IN PROGRESS
- [ ] Fix test waits (10 min)
- [ ] Fix redirect logic if needed (10 min)
- [ ] Re-run tests (5 min)

### Phase 3: Verification (35-50 min)
- [ ] Re-run critical tests
- [ ] Update regression report
- [ ] Create summary

### Phase 4: Planning (50-60 min)
- [ ] Review remaining tasks from history
- [ ] Create prioritized task list
- [ ] Document next session plan

---

## 🔧 Immediate Fixes

### Fix 1: Add Explicit Waits in Failing Tests (10 min)

**Problem**: Tests timing out when trying to fill `input[name="name"]`

**Solution**: Add `page.waitForSelector()` before `page.fill()`

**Files to Fix**:
- `tests/e2e/token-get-required.spec.ts` (2 tests failing)
- `tests/e2e/no-redirect-loop-after-input.spec.ts` (3 tests failing)
- `tests/e2e/subscription-input-token-flow.spec.ts` (4 tests failing)

**Fix Pattern**:
```typescript
// Before
await page.goto("/ai-astrology/input?reportType=year-analysis");
await page.fill('input[name="name"]', "Test User");

// After
await page.goto("/ai-astrology/input?reportType=year-analysis");
await page.waitForSelector('input[name="name"]', { timeout: 10000 });
await page.fill('input[name="name"]', "Test User");
```

### Fix 2: Ensure Playwright Config Sets Private Beta to False (5 min)

**Problem**: Private beta might be enabled if env var is set

**Solution**: Explicitly set `NEXT_PUBLIC_PRIVATE_BETA=false` in playwright config

**File**: `playwright.config.ts`

**Fix**:
```typescript
webServer: {
  command: 'MOCK_MODE=true NEXT_PUBLIC_PRIVATE_BETA=false npm run dev',
  // ...
}
```

### Fix 3: Verify Input Page Doesn't Redirect Before Form Loads (10 min)

**Problem**: Input page might redirect before form elements render

**Investigation**:
- [ ] Check `input/page.tsx` for early redirects
- [ ] Verify form renders before any redirect logic
- [ ] Check if `useEffect` redirects run before mount

**Fix**: If redirect happens too early, delay redirect until form is mounted

---

## 📋 Remaining Tasks from History

### High Priority (Must Do)
1. ⏭️ **E2E Test Environment Fix**: Fix timeout/infrastructure issues
2. ⏭️ **Manual Verification**: Test critical flows in production
3. ⏭️ **Release Gate**: Run `npm run release:gate` in CI/Vercel
4. ⏭️ **Production Verification**: Run 3-flow checklist after deployment

### Medium Priority (Should Do)
5. ⏭️ **Private Beta Deployment**: Set `NEXT_PUBLIC_PRIVATE_BETA=true` in Production (when ready)
6. ⏭️ **Documentation**: Update defect register with verification status
7. ⏭️ **Monitoring**: Set up production monitoring for defects

### Low Priority (Nice to Have)
8. ⏭️ **Test Reliability**: Improve E2E test stability (retries, better waits)
9. ⏭️ **Test Coverage**: Add tests for edge cases
10. ⏭️ **Performance**: Optimize test execution time

---

## 🗂️ Task Breakdown

### Task 1: Fix Test Waits (10 min) - IN PROGRESS
**Priority**: 🔴 **CRITICAL**
**Files**: 3 E2E test files
**Status**: ⏭️ **PENDING**

**Steps**:
1. Update `token-get-required.spec.ts` (add waitForSelector)
2. Update `no-redirect-loop-after-input.spec.ts` (add waitForSelector)
3. Update `subscription-input-token-flow.spec.ts` (add waitForSelector)
4. Verify pattern works for one test

### Task 2: Fix Playwright Config (5 min)
**Priority**: 🔴 **CRITICAL**
**Files**: `playwright.config.ts`
**Status**: ⏭️ **PENDING**

**Steps**:
1. Add `NEXT_PUBLIC_PRIVATE_BETA=false` to webServer command
2. Verify env var is set correctly
3. Test one failing test to verify fix

### Task 3: Check Input Page Redirect Logic (10 min)
**Priority**: 🟡 **HIGH**
**Files**: `src/app/ai-astrology/input/page.tsx`
**Status**: ⏭️ **PENDING**

**Steps**:
1. Review `useEffect` hooks for early redirects
2. Verify form renders before redirect checks
3. Fix if redirect happens before mount

### Task 4: Re-run Tests & Document (10 min)
**Priority**: 🟡 **HIGH**
**Status**: ⏭️ **PENDING**

**Steps**:
1. Run `npm run test:critical`
2. Document results (pass/fail count)
3. Update regression report

### Task 5: Review Remaining Tasks (10 min)
**Priority**: 🟢 **MEDIUM**
**Status**: ⏭️ **PENDING**

**Steps**:
1. Review `CURSOR_ACTIONS_REQUIRED.md`
2. Review `CURSOR_PROGRESS.md`
3. Create prioritized task list

### Task 6: Create Next Session Plan (5 min)
**Priority**: 🟢 **MEDIUM**
**Status**: ⏭️ **PENDING**

**Steps**:
1. Document what was accomplished
2. List remaining tasks
3. Prioritize for next session

---

## 📊 Success Criteria

### Minimum Success (Must Have)
- [ ] Test failure count reduced from 51 to < 30 (41% reduction)
- [ ] Input page form loads in tests (can find `input[name="name"]`)
- [ ] At least 10 more tests passing than before

### Target Success (Should Have)
- [ ] Test failure count reduced from 51 to < 20 (61% reduction)
- [ ] All token loading tests passing
- [ ] All subscription flow tests passing

### Stretch Goal (Nice to Have)
- [ ] Test failure count reduced from 51 to < 10 (80% reduction)
- [ ] All critical tests passing
- [ ] Test environment stable

---

## 🚨 Blockers & Risks

### Blockers
- **None identified** - All tasks are feasible

### Risks
- **Time constraints**: 1 hour may not be enough for full fix
- **Multiple root causes**: Fixes may need iteration
- **Test reliability**: Fixes might not solve all failures

---

## 📝 Execution Log

### Completed (0-10 min)
- ✅ Investigation complete - root cause identified
- ✅ Work plan created
- ✅ Task breakdown done

### In Progress (10-35 min)
- 🔄 Fixing test waits (Task 1)
- ⏭️ Fix playwright config (Task 2)
- ⏭️ Check input page (Task 3)

### Remaining (35-60 min)
- ⏭️ Re-run tests (Task 4)
- ⏭️ Review tasks (Task 5)
- ⏭️ Create next plan (Task 6)

---

## 🎯 Next Actions

1. **Immediate**: Fix test waits in 3 failing test files
2. **Next**: Update playwright config for private beta
3. **Then**: Re-run tests to verify fixes
4. **Finally**: Document results and plan next steps

---

**Plan Status**: 🔄 **EXECUTING**  
**Next Action**: Fix test waits in token-get-required.spec.ts

