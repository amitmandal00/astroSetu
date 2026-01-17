# CURSOR ACTIONS REQUIRED

**Last Updated**: 2026-01-17 16:30  
**Status**: 🔴 **CRITICAL FIXES REQUIRED**

---

## ⚠️ Critical Issue: First-Load Timer Reset + Stuck Generation

**Root Cause Identified**: Non-deterministic generation start due to `setTimeout`-based autostart

**Symptom**: "After very first initial load - yearly analysis report, full life report does not generate and timer resets after 1 seconds and nothing happens for report generation"

**Location**: `astrosetu/src/app/ai-astrology/preview/page.tsx`
- Line 1266: `setTimeout` for delayed sessionStorage check (500ms delay)
- Line 1675: `setTimeout` for paid report generation (300ms delay)

---

## 🔧 Required Fixes (ChatGPT Command)

### FIX 1: Make report generation ATOMIC (CRITICAL)

**New Invariant**:
> If preview page renders with `auto_generate=true`, then within ONE render cycle:
> - generation MUST enter `verifying|generating|polling`
> - OR fail with explicit error + Retry
> - It must NEVER remain `idle`

**Implementation Steps**:
1. ✅ **Remove all `setTimeout`-based autostart**:
   - Remove `setTimeout` on line 1266 (delayed sessionStorage check)
   - Remove `setTimeout` on line 1675 (paid report generation)
   - All other `setTimeout` autostart paths

2. ✅ **Create `startGenerationAtomically()` function**:
   - Must be called synchronously in a `useEffect`
   - Keyed ONLY on stable `attemptKey` (`session_id + reportType + auto_generate`)
   - Must:
     a) verify session (if needed)
     b) persist/confirm attempt
     c) transition controller to `'verifying'` immediately
   - Timer must start ONLY when `controller.status === 'verifying'`

3. ✅ **If verification fails or prerequisites are missing**:
   - controller must enter `'failed'`
   - UI must show Retry
   - timer must stop

**Deliverables**:
- [ ] `preview/page.tsx` updated
- [ ] No `setTimeout` autostart remains
- [ ] Controller never stays `idle` when `auto_generate=true`

---

### FIX 2: Enforce "generation intent record" (Critical)

**Problem**: Intent lives in URL + UI memory → fragile

**Required Change**: Persist generation intent when user initiates any paid/monthly/yearly report

**Implementation**:
```typescript
generation_intent = {
  userId,
  reportType,
  source: 'monthly' | 'yearly' | 'bundle',
  returnTo,
  status: 'pending'
}
```

**Benefits**:
- First-load no longer depends on hydration timing
- Monthly → Free → Back flow becomes deterministic
- Retry knows what to retry

---

### FIX 3: Monthly Subscription flow (End-to-end)

**Missing Invariant**: After Free Life Report submission, if user came from Monthly flow, they MUST be returned to Monthly dashboard/subscription.

**Required Behavior**:
1. Monthly CTA sets intent:
   ```typescript
   intent.source = 'monthly'
   intent.returnTo = '/ai-astrology/subscription'
   ```
2. Free Life Report submission:
   - checks intent
   - redirects to `intent.returnTo`
3. Subscription page:
   - if intent exists and subscription inactive → create checkout session
4. Subscribe button:
   - MUST create a new checkout session
   - must not rely on stale session

**Files to Fix**:
- `src/app/ai-astrology/input/page.tsx` - Respect `returnTo` from intent
- `src/app/ai-astrology/subscription/page.tsx` - Always create fresh checkout session
- `src/app/ai-astrology/page.tsx` - Set monthly intent before redirecting

---

## 🧪 Missing Tests (Add These)

### Test 1: First-load atomic guarantee (MOST IMPORTANT)
**File**: `tests/e2e/first-load-atomic-generation.spec.ts`

**Given**: `preview?auto_generate=true&session_id=...`  
**Expect**:
- Within 1s: `controller.status !== 'idle'`
- Either enters `verifying/generating` OR `failed`
- Timer never resets to 0 while status is `idle`

### Test 2: Monthly intent continuity
**File**: `tests/e2e/monthly-intent-continuity.spec.ts`

**Flow**: Monthly CTA → Free Life → Submit → Subscription  
**Assert**:
- lands on subscription page
- pending intent exists
- Subscribe triggers checkout

### Test 3: Subscribe button must mutate state
**File**: `tests/e2e/subscribe-must-change-state.spec.ts`

**Click Subscribe**  
**Assert**:
- network call made to create checkout
- page does NOT reload to same URL with same state

---

## 📋 Workflow Updates Required

### Update NON_NEGOTIABLES.md:
1. ❌ No implicit generation starts (no setTimeout, no derived starts)
2. ✅ Generation must be atomic: start OR fail
3. ❌ URL params are not intent
4. ✅ All paid flows require persisted intent
5. ❌ Subscribe button must never be a no-op

### Update .cursor/rules:
- Any change to preview/subscription/input pages requires:
  - running `npm run release:gate`
  - pasting output into `CURSOR_PROGRESS.md`

---

## 🎯 Success Criteria

✅ First ever open of preview link with `session_id=...&auto_generate=true` must end in:
- either "completed (content visible)" OR
- "failed with retry CTA"
- never infinite spinner

✅ Monthly flow:
- Monthly CTA → Free Life → Submit → Returns to Subscription
- Subscribe button → Creates fresh checkout session → Redirects to Stripe

✅ All tests pass:
- `npm run test:critical` must pass
- `npm run release:gate` must pass

---

## 📝 Notes

- This fix must be implemented carefully to avoid breaking existing flows
- All `setTimeout`-based autostart must be removed
- Generation must be atomic - start OR fail deterministically
- Timer must start only when controller enters `verifying` state

---

## ⏱️ Priority

🔴 **URGENT** - This is blocking production stability. First-load failures are user-facing and critical.

---

## 🔄 Status

- [ ] Atomic generation fix implemented
- [ ] Intent persistence implemented
- [ ] Monthly flow fixed
- [ ] Tests added
- [ ] Workflow/docs updated
- [ ] All tests passing
