# Report Generation Timeout Fix

## Problem
Report generation was getting stuck on the loading screen. The client-side timeout (30 seconds) was shorter than the server-side timeout (55-85 seconds), causing the client to abort requests while the server was still processing reports.

## Root Cause
- **Client timeout:** 30 seconds (in `apiPost` function)
- **Server timeout:** 55 seconds (regular reports) / 85 seconds (complex reports)
- **Result:** Client aborted request before server finished, leaving loading state stuck

## Solution

### 1. Increased Client-Side Timeout for Report Generation
- **Regular reports:** 60 seconds (server: 55s + 5s buffer)
- **Complex reports (full-life, major-life-phase):** 95 seconds (server: 85s + 10s buffer)
- Updated `apiPost` to accept optional timeout parameter

### 2. Updated Bundle Generation Timeout
- Changed from 65 seconds to 95 seconds
- Ensures bundle reports have enough time to complete

### 3. Improved Error Messages
- Timeout errors now show user-friendly messages for report generation
- Different messages for report generation vs. other API calls

## Files Modified

1. **`src/lib/http.ts`**
   - Added optional `timeout` parameter to `apiPost` function
   - Improved timeout error messages for report generation requests

2. **`src/app/ai-astrology/preview/page.tsx`**
   - Added dynamic timeout calculation based on report type
   - Increased bundle generation timeout to 95 seconds
   - Passes appropriate timeout to `apiPost` for report generation

## Expected Results

✅ **Reports no longer get stuck:** Client waits long enough for server to complete
✅ **Better error messages:** Users see helpful timeout messages if reports take too long
✅ **Proper error handling:** Loading state clears correctly on timeout

## Testing Recommendations

1. Test report generation for:
   - Free reports (life-summary)
   - Regular paid reports (marriage-timing, career-money)
   - Complex reports (full-life, major-life-phase)
   - Bundle reports

2. Monitor timeout behavior:
   - Verify reports complete within timeout window
   - Check error messages appear correctly if timeout occurs
   - Confirm loading state clears properly

## Related Issues

This fixes the issue where users see "Generating Your Report..." indefinitely, even though the server is still processing.

