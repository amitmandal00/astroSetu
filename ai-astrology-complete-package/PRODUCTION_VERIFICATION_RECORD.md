# Production Verification Record

**Date**: _______________  
**Tester**: _______________  
**Environment**: Production / Staging  
**Deployment Commit Hash**: _______________

---

## ✅ Pre-Deployment Checks

- [x] All fixes applied and verified
- [x] Cancel idempotency hardened (returns 200 if already canceled)
- [x] Token fetch caching hardened (no-store headers)
- [x] Tests upgraded with tightened assertions
- [ ] `npm run test:critical` passed locally

---

## 🧪 3-Flow Incognito Checklist

### 1. Paid Year Analysis

**Steps**:
1. Open `/ai-astrology/preview?reportType=year-analysis` (incognito, no sessionStorage)
2. Click "Purchase Year Analysis Report"
3. Should redirect to `/ai-astrology/input?reportType=year-analysis&returnTo=...`
4. Fill birth details and submit
5. Should return to `/ai-astrology/preview?reportType=year-analysis&input_token=...`
6. **CRITICAL**: Must NOT bounce back to input
7. **CRITICAL**: Must proceed to Stripe checkout OR show error within timeout (15s)

**Result**: [ ] PASS  [ ] FAIL

**If FAIL**:
- Failure Point: _________________________________
- Ref String: _________________________________
- Vercel Log Lines (tagged with [AUTOSTART] / [INVARIANT_VIOLATION]): 
  ```
  _________________________________
  _________________________________
  _________________________________
  ```

**Success Criteria Met**:
- [ ] No redirect loop (stays on preview after returning from input)
- [ ] Either Stripe checkout appears OR error message appears (not infinite loading)
- [ ] URL contains `input_token=` OR `session_id=`
- [ ] "Enter Your Birth Details" card is NOT visible
- [ ] "Redirecting..." is NOT visible

---

### 2. Free Life Summary

**Steps**:
1. Open `/ai-astrology/preview?reportType=life-summary` (incognito, no sessionStorage)
2. Should redirect to `/ai-astrology/input?reportType=life-summary&returnTo=...`
3. Fill birth details and submit
4. Should return to `/ai-astrology/preview?reportType=life-summary&input_token=...`
5. **CRITICAL**: Must render report (not redirect loop)

**Result**: [ ] PASS  [ ] FAIL

**If FAIL**:
- Failure Point: _________________________________
- Ref String: _________________________________
- Vercel Log Lines (tagged with [AUTOSTART] / [INVARIANT_VIOLATION]): 
  ```
  _________________________________
  _________________________________
  _________________________________
  ```

**Success Criteria Met**:
- [ ] No redirect loop (stays on preview after returning from input)
- [ ] Report content appears (not "Redirecting..." or "Enter Your Birth Details")
- [ ] URL contains `input_token=`
- [ ] "Enter Your Birth Details" card is NOT visible
- [ ] "Redirecting..." is NOT visible

---

### 3. Monthly Subscription

**Steps**:
1. Open `/ai-astrology/subscription` (incognito, no sessionStorage)
2. **If no input**: Should redirect to `/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=/ai-astrology/subscription`
3. Fill birth details and submit
4. Should return to `/ai-astrology/subscription?input_token=...`
5. Subscription page should load input, clean URL, show Subscribe button
6. Click "Subscribe"
7. **CRITICAL**: Should navigate to Stripe checkout OR show error within timeout (15s)
8. **After Stripe return**: Should show "Active" status / "Cancel anytime" button
9. Click "Cancel subscription"
10. **CRITICAL**: Status should update (immediate OR within short polling window)

**Result**: [ ] PASS  [ ] FAIL

**If FAIL**:
- Failure Point: _________________________________
- Ref String: _________________________________
- Vercel Log Lines (tagged with [AUTOSTART] / [INVARIANT_VIOLATION]): 
  ```
  _________________________________
  _________________________________
  _________________________________
  ```

**Success Criteria Met**:
- [ ] No redirect loop (stays on subscription after returning from input)
- [ ] Subscribe button redirects to input if no input (not silent no-op)
- [ ] Subscribe button navigates to Stripe OR shows error (not infinite loading)
- [ ] After return from Stripe, subscription status shows "Active"
- [ ] Cancel button updates status (immediate or within polling window)
- [ ] URL is cleaned (no `input_token=` after loading)

---

## 📊 Overall Results

**Total Flows**: 3  
**Passed**: _____  
**Failed**: _____

**Overall Status**: [ ] ✅ ALL PASS  [ ] ⚠️ SOME FAIL  [ ] ❌ ALL FAIL

---

## 🔍 Failure Analysis (If Any)

### Failure Point 1
- Flow: _________________________________
- Issue: _________________________________
- Ref: _________________________________
- Vercel Logs: _________________________________
- Root Cause: _________________________________
- Fix Required: _________________________________

### Failure Point 2
- Flow: _________________________________
- Issue: _________________________________
- Ref: _________________________________
- Vercel Logs: _________________________________
- Root Cause: _________________________________
- Fix Required: _________________________________

---

## 📝 Notes

_________________________________
_________________________________
_________________________________

---

## ✅ Next Steps

- [ ] If all pass: ✅ Ready for production
- [ ] If any fail: 
  - [ ] Capture exact failure point
  - [ ] Check failure points listed in `PRODUCTION_VERIFICATION_CHECKLIST_FINAL_TIGHTENED.md`
  - [ ] Fix and re-verify
  - [ ] Do NOT deploy until all 3 flows pass

---

**Verification Complete**: [ ] YES  [ ] NO  
**Ready for Production**: [ ] YES  [ ] NO

