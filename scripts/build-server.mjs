import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const esbuildCommand = process.platform === 'win32'
  ? '.\\node_modules\\.bin\\esbuild.cmd'
  : './node_modules/.bin/esbuild';

const buildCommands = [
  `${esbuildCommand} backend/server.ts --bundle --platform=node --format=esm --packages=external --sourcemap --define:IS_PRODUCTION_BUILD=true --outfile=dist/server.js`,
  `${esbuildCommand} backend/server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --define:IS_PRODUCTION_BUILD=true --outfile=dist/server.cjs`,
  `${esbuildCommand} backend/vercelHandler.ts --bundle --platform=node --format=esm --packages=external --outfile=api/index.js`
];

for (const command of buildCommands) {
  const result = spawnSync(command, { shell: true, cwd: rootDir, stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

fs.copyFileSync(path.join(rootDir, 'api', 'index.js'), path.join(rootDir, 'api', '[...slug].js'));
console.log('[Build] Server bundles generated successfully.');
