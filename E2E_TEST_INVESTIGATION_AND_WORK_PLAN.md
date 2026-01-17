# E2E Test Investigation & Work Plan (Next 1 Hour)
**Date**: 2026-01-18  
**Status**: 🔍 **INVESTIGATION IN PROGRESS**

---

## 🔍 Investigation: E2E Test Failures

### Failure Pattern Analysis

**Symptoms**:
- 51/71 tests failing (71.8% failure rate)
- Most failures: Timeout when trying to fill `input[name="name"]`
- Error: `Test timeout of 30000ms exceeded. waiting for locator('input[name="name"]')`

**Affected Tests**:
- All tests navigating to `/ai-astrology/input`
- Beta access tests (10 failures)
- Token loading tests (2 failures)
- Subscription flow tests (multiple failures)
- Preview redirect tests (multiple failures)

### Root Cause Hypotheses

#### Hypothesis 1: Private Beta Gating Blocking Tests ⚠️ **LIKELY**
**Evidence**:
- Beta access tests failing (expecting gating to work)
- Input page not loading (redirecting before form renders)
- Tests can't find form elements

**Investigation**:
- [ ] Check if `NEXT_PUBLIC_PRIVATE_BETA` is set in test environment
- [ ] Verify middleware has beta gating logic (check `middleware.ts`)
- [ ] Check if middleware is redirecting `/ai-astrology/input` to `/ai-astrology/access`
- [ ] Verify test environment sets `NEXT_PUBLIC_PRIVATE_BETA=false` or unset

**Fix Strategy**:
- Set `NEXT_PUBLIC_PRIVATE_BETA=false` explicitly in `playwright.config.ts` webServer command
- Or mock middleware to bypass beta checks for tests
- Or set beta_access cookie in test setup

#### Hypothesis 2: Redirect Loops Before Form Loads ⚠️ **LIKELY**
**Evidence**:
- Tests navigate to `/ai-astrology/input` but can't find form
- Timeout suggests page keeps redirecting
- Preview page token loading logic might be redirecting input page

**Investigation**:
- [ ] Check if input page has redirect logic that runs before form loads
- [ ] Verify `useEffect` in input page isn't redirecting too early
- [ ] Check if token loading in preview is affecting input page
- [ ] Review recent changes to redirect logic

**Fix Strategy**:
- Ensure form renders before any redirect checks
- Add `page.waitForSelector('input[name="name"]')` before `page.fill()`
- Fix redirect logic to wait for page load

#### Hypothesis 3: Page Not Loading Fast Enough ⚠️ **POSSIBLE**
**Evidence**:
- 30s timeout exceeded
- Server startup time might be slow
- First page load might be slow (Next.js compilation)

**Investigation**:
- [ ] Check server startup time in test logs
- [ ] Verify `webServer.timeout` is sufficient
- [ ] Check if first page load takes > 30s
- [ ] Review test timeouts (currently 30s default)

**Fix Strategy**:
- Increase test timeout for slow operations
- Increase `webServer.timeout` if needed
- Add explicit waits for page load

#### Hypothesis 4: Environment Variable Issues ⚠️ **POSSIBLE**
**Evidence**:
- `MOCK_MODE=true` is set in playwright config
- `NEXT_PUBLIC_PRIVATE_BETA` might not be explicitly set
- Other env vars might affect behavior

**Investigation**:
- [ ] Check what env vars are set in test environment
- [ ] Verify env vars in `webServer.command`
- [ ] Check if `.env.local` is affecting tests
- [ ] Review environment variable precedence

**Fix Strategy**:
- Explicitly set all required env vars in `playwright.config.ts`
- Ensure `NEXT_PUBLIC_PRIVATE_BETA=false` for tests
- Document required env vars for tests

---

## 🎯 Immediate Actions (Next 30 Minutes)

### Priority 1: Fix Private Beta Gating in Tests (15 min)
**Task**: Ensure tests bypass private beta gating

**Steps**:
1. ✅ Check if `middleware.ts` has beta gating logic
2. ⏭️ Update `playwright.config.ts` to set `NEXT_PUBLIC_PRIVATE_BETA=false` in webServer command
3. ⏭️ Verify middleware isn't blocking test routes
4. ⏭️ Test: Run one failing test to verify fix

**Expected Result**: Input page loads without redirect to `/ai-astrology/access`

### Priority 2: Add Explicit Waits for Form Elements (10 min)
**Task**: Fix timeout failures by waiting for form to load

**Steps**:
1. ⏭️ Update failing tests to use `page.waitForSelector('input[name="name"]')` before `page.fill()`
2. ⏭️ Add timeout: `{ timeout: 10000 }` (10 seconds)
3. ⏭️ Test: Run `token-get-required.spec.ts` to verify fix

