# ChatGPT Feedback - Implementation Plan

## Issues Identified
1. First load: Year-analysis/Full-life timer keeps running, report never appears
2. Subscription "Subscribe" button does nothing / refreshes same page
3. Monthly Outlook flow dumps user into Free Life input, never returns to subscription
4. Future dates only + build failures (futureWindows import)

## Root Causes & Fixes

### 1. Polling Stop Condition (CRITICAL)
**Problem**: Polling stops prematurely because `isProcessingUIRef.current` can flip during first-load sequence.

**Solution**: 
- Replace `isProcessingUIRef` stop condition with:
  - `abortController.signal.aborted`
  - `!isMountedRef.current`
  - `activeAttemptRef.current !== attemptKey`
- Use `attemptKey = ${session_id}:${reportType}` to track active attempts
- Never reset timer start while poll attempt is active
- Add mounted ref check

### 2. Timer Start Time Not Cleared During Active Attempt
**Problem**: Timer start time cleared during active generation.

**Solution**: Only clear timer when:
- status becomes completed or failed, OR
- user navigates away, OR
- attemptKey changes

### 3. Subscription Endpoint (ALREADY CORRECT)
**Status**: Subscription page already uses `/api/billing/subscription` (verified)

### 4. Monthly Outlook Navigation
**Problem**: Missing `returnTo` parameter in Monthly Outlook CTA.

**Solution**: Add `returnTo=/ai-astrology/subscription` to Monthly Outlook link.

### 5. Missing Tests
- First-load processing invariant (E2E)
- Subscription journey end-to-end (E2E)
- Subscription returnTo navigation (E2E)
- Future windows normalizer (Unit)

### 6. Workflow Controls
- Update `.cursor/rules`
- Update `NON_NEGOTIABLES.md`
- Update `CURSOR_*.md` files

---

## Implementation Order
1. ✅ Fix polling stop conditions (preview/page.tsx)
2. ✅ Ensure timer not cleared during active attempt
3. ✅ Fix Monthly Outlook navigation
4. ✅ Create missing tests
5. ✅ Update workflow controls
6. ✅ Verify futureWindows import paths

