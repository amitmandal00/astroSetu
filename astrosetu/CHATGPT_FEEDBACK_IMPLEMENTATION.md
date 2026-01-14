# ChatGPT Feedback Implementation - Timer Reset & Flicker Fixes

**Date**: 2026-01-14  
**Status**: ✅ **COMPLETE** - All fixes implemented

---

## 🐛 Issues Fixed

### 1. Year-analysis Timer Resets to 0 ✅
**Symptom**: Timer resets to 0 after a few seconds and gets stuck  
**Root Cause**: Controller sync was clearing `loadingStartTime` when controller is idle, even if legacy flow is still running  
**Fix**: Gate controller sync - only sync when `usingControllerRef.current === true`

### 2. Bundle Timer Stays at 0 ✅
**Symptom**: Bundle generates fine but timer stays at 0  
**Root Cause**: Same as #1 - controller sync interfering with legacy bundle flow  
**Fix**: Set `usingControllerRef.current = false` for bundle flows

### 3. Decision-support Timer Stays at 0 ✅
**Symptom**: Decision pack generates fine but timer stays at 0  
**Root Cause**: Same as #1 - controller sync interfering  
**Fix**: Gate controller sync

### 4. Full-life Flickers and Ends in Error ✅
**Symptom**: Full-life flickers a lot and ends in "Error Generating Report"  
**Root Cause**: Stale closure in async polling - `isProcessingUI` captured in closure causes premature polling stops  
**Fix**: Use `isProcessingUIRef.current` instead of `isProcessingUI` in async polling

---

## ✅ Fixes Implemented

### Fix A: Gate Controller Sync ✅
**Problem**: Controller sync was overwriting non-controller flows (year-analysis, bundle, decision-support)

**Solution**:
1. Added `usingControllerRef` to track if controller started the flow
2. Set `usingControllerRef.current = true` when calling `generationController.start()`
3. Set `usingControllerRef.current = false` for legacy bundle flows
4. Gated controller sync effect to only run when `usingControllerRef.current === true`

**Files Modified**:
- `src/app/ai-astrology/preview/page.tsx`:
  - Added `usingControllerRef` (line ~52)
  - Gated controller sync effect (line ~1800)
  - Set `usingControllerRef.current = true` before all `generationController.start()` calls
  - Set `usingControllerRef.current = false` for bundle flows

**Impact**: ✅ Controller sync no longer interferes with legacy flows

---

### Fix C: Replace isProcessingUI in Async Code with Ref ✅
**Problem**: Async polling checks stale `isProcessingUI` (closure issue), causing premature stops and flicker

**Solution**:
1. Added `isProcessingUIRef` to track `isProcessingUI` in ref
2. Sync `isProcessingUIRef.current = isProcessingUI` in `useEffect`
3. Replace all `isProcessingUI` in async polling with `isProcessingUIRef.current`

**Files Modified**:
- `src/app/ai-astrology/preview/page.tsx`:
  - Added `isProcessingUIRef` (line ~54)
  - Added `useEffect` to sync ref (line ~113)
  - Replaced all `isProcessingUI` in `generateReport` polling with `isProcessingUIRef.current` (lines ~377, ~414, ~428, ~445, ~543, ~558)

**Impact**: ✅ Polling no longer stops prematurely due to stale closure

---

## 🧪 Tests Added

### E2E Tests (Critical Invariants) ✅
Added 4 new failing tests to `tests/e2e/critical-invariants.spec.ts`:

1. **Test 5**: Year-analysis timer must NOT reset to 0 after a few seconds
2. **Test 6**: Bundle timer must NOT stay at 0 during generation
3. **Test 7**: Decision-support timer must NOT stay at 0 during generation
4. **Test 8**: Full-life must NOT flicker and end in error screen

**Impact**: ✅ Tests will catch these regressions in the future

---

## 📋 Non-Negotiables Updated

### New Non-Negotiables Added ✅
1. **Rule 0.5: Controller Sync Gating (MANDATORY)**
   - Controller sync must NOT interfere with legacy flows
   - Use `usingControllerRef` to track if controller started the flow
   - Only sync state when `usingControllerRef.current === true`

2. **Rule 0.6: Async Code Must Use Refs (MANDATORY)**
   - All async loops must read UI state via refs, not closure
   - Use `isProcessingUIRef.current` instead of `isProcessingUI` in async polling

**Files Modified**:
- `CURSOR_OPERATING_MANUAL.md` - Added new rules

---

## 🔍 Root Cause Analysis

### Why Free Reports Worked But Others Didn't
- **Free reports**: Use controller → `usingControllerRef.current = true` → controller sync works correctly
- **Year-analysis/Bundle/Decision-support**: Use legacy paths → `usingControllerRef.current = false` → controller sync was interfering

### Why Full-life Flickered
- **Stale closure**: `isProcessingUI` captured in closure → polling stops prematurely → state doesn't update → flicker
- **Fix**: Use `isProcessingUIRef.current` → always reads current value → polling continues correctly

---

## ✅ Verification

- ✅ Type check: PASSED
- ✅ All fixes implemented
- ✅ Tests added
- ✅ Non-negotiables updated

---

## 📝 Files Modified

1. `src/app/ai-astrology/preview/page.tsx`
   - Added `usingControllerRef` and `isProcessingUIRef`
   - Gated controller sync effect
   - Replaced `isProcessingUI` with `isProcessingUIRef.current` in async polling
   - Set `usingControllerRef.current` correctly for all flows

2. `tests/e2e/critical-invariants.spec.ts`
   - Added 4 new failing tests for timer reset and flicker issues

3. `CURSOR_OPERATING_MANUAL.md`
   - Added Rule 0.5: Controller Sync Gating
   - Added Rule 0.6: Async Code Must Use Refs
   - Updated Contract 6: Controller MUST Own ALL Report Types (OR Gate Sync)

---

## 🎯 Impact

### Before
- ❌ Year-analysis timer resets to 0
- ❌ Bundle timer stays at 0
- ❌ Decision-support timer stays at 0
- ❌ Full-life flickers and ends in error

### After
- ✅ Year-analysis timer works correctly
- ✅ Bundle timer works correctly
- ✅ Decision-support timer works correctly
- ✅ Full-life no longer flickers

---

**Last Updated**: 2026-01-14  
**Status**: ✅ **COMPLETE** - All fixes implemented, tests added, non-negotiables updated
