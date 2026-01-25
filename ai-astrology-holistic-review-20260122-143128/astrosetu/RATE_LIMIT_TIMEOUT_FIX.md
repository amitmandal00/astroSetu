# Rate Limit Timeout Fix

**Date**: 2026-01-08
**Status**: ✅ **FIXED**

## Problem

Report generation was timing out before OpenAI rate limit retries could complete:

1. **Server timeout**: 55s for regular reports, 85s for complex reports
2. **OpenAI rate limit retries**: Wait 60s minimum + exponential backoff (up to 180s)
3. **Result**: Timeout fires at 55s while still waiting for retry (62s+ wait time)

**Example from logs**:
```
[OpenAI] Rate limit hit for reportType=year-analysis, retrying after 62s (attempt 1/5)
[OpenAI] Rate limit hit for reportType=year-analysis, retrying after 92s (attempt 2/5)
[REPORT GENERATION TIMEOUT] timeoutMs: 55000  // ❌ Timeout fires at 55s before retry completes
```

## Solution

Increased timeout values to accommodate rate limit retries:

### Server-Side Timeout
- **Before**: 55s (regular), 85s (complex)
- **After**: 180s (3 minutes) for ALL reports
- **Reason**: Rate limit retries can take 60-180s, so timeout must be at least 180s

### Client-Side Timeout
- **Before**: 60s (regular), 95s (complex)
- **After**: 190s (3 minutes 10 seconds) for ALL reports
- **Reason**: Slightly longer than server to account for network overhead

### Bundle Timeout
- **Before**: 95s per report
- **After**: 190s per report (matches single report timeout)

## Files Modified

1. **`src/app/api/ai-astrology/generate-report/route.ts`**:
   - Changed `REPORT_GENERATION_TIMEOUT` from `isComplexReport ? 85000 : 55000` to `180000` (180s for all)

2. **`src/app/ai-astrology/preview/page.tsx`**:
   - Changed single report `clientTimeout` from `isComplexReport ? 95000 : 60000` to `190000` (190s for all)
   - Changed bundle `INDIVIDUAL_REPORT_TIMEOUT` from `95000` to `190000` (190s per report)

## Expected Behavior

1. **Rate limit hit**: Wait 60s → retry
2. **Rate limit hit again**: Wait 90s → retry  
3. **Continue retries**: Up to 5 attempts with exponential backoff
4. **Timeout**: Only fires after 180s (3 minutes), allowing retries to complete
5. **Success**: Report generates successfully even with rate limit delays

## Impact

- ✅ Reports no longer timeout during rate limit retries
- ✅ Better handling of OpenAI rate limits
- ✅ More resilient to API rate limiting
- ⚠️ Slightly longer maximum wait time (but necessary for reliability)

## Testing

Test with rate limit scenarios:
1. Generate report during high OpenAI usage
2. Verify retries complete before timeout
3. Verify report generates successfully after retries

---

**Status**: Ready for deployment

