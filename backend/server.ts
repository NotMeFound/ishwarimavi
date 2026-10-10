import fs from 'fs';
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { createApp } from './app';

// Load environment variables from .env if present
dotenv.config();

// Compile-time flag injected by esbuild production builds
declare const IS_PRODUCTION_BUILD: boolean | undefined;

async function startServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 3000;
  
  // Authoritative production detection:
  // 1. Injected at bundle time by esbuild (replaces with boolean true)
  // 2. Runtime __filename containing 'dist'
  // 3. Process arguments referencing 'dist' or 'server.js' / 'server.cjs'
  // 4. Standard NODE_ENV=production or RENDER environment variables
  const isCompileTimeProd = typeof IS_PRODUCTION_BUILD !== 'undefined' && IS_PRODUCTION_BUILD === true;
  const currentFile = typeof __filename !== 'undefined' ? __filename : '';
  const isDistPath = currentFile.includes('dist');
  const isArgvDist = typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv.some(arg => arg.includes('dist') || arg.includes('server.js') || arg.includes('server.cjs'));
  
  const isProduction = isCompileTimeProd || isDistPath || isArgvDist || process.env.NODE_ENV === 'production' || !!process.env.RENDER;

  // In non-production, mount Vite middleware for live HMR dev server
  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn('Vite middleware could not be loaded, running API server standalone:', viteErr);
    }
  } else {
    // In production, serve built client assets if available
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      app.use(expressStaticGzipOrStandard(distPath));
      app.get('*', (req, res) => {
        // Never serve index.html for unhandled /api requests
        if (req.path.startsWith('/api')) {
          res.status(404).json({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: `API endpoint not found: ${req.method} ${req.originalUrl}`
            }
          });
          return;
        }
        res.sendFile(indexPath);
      });
    } else {
      // Standalone backend on Render or API server where frontend is deployed on Vercel
      app.get('/', (req, res) => {
        res.json({
          status: 'ok',
          service: 'Ishwari Secondary School API Server',
          environment: 'production',
          version: '1.0.0',
          endpoints: {
            health: '/healthz',
            apiHealth: '/api/health',
            apiState: '/api/cms/state',
            auth: '/api/auth/login'
          }
        });
      });
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Ishwari Secondary School API server running at http://0.0.0.0:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

function expressStaticGzipOrStandard(distPath: string) {
  return express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res: any, filePath: string) => {
      // HTML and Service Worker files should never be cached permanently
      if (filePath.endsWith('.html') || filePath.endsWith('sw.js') || filePath.endsWith('registerSW.js') || filePath.endsWith('.webmanifest')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal error starting server:', err);
  process.exit(1);
});
