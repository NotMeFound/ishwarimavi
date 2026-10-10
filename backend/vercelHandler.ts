import { createApp } from './app';

const app = createApp();

export default function handler(req: any, res: any) {
  // Normalize URL on Vercel Serverless Functions:
  // Vercel rewrites may alter req.url to /api/index or /api/[...slug]
  try {
    const forwardedUri = req.headers?.['x-forwarded-uri'] || req.headers?.['x-original-uri'];
    if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api')) {
      req.url = forwardedUri;
    } else if (req.url === '/api/index' || req.url === '/api/[...slug]' || req.url?.startsWith('/api/index?') || req.url?.startsWith('/api/[...slug]?')) {
      const slug = req.query?.slug || req.query?.['1'] || req.query?.['0'];
      if (slug) {
        const slugPath = Array.isArray(slug) ? slug.join('/') : String(slug);
        const cleanSlug = slugPath.replace(/^\/+/, '');
        const queryIdx = req.url.indexOf('?');
        const queryStr = queryIdx >= 0 ? req.url.slice(queryIdx) : '';
        req.url = `/api/${cleanSlug}${queryStr}`;
      }
    }
  } catch (err) {
    console.warn('[Vercel Handler] Error normalizing request URL:', err);
  }

  return app(req, res);
}

