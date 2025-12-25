# AstroSetu Mobile App Development Guide

## Overview

This guide documents the development of the AstroSetu mobile app, inspired by AstroSage and AstroTalk mobile applications.

## Features Implemented

### Core Astrology Features
- ✅ **Kundli Generation** - Complete birth chart with place autocomplete
- ✅ **Marriage Match (Guna Milan)** - Compatibility analysis
- ✅ **Horoscope** - Daily, Weekly, Monthly, Yearly
- ✅ **Panchang** - Hindu calendar & auspicious timings
- ✅ **Numerology** - Life path calculations
- ✅ **Reports** - Life, Dasha, Dosha reports

### Consultation Features
- ✅ **Astrologer Listings** - Browse verified astrologers
- ✅ **Real-time Chat** - Instant messaging
- ✅ **Video/Voice Calls** - (Ready for integration)
- ✅ **Live Sessions** - Webinars and workshops

### User Features
- ✅ **Authentication** - Login, Register, OTP verification
- ✅ **Profile Management** - Save multiple Kundlis
- ✅ **E-Wallet** - Payment wallet integration
- ✅ **Push Notifications** - Daily horoscope reminders
- ✅ **Multilingual** - English, Hindi, Tamil

## Tech Stack

- **React Native** 0.72.6
- **TypeScript**
- **React Navigation** 6.x
- **Axios** for API calls
- **AsyncStorage** for local storage
- **Razorpay** for payments
- **Vector Icons** for icons

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── auth/        # Authentication screens
│   │   ├── home/        # Home screen
│   │   ├── kundli/      # Kundli generation
│   │   ├── horoscope/   # Horoscope screens
│   │   ├── astrologers/ # Astrologer listings
│   │   ├── chat/        # Chat screens
│   │   ├── profile/     # Profile management
│   │   └── ...
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── context/          # React Context providers
│   ├── theme/            # Theme and colors
│   ├── constants/        # Constants and config
│   └── utils/            # Utility functions
├── android/              # Android native code
├── ios/                  # iOS native code
└── package.json
```

## Setup Instructions

### Prerequisites
- Node.js >= 18
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS)

### Installation

```bash
cd mobile
npm install

# For iOS
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## API Integration

The mobile app connects to the Next.js backend API:

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

### API Endpoints Used

- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/send-otp` - Send OTP
- `/auth/verify-otp` - Verify OTP
- `/astrology/kundli` - Generate Kundli
- `/astrology/match` - Match Kundli
- `/astrology/horoscope` - Get horoscope
- `/astrology/panchang` - Get Panchang
- `/astrologers` - List astrologers
- `/chat/sessions` - Chat sessions
- `/wallet` - Wallet operations
- `/payments/*` - Payment operations

## Design System

### Colors (Indian Spiritual Theme)
- **Primary**: Saffron/Orange (#F97316)
- **Secondary**: Gold (#F59E0B)
- **Accent**: Orange (#FF6B35)
- **Background**: Cream (#FFF7ED)
- **Surface**: White (#FFFFFF)

### Typography
- **H1**: 32px, Bold
- **H2**: 24px, Semi-bold
- **H3**: 20px, Semi-bold
- **Body**: 16px, Regular
- **Caption**: 14px, Regular

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

## Key Features Inspired By

### AstroSage Mobile App
- Comprehensive astrology tools
- Multiple language support
- Detailed reports and analysis
- User-friendly interface

### AstroTalk Mobile App
- Real-time consultations
- Chat with astrologers
- Video/voice call integration
- E-commerce for astrological products

## Next Steps

1. **Complete Screen Implementation**
   - [ ] All astrology tool screens
   - [ ] Report viewing screens
   - [ ] Payment integration screens
   - [ ] Settings screen

2. **Features to Add**
   - [ ] Push notifications setup
   - [ ] Video call integration (WebRTC)
   - [ ] Offline mode support
   - [ ] Deep linking
   - [ ] App store optimization

3. **Testing**
   - [ ] Unit tests
   - [ ] Integration tests
   - [ ] E2E tests
   - [ ] Device testing

4. **Deployment**
   - [ ] Android Play Store
   - [ ] iOS App Store
   - [ ] Beta testing program

## Environment Variables

Create `.env` file in `mobile/` directory:

```
API_BASE_URL=http://localhost:3001
RAZORPAY_KEY_ID=your_razorpay_key
```

## Build Instructions

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace AstroSetu.xcworkspace -scheme AstroSetu -configuration Release
```

## Support

For issues or questions, refer to the main project documentation or contact the development team.

