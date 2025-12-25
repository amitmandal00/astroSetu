# Fix Template Error - React Native Init

## Problem

The React Native CLI is failing with:
```
error Couldn't find the template.config.js file inside "react-native" template
```

This happens when the template download is corrupted or incomplete.

## Solutions

### Solution 1: Clear Cache and Retry (Recommended)

```bash
# Clear npm cache
npm cache clean --force

# Clear React Native CLI cache
rm -rf ~/.npm/_cacache
rm -rf /tmp/rncli-*

# Try again
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native.sh
```

### Solution 2: Use Specific React Native Version

The script has been updated to try a stable version (0.73.0) first. If it still fails, try manually:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npx @react-native-community/cli@latest init AstroSetuMobile --version 0.73.0 --skip-install
```

### Solution 3: Use Expo (Easier Alternative)

Expo is simpler and doesn't have template issues:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native-alternative.sh
# Choose option 1 (Expo)
```

Then copy our code:
```bash
cp -r mobile/src AstroSetuMobile/
cp mobile/App.tsx AstroSetuMobile/
# ... (copy other files)
```

### Solution 4: Manual Template Download

If all else fails, download template manually:

```bash
# Create project directory
mkdir -p /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile

# Initialize npm
npm init -y

# Install React Native
npm install react-native@0.73.0 react@18.2.0

# Then manually set up Android/iOS projects
# (This is complex - use Expo instead)
```

### Solution 5: Use React Native 0.72 (Most Stable)

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu
npx @react-native-community/cli@0.72.0 init AstroSetuMobile --template react-native-template-typescript --skip-install
```

## Recommended: Use Expo

For the easiest setup without template issues:

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./init-react-native-alternative.sh
# Choose option 1
```

Expo handles all the native setup automatically and is more reliable.

## After Fixing

Once the project is created:

1. Copy our code:
   ```bash
   cp -r mobile/src AstroSetuMobile/
   cp mobile/App.tsx AstroSetuMobile/
   cp mobile/index.js AstroSetuMobile/
   cp mobile/package.json AstroSetuMobile/
   cp mobile/tsconfig.json AstroSetuMobile/
   cp mobile/babel.config.js AstroSetuMobile/
   cp mobile/metro.config.js AstroSetuMobile/
   ```

2. Install dependencies:
   ```bash
   cd AstroSetuMobile
   npm install
   ```

3. Run the app:
   ```bash
   npm start
   npm run android  # or npm run ios
   ```

---

**Try Solution 1 first (clear cache), then Solution 3 (Expo) if it still fails.**

