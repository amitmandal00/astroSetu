# AI Astrology Demo Mode

## Overview

Demo mode allows you to test paid reports (Marriage Timing, Career & Money, Full Life) without completing payment. This is useful for development and testing.

## How to Enable Demo Mode

### Option 1: Enable for Development (Automatic)

In development mode (`NODE_ENV=development`), demo mode is automatically enabled. Just run:

```bash
npm run dev
```

### Option 2: Explicitly Enable Demo Mode

Add to your `.env.local` file:

```bash
# Enable demo mode to test paid reports without payment
AI_ASTROLOGY_DEMO_MODE=true
```

Then restart your development server.

## How to Test Paid Reports

1. **Enable demo mode** (see above)

2. **Navigate to AI Astrology Input Page**
   - Go to `/ai-astrology/input`

3. **Fill in birth details**
   - Name, Date of Birth, Time of Birth, Place
   - Select a paid report type (Marriage Timing, Career & Money, or Full Life)

4. **Submit the form**
   - You'll be redirected to the preview page

5. **Generate the report**
   - Click "Generate Report" button
   - The report will generate without payment verification

6. **View the report**
   - The paid report will be displayed normally

## Available Paid Reports

In demo mode, you can test:

- ✅ **Marriage Timing Report** - Ideal marriage windows, compatibility, and remedies
- ✅ **Career & Money Report** - Career direction, timing, and financial phases  
- ✅ **Full Life Report** - Comprehensive analysis covering all aspects of life

## Important Notes

⚠️ **Security Warning:**
- Demo mode should **NEVER** be enabled in production
- Demo mode is automatically disabled in production builds (`NODE_ENV=production`)
- Always verify that `AI_ASTROLOGY_DEMO_MODE` is not set in production environment

⚠️ **Testing:**
- Demo mode allows full report generation without payment
- All report features work normally
- Only payment verification is bypassed

## Disabling Demo Mode

### For Development Testing with Real Payments:

1. Remove `AI_ASTROLOGY_DEMO_MODE` from `.env.local` (or set to `false`)
2. Or use production build: `npm run build && npm start`

### Verify Demo Mode Status:

Check server logs when generating a paid report:
- **Demo mode ON**: `[DEMO MODE] Bypassing payment verification for {reportType} report`
- **Demo mode OFF**: Payment verification will be required

## Production Deployment

In production:
- Demo mode is automatically disabled
- All paid reports require valid payment tokens
- Payment verification is enforced

No additional configuration needed for production.

