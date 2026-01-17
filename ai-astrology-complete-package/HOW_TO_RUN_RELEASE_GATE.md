# How to Run `npm run release:gate` in CI/Vercel

**Date**: 2026-01-17 18:05  
**Purpose**: Verify atomic generation fix is production-ready

---

## Option 1: Vercel (Recommended - Easiest)

### Step 1: Trigger Vercel Deployment

**If you have Vercel connected to GitHub**:
1. Go to your GitHub repository
2. Navigate to the branch: `chore/stabilization-notes`
3. Vercel should automatically trigger a deployment (if auto-deploy is enabled)
   - Or manually trigger via Vercel dashboard → Deployments → "Redeploy"

**If you need to trigger manually**:
```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel (if not already logged in)
vercel login

# Deploy from current directory
cd astrosetu
vercel --prod
```

### Step 2: Verify Build Output

1. Go to **Vercel Dashboard** → Your Project → **Deployments**
2. Click on the latest deployment
3. Check the **Build Logs** tab
4. Look for:
   - ✅ `npm run type-check` - Should pass
   - ✅ `npm run build` - Should succeed
   - ✅ `npm run test:critical` - Should pass (if tests run)

### Step 3: Modify Vercel Build Command (If Needed)

**If Vercel uses a different build command**, update it:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. Scroll to **Build & Development Settings**
3. **Build Command**: Change from `npm run build` to:
   ```bash
   npm run release:gate
   ```
4. **Output Directory**: Keep as `.next`
5. **Install Command**: Keep as `npm install`
6. Save and redeploy

**Or create `vercel.json` in `astrosetu/` directory**:
```json
{
  "buildCommand": "npm run release:gate",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

---

## Option 2: GitHub Actions CI (If You Want Automated Checks)

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/release-gate.yml`:

```yaml
name: Release Gate

on:
  push:
    branches:
      - chore/stabilization-notes
      - main
  pull_request:
    branches:
      - main

jobs:
  release-gate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: astrosetu/package-lock.json
      
      - name: Install dependencies
        working-directory: ./astrosetu
        run: npm ci
      
      - name: Run release gate
        working-directory: ./astrosetu
        run: npm run release:gate
      
      - name: Upload build artifacts (if build succeeds)
        if: success()
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: astrosetu/.next
```

### Step 2: Commit and Push

```bash
git add .github/workflows/release-gate.yml
git commit -m "Add GitHub Actions release gate workflow"
git push
```

### Step 3: Check GitHub Actions Status

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Find the **Release Gate** workflow run
4. Click on it to see detailed output
5. Verify all steps pass: ✅

---

## Option 3: Run Locally (Outside Sandbox)

**If you want to test before deploying**:

```bash
cd astrosetu

# Run release gate
npm run release:gate
```

**Expected Output**:
```
> astrosetu@1.0.0 release:gate
> npm run type-check && npm run build && npm run test:critical

> astrosetu@1.0.0 type-check
> tsc --noEmit
✅ PASSED

> astrosetu@1.0.0 build
> next build
✅ BUILD SUCCESS

> astrosetu@1.0.0 test:critical
> playwright test tests/e2e/critical-invariants.spec.ts ...
✅ TESTS PASSED
```

---

## What to Look For

### ✅ Success Indicators:
- Type-check passes (no TypeScript errors)
- Build succeeds (no module resolution errors)
- Critical tests pass (no infinite spinners, no timer resets)

### ❌ Failure Indicators:
- Build fails with module not found → Check imports
- Type-check fails → Check TypeScript errors
- Tests fail → Check test output for specific failures

---

## Quick Verification After Deployment

Once build succeeds in Vercel:

1. **Check Production Logs**:
   - Go to Vercel Dashboard → Your Project → **Logs**
   - Look for `[AUTOSTART]` logs when testing

2. **Test in Incognito**:
   - Open fresh Incognito window
   - Navigate to: `https://your-domain.com/ai-astrology/preview?session_id=...&reportType=year-analysis&auto_generate=true`
   - Verify timer doesn't reset, report completes or shows Retry

---

## Troubleshooting

### Build Fails with "Module not found"
- Check imports are correct
- Verify all dependencies in `package.json`
- Run `npm install` locally first

### Tests Fail in CI
- E2E tests may need Playwright setup
- Add `playwright install` step in CI workflow
- Or skip E2E tests in CI if unsupported (run only locally)

### Vercel Build Timeout
- Increase build timeout in Vercel settings (if needed)
- Or split `release:gate` into separate steps in CI

---

## Recommended Approach

**For fastest verification**:
1. ✅ **Use Vercel** (easiest - already connected)
   - Push to branch → Auto-deploys
   - Check build logs in dashboard

**For ongoing automation**:
2. ✅ **Add GitHub Actions** (runs on every push/PR)
   - Prevents broken code from merging
   - Shows status checks on PRs

**For local testing**:
3. ✅ **Run locally first** (before pushing)
   - Catches issues early
   - Faster feedback loop

---

**Last Updated**: 2026-01-17 18:05

