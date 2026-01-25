# Auto-Expand Enhancement Analysis

**Date:** 2026-01-22  
**Status:** Analysis Complete

---

## ChatGPT's Recommendation

> Word count failures should trigger auto-expand, not just fail.
> Current: "641 words" → fatal error
> Should: "641 words" → auto-expand → revalidate → deliver

---

## Current Implementation

### Location
`src/app/api/ai-astrology/generate-report/route.ts` (Lines 2352-2361)

### Current Behavior
```typescript
else if (errorCode === "VALIDATION_FAILED" && errorMessage?.includes("too short")) {
  // Word count issue - attempt local enrichment for all report types
  console.log("[REPAIR] Word count too short - enriching with ensureMinimumSections", {
    reportType,
    originalSectionsCount: repairedContent?.sections?.length || 0,
    errorMessage,
  });
  const { ensureMinimumSections } = await import("@/lib/ai-astrology/reportGenerator");
  repairedContent = ensureMinimumSections(repairedContent || { title: `Report for ${input.name}`, sections: [] }, reportType);
  qualityWarning = validation.qualityWarning || "shorter_than_expected";
}
```

### What `ensureMinimumSections` Does
**Location:** `src/lib/ai-astrology/reportGenerator.ts` (Line 995+)

**Behavior:**
- Adds fallback sections if missing
- Ensures minimum section count per report type
- Uses static/template content (not model-generated)

**Limitations:**
- Does NOT expand existing sections
- Does NOT call model to add more words
- Only adds missing sections with template content

---

## ChatGPT's Suggested Enhancement

### Model-Based Expansion
1. Call model again to expand existing sections
2. Add 2-4 more sections with model-generated content
3. Multiple expansion attempts if needed

### Benefits
- Higher quality (model-generated vs template)
- More words added (can target specific word count)
- Better user experience

### Drawbacks
- Additional OpenAI API call (cost + time)
- May still fail if model is slow
- Adds complexity

---

## Analysis

### Current Approach: ✅ Works, But Basic

**Pros:**
- ✅ Fast (no additional API calls)
- ✅ Reliable (always succeeds)
- ✅ Low cost (no extra tokens)
- ✅ Simple (no retry logic)

**Cons:**
- ⚠️ Lower quality (template content)
- ⚠️ May not reach word count (adds sections, not words)
- ⚠️ Generic content (not personalized)

### Enhanced Approach: 🔵 Better Quality, But Complex

**Pros:**
- ✅ Higher quality (model-generated)
- ✅ Can target word count precisely
- ✅ More personalized content

**Cons:**
- ⚠️ Additional API call (cost + 25s timeout)
- ⚠️ May fail (model could timeout again)
- ⚠️ More complex (retry logic needed)

---

## Recommendation

### 🟡 Medium Priority - Implement If Needed

**Decision Criteria:**
- If many reports are still "too short" after current repair → Implement
- If current repair works for 95%+ of cases → Defer

**Implementation Approach:**
1. **First attempt:** Current `ensureMinimumSections` (fast, reliable)
2. **If still too short:** Call model to expand existing sections
3. **Revalidate:** Check word count after expansion
4. **Deliver:** Even if still short, mark as LOW_QUALITY

**Estimated Effort:** 4-6 hours

**Value:** Medium (current approach works, enhancement is nice-to-have)

---

## Monitoring Plan

### Check Production Logs

1. **Word Count Repair Success Rate**
   - Search: `"[REPAIR] Word count too short"`
   - Check: How many reports are still short after repair?
   - Threshold: If > 10% still short → Consider enhancement

2. **Quality Warnings**
   - Search: `"qualityWarning: shorter_than_expected"`
   - Check: Frequency of quality warnings
   - Threshold: If frequent → Consider enhancement

3. **User Complaints**
   - Check: Support tickets about short reports
   - Threshold: If complaints → Consider enhancement

---

## Implementation Plan (If Needed)

### Phase 1: Add Model-Based Expansion Function
```typescript
async function expandReportSections(
  content: ReportContent,
  targetWords: number,
  reportType: ReportType
): Promise<ReportContent> {
  // Call model to expand existing sections
  // Add 2-4 more sections
  // Return expanded content
}
```

### Phase 2: Integrate into Repair Flow
```typescript
// Current repair
repairedContent = ensureMinimumSections(repairedContent, reportType);

// Re-validate
const revalidation = validateReportContent(repairedContent, input, paymentToken, reportType);

// If still too short, try model expansion
if (!revalidation.valid && revalidation.error?.includes("too short")) {
  try {
    repairedContent = await expandReportSections(repairedContent, minWords, reportType);
  } catch (expandError) {
    // Fallback: deliver with current content
  }
}
```

### Phase 3: Add Timeout Protection
- Use same 25s timeout as main generation
- If expansion times out, deliver with current content
- Mark as LOW_QUALITY if expansion fails

---

## Conclusion

### Current Status: ✅ Works, Enhancement Optional

1. ✅ Current auto-expand works (adds fallback sections)
2. 🔵 Enhancement would improve quality (model-generated)
3. 🟡 Only implement if current approach insufficient

### Recommendation: **Monitor First, Enhance If Needed**

- Monitor production logs for 1-2 weeks
- If many reports still too short → Implement enhancement
- If current approach works → Defer enhancement

---

**Status:** ✅ Analyzed - Defer implementation until monitoring shows need

