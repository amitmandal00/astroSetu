# AstroSetu - Prioritized Next Tasks

## 📊 Current State Assessment

### ✅ What's Already Built (Strong Foundation)
- **UI/UX**: Complete, polished, Indian spiritual theme
- **Core Astrology Features**: All 7 features functional (Kundli, Match, Horoscope, Panchang, Muhurat, Numerology, Remedies)
- **User Interface**: Login, Profile, Wallet, Chat UI (all pages exist)
- **AI Insights**: Basic component structure
- **PDF Reports**: Basic generation structure
- **Multilingual**: Structure in place (EN/HI/TA)

### ⚠️ What's Missing (Critical Gaps)
- **Backend Integration**: Currently using mock data
- **Real Authentication**: Demo mode only
- **Payment Gateway**: UI ready, no real integration
- **Database**: No persistence layer
- **Real-time Chat**: Polling-based, not WebSocket
- **Push Notifications**: Not implemented
- **Analytics**: Not implemented
- **CMS**: No content management
- **Mobile Apps**: Web only

---

## 🎯 PRIORITIZED TASK PLAN

### PHASE 1: MVP Production Readiness (7-10 Days) ⚡ FAST TRACK
**Goal**: Launch a functional, monetizable web app

#### Task 1.1: Database & Auth Setup ⚡ CRITICAL
**Priority**: P0 (Blocks everything else)
**Effort**: 2 days (using Supabase/QuickDB)
**Revenue Impact**: High (enables all paid features)

**What to Build:**
- [ ] Quick database setup (Supabase free tier - 5 min setup)
  - Users table (email, name, phone, birth_details JSON)
  - Transactions table (user_id, amount, type, description)
  - Saved_reports table (user_id, type, data JSON)
- [ ] Replace in-memory store with Supabase
  - Update `/lib/store.ts` to use Supabase client
  - Update auth to use Supabase Auth (built-in!)
- [ ] Real astrology API integration (1 day)
  - Sign up for Prokerala API (free tier available)
  - Replace mock `astrologyEngine.ts` with real API calls
  - Test all 7 astrology features

**Deliverables:**
- Supabase database connected
- Real authentication working
- All astrology features using real API
- Data persistence working

---

#### Task 1.2: Payment Gateway Integration 💰 HIGH PRIORITY
**Priority**: P0 (Direct revenue enabler)
**Effort**: 1 day (Razorpay is very quick)
**Revenue Impact**: Critical (enables monetization)

**What to Build:**
- [ ] Razorpay setup (30 min)
  - Create Razorpay account
  - Get API keys
  - Install `razorpay` npm package
- [ ] Wallet recharge (2 hours)
  - Create order API endpoint
  - Payment success callback
  - Update wallet balance in Supabase
- [ ] Payment gating (2 hours)
  - Check wallet balance before PDF download
  - Check balance before chat session
  - Auto-debit on service use

**Deliverables:**
- Wallet recharge working
- Payment gating on paid features
- Transaction history saved

---

#### Task 1.3: Chat Backend (Keep Polling for MVP) 💬 MEDIUM PRIORITY
**Priority**: P1 (Core monetization feature)
**Effort**: 1 day (enhance existing polling)
**Revenue Impact**: High (main revenue driver)

**What to Build:**
- [ ] Enhance existing chat (polling is fine for MVP!)
  - Save messages to Supabase
  - Track session start/end time
  - Calculate duration
- [ ] Per-minute billing (2 hours)
  - On session end: calculate minutes
  - Auto-debit from wallet
  - Save transaction
- [ ] WebSocket can come later (not needed for MVP)

**Deliverables:**
- Chat working with persistence
- Billing integrated
- Session tracking complete

---

#### Task 1.4: PDF Report Generation 📄 LOW PRIORITY (Can skip for MVP)
**Priority**: P2 (Nice to have)
**Effort**: 1 day (or skip, use browser print)
**Revenue Impact**: Medium (paid feature)

**What to Build:**
- [ ] Quick solution: Use browser print (0 effort)
  - Add "Print" button that triggers `window.print()`
  - User can save as PDF
- [ ] OR: Simple PDF generation (if time permits)
  - Use `react-to-pdf` or `jspdf` (client-side)
  - Basic template with results
  - Download button

**Deliverables:**
- PDF download working (even if basic)
- Payment gating (check wallet before download)

---

### PHASE 2: Engagement & Retention (Weeks 5-8)
**Goal**: Increase daily active users and session time

