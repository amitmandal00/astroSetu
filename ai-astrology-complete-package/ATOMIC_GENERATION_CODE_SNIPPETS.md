# Atomic Generation Code Snippets

**Date**: 2026-01-17 17:45  
**Status**: ✅ Implementation Complete

---

## Code Snippets for ChatGPT Review

### 1. attemptKey Computation (Line ~211)

```typescript
// CRITICAL FIX (ChatGPT Directive): attemptKey for atomic generation
// Format: `${session_id}:${reportType}:${auto_generate}` - unique per generation attempt
const attemptKey = useMemo(() => {
  const sessionId = searchParams.get("session_id") || "";
  const reportTypeFromUrl = searchParams.get("reportType") || "";
  const reportTypeValue = reportTypeFromUrl || reportType || "";
  const autoGenerate = searchParams.get("auto_generate") === "true";
  return `${sessionId}:${reportTypeValue}:${autoGenerate}`;
}, [searchParams, reportType]);
```

**Verification**: ✅ Stable - computed with `useMemo` keyed on `[searchParams, reportType]`

---

### 2. startGenerationAtomically() Function (Line ~1147)

```typescript
// CRITICAL FIX (ChatGPT Directive): Atomic generation start function
// Single-flight guard + immediate controller start (no setTimeout allowed)
const startGenerationAtomically = useCallback(({ 
  attemptKey: key, 
  inputData, 
  reportTypeToUse, 
  isPaidReport, 
  urlSessionId,
  paymentIntentId 
}: {
  attemptKey: string;
  inputData: AIAstrologyInput;
  reportTypeToUse: ReportType;
  isPaidReport: boolean;
  urlSessionId?: string;
  paymentIntentId?: string;
}) => {
  // Single-flight guard
  if (hasStartedForAttemptKeyRef.current === key) {
    return;
  }
  hasStartedForAttemptKeyRef.current = key; // Store string attemptKey

  // Set processing state immediately - controller must transition away from idle
  usingControllerRef.current = true;
  
  // Start controller immediately (no delay)
  const sessionIdForGeneration = isPaidReport ? (urlSessionId || undefined) : undefined;
  const paymentIntentIdForGeneration = isPaidReport ? paymentIntentId : undefined;
  
  generationController.start(inputData, reportTypeToUse, {
    sessionId: sessionIdForGeneration,
    paymentIntentId: paymentIntentIdForGeneration
  }).catch((error) => {
    console.error("[Preview] Error in generationController (atomic):", error);
    hasStartedForAttemptKeyRef.current = null; // Allow retry
    setError(error.message || "Failed to start report generation. Please try again.");
    setLoading(false);
    // Controller will handle failed state
  });
}, [generationController]);
```

**Verification**: 
- ✅ Single-flight guard with `hasStartedForAttemptKeyRef` (string attemptKey)
- ✅ Sets `usingControllerRef.current = true` immediately
- ✅ Calls `generationController.start(...)` immediately (no delay)
- ✅ On error → sets error and shows Retry

---

### 3. Atomic useEffect with Immediate IIFE (Line ~1187)

```typescript
useEffect(() => {
  // Check if sessionStorage is available
  if (typeof window === "undefined") return;
  
  // CRITICAL FIX: Prevent redirect loops by checking if we're already redirecting
  // Only skip if we've already redirected or are currently generating
  if (hasRedirectedRef.current || isGeneratingRef.current) {
    return;
  }
  
  try {
    // ... reportId check logic ...
    
    // CRITICAL FIX (ChatGPT Directive): Gate by auto_generate - only run when auto_generate=true
    const autoGenerate = searchParams.get("auto_generate") === "true";
    if (!autoGenerate) {
      return; // Exit early if auto_generate is not true (no automatic generation)
    }
    
    // CRITICAL FIX: Get session_id from URL params first (fallback if sessionStorage is lost)
    const urlSessionId = searchParams.get("session_id");
    
    // CRITICAL FIX (ChatGPT Directive): NO setTimeout allowed - run immediately
    // Atomic generation: sessionStorage check and generation start must be synchronous
    // Removed 500ms delay to eliminate "timer resets after 1 second" bug
    (() => {
      // ... sessionStorage read logic ...
      // ... payment verification logic ...
      // ... generation start logic ...
      
      // For paid reports: call startGenerationAtomically() immediately (no setTimeout)
      startGenerationAtomically({
        attemptKey,
        inputData,
        reportTypeToUse,
        isPaidReport,
        urlSessionId: urlSessionId || undefined,
        paymentIntentId: paymentIntentIdFromStorage
      });
    })(); // Execute immediately (no setTimeout)
  } catch (e) {
    // ... error handling ...
  }
}, [router]); // Dependencies intentionally limited to prevent redirect loops
```

**Verification**:
- ✅ IIFE `(() => { ... })()` is inside `useEffect` (client-only, not during render)
- ✅ Gated by `auto_generate=true` check
- ✅ No setTimeout - executes immediately
- ✅ Calls `startGenerationAtomically()` when prerequisites are met

---

## Verification Summary

✅ **Both setTimeout autostarts removed** - Verified via grep (no `setTimeout(500)` or `setTimeout(300)` for generation start)

✅ **IIFE inside useEffect** - Safe (client-only, not during render/SSR)

✅ **attemptKey stability** - Computed with `useMemo` keyed on `[searchParams, reportType]` (stable)

✅ **Single-flight guard** - `hasStartedForAttemptKeyRef` stores string `attemptKey` (not boolean)

✅ **Controller starts immediately** - `usingControllerRef.current = true` + `generationController.start()` called synchronously (no delay)

✅ **E2E test added** - `first-load-atomic-generation.spec.ts` with double-start guard assertion

---

## Atomic Invariant Enforced

When `auto_generate=true`:
- Generation MUST enter `verifying|generating|polling` OR `failed` within 1 render cycle
- Controller must NEVER remain `idle` while UI shows "Generating"
- Timer starts ONLY when controller enters `verifying` (not based on URL params)
- On failure → UI shows Retry and timer stops

---

## Files Modified

1. `astrosetu/src/app/ai-astrology/preview/page.tsx`:
   - Removed `setTimeout(..., 500)` on line ~1331
   - Removed `setTimeout(..., 300)` on line ~1740
   - Added `startGenerationAtomically()` function
   - Added `attemptKey` computation
   - Added `auto_generate` gate

2. `astrosetu/tests/e2e/first-load-atomic-generation.spec.ts` (NEW):
   - Asserts controller leaves `idle` within 1s
   - Asserts timer is monotonic
   - Asserts single start call (≤1 POST requests)
   - Asserts completion/Retry within 120s

3. `astrosetu/package.json`:
   - Added test to `test:critical`

---

**Type-Check**: ✅ Passing  
**Both setTimeout autostarts**: ✅ Removed (verified)

