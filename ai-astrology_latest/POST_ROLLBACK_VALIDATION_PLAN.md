# Post-Rollback Validation Plan - MVP Goals Alignment
**Date**: 2026-01-25  
**Status**: ✅ **ROLLBACK COMPLETE** - Validating Stable Build

---

## 🎯 Objective

Validate the rolled-back stable build against MVP goals and identify:
1. Whether bulk implementation is safe to keep
2. What caused yearly flakiness
3. "Do not touch / safe to refactor" map
4. Minimal surgical fixes needed

---

## 📋 VALIDATION CHECKLIST

### 1. Verify Rollback Success ✅

**Check**:
- [ ] No automatic repair attempts in code
- [ ] No cron jobs configured
- [ ] Payment capture timing verified
- [ ] Bulk reports working (with conditions)

**Files to Check**:
- `astrosetu/src/app/api/ai-astrology/generate-report/route.ts`
- `vercel.json` (no cron config)
- Vercel Dashboard (no cron jobs)

---

### 2. Validate Bulk Reports Against MVP Conditions

**MVP Condition**: Bulk is allowed **only if all below are true**:
- [ ] Bundle behaves as one logical unit
- [ ] Payment capture happens only after entire bundle succeeds
- [ ] No partial delivery to user
- [ ] One retry applies to the whole bundle
- [ ] UI sees one bundle status, not per-item complexity

**Validation Steps**:
1. **Test Bundle Flow**:
   - Create bundle order
   - Verify payment NOT captured until all reports complete
   - Verify no partial delivery
   - Verify single bundle status in UI

2. **Test Bundle Failure**:
   - Simulate failure in one report
   - Verify entire bundle fails (not partial)
   - Verify payment cancelled
   - Verify single retry applies to whole bundle

3. **Test Bundle UI**:
   - Verify UI shows one bundle status
   - Verify no per-item complexity exposed
   - Verify bundle behaves as logical unit

**Files to Check**:
- Bundle generation logic
- Bundle payment capture logic
- Bundle UI components
- Bundle status handling

**Expected Outcome**: 
- ✅ All 5 conditions met → Bulk is safe to keep
- ❌ Any condition broken → Bulk must be frozen

---

### 3. Identify Yearly Analysis Flakiness Root Cause

**MVP Acknowledgment**: "Yearly analysis had known flakiness (acknowledged)"

**Investigation Steps**:
1. **Check Yearly Analysis Code**:
   - Find yearly analysis generation logic
   - Check for timeouts
   - Check for validation
   - Check for fallback "lite yearly" mode

2. **Check Logs** (if available):
   - Look for yearly analysis failures
   - Identify common failure patterns
   - Check timeout occurrences
   - Check validation failures

3. **Document Root Causes**:
   - What causes flakiness?
   - Is it timeout-related?
   - Is it validation-related?
   - Is it API-related (OpenAI/Prokerala)?

**Files to Check**:
- Yearly analysis generation logic
- Yearly analysis validation
- Yearly analysis timeout handling
- Yearly analysis fallback logic

**Expected Outcome**: 
- Document exact root causes
- Identify what needs fixing
- Determine if "lite yearly" fallback exists

---

### 4. Create "Do Not Touch / Safe to Refactor" Map

**Purpose**: Identify code that works and should NOT be changed vs code that can be safely refactored

**Categories**:

**A. DO NOT TOUCH** (Working correctly, any change risks breaking):
- [ ] Bulk report generation (if validated as MVP-compliant)
- [ ] Payment capture flow (if working correctly)
- [ ] Report validation logic (if working correctly)
- [ ] Status management (if working correctly)

**B. SAFE TO REFACTOR** (Can be improved without breaking):
- [ ] Code comments/documentation
- [ ] Logging improvements
- [ ] Error messages
- [ ] UI polish (non-functional)

**C. NEEDS SURGICAL FIX** (Minimal changes only):
- [ ] Yearly analysis flakiness (if root cause identified)
- [ ] Any MVP violations found
- [ ] Any critical bugs found

**Action**: Document each file/function with its category

---

### 5. Verify MVP System Rules Compliance

**Check Each MVP Rule**:

1. **Frontend never generates reports**:
   - [ ] Verify frontend only creates order, redirects, polls status
   - [ ] Verify all generation happens in worker/API

2. **Worker is the only execution path**:
   - [ ] Verify no frontend generation code
   - [ ] Verify all generation via API routes

