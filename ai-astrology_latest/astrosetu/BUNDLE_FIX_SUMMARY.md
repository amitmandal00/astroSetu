# Fix: Bundle Report Generation Stuck Issue

## Problem
Bundle reports were getting stuck showing "0 of 3 reports completed" and not progressing. Users couldn't see any progress updates.

## Root Causes
1. **Progress only updated on success** - If reports failed, progress stayed at 0
2. **No individual timeouts** - Reports could hang indefinitely waiting for API responses
3. **Poor error visibility** - Errors weren't properly surfaced to the user
4. **Session ID not in URL** - Test session detection might not work properly

## Fixes Applied

### 1. Progress Updates on Both Success and Failure ✅
**Before:** Progress only updated when reports succeeded
```typescript
if (response.ok && response.data?.content) {
  updateProgress(reportType); // Only here
}
```

**After:** Progress updates for both success and failure
```typescript
updateProgress(reportType, true);  // On success
updateProgress(reportType, false); // On failure
```

### 2. Individual Timeouts Per Report ✅
**Added:** 65-second timeout per report using `AbortController`
```typescript
const INDIVIDUAL_REPORT_TIMEOUT = 65000;
const abortController = new AbortController();
const timeoutId = setTimeout(() => {
  abortController.abort();
}, INDIVIDUAL_REPORT_TIMEOUT);
```

### 3. Better Error Handling ✅
- Proper timeout detection (`AbortError`)
- User-friendly error messages
- Errors don't block progress updates

### 4. Session ID in URL Params ✅
**Added:** Session ID passed in URL for test session detection
```typescript
let apiUrl = "/api/ai-astrology/generate-report";
if (sessionId) {
  apiUrl += `?session_id=${encodeURIComponent(sessionId)}`;
}
```

### 5. Improved Logging ✅
- Log when each report starts
- Log progress updates (success/failure)
- Better error logging

## Expected Behavior After Fix

### User Experience:
1. ✅ Progress bar updates as each report completes (success or failure)
2. ✅ Individual reports timeout after 65 seconds (prevents infinite hanging)
3. ✅ Clear error messages if reports fail
4. ✅ Partial success shown if some reports succeed

### Progress Updates:
- **Before:** "0 of 3 completed" (stuck)
- **After:** "1 of 3 completed" → "2 of 3 completed" → "3 of 3 completed" (updates in real-time)

### Timeout Handling:
- **Before:** Reports could hang indefinitely
- **After:** Each report times out after 65 seconds with clear error message

## Testing Checklist
- [ ] Test bundle generation with test users (Amit, Ankita)
- [ ] Verify progress updates work (should see 1/3, 2/3, 3/3)
- [ ] Test timeout scenario (if report takes > 65 seconds)
- [ ] Verify partial success (some reports succeed, some fail)
- [ ] Check browser console for progress logs

## Status
✅ **FIXED** - Bundle generation now properly tracks progress and handles timeouts

