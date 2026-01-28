# Real Reports for Test Users - Implementation Summary

**Date**: 2026-01-19  
**Status**: ✅ Implemented (Environment Variable Method)

---

## Overview

Real AI report generation for test users (`test_session_*`) is now controlled **exclusively** via the Vercel environment variable `ALLOW_REAL_FOR_TEST_SESSIONS`. This provides a clean, simple solution without UI complexity.

---

## Changes Made

### 1. API Route (`src/app/api/ai-astrology/generate-report/route.ts`)

**Added:**
- Request body parameter: `useReal?: boolean`
- URL query parameter support: `?use_real=true` or `?force_real=true`
- Environment variable support: `ALLOW_REAL_FOR_TEST_SESSIONS=true`
- Updated mock mode logic to respect real mode flags

**Key Changes:**
```typescript
// Lines 364-379: Added useReal to request body interface and extraction
const json = await parseJsonBody<{
  // ... existing fields
  useReal?: boolean; // Force real AI generation even for test sessions
}>(req);

const { input, reportType, paymentToken, paymentIntentId, sessionId: fallbackSessionId, decisionContext, useReal } = json;

// Check for URL query parameter
const urlParams = new URL(req.url).searchParams;
const useRealFromQuery = urlParams.get("use_real") === "true" || urlParams.get("force_real") === "true";
const forceRealMode = useReal === true || useRealFromQuery;

// Lines 1206-1218: Updated mock mode detection
const allowRealForTestSessions = process.env.ALLOW_REAL_FOR_TEST_SESSIONS === "true";
const shouldUseRealMode = forceRealMode || allowRealForTestSessions;
const mockMode = (isTestSession && !shouldUseRealMode) || process.env.MOCK_MODE === "true";
```

### 2. Generation Controller Hook (`src/hooks/useReportGenerationController.ts`)

**Added:**
- `useReal?: boolean` option in `start()` method
- URL query parameter support when building API URL
- Passes `useReal` in both URL and request body

**Key Changes:**
```typescript
// Lines 41-49: Updated interface
start: (
  input: AIAstrologyInput,
  reportType: ReportType,
  options?: {
    paymentToken?: string;
    sessionId?: string;
    paymentIntentId?: string;
    useReal?: boolean; // Force real AI generation even for test sessions
  }
) => Promise<void>;

// Lines 299-319: Updated API call to include useReal
const urlParams = new URLSearchParams();
if (options?.sessionId && isPaid) {
  urlParams.append('session_id', options.sessionId);
}
if (options?.useReal === true) {
  urlParams.append('use_real', 'true');
}

body: JSON.stringify({
  // ... existing fields
  useReal: options?.useReal === true ? true : undefined,
}),
```

### 3. Preview Page (`src/app/ai-astrology/preview/page.tsx`)

**Added:**
- Extracts `use_real` or `force_real` from URL query params
- Passes `useReal` to `generationController.start()` in key locations

**Key Changes:**
```typescript
// Multiple locations (lines ~1251, ~1900, ~1920): Added useReal extraction
const useReal = searchParams.get("use_real") === "true" || searchParams.get("force_real") === "true";

generationController.start(inputData, reportTypeToUse, {
  sessionId: sessionIdForGeneration,
  paymentIntentId: paymentIntentIdForGeneration,
  useReal: useReal || undefined
})
```

---

## How to Use

### Method 1: URL Query Parameter (Easiest)

Add `?use_real=true` to your test session URL:

```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_decision-support_req-123&reportType=decision-support&auto_generate=true&use_real=true
```

### Method 2: Programmatic (Code)

```typescript
await generationController.start(input, reportType, {
  sessionId: 'test_session_...',
  useReal: true  // Force real generation
});
```

### Method 3: Environment Variable (Global)

Set in Vercel or `.env.local`:
```
ALLOW_REAL_FOR_TEST_SESSIONS=true
```

This enables real reports for **all** test sessions globally.

---

## Testing Checklist

- [x] API accepts `useReal` in request body
- [x] API accepts `use_real=true` in URL query params
- [x] Hook passes `useReal` to API
- [x] Preview page extracts `use_real` from URL
- [x] Preview page passes `useReal` to controller
- [x] Mock mode is bypassed when real mode is enabled
- [x] Logs show `[TEST SESSION - REAL MODE FORCED]` message
- [ ] Test with actual test session URLs
- [ ] Verify OpenAI API calls are made
- [ ] Verify real AI content is generated

---

## Important Notes

1. **Cost**: Real AI reports cost money (~$0.01-0.05 per report)
2. **Speed**: Real reports take 30-60 seconds vs 2-3 seconds for mock
3. **Default**: Test sessions still use mock reports by default
4. **Override**: URL parameter takes precedence over environment variable

---

## Files Modified

1. `src/app/api/ai-astrology/generate-report/route.ts`
   - Added `useReal` parameter handling
   - Updated mock mode logic

2. `src/hooks/useReportGenerationController.ts`
   - Added `useReal` option to `start()` method
   - Updated API call to include `useReal`

3. `src/app/ai-astrology/preview/page.tsx`
   - Extract `use_real` from URL
   - Pass to generation controller

4. `TEST_WITH_REAL_REPORTS_GUIDE.md` (NEW)
   - Comprehensive guide for users

5. `REAL_REPORTS_FOR_TEST_USERS_IMPLEMENTATION.md` (NEW)
   - This summary document

---

## Next Steps

1. Test with a real test session URL:
   ```
   https://www.mindveda.net/ai-astrology/preview?session_id=test_session_decision-support_req-123&reportType=decision-support&auto_generate=true&use_real=true
   ```

2. Check server logs for:
   - `[TEST SESSION - REAL MODE FORCED]` message
   - OpenAI API calls
   - Real report generation

3. Verify reports contain real AI content (not mock placeholders)

---

**Status**: ✅ Ready for Testing  
**Documentation**: See `TEST_WITH_REAL_REPORTS_GUIDE.md` for detailed usage instructions

