const fs = require('fs');
const { execSync } = require('child_process');

// Create a simple colored square PNG using sips (macOS built-in)
function createImage(filename, size, color) {
  try {
    // Create a temporary colored image using sips
    const tempFile = `/tmp/temp_${filename}`;
    
    // Create a 1x1 pixel image with the color, then resize it
    execSync(`sips -c ${color} -z ${size} ${size} --out ${tempFile} 2>/dev/null || echo ""`, { stdio: 'ignore' });
    
    // If sips method doesn't work, create a minimal PNG manually
    if (!fs.existsSync(tempFile)) {
      createMinimalPNG(filename, size, color);
    } else {
      fs.copyFileSync(tempFile, `./assets/${filename}`);
      fs.unlinkSync(tempFile);
    }
  } catch (error) {
    // Fallback: create minimal PNG
    createMinimalPNG(filename, size, color);
  }
}

// Create a minimal valid PNG (simplified version)
function createMinimalPNG(filename, size, color) {
  // For a proper solution, we'd need a PNG library
  // For now, let's use a workaround: create via ImageMagick or similar
  // Since we can't easily create PNGs without libraries, let's try imagemagick
  try {
    execSync(`which convert`, { stdio: 'ignore' });
    // Use ImageMagick if available
    const hexColor = color.replace('#', '');
    execSync(`convert -size ${size}x${size} xc:#${hexColor} ./assets/${filename}`, { stdio: 'ignore' });
  } catch (e) {
    // Last resort: download a placeholder or create via Python
    try {
      execSync(`python3 -c "
from PIL import Image
img = Image.new('RGB', (${size}, ${size}), color='${color}')
img.save('./assets/${filename}')
"`, { stdio: 'ignore' });
    } catch (e2) {
      console.error(`Could not create ${filename}. Please install ImageMagick or Pillow (PIL).`);
      console.error(`Alternatively, manually create a ${size}x${size} PNG with color ${color}`);
    }
  }
}

// Main execution
const assetsDir = './assets';
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('Creating placeholder assets...');

// Create icon (1024x1024, orange color matching the app theme)
createImage('icon.png', 1024, '#F97316');

// Create splash (same size)
createImage('splash.png', 1024, '#F97316');

// Create adaptive icon (1024x1024)
createImage('adaptive-icon.png', 1024, '#F97316');

// Create favicon (32x32)
createImage('favicon.png', 32, '#F97316');

console.log('Assets created successfully!');
