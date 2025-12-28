# AI-Only Mode Configuration

## Overview
This document explains how to enable AI-Only Mode, which makes only the `/ai-astrology` section accessible to users, hiding all other routes.

## How to Enable

### 1. Add Environment Variable
Add this to your `.env.local` file:

```bash
NEXT_PUBLIC_AI_ONLY_MODE=true
```

### 2. Restart Your Development Server
```bash
npm run dev
```

### 3. Deploy with Environment Variable
When deploying to production (Vercel, etc.), add `NEXT_PUBLIC_AI_ONLY_MODE=true` to your environment variables.

## What Happens When Enabled

### ✅ Allowed Routes
- `/ai-astrology/*` - All AI astrology pages
- `/privacy` - Privacy Policy
- `/terms` - Terms & Conditions
- `/disclaimer` - Astrology Disclaimer
- `/refund` - Refund Policy
- `/contact` - Contact & Legal Info
- `/disputes` - Dispute Resolution
- `/cookies` - Cookie Policy
- `/data-breach` - Data Breach Policy
- `/compliance` - Compliance Certificate
- `/accessibility` - Accessibility Statement
- `/api/ai-astrology/*` - AI API routes
- `/api/contact` - Contact API
- `/api/health` - Health check

### ❌ Blocked Routes
All other routes will redirect to `/ai-astrology`:
- `/` (root) → `/ai-astrology`
- `/kundli` → `/ai-astrology`
- `/match` → `/ai-astrology`
- `/horoscope` → `/ai-astrology`
- `/services` → `/ai-astrology`
- All other non-AI routes → `/ai-astrology`

## How to Disable

Simply remove or set the environment variable to `false`:

```bash
NEXT_PUBLIC_AI_ONLY_MODE=false
```

Or remove it entirely from `.env.local`.

## Benefits

1. **Clean Launch**: Launch only the AI section without exposing incomplete features
2. **Easy Toggle**: Enable/disable with a single environment variable
3. **No Code Changes**: All logic is centralized in middleware and feature flags
4. **Legal Pages Accessible**: Important legal pages remain accessible for compliance
5. **API Protection**: Non-AI API routes are blocked (will return redirect)

## Testing

1. Enable AI-only mode locally
2. Try accessing `/kundli` - should redirect to `/ai-astrology`
3. Try accessing `/ai-astrology` - should work normally
4. Try accessing `/privacy` - should work (legal page)
5. Disable and verify all routes work normally

## Notes

- Static assets (images, fonts, etc.) are always accessible
- Next.js internal routes (`/_next/*`) are always accessible
- The root page (`/`) automatically redirects to `/ai-astrology` when enabled

