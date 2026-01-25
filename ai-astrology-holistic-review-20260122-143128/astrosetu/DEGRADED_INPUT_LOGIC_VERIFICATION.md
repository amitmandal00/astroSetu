# Degraded Input Logic Verification

**Date:** 2026-01-22  
**Status:** Verified ✅

---

## ChatGPT's Concern

> "Too short" validation failures are treated as degraded-input fatal even when NOT degraded input.

---

## Current Implementation Analysis

### Code Location
`src/app/api/ai-astrology/generate-report/route.ts` (Lines 1840-1868)

### Logic Flow

1. **Word Count Failure Detection** (Line 1840-1842)
```typescript
const isWordCountFailure = validationError?.includes("too short") || 
                           validationError?.includes("insufficient") ||
                           (validationErrorCode === "VALIDATION_FAILED" && validationError?.includes("word"));
```

2. **Degraded Input Check** (Line 1847-1849)
```typescript
const isDegradedInputUsed = isDegradedInput; // Set before generation
```

3. **Fatal Error Definition** (Line 1856-1859)
```typescript
const isTrulyFatalError = validationErrorCode === "MOCK_CONTENT_DETECTED" ||
                          validationError?.includes("missing data") ||
                          validationError?.includes("invalid input") ||
                          (isPlaceholderFailure && isDegradedInputUsed); // Only placeholder with degraded input
```

4. **Repairable Error Definition** (Line 1866-1868)
```typescript
const isRepairableError = isWordCountFailure ||  // ✅ ALWAYS repairable
                         isMissingSectionsFailure ||
                         (isPlaceholderFailure && !isDegradedInputUsed); // Placeholder without degraded input
```

---

## Verification Result

### ✅ Word Count Failures Are ALWAYS Repairable

**Key Finding:**
- `isWordCountFailure` is **NOT** gated on `isDegradedInputUsed`
- Word count failures are **ALWAYS** treated as repairable
- Only placeholder failures are gated on degraded input

**This is CORRECT behavior:**
- Word count failures can happen even with good input (model variance)
- They should always be repaired, regardless of degraded input
- Only placeholder failures with degraded input are fatal (no retries available)

---

## Degraded Input Usage

### Where `isDegradedInput` is Set
- Line 1574-1597: Checked before generation via `getKundliWithCache`
- Set to `true` only when:
  - Prokerala credit exhausted
  - Prokerala endpoint unavailable
  - Fallback/mock data used

### Where `isDegradedInput` is Used
- Line 1859: Gates placeholder failure as fatal
- Line 1868: Gates placeholder repair (only if NOT degraded)

---

## Test Cases

### Case 1: Word Count Failure + Normal Input
- Input: Normal (not degraded)
- Validation: "too short" (641 words)
- Expected: ✅ Repairable → Auto-expand → Deliver
- Actual: ✅ Correct (always repairable)

### Case 2: Word Count Failure + Degraded Input
- Input: Degraded (Prokerala exhausted)
- Validation: "too short" (641 words)
- Expected: ✅ Repairable → Auto-expand → Deliver
- Actual: ✅ Correct (always repairable)

### Case 3: Placeholder Failure + Normal Input
- Input: Normal (not degraded)
- Validation: "placeholder content"
- Expected: ✅ Repairable → Filter placeholders → Deliver
- Actual: ✅ Correct (repairable when NOT degraded)

### Case 4: Placeholder Failure + Degraded Input
- Input: Degraded (Prokerala exhausted)
- Validation: "placeholder content"
- Expected: ❌ Fatal → No retry → Fail
- Actual: ✅ Correct (fatal when degraded)

---

## Conclusion

### ✅ Logic is CORRECT

1. **Word count failures** are always repairable (correct)
2. **Placeholder failures** are only fatal when degraded input (correct)
3. **Degraded input flag** is properly set and used (correct)

### No Changes Needed

The implementation correctly handles ChatGPT's concern:
- Word count failures are NOT treated as degraded-input fatal
- They're always repairable, regardless of input quality
- Only placeholder failures respect the degraded input flag

---

## Monitoring Recommendation

### Production Logs to Check

1. **Word Count Failures**
   - Search: `"too short"` or `"insufficient"`
   - Verify: All are being repaired (not failing)
   - Expected: Should see `"[REPAIR] Word count too short - enriching"`

2. **Placeholder Failures**
   - Search: `"placeholder"`
   - Verify: Only failing when degraded input
   - Expected: Should see `"Placeholder without degraded input can be repaired"`

3. **Fatal Failures**
   - Search: `"FATAL_FAILURE"`
   - Verify: Only for mock content or placeholder with degraded input
   - Expected: Should NOT see word count failures here

---

**Status:** ✅ Verified - No changes needed