#### Task 2.1: Push Notification System 🔔 HIGH PRIORITY
**Priority**: P1 (Retention driver)
**Effort**: 1 week
**Revenue Impact**: Medium (increases engagement → conversions)

**What to Build:**
- [ ] Notification service setup
  - Firebase Cloud Messaging (FCM) for web
  - OneSignal or similar for cross-platform
- [ ] Notification triggers
  - Daily horoscope reminders
  - Weekly predictions
  - Astrological events (e.g., "Today is Ekadashi")
  - Personalized insights ("Your Mars transit starts today")
- [ ] Notification preferences
  - User settings for notification types
  - Quiet hours
  - Frequency controls

**Deliverables:**
- Push notifications working
- User preference management
- Notification analytics

---

#### Task 2.2: Content Management System (CMS) 📝 MEDIUM PRIORITY
**Priority**: P2 (Content scalability)
**Effort**: 1 week
**Revenue Impact**: Low (enables content scaling)

**What to Build:**
- [ ] Admin dashboard
  - Content creation interface
  - Horoscope management
  - Event calendar management
  - Article/blog management
- [ ] Content API
  - CRUD operations for content
  - Versioning
  - Scheduling (publish later)
- [ ] Content types
  - Daily horoscopes
  - Articles/tutorials
  - Astrological events
  - Puja descriptions

**Deliverables:**
- Admin CMS interface
- Content API
- Content management workflow

---

#### Task 2.3: Gamification & Streaks 🎮 MEDIUM PRIORITY
**Priority**: P2 (Engagement booster)
**Effort**: 3-4 days
**Revenue Impact**: Medium (increases retention)

**What to Build:**
- [ ] Daily horoscope streak tracking
  - User streak counter
  - Streak badges/achievements
  - Streak recovery (missed day handling)
- [ ] Achievement system
  - "First Kundli Generated"
  - "10 Consultations Completed"
  - "Monthly Active User"
- [ ] Progress indicators
  - Visual streak display
  - Achievement showcase

**Deliverables:**
- Streak tracking system
- Achievement badges
- User progress dashboard

---

### PHASE 3: AI & Intelligence (Weeks 9-12)
**Goal**: Add intelligent features that differentiate from competitors

#### Task 3.1: AI-Powered Insights Enhancement 🤖 HIGH PRIORITY
**Priority**: P1 (Unique selling point)
**Effort**: 2 weeks
**Revenue Impact**: High (premium feature)

**What to Build:**
- [ ] Enhanced AI insights
  - Integrate with LLM API (OpenAI/Anthropic/Open-source)
  - Context-aware predictions
  - Personalized summaries
- [ ] Tiered access
  - Free: Basic insights
  - Paid: Deep analysis + downloadable
- [ ] AI chat enhancement
  - Better astrology-specific responses
  - Context from user's Kundli
  - Natural language queries

**Deliverables:**
- Enhanced AI insights
- Premium tier implementation
- Improved chatbot

---

#### Task 3.2: Predictive Analytics Backend 📊 MEDIUM PRIORITY
**Priority**: P2 (Business intelligence)
**Effort**: 2 weeks
**Revenue Impact**: Medium (optimizes monetization)

**What to Build:**
- [ ] Data collection layer
  - User behavior tracking
  - Feature usage analytics
  - Conversion funnel tracking
- [ ] Analytics models
  - Churn prediction
  - Conversion likelihood
  - Best time to send notifications
  - Popular astrologer ranking
- [ ] Analytics dashboard
  - Business metrics
  - User insights
  - Revenue analytics

**Deliverables:**
- Analytics data pipeline
- Predictive models
- Business dashboard

---

### PHASE 4: Mobile Apps (Weeks 13-20)
**Goal**: Expand to iOS and Android

#### Task 4.1: Mobile App Architecture 📱 HIGH PRIORITY
**Priority**: P1 (Market expansion)
**Effort**: 2 weeks
**Revenue Impact**: High (new user acquisition)

**What to Build:**
- [ ] React Native setup (or Flutter)
  - Shared codebase with web
  - Platform-specific optimizations
- [ ] API integration
  - Reuse existing backend APIs
  - Mobile-specific endpoints if needed
- [ ] Native features
  - Push notifications (native)
  - In-app purchases
  - Biometric auth
  - Offline mode (cached data)

**Deliverables:**
- Mobile app structure
- Core features working
- App store ready

---

