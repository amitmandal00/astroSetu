# 🚀 Git Push Commands

## Step-by-Step Commands

Run these commands in your terminal:

### 1. Navigate to Project Directory

```bash
cd astrosetu
```

### 2. Check Changed Files

```bash
git status
```

You should see:
- `src/lib/astrologyAPI.ts` (modified)
- `src/app/api/astrology/diagnostic/route.ts` (modified)

### 3. Stage Changes

```bash
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
```

### 4. Commit Changes

```bash
git commit -m "Fix ProKerala auth: Use form-encoded body per API docs + enhanced diagnostics"
```

### 5. Push to GitHub

```bash
git push origin main
```

---

## Complete Command Sequence

Copy and paste this entire block:

```bash
cd astrosetu
git add src/lib/astrologyAPI.ts src/app/api/astrology/diagnostic/route.ts
git commit -m "Fix ProKerala auth: Use form-encoded body per API docs + enhanced diagnostics"
git push origin main
```

---

## After Pushing

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Your project should auto-deploy

2. **Or Force Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - **Uncheck** "Use existing Build Cache"
   - Click "Redeploy"

3. **Wait 3-5 minutes** for deployment

4. **Test:**
   ```bash
   curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
   ```

---

## What Changed

- ✅ Reverted to form-encoded body method (per ProKerala docs)
- ✅ Enhanced diagnostic endpoint with credential previews
- ✅ Better error logging and suggestions
- ✅ Auto-trimming of credentials

The code now matches ProKerala API documentation exactly!

