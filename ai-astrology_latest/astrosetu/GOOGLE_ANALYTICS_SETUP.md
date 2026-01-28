# 📊 Google Analytics 4 Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **"Admin"** (gear icon) → **"Create Property"**
4. Enter property details:
   - Property name: `AstroSetu` or `MindVeda`
   - Reporting time zone: Choose your timezone
   - Currency: USD (or your preference)
5. Click **"Next"** → Configure data sharing settings → **"Create"**

### Step 2: Get Measurement ID

1. In your new property, go to **"Admin"** → **"Data Streams"**
2. Click **"Add stream"** → **"Web"**
3. Enter:
   - Website URL: `https://www.mindveda.net`
   - Stream name: `MindVeda Production`
4. Click **"Create stream"**
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`astrosetu-app`)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value:** Your Measurement ID (e.g., `G-XXXXXXXXXX`)
   - **Environment:** Production (and Preview if desired)
5. Click **"Save"**

### Step 4: Redeploy

The code is already set up! Just redeploy:
- Go to **Deployments** tab
- Click **"Redeploy"** on the latest deployment
- Or push a new commit to trigger deployment

### Step 5: Verify Installation

1. Visit your website: `https://www.mindveda.net`
2. Open browser DevTools → **Network** tab
3. Filter by: `gtag` or `google-analytics`
4. You should see requests to `google-analytics.com`
5. In Google Analytics, go to **Reports** → **Realtime**
6. You should see your visit appear within a few seconds

---

## What's Already Implemented

✅ Google Analytics script is already added to `src/app/layout.tsx`  
✅ Automatically tracks page views on navigation  
✅ Ready to accept your Measurement ID via environment variable

---

## Advanced Configuration

### Track Custom Events

To track custom events (e.g., report generation, purchases), add this to your components:

```typescript
// Track custom event
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'report_generated', {
    event_category: 'AI Astrology',
    event_label: 'Marriage Timing Report',
    value: 29,
  });
}
```

### Track Conversions (Purchases)

Add purchase tracking when payment succeeds:

```typescript
// In payment success handler
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'purchase', {
    transaction_id: paymentIntentId,
    value: amount,
    currency: 'USD',
    items: [{
      item_id: reportType,
      item_name: getReportName(reportType),
      price: amount,
      quantity: 1,
    }],
  });
}
```

---

## Testing

### Test in Development

1. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to `.env.local`:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
2. Run `npm run dev`
3. Visit `http://localhost:3001`
4. Check Google Analytics Realtime reports

---

## Troubleshooting

### Analytics not showing up?

1. **Check environment variable:**
   - Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in Vercel
   - Must start with `G-`
   - Must be deployed (not just in code)

2. **Check browser console:**
   - Open DevTools → Console
   - Look for errors related to `gtag` or Google Analytics

3. **Check ad blockers:**
   - Some ad blockers prevent Google Analytics
   - Test in incognito mode or disable ad blockers

4. **Verify Measurement ID format:**
   - Should be: `G-XXXXXXXXXX` (11 characters after G-)
   - Not the old Universal Analytics ID (UA-XXXXX-X)

---

## Next Steps

After setup, you can:
- Set up **Google Search Console** (separate setup)
- Configure **conversion goals** in GA4
- Set up **audiences** for remarketing
- Create **custom reports** for your needs

---

**Ready to track!** 🎉

