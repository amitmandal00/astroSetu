# Deployment Verification Record

**Branch**: `chore/stabilization-notes`  
**Deployment Date**: [FILL IN AFTER DEPLOYMENT]  
**Vercel Deployment Commit Hash**: [FILL IN FROM VERCEL]

---

## Pre-Deployment Verification

### ✅ Branch Verification
- [ ] Vercel deployment commit hash matches `chore/stabilization-notes` branch
- [ ] Commit hash: `[PASTE FROM VERCEL]`
- [ ] Branch: `chore/stabilization-notes`
- [ ] If mismatch: Merge/deploy that exact branch (or cherry-pick)

**How to verify**:
```bash
git log --oneline -1 chore/stabilization-notes
# Compare with Vercel deployment commit hash
```

---

## Post-Deployment Verification (Incognito Browser)

**Important**: Test in **incognito browser** (fresh session, no sessionStorage)

### ✅ Flow 1: Paid Year Analysis Report

**Steps**:
1. Navigate to: `/ai-astrology/preview?reportType=year-analysis`
2. Click "Purchase Year Analysis Report"
3. **Expected**: Redirects to `/input?reportType=year-analysis&returnTo=...` within 2s (not silent no-op)
4. Fill birth details, submit
5. **Expected**: Returns to preview with `input_token` (no redirect loop)
6. Click "Purchase" again
7. **Expected**: Redirects to Stripe checkout OR shows error within 15s (with Ref: ABC12345)

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL

**Screenshot**: [ATTACH SCREENSHOT]

**If failed**:
- Ref string from UI: `[PASTE REF]`
- Vercel logs (grep `[Purchase]` or `[AUTOSTART]`): `[PASTE LOG LINE]`

---

### ✅ Flow 2: Free Life Summary Report

**Steps**:
1. Navigate to: `/ai-astrology/preview?reportType=life-summary`
2. **Expected**: Redirects to `/input?reportType=life-summary&returnTo=...` within 2s (no infinite "Redirecting...")
3. Fill birth details, submit
4. **Expected**: Returns to preview with `input_token` (no redirect loop)
5. **Expected**: Report generation starts automatically

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL

**Screenshot**: [ATTACH SCREENSHOT]

**If failed**:
- Ref string from UI: `[PASTE REF]`
- Vercel logs (grep `[Preview]` or `[INVARIANT_VIOLATION]`): `[PASTE LOG LINE]`

---

### ✅ Flow 3: Monthly Subscription Flow

**Steps**:
1. Navigate to: `/ai-astrology/subscription`
2. **Expected**: Redirects to `/input?reportType=life-summary&flow=subscription&returnTo=...`
3. Fill birth details, submit
4. **Expected**: Returns to `/ai-astrology/subscription?input_token=...` → URL cleaned (no token) → Subscribe button enabled
5. Click "Subscribe"
6. **Expected**: Redirects to Stripe checkout OR shows error within 15s (with Ref: ABC12345)
7. **Expected**: UI shows "Cancel anytime" / active state after return

**Result**: [ ] ✅ PASS / [ ] ❌ FAIL

**Screenshot**: [ATTACH SCREENSHOT]

**If failed**:
- Ref string from UI: `[PASTE REF]`
- Vercel logs (grep `[Subscribe]` or `[Subscription]`): `[PASTE LOG LINE]`

---

## Verification Artifacts

### Vercel Logs to Check

If any flow fails, grep Vercel logs for:

1. **`[AUTOSTART]`** - Auto-start generation issues
2. **`[INVARIANT_VIOLATION]`** - Bundle processing / state machine violations
3. **`[Purchase]`** - Purchase handler issues
4. **`[Subscribe]`** - Subscription handler issues
5. **`[Preview]`** - Preview redirect issues
6. **`[Subscription]`** - Subscription flow issues

**Example grep command**:
```bash
# In Vercel logs, search for:
[AUTOSTART]
[INVARIANT_VIOLATION]
[Purchase]
[Subscribe]
[Preview]
[Subscription]
```

---

## Test Sanity Check (One-Time)

**Status**: [ ] ✅ DONE / [ ] ⏸️ PENDING

**Exercise**: Temporarily reintroduce old bug (e.g., "skip redirect if reportType exists"), run `test:critical`, confirm tests fail, then revert.

**Result**: [ ] Tests fail on old bug (good - tests protect) / [ ] Tests pass on old bug (bad - tests don't protect)

**Note**: This prevents "green tests that don't protect anything"

---

## Summary

- **All 3 flows**: [ ] ✅ PASS / [ ] ❌ FAIL
- **Vercel commit hash matches branch**: [ ] ✅ YES / [ ] ❌ NO
- **Screenshots attached**: [ ] ✅ YES / [ ] ❌ NO
- **Logs captured (if failed)**: [ ] ✅ YES / [ ] ❌ NO

---

**Next Steps** (if any failures):
1. Capture Ref string from UI
2. Grep Vercel logs for matching log line
3. Share with ChatGPT for analysis

