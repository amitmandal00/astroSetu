# Root Cause Analysis: First-Load Timer Stuck Issue

**Issue**: Year-analysis/Full-life reports stuck at 77s+ with "Still processing..." message after first load.

**Date**: 2026-01-17

---

## 🔍 Root Cause Identified

### Problem 1: Controller Sync Effect Can Still Clear Timer (CRITICAL)

**Location**: `preview/page.tsx` line 1946

```typescript
if (generationController.status === 'idle' && usingControllerRef.current && !isProcessingUIRef.current) {
  setLoadingStartTime(null);
  loadingStartTimeRef.current = null;
}
```

**Issue**: Even though this is gated by `usingControllerRef.current`, if `isProcessingUIRef.current` flips to `false` during first-load state re-hydration, AND if `usingControllerRef.current` is somehow `true`, this will clear the timer mid-generation.

**Why it's happening**:
- First-load with `session_id` + `auto_generate=true` triggers legacy flow
- Legacy flow sets `usingControllerRef.current = false` (line 235)
- BUT there's a race condition: controller sync effect runs BEFORE legacy flow sets the flag
- OR `isProcessingUIRef.current` flips during state initialization before polling starts

**Why it wasn't fixed**:
- The fix I implemented removed `isProcessingUIRef` from **polling stop conditions**
- BUT `isProcessingUIRef` is still used in **controller sync effect** to clear timer
- Controller sync effect has an early return for legacy flows, but timing matters

---

### Problem 2: Backend May Be Stuck in Processing Status

**Location**: Backend route `/api/ai-astrology/generate-report`

**Issue**: Backend returns "processing" status but generation never completes:

1. **Serverless Timeout**: Report generation takes > serverless function timeout
   - Serverless function times out → generation stops
   - But status remains "processing" in database
   - Client keeps polling → sees "processing" forever

2. **Watchdog Not Triggering**: Backend watchdog checks `isProcessingStale`:
   - Year-analysis max processing: 4 minutes (240s)
   - Image shows 77s elapsed → **NOT stale yet**
   - So watchdog doesn't mark it as failed
   - Client continues polling → infinite wait

3. **Report Never Completes**: If generation fails silently:
   - No error thrown
   - No completion call to `markStoredReportCompleted`
   - Status stays "processing"
   - Client keeps polling

---

### Problem 3: First-Load State Initialization Race Condition

**Location**: `preview/page.tsx` - `isProcessingUI` computation (line 120)

**Issue**: During first-load:
1. Component mounts with `auto_generate=true` in URL
2. `isProcessingUI` computed based on URL params
3. State initialization happens asynchronously
4. `isProcessingUIRef.current` might flip to `false` briefly during initialization
5. Controller sync effect runs → sees `!isProcessingUIRef.current` → clears timer
6. Polling starts → timer is null → timer shows 0 or gets reset

**Why it wasn't fixed**:
- The fix removed `isProcessingUIRef` from polling stop conditions ✅
- But timer initialization/clearing still depends on `isProcessingUI` computation
- Timer can be cleared before polling starts if state initialization is slow

---

## 🔧 Why It's Not Getting Fixed After Several Iterations

### Iteration 1: Initial Fix Attempt
- ❌ Tried to fix by updating polling stop conditions
- ❌ Didn't address controller sync effect clearing timer
- ❌ Didn't address state initialization race

### Iteration 2: Attempt Key Fix
- ✅ Added attemptKey-based polling (good!)
- ✅ Removed isProcessingUIRef from polling stop (good!)
- ❌ **MISSED**: Controller sync effect still uses isProcessingUIRef to clear timer
- ❌ **MISSED**: Timer initialization depends on isProcessingUI which can flip

### Iteration 3: Current Fix
- ✅ Polling stop conditions fixed (attemptKey-based)
- ❌ **STILL MISSING**: Controller sync effect fix
- ❌ **STILL MISSING**: Timer initialization race condition fix
- ❌ **STILL MISSING**: Backend stuck processing detection

---

## ✅ Complete Fix Required

### Fix 1: Remove isProcessingUIRef from Controller Sync Effect (CRITICAL)

**Change**: Controller sync effect should NOT clear timer based on `isProcessingUIRef`. Timer should only be cleared when:
- Report completes
- Report fails
- Component unmounts
- Attempt key changes (new generation started)

**Fix**:
```typescript
// DON'T clear timer based on isProcessingUIRef
// ONLY clear when generation actually completes/fails
if (generationController.status === 'idle' && usingControllerRef.current) {
  // DON'T check isProcessingUIRef - it can flip during state init
  // ONLY clear if we're sure generation is done (status === 'idle' AND no content)
  if (!generationController.reportContent && !generationController.error) {
    // Only clear if we're sure we're not in a generation attempt
    // Check activeAttemptKeyRef instead
    if (!activeAttemptKeyRef.current) {
      setLoadingStartTime(null);
      loadingStartTimeRef.current = null;
    }
  }
}
```

### Fix 2: Timer Initialization Should Use attemptKey, Not isProcessingUI

**Change**: Timer start time should be set when generation starts (when attemptKey is set), not based on `isProcessingUI` computation.

**Fix**:
```typescript
// Set timer when generation starts (attemptKey is set)
// NOT based on isProcessingUI computation
if (activeAttemptKeyRef.current && loadingStartTimeRef.current === null) {
  loadingStartTimeRef.current = Date.now();
  setLoadingStartTime(loadingStartTimeRef.current);
}
```

### Fix 3: Backend Watchdog Should Be More Aggressive

**Change**: Backend should check if generation is actually running, not just if it's stale.

**Current**: Only checks `updated_at` timestamp
**Needed**: Check if generation process is actually alive (heartbeat, or shorter timeout)

---

## 📊 Impact Analysis

**Current State** (After Latest Fix):
- ✅ Polling won't stop prematurely (attemptKey-based)
- ❌ Timer can still be cleared by controller sync effect
- ❌ Timer can be cleared during state initialization
- ❌ Backend may be stuck in processing (not a frontend fix)

**Expected After Complete Fix**:
- ✅ Polling won't stop prematurely
- ✅ Timer won't be cleared by controller sync
- ✅ Timer won't be cleared during state init
- ✅ Backend watchdog marks stuck processing as failed

---

## 🎯 Next Steps

1. **Remove isProcessingUIRef from controller sync effect** (timer clearing)
2. **Use attemptKey for timer initialization** (not isProcessingUI)
3. **Add backend heartbeat/status check** (ensure generation is actually running)
4. **Test first-load scenario** (year-analysis with auto_generate=true)

