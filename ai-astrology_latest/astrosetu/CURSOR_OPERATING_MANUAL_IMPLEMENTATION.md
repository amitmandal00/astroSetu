# Cursor Operating Manual - Implementation Complete

**Date**: 2026-01-14  
**Status**: ✅ **IMPLEMENTED** - All guidelines recorded and critical test added

---

## ✅ Implementation Checklist

### 1. Guidelines Document Created ✅
- **File**: `CURSOR_OPERATING_MANUAL.md`
- **Status**: ✅ Complete
- **Contents**:
  - Non-negotiable product contracts (5 contracts)
  - Forbidden edits for Cursor
  - Required architecture boundaries
  - Cursor workflow rules (4 rules)
  - Standard prompt templates (3 templates)
  - Critical E2E test documentation

### 2. Critical E2E Test Implemented ✅
- **File**: `tests/e2e/loader-timer-never-stuck.spec.ts`
- **Status**: ✅ Complete
- **Tests**: 6 comprehensive E2E tests
- **Coverage**:
  - ✅ Loader visible => elapsed ticks (year-analysis)
  - ✅ Loader visible => elapsed ticks (life-summary)
  - ✅ Loader visible => elapsed ticks (paid report)
  - ✅ Loader visible => elapsed ticks (verifying payment stage)
  - ✅ Retry does not break timer (bundle)
  - ✅ Timer stops when report completes

### 3. UI data-testid Added ✅
- **File**: `src/app/ai-astrology/preview/page.tsx`
- **Location**: Lines ~2396, ~2400
- **Status**: ✅ Complete
- **Change**: Added `data-testid="elapsed-seconds"` to elapsed time display
- **Usage**: E2E test uses this selector to verify timer ticks

### 4. Defect Register Updated ✅
- **File**: `DEFECT_REGISTER.md`
- **Status**: ✅ Complete
- **Change**: Added reference to `CURSOR_OPERATING_MANUAL.md`
- **Note**: All future report generation changes must follow the operating manual

---

## 📋 Non-Negotiable Product Contracts (Enforced)

### 1. Loader visible ⇒ timer must tick ✅
- **Enforcement**: E2E test `loader-timer-never-stuck.spec.ts`
- **Status**: ✅ Test implemented

### 2. Single-flight generation ✅
- **Implementation**: `useReportGenerationController` with `attemptId` and `AbortController`
- **Status**: ✅ Already implemented

### 3. Retry is a full restart ✅
- **Implementation**: `handleRetryLoading` follows contract
- **Status**: ✅ Already implemented

### 4. URL params never imply processing ✅
- **Implementation**: `isProcessingUI` does NOT include `reportType` in URL
- **Status**: ✅ Already implemented

### 5. Completion stops everything ✅
- **Implementation**: `generationController.cancel()` stops polling and timer
- **Status**: ✅ Already implemented

---

## 🚫 Forbidden Edits (Documented)

- ❌ Don't patch `useEffect` dependencies randomly
- ❌ Don't add new booleans/refs to "fix" symptoms
- ❌ Don't change UI render gating logic without tests
- ❌ Don't create second polling loop

**Status**: ✅ Documented in `CURSOR_OPERATING_MANUAL.md`

---

## ✅ Required Architecture Boundaries (Verified)

- ✅ One controller owns generation (`useReportGenerationController`)
- ✅ One timer hook returns derived elapsed seconds (`useElapsedSeconds`)
- ✅ `isProcessingUI` matches loader visibility

**Status**: ✅ Already implemented and verified

---

## 🔄 Cursor Workflow Rules (Documented)

1. ✅ **Test-First**: Add failing regression test before changing logic
2. ✅ **Minimal Surface Area**: Prefer new hooks/controller files
3. ✅ **One Change-Set**: Each fix = one concept
4. ✅ **Prove No Regressions**: Run critical tests

**Status**: ✅ Documented in `CURSOR_OPERATING_MANUAL.md`

---

## 📝 Standard Prompt Templates (Available)

- ✅ **Template A**: Fix a defect safely
- ✅ **Template B**: Refactor without breaking
- ✅ **Template C**: Retry defects

**Status**: ✅ Documented in `CURSOR_OPERATING_MANUAL.md`

---

## 🧪 Critical E2E Test (Implemented)

### Test Contract
**"If loader is visible, elapsed must increase"**

### What It Catches
- ✅ Loader shows but `loading=false` → timer stuck at 0
- ✅ Timer interval cleared by rerender → stuck at 19/25/26
- ✅ Retry starts but old attempt still active → UI stuck
- ✅ Param mismatch causing `isProcessingUI` false while loader visible

### Test File
- **Location**: `tests/e2e/loader-timer-never-stuck.spec.ts`
- **Tests**: 6 comprehensive E2E tests
- **Status**: ✅ Implemented

---

## 🎯 How to Use

### For Cursor
**Every time you ask Cursor to fix anything in the report flow, prepend:**

> "Do not ship unless loader-timer-never-stuck.e2e.spec.ts passes. If you change loader gating or timer logic, update code so that when loader is visible, elapsed ticks."

### For Developers
1. Read `CURSOR_OPERATING_MANUAL.md` before making changes
2. Follow the workflow rules (test-first, minimal surface area, etc.)
3. Run `loader-timer-never-stuck.e2e.spec.ts` before committing
4. Ensure all non-negotiable contracts are respected

---

## ✅ Verification

- ✅ Guidelines document created
- ✅ Critical E2E test implemented
- ✅ UI data-testid added
- ✅ Defect register updated
- ✅ Build successful
- ✅ All changes committed and pushed

---

## 📋 Files Created/Modified

### New Files
1. `CURSOR_OPERATING_MANUAL.md` - Complete guidelines document
2. `tests/e2e/loader-timer-never-stuck.spec.ts` - Critical E2E test
3. `CURSOR_OPERATING_MANUAL_IMPLEMENTATION.md` - This file

### Modified Files
1. `src/app/ai-astrology/preview/page.tsx` - Added `data-testid="elapsed-seconds"`
2. `DEFECT_REGISTER.md` - Added reference to operating manual

---

## ✅ Conclusion

**Status**: ✅ **ALL GUIDELINES RECORDED AND IMPLEMENTED**

All ChatGPT guidelines have been:
- ✅ Recorded in `CURSOR_OPERATING_MANUAL.md`
- ✅ Critical E2E test implemented
- ✅ UI changes made (data-testid added)
- ✅ Defect register updated
- ✅ Build successful
- ✅ Ready for use

**Next Steps**: 
- Use the operating manual for all future report generation changes
- Run `loader-timer-never-stuck.e2e.spec.ts` before every commit
- Follow the workflow rules and prompt templates

---

**Last Updated**: 2026-01-14 20:35

