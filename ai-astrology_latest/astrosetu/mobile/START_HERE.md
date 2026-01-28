# 🚀 Start Here - Mobile App Setup

## Quick Start (One Command)

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./setup-step-by-step.sh
```

That's it! The script will handle everything automatically.

## What You'll Get

After running the script, you'll have:
- ✅ Complete React Native project (`AstroSetuMobile/`)
- ✅ All our code copied and configured
- ✅ All dependencies installed
- ✅ Ready to run on Android/iOS

## After Setup Completes

### Run the App

**Terminal 1: Start Metro**
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
npm start
```

**Terminal 2: Run Android**
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
npm run android
```

**Or Terminal 2: Run iOS (macOS only)**
```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/AstroSetuMobile
npm run ios
```

### Or Use Helper Script

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./start-dev.sh android  # or ./start-dev.sh ios
```

## If Setup Fails

### Option 1: Clear Cache and Retry
```bash
npm cache clean --force
rm -rf /tmp/rncli-*
./setup-step-by-step.sh
```

### Option 2: Use Expo (Most Reliable)
```bash
./init-react-native-alternative.sh
# Choose option 1
```

## Troubleshooting

- **Template errors?** → Use Expo (Option 2 above)
- **Permission errors?** → Run with `sudo` (if needed)
- **Port in use?** → `lsof -ti:8081 | xargs kill -9`
- **Build fails?** → See `FIX_TEMPLATE_ERROR.md`

## Documentation

- `PROCEED_GUIDE.md` - Detailed setup guide
- `QUICK_RUN.md` - How to run the app
- `FIX_TEMPLATE_ERROR.md` - Fix common errors
- `README_SETUP.md` - Complete setup documentation

---

**Ready? Run the setup script now!** 🎉

```bash
cd /Users/amitkumarmandal/Documents/astroCursor/astrosetu/mobile
./setup-step-by-step.sh
```

