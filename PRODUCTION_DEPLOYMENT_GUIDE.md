# AstroSetu - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying AstroSetu to production.

## Prerequisites

- [ ] Production Supabase project created
- [ ] Production Razorpay account configured
- [ ] Production domain registered
- [ ] Hosting platform account (Vercel/Netlify)
- [ ] VAPID keys generated for push notifications
- [ ] All production API keys obtained

## Step 1: Production Environment Setup

### 1.1 Generate VAPID Keys

```bash
npm install -g web-push
web-push generate-vapid-keys
```

Save the keys securely - you'll need them for environment variables.

### 1.2 Set Up Production Supabase

1. Create a new Supabase project for production
2. Run the SQL from `SUPABASE_SETUP.md` in production database
3. Get production URL and keys from Supabase dashboard
4. Configure RLS policies
5. Set up database backups

### 1.3 Configure Production Razorpay

1. Switch to production mode in Razorpay dashboard
2. Get production API keys
3. Configure webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Set up webhook secret

### 1.4 Get Production Prokerala Credentials

1. Log in to Prokerala account
2. Get production API credentials
3. Verify API limits and quotas

## Step 2: Build Configuration

### 2.1 Update Environment Variables

Create production environment variables (in hosting platform, not in code):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# VAPID Keys
VAPID_PUBLIC_KEY=your-production-vapid-public-key
VAPID_PRIVATE_KEY=your-production-vapid-private-key

# Prokerala
PROKERALA_CLIENT_ID=your-production-client-id
PROKERALA_CLIENT_SECRET=your-production-client-secret

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-production-razorpay-key
RAZORPAY_KEY_SECRET=your-production-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-production-webhook-secret

# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2.2 Verify Build

```bash
cd astrosetu
npm ci  # Clean install
npm run build  # Production build
```

Check for:
- ✅ No build errors
- ✅ No warnings (or acceptable warnings)
- ✅ Build completes successfully
- ✅ Output size is reasonable

### 2.3 Test Production Build Locally

```bash
npm run start
```

Visit `http://localhost:3001` and verify:
- ✅ App loads correctly
- ✅ No console errors
- ✅ All features work
- ✅ API calls work (if configured)

## Step 3: Deploy to Hosting Platform

### Option A: Vercel Deployment

#### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 3.2 Login to Vercel

```bash
vercel login
```

#### 3.3 Configure Project

```bash
cd astrosetu
vercel
```

