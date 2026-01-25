# Timeout Fixes Summary

**Date:** 2026-01-22  
**Issue:** Report generation timeouts, resets, long waits (504 errors)

---

## Root Cause Analysis

### Problem Identified:
1. **Conflicting Timeouts:**
   - Route timeout: 30 seconds
   - OpenAI client timeout: 110 seconds (complex) / 55 seconds (regular)
   - Vercel maxDuration: 180 seconds
   - OpenAI retries with exponential backoff (up to 25+ seconds)

2. **Timeout Not Enforced:**
   - OpenAI client timeout (110s) was longer than route timeout (30s)
   - When OpenAI retried, it could exceed 30s without the route timeout triggering
   - Promise.race wasn't properly handling timeout errors

3. **Retry Delays Too Long:**
   - Retries could add 5s + 8.5s + 12s = ~25.5 seconds
   - Combined with 110s client timeout, total could exceed 180s (Vercel limit)

---

## Fixes Applied

### 1. ✅ Reduced OpenAI Client Timeout
**File:** `src/lib/ai-astrology/reportGenerator.ts`

**Before:**
```typescript
const clientTimeoutMs = (isComplexReport || isCareerMoneyReport) ? 110000 : 55000; // 110s/55s
```

**After:**
```typescript
const clientTimeoutMs = 25000; // 25s for all reports (must be < 30s route timeout)
```

**Why:** Client timeout must be less than route timeout to allow proper cancellation.

---

### 2. ✅ Added Abort Signal Checks
**File:** `src/lib/ai-astrology/reportGenerator.ts`

**Added checks before retries:**
```typescript
// Check if we're already past the timeout before retrying
if (controller.signal.aborted) {
  throw new Error("Request aborted due to timeout");
}

// Check if aborted before waiting
if (controller.signal.aborted) {
  throw new Error("Request aborted due to timeout");
}

await new Promise(resolve => setTimeout(resolve, totalWait));

// Check again after wait
if (controller.signal.aborted) {
  throw new Error("Request aborted due to timeout");
}
```

**Why:** Prevents retries when timeout has already triggered.

---

### 3. ✅ Reduced Retry Wait Times
**File:** `src/lib/ai-astrology/reportGenerator.ts`

**Before:**
```typescript
let waitTime = isFreeReportType ? 3000 : 5000; // 3s/5s
const totalWait = Math.min(waitTime + jitter, 20000); // Cap at 20s
```

**After:**
```typescript
let waitTime = isFreeReportType ? 2000 : 3000; // 2s/3s (reduced)
const totalWait = Math.min(waitTime + jitter, 5000); // Cap at 5s (reduced)
```

**Why:** Keeps retries short to respect 30s route timeout.

---

### 4. ✅ Improved Promise.race Error Handling
**File:** `src/app/api/ai-astrology/generate-report/route.ts`

**Before:**
```typescript
reportContent = await Promise.race([reportGenerationPromise, timeoutPromise]);
```

**After:**
```typescript
try {
  reportContent = await Promise.race([reportGenerationPromise, timeoutPromise]);
} catch (raceError: any) {
  // If timeout wins the race, clear it and re-throw
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
  // Check if this is our timeout error
  if (raceError?.message?.includes("timed out") || raceError?.message?.includes("timeout")) {
    throw new Error("Report generation timed out. Please try again with a simpler request.");
  }
  throw raceError;
}
```

**Why:** Ensures timeout errors are properly caught and handled.

---

### 5. ✅ Updated Timeout Error Message
**File:** `src/lib/ai-astrology/reportGenerator.ts`

**Before:**
```typescript
throw new Error("OpenAI API request timed out after 45 seconds. Please try again.");
```

**After:**
```typescript
throw new Error("OpenAI API request timed out after 25 seconds. Please try again.");
```

**Why:** Reflects actual timeout value.

---

## Expected Behavior After Fix

1. **Route timeout (30s) triggers first** - OpenAI client timeout (25s) ensures this
2. **Retries respect timeout** - Abort signal checks prevent retries after timeout
3. **Faster failure** - Reduced retry waits mean faster failure if rate limited
4. **No more 504s** - Timeout triggers before Vercel's 180s limit

---

## Timeout Hierarchy (After Fix)

1. **OpenAI Client Timeout:** 25 seconds
2. **Route Timeout:** 30 seconds
3. **Vercel maxDuration:** 180 seconds (safety net, should not be hit)

---

## Testing Checklist

- [ ] Test report generation completes within 30s
- [ ] Test timeout triggers correctly at 30s
- [ ] Test retries respect abort signal
- [ ] Test no more 504 errors from Vercel
- [ ] Test error messages are clear

---

## Files Modified

1. `src/lib/ai-astrology/reportGenerator.ts`
   - Reduced client timeout to 25s
   - Added abort signal checks
   - Reduced retry wait times
   - Updated timeout error message

2. `src/app/api/ai-astrology/generate-report/route.ts`
   - Improved Promise.race error handling

---

**Status:** Ready for testing and deployment

