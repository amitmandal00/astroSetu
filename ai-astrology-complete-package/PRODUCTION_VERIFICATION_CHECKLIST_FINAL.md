# Production Verification Checklist (Final - 2026-01-17 21:15)

**Important**: Test in **incognito browser** (fresh session, no sessionStorage)

---

## ✅ Pre-Deployment Checks

1. **Verify Branch**: Ensure you're deploying from `chore/stabilization-notes` branch
   - Check Vercel deployment commit hash matches `chore/stabilization-notes` branch
   - If mismatch, merge/deploy that exact branch (or cherry-pick)

---

## ✅ 3 Critical Flows (Test in Order)

### 1. Paid Year Analysis Report

**Steps**:
1. Navigate to: `/ai-astrology/preview?reportType=year-analysis`
2. Click "Purchase Year Analysis Report"
3. **Expected**: Redirects to `/input?reportType=year-analysis&returnTo=...` (not silent no-op)
4. Fill birth details, submit
5. **Expected**: Returns to preview with `input_token` (no redirect loop)
6. Click "Purchase" again
7. **Expected**: Redirects to Stripe checkout OR shows error within 15s (with Ref: ABC12345)

**Success Criteria**:
- ✅ No "nothing happens" (redirects to input)
- ✅ No redirect loop (returns to preview with input_token)
- ✅ Purchase triggers Stripe OR visible error with Ref ID within 15s

**If fails**: Capture Ref string from UI + Vercel logs filtered by `[Purchase]` or `[AUTOSTART]`

---

### 2. Free Life Summary Report

**Steps**:
1. Navigate to: `/ai-astrology/preview?reportType=life-summary`
2. **Expected**: Redirects to `/input?reportType=life-summary&returnTo=...` within 2s (no infinite "Redirecting...")
3. Fill birth details, submit
4. **Expected**: Returns to preview with `input_token` (no redirect loop)
5. **Expected**: Report generation starts automatically

**Success Criteria**:
- ✅ No "Redirecting..." dead state > 2s (redirects to input immediately)
- ✅ No redirect loop (returns to preview with input_token)
- ✅ Report generation starts

**If fails**: Capture Ref string from UI + Vercel logs filtered by `[Preview]` or `[INVARIANT_VIOLATION]`

---

### 3. Monthly Subscription Flow

**Steps**:
1. Navigate to: `/ai-astrology/subscription`
2. **Expected**: Redirects to `/input?reportType=life-summary&flow=subscription&returnTo=...`
3. Fill birth details, submit
4. **Expected**: Returns to `/ai-astrology/subscription?input_token=...` → URL cleaned (no token) → Subscribe button enabled
5. Click "Subscribe"
6. **Expected**: Redirects to Stripe checkout OR shows error within 15s (with Ref: ABC12345)
7. **Expected**: UI shows "Cancel anytime" / active state after return

**Success Criteria**:
- ✅ Subscription → input (`flow=subscription`) → subscription (not subscription → input → preview)
- ✅ URL is cleaned (`/ai-astrology/subscription` with no `input_token`)
- ✅ Subscribe button enabled (input loaded successfully)
- ✅ Subscribe triggers Stripe OR visible error with Ref ID within 15s
- ✅ UI shows "Cancel anytime" / active state after return

**If fails**: Capture Ref string from UI + Vercel logs filtered by `[Subscribe]` or `[Subscription]`

---

## ✅ Verification Artifacts to Capture

If any flow fails:

1. **Ref string from UI**:
   - Copy exact Ref: `ABC12345` or `REF_XYZ12345` from error message
   - This allows server-side correlation in Vercel logs

2. **Vercel logs filtered by**:
   - `[AUTOSTART]` - Auto-start generation issues
   - `[INVARIANT_VIOLATION]` - Bundle processing / state machine violations
   - `[Purchase]` - Purchase handler issues
   - `[Subscribe]` - Subscription handler issues
   - `[Preview]` - Preview redirect issues
   - `[Subscription]` - Subscription flow issues

3. **Browser console errors**:
   - Copy full error stack trace
   - Note any `INVARIANT_VIOLATION:` logs

---

## ✅ Expected Behavior After Fixes

### Purchase Handler
- **Before**: Click "Purchase" → nothing happens (silent return)
- **After**: Click "Purchase" → redirects to `/input` → fill details → returns to preview → purchase works

### Preview Redirect
- **Before**: "Redirecting..." forever (reportType gating blocks redirect)
- **After**: Redirects to `/input` within 2s → fill details → returns to preview with `input_token` → no redirect loop

### Subscription Flow
- **Before**: Subscription → input → preview (never returns to subscription)
- **After**: Subscription → input (`flow=subscription`) → subscription with `input_token` → cleans URL → Subscribe button enabled

### Subscribe Button
- **Before**: Does nothing (input never loads, button stays disabled)
- **After**: Accepts `input_token`, loads input from API, cleans URL, Subscribe button enabled

---

## ✅ Test Stricter Assertions

After deployment, verify:

1. **No "Redirecting..." > 2s**: Preview must redirect to input within 2s OR show error UI
2. **Purchase click results in navigation/error within 2s**: Not silent no-op
3. **Subscription URL cleaned**: `/ai-astrology/subscription` with no `input_token` after loading
4. **UI shows active state**: "Cancel anytime" / subscription status visible after return

---

**Status**: Ready for production verification  
**Next**: Run 3 flows in incognito, capture artifacts if any fail

