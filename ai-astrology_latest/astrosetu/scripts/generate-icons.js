/**
 * Generate icon-192.png and icon-512.png for PWA manifest
 * Run with: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Simple SVG to PNG conversion using canvas (if available) or create base64 PNG
function createIcon(size) {
  // Create a simple SVG icon
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F97316;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#EA580C;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="white" stroke="#EA580C" stroke-width="${size*0.02}"/>
  <text x="${size/2}" y="${size/2}" font-size="${size*0.4}" text-anchor="middle" dominant-baseline="central" fill="#F97316">🕉️</text>
</svg>`;

  return svg;
}

// For now, we'll create a simple solution using base64 encoded PNG
// This is a minimal 1x1 transparent PNG that will be replaced
function createPlaceholderPNG(size) {
  // Minimal PNG header for transparent 1x1 image
  // In production, you should use a proper image library like sharp or jimp
  console.log(`Creating placeholder for icon-${size}.png`);
  
  // Create a simple instruction file instead
  const instruction = `# Icon Generation Instructions

To generate icon-${size}.png:

Option 1: Use online tool
1. Go to https://realfavicongenerator.net/
2. Upload favicon.ico
3. Download the ${size}x${size} icon
4. Save as icon-${size}.png in public folder

Option 2: Use ImageMagick (if installed)
\`\`\`bash
convert favicon.ico -resize ${size}x${size} icon-${size}.png
\`\`\`

Option 3: Use sips (macOS)
\`\`\`bash
sips -z ${size} ${size} favicon.ico --out icon-${size}.png
\`\`\`

Option 4: Use the HTML generator
1. Open public/generate-icons.html in browser
2. Click "Generate Icons"
3. Move downloaded files to public folder
`;

  return instruction;
}

// Main function
function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Create simple SVG icons (browsers can use SVG in manifest, but PNG is preferred)
  const sizes = [192, 512];
  
  sizes.forEach(size => {
    const svgPath = path.join(publicDir, `icon-${size}.svg`);
    const pngPath = path.join(publicDir, `icon-${size}.png`);
    
    // Create SVG version
    fs.writeFileSync(svgPath, createIcon(size));
    console.log(`Created ${svgPath}`);
    
    // Create instruction file
    const instructionPath = path.join(publicDir, `icon-${size}.txt`);
    fs.writeFileSync(instructionPath, createPlaceholderPNG(size));
    console.log(`Created ${instructionPath}`);
  });
  
  console.log('\n✅ SVG icons created!');
  console.log('⚠️  For PWA, you need PNG files. Use one of the methods in the .txt files or:');
  console.log('   1. Open generate-icons.html in browser');
  console.log('   2. Or use an online converter to convert SVG to PNG');
}

if (require.main === module) {
  main();
}

module.exports = { createIcon, createPlaceholderPNG };

