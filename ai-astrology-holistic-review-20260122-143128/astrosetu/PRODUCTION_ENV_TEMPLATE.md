# Production Environment Variables Template

Copy these variables to your hosting platform (Vercel/Netlify/etc.)

## Required Variables

```env
# ============================================
# Core Configuration
# ============================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ============================================
# Supabase (Database & Auth)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# ============================================
# Prokerala API (Astrology Calculations)
# ============================================
PROKERALA_CLIENT_ID=your-production-client-id
PROKERALA_CLIENT_SECRET=your-production-client-secret

# ============================================
# VAPID Keys (Web Push Notifications)
# ============================================
VAPID_PUBLIC_KEY=your-production-vapid-public-key
VAPID_PRIVATE_KEY=your-production-vapid-private-key

# ============================================
# Razorpay (Payments)
# ============================================
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-production-razorpay-key
RAZORPAY_KEY_SECRET=your-production-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-production-webhook-secret

# ============================================
# Optional - Sentry (Error Tracking)
# ============================================
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## How to Set in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable
5. Set environment to **Production**
6. Save and redeploy

## How to Set in Netlify

1. Go to Netlify Dashboard
2. Select your site
3. Go to Site Settings → Environment Variables
4. Add each variable
5. Save and redeploy

## Security Notes

- ⚠️ Never commit actual values to git
- ⚠️ Use different credentials for dev and production
- ⚠️ Rotate secrets regularly
- ✅ Variables prefixed with `NEXT_PUBLIC_` are exposed to browser
- ✅ Variables without `NEXT_PUBLIC_` are server-side only
