/**
 * Backend Utilities
 */

import path from 'path';
import fs from 'fs';

export function getBackendUploadDir(category: string): string {
  const backendDir = path.join(process.cwd(), 'backend', 'uploads', category);
  if (!fs.existsSync(backendDir)) {
    try {
      fs.mkdirSync(backendDir, { recursive: true });
    } catch {
      // ignore
    }
  }
  return backendDir;
}

export function resolveUploadFilePath(category: string, filename: string): string | null {
  const pBackend = path.join(process.cwd(), 'backend', 'uploads', category, filename);
  if (fs.existsSync(pBackend)) return pBackend;
  const pData = path.join(process.cwd(), 'data', 'uploads', category, filename);
  if (fs.existsSync(pData)) return pData;
  return null;
}
