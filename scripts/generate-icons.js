import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height, r, g, b) {
  const bytesPerPixel = 4;
  const rowBytes = width * bytesPerPixel;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Border circle calculation for emblem
      const cx = width / 2;
      const cy = height / 2;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      
      let pr = r;
      let pg = g;
      let pb = b;

      // Outer gold ring
      if (Math.abs(dist - width * 0.42) < 4) {
        pr = 245; pg = 158; pb = 11;
      }
      // Inner academic emblem accent
      else if (Math.abs(dist - width * 0.25) < 3) {
        pr = 252; pg = 211; pb = 77;
      }
      // Center accent
      else if (dist < width * 0.12) {
        pr = 255; pg = 255; pb = 255;
      }

      rawData[offset++] = pr;
      rawData[offset++] = pg;
      rawData[offset++] = pb;
      rawData[offset++] = 255; // Alpha
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // Color type (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Generate files
const p192 = createPng(192, 192, 30, 58, 138);
const p512 = createPng(512, 512, 30, 58, 138);
const pApple = createPng(180, 180, 30, 58, 138);

fs.writeFileSync('public/pwa-192x192.png', p192);
fs.writeFileSync('public/pwa-512x512.png', p512);
fs.writeFileSync('public/pwa-maskable-512x512.png', p512);
fs.writeFileSync('public/apple-touch-icon.png', pApple);
fs.writeFileSync('public/favicon.ico', pApple);
console.log('PWA icon assets generated successfully.');
