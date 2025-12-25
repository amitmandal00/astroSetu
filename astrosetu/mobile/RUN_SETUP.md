# Run Mobile App Setup

## Quick Setup (Recommended)

Run the automated setup script:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native.sh
```

This script will:
1. ✅ Create a new React Native project
2. ✅ Copy all our code into it
3. ✅ Install all dependencies
4. ✅ Set up iOS pods (if on macOS)

## Manual Setup

If you prefer to run commands manually:

### Step 1: Create React Native Project

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npx @react-native-community/cli@latest init AstroSetuMobile --template react-native-template-typescript
```

### Step 2: Copy Our Code

```bash
# Copy source code
cp -r mobile/src AstroSetuMobile/

# Copy configuration files
cp mobile/App.tsx AstroSetuMobile/
cp mobile/index.js AstroSetuMobile/
cp mobile/package.json AstroSetuMobile/
cp mobile/tsconfig.json AstroSetuMobile/
cp mobile/babel.config.js AstroSetuMobile/
cp mobile/metro.config.js AstroSetuMobile/
cp mobile/.eslintrc.js AstroSetuMobile/
```

### Step 3: Install Dependencies

```bash
cd AstroSetuMobile

# Base dependencies
npm install

# React Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-navigation/native-stack

# Storage
npm install @react-native-async-storage/async-storage

# Gesture handler and animations
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens

# UI libraries
npm install react-native-vector-icons react-native-linear-gradient react-native-shimmer-placeholder

# Utilities
npm install axios date-fns

# Payment
npm install react-native-razorpay

# Other features
npm install react-native-image-picker react-native-push-notification react-native-localize i18n-js
```

### Step 4: iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### Step 5: Run the App

```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android

# Or run iOS
npm run ios
```

## Troubleshooting

### Permission Errors

If you get permission errors, try:
```bash
sudo npm install -g react-native-cli
```

Or use npx (recommended):
```bash
npx react-native@latest init AstroSetuMobile
```

### Port Already in Use

If Metro bundler port (8081) is in use:
```bash
lsof -ti:8081 | xargs kill -9
```

### Android Build Fails

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Fails

```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

## What Gets Created

The setup will create:
- `AstroSetuMobile/` - New React Native project
  - `android/` - Android native project
  - `ios/` - iOS native project
  - `src/` - Our TypeScript code (copied)
  - `App.tsx` - Root component (copied)
  - All configuration files (copied)

## After Setup

1. ✅ Test authentication flow
2. ✅ Test Kundli generation
3. ✅ Test API connectivity
4. ✅ Complete remaining screens
5. ✅ Add features (payments, notifications, etc.)

---

**Ready to go!** 🚀

