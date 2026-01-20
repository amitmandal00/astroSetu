# Real Reports for Test Sessions - Issue Summary & Solutions

**Date**: 2026-01-20  
**Status**: 🔴 **ONGOING** - Debugging environment variable access  
**Priority**: P0 (Critical)

---

## Issue Description

**Problem**: Test sessions (starting with `test_session_*`) are generating **mock reports** instead of **real AI-generated reports**, even though the environment variable `ALLOW_REAL_FOR_TEST_SESSIONS=true` is set in Vercel.

**Symptoms**:
- Report ID contains "MOCK" (e.g., `RPT-1768664089463-MOCK-hbubu`)
- Reports contain generic placeholder text ("Detailed analysis will be generated...")
- Reports are generated in 2-3 seconds (too fast for real AI generation)
- No `[REAL MODE CHECK]` or `[TEST SESSION - REAL MODE ENABLED]` logs in Vercel Function Logs

**Expected Behavior**:
- Report ID should NOT contain "MOCK"
- Reports should contain detailed, personalized AI-generated content
- Generation should take 30-60 seconds
- Logs should show `[TEST SESSION - REAL MODE ENABLED]`

---

## Root Cause Analysis

### Current Implementation

The logic for enabling real reports for test sessions is in `src/app/api/ai-astrology/generate-report/route.ts`:

```typescript
const envVarRaw = process.env.ALLOW_REAL_FOR_TEST_SESSIONS;
const allowRealForTestSessions = envVarRaw === "true";
const shouldUseRealMode = forceRealMode || allowRealForTestSessions;
const mockMode = (isTestSession && !shouldUseRealMode) || process.env.MOCK_MODE === "true";
```

**Logic Flow**:
1. Check if session ID starts with `test_session_` → `isTestSession = true`
2. Read `process.env.ALLOW_REAL_FOR_TEST_SESSIONS` → `envVarRaw`
3. Check if `envVarRaw === "true"` → `allowRealForTestSessions`
4. If `allowRealForTestSessions = true` → `shouldUseRealMode = true`
5. If `shouldUseRealMode = true` AND `MOCK_MODE !== "true"` → `mockMode = false`
6. If `mockMode = false` → Use real AI generation

### Potential Issues

1. **Environment Variable Not Loaded**:
   - Variable not set in Vercel
   - Variable set for wrong environment (Preview vs Production)
   - Variable name typo or wrong value format
   - Variable set after deployment (requires redeploy)

2. **Logs Not Visible**:
   - Vercel Function Logs filtered/truncated
   - Latest code not deployed yet
   - Logs showing old deployment

3. **Logic Bug**:
   - `MOCK_MODE=true` also set (overrides real mode)
   - Early return before env var check
   - Test session detection failing

---

## Solutions Attempted

### Solution 1: Initial Implementation (Commit `ec24941`)

**What was done**:
- Removed UI toggle for real/mock reports
- Switched to environment variable approach only
- Added basic logging for env var check

**Result**: ❌ **Did not work** - Reports still mock

**Evidence**: User reported reports still contain "MOCK" in Report ID

---

### Solution 2: Enhanced Debug Logging (Commit `4ba16dd`)

**What was done**:
- Added detailed JSON logging for environment variable check
- Log env var raw value, type, and all related env vars
- Added `[REAL MODE CHECK]` and `[TEST SESSION - REAL MODE ENABLED]` logs

**Result**: ⚠️ **Cannot verify** - Logs not appearing in Vercel Function Logs

**Evidence**: User provided logs show `[ACCESS CHECK]` but no `[REAL MODE CHECK]` logs

**Possible reasons**:
- Latest code not deployed yet
- Vercel logs filtered/truncated
- JSON.stringify output not showing in logs

---

### Solution 3: Simpler, More Visible Logging (Commit `4bce8cb`)

