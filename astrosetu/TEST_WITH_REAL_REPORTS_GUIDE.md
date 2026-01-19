# Testing with Real Reports for Production Test Users

This guide explains how to test with **real AI-generated reports** instead of mock reports when using production test users (`test_session_*`).

---

## Overview

By default, test sessions (starting with `test_session_*`) use **mock report generation** for fast, reliable testing. However, you can force **real AI generation** in three ways:

1. **URL Query Parameter** (Easiest - no code changes)
2. **Request Body Parameter** (Programmatic)
3. **Environment Variable** (Global override)

---

## Method 1: URL Query Parameter (Recommended for Manual Testing)

Add `?use_real=true` or `?force_real=true` to any API call URL.

### Example: Direct API Call

```bash
# Test session URL with real reports
curl -X POST "https://www.mindveda.net/api/ai-astrology/generate-report?session_id=test_session_decision-support_req-123&use_real=true" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "name": "Test User",
      "dob": "1990-01-01",
      "tob": "10:00",
      "place": "Melbourne, Australia",
      "latitude": -37.8136,
      "longitude": 144.9631
    },
    "reportType": "decision-support"
  }'
```

### Example: Preview Page URL

```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_decision-support_req-123&reportType=decision-support&auto_generate=true&use_real=true
```

**Note**: For preview page URLs, you may need to modify the frontend code to pass `useReal: true` to the generation controller (see Method 2).

---

## Method 2: Request Body Parameter (Programmatic)

Pass `useReal: true` in the request body when calling the API.

### Frontend Hook Usage

Modify your code to pass `useReal: true`:

```typescript
import { useReportGenerationController } from '@/hooks/useReportGenerationController';

const generationController = useReportGenerationController();

// Generate report with real AI (even for test sessions)
await generationController.start(
  input,
  reportType,
  {
    sessionId: 'test_session_decision-support_req-123',
    useReal: true  // ← Force real generation
  }
);
```

### Direct API Call

```typescript
const response = await fetch('/api/ai-astrology/generate-report?session_id=test_session_...', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: { ... },
    reportType: 'decision-support',
    sessionId: 'test_session_...',
    useReal: true  // ← Force real generation
  })
});
```

---

## Method 3: Environment Variable (Global Override)

Set `ALLOW_REAL_FOR_TEST_SESSIONS=true` in your environment variables to enable real reports for **all** test sessions.

### Vercel Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Key**: `ALLOW_REAL_FOR_TEST_SESSIONS`
   - **Value**: `true`
   - **Environment**: Production (or Preview)
3. Redeploy

### Local Development (.env.local)

```bash
# .env.local
ALLOW_REAL_FOR_TEST_SESSIONS=true
```

**⚠️ Warning**: This will force real AI generation for **all** test sessions globally. Use with caution as it will:
- Make API calls to OpenAI (costs money)
- Take longer to generate reports
- Be less reliable (AI may fail or timeout)

---

## How It Works

### Detection Logic

The API checks for real mode in this order:

1. **Request body**: `useReal: true` → Force real mode
2. **URL query**: `?use_real=true` or `?force_real=true` → Force real mode
3. **Environment variable**: `ALLOW_REAL_FOR_TEST_SESSIONS=true` → Force real mode
4. **Default**: Test sessions use mock reports

### Code Location

The logic is in:
- **API Route**: `src/app/api/ai-astrology/generate-report/route.ts` (lines ~1206-1218)
- **Hook**: `src/hooks/useReportGenerationController.ts` (lines ~300-319)

---

## Testing Checklist

When testing with real reports:

- [ ] Verify test session URL includes `use_real=true` OR `useReal: true` in body
- [ ] Check server logs for `[TEST SESSION - REAL MODE FORCED]` message
- [ ] Confirm OpenAI API calls are being made (check logs/costs)
- [ ] Verify reports contain real AI-generated content (not mock placeholders)
- [ ] Test with different report types (decision-support, major-life-phase, etc.)
- [ ] Monitor generation time (real reports take 30-60 seconds vs 2-3 seconds for mock)
- [ ] Verify payment bypass still works (test sessions shouldn't charge)

---

## Troubleshooting

### Real Reports Still Not Generating

1. **Check URL**: Ensure `use_real=true` is in the query string
2. **Check Body**: Ensure `useReal: true` is in the request body
3. **Check Logs**: Look for `[TEST SESSION - REAL MODE FORCED]` in server logs
4. **Check Environment**: Verify `ALLOW_REAL_FOR_TEST_SESSIONS` is set correctly

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is set in environment variables
- Check OpenAI API quota/limits
- Verify network connectivity

### Reports Taking Too Long

- Real AI generation takes 30-60 seconds (normal)
- Mock reports take 2-3 seconds (instant)
- This is expected behavior

---

## Cost Considerations

⚠️ **Real AI reports cost money**:
- Each report costs ~$0.01-0.05 in OpenAI API usage
- Mock reports are free (no API calls)
- Use real reports sparingly for testing

---

## Example Test Session URLs

### Decision Support Report (Real)
```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_decision-support_req-123&reportType=decision-support&auto_generate=true&use_real=true
```

### Major Life Phase Report (Real)
```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_major-life-phase_req-456&reportType=major-life-phase&auto_generate=true&use_real=true
```

### Career & Money Report (Real)
```
https://www.mindveda.net/ai-astrology/preview?session_id=test_session_career-money_req-789&reportType=career-money&auto_generate=true&use_real=true
```

---

## Summary

- **Quick Test**: Add `?use_real=true` to URL
- **Code Integration**: Pass `useReal: true` in hook options
- **Global Override**: Set `ALLOW_REAL_FOR_TEST_SESSIONS=true` env var
- **Default**: Test sessions use mock reports (fast, free)
- **Real Mode**: Test sessions use real AI (slow, costs money)

---

**Last Updated**: 2026-01-19  
**Related Files**:
- `src/app/api/ai-astrology/generate-report/route.ts`
- `src/hooks/useReportGenerationController.ts`

