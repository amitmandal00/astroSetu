#!/bin/bash
# Create simple PNG icons for PWA manifest
# This script creates basic colored icons using ImageMagick or sips

cd "$(dirname "$0")"

# Colors (AstroSetu theme)
SAFFRON="#F97316"
DARK_SAFFRON="#EA580C"
WHITE="#FFFFFF"

echo "Creating PWA icons..."

# Check for ImageMagick
if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    
    # Create 192x192 icon
    convert -size 192x192 xc:"$SAFFRON" \
            -fill "$WHITE" -draw "circle 96,96 96,20" \
            -fill "$SAFFRON" -pointsize 80 -gravity center -annotate +0+0 "🕉️" \
            icon-192.png
    
    # Create 512x512 icon
    convert -size 512x512 xc:"$SAFFRON" \
            -fill "$WHITE" -draw "circle 256,256 256,50" \
            -fill "$SAFFRON" -pointsize 200 -gravity center -annotate +0+0 "🕉️" \
            icon-512.png
    
    echo "✅ Icons created successfully!"
    
# Check for sips (macOS)
elif command -v sips &> /dev/null; then
    echo "Using sips (macOS)..."
    
    # Create a simple colored square using sips
    # Note: sips has limited capabilities, so we'll create a basic version
    echo "Creating basic icons..."
    
    # For sips, we need to create from an existing image or use a workaround
    # Create a 1x1 PNG with the saffron color first
    python3 << 'PYTHON'
from PIL import Image, ImageDraw, ImageFont
import os

# Create 192x192 icon
img192 = Image.new('RGB', (192, 192), color='#F97316')
draw192 = ImageDraw.Draw(img192)
draw192.ellipse([20, 20, 172, 172], fill='white', outline='#EA580C', width=4)
# Try to add text (emoji might not render, so use text)
try:
    draw192.text((96, 96), 'Om', fill='#F97316', anchor='mm', font_size=40)
except:
    pass
img192.save('icon-192.png')

# Create 512x512 icon
img512 = Image.new('RGB', (512, 512), color='#F97316')
draw512 = ImageDraw.Draw(img512)
draw512.ellipse([50, 50, 462, 462], fill='white', outline='#EA580C', width=10)
try:
    draw512.text((256, 256), 'Om', fill='#F97316', anchor='mm', font_size=100)
except:
    pass
img512.save('icon-512.png')

print("Icons created!")
PYTHON
    
    if [ -f icon-192.png ] && [ -f icon-512.png ]; then
        echo "✅ Icons created successfully!"
    else
        echo "⚠️  Python/PIL method failed. Please install Pillow: pip3 install Pillow"
        echo "   Or use the HTML generator: open generate-icons.html"
    fi
    
else
    echo "⚠️  No image converter found (ImageMagick or sips)"
    echo ""
    echo "Please use one of these options:"
    echo "1. Install ImageMagick: brew install imagemagick"
    echo "2. Use the HTML generator: open generate-icons.html in your browser"
    echo "3. Use an online tool: https://realfavicongenerator.net/"
    echo ""
    echo "Or manually create:"
    echo "  - icon-192.png (192x192 pixels, saffron background)"
    echo "  - icon-512.png (512x512 pixels, saffron background)"
fi

