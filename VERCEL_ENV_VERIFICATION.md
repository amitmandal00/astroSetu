# Vercel Environment Variables Verification

## Current Status

Based on your Vercel settings, here's what's configured:

### ✅ Currently Set:
1. **`NODE_ENV`** = `production` ✅ (Correct)

### ⚠️ Needs Update:
2. **`NEXT_PUBLIC_APP_URL`** = `https://your-app.vercel.app` ❌
   - **Action Required:** Replace with your actual Vercel deployment URL
   - **How to find it:** Go to your Vercel project → Deployments → Click on latest deployment → Copy the URL
   - **Example:** `https://astrosetu-app.vercel.app` or `https://astrosetu-app-amits-projects.vercel.app`

### ❌ Missing Required Variables:

#### 1. Prokerala API (Required for accurate astrology calculations)
- `PROKERALA_CLIENT_ID` = `4aedeb7a-2fd2-4cd4-a0ec-11b01a895749`
- `PROKERALA_CLIENT_SECRET` = `06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o`

#### 2. Supabase (Required for database and authentication)
- `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGci...` (your anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGci...` (your service role key) - Optional but recommended

#### 3. Razorpay (Required for payments)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_test_xxxxx` or `rzp_live_xxxxx`
- `RAZORPAY_KEY_SECRET` = `your-secret-key`
- `RAZORPAY_WEBHOOK_SECRET` = `your-webhook-secret` (for payment webhooks)

### Optional Variables:

#### 4. App Configuration
- `NEXT_PUBLIC_APP_NAME` = `AstroSetu` (defaults to "AstroSetu" if not set)
- `NEXT_PUBLIC_TAGLINE` = `Bridging humans with cosmic guidance` (optional)

#### 5. Push Notifications (Optional)
- `VAPID_PUBLIC_KEY` = `your-vapid-public-key`
- `VAPID_PRIVATE_KEY` = `your-vapid-private-key`

---

## Quick Fix Steps

### Step 1: Update NEXT_PUBLIC_APP_URL

1. Go to your Vercel project → **Deployments**
2. Click on your latest deployment
3. Copy the deployment URL (e.g., `https://astrosetu-app-xxx.vercel.app`)
4. Go to **Settings** → **Environment Variables**
5. Edit `NEXT_PUBLIC_APP_URL` and replace `https://your-app.vercel.app` with your actual URL
6. Click **Save**

### Step 2: Add Missing Required Variables

Click **"+ Add Another"** and add each variable:

#### Prokerala API:
```
Key: PROKERALA_CLIENT_ID
Value: 4aedeb7a-2fd2-4cd4-a0ec-11b01a895749
```

```
Key: PROKERALA_CLIENT_SECRET
Value: 06SCo9ssJB0nQWYbDWx7GXvnNAc0dqMhDrvIYZ6o
```

#### Supabase (if you have it configured):
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project.supabase.co
```

```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGci... (your actual key)
```

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGci... (your actual key)
```

#### Razorpay (if you have it configured):
```
Key: NEXT_PUBLIC_RAZORPAY_KEY_ID
Value: rzp_test_xxxxx
```

```
Key: RAZORPAY_KEY_SECRET
Value: your-secret-key
```

### Step 3: Set Environment Scope

For each variable, make sure to set the correct environment:
- **Production** - For live deployments
- **Preview** - For preview deployments (optional)
- **Development** - For local development (optional)

**Recommended:** Set all variables for **Production** at minimum.

### Step 4: Redeploy

After adding/updating variables:
1. Go to **Deployments** tab
2. Click **three dots (⋯)** on latest deployment
3. Click **Redeploy**

OR push a new commit:
```bash
git commit --allow-empty -m "Update environment variables"
git push
```

---

## Security Notes

### ✅ Safe to Expose (NEXT_PUBLIC_*)
These variables are exposed to the browser - that's intentional:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` ✅
- `NEXT_PUBLIC_APP_URL` ✅
- `NEXT_PUBLIC_APP_NAME` ✅

### 🔒 Keep Secret (Server-side only)
These should NEVER be exposed:
- `PROKERALA_CLIENT_SECRET` 🔒
- `SUPABASE_SERVICE_ROLE_KEY` 🔒
- `RAZORPAY_KEY_SECRET` 🔒
- `RAZORPAY_WEBHOOK_SECRET` 🔒
- `VAPID_PRIVATE_KEY` 🔒

---

## Verification Checklist

After adding all variables, verify:

- [ ] `NODE_ENV` = `production` ✅
- [ ] `NEXT_PUBLIC_APP_URL` = Your actual Vercel URL (not placeholder)
- [ ] `PROKERALA_CLIENT_ID` = Your Prokerala Client ID
- [ ] `PROKERALA_CLIENT_SECRET` = Your Prokerala Client Secret
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL (if using Supabase)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase Anon Key (if using Supabase)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` = Your Razorpay Key ID (if using Razorpay)
- [ ] `RAZORPAY_KEY_SECRET` = Your Razorpay Secret (if using Razorpay)

---

## Testing After Configuration

1. **Redeploy your application**
2. **Visit your deployment URL**
3. **Check browser console** for any environment variable errors
4. **Test key features:**
   - Generate a Kundli (tests Prokerala API)
   - Try to register/login (tests Supabase)
   - Try to add money to wallet (tests Razorpay)

---

## Need Help?

- **Prokerala Setup:** See `PROKERALA_SETUP.md`
- **Supabase Setup:** See `SUPABASE_SETUP.md`
- **Razorpay Setup:** See `RAZORPAY_SETUP.md`
- **General Setup:** See `DEPLOYMENT_GUIDE.md`
