# Environment Variable Debugging Guide

**Issue**: `ALLOW_REAL_FOR_TEST_SESSIONS=true` set in Vercel but real reports not generating

**Last Updated**: 2026-01-20

---

## Enhanced Logging Added

I've added **multiple simple console.log statements** (not JSON.stringify) for better visibility in Vercel logs:

1. **`[TEST SESSION DETECTED]`** - Logs immediately when a test session is detected
2. **`[REAL MODE CHECK]`** - Logs environment variable status (multiple lines)
3. **`[TEST SESSION - REAL MODE ENABLED]`** - Logs when real mode is enabled
4. **`[TEST SESSION - MOCK MODE]`** - Logs when mock mode is being used

These logs use **simple string format** (not JSON) for better visibility in Vercel Function Logs.

---

## What to Look For in Vercel Logs

### Expected Log Sequence (if env var is working):

```
[TEST SESSION DETECTED] test_session_decision-support_req-...
[REAL MODE CHECK] requestId=req-..., sessionId=test_session_...
[REAL MODE CHECK] envVarRaw="true", allowRealForTestSessions=true
[REAL MODE CHECK] forceRealMode=false, shouldUseRealMode=true, mockMode=false
[REAL MODE CHECK] MOCK_MODE="undefined"
[REAL MODE CHECK] Related env vars: ALLOW_REAL_FOR_TEST_SESSIONS=true
[TEST SESSION - REAL MODE ENABLED] requestId=req-..., reason=environment variable (ALLOW_REAL_FOR_TEST_SESSIONS=true)
```

### Expected Log Sequence (if env var is NOT working):

```
[TEST SESSION DETECTED] test_session_decision-support_req-...
[REAL MODE CHECK] requestId=req-..., sessionId=test_session_...
[REAL MODE CHECK] envVarRaw="undefined", allowRealForTestSessions=false
[REAL MODE CHECK] forceRealMode=false, shouldUseRealMode=false, mockMode=true
[REAL MODE CHECK] MOCK_MODE="undefined"
[REAL MODE CHECK] Related env vars: (empty or NONE)
[TEST SESSION - MOCK MODE] requestId=req-..., shouldUseRealMode=false, allowRealForTestSessions=false
[MOCK MODE] ... (mock report generation)
```

---

## How to Check Vercel Logs

1. **Vercel Dashboard** → Your Project
2. **Deployments** → Latest deployment
3. **Functions** tab → Click on `/api/ai-astrology/generate-report`
4. **Logs** tab → Look for `[REAL MODE CHECK]` or `[TEST SESSION`

**Or filter logs:**
- Search for: `REAL MODE CHECK`
- Search for: `TEST SESSION`
- Search for: `requestId=req-1768828734305` (your request ID)

---

## Common Issues

### Issue 1: No Logs at All

**Symptom**: No `[TEST SESSION DETECTED]` or `[REAL MODE CHECK]` logs

**Possible Causes**:
- Latest code not deployed (check commit hash)
- Logs filtered/truncated in Vercel UI
- Request not reaching this code path

**Solution**:
- Verify deployment includes latest commit (`4ba16dd` or later)
- Check Vercel Function Logs (not just overview logs)
- Try generating a fresh test report

### Issue 2: `envVarRaw="undefined"`

**Symptom**: Logs show `envVarRaw="undefined"`

**Possible Causes**:
- Environment variable not set in Vercel
- Variable set for wrong environment (Preview vs Production)
- Variable name has typo (must be exactly `ALLOW_REAL_FOR_TEST_SESSIONS`)
- Variable value has quotes/spaces (must be exactly `true`, lowercase)

**Solution**:
- **Vercel Dashboard** → **Settings** → **Environment Variables**
- Verify: Key = `ALLOW_REAL_FOR_TEST_SESSIONS`, Value = `true` (no quotes)
- Verify: Environments = ☑️ Production (if testing on www.mindveda.net)
- **Redeploy** after setting/changing variable

### Issue 3: `allowRealForTestSessions=false` Even When `envVarRaw="true"`

**Symptom**: Logs show `envVarRaw="true"` but `allowRealForTestSessions=false`

**Cause**: Logic bug (this shouldn't happen)

**Solution**: Report this as a bug - the code checks `envVarRaw === "true"`

### Issue 4: `shouldUseRealMode=true` But Still Mock Mode

**Symptom**: Logs show `shouldUseRealMode=true` but `mockMode=true`

**Possible Causes**:
- `MOCK_MODE=true` is also set (overrides real mode)
- Logic bug (this shouldn't happen)

**Solution**: Check `MOCK_MODE` env var - it should be unset or `"false"`

---

## Quick Checklist

- [ ] Latest code deployed (commit `4ba16dd` or later)
- [ ] Environment variable `ALLOW_REAL_FOR_TEST_SESSIONS` exists in Vercel
- [ ] Variable value is exactly `true` (lowercase, no quotes, no spaces)
- [ ] Variable enabled for correct environment (Production/Preview)
- [ ] Redeployed after setting/changing variable
- [ ] Generated fresh test report (new session, not cached)
- [ ] Checked Vercel Function Logs (not just overview)
- [ ] Found `[REAL MODE CHECK]` logs in function logs
- [ ] Verified `envVarRaw="true"` and `allowRealForTestSessions=true` in logs
- [ ] Verified `mockMode=false` in logs (if real mode should be enabled)

---

## Next Steps

1. **Generate a fresh test report** (new session URL)
2. **Check Vercel Function Logs** for `[REAL MODE CHECK]`
3. **Share the log output** - especially the `[REAL MODE CHECK]` lines
4. **If `envVarRaw="undefined"`**: Variable not loaded → Redeploy
5. **If `envVarRaw="true"` but `mockMode=true`**: Check `MOCK_MODE` or logic bug

---

**Status**: Enhanced logging deployed - Check Vercel Function Logs for detailed debug output

