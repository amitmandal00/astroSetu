# AstroSetu Mobile App - Setup Guide

## Prerequisites

### Required Software
- **Node.js** >= 18
- **npm** or **yarn**
- **React Native CLI** (will be installed automatically)

### For Android Development
- **Android Studio** (latest version)
- **Android SDK** (API level 30+)
- **Java Development Kit (JDK)** 11 or higher
- **Android Emulator** or physical device

### For iOS Development (macOS only)
- **Xcode** (latest version)
- **CocoaPods**: `sudo gem install cocoapods`
- **iOS Simulator** or physical device

## Quick Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

Or use the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

### 2. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Start Metro Bundler

```bash
npm start
```

### 4. Run the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## Environment Configuration

### Create `.env` file

Create a `.env` file in the `mobile/` directory:

```env
API_BASE_URL=http://localhost:3001/api
RAZORPAY_KEY_ID=your_razorpay_key_id
```

For production:
```env
API_BASE_URL=https://your-domain.com/api
RAZORPAY_KEY_ID=your_production_razorpay_key_id
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── auth/        # Login, Register, OTP
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
├── App.tsx               # Root component
├── index.js              # Entry point
└── package.json
```

## Development

### Running on Physical Device

**Android:**
1. Enable USB debugging on your device
2. Connect device via USB
3. Run: `npm run android`

**iOS:**
1. Connect iPhone via USB
2. Trust the computer on your iPhone
3. Run: `npm run ios`
4. Select your device from the list

### Debugging

- **React Native Debugger**: Install from [here](https://github.com/jhen0409/react-native-debugger)
- **Chrome DevTools**: Shake device → "Debug"
- **Flipper**: Integrated debugging tool

### Common Issues

#### Metro bundler port already in use
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

#### Android build fails
```bash
cd android
./gradlew clean
cd ..
npm run android
```

#### iOS build fails
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

#### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --reset-cache
```

## Building for Production

### Android APK

```bash
cd android
./gradlew assembleRelease
# APK will be in android/app/build/outputs/apk/release/
```

### Android AAB (for Play Store)

```bash
cd android
./gradlew bundleRelease
# AAB will be in android/app/build/outputs/bundle/release/
```

### iOS Archive (for App Store)

1. Open `ios/AstroSetu.xcworkspace` in Xcode
2. Select "Any iOS Device" as target
3. Product → Archive
4. Distribute App → App Store Connect

## Testing

### Run Tests

```bash
npm test
```

### E2E Testing

We recommend using:
- **Detox** for E2E testing
- **Jest** for unit tests
- **React Native Testing Library** for component tests

## API Integration

The mobile app connects to the Next.js backend API. Make sure:

1. Backend server is running on `http://localhost:3001`
2. API endpoints are accessible
3. CORS is configured for mobile app origin

### Testing API Connection

Update `src/constants/config.ts`:

```typescript
export const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:3001/api'  // Use your local IP for physical device
  : 'https://your-domain.com/api';
```

To find your local IP:
- **macOS/Linux**: `ifconfig | grep "inet "`
- **Windows**: `ipconfig`

## Troubleshooting

### Android: "SDK location not found"
Set `ANDROID_HOME` environment variable:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### iOS: "Command PhaseScriptExecution failed"
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Metro bundler cache issues
```bash
npm start -- --reset-cache
```

## Next Steps

1. ✅ Complete remaining screen implementations
2. ✅ Add Razorpay payment integration
3. ✅ Implement push notifications
4. ✅ Add multilingual support
5. ✅ Complete report viewing screens
6. ✅ Add video call integration

## Support

For issues or questions:
- Check the main project README
- Review React Native documentation
- Check GitHub issues

---

**Happy Coding! 🚀**

