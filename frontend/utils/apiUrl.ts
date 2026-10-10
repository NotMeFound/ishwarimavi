/**
 * Ishwari Secondary School - Authoritative API URL Resolver
 * 
 * In standard single-origin full-stack architecture, all API and media requests
 * use clean same-origin relative URLs (e.g. /api/auth/login).
 * If a separate backend URL is configured via VITE_API_URL or local storage,
 * it is automatically prepended to all API requests.
 */

/**
 * Normalization helper for base URLs
 */
export function normalizeApiBaseUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === '/' || trimmed === 'undefined' || trimmed === 'null') {
    return '';
  }
  return trimmed.replace(/\/+$/, '');
}

/**
 * Returns the base API URL (empty string for same-origin relative requests)
 */
export function getApiBaseUrl(): string {
  // 1. Check environment variable VITE_API_URL if explicitly configured
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    const envUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
    if (envUrl && !envUrl.includes('your-backend-api') && !envUrl.includes('example.com')) {
      return envUrl;
    }
  }

  // 2. Default to same-origin relative requests (e.g. /api/auth/login)
  return '';
}

/**
 * Resolves any API or asset path to a safe path (with base URL if configured)
 */
export function getApiUrl(path: string): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${cleanPath}` : cleanPath;
}

export function isRemoteHost(): boolean {
  return Boolean(getApiBaseUrl());
}

export function isApiConfigured(): boolean {
  return true;
}

export function isVercelHost(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('.vercel.app');
}

export function setStoredApiBaseUrl(_url: string): void {
  // Production frontend always uses same-origin /api requests
  // Do NOT store or use API URLs from localStorage as authoritative endpoints.
}
