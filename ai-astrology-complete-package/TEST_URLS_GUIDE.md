# Test URLs Guide - Atomic Generation Fix

**Date**: 2026-01-17 18:10  
**Purpose**: Test the atomic generation fix after deployment

---

## Step 1: Find Your Vercel Deployment URL

### Option A: From Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) → Your Project (`astrosetu-app`)
2. Click on **"Deployments"** tab
3. Find the latest deployment (should be from your recent push)
4. Click on the deployment
5. Copy the **URL** shown at the top (e.g., `https://astrosetu-app-xxx.vercel.app`)

### Option B: From Project Overview
1. Go to Vercel Dashboard → Your Project
2. The **"Production"** URL is shown at the top
3. It will look like: `https://astrosetu-app.vercel.app` or your custom domain

### Option C: From Build Settings
Based on your screenshot, I saw a production override URL:
- `astrosetu-r/wjonfz4-amits-projects-a49d49fa.vercel.app`
- This might be a preview deployment URL

**Your main production URL should be visible in the Vercel Dashboard → Overview page.**

---

## Step 2: Construct Test URLs

Once you have your base URL (let's call it `YOUR_URL`), use these test URLs:

### Test 1: Year-Analysis Auto-Generate (First-Load Bug Test)

**URL Pattern**:
```
YOUR_URL/ai-astrology/preview?session_id=test_session_year-analysis_req-TIMESTAMP-UNIQUE&reportType=year-analysis&auto_generate=true
```

**Example** (replace `YOUR_URL` with your actual Vercel URL):
```
https://astrosetu-app.vercel.app/ai-astrology/preview?session_id=test_session_year-analysis_req-1768618094444-mpifxq1-000001&reportType=year-analysis&auto_generate=true
```

**Or generate a fresh one**:
```
https://YOUR_URL/ai-astrology/preview?session_id=test_session_year-analysis_req-${Date.now()}-test123-000001&reportType=year-analysis&auto_generate=true
```

### Test 2: Full-Life Auto-Generate

**URL Pattern**:
```
YOUR_URL/ai-astrology/preview?session_id=test_session_full-life_req-TIMESTAMP-UNIQUE&reportType=full-life&auto_generate=true
```

**Example**:
```
https://astrosetu-app.vercel.app/ai-astrology/preview?session_id=test_session_full-life_req-1768618094444-test456-000001&reportType=full-life&auto_generate=true
```

### Test 3: Free Life Summary (Control Test)

**URL Pattern**:
```
YOUR_URL/ai-astrology/preview?session_id=test_session_life-summary_req-TIMESTAMP-UNIQUE&reportType=life-summary&auto_generate=true
```

---

## Step 3: How to Test

### In Fresh Incognito Window (IMPORTANT)

1. **Open Incognito/Private Window** (fresh browser context)
   - Chrome: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Safari: `Cmd+Shift+N`

2. **Navigate to Test URL** (copy-paste one of the URLs above)

3. **What to Watch For**:
   - ✅ **Within 1 second**: Controller should start (you'll see "Generating..." or spinner)
   - ✅ **Timer should start** and **never reset to 0** (monotonic)
   - ✅ **Within 120 seconds**: Either:
     - Report renders successfully, OR
     - Error/Retry button appears (not infinite spinner)

4. **Check Browser Console** (F12 → Console tab):
   - Look for: `[AUTOSTART] attemptKey=... reportType=... sessionId=... autoGenerate=true`
   - Should see **exactly ONE** `[AUTOSTART]` log (not multiple)

5. **Check Vercel Logs** (if available):
   - Vercel Dashboard → Your Project → **Logs** tab
   - Filter for `[AUTOSTART]` to see production logs

---

## Step 4: Success Criteria

### ✅ Test Passes If:
- Timer starts immediately (within 1s)
- Timer never resets to 0 after starting
- Report completes OR shows Retry button (within 120s)
- Exactly one `[AUTOSTART]` log in console
- No infinite spinner

### ❌ Test Fails If:
- Timer resets to 0 after starting (bug still present)
- Infinite spinner (never completes or shows error)
- Multiple `[AUTOSTART]` logs (double-start bug)
- Nothing happens after 5+ seconds (controller stuck in idle)

---

## Step 5: Quick Test Script

You can also test locally first (before deployment):

```bash
cd astrosetu
npm run dev
```

Then open:
```
http://localhost:3001/ai-astrology/preview?session_id=test_session_year-analysis_req-${Date.now()}-test123-000001&reportType=year-analysis&auto_generate=true
```

---

## Finding Your Exact Vercel URL

**From Vercel Dashboard**:
1. Login to [vercel.com](https://vercel.com)
2. Click on your project: **"astrosetu-app"**
3. On the **Overview** page, you'll see:
   - **Production**: `https://astrosetu-app.vercel.app` (or your custom domain)
   - **Preview**: Various preview URLs for branches

**Use the Production URL** for testing.

---

## Example Test URLs (Replace YOUR_URL)

Once you have your Vercel URL, replace `YOUR_URL` in these:

```bash
# Year-Analysis Test
https://YOUR_URL/ai-astrology/preview?session_id=test_year_$(date +%s)&reportType=year-analysis&auto_generate=true

# Full-Life Test  
https://YOUR_URL/ai-astrology/preview?session_id=test_full_$(date +%s)&reportType=full-life&auto_generate=true
```

---

## Troubleshooting

### "Page Not Found" Error
- Check if the route exists: `/ai-astrology/preview`
- Verify deployment succeeded
- Check Vercel build logs for errors

### "No session_id" Error
- Make sure `session_id` parameter is in the URL
- Format: `session_id=test_session_year-analysis_req-TIMESTAMP-UNIQUE`

### Timer Still Resets
- Check browser console for errors
- Verify deployment includes latest code (check commit hash in Vercel)
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

**Last Updated**: 2026-01-17 18:10

