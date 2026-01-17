# Production Verification Checklist (Final - Tightened)

**Date**: 2026-01-17 22:30  
**Purpose**: Minimal production checklist to verify all critical fixes are working  
**Context**: After fixing "Redirecting..." dead-state, Subscribe no-op, and Purchase loop

---

## ✅ Pre-Deployment Verification

### 1. Code Verification
- [x] Preview redirect dead-state fixed (removed `hasReportTypeInUrl` gating)
- [x] Subscribe no-op fixed (replaced silent return with redirect)
- [x] Purchase loop fixed (set input state immediately after loading `input_token`)
- [x] Redirect effect uses `savedInput` (local variable from freshly loaded token), not stale state
- [x] `returnTo` always includes full preview URL with query params (`${window.location.pathname}${window.location.search}`)
- [x] 3 new E2E tests added with tightened assertions
- [x] Cancel subscription API route exists and updates Supabase server-side

### 2. Test Verification
- [ ] Run `npm run test:critical` locally (should pass all tests including 3 new ones)
- [ ] Verify `preview-no-dead-redirecting.spec.ts` passes
- [ ] Verify `subscription-noop-prevented.spec.ts` passes
- [ ] Verify `purchase-redirects-to-input-then-back.spec.ts` passes (with tightened assertions)

---

## 🧪 Minimal Production Checklist (Incognito)

**Do exactly these 3 flows, nothing else:**

### 1. Paid Year Analysis
**Steps**:
1. Open `/ai-astrology/preview?reportType=year-analysis` (incognito, no sessionStorage)
2. Click "Purchase Year Analysis Report"
3. Should redirect to `/ai-astrology/input?reportType=year-analysis&returnTo=...`
4. Fill birth details and submit
5. Should return to `/ai-astrology/preview?reportType=year-analysis&input_token=...`
6. **CRITICAL**: Must NOT bounce back to input
7. **CRITICAL**: Must proceed to Stripe checkout OR show error within timeout (15s)

**Success Criteria**:
- ✅ No redirect loop (stays on preview after returning from input)
- ✅ Either Stripe checkout appears OR error message appears (not infinite loading)
- ✅ URL contains `input_token=` OR `session_id=`
- ✅ "Enter Your Birth Details" card is NOT visible
- ✅ "Redirecting..." is NOT visible

**Failure Points** (if any):
- Token API failure → Should show "Start again" button
- Checkout API failure → Should show error with Ref ID
- Redirect loop → Check `returnTo` includes full URL with query params

---

### 2. Free Life Summary
**Steps**:
1. Open `/ai-astrology/preview?reportType=life-summary` (incognito, no sessionStorage)
2. Should redirect to `/ai-astrology/input?reportType=life-summary&returnTo=...`
3. Fill birth details and submit
4. Should return to `/ai-astrology/preview?reportType=life-summary&input_token=...`
5. **CRITICAL**: Must render report (not redirect loop)

**Success Criteria**:
- ✅ No redirect loop (stays on preview after returning from input)
- ✅ Report content appears (not "Redirecting..." or "Enter Your Birth Details")
- ✅ URL contains `input_token=`
- ✅ "Enter Your Birth Details" card is NOT visible
- ✅ "Redirecting..." is NOT visible

**Failure Points** (if any):
- Token API failure → Should show "Start again" button
- Redirect loop → Check `returnTo` includes full URL with query params

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

**Success Criteria**:
- ✅ No redirect loop (stays on subscription after returning from input)
- ✅ Subscribe button redirects to input if no input (not silent no-op)
- ✅ Subscribe button navigates to Stripe OR shows error (not infinite loading)
- ✅ After return from Stripe, subscription status shows "Active"
- ✅ Cancel button updates status (immediate or within polling window)
- ✅ URL is cleaned (no `input_token=` after loading)

**Failure Points** (if any):
- Subscribe no-op → Check `handleSubscribe()` redirects to input if `!input`
- Checkout API failure → Should show error with Ref ID
- Cancel not working → Check `/api/billing/subscription/cancel` route and Supabase update

---

## 🔍 What to Check If Any Flow Fails

### "Redirecting..." Dead-State
- **Check**: Is `redirectInitiatedRef.current === true` when "Redirecting..." is shown?
- **Check**: Is `hasReportTypeInUrl` gating removed?
- **Check**: Does redirect effect use `savedInput` (local variable), not stale state?

### "Nothing Happens" (Subscribe/Purchase)
- **Check**: Does handler redirect to input if `!input` (not silent return)?
- **Check**: Does handler show error message if API fails?
- **Check**: Does handler have timeout (15s) to prevent infinite loading?

### Redirect Loop
- **Check**: Does `returnTo` include full URL with query params?
- **Check**: Does preview set input state IMMEDIATELY after loading `input_token`?
- **Check**: Does redirect check use `savedInput` (local variable), not state variable?

### Cancel Not Working
- **Check**: Does `/api/billing/subscription/cancel` route exist?
- **Check**: Does route update Supabase server-side (not rely on client-side Stripe updates)?
- **Check**: Does subscription page poll for status updates after cancel?

---

## 📝 Verification Record

**Date**: _______________  
**Tester**: _______________  
**Environment**: Production / Staging  

### Paid Year Analysis
- [ ] Pass
- [ ] Fail (describe failure point): _________________________________

### Free Life Summary
- [ ] Pass
- [ ] Fail (describe failure point): _________________________________

### Monthly Subscription
- [ ] Pass
- [ ] Fail (describe failure point): _________________________________

### Notes
_________________________________
_________________________________
_________________________________

---

## 🚀 Next Steps After Verification

1. **If all pass**: ✅ Ready for production
2. **If any fail**: 
   - Capture exact failure point (token API, returnTo, Stripe checkout, webhook sync)
   - Check failure points listed above
   - Fix and re-verify
   - Do NOT deploy until all 3 flows pass

---

## 📋 Summary

**Status**: Ready for production verification  
**Critical Fixes Applied**:
1. ✅ Preview redirect dead-state (removed `hasReportTypeInUrl` gating)
2. ✅ Subscribe no-op (replaced silent return with redirect)
3. ✅ Purchase loop (set input state immediately after loading `input_token`)
4. ✅ Redirect effect uses fresh state (`savedInput` local variable)
5. ✅ `returnTo` includes full URL with query params
6. ✅ Tests upgraded with tightened assertions
7. ✅ Cancel subscription verified (server-side Supabase update)

**Ready for**: Incognito production verification (3 flows)

