# Proceed with Mobile App Setup

## 🚀 Quick Start (Recommended)

Run the comprehensive setup script that handles all errors:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./setup-step-by-step.sh
```

This script will:
1. ✅ Clear all caches
2. ✅ Try multiple methods to create the project
3. ✅ Copy all our code automatically
4. ✅ Install all dependencies
5. ✅ Set up iOS pods (if on macOS)

## Alternative: Manual Steps

If you prefer to run commands manually:

### Step 1: Clear Caches

```bash
npm cache clean --force
rm -rf /tmp/rncli-*
rm -rf ~/.npm/_cacache
```

### Step 2: Create Project (Try in order)

**Method 1: Stable Version**
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npx @react-native-community/cli@0.73.0 init AstroSetuMobile --template react-native-template-typescript --skip-install
```

**Method 2: Without Template**
```bash
npx @react-native-community/cli@latest init AstroSetuMobile --skip-install
```

**Method 3: Use Expo (Most Reliable)**
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native-alternative.sh
# Choose option 1
```

### Step 3: Copy Our Code

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu

# Copy source code
cp -r mobile/src AstroSetuMobile/

# Copy config files
cp mobile/App.tsx AstroSetuMobile/
cp mobile/index.js AstroSetuMobile/
cp mobile/package.json AstroSetuMobile/
cp mobile/tsconfig.json AstroSetuMobile/
cp mobile/babel.config.js AstroSetuMobile/
cp mobile/metro.config.js AstroSetuMobile/
cp mobile/.eslintrc.js AstroSetuMobile/
```

### Step 4: Install Dependencies

```bash
cd AstroSetuMobile
npm install

# Install additional packages
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-navigation/native-stack
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens
npm install react-native-vector-icons react-native-linear-gradient react-native-shimmer-placeholder
npm install axios date-fns
npm install react-native-razorpay
npm install react-native-image-picker react-native-push-notification react-native-localize i18n-js
```

### Step 5: iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### Step 6: Run the App

```bash
# Terminal 1: Start Metro
npm start

# Terminal 2: Run Android
npm run android

# Or Terminal 2: Run iOS
npm run ios
```

## 🎯 Recommended Approach

**Use the automated script** - it handles all errors and tries multiple methods:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./setup-step-by-step.sh
```

## If All Methods Fail

Use **Expo** - it's the most reliable:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native-alternative.sh
# Choose option 1 (Expo)
```

Then copy our code into the Expo project.

## Troubleshooting

### Still Getting Template Errors?

1. **Clear everything:**
   ```bash
   npm cache clean --force
   rm -rf /tmp/rncli-*
   rm -rf ~/.npm
   ```

2. **Use Expo instead** (no template issues)

3. **Check network connection** - template download requires internet

### Project Created But Missing Files?

The script will copy all our code automatically. If something is missing, manually copy from `mobile/` to `AstroSetuMobile/`.

### Dependencies Installation Fails?

```bash
# Remove node_modules and retry
rm -rf node_modules package-lock.json
npm install
```

---

**Ready to proceed? Run the setup script!** 🚀

