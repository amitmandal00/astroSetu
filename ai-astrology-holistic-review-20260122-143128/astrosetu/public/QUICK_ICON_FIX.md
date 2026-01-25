# Quick Icon Fix

## You're already in the `astrosetu` directory!

Just run:
```bash
cd public
./create-icons.sh
```

Or if you want to create icon-512.png from the existing icon-192.png:
```bash
cd public
sips -z 512 512 icon-192.png --out icon-512.png
```

## Or use the HTML generator:

1. Start your dev server: `npm run dev`
2. Open in browser: `http://localhost:3001/generate-icons.html`
3. Click "Generate Icons"
4. Move downloaded files to `public/` folder

## Current Status
- ✅ `icon-192.png` exists
- ❓ `icon-512.png` needs to be created

