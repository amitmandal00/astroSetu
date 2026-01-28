const fs = require('fs');
const zlib = require('zlib');

// Create a minimal valid PNG file
// This creates a 1024x1024 solid color PNG
function createPNG(filename, width, height, r, g, b) {
  // PNG signature
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Create image data (RGB for each pixel)
  const pixelData = Buffer.alloc(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    pixelData[i * 3] = r;     // R
    pixelData[i * 3 + 1] = g; // G
    pixelData[i * 3 + 2] = b; // B
  }
  
  // Compress the image data
  const compressed = zlib.deflateSync(pixelData);
  
  // Create IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrCRC = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdrChunk = createChunk('IHDR', ihdrData, ihdrCRC);
  
  // Create IDAT chunk
  const idatCRC = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  const idatChunk = createChunk('IDAT', compressed, idatCRC);
  
  // Create IEND chunk
  const iendCRC = crc32(Buffer.from('IEND'));
  const iendChunk = createChunk('IEND', Buffer.alloc(0), iendCRC);
  
  // Combine all chunks
  const png = Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
  
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename} (${width}x${height})`);
}

function createChunk(type, data, crc) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuf, data, crcBuf]);
}

// Simple CRC32 implementation
function crc32(buffer) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 249, g: 115, b: 22 }; // Default to #F97316
}

// Main
const assetsDir = './assets';
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const color = hexToRgb('#F97316'); // Orange color from app theme

console.log('Creating placeholder assets...');
createPNG('./assets/icon.png', 1024, 1024, color.r, color.g, color.b);
createPNG('./assets/splash.png', 1024, 1024, color.r, color.g, color.b);
createPNG('./assets/adaptive-icon.png', 1024, 1024, color.r, color.g, color.b);
createPNG('./assets/favicon.png', 32, 32, color.r, color.g, color.b);
console.log('All assets created successfully!');
