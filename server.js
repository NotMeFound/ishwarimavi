/**
 * Ishwari Secondary School - Root Production Server Forwarder
 * Enables Render or hosting platforms running `node server.js` to execute the production bundle.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distServer = path.join(process.cwd(), 'dist', 'server.js');

if (!fs.existsSync(distServer)) {
  console.log('[Server] Production server bundle not found at dist/server.js. Compiling now...');
  try {
    execSync('npm run build:server', { stdio: 'inherit' });
  } catch (err) {
    console.error('[Server] Failed to compile server bundle:', err);
    process.exit(1);
  }
}

await import('./dist/server.js');
