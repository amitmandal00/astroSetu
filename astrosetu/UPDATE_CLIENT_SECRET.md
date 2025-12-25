# 🔑 Update ProKerala Client Secret

## New Client Secret

```
VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg
```

---

## Step 1: Update in Vercel

### 1.1 Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click your project: **astrosetu** (or your project name)
3. Go to **Settings** → **Environment Variables**

### 1.2 Update PROKERALA_CLIENT_SECRET

1. Find `PROKERALA_CLIENT_SECRET` in the list
2. Click on it
3. Click **"Edit"** button
4. **Delete** the old value completely
5. **Paste** the new value: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
6. **Important:** 
   - ✅ No spaces before or after
   - ✅ No quotes around the value
   - ✅ Exact match: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
7. Click **"Save"**

### 1.3 Verify Environment

Make sure the variable is set for **Production** environment:
- Check the environment dropdown
- Should be set for **"Production"** (not just Preview/Development)
- If not, add it for Production

---

## Step 2: Update in ProKerala Dashboard

### 2.1 Go to ProKerala Dashboard

1. Visit: https://www.prokerala.com/account/api.php
2. Log in to your account

### 2.2 Find Your API Client

1. Find your API client (e.g., "AstroSetu")
2. Click on it to view/edit

### 2.3 Update Client Secret

**Option A: If there's a "Regenerate Secret" or "Update Secret" button:**
1. Click **"Regenerate Secret"** or **"Update Secret"**
2. Copy the new secret: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
3. Save/Confirm

**Option B: If you need to manually set it:**
1. Look for a field to edit Client Secret
2. Paste: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
3. Save

**Note:** If ProKerala doesn't allow manual editing and only allows regeneration, you may need to:
- Regenerate the secret in ProKerala
- Copy the new secret they provide
- Update Vercel with that new secret

---

## Step 3: Verify Both Match

### In Vercel:
- `PROKERALA_CLIENT_SECRET` = `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`

### In ProKerala:
- Client Secret = `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`

**They must match exactly!**

---

## Step 4: Redeploy (CRITICAL!)

**Environment variables only take effect after redeployment!**

### 4.1 Force Redeploy

1. Go to Vercel Dashboard → **Deployments** tab
2. Find the latest deployment
3. Click **"..."** (three dots) menu
4. Click **"Redeploy"**
5. **IMPORTANT:** Uncheck **"Use existing Build Cache"**
6. Click **"Redeploy"**
7. Wait 3-5 minutes for deployment to complete

---

## Step 5: Test

After redeployment, test the authentication:

```bash
curl https://astrosetu-app.vercel.app/api/astrology/diagnostic | jq '.data.prokeralaTest'
```

### Expected Success:

```json
{
  "status": "connected",
  "ok": true,
  "message": "Successfully authenticated and tested Prokerala API"
}
```

### If Still Failing:

Check the diagnostic response for:
- `authDiagnostic.clientSecretPreview` - Should show `VOZH...uSg`
- `authDiagnostic.clientSecretLength` - Should be 40
- `authDiagnostic.clientSecretHasSpaces` - Should be `false`
- `authDiagnostic.clientSecretHasQuotes` - Should be `false`

---

## Quick Checklist

- [ ] Updated `PROKERALA_CLIENT_SECRET` in Vercel
- [ ] No spaces or quotes in Vercel value
- [ ] Set for Production environment
- [ ] Updated in ProKerala dashboard (or regenerated)
- [ ] Values match exactly in both places
- [ ] Force redeployed on Vercel
- [ ] Cleared build cache during redeploy
- [ ] Waited 3-5 minutes for deployment
- [ ] Tested diagnostic endpoint
- [ ] Got "connected" status

---

## Troubleshooting

### If authentication still fails:

1. **Double-check values match:**
   - Vercel: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
   - ProKerala: `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`
   - Character-by-character comparison

2. **Check for hidden characters:**
   - Copy from ProKerala dashboard again
   - Paste into a text editor first
   - Check for any extra spaces or characters
   - Then paste into Vercel

3. **Verify redeployment:**
   - Check Vercel build logs
   - Verify deployment completed successfully
   - Check that environment variables were loaded

4. **Check ProKerala client status:**
   - Client should be "Active"
   - Account should be active
   - No API limit issues

---

## Summary

**New Client Secret:** `VOZHU6VQDLyiRMU7QOue7XViuvKm7Vd4IddfhuSg`

**Steps:**
1. Update in Vercel (Settings → Environment Variables)
2. Update in ProKerala (or regenerate)
3. Verify they match exactly
4. Force redeploy on Vercel (clear cache)
5. Test authentication

**After redeployment, authentication should work!**