Follow prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time) or **Yes** (if exists)
- Project name? **astrosetu** (or your choice)
- Directory? **./**
- Override settings? **No**

#### 3.4 Set Environment Variables

In Vercel dashboard:
1. Go to Project → Settings → Environment Variables
2. Add all production environment variables
3. Set for **Production** environment
4. Save

#### 3.5 Deploy to Production

```bash
vercel --prod
```

Or use Vercel dashboard to deploy from Git.

### Option B: Netlify Deployment

#### 3.1 Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 3.2 Login to Netlify

```bash
netlify login
```

#### 3.3 Initialize Site

```bash
cd astrosetu
netlify init
```

Follow prompts to create new site.

#### 3.4 Set Environment Variables

In Netlify dashboard:
1. Go to Site → Site settings → Environment variables
2. Add all production environment variables
3. Save

#### 3.5 Configure Build Settings

In `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 3.6 Deploy

```bash
netlify deploy --prod
```

## Step 4: Domain Configuration

### 4.1 Add Custom Domain

In your hosting platform:
1. Go to Domain settings
2. Add your custom domain
3. Follow DNS configuration instructions

### 4.2 Configure DNS

Add DNS records as instructed:
- A record or CNAME record
- SSL certificate will be auto-provisioned

### 4.3 Verify SSL

- SSL certificate should be auto-configured
- Verify HTTPS is working
- Check certificate is valid

## Step 5: Post-Deployment Verification

### 5.1 Smoke Tests

Test these critical paths:

1. **Homepage**
   - [ ] Loads correctly
   - [ ] No console errors
   - [ ] All links work

2. **Authentication**
   - [ ] Can register new user
   - [ ] Can login
   - [ ] Can logout
   - [ ] Session persists

3. **Kundli Generation**
   - [ ] Can generate Kundli
   - [ ] Results are accurate
   - [ ] Can save Kundli

4. **Payments** (Test Mode)
   - [ ] Payment page loads
   - [ ] Can initiate payment
   - [ ] Test payment works
   - [ ] Webhook receives events

5. **Push Notifications**
   - [ ] Can subscribe
   - [ ] Preferences save
   - [ ] Service worker registered

### 5.2 Performance Check

- [ ] Page load < 3 seconds
- [ ] API responses < 1 second
- [ ] No memory leaks
- [ ] Mobile performance acceptable

### 5.3 Security Check

- [ ] HTTPS enabled
- [ ] No sensitive data in client code
- [ ] API rate limiting works
- [ ] CORS configured correctly
- [ ] No console errors exposing secrets

## Step 6: Monitoring Setup

### 6.1 Configure Sentry

1. Create production Sentry project
2. Get production DSN
3. Update environment variable: `SENTRY_DSN`
4. Verify error tracking works

### 6.2 Set Up Analytics

1. Configure analytics (Google Analytics, etc.)
2. Verify tracking works
3. Set up dashboards

### 6.3 Configure Uptime Monitoring

Use services like:
- UptimeRobot
- Pingdom
- StatusCake

Monitor:
- Homepage availability
- API endpoint availability
- Response times

## Step 7: Database Migration

### 7.1 Run Production Migrations

If you have migrations:
1. Connect to production database
2. Run migration scripts
3. Verify tables created
4. Verify data integrity

### 7.2 Verify RLS Policies

1. Test with production user
2. Verify RLS policies work
3. Test data isolation

## Step 8: Push Notifications Setup

### 8.1 Verify Service Worker

1. Check service worker is registered
2. Verify `sw.js` is accessible
3. Test push notification subscription

### 8.2 Set Up Notification Sender

Create a cron job or scheduled task to:
1. Query `notification_queue` table
2. Send pending notifications
3. Update notification status

Example (using Node.js cron):

```javascript
const cron = require('node-cron');
const webpush = require('web-push');

// Run every hour
cron.schedule('0 * * * *', async () => {
  // Get pending notifications
  // Send notifications
  // Update status
});
```

## Step 9: Mobile App Deployment (If Applicable)

### 9.1 iOS App Store

1. Build production iOS app
2. Submit to App Store
3. Complete App Store listing
4. Wait for review

### 9.2 Google Play Store

1. Build production Android app
2. Create app bundle
3. Submit to Play Store
4. Complete Play Store listing
5. Wait for review

## Step 10: Final Checks

### 10.1 Documentation

- [ ] Update README with production URL
- [ ] Update API documentation
- [ ] Update user guides

### 10.2 Communication

- [ ] Prepare launch announcement
- [ ] Notify users (if applicable)
- [ ] Update social media
- [ ] Prepare support team

### 10.3 Support Setup

- [ ] Support email configured
- [ ] Support team briefed
- [ ] Common issues documented
- [ ] Escalation process defined

## Troubleshooting

### Build Fails

1. Check environment variables
2. Check Node.js version
3. Review build logs
4. Check for dependency issues

### Deployment Fails

1. Check hosting platform logs
2. Verify environment variables
3. Check build output
4. Review error messages

### App Not Working After Deployment

1. Check environment variables are set
2. Verify database connection
3. Check API endpoints
4. Review error logs
5. Check browser console

### Performance Issues

1. Enable caching
2. Optimize images
3. Check database queries
4. Review API response times
5. Consider CDN

## Rollback Procedure

If critical issues are found:

1. **Immediate Rollback**
   ```bash
   # Vercel
   vercel rollback
   
   # Netlify
   netlify rollback
   ```

2. **Disable Features** (if needed)
   - Disable problematic features
   - Add maintenance mode

3. **Investigate**
   - Review error logs
   - Identify root cause
   - Fix issues

4. **Re-deploy**
   - Test fixes thoroughly
   - Deploy fixes
   - Monitor closely

## Post-Launch Checklist

### First 24 Hours

- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Monitor user registrations
- [ ] Monitor payments
- [ ] Address immediate issues
- [ ] Respond to user feedback

### First Week

- [ ] Review analytics
- [ ] Gather user feedback
- [ ] Identify improvement areas
- [ ] Plan first update
- [ ] Optimize based on data

### First Month

- [ ] Review overall performance
- [ ] Analyze user behavior
- [ ] Plan feature improvements
- [ ] Optimize costs
- [ ] Scale infrastructure if needed

## Support Resources

- **Documentation**: See project README
- **Error Tracking**: Sentry dashboard
- **Analytics**: Analytics dashboard
- **Support**: Support email/chat

---

**Last Updated**: December 24, 2025  
**Version**: 1.0.0
