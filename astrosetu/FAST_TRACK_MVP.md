# AstroSetu - Fast Track MVP (7-10 Days)

## 🎯 Why This Timeline is Realistic

You already have:
- ✅ Complete UI/UX (all pages built)
- ✅ API route structure (Next.js API routes exist)
- ✅ Frontend components (all working)
- ✅ Mock data layer (just needs real backend)

**What's missing:**
- Database (use Supabase - 30 min setup)
- Real API calls (replace mocks - 1 day)
- Payment integration (Razorpay - 1 day)
- Auth (Supabase Auth - built-in, 1 hour)

---

## 📅 Day-by-Day Breakdown

### **Day 1: Database Setup (4-6 hours)**

**Morning (2 hours):**
1. Create Supabase account (free tier) - 5 min
2. Create new project - 5 min
3. Create tables:
   ```sql
   -- Users (Supabase Auth handles this, but add profile table)
   CREATE TABLE profiles (
     id UUID PRIMARY KEY REFERENCES auth.users(id),
     name TEXT,
     phone TEXT,
     birth_details JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Transactions
   CREATE TABLE transactions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES profiles(id),
     type TEXT, -- 'credit' or 'debit'
     amount INTEGER,
     description TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Saved Reports
   CREATE TABLE saved_reports (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES profiles(id),
     type TEXT, -- 'kundli' or 'match'
     data JSONB,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Chat Sessions
   CREATE TABLE chat_sessions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES profiles(id),
     astrologer_id TEXT,
     status TEXT DEFAULT 'active',
     started_at TIMESTAMP DEFAULT NOW(),
     ended_at TIMESTAMP
   );

   -- Chat Messages
   CREATE TABLE chat_messages (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     session_id UUID REFERENCES chat_sessions(id),
     sender TEXT, -- 'user' or 'astrologer'
     content TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

**Afternoon (2-4 hours):**
1. Install Supabase client: `npm install @supabase/supabase-js`
2. Create `/lib/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   
   export const supabase = createClient(supabaseUrl, supabaseKey)
   ```
3. Update `/lib/store.ts` to use Supabase instead of in-memory
4. Update auth routes to use Supabase Auth

**Result:** Database connected, auth working, data persists!

---

### **Day 2: Astrology API Integration (6-8 hours)**

**Morning (3-4 hours):**
1. Sign up for Prokerala API (https://www.prokerala.com/api/) - free tier available
2. Get API key
3. Create `/lib/astrologyApi.ts`:
   ```typescript
   const PROKERALA_API_KEY = process.env.PROKERALA_API_KEY
   const BASE_URL = 'https://api.prokerala.com/v2/astrology'
   
   export async function getKundli(birthDetails) {
     const response = await fetch(`${BASE_URL}/kundli?${params}`, {
       headers: { 'Authorization': `Bearer ${PROKERALA_API_KEY}` }
     })
     return response.json()
   }
   // Similar for match, horoscope, panchang, etc.
   ```

**Afternoon (3-4 hours):**
1. Replace mock calls in `/src/app/api/astrology/*/route.ts`
2. Map Prokerala response to your types
3. Test all 7 features

**Result:** Real astrology calculations working!

---

### **Day 3: Payment Integration (6-8 hours)**

**Morning (2-3 hours):**
1. Create Razorpay account
2. Get API keys (Key ID + Secret)
3. Install: `npm install razorpay`
4. Create `/lib/razorpay.ts`:
   ```typescript
   import Razorpay from 'razorpay'
   
   export const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID!,
     key_secret: process.env.RAZORPAY_SECRET!
   })
   ```

**Afternoon (4-5 hours):**
1. Create `/api/payments/create-order/route.ts`:
   ```typescript
   // Create Razorpay order
   const order = await razorpay.orders.create({
     amount: amount * 100, // in paise
     currency: 'INR'
   })
   ```
2. Create `/api/payments/verify/route.ts`:
   ```typescript
   // Verify payment signature
   // Update wallet balance in Supabase
   ```
3. Update wallet page to call create-order
4. Add payment success callback
5. Add payment gating to PDF download and chat

**Result:** Payments working, wallet functional!

---

### **Day 4: Chat Enhancement (6 hours)**

**Morning (3 hours):**
1. Update chat messages to save to Supabase
2. Update chat polling to fetch from Supabase
3. Add session tracking (start/end time)

**Afternoon (3 hours):**
1. Calculate session duration
2. On session end: calculate cost (e.g., ₹10/minute)
3. Auto-debit from wallet
4. Save transaction

**Result:** Chat with billing working!

---

### **Day 5: Testing & Deployment (6-8 hours)**

**Morning (4 hours):**
1. End-to-end testing of all flows
2. Test payment flow (use Razorpay test mode)
3. Fix any bugs

**Afternoon (2-4 hours):**
1. Deploy to Vercel (free tier)
   - Connect GitHub repo
   - Add environment variables
   - Deploy
2. Setup domain (optional)
3. Add Google Analytics (30 min)

**Result:** Live, working MVP!

---

### **Day 6-7: Buffer & Polish**

- Fix any issues found
- Add error handling
- Improve error messages
- Basic documentation
- Prepare for launch

---

## 🚀 Quick Start Commands

```bash
# Day 1: Setup Supabase
npm install @supabase/supabase-js

# Day 3: Setup Razorpay
npm install razorpay

# Add to .env.local:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
PROKERALA_API_KEY=your_prokerala_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
```

---

## 💰 Cost Estimate (Free Tier)

- **Supabase**: Free (500MB database, 50K monthly active users)
- **Razorpay**: 2% transaction fee (no setup cost)
- **Prokerala API**: Free tier available (limited requests)
- **Vercel**: Free (hobby plan)
- **Total**: ₹0/month (until you scale)

---

## ✅ MVP Checklist

- [ ] Database connected (Supabase)
- [ ] Authentication working (Supabase Auth)
- [ ] Real astrology API integrated
- [ ] Payment gateway working (Razorpay)
- [ ] Wallet recharge functional
- [ ] Chat with billing working
- [ ] Data persistence (all features save to DB)
- [ ] Deployed to production (Vercel)
- [ ] Basic analytics (Google Analytics)

---

## 🎯 What You'll Have After 7-10 Days

A **fully functional, monetizable MVP** with:
- Real user authentication
- Real astrology calculations
- Working payment system
- Chat with billing
- Data persistence
- Live on production

**Ready to accept real users and payments!**

---

## 📝 Notes

- Use Supabase instead of building your own backend (saves weeks)
- Keep chat polling for MVP (WebSocket can come later)
- Use browser print for PDFs initially (saves time)
- Focus on core features first, polish later
- Test payment flow thoroughly before launch

**This is aggressive but realistic given your existing codebase!**

