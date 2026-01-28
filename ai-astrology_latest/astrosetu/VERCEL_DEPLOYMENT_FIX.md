# Vercel Deployment Not Starting - Fix Guide

## Issue
Vercel is not automatically starting deployment for the `phase2-features` branch.

## Possible Causes & Solutions

### Solution 1: Verify Branch Was Pushed
✅ **Status:** Branch `phase2-features` has been pushed to origin.

### Solution 2: Check Vercel Dashboard Settings

1. **Go to Vercel Dashboard** → Your Project → Settings → Git
2. **Verify Git Integration:**
   - Check if the repository connection is active
   - Verify webhook is properly configured
   - Check if the branch is being tracked

3. **Check Ignored Build Step:**
   - Go to Settings → Git
   - Verify the "Ignored Build Step" command is correct
   - Current command: `[ "$VERCEL_GIT_COMMIT_REF" = "main" ] && exit 0 || exit 1`
   - This should: Skip `main`, Build other branches

### Solution 3: Manual Deployment Trigger

If automatic deployment is not working, you can:

#### Option A: Use Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from current branch (creates preview)
vercel

# Or deploy specific branch
vercel --prod=false
```

#### Option B: Trigger via Vercel Dashboard
1. Go to Vercel Dashboard → Deployments
2. Click "Deploy" button
3. Select the branch: `phase2-features`
4. Click "Deploy"

#### Option C: Make a Small Commit to Trigger
```bash
# Make a small change to trigger webhook
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin phase2-features
```

### Solution 4: Verify Webhook Configuration

1. Go to GitHub → Repository → Settings → Webhooks
2. Check if Vercel webhook is active
3. Check recent webhook deliveries
4. Verify the webhook is receiving events

### Solution 5: Check Vercel Project Settings

1. **Verify Production Branch Setting:**
   - Go to Vercel Dashboard → Settings → General
   - Check "Production Branch" - should be set to prevent production deployments
   - Or check Settings → Environments → Branch Tracking

2. **Check Build Settings:**
   - Settings → General → Build & Development Settings
   - Verify Framework Preset is "Next.js"
   - Verify Root Directory is correct (if applicable)
   - Verify Build Command is `npm run build`

### Solution 6: Update ignoreCommand (If Needed)

The current `ignoreCommand` should work, but if you want to be more explicit:

**Current:**
```json
"ignoreCommand": "[ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ] && exit 0 || exit 1"
```

**Alternative (more explicit):**
```json
"ignoreCommand": "if [ \"$VERCEL_GIT_COMMIT_REF\" = \"main\" ]; then exit 0; else exit 1; fi"
```

Both should work the same way:
- Exit 0 = Skip build (for `main` branch)
- Exit 1 = Proceed with build (for other branches)

### Solution 7: Check Rate Limits

If you've hit Vercel's deployment rate limits:
- Free tier: 100 deployments/day
- Check your usage in Vercel Dashboard
- Wait for reset or upgrade to Pro

---

## Quick Fix Steps (Try These First)

1. **Verify the branch exists on GitHub:**
   - Visit: https://github.com/amitmandal00/astroSetu/tree/phase2-features
   - Confirm the branch exists

2. **Check Vercel Dashboard:**
   - Go to Deployments page
   - Check if there's a failed webhook or pending deployment
   - Look for any error messages

3. **Manual Trigger (Quickest Solution):**
   ```bash
   cd astrosetu
   vercel --prod=false
   ```

4. **Or make an empty commit:**
   ```bash
   git commit --allow-empty -m "Trigger deployment"
   git push origin phase2-features
   ```

---

## Expected Behavior

- ✅ Pushing to `main` → Should be **skipped** (no deployment)
- ✅ Pushing to `phase2-features` → Should **trigger preview deployment**
- ✅ Pushing to any other branch → Should trigger preview deployment

---

## If Still Not Working

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Project → Logs
   - Check for any errors or warnings

2. **Verify Repository Connection:**
   - Settings → Git → Disconnect and reconnect if needed

3. **Contact Vercel Support:**
   - If webhook is not receiving events
   - If there are deployment errors

---

**Current Status:** Branch `phase2-features` is pushed to GitHub and should trigger a preview deployment. If it doesn't appear automatically, use the manual trigger methods above.

