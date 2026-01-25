# 🚀 AstroSetu - Deployment Guide

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables configured
- [ ] All features tested locally
- [ ] No console errors
- [ ] Database tables created in Supabase
- [ ] RLS policies enabled
- [ ] Build succeeds: `npm run build`

---

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Code
```bash
# Make sure code is committed to Git
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up / Log in with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./astrosetu` (if repo is in parent folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Add Environment Variables
In Vercel dashboard → Your Project → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (optional)

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your-secret-key

# Prokerala (Optional)
PROKERALA_API_KEY=your-api-key

# App Config
NEXT_PUBLIC_APP_NAME=AstroSetu
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-app.vercel.app`

### Step 5: Configure Custom Domain (Optional)
1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

---

## Option 2: Deploy to Netlify

### Step 1: Prepare Your Code
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Netlify
1. Go to https://netlify.com
2. Sign up / Log in with GitHub
3. Click **"Add New Site"** → **"Import an existing project"**
4. Select your repository
5. Configure:
   - **Base directory**: `astrosetu` (if needed)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Step 3: Add Environment Variables
In Netlify dashboard → Site Settings → Environment Variables:

Add all the same variables as Vercel (see above)

### Step 4: Deploy
1. Click **"Deploy site"**
2. Wait for build to complete
3. Your app will be live at `https://your-app.netlify.app`

---

## Option 3: Deploy to Your Own Server

### Requirements
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt)

### Step 1: Build the App
```bash
cd astrosetu
npm install
npm run build
```

### Step 2: Set Environment Variables
Create `.env.production`:
```bash
# Copy all variables from .env.local
# Update NEXT_PUBLIC_APP_URL to your domain
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 3: Start with PM2
```bash
npm install -g pm2
pm2 start npm --name "astrosetu" -- start
pm2 save
pm2 startup
```

### Step 4: Configure Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 5: Set Up SSL
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## Post-Deployment

### 1. Update Razorpay Webhook (If Using)
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`

### 2. Update Supabase Redirect URLs
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to **Redirect URLs**
3. Add to **Site URL**

### 3. Test Everything
- [ ] User registration/login
- [ ] Kundli generation
- [ ] Payment flow
- [ ] Chat functionality
- [ ] All astrology features

### 4. Set Up Monitoring
- **Error Tracking**: Sentry (https://sentry.io)
- **Analytics**: Google Analytics or Plausible
- **Uptime Monitoring**: UptimeRobot or Pingdom

### 5. Set Up Backups
- **Database**: Supabase has automatic backups (paid tier)
- **Code**: GitHub is your backup
- **Environment Variables**: Store securely (1Password, etc.)

---

## Troubleshooting

### Build Fails
- Check build logs in deployment platform
- Verify all environment variables are set
- Ensure `npm run build` works locally

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify RLS policies are enabled

### Payment Issues
- Verify Razorpay keys are correct
- Check if using test keys in production
- Verify webhook URL is configured

### Performance Issues
- Enable Vercel/Netlify caching
- Optimize images
- Check database query performance

---

## Production Checklist

- [ ] All environment variables configured
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Database backups enabled
- [ ] Error tracking set up
- [ ] Analytics configured
- [ ] Webhook URLs updated
- [ ] All features tested in production
- [ ] Performance optimized
- [ ] SEO meta tags configured

---

## Support

If you encounter issues:
1. Check deployment logs
2. Check browser console for errors
3. Verify environment variables
4. Test locally first
5. Check service status (Supabase, Razorpay)

---

**Ready to launch! 🚀**

