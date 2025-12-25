# 🚀 Step-by-Step Setup & Testing

Follow these steps in order to set up and test AstroSetu.

---

## Step 1: Check Current Status

Let's verify what's already set up:

```bash
cd astrosetu

# Check if .env.local exists
ls -la .env.local

# Check if server is running
curl http://localhost:3001
```

---

## Step 2: Configure APIs (Choose One)

### Option A: Quick Setup (Mock Mode - No APIs)
Skip API configuration and use mock mode. App will work immediately!

```bash
# Just create .env.local with app name
echo "NEXT_PUBLIC_APP_NAME=AstroSetu" > .env.local
echo "NEXT_PUBLIC_TAGLINE=Bridging humans with cosmic guidance" >> .env.local
```

### Option B: Interactive Setup (Recommended)
Run the interactive setup script:

```bash
./setup-apis.sh
```

This will guide you through:
- Supabase setup
- Razorpay setup  
- Prokerala setup (optional)

### Option C: Manual Setup
1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your API keys (see `API_CONFIGURATION_GUIDE.md`)

---

## Step 3: Set Up Supabase Database (If Using Supabase)

If you configured Supabase in Step 2:

1. Go to https://supabase.com and log in
2. Open your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy entire SQL from `SUPABASE_SETUP.md`
6. Paste and click **Run**
7. Verify 5 tables are created

**Note**: Skip this if using mock mode.

---

## Step 4: Start Development Server

```bash
npm run dev
```

Server will start on http://localhost:3001

Wait for: `✓ Ready in X.Xs`

---

## Step 5: Run Automated Tests

In a new terminal:

```bash
cd astrosetu
./test-app.sh
```

This will test:
- Home page loading
- API endpoints
- Basic functionality

---

## Step 6: Manual Testing

Open http://localhost:3001 in your browser and test:

### Quick Test (5 minutes)
- [ ] Home page loads
- [ ] Click "Generate Kundli" - form appears
- [ ] Fill form and generate Kundli
- [ ] Navigate to "Horoscope" - displays
- [ ] Navigate to "Wallet" - page loads
- [ ] Click "Add Money" - modal opens

### Full Test (30 minutes)
Follow `FINAL_TESTING_CHECKLIST.md` for comprehensive testing.

---

## Step 7: Verify Configuration

### Check Supabase (if configured)
1. Go to Supabase dashboard
2. Check Table Editor → `profiles` table
3. Register a user in the app
4. Verify user appears in Supabase

### Check Razorpay (if configured)
1. Go to Wallet page
2. Click "Add Money"
3. Enter amount
4. Verify Razorpay checkout opens (not mock)

### Check Prokerala (if configured)
1. Generate a Kundli
2. Check browser console for API calls
3. Verify results are from real API

---

## Step 8: Fix Any Issues

### Common Issues:

**Server won't start:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
npm run dev -- -p 3002
```

**API errors:**
- Check `.env.local` has correct keys
- Verify API keys are valid
- Check browser console for errors

**Database errors:**
- Verify Supabase SQL schema was run
- Check Supabase dashboard for errors

---

## Step 9: Production Deployment (When Ready)

### Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables for Production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_SECRET`
- `PROKERALA_API_KEY` (optional)

---

## ✅ Success Checklist

After completing all steps, you should have:

- [ ] Server running on http://localhost:3001
- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] Core features functional (Kundli, Match, Horoscope, etc.)
- [ ] APIs configured (or mock mode working)
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## 🎯 Next Actions

1. **If everything works**: You're ready to deploy!
2. **If issues found**: Check troubleshooting in `QUICK_START_GUIDE.md`
3. **For detailed testing**: Follow `FINAL_TESTING_CHECKLIST.md`

---

**Ready to start?** Begin with Step 1 above! 🚀

