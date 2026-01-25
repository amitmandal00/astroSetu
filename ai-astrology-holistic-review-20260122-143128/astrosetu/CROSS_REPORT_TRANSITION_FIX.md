# Cross-Report Transition Fix - "First Time Only" Timer Reset

**Date**: 2026-01-14  
**Status**: ✅ **COMPLETE** - All fixes implemented

---

## 🐛 Issue Fixed

**Problem**: For very first time only (after first load of landing page), when yearly analysis report generation is tried - After few seconds, yearly analysis timer resets to 0 and report generation also gets stuck.

**Root Cause**:
1. Landing page loads, runs controller-based flow (life-summary) and sets `usingControllerRef.current = true`
2. Then user tries Year-Analysis without full page reload (same preview/page.tsx instance; refs persist)
3. Year-Analysis uses legacy `generateReport()` flow, but controller-sync useEffect is still active because `usingControllerRef.current` stayed true
4. Controller is idle (no controller attempt for year-analysis), so sync effect clears `loadingStartTime` → timer snaps back to 0
5. Polling loop stops (because UI "not processing" anymore) → generation appears stuck

---

## ✅ Fixes Implemented

### Fix 1: Reset usingControllerRef When Switching to Legacy Flows ✅
**File**: `src/app/ai-astrology/preview/page.tsx`

**Change**: At the start of `generateReport()` (legacy flow), force:
- `usingControllerRef.current = false`
- This prevents controller-sync from interfering with legacy flows

**Location**: Line 207-212

```typescript
const generateReport = useCallback(async (...) => {
  // CRITICAL FIX 1: Reset usingControllerRef when switching to legacy flows
  usingControllerRef.current = false; // Legacy flow owns state - controller sync must not interfere
  // ... rest of function
});
```

---

### Fix 2: Make Controller-Sync Require Matching Active Attempt ✅
**Files**: 
- `src/hooks/useReportGenerationController.ts`
- `src/app/ai-astrology/preview/page.tsx`

**Changes**:
1. Added `activeAttemptId` and `activeReportType` to controller interface
2. Track `activeReportType` when starting generation
3. Controller-sync now checks:
   - `usingControllerRef.current === true`
   - `generationController.activeReportType === currentReportType`
   - Prevents cross-report bleed

**Location**: 
- Controller: Lines 28-49, 58-59, 243-244, 377-388
- Preview page: Lines 1818-1830

```typescript
// Controller sync should only run when:
if (generationController.activeReportType !== null && generationController.activeReportType !== reportType) {
  // Controller has active attempt for different report type - don't sync
  return;
}
```

---

### Fix 3: On ReportType Change, Hard Reset UI Owner + Timers ✅
**File**: `src/app/ai-astrology/preview/page.tsx`

**Change**: Added `useEffect([reportType])` that does:
- Abort any legacy polling
- Reset `loadingStartTimeRef/current`
- Reset `usingControllerRef.current = false`
- Clear any stage flags that are report-type specific

**Location**: Lines 1883-1902

```typescript
useEffect(() => {
  // Abort any legacy polling
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }
  
  // Reset loadingStartTimeRef/current
  loadingStartTimeRef.current = null;
  setLoadingStartTime(null);
  
  // Reset usingControllerRef.current = false
  usingControllerRef.current = false;
  
  // Clear any stage flags
  setLoadingStage(null);
  setLoading(false);
  isGeneratingRef.current = false;
  
  // Reset attempt ID
  attemptIdRef.current = 0;
}, [reportType]);
```

---

## 🧪 Tests Added

### E2E Test: Cross-Report Transition ✅
**File**: `tests/e2e/critical-invariants.spec.ts`

**Test**: "Cross-report transition: life-summary → year-analysis must NOT reset timer"
- Visit `/preview?reportType=life-summary` (controller flow)
- Wait until loader starts
- Navigate client-side to `/preview?reportType=year-analysis` (legacy flow)
- Assert: while loader visible, elapsed increases within 2 seconds
- Assert: elapsed never returns to 0 while still loading
- Assert: generation reaches completion (or at minimum polling continues)

**Location**: Test 9 (lines 220-280)

---

### Integration Test: Controller-Sync Must Not Clear Legacy Timers ✅
**File**: `tests/integration/controller-sync-legacy-timers.test.ts`

**Tests**:
1. Should not clear loadingStartTime when controller is idle and legacy flow is running
2. Should not clear loadingStartTime when controller has active attempt for different report type
3. Should clear loadingStartTime only when controller is idle and matches current report type

---

## 📋 Documentation Updated

### CURSOR_OPERATING_MANUAL.md ✅
**Added**: Cross-Report Transition Non-Negotiables section
- Reset usingControllerRef when switching to legacy flows
- Controller-sync must require matching active attempt
- On reportType change, hard reset UI owner + timers
- Report-type transition is required test case

---

## ✅ Verification

- ✅ Type check: PASSED
- ✅ Build: PASSED
- ✅ All fixes implemented
- ✅ Tests added (E2E + integration)
- ✅ Documentation updated

---

## 🎯 Impact

This fix prevents:
- Timer reset to 0 when switching from controller flow to legacy flow
- Generation getting stuck when switching report types
- Cross-report state bleed
- "First time only" timer reset bug

---

**Last Updated**: 2026-01-14  
**Status**: ✅ **COMPLETE** - All fixes implemented, tests added, documentation updated

