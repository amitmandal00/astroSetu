# Vercel Environment Variables Setup Guide

**Purpose:** Set up `STALE_REPORTS_API_KEY` for the stale reports background job

---

## Why Set This?

The `STALE_REPORTS_API_KEY` is used to secure manual triggers of the stale reports background job. While the Vercel cron job runs automatically with built-in authentication, having an API key allows you to:

1. **Manually trigger the job** for testing or emergency situations
2. **Use external cron services** (if needed)
3. **Add an extra layer of security** for the endpoint

**Note:** This is **optional** - the cron job will work without it (Vercel provides automatic authentication). However, it's **recommended** for production.

---

## Step-by-Step Instructions

### Method 1: Vercel Dashboard (Recommended)

#### 1. Go to Your Vercel Project

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (e.g., `astrosetu` or your project name)

#### 2. Navigate to Settings

1. Click on your project
2. Go to **Settings** tab (top navigation)
3. Click on **Environment Variables** (left sidebar)

#### 3. Add Environment Variable

1. Click **Add New** button
2. Fill in the form:
   - **Name:** `STALE_REPORTS_API_KEY`
   - **Value:** Generate a secure random string (see "Generating a Secure API Key" below)
   - **Environment:** Select all environments:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (optional, for local testing)

3. Click **Save**

#### 4. Verify

- The variable should appear in the list
- Make sure it's available for **Production** environment (required for cron jobs)

---

### Method 2: Vercel CLI

#### 1. Install Vercel CLI (if not already installed)

```bash
npm i -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Link Your Project (if not already linked)

```bash
cd /path/to/your/project
vercel link
```

#### 4. Add Environment Variable

```bash
# For production
vercel env add STALE_REPORTS_API_KEY production

# For preview (optional)
vercel env add STALE_REPORTS_API_KEY preview

# For development (optional)
vercel env add STALE_REPORTS_API_KEY development
```

When prompted, paste your API key value.

#### 5. Redeploy (if needed)

```bash
vercel --prod
```

---

## Generating a Secure API Key

### Option 1: Using OpenSSL (Recommended)

```bash
# Generate a 32-character random string
openssl rand -hex 32

# Or 64-character (more secure)
openssl rand -hex 64
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### Option 2: Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 3: Using Online Generator

- Visit: https://www.random.org/strings/
- Settings:
  - **Length:** 32-64 characters
  - **Character set:** Alphanumeric
  - **Format:** Plain text

### Option 4: Using Python

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Recommended API Key Format

- **Length:** 32-64 characters
- **Format:** Hexadecimal or base64
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

**Security Best Practices:**
- ✅ Use a long, random string (32+ characters)
- ✅ Don't use dictionary words or predictable patterns
- ✅ Store securely (password manager, 1Password, etc.)
- ✅ Rotate periodically (every 6-12 months)
- ❌ Don't commit to git
- ❌ Don't share publicly

---

## Testing the API Key

### 1. Get Your API Key Value

Copy the value you set in Vercel.

### 2. Test the Endpoint

```bash
# Replace YOUR_API_KEY with your actual key
# Replace YOUR_DOMAIN with your Vercel domain
curl -X POST https://YOUR_DOMAIN.vercel.app/api/ai-astrology/process-stale-reports \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "ok": true,
  "data": {
    "processed": 0,
    "refunded": 0,
    "failed": 0,
    "message": "No stale reports found"
  },
  "requestId": "..."
}
```

### 3. Test Without API Key (Should Fail)

```bash
curl -X POST https://YOUR_DOMAIN.vercel.app/api/ai-astrology/process-stale-reports \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```

---

## Environment Variable Reference

### Required Variables (for stale reports job)

| Variable | Required | Purpose |
|----------|----------|---------|
| `STRIPE_SECRET_KEY` | ✅ Yes | For refund processing |
| `SUPABASE_URL` | ✅ Yes | For database access |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | For database access |
| `STALE_REPORTS_API_KEY` | ⚠️ Optional | For manual triggers (recommended) |

### Optional Variables (for monitoring)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | ⚠️ Optional | For Sentry error tracking |
| `CRON_SECRET` | ✅ Auto-set | Vercel automatically sets this for cron jobs |

---

## Troubleshooting

### Issue: API Key Not Working

**Symptoms:**
- Getting "Unauthorized" error
- Manual trigger fails

**Solutions:**
1. ✅ Verify the variable name is exactly `STALE_REPORTS_API_KEY` (case-sensitive)
2. ✅ Check that it's set for the correct environment (Production)
3. ✅ Redeploy after adding the variable
4. ✅ Verify the API key value matches what you're sending

### Issue: Cron Job Not Running

**Symptoms:**
- Cron job doesn't execute
- No logs in Vercel

**Solutions:**
1. ✅ Verify `vercel.json` has the cron configuration
2. ✅ Check Vercel project settings → Cron Jobs
3. ✅ Ensure the endpoint is deployed
4. ✅ Check Vercel logs for errors

### Issue: Environment Variable Not Available

**Symptoms:**
- Variable not found in code
- `undefined` when accessing

**Solutions:**
1. ✅ Redeploy after adding the variable
2. ✅ Check environment scope (Production/Preview/Development)
3. ✅ Verify variable name spelling
4. ✅ Restart the deployment

---

## Security Checklist

Before deploying to production:

- [ ] API key is 32+ characters long
- [ ] API key is random (not predictable)
- [ ] API key is stored securely (password manager)
- [ ] API key is NOT committed to git
- [ ] API key is set for Production environment
- [ ] Endpoint tested with API key
- [ ] Endpoint tested without API key (should fail)
- [ ] Cron job is running automatically

---

## Quick Reference

### Add Variable (Dashboard)
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add `STALE_REPORTS_API_KEY`
3. Generate secure random string (32+ chars)
4. Select Production environment
5. Save

### Add Variable (CLI)
```bash
vercel env add STALE_REPORTS_API_KEY production
# Paste your API key when prompted
```

### Generate API Key
```bash
openssl rand -hex 32
```

### Test Endpoint
```bash
curl -X POST https://YOUR_DOMAIN/api/ai-astrology/process-stale-reports \
  -H "x-api-key: YOUR_API_KEY"
```

---

## Next Steps

After setting up the API key:

1. ✅ **Deploy to Production**
   ```bash
   vercel --prod
   ```

2. ✅ **Test the Endpoint**
   - Manual trigger with API key
   - Verify cron job runs automatically

3. ✅ **Monitor**
   - Check Vercel logs
   - Check Sentry alerts
   - Monitor first few runs

4. ✅ **Document**
   - Store API key securely
   - Document for team members (if applicable)

---

**Status:** ✅ Ready to set up  
**Difficulty:** 🟢 Easy (5 minutes)  
**Required:** ⚠️ Optional but recommended

---

**Need Help?** Check Vercel documentation: https://vercel.com/docs/concepts/projects/environment-variables

