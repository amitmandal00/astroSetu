# 🚀 AstroSetu - Quick Setup Guide

## Step 1: Configure Supabase (5 minutes)

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Name**: `astrosetu` (or any name)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users (e.g., `Mumbai` for India)
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

### 1.2 Get API Keys
1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGci...`)

### 1.3 Set Up Database Tables
1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy and paste the SQL from `SUPABASE_SETUP.md` (or run the migration script)
4. Click **Run** to create all tables

### 1.4 Enable Row Level Security (RLS)
The SQL script should already include RLS policies. Verify in:
- **Authentication** → **Policies** → Check that policies exist for all tables

---

## Step 2: Configure Razorpay (10 minutes)

### 2.1 Create Razorpay Account
1. Go to https://razorpay.com
2. Sign up / Log in
3. Complete business verification (for live mode)
4. For testing, you can use test mode immediately

### 2.2 Get API Keys
1. Go to **Settings** → **API Keys**
2. Click **Generate Test Key** (for development)
3. Copy:
   - **Key ID** (starts with `rzp_test_...`)
   - **Key Secret** (starts with `...` - shown only once, save it!)

### 2.3 For Production (Later)
1. Complete business verification
2. Generate **Live Keys**
3. Update environment variables with live keys

---

## Step 3: Configure Prokerala API (Optional - 5 minutes)

### 3.1 Sign Up
1. Go to https://www.prokerala.com/api/
2. Sign up for free account
3. Verify email

### 3.2 Get API Key
1. Go to **Dashboard** → **API Keys**
2. Copy your **API Key**
3. Note: Free tier has rate limits, but sufficient for MVP

---

## Step 4: Update Environment Variables

### 4.1 Create/Update `.env.local`
In your project root (`astrosetu/.env.local`), add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (optional, for admin operations)

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Prokerala API (Optional)
PROKERALA_API_KEY=your-api-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=AstroSetu
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4.2 Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 5: Verify Configuration

### 5.1 Test Supabase Connection
1. Open browser console (F12)
2. Go to any page that uses auth (e.g., `/login`)
3. Check console for Supabase connection errors
4. Try registering a new user

### 5.2 Test Razorpay
1. Go to `/wallet`
2. Click "Recharge Wallet"
3. Enter test amount (e.g., ₹100)
4. Use Razorpay test card:
   - **Card**: `4111 1111 1111 1111`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **Name**: Any name

### 5.3 Test Astrology API
1. Go to `/kundli`
2. Generate a Kundli
3. Check if real API is used (or mock data if Prokerala not configured)

---

## Step 6: Deployment Checklist

### Before Deploying
- [ ] All environment variables configured
- [ ] All features tested locally
- [ ] No console errors
- [ ] Database tables created
- [ ] RLS policies enabled

### Deploy to Vercel
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Deploy to Netlify
1. Push code to GitHub
2. Go to https://netlify.com
3. Import your repository
4. Add environment variables in Netlify dashboard
5. Deploy!

---

## Troubleshooting

### Supabase Connection Issues
- Check if URL and keys are correct
- Verify RLS policies are enabled
- Check browser console for specific errors

### Razorpay Payment Fails
- Verify Key ID and Secret are correct
- Check if using test keys in test mode
- Verify webhook URL is configured (for production)

### Prokerala API Errors
- Check API key is correct
- Verify rate limits not exceeded
- App will fallback to mock data automatically

---

## Next Steps After Setup

1. **Test All Features** - Run through `FINAL_TESTING_CHECKLIST.md`
2. **Deploy** - Push to production
3. **Monitor** - Set up error tracking (Sentry)
4. **Analytics** - Add Google Analytics or similar

---

**Need Help?** Check the detailed guides:
- `SUPABASE_SETUP.md` - Complete Supabase setup
- `RAZORPAY_SETUP.md` - Complete Razorpay setup
- `PROKERALA_SETUP.md` - Complete Prokerala setup

