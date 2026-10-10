/**
 * Ishwari Secondary School - CommonJS Production Server Entry Point
 * Ensures backwards compatibility for environments invoking `node server.cjs`.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distCjs = path.join(__dirname, 'dist', 'server.cjs');

if (!fs.existsSync(distCjs)) {
  console.log('[Server] CommonJS bundle not found at dist/server.cjs. Compiling now...');
  try {
    execSync('npm run build:server', { stdio: 'inherit' });
  } catch (err) {
    console.error('[Server] Failed to compile server bundle:', err);
    process.exit(1);
  }
}

require('./dist/server.cjs');
