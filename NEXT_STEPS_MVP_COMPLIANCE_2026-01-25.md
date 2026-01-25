# Next Steps - MVP Compliance Fixes
**Date**: 2026-01-25  
**Status**: 🔴 **CRITICAL FIXES REQUIRED**

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Remove Automatic Repair Attempts (P0 - BLOCKER)

**File**: `astrosetu/src/app/api/ai-astrology/generate-report/route.ts` (line ~1780)

**Current Behavior**: System automatically attempts to repair failed validation
**MVP Requirement**: Failures must be terminal and visible

**Action**:
1. Find `[VALIDATION FAILURE - REPAIR ATTEMPT]` code block
2. Replace with immediate failure:
   - Set `status = failed`
   - Cancel PaymentIntent (if exists)
   - Return error response
   - Log failure (no repair attempt)
3. Remove all automatic retry/repair logic

**Expected Outcome**: 
- Validation failures → immediate terminal failure
- No automatic repair attempts
- Payment cancelled on failure
- User sees clear error message

---

### 2. Verify Payment Capture Timing (P0 - BLOCKER)

**Files to Check**:
- `astrosetu/src/app/api/ai-astrology/generate-report/route.ts`
- Payment capture logic (Stripe integration)

**MVP Requirement**: Payment captured only after report fully delivered

**Action**:
1. Trace payment capture flow:
   - When is PaymentIntent created?
   - When is payment captured?
   - Is capture before or after validation?
2. Ensure capture happens ONLY after:
   - Report validation passes
   - All sections meet minimum requirements
   - Report status = completed
3. If capture happens before validation → MOVE IT AFTER

**Expected Outcome**:
- Payment captured only after successful report delivery
- Failed reports → payment cancelled, not captured

---

### 3. Remove/Disable Cron Job (P0 - BLOCKER)

**Issue**: `POST 404 /api/ai-astrology/expire-orders` called every 10 minutes

**MVP Requirement**: No cron job required for correctness

**Action**:
1. Check Vercel Dashboard → Cron Jobs
2. Check `vercel.json` for cron configuration
3. Remove `expire-orders` cron job
4. OR implement endpoint if truly needed (but violates MVP)

**Files to Check**:
- `vercel.json`
- `.vercel/` directory
- Vercel Dashboard → Settings → Cron Jobs

**Expected Outcome**:
- No cron jobs calling non-existent endpoints
- System works correctly without cron

---

### 4. Clarify Fallback Sections Policy (P1 - HIGH)

**File**: `src/lib/ai-astrology/reportGenerator.ts` or validation logic

**Current Behavior**: System automatically adds fallback sections when report has fewer than minimum

**MVP Requirement**: Graceful degradation allowed, but must be BEFORE payment capture

**Action**:
1. Find `parseAIResponse` function
2. Verify fallback sections added BEFORE payment capture
3. If added AFTER payment capture → MOVE IT BEFORE
4. Add quality flag logging (non-blocking) per MVP

**Expected Outcome**:
- Fallback sections added BEFORE payment capture
- Quality flags logged (non-blocking)
- Clear documentation of when fallback happens

---

### 5. Verify Prokerala Failure Handling (P1 - HIGH)

**File**: `src/lib/astrologyAPI.ts`

**Current Behavior**: System falls back to mock data when Prokerala fails

**MVP Requirement**: Reports fail (not fallback) when Prokerala unavailable, payment NOT captured

**Action**:
1. Find Prokerala fallback logic
2. Ensure reports fail (status = failed) when Prokerala unavailable
3. Ensure payment NOT captured when Prokerala fails
4. Remove silent fallback to mock in production

**Expected Outcome**:
- Prokerala failures → report status = failed
- Payment cancelled when Prokerala fails
- No silent fallback to mock in production

---

## 📋 VERIFICATION CHECKLIST

After fixes applied, verify:

- [ ] Validation failure → status = failed, payment cancelled, no repair attempt
- [ ] Payment captured only after report status = completed
- [ ] No cron jobs calling expire-orders endpoint
- [ ] Fallback sections added BEFORE payment capture
- [ ] Prokerala failures → report failed, payment cancelled
- [ ] All automatic retries removed
- [ ] Failures are terminal and visible

---

## 🎯 MVP ACCEPTANCE CRITERIA

System is MVP-compliant when:

1. ✅ User never charged unless report fully delivered
2. ✅ Failures are terminal (no automatic repair/retry)
3. ✅ No automatic retries
4. ✅ No cron-for-correctness
5. ✅ Payment captured only after success
6. ✅ Graceful degradation happens BEFORE payment capture

---

**Next Step**: Fix P0 blockers first, then verify against MVP goals.