3. **Payment captured only after success**:
   - [ ] Verify payment capture AFTER report completed
   - [ ] Verify payment cancelled on failure

4. **Failures are terminal and visible**:
   - [ ] Verify no automatic repair attempts
   - [ ] Verify failures show clear error messages

5. **Refreshing page doesn't change backend state**:
   - [ ] Verify preview page is idempotent
   - [ ] Verify reload resumes polling (doesn't re-enqueue)

6. **No build pushed unless build + tests green**:
   - [ ] Verify CI/CD gates in place
   - [ ] Verify tests run before deploy

7. **No new abstractions without approval**:
   - [ ] Verify code is simple and predictable
   - [ ] Verify no over-engineering

8. **Same input produces same outcome**:
   - [ ] Verify deterministic behavior
   - [ ] Verify no random failures

---

### 6. Test Critical Flows

**Test Each Flow**:

1. **Single Report Flow**:
   - [ ] Create order
   - [ ] Payment authorized
   - [ ] Report generates
   - [ ] Payment captured after success
   - [ ] Report delivered

2. **Bundle Report Flow** (if bulk validated):
   - [ ] Create bundle order
   - [ ] Payment authorized
   - [ ] All reports generate
   - [ ] Payment captured after ALL succeed
   - [ ] Bundle delivered as unit

3. **Failure Flow**:
   - [ ] Create order
   - [ ] Payment authorized
   - [ ] Report fails validation
   - [ ] Status = failed
   - [ ] Payment cancelled
   - [ ] User sees error (can retry manually)

4. **Yearly Analysis Flow** (check for flakiness):
   - [ ] Create yearly order
   - [ ] Payment authorized
   - [ ] Report generates (may be flaky)
   - [ ] Document any failures
   - [ ] Check if fallback "lite yearly" exists

5. **Refresh/Resume Flow**:
   - [ ] Start report generation
   - [ ] Refresh page
   - [ ] Verify generation continues (doesn't restart)
   - [ ] Verify no duplicate orders

---

## 🔍 CODE INVESTIGATION REQUIRED

### Files to Examine:

1. **`astrosetu/src/app/api/ai-astrology/generate-report/route.ts`**:
   - Check for repair attempts (should be none)
   - Check payment capture timing
   - Check validation logic
   - Check failure handling

2. **Bundle Generation Logic**:
   - Find bundle generation code
   - Check payment capture for bundles
   - Check bundle status handling
   - Check bundle UI

3. **Yearly Analysis Logic**:
   - Find yearly analysis generation
   - Check timeout handling
   - Check validation
   - Check fallback logic

4. **Payment Capture Logic**:
   - Find Stripe integration
   - Check when capture happens
   - Check cancellation logic

---

## 📊 VALIDATION RESULTS TEMPLATE

After validation, document:

### Bulk Reports Validation:
- **Status**: ✅ SAFE TO KEEP / ❌ MUST FREEZE
- **Conditions Met**: X/5
- **Issues Found**: [list]
- **Recommendation**: [keep/freeze]

### Yearly Analysis Flakiness:
- **Root Causes Identified**: [list]
- **Failure Patterns**: [list]
- **Timeout Issues**: Yes/No
- **Validation Issues**: Yes/No
- **Fallback "Lite Yearly"**: Exists/Doesn't Exist
- **Recommended Fixes**: [minimal surgical fixes]

### MVP Compliance:
- **Rules Compliant**: X/8
- **Violations Found**: [list]
- **Required Fixes**: [list]

### Do Not Touch / Safe to Refactor Map:
- **DO NOT TOUCH**: [files/functions]
- **SAFE TO REFACTOR**: [files/functions]
- **NEEDS SURGICAL FIX**: [files/functions]

---

## 🚦 NEXT STEPS

1. ⏳ **Verify Rollback**: Check code for repair attempts, cron jobs
2. ⏳ **Validate Bulk**: Test bundle flow against MVP conditions
3. ⏳ **Investigate Yearly**: Find root cause of flakiness
4. ⏳ **Create Map**: Document "do not touch / safe to refactor"
5. ⏳ **Test Flows**: Run critical flow tests
6. ⏳ **Document Results**: Fill validation results template
7. ⏳ **Plan Fixes**: Create minimal surgical fix plan

---

**Status**: ✅ **ROLLBACK COMPLETE** - Ready for Validation

**Next Action**: Begin validation checklist

