import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createApp } from './backend/app';

declare const IS_PRODUCTION_BUILD: boolean | undefined;

async function startServer() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 3000;
  
  const isCompileTimeProd = typeof IS_PRODUCTION_BUILD !== 'undefined' && IS_PRODUCTION_BUILD === true;
  const currentFile = typeof __filename !== 'undefined' ? __filename : '';
  const isDistPath = currentFile.includes('dist');
  const isArgvDist = typeof process !== 'undefined' && Array.isArray(process.argv) && process.argv.some(arg => arg.includes('dist') || arg.includes('server.js') || arg.includes('server.cjs'));
  
  const isProduction = isCompileTimeProd || isDistPath || isArgvDist || process.env.NODE_ENV === 'production' || !!process.env.RENDER;

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
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');

    if (fs.existsSync(indexPath)) {
      app.use(expressStaticGzipOrStandard(distPath));
      app.get('*', (req, res) => {
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
      app.get('/', (req, res) => {
        res.json({
          status: 'ok',
          service: 'Ishwari Secondary School API Server',
          environment: 'production',
          version: '1.0.0'
        });
      });
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Ishwari Secondary School API server running at http://0.0.0.0:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  const shutdown = () => {
    server.close(() => {
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