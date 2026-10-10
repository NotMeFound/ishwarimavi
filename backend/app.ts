import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { apiRouter, handleAdminLogin } from './routes';

/**
 * Configure and initialize Express application
 */
export function createApp(): express.Application {
  const app = express();

  // Single-Origin Full-Stack Architecture:
  // Same-origin requests execute directly without CORS headers.
  // Configure explicit production origins and authorized preview domains.
  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (same-origin, curl, mobile native, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit allowed origins via env or standard trusted production/preview patterns
      const allowedOriginsEnv = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim().replace(/\/+$/, ''))
        : [];

      const isAllowedExplicit = allowedOriginsEnv.includes(origin);
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin);
      const isAllowedDomain =
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.run.app') ||
        origin.endsWith('.googleusercontent.com');

      if (isAllowedExplicit || isLocalhost || isAllowedDomain) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'x-cms-client-version'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'X-Total-Count'],
    optionsSuccessStatus: 204
  };

  // Mount CORS before all other middleware and routes
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Security headers and Request Correlation Tracking for API
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Generate or propagate correlation request ID
    const incomingReqId = req.headers['x-request-id'];
    const requestId =
      typeof incomingReqId === 'string' && incomingReqId.length > 0 && incomingReqId.length <= 64
        ? incomingReqId
        : 'req_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);

    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Allow iframe rendering in AI Studio preview environments while retaining security
    const isCloudPreview = !!process.env.AIS_APPLET_ID || !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    if (!isCloudPreview) {
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    }
    res.setHeader('X-XSS-Protection', '1; mode=block');

    const startTime = Date.now();
    res.on('finish', () => {
      // Diagnostic logging for non-2xx responses or errors
      if (res.statusCode >= 400) {
        const durationMs = Date.now() - startTime;
        const sanitizedRoute = req.baseUrl + (req.path || req.url);
        const authCategory =
          res.statusCode === 401 ? 'AUTHENTICATION_REQUIRED' :
          res.statusCode === 403 ? 'AUTHORIZATION_DENIED' :
          res.statusCode === 429 ? 'RATE_LIMITED' : undefined;

        console.warn('[Diagnostic API Log]', JSON.stringify({
          timestamp: new Date().toISOString(),
          requestId,
          method: req.method,
          route: sanitizedRoute,
          status: res.statusCode,
          durationMs,
          ...(authCategory ? { authCategory } : {})
        }));
      }
    });

    next();
  });

  // Body and cookie parsing
  app.use(cookieParser());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Root health check for Render / cloud load balancers
  app.get('/healthz', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Direct authentication aliases
  app.post(['/login', '/auth/login', '/admin/login'], handleAdminLogin);
  app.post(['/admin', '/superadmin'], (req: Request, res: Response, next: NextFunction) => {
    if (req.body && req.body.username) {
      return handleAdminLogin(req, res);
    }
    res.redirect(303, '/admin');
  });

  // Mount API Router
  // Keep the authoritative API under /api and /auth namespaces so browser page routes like
  // /about, /contact, /facilities, etc. are not intercepted by JSON convenience endpoints.
  app.use('/api', apiRouter);
  app.use('/auth', apiRouter);

  // Catch-all for unhandled /api routes - strictly returns JSON
  app.use('/api', (req: Request, res: Response) => {
    const msg = `API endpoint not found: ${req.method} ${req.originalUrl}`;
    res.status(404).json({
      success: false,
      message: msg,
      error: msg,
      errorDetails: {
        code: 'API_ENDPOINT_NOT_FOUND',
        message: msg
      }
    });
  });

  // Centralized API error handler - strictly returns JSON, never HTML or stack traces
  app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId || req.headers['x-request-id'] || 'req_err';
    const statusCode = typeof err?.status === 'number' && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const errorCode = err?.code || (statusCode === 404 ? 'NOT_FOUND' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : 'INTERNAL_SERVER_ERROR');
    const errorMessage = err?.message || 'An unexpected internal error occurred on the API server.';

    const dbCategory =
      err?.name === 'FirebaseError' || err?.code?.startsWith?.('auth/') || err?.code?.startsWith?.('firestore/')
        ? 'FIRESTORE_DATABASE_ERROR'
        : err?.code === 'ECONNREFUSED' || err?.code === 'ETIMEDOUT'
        ? 'DATABASE_NETWORK_ERROR'
        : undefined;

    // Server-side diagnostic log - never leaks passwords, master keys, session cookies, or JWTs
    console.error('[Diagnostic Server Error]', JSON.stringify({
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      route: req.baseUrl + (req.path || req.url),
      status: statusCode,
      errorCode,
      ...(dbCategory ? { databaseErrorCategory: dbCategory } : {}),
      message: errorMessage
    }));

    res.status(statusCode).json({
      success: false,
      requestId,
      message: errorMessage,
      error: errorMessage,
      errorDetails: {
        code: errorCode,
        message: errorMessage
      }
    });
  });

  // Global top-level error handler - ensures Express never serves HTML stack trace error pages
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = typeof err?.status === 'number' && err.status >= 400 && err.status <= 599 ? err.status : 500;
    const errMsg = err?.message || 'Internal Server Error';
    if (statusCode >= 500) {
      console.error('[Unhandled Server Error]', {
        method: req.method,
        url: req.originalUrl,
        status: statusCode,
        message: err?.message,
        stack: err?.stack
      });
    }
    res.status(statusCode).json({
      success: false,
      message: errMsg,
      error: errMsg,
      errorDetails: {
        code: err?.code || 'INTERNAL_SERVER_ERROR',
        message: errMsg
      }
    });
  });

  return app;
}