**Expected Result**: Tests wait for form to load before filling

### Priority 3: Fix Redirect Loops in Input Page (15 min)
**Task**: Ensure input page doesn't redirect before form loads

**Steps**:
1. ⏭️ Review `input/page.tsx` redirect logic
2. ⏭️ Ensure redirect checks run AFTER form renders
3. ⏭️ Verify no `useEffect` redirects before mount
4. ⏭️ Test: Manual check of input page load

**Expected Result**: Input page renders form without redirecting immediately

---

## 📋 Remaining Tasks from History

### From CURSOR_ACTIONS_REQUIRED.md
1. ⏭️ **Private Beta Deployment**: Set `NEXT_PUBLIC_PRIVATE_BETA=true` in Production
2. ⏭️ **Production Verification**: Run 3-flow checklist (Paid Year, Free Life, Monthly Subscription)
3. ⏭️ **Release Gate**: Run `npm run release:gate` in CI/Vercel
4. ⏭️ **Documentation**: Update defect register with verification status

### From CURSOR_PROGRESS.md
1. ⏭️ **E2E Test Environment**: Fix timeout/infrastructure issues
2. ⏭️ **Manual Verification**: Test critical flows in production
3. ⏭️ **Monitoring**: Set up production monitoring for defects

### From Recent Commits
1. ✅ **Token Loading Fix**: Token loading authoritative (completed)
2. ✅ **Redirect Loop Fix**: Hard navigation implemented (completed)
3. ✅ **Subscription Journey Fix**: returnTo flow fixed (completed)
4. ⏭️ **E2E Test Fixes**: Fix test failures (in progress)
5. ⏭️ **Test Environment**: Fix private beta gating for tests (pending)

---

## 🕐 1-Hour Work Plan

### Phase 1: Investigation (0-15 min)
**Goal**: Identify root cause of E2E test failures

**Tasks**:
1. ✅ Check middleware for beta gating logic (5 min)
2. ✅ Check playwright config for env vars (5 min)
3. ✅ Review one failing test in detail (5 min)

**Deliverable**: Root cause identified

### Phase 2: Quick Fixes (15-45 min)
**Goal**: Fix most critical issues causing test failures

**Tasks**:
1. ⏭️ Fix private beta gating in test environment (10 min)
   - Update `playwright.config.ts` to set `NEXT_PUBLIC_PRIVATE_BETA=false`
   - Verify middleware logic
2. ⏭️ Add explicit waits in failing tests (15 min)
   - Update `token-get-required.spec.ts`
   - Update `no-redirect-loop-after-input.spec.ts`
   - Update `subscription-input-token-flow.spec.ts`
3. ⏭️ Fix input page redirect logic if needed (5 min)
   - Review `input/page.tsx` for early redirects
4. ⏭️ Run tests to verify fixes (5 min)
   - Run `npm run test:critical`
   - Check failure count reduction

**Deliverable**: Test failure count reduced to < 20

### Phase 3: Verification & Documentation (45-60 min)
**Goal**: Verify fixes and document remaining issues

**Tasks**:
1. ⏭️ Re-run critical tests (10 min)
   - Verify fixes work
   - Document remaining failures
2. ⏭️ Update regression report (10 min)
   - Document fixes applied
   - Update defect status
3. ⏭️ Create summary for user (5 min)
   - What was fixed
   - What's remaining
   - Recommendations

**Deliverable**: Updated regression report + summary

---

## 📊 Success Criteria

### Minimum Success (Must Have)
- [ ] E2E test failure rate < 50% (currently 71.8%)
- [ ] Input page form loads in tests
- [ ] At least 10 more tests passing than before

### Target Success (Should Have)
- [ ] E2E test failure rate < 30% (currently 71.8%)
- [ ] All token loading tests passing
- [ ] All subscription flow tests passing

### Stretch Goal (Nice to Have)
- [ ] E2E test failure rate < 10% (currently 71.8%)
- [ ] All critical tests passing
- [ ] Test environment fully stable

---

## 🚨 Blockers & Risks

### Blockers
- **None identified yet** - Need to investigate first

### Risks
- **Middleware changes**: May affect production behavior if not careful
- **Test environment**: Fixes might mask real issues
- **Time constraints**: 1 hour may not be enough for full fix

---

## 📝 Next Steps After Investigation

### If Private Beta is the Issue:
1. Fix playwright config immediately
2. Re-run tests
3. Document fix

### If Redirect Loops are the Issue:
1. Fix input page redirect logic
2. Add explicit waits in tests
3. Re-run tests

### If Both/Other Issues:
1. Prioritize by failure count
2. Fix highest-impact issues first
3. Document remaining issues for next session

---

**Plan Status**: 🔍 **INVESTIGATION PHASE**  
**Next Action**: Check middleware and playwright config for private beta gating

