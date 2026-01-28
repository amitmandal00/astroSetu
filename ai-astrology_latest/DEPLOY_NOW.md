# 🚀 Deploy AstroSetu to Production - Quick Start

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Production Supabase project created
- [ ] Production Razorpay account configured
- [ ] VAPID keys generated for push notifications
- [ ] Production domain ready (optional)
- [ ] Hosting platform account (Vercel/Netlify)

## Quick Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login
```bash
vercel login
```

#### Step 3: Deploy
```bash
cd astrosetu
vercel --prod
```

#### Step 4: Set Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.production.example`
3. Set environment to **Production**
4. Redeploy

### Option 2: Deploy to Netlify

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login
```bash
netlify login
```

#### Step 3: Deploy
```bash
cd astrosetu
netlify deploy --prod
```

#### Step 4: Set Environment Variables
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add all variables from `.env.production.example`
3. Redeploy

## Required Environment Variables

Copy these to your hosting platform:

```env
# Core
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Prokerala
PROKERALA_CLIENT_ID=your-client-id
PROKERALA_CLIENT_SECRET=your-client-secret

# VAPID Keys
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

## Post-Deployment Verification

1. **Check Production URL**
   - Visit your production domain
   - Verify homepage loads

2. **Test Critical Features**
   - [ ] User registration works
   - [ ] User login works
   - [ ] Kundli generation works
   - [ ] Payments work (test mode)

3. **Check Error Tracking**
   - Verify Sentry is receiving errors (if configured)
   - Check for any console errors

4. **Monitor Performance**
   - Check page load times
   - Monitor API response times

## Troubleshooting

### Build Fails
- Check environment variables are set
- Verify Node.js version (18+)
- Check build logs for errors

### App Not Working
- Verify all environment variables are set
- Check database connection
- Review error logs
- Check browser console

### Performance Issues
- Enable caching
- Optimize images
- Check database queries
- Consider CDN

## Next Steps

1. **Set Up Monitoring**
   - Configure Sentry for error tracking
   - Set up uptime monitoring
   - Configure analytics

2. **Configure Domain**
   - Add custom domain in hosting platform
   - Configure DNS records
   - Verify SSL certificate

3. **Test Everything**
   - Run through all user flows
   - Test payments (test mode)
   - Verify push notifications

4. **Go Live!**
   - Announce launch
   - Monitor closely for first 24 hours
   - Gather user feedback

---

**Need Help?** See `PRODUCTION_DEPLOYMENT_GUIDE.md` for detailed instructions.
