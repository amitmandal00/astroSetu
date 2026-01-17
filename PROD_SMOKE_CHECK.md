# Production Smoke Check Checklist

**Purpose**: Human-verified sanity check after major releases to confirm critical flows work in production.

**When to Run**: After major releases or significant core flow changes.

**How to Run**: Test in production (incognito mode) with fresh session_ids.

---

## Smoke Check Scenarios

### 1. First-Load Year-Analysis Auto-Generate

**Test Link Pattern**: 
```
https://www.mindveda.net/ai-astrology/preview?session_id=<new_session_id>&reportType=year-analysis&auto_generate=true
```

**Expected Behavior**:
- ✅ Either completes (report renders), OR
- ✅ Fails with Retry button within 180 seconds
- ❌ **Never**: Timer reset + nothing happens (infinite spinner)

**Pass Criteria**: Within 180 seconds, either report renders or Retry button appears. Timer is monotonic (never resets to 0).

---

### 2. Stale Session Recovery

**Test Link Pattern**:
```
https://www.mindveda.net/ai-astrology/preview?session_id=stale_or_invalid_session_id&reportType=year-analysis&auto_generate=true
```

**Expected Behavior**:
- ✅ UI shows "Retry" button within 30 seconds
- ✅ Retry button starts a new attempt (new POST request)
- ❌ **Never**: Infinite spinner on stale session

**Pass Criteria**: Retry button appears within 30 seconds. Retry starts new generation (not reuse stale session_id).

---

### 3. Subscription Journey

**Test Flow**:
1. Navigate to `/ai-astrology/subscription`
2. Click "Subscribe" button
3. Complete Stripe checkout (or mock success)
4. Verify redirects back to subscription dashboard
5. Verify subscription status shows "Active"

**Expected Behavior**:
- ✅ Subscribe button redirects away from subscription page (to Stripe or success)
- ✅ Returns to subscription dashboard after successful payment
- ✅ Subscription status shows "Active" without manual refresh
- ❌ **Never**: Subscribe button refreshes same page (silent failure)

**Pass Criteria**: Subscribe button navigates away. Subscription dashboard shows active status after return.

---

### 4. Subscription Cancel & Resume

**Test Flow**:
1. Navigate to `/ai-astrology/subscription` (with active subscription)
2. Click "Cancel Subscription"
3. Verify status shows "Canceled" or "Will cancel at period end"
4. Refresh page
5. Verify canceled status persists
6. (Optional) Click "Resume Subscription"
7. Verify status shows "Active" again

**Expected Behavior**:
- ✅ Cancel button updates subscription status
- ✅ Canceled status persists after refresh
- ✅ Resume button (if available) reactivates subscription
- ❌ **Never**: Status doesn't update or doesn't persist

**Pass Criteria**: Cancel updates status. Status persists after refresh. Resume (if tested) reactivates subscription.

---

### 5. Monthly Outlook → Input → Return to Subscription

**Test Flow**:
1. Navigate to `/ai-astrology/subscription` (without saved birth details)
2. Should redirect to `/ai-astrology/input?reportType=life-summary&flow=subscription&returnTo=/ai-astrology/subscription`
3. Fill birth details form
4. Submit form
5. Verify redirects back to `/ai-astrology/subscription`

**Expected Behavior**:
- ✅ Redirects to input page with correct `returnTo` parameter
- ✅ After submitting input, returns to subscription page (not preview)
- ✅ Final URL exactly equals `/ai-astrology/subscription` (not just contains it)
- ❌ **Never**: Gets stuck in input page or redirects to preview instead

**Pass Criteria**: Returns to subscription page after input submission. Final URL pathname is exactly `/ai-astrology/subscription`.

---

### 6. Bundle Report Generation

**Test Flow**:
1. Navigate to bundle purchase flow
2. Complete payment
3. Verify bundle generation starts
4. Verify all reports in bundle are generated

**Expected Behavior**:
- ✅ Bundle generation starts after payment
- ✅ All reports in bundle are generated sequentially
- ✅ Bundle processing does NOT affect non-bundle reports
- ❌ **Never**: Bundle processing causes issues with year-analysis or full-life reports

**Pass Criteria**: Bundle generation works correctly. No cross-report interference.

---

### 7. Non-Bundle Report (Year-Analysis, Full-Life)

**Test Flow**:
1. Navigate to year-analysis or full-life report purchase flow
2. Complete payment
3. Verify generation starts
4. Verify completion or Retry within timeout

**Expected Behavior**:
- ✅ Generation starts after payment
- ✅ Completes or fails with Retry within timeout
- ✅ Timer is monotonic (never resets)
- ❌ **Never**: Timer resets or infinite spinner

**Pass Criteria**: Generation completes or fails with Retry. Timer is monotonic.

---

## Quick Smoke Check (5-Minute Version)

**Minimum Viable Smoke Check** (for quick verification):

1. ✅ First-load year-analysis auto_generate link → completes or Retry within 180s (not infinite spinner)
2. ✅ One stale session link → Retry button within 30s
3. ✅ Subscription → Subscribe → Returns to dashboard with active status

**If all 3 pass**: Core flows are stable. Full smoke check can be done later.

---

## What to Do If a Check Fails

1. **Immediately**: Note which check failed and exact behavior observed
2. **Capture**: Screenshot or screen recording of failure
3. **Logs**: Check Vercel logs for `[INVARIANT_VIOLATION]` tags or Sentry errors
4. **Document**: Add to `CURSOR_ACTIONS_REQUIRED.md` with:
   - Which check failed
   - Expected vs actual behavior
   - Environment details (browser, session_id pattern, etc.)
   - Logs or error messages
5. **Next Steps**: Do NOT deploy further changes until root cause is identified and fixed

---

## Success Criteria

**All smoke checks must pass** before considering a release "production-stable".

**If any check fails**: Treat as P0 issue and investigate immediately. Do not proceed with further releases until resolved.

---

## Notes

- **Use incognito mode**: Ensures clean browser context (no cached state)
- **Use new session_ids**: Each test should use a unique session_id to avoid state pollution
- **Test in production**: These checks are for production environment, not local dev
- **Document failures**: If any check fails, document in `CURSOR_ACTIONS_REQUIRED.md` immediately

---

## Baseline Freeze Status

**Current Baseline**: 2026-01-17 (Ship-ready baseline established)

**Freeze Policy**:
- ✅ No refactors of core flows (preview generation, subscription, polling)
- ✅ No "cleanup" without explicit approval
- ✅ Only additive features allowed
- ✅ Any core flow change must pass `npm run release:gate`
- ✅ Technical debt (setTimeout autostart) is tracked but not refactored yet

**When to Update This Checklist**:
- After adding new critical flows
- After major architectural changes
- After resolving production issues (add regression test)

