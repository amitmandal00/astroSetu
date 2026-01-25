# Environment Variables Setup

## Quick Setup

Add the following to your `.env.local` file in the `astrosetu` directory:

```bash
# Prokerala API Credentials (Required for accurate AstroSage comparison)
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here

# Alternative: Single API Key (if using access token)
# PROKERALA_API_KEY=your_access_token_here
```

---

## Step-by-Step Instructions

### 1. Locate `.env.local` File

The `.env.local` file should be in the root of the `astrosetu` directory:
```
astrosetu/
  ├── .env.local  ← This file
  ├── package.json
  ├── src/
  └── ...
```

### 2. Open `.env.local` in a Text Editor

If the file doesn't exist, create it.

### 3. Add Prokerala Credentials

Copy and paste the following, replacing `your_client_id_here` and `your_client_secret_here` with your actual credentials:

```bash
# Prokerala API Credentials
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here
```

### 4. Save the File

Save `.env.local` and close it.

### 5. Restart Development Server

**Important:** You must restart the server for environment variables to take effect:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd astrosetu
npm run dev
```

### 6. Verify Configuration

1. Open http://localhost:3001/kundli
2. The demo mode banner should disappear if credentials are correct
3. Or check: http://localhost:3001/api/astrology/config
   - Should return: `{"ok":true,"data":{"configured":true}}`

---

## Getting Prokerala Credentials

If you don't have Prokerala credentials yet:

1. Visit: https://www.prokerala.com/account/api.php
2. Sign up or log in
3. Create a new API client
4. Copy your **Client ID** and **Client Secret**

See `PROKERALA_SETUP.md` for detailed instructions.

---

## Complete `.env.local` Template

Here's a complete template with all optional variables:

```bash
# Prokerala API (Required for accurate calculations)
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here

# Supabase (Optional - for database/auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (Optional - for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## Troubleshooting

### Issue: Banner still shows "Demo Mode"

**Solutions:**
1. Verify credentials are correct (no extra spaces)
2. Restart the development server
3. Check `.env.local` is in the correct location
4. Verify variable names are exact: `PROKERALA_CLIENT_ID` and `PROKERALA_CLIENT_SECRET`

### Issue: "Prokerala API credentials not configured"

**Solutions:**
1. Check `.env.local` file exists
2. Verify credentials are added correctly
3. Restart server after adding credentials
4. Check for typos in variable names

### Issue: Environment variables not loading

**Solutions:**
1. Ensure file is named exactly `.env.local` (not `.env` or `.env.local.txt`)
2. File should be in the `astrosetu` root directory
3. Restart the development server
4. Check for syntax errors (no spaces around `=`)

---

## Security Notes

⚠️ **Never commit `.env.local` to Git!**

The file is already in `.gitignore`, but double-check:
- Don't share credentials publicly
- Don't commit to version control
- Use different credentials for development and production

---

## Production Setup

For production (Vercel, etc.):

1. Go to your hosting platform's environment variables settings
2. Add the same variables:
   - `PROKERALA_CLIENT_ID`
   - `PROKERALA_CLIENT_SECRET`
3. Redeploy your application

---

**Last Updated:** $(date)

