# Environment Variable Troubleshooting

**Date**: 2026-01-20  
**Issue**: Test sessions still generating mock reports despite `ALLOW_REAL_FOR_TEST_SESSIONS=true`

---

## Problem

Test sessions are still generating **mock reports** instead of real AI reports, even though:
- Environment variable `ALLOW_REAL_FOR_TEST_SESSIONS=true` is set in Vercel
- Reports show "MOCK" in Report ID (e.g., `RPT-1708664089-463-MOCK-hbulu`)
- Content shows generic placeholders ("Detailed analysis will be generated based on your birth chart")

---

## Debugging Steps

### 1. Check Environment Variable in Vercel

**Verify the variable is set correctly:**

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Check:
   - ✅ Key: `ALLOW_REAL_FOR_TEST_SESSIONS`
   - ✅ Value: `true` (lowercase, no quotes)
   - ✅ Environments: Production, Preview (or both)
3. **Important**: The value must be exactly `true` (case-sensitive)

### 2. Check Deployment Logs

**Look for debug logs in Vercel deployment logs:**

Search for:
- `[REAL MODE CHECK]` - Shows env var check result
- `[TEST SESSION - REAL MODE ENABLED]` - Confirms real mode is active
- `[MOCK MODE]` - Confirms mock mode is being used (this should NOT appear if env var is working)

**Expected log output when env var is working:**
```json
{
  "requestId": "...",
  "isTestSession": true,
  "allowRealForTestSessions": true,
  "envVarValue": "true",
  "forceRealMode": false,
  "shouldUseRealMode": true,
  "mockMode": false,
  "sessionId": "test_session_..."
}
```

**If env var is NOT working, you'll see:**
```json
{
  "allowRealForTestSessions": false,
  "envVarValue": undefined,
  "shouldUseRealMode": false,
  "mockMode": true
}
```

### 3. Redeploy After Setting Variable

**Critical**: Environment variables are only loaded during deployment.

1. **Set the variable** in Vercel Dashboard
2. **Redeploy** one of:
   - **Option A**: Trigger a new deployment (push to main)
   - **Option B**: Go to Deployments → Latest → "..." → "Redeploy"
3. **Wait** for deployment to complete (2-5 minutes)
4. **Test again** with a fresh test session URL

---

## Common Issues

### Issue 1: Variable Not Loaded

**Symptom**: `envVarValue: undefined` in logs

**Solution**:
- Verify variable name is exactly: `ALLOW_REAL_FOR_TEST_SESSIONS`
- Verify value is exactly: `true` (lowercase)
- Redeploy after setting the variable
- Check that correct environment is selected (Production/Preview)

### Issue 2: Variable Set But Not Redeployed

**Symptom**: Variable shows in Vercel but logs show it's not loaded

**Solution**:
- **Redeploy** after setting the variable
- Vercel only loads env vars during build/deploy, not at runtime

### Issue 3: Wrong Environment

**Symptom**: Variable set for one environment but testing in another

**Solution**:
- Ensure variable is set for **both** Production and Preview
- Or set it specifically for the environment you're testing

### Issue 4: Typo in Variable Name or Value

**Symptom**: Variable not recognized

**Solution**:
- Double-check spelling: `ALLOW_REAL_FOR_TEST_SESSIONS` (exact case)
- Value must be: `true` (lowercase, no quotes, no spaces)

---

## Verification Checklist

After setting the variable and redeploying:

- [ ] Variable shows in Vercel Dashboard with value `true`
- [ ] Variable is enabled for correct environments (Production/Preview)
- [ ] Deployment completed successfully after setting variable
- [ ] Logs show `[REAL MODE CHECK]` with `allowRealForTestSessions: true`
- [ ] Logs show `[TEST SESSION - REAL MODE ENABLED]` message
- [ ] Logs do NOT show `[MOCK MODE]` for test sessions
- [ ] Report ID does NOT contain "MOCK"
- [ ] Report content is real AI-generated (not generic placeholders)
- [ ] Report generation takes 30-60 seconds (not 2-3 seconds)

---

## Quick Test

1. **Generate a fresh test session**:
   ```
   https://www.mindveda.net/ai-astrology/input?reportType=decision-support
   ```

2. **Complete the flow** and check Vercel logs for:
   - `[REAL MODE CHECK]` output
   - `[TEST SESSION - REAL MODE ENABLED]` message

3. **If you see `[MOCK MODE]` instead**, the env var is not loaded → Redeploy

---

## Expected Behavior

### When Environment Variable is Working ✅

**Logs**:
```
[REAL MODE CHECK] {
  "allowRealForTestSessions": true,
  "envVarValue": "true",
  "shouldUseRealMode": true,
  "mockMode": false
}

[TEST SESSION - REAL MODE ENABLED] {
  "reason": "environment variable (ALLOW_REAL_FOR_TEST_SESSIONS=true)"
}
```

**Report**:
- Report ID: `RPT-...` (no "MOCK")
- Content: Real AI-generated text (detailed, personalized)
- Generation time: 30-60 seconds
- Cost: ~$0.01-0.05 per report

### When Environment Variable is NOT Working ❌

**Logs**:
```
[REAL MODE CHECK] {
  "allowRealForTestSessions": false,
  "envVarValue": undefined,
  "shouldUseRealMode": false,
  "mockMode": true
}

[MOCK MODE] {
  "isTestSession": true
}
```

**Report**:
- Report ID: `RPT-...-MOCK-...`
- Content: Generic placeholders
- Generation time: 2-3 seconds
- Cost: Free

---

## Next Steps

1. **Check Vercel logs** for `[REAL MODE CHECK]` output
2. **Verify** environment variable is set correctly
3. **Redeploy** if variable was recently added
4. **Generate a fresh test report** and check logs again

---

**Last Updated**: 2026-01-20  
**Status**: Debug logging added - Check Vercel logs for `[REAL MODE CHECK]`