**What was done**:
- Replaced JSON.stringify with simple string logs
- Added `[TEST SESSION DETECTED]` log immediately when test session detected
- Added multiple `[REAL MODE CHECK]` log lines with clear labels
- Added `[TEST SESSION - MOCK MODE]` log to show when mock mode is used
- Log all related env vars (ALLOW, REAL, MOCK)

**Code changes**:
```typescript
// Immediate log when test session detected
if (isTestSession) {
  console.log(`[TEST SESSION DETECTED] ${sessionIdFromQuery}`);
}

// Detailed env var check logs
if (isTestSession) {
  console.log(`[REAL MODE CHECK] requestId=${requestId}, sessionId=${sessionIdFromQuery}`);
  console.log(`[REAL MODE CHECK] envVarRaw="${envVarRaw || "undefined"}", allowRealForTestSessions=${allowRealForTestSessions}`);
  console.log(`[REAL MODE CHECK] forceRealMode=${forceRealMode}, shouldUseRealMode=${shouldUseRealMode}, mockMode=${mockMode}`);
  console.log(`[REAL MODE CHECK] MOCK_MODE="${process.env.MOCK_MODE || "undefined"}"`);
  // Log all related env vars
  const relatedEnvVars = Object.keys(process.env)
    .filter(k => k.includes("ALLOW") || k.includes("REAL") || k.includes("MOCK"))
    .map(k => `${k}=${process.env[k]}`);
  console.log(`[REAL MODE CHECK] Related env vars: ${relatedEnvVars.join(", ") || "NONE"}`);
}
```

**Result**: ⏳ **PENDING** - Waiting for deployment and user to check logs

**Expected outcome**: Logs will clearly show:
- Whether env var is being read (`envVarRaw`)
- Whether `allowRealForTestSessions` is `true` or `false`
- Whether `mockMode` is `true` or `false`
- All related environment variables

---

## Files Modified

### Core Implementation Files

1. **`src/app/api/ai-astrology/generate-report/route.ts`**:
   - Lines 338-339: Test session detection
   - Lines 1212-1243: Environment variable check and mock mode logic
   - Enhanced logging for debugging

2. **`src/app/ai-astrology/preview/page.tsx`**:
   - Removed UI toggle component
   - Removed `useRealMode` state and sessionStorage
   - Now relies solely on backend env var check

### Documentation Files

1. **`ENV_VAR_VERIFICATION_STEPS.md`**: Step-by-step verification guide
2. **`ENV_VAR_DEBUGGING.md`**: Detailed debugging guide with expected log sequences
3. **`VERCEL_ENV_VAR_SETUP.md`**: Vercel environment variable setup instructions
4. **`REAL_REPORTS_FOR_TEST_USERS_IMPLEMENTATION.md`**: Implementation summary

---

## Current Status

### ✅ Completed

1. ✅ Removed UI toggle (simplified code)
2. ✅ Environment variable approach implemented
3. ✅ Enhanced debug logging added
4. ✅ Documentation created

### ⏳ Pending

1. ⏳ **Verify deployment** - Ensure commit `4bce8cb` is deployed
2. ⏳ **Check Vercel logs** - Look for `[REAL MODE CHECK]` logs
3. ⏳ **Diagnose root cause** - Based on log output
4. ⏳ **Apply fix** - Once root cause identified

---

## Next Steps

### Immediate Actions

1. **Wait for deployment** (if not already deployed):
   - Vercel should auto-deploy commit `4bce8cb`
   - Check deployment status in Vercel Dashboard

