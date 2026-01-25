# AstroSetu
**Bridging humans with cosmic guidance**

Production-ready astrology platform benchmarked against and enhanced beyond AstroSage, AstroTalk, AskGanesha, and Vama.

## 🎯 Features (Industry-Leading & Enhanced)

### Core Astrology Features
1. **Kundli Generation** - Complete birth chart with:
   - Enhanced form (Name, Gender, separate date/time fields)
   - Place autocomplete with geocoding
   - Planetary positions, ascendant, rashi, nakshatra, tithi
   - 12-house chart visualization
   - Dosha analysis (Manglik, Kaal Sarp, Shani, Rahu-Ketu)
   - **AI-Powered Insights** (unique feature)
   - PDF report download

2. **Marriage Matching** - Guna Milan (8 categories) + Manglik analysis with:
   - Individual dosha analysis for both persons
   - Combined compatibility assessment
   - Detailed breakdown and guidance

3. **Horoscope** - Daily, Weekly, Monthly, and Yearly predictions for all 12 signs

4. **Panchang** - Hindu calendar with Tithi, Nakshatra, Yoga, Karana, sunrise/sunset

5. **Muhurat** - Auspicious timings for Marriage, Griha Pravesh, Vehicle, Business, Education, Travel

6. **Numerology** - Life Path, Destiny, Soul, and Personality numbers with detailed analysis

7. **Remedies** - Gemstones, Mantras, Rituals for planetary issues

### Consultation & Services
8. **Astrologer Directory** - Browse verified astrologers with ratings, experience, skills, languages
9. **Chat/Call/Video Consultation** - Multiple consultation modes with payment integration
10. **Live Sessions & Webinars** - Educational webinars, classes, and workshops (NEW)
11. **Online Puja Services** - Book pujas with live streaming and prasad delivery (NEW)
12. **Community Forum** - Ask questions, share experiences, discuss astrology (NEW)
13. **Learn Astrology** - Courses, articles, and tutorials from experts (NEW)

### Payment & Wallet
14. **E-Wallet System** - Complete wallet with balance, transactions, and payment methods (NEW)
15. **Payment Integration** - Wallet and Payment Gateway (ready for Razorpay/Stripe)

### AI & Unique Features
16. **AI-Powered Insights** - Personalized analysis for career, relationships, health, finance (UNIQUE)
17. **AI Chatbot Assistant** - 24/7 floating chatbot for instant astrology guidance (UNIQUE)
18. **Multilingual Support** - English, Hindi (हिंदी), Tamil (தமிழ்) (NEW)

### User Features
19. **User Authentication** - Register, login, profile management
20. **Saved Reports** - Save Kundlis and Matches for quick access
21. **PDF Reports** - Download and share reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) Supabase account for database
- (Optional) Razorpay account for payments
- (Optional) Prokerala API key for real astrology data

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure environment variables (see setup guides below)
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open http://localhost:3001

## 📚 Setup Guides

### 1. Supabase Setup (Database & Auth)
See `SUPABASE_SETUP.md` for:
- Creating Supabase project
- Running database schema
- Configuring environment variables

**Note**: App works without Supabase (uses mock data), but real persistence requires Supabase.

### 2. Razorpay Setup (Payments)
See `RAZORPAY_SETUP.md` for:
- Creating Razorpay account
- Getting API keys
- Testing payments

**Note**: App works without Razorpay (mock mode), but real payments require Razorpay.

### 3. Prokerala Setup (Astrology API)
See `PROKERALA_SETUP.md` for:
- Signing up for Prokerala API
- Getting API key
- Configuring environment variables

**Note**: App works without Prokerala (uses mock calculations), but real astrology data requires Prokerala.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Razorpay
- **Astrology API**: Prokerala (with mock fallback)

### Project Structure
```
astrosetu/
├── src/
│   ├── app/              # Next.js pages and API routes
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── ai/          # AI chatbot
│   │   ├── forms/       # Form components
│   │   ├── layout/      # Layout components
│   │   └── payments/    # Payment components
│   ├── lib/             # Utilities and helpers
│   └── types/           # TypeScript types
├── public/              # Static assets
└── docs/               # Documentation
```

## ✅ MVP Status

### Completed Features
- ✅ All 7 core astrology features (Kundli, Match, Horoscope, Panchang, Muhurat, Numerology, Remedies)
- ✅ User authentication (Supabase)
- ✅ Profile management
- ✅ Chat system with real-time updates
- ✅ Payment gateway (Razorpay)
- ✅ Wallet system
- ✅ Enhanced UI/UX with Indian spiritual theme
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Error handling and loading states

### Ready for Production
- ✅ Database integration (Supabase)
- ✅ Payment integration (Razorpay)
- ✅ Astrology API integration (Prokerala)
- ✅ Chat persistence
- ✅ Transaction logging
- ✅ Security (RLS policies, signature verification)

## 🧪 Testing

See `FINAL_TESTING_CHECKLIST.md` for comprehensive testing guide covering:
- All core features
- User flows
- Payment flows
- Chat functionality
- Browser compatibility
- Security checks

## 📖 Documentation

- `SUPABASE_SETUP.md` - Database setup guide
- `RAZORPAY_SETUP.md` - Payment gateway setup
- `PROKERALA_SETUP.md` - Astrology API setup
- `FINAL_TESTING_CHECKLIST.md` - Testing guide
- `DAY1_PROGRESS.md` - Day 1 implementation details
- `DAY2_PROGRESS.md` - Day 2 implementation details
- `DAY3_PROGRESS.md` - Day 3 implementation details
- `DAY4_PROGRESS.md` - Day 4 implementation details
- `DAY5_PROGRESS.md` - Day 5 implementation details

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Environment Variables for Production
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_SECRET=your_razorpay_secret
PROKERALA_API_KEY=your_prokerala_key
```

## 📝 License

Proprietary - All rights reserved

## 🤝 Support

For issues and questions, please refer to the documentation files or create an issue in the repository.

---

**Built with ❤️ for the Indian astrology market**
