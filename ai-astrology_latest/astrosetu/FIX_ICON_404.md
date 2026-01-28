# Fix Icon 404 Error

## Issue
The PWA manifest references `icon-192.png` and `icon-512.png` but these files don't exist, causing 404 errors.

## Solution

### Option 1: Use the HTML Generator (Easiest) ✅
1. Open `public/generate-icons.html` in your browser
2. Click "Generate Icons" button
3. Download the generated icons
4. Move `icon-192.png` and `icon-512.png` to the `public` folder

### Option 2: Use the Shell Script
```bash
cd astrosetu/public
./create-icons.sh
```

### Option 3: Manual Creation
Create two PNG files:
- `public/icon-192.png` (192x192 pixels)
- `public/icon-512.png` (512x512 pixels)

Both should have:
- Saffron background (#F97316)
- White circle with Om symbol or astrological symbol
- Suitable for PWA manifest

### Option 4: Use Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload `favicon.ico`
3. Download the generated icons
4. Save as `icon-192.png` and `icon-512.png` in `public` folder

## Files Created
- `public/generate-icons.html` - Browser-based icon generator
- `public/create-icons.sh` - Shell script for icon generation
- `scripts/generate-icons.js` - Node.js script for icon generation

## Quick Fix (Temporary)
If you need a quick fix, you can temporarily update `manifest.json` to use SVG icons or remove the icon references until proper PNGs are created.

---

**Status**: ✅ Icon generation tools created, ready to generate icons!

