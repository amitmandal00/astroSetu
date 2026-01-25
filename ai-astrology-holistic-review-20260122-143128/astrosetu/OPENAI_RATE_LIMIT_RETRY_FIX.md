# OpenAI Rate Limit Retry Logic Fix

## Problem
Report generation was getting stuck because retry logic was waiting only 3-4 seconds between retries when hitting rate limits. OpenAI rate limits typically reset on a per-minute basis, so these short waits were ineffective, causing all retries to fail.

## Root Cause
1. **Too short default wait**: Default wait time was 5 seconds, which is too short for rate limits
2. **Retry-After header not parsed correctly**: Headers might not be present or parsed incorrectly
3. **Exponential backoff too aggressive**: Starting at 5 seconds and capping at 60 seconds wasn't enough
4. **No minimum wait for rate limits**: Rate limits need at least 60 seconds to reset

## Solution

### 1. Increased Minimum Wait Time
- **Before**: 5 seconds default wait
- **After**: 60 seconds minimum wait for rate limits
- **Rationale**: OpenAI rate limits are typically per-minute, so we need at least 60 seconds

### 2. Better Retry-After Header Parsing
- Improved regex patterns to catch various formats
- Better unit detection (ms vs seconds)
- Always enforce minimum 60 seconds even if header says less

### 3. Improved Exponential Backoff
- **Before**: 5s, 10s, 20s, 40s, 60s
- **After**: 60s, 90s, 120s, 150s, 180s (minimum 60 seconds)
- More conservative approach that respects rate limits

### 4. Enhanced Error Handling
- Added specific rate limit error detection in API route
- Returns HTTP 429 status code for rate limits
- User-friendly error messages: "Please wait 2-3 minutes and try again"
- Sets Retry-After header: 120 seconds (2 minutes)

### 5. Better Jitter
- Increased jitter from 0-1s to 0-5s
- Better distribution to avoid thundering herd

## Expected Wait Times

When rate limit is hit:
- Retry 1: ~60-65 seconds wait
- Retry 2: ~90-95 seconds wait  
- Retry 3: ~120-125 seconds wait
- Retry 4: ~150-155 seconds wait
- Retry 5: ~180-185 seconds wait

Total possible wait: Up to ~10 minutes (but typically succeeds on retry 1-2)

## User Experience

**Before:**
- Reports stuck on loading screen
- Users see confusing error messages
- No clear guidance on what to do

**After:**
- Clear error message: "Please wait 2-3 minutes and try again"
- Automatic retries with proper wait times
- Payment automatically cancelled if report fails
- User knows exactly what to expect

## Files Modified

1. **`src/lib/ai-astrology/reportGenerator.ts`**
   - Increased minimum wait time to 60 seconds
   - Improved Retry-After header parsing
   - Better exponential backoff (60s minimum)
   - Enhanced jitter (0-5s)

2. **`src/app/api/ai-astrology/generate-report/route.ts`**
   - Added rate limit error detection
   - Returns HTTP 429 for rate limits
   - Better error messages for users
   - Sets Retry-After header (120s)

3. **`src/app/ai-astrology/preview/page.tsx`**
   - Improved error messages for rate limits
   - Better user guidance

## Testing Recommendations

1. **Rate Limit Scenarios:**
   - Generate multiple reports rapidly to trigger rate limits
   - Verify retry logic waits at least 60 seconds
   - Confirm reports eventually succeed after rate limit resets

2. **Error Messages:**
   - Verify user sees clear message about waiting 2-3 minutes
   - Check that payment is cancelled automatically
   - Confirm Retry-After header is set correctly

3. **Recovery:**
   - Test that reports generate successfully after rate limit period
   - Verify no duplicate charges if payment was authorized

## Related Issues

This fixes the issue where reports get stuck because retries were happening too quickly (3-4 seconds) instead of waiting for rate limits to reset (60+ seconds).

