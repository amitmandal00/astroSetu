# Vercel Test Deployment Guide

## Option 1: Deploy via Vercel CLI (Recommended for Test)

### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### Step 2: Navigate to Project
```bash
cd astrosetu
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Link Project (if not already linked)
```bash
vercel link
```
- Select your existing project OR create a new one
- Select scope (your account)
- Confirm root directory: `./` (should auto-detect `astrosetu`)
- Confirm framework: `Next.js`

### Step 5: Deploy to Preview (Test Deployment)
```bash
vercel
```
- This creates a preview deployment (not production)
- You'll get a preview URL like: `https://your-project-abc123.vercel.app`

### Step 6: Deploy to Production (if test works)
```bash
vercel --prod
```

---

## Option 2: Trigger via Git Push (Test Commit)

### Step 1: Create a test commit
```bash
# Add a small test change
echo "// Test deployment $(date)" >> astrosetu/src/app/test-deploy.txt

# Commit and push
git add astrosetu/src/app/test-deploy.txt
git commit -m "test: trigger Vercel deployment"
git push origin main
```

### Step 2: Check Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Open your project
- Check "Deployments" tab
- Should see new deployment triggered by git push

---

## Option 3: Deploy via Vercel Dashboard

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Open your project

### Step 2: Create New Deployment
1. Click "Deployments" tab
2. Click "Create Deployment" (or "Redeploy")
3. Select branch: `main`
4. Select commit: Latest (`0a0a691` or newer)
5. Click "Deploy"

---

## Verification Checklist

After deployment, verify:

- [ ] Build completes successfully (check logs)
- [ ] Deployment shows "Ready" status
- [ ] Preview URL is accessible
- [ ] Home page loads (`/`)
- [ ] AI Astrology page loads (`/ai-astrology`)
- [ ] Footer shows Build ID (e.g., `Build: 0a0a691`)
- [ ] Console shows `[BUILD]` log with build ID
- [ ] No build errors in Vercel logs

---

## Troubleshooting

### If deployment fails:

1. **Check Root Directory**:
   - Vercel Dashboard → Settings → General → Root Directory
   - Should be: `astrosetu` (not `.`)

2. **Check Build Command**:
   - Should be: `npm run build` (or default Next.js build)

3. **Check Environment Variables**:
   - Vercel Dashboard → Settings → Environment Variables
   - Ensure all required vars are set

4. **Check Build Logs**:
   - Click on failed deployment → View Build Logs
   - Look for errors in `generate-build-meta.mjs` or `npm run build`

---

## Quick Test Command

```bash
# Test deployment to preview
cd astrosetu
vercel

# Or trigger via git push
git commit --allow-empty -m "test: trigger Vercel deployment $(date +%s)"
git push origin main
```

---

## Notes

- **Preview deployments** don't affect production
- **Production deployments** only happen on `main` branch (if auto-deploy is enabled)
- **Test deployments** are safe - they don't change production until you merge to `main`

