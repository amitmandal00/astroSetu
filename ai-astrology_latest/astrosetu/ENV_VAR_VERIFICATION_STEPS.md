# Environment Variable Verification Steps

**Date**: 2026-01-20  
**Issue**: `ALLOW_REAL_FOR_TEST_SESSIONS=true` set in Vercel but real reports not generating

---

## Critical Check: Deployment Status

**The logs you provided don't show `[REAL MODE CHECK]`**, which means:

⚠️ **The latest code with debug logging may not be deployed yet**

### Step 1: Verify Deployment Completed

1. Go to **Vercel Dashboard** → **Deployments**
2. Check the **latest deployment**:
   - ✅ Status: **Ready** (green)
   - ✅ Commit: Should include `84e3b79` (fix: Add debug logging...)
   - ✅ Build: Completed successfully
3. **If deployment is still building**: Wait for it to complete (2-5 minutes)

### Step 2: Check Environment Variable in Vercel

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Find `ALLOW_REAL_FOR_TEST_SESSIONS`
3. Verify:
   - ✅ **Key**: Exactly `ALLOW_REAL_FOR_TEST_SESSIONS` (case-sensitive)
   - ✅ **Value**: Exactly `true` (lowercase, no quotes, no spaces)
   - ✅ **Environments**: 
     - ☑️ **Production** (if testing on www.mindveda.net)
     - ☑️ **Preview** (if testing on preview URL)

### Step 3: Force Redeploy After Setting Variable

**Critical**: If you set the variable AFTER the last deployment, you MUST redeploy:

1. **Option A**: Push a new commit (triggers auto-deploy)
2. **Option B**: Manual redeploy:
   - Go to **Deployments** → Latest → "..." → **"Redeploy"**
   - Select **"Use existing Build Cache"** = **No** (to ensure env vars are reloaded)

### Step 4: Generate Fresh Test Report

After deployment completes:

1. **Generate a NEW test session** (don't reuse old URLs)
2. **Complete the flow**: Input → Payment → Preview
3. **Check Vercel logs** for the new request

### Step 5: Check Logs for Debug Output

**Look for these logs in Vercel (Function Logs tab):**

**Expected log when env var is working:**
```json
[REAL MODE CHECK] {
  "isTestSession": true,
  "envVarRaw": "true",
  "envVarType": "string",
  "allowRealForTestSessions": true,
  "shouldUseRealMode": true,
  "mockMode": false
}

[TEST SESSION - REAL MODE ENABLED] {
  "reason": "environment variable (ALLOW_REAL_FOR_TEST_SESSIONS=true)"
}
```

**If env var is NOT working, you'll see:**
```json
[REAL MODE CHECK] {
  "envVarRaw": "undefined",
  "envVarType": "undefined",
  "allowRealForTestSessions": false,
  "shouldUseRealMode": false,
  "mockMode": true
}
```

---

## Common Issues

### Issue 1: Variable Set But Not Redeployed

**Symptom**: Variable shows in Vercel but logs show `envVarRaw: "undefined"`

**Solution**: 
- **Redeploy** after setting the variable
- Environment variables are only loaded during build/deploy

### Issue 2: Wrong Environment Selected

**Symptom**: Variable set for Preview but testing on Production (or vice versa)

**Solution**:
- Set variable for **both** Production and Preview
- Or ensure you're testing on the correct environment

### Issue 3: Typo in Variable Name

**Symptom**: Variable not found

**Solution**:
- Verify exact spelling: `ALLOW_REAL_FOR_TEST_SESSIONS`
- Case-sensitive: Must be all uppercase

### Issue 4: Value Not Exactly "true"

**Symptom**: Variable exists but `allowRealForTestSessions: false`

**Solution**:
- Value must be exactly: `true` (lowercase)
- No quotes: Not `"true"` or `'true'`
- No spaces: Not ` true ` or `true `

---

## Quick Verification Checklist

- [ ] Latest deployment includes commit `84e3b79` (debug logging)
- [ ] Deployment status is "Ready" (green)
- [ ] Environment variable `ALLOW_REAL_FOR_TEST_SESSIONS` exists in Vercel
- [ ] Variable value is exactly `true` (lowercase, no quotes)
- [ ] Variable enabled for correct environment (Production/Preview)
- [ ] Redeployed after setting variable (if variable was added recently)
- [ ] Generated fresh test report (new session, not cached)
- [ ] Checked Vercel Function Logs for `[REAL MODE CHECK]` output
- [ ] Logs show `allowRealForTestSessions: true` and `mockMode: false`

---

## How to Check Vercel Logs

1. **Vercel Dashboard** → **Your Project**
2. **Deployments** → Click on latest deployment
3. **Functions** tab → Find `/api/ai-astrology/generate-report`
4. **Logs** tab → Search for `[REAL MODE CHECK]`

**Or use Vercel CLI:**
```bash
vercel logs --follow
```

Then search for `[REAL MODE CHECK]` in the output.

---

## Next Steps

1. **Verify deployment** includes latest code (commit `84e3b79`)
2. **Check Vercel logs** for `[REAL MODE CHECK]` output
3. **Share the log output** so we can see what `envVarRaw` shows
4. **If `envVarRaw: "undefined"`**: Variable not loaded → Redeploy
5. **If `envVarRaw: "true"` but `mockMode: true`**: Logic bug → We'll fix

---

**Last Updated**: 2026-01-20  
**Status**: Enhanced debug logging added - Check Vercel Function Logs

