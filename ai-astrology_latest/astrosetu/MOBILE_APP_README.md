# AstroSetu Mobile App

React Native mobile application for AstroSetu, inspired by AstroSage and AstroTalk mobile apps.

## 📱 Overview

The AstroSetu mobile app provides a complete astrology platform on iOS and Android, featuring:

- 🔮 **Kundli Generation** - Complete birth chart analysis
- 💑 **Marriage Match** - Compatibility analysis
- 📅 **Horoscope** - Daily, Weekly, Monthly, Yearly
- 👨‍🏫 **Astrologer Consultations** - Chat, Voice, Video
- 📿 **Panchang** - Hindu calendar & auspicious timings
- 🔢 **Numerology** - Life path calculations
- 💰 **E-Wallet** - Secure payment system
- 🌐 **Multilingual** - English, Hindi, Tamil

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

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

## 📚 Documentation

- **[Setup Guide](mobile/README_SETUP.md)** - Detailed setup instructions
- **[Development Guide](mobile/MOBILE_APP_GUIDE.md)** - Development workflow
- **[Implementation Summary](mobile/MOBILE_APP_SUMMARY.md)** - Current status

## 🏗️ Architecture

### Tech Stack
- **React Native** 0.72.6
- **TypeScript**
- **React Navigation** 6.x
- **Axios** for API calls
- **AsyncStorage** for local storage

### Project Structure
```
mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services
│   ├── context/          # React Context
│   ├── theme/            # Theme provider
│   └── constants/        # Config
├── App.tsx               # Root component
└── package.json
```

## 🎨 Design

The app features an **Indian Spiritual Theme** with:
- Saffron (#F97316) and Orange (#FB923C) primary colors
- Gold (#F59E0B) accents
- Om symbol (ॐ) branding
- Modern, clean UI with gradients

## 🔌 API Integration

The mobile app connects to the Next.js backend API:
- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-domain.com/api`

All API endpoints are shared with the web app for consistency.

## 📋 Features Status

### ✅ Completed
- Project structure and configuration
- Navigation system
- Authentication (Login, Register, OTP)
- Home screen
- Kundli generation with place autocomplete
- Theme system
- API service layer

### 🚧 In Progress
- Remaining screen implementations
- Payment integration
- Push notifications
- Video/voice calls

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📦 Building

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

## 🤝 Contributing

See the main project README for contribution guidelines.

## 📄 License

Private - AstroSetu

---

**Built with ❤️ for the Indian astrology community**

