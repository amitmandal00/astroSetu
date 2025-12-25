# Prokerala API Setup Guide

## Overview

Prokerala API provides real astronomical calculations for accurate astrology results. Without Prokerala configured, AstroSetu falls back to mock/sample data which will **not match AstroSage** results.

---

## Step 1: Get Prokerala API Credentials

1. Visit: https://www.prokerala.com/account/api.php
2. Sign up or log in to your Prokerala account
3. Create a new API client:
   - Click "Create New Client"
   - Fill in application details
   - Copy your **Client ID** and **Client Secret**

---

## Step 2: Configure Environment Variables

### For Local Development

Create or edit `.env.local` in the project root:

```bash
# Prokerala API Credentials
PROKERALA_CLIENT_ID=your_client_id_here
PROKERALA_CLIENT_SECRET=your_client_secret_here

# Alternative: Single API Key (if using access token)
# PROKERALA_API_KEY=your_access_token_here
```

### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add:
   - `PROKERALA_CLIENT_ID` = your client ID
   - `PROKERALA_CLIENT_SECRET` = your client secret
4. Redeploy your application

### For Other Hosting

Add the same environment variables to your hosting platform's configuration.

---

## Step 3: Verify Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check if API is configured:
   - The demo mode banner should disappear
   - Kundli generation should use real calculations

3. Test with known data:
   - Use the test user: Amit Kumar Mandal, DOB: 26 Nov 1984, TOB: 21:40, Place: Noamundi, Jharkhand
   - Compare results with AstroSage.com

---

## Ayanamsa Settings

AstroSetu supports multiple Ayanamsa systems:

- **Lahiri (1)** - Default, matches AstroSage
- **Raman (3)**
- **KP/Krishnamurti (5)**
- **Krishnamurti (6)**
- **True Chitra (14)**

The default is **Lahiri (1)** which matches AstroSage's default setting.

---

## Troubleshooting

### Issue: "Latitude and longitude are required"

**Solution:** 
- Make sure you select a place from the autocomplete dropdown (not just type manually)
- Or use "Current Location" button
- Or enter manual coordinates in Advanced Settings

### Issue: "Prokerala API credentials not configured"

**Solution:**
- Check `.env.local` file exists and has correct variable names
- Restart the development server after adding credentials
- Verify credentials are correct (no extra spaces)

### Issue: "Prokerala authentication failed"

**Solution:**
- Verify Client ID and Client Secret are correct
- Check if your Prokerala account is active
- Ensure you haven't exceeded API rate limits

### Issue: Results still don't match AstroSage

**Solution:**
- Verify Ayanamsa is set to "Lahiri (1)" in Advanced Settings
- Check timezone is set to "Asia/Kolkata" (IST)
- Ensure coordinates are accurate (use place autocomplete)
- Compare with AstroSage using the same settings

---

## API Rate Limits

Prokerala API has rate limits based on your subscription plan. Check your plan details at https://www.prokerala.com/account/api.php

---

## Cost

Prokerala offers:
- **Free tier:** Limited requests per day
- **Paid plans:** Higher limits and additional features

Check current pricing at: https://www.prokerala.com/account/api.php

---

## Support

- Prokerala API Docs: https://www.prokerala.com/api/docs/
- Prokerala Support: https://www.prokerala.com/contact.php
- AstroSetu Issues: Create an issue in the project repository

---

**Last Updated:** $(date)
