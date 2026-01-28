# Quick Run Guide

## Prerequisites

1. ✅ React Native project initialized (run `./init-react-native.sh` first)
2. ✅ Android Studio installed (for Android)
3. ✅ Xcode installed (for iOS, macOS only)
4. ✅ Android emulator running OR physical device connected

## Quick Start

### Option 1: Use Helper Script (Recommended)

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile

# Start Metro bundler only
./start-dev.sh metro

# Or start Metro + run Android (in one command)
./start-dev.sh android

# Or start Metro + run iOS (in one command)
./start-dev.sh ios
```

### Option 2: Manual Commands

#### Terminal 1: Start Metro Bundler

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
npm start
```

#### Terminal 2: Run Android

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
npm run android
```

#### Terminal 2: Run iOS (macOS only)

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
npm run ios
```

## Troubleshooting

### Metro Port Already in Use

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use the script
./start-dev.sh metro
```

### Android: No Device Found

1. Start Android emulator from Android Studio
2. Or connect physical device via USB
3. Enable USB debugging on device
4. Check: `adb devices`

### iOS: Build Fails

```bash
cd ios
pod install
cd ..
npm run ios
```

### Clear Cache and Restart

```bash
# Clear Metro cache
npm start -- --reset-cache

# Clear Android build
cd android
./gradlew clean
cd ..

# Clear iOS build
cd ios
rm -rf build
pod deintegrate
pod install
cd ..
```

## Development Workflow

1. **Start Metro bundler** (Terminal 1)
   ```bash
   npm start
   ```

2. **Run app** (Terminal 2)
   ```bash
   npm run android  # or npm run ios
   ```

3. **Make changes** - Hot reload will update automatically

4. **Debug**
   - Shake device → "Debug"
   - Or use React Native Debugger
   - Or use Chrome DevTools

## Common Commands

```bash
# Start Metro
npm start

# Run Android
npm run android

# Run iOS
npm run ios

# Run tests
npm test

# Lint code
npm run lint

# Clear cache
npm start -- --reset-cache
```

## Tips

- Keep Metro bundler running while developing
- Use separate terminals for Metro and running the app
- Enable "Fast Refresh" in React Native for instant updates
- Use `adb logcat` for Android logs
- Use Xcode console for iOS logs

---

**Happy coding!** 🚀