#### Task 4.2: Mobile-Specific Features 📲 MEDIUM PRIORITY
**Priority**: P2 (Mobile optimization)
**Effort**: 1 week
**Revenue Impact**: Medium (better UX)

**What to Build:**
- [ ] Widget support (iOS/Android)
  - Daily horoscope widget
  - Quick Kundli access
- [ ] Deep linking
  - Share Kundli links
  - Notification deep links
- [ ] Mobile payments
  - Google Pay / Apple Pay
  - In-app purchase for subscriptions

**Deliverables:**
- Mobile widgets
- Deep linking
- Mobile payment integration

---

## 🎯 IMMEDIATE NEXT STEPS (This Week)

### Week 1 Focus: Backend Foundation

**Day 1-2: Database & API Setup**
1. Choose database (PostgreSQL recommended)
2. Design schema for all entities
3. Set up database connection
4. Create migration scripts

**Day 3-4: Authentication**
1. Implement JWT-based auth
2. Create login/register endpoints
3. Session management
4. Password reset flow

**Day 5: Astrology API Integration**
1. Choose provider (Prokerala/AstroAPI)
2. Create abstraction layer
3. Replace mock engine with real API
4. Test all astrology features

**Weekend: Testing & Documentation**
1. End-to-end testing
2. API documentation
3. Deployment preparation

---

## 💡 Quick Wins (Can Do in Parallel)

These can be done alongside main tasks:

1. **Email Service Integration** (2 days)
   - Send PDF reports via email
   - Welcome emails
   - Password reset emails

2. **Search & Filters Enhancement** (2 days)
   - Better astrologer search
   - Content search
   - Advanced filters

3. **Social Sharing** (1 day)
   - Share Kundli results
   - Share horoscope
   - Social media integration

4. **Error Tracking** (1 day)
   - Sentry integration
   - Error logging
   - Performance monitoring

---

## 📈 Success Metrics to Track

### Phase 1 (MVP Launch)
- [ ] User registration rate
- [ ] Kundli generation completion rate
- [ ] Payment conversion rate
- [ ] Chat session completion rate

### Phase 2 (Engagement)
- [ ] Daily active users (DAU)
- [ ] Push notification open rate
- [ ] Streak retention rate
- [ ] Session duration

### Phase 3 (Intelligence)
- [ ] AI insights usage
- [ ] Premium conversion rate
- [ ] Predictive model accuracy
- [ ] Revenue per user

### Phase 4 (Mobile)
- [ ] Mobile app downloads
- [ ] Mobile user retention
- [ ] In-app purchase rate
- [ ] Mobile vs web usage split

---

## 🚀 FAST TRACK MVP PLAN (7-10 Days)

### Day 1-2: Database & Auth
- [ ] Setup Supabase (free tier) - 30 min
- [ ] Create tables (Users, Transactions, SavedReports) - 1 hour
- [ ] Replace in-memory store with Supabase - 4 hours
- [ ] Setup Supabase Auth (built-in, just configure) - 1 hour
- [ ] Test authentication flow - 1 hour

### Day 3: Astrology API Integration
- [ ] Sign up for Prokerala API (free tier) - 15 min
- [ ] Replace mock engine with real API - 4 hours
- [ ] Test all 7 features - 2 hours

### Day 4: Payment Integration
- [ ] Razorpay account setup - 30 min
- [ ] Wallet recharge flow - 3 hours
- [ ] Payment gating on features - 2 hours
- [ ] Test payment flow - 1 hour

### Day 5: Chat Enhancement
- [ ] Save messages to Supabase - 2 hours
- [ ] Session billing logic - 3 hours
- [ ] Test chat + billing - 1 hour

### Day 6-7: Testing & Polish
- [ ] End-to-end testing
- [ ] Fix bugs
- [ ] Deploy to Vercel (free tier)
- [ ] Basic analytics (Google Analytics - 30 min)

### Day 8-10: Buffer (if needed)
- [ ] Any remaining fixes
- [ ] Documentation
- [ ] Launch preparation

**Total: 7-10 days for fully functional MVP!**

---

## 📝 Notes

- All tasks assume you have a backend developer or are comfortable with backend work
- Consider using Next.js API routes for MVP, then migrate to separate backend later
- Use managed services (Supabase, Firebase) to speed up development
- Focus on web first, mobile later (unless mobile is primary target)
- Test payment flows thoroughly before launch
- Implement analytics from day 1 (even basic Google Analytics)

---

**Last Updated**: Based on current codebase review and strategy notes
**Next Review**: After Phase 1 completion

