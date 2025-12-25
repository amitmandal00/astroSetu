# Icon Generation Guide

## Quick Fix for 404 Icon Errors

The PWA manifest requires `icon-192.png` and `icon-512.png`. To generate them:

### Easiest Method: HTML Generator
1. Open `generate-icons.html` in your browser
2. Click "Generate Icons"
3. Download the files
4. Move them to the `public` folder

### Alternative: Shell Script
```bash
cd public
./create-icons.sh
```

### Manual: Online Tool
1. Visit https://realfavicongenerator.net/
2. Upload `favicon.ico`
3. Download generated icons
4. Save as `icon-192.png` and `icon-512.png`

## Icon Specifications
- **icon-192.png**: 192x192 pixels
- **icon-512.png**: 512x512 pixels
- **Background**: Saffron (#F97316) gradient
- **Symbol**: Om symbol or astrological symbol in white circle