2. **Generate fresh test report**:
   - Create new test session (don't reuse old URLs)
   - Complete full flow: Input → Payment → Preview

3. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Deployments → Latest
   - Click on `/api/ai-astrology/generate-report` function
   - Check Logs tab
   - Search for `[REAL MODE CHECK]` or `[TEST SESSION`

4. **Share log output**:
   - Copy all `[REAL MODE CHECK]` log lines
   - This will show:
     - `envVarRaw` value (should be `"true"` or `"undefined"`)
     - `allowRealForTestSessions` boolean (should be `true` if env var working)
     - `mockMode` boolean (should be `false` if real mode enabled)
     - All related env vars

### Diagnosis Based on Logs

**If `envVarRaw="undefined"`**:
- ✅ **Root cause identified**: Environment variable not loaded
- **Fix**: Verify variable in Vercel, ensure correct environment, redeploy

**If `envVarRaw="true"` but `allowRealForTestSessions=false`**:
- ✅ **Root cause identified**: Logic bug (shouldn't happen)
- **Fix**: Fix type coercion or comparison logic

**If `allowRealForTestSessions=true` but `mockMode=true`**:
- ✅ **Root cause identified**: `MOCK_MODE=true` is overriding
- **Fix**: Remove or set `MOCK_MODE=false` in Vercel

**If `mockMode=false` but reports still mock**:
- ✅ **Root cause identified**: Report generation logic bug
- **Fix**: Check report generation flow (should use real AI, not mock)

---

## Environment Variable Configuration

### Vercel Dashboard Setup

1. **Navigate**: Vercel Dashboard → Your Project → Settings → Environment Variables
2. **Add Variable**:
   - **Key**: `ALLOW_REAL_FOR_TEST_SESSIONS`
   - **Value**: `true` (lowercase, no quotes)
   - **Environments**: ☑️ Production (and/or Preview)
3. **Redeploy**: After setting/changing variable, redeploy

### Verification

- ✅ Variable exists in Vercel
- ✅ Value is exactly `true` (no quotes, no spaces)
- ✅ Correct environment selected (Production/Preview)
- ✅ Redeployed after setting variable

---

## Related Documentation

- `ENV_VAR_VERIFICATION_STEPS.md` - Step-by-step verification
- `ENV_VAR_DEBUGGING.md` - Detailed debugging guide
- `VERCEL_ENV_VAR_SETUP.md` - Setup instructions
- `REAL_REPORTS_FOR_TEST_USERS_IMPLEMENTATION.md` - Implementation summary
- `TEST_WITH_REAL_REPORTS_GUIDE.md` - Testing guide

---

## Test Cases

### Test Case 1: Environment Variable Working

**Setup**:
- `ALLOW_REAL_FOR_TEST_SESSIONS=true` in Vercel
- Generate test session report

**Expected**:
- ✅ Logs show `[TEST SESSION - REAL MODE ENABLED]`
- ✅ Report ID does NOT contain "MOCK"
- ✅ Report contains detailed AI-generated content
- ✅ Generation takes 30-60 seconds

### Test Case 2: Environment Variable Not Set

**Setup**:
- `ALLOW_REAL_FOR_TEST_SESSIONS` not set in Vercel
- Generate test session report

**Expected**:
- ✅ Logs show `[TEST SESSION - MOCK MODE]`
- ✅ Report ID contains "MOCK"
- ✅ Report contains generic placeholder text
- ✅ Generation takes 2-3 seconds

---

## Commits

1. **`ec24941`** - Remove UI toggle, use env var only
2. **`4ba16dd`** - Enhanced debug logging (JSON format)
3. **`4bce8cb`** - Simpler, more visible logging (string format)

---

## Timeline

- **2026-01-20 00:00** - User reported real reports not generating
- **2026-01-20 00:10** - Initial implementation (Solution 1)
- **2026-01-20 00:18** - Enhanced logging (Solution 2)
- **2026-01-20 00:25** - Simpler logging (Solution 3) - **CURRENT**

---

## Notes

- All test sessions use `test_session_*` prefix in session ID
- Mock reports generate IDs with "MOCK" (e.g., `RPT-*-MOCK-*`)
- Real reports generate IDs without "MOCK" (e.g., `RPT-*-ABC123`)
- Vercel Function Logs may filter/truncate output (use simple string logs)
- Environment variables only loaded during deployment (must redeploy after setting)

---

**Last Updated**: 2026-01-20  
**Next Review**: After user shares Vercel Function Logs

