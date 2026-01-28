# Vercel Environment Variable Setup - Real AI Reports for Test Sessions

**Date**: 2026-01-19  
**Status**: ✅ Active - Primary Method for Real AI Testing

---

## Overview

Real AI report generation for test sessions is now controlled **exclusively** via the Vercel environment variable `ALLOW_REAL_FOR_TEST_SESSIONS`. This provides a clean, simple solution without UI complexity.

---

## Setup Instructions

### Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **astroSetu**
3. Navigate to **Settings** → **Environment Variables**

### Step 2: Add Environment Variable

1. Click **Add New**
2. Fill in the following:
   - **Key**: `ALLOW_REAL_FOR_TEST_SESSIONS`
   - **Value**: `true`
   - **Environments**: 
     - ☑️ **Production** (for production testing)
     - ☑️ **Preview** (for preview deployments)
     - ☐ **Development** (optional - for local testing)

3. Click **Save**

### Step 3: Redeploy

**Option A: Automatic**
- Next deployment will pick up the new variable automatically

**Option B: Manual Redeploy**
1. Go to **Deployments** tab
2. Click **"..."** menu on latest deployment
3. Select **"Redeploy"**

---

## How It Works

### Backend Logic

When `ALLOW_REAL_FOR_TEST_SESSIONS=true`:
- All test sessions (`test_session_*`) automatically use **real AI generation**
- No URL parameters needed
- No UI toggles needed
- Works consistently across all test sessions

### Code Location

**API Route**: `src/app/api/ai-astrology/generate-report/route.ts`

```typescript
// Check environment variable for global real mode
const allowRealForTestSessions = 
  process.env.ALLOW_REAL_FOR_TEST_SESSIONS === "true";

// Determine if real mode should be used
const shouldUseRealMode = 
  forceRealMode || allowRealForTestSessions;

// Mock mode is only used if:
// - Not a test session, OR
// - Test session but real mode is not enabled
const mockMode = 
  (isTestSession && !shouldUseRealMode) || 
  process.env.MOCK_MODE === "true";
```

---

## Testing

### Enable Real AI Mode

1. Set `ALLOW_REAL_FOR_TEST_SESSIONS=true` in Vercel
2. Redeploy
3. Generate a test report with any `test_session_*` URL
4. Report will use **real AI generation** (takes 30-60 seconds, costs ~$0.01-0.05)

### Disable Real AI Mode (Use Mock)

1. Either:
   - Set `ALLOW_REAL_FOR_TEST_SESSIONS=false` in Vercel, OR
   - Delete the environment variable
2. Redeploy
3. Test sessions will use **mock generation** (fast, free)

---

## Override via URL (Optional)

If you need to override the global setting for a specific test:

**Force Real AI** (even if env var is false):
```
?use_real=true
```

**Force Mock** (even if env var is true):
```
?use_real=false
```

**Note**: URL parameter takes precedence over environment variable.

---

## Benefits

✅ **Simple**: Set once in Vercel, works everywhere  
✅ **Clean**: No UI toggles, no state management  
✅ **Reliable**: Always works, no race conditions  
✅ **Flexible**: Can override per-session via URL if needed  
✅ **Production-ready**: Perfect for controlled testing phases  

---

## Environment Variable Reference

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ALLOW_REAL_FOR_TEST_SESSIONS` | boolean | `false` | Enable real AI generation for all test sessions |
| `MOCK_MODE` | boolean | `false` | Force mock mode for all requests (development only) |

---

## Troubleshooting

### Real AI Not Working

1. **Check environment variable**:
   - Go to Vercel → Settings → Environment Variables
   - Verify `ALLOW_REAL_FOR_TEST_SESSIONS=true`
   - Verify correct environments selected (Production/Preview)

2. **Check deployment**:
   - Ensure you've redeployed after setting the variable
   - Check deployment logs for environment variable loading

3. **Check server logs**:
   - Look for `[TEST SESSION - REAL MODE FORCED]` message
   - Verify `allowRealForTestSessions: true` in logs

### Mock Reports Still Generating

1. Verify environment variable is set correctly
2. Ensure you've redeployed after setting the variable
3. Check that test session ID starts with `test_session_`
4. Verify OpenAI API key is configured (real AI needs it)

---

## Local Development

For local testing, add to `.env.local`:

```bash
ALLOW_REAL_FOR_TEST_SESSIONS=true
```

**Note**: This is a **server-side** variable, so it only affects API routes, not client-side code.

---

## Migration Notes

**Previous Implementation**:
- UI toggle was available in preview page
- State managed via sessionStorage
- URL parameter `?use_real=true` could override

**Current Implementation**:
- No UI toggle (removed for simplicity)
- Environment variable controls global behavior
- URL parameter still works as override

---

**Last Updated**: 2026-01-19  
**Status**: ✅ Active - Environment Variable Method

