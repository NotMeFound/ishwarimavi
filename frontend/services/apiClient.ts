import {
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  ContactMessage,
  DocumentItem,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry,
  AdminAccount,
  AboutSection,
  CurriculumGuideline,
  Vacancy,
  PublicationItem,
  SchoolFAQItem
} from '../types';
import { safeStorage, safeSessionStorage } from '../utils/storage';
import {
  getApiUrl,
  getApiBaseUrl,
  isVercelHost,
  isRemoteHost,
  isApiConfigured,
  normalizeApiBaseUrl,
  setStoredApiBaseUrl
} from '../utils/apiUrl';

export {
  getApiUrl,
  getApiBaseUrl,
  isVercelHost,
  isRemoteHost,
  isApiConfigured,
  normalizeApiBaseUrl,
  setStoredApiBaseUrl
};

export interface ApiHealthStatus {
  status: 'connected' | 'unreachable' | 'invalid_endpoint' | 'config_missing';
  message: string;
  version?: number;
  lastModified?: string;
  uptime?: number;
  timestamp?: string;
}

export interface ApiErrorLogItem {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  status: number | string;
  statusText?: string;
  message: string;
  details?: string;
  requestPayloadSnippet?: string;
  responseBodySnippet?: string;
  isVercelError?: boolean;
}

export interface AuthoritativeCMSData {
  school: SchoolData;
  aboutSections?: AboutSection[];
  notices: Notice[];
  vacancies?: Vacancy[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  publications?: PublicationItem[];
  curriculumGuidelines?: CurriculumGuideline[];
  messages?: ContactMessage[];
  events: SchoolEvent[];
  achievements: Achievement[];
  history: HistoryItem[];
  gallery: GalleryItem[];
  faqs?: SchoolFAQItem[];
  siteConfig: SiteCustomizerConfig;
  securityConfig: SecurityConfig;
  auditLogs?: SecurityAuditLogEntry[];
  adminAccounts?: AdminAccount[];
}

export interface CMSStateResponse {
  success: boolean;
  authenticated?: boolean;
  role?: string;
  version: number;
  lastModified: string;
  data: AuthoritativeCMSData;
}

export interface AuthLoginResponse {
  success: boolean;
  token?: string;
  account?: AdminAccount;
  sessionExpiresAt?: number;
  error?: string;
  isLocked?: boolean;
  lockoutSeconds?: number;
  remainingAttempts?: number;
}

/**
 * Safely extracts a displayable string from any error representation,
 * including objects like `{ code, message }` or standard Error instances.
 * Guarantees that raw objects are never passed into React children.
 */
export function formatErrorMessage(err: unknown, fallback: string = 'An unexpected error occurred'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const obj = err as any;
    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      return obj.message;
    }
    if (typeof obj.error === 'string' && obj.error.trim().length > 0) {
      return obj.error;
    }
    if (typeof obj.error === 'object' && obj.error !== null) {
      if (typeof obj.error.message === 'string') return obj.error.message;
      if (typeof obj.error.code === 'string') return obj.error.code;
    }
    if (typeof obj.code === 'string') {
      return obj.code;
    }
  }
  return fallback;
}

/**
 * Safely parses response as JSON only if Content-Type indicates JSON.
 * Avoids uncaught syntax errors when reverse proxy or server returns HTML.
 */
async function safeParseJson<T = any>(res: Response): Promise<T | null> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Safely extracts raw text snippet from response for diagnostic purposes
 */
async function safeExtractResponseSnippet(res: Response, maxLength = 300): Promise<string> {
  try {
    const clone = res.clone();
    const text = await clone.text();
    return text.substring(0, maxLength);
  } catch {
    return '';
  }
}

class APIClient {
  private currentVersion = 0;
  private stateFetchPromise: Promise<CMSStateResponse | null> | null = null;
  private listeners: Set<(data: AuthoritativeCMSData, version: number) => void> = new Set();
  private sessionToken: string | null = null;
  private errorLogs: ApiErrorLogItem[] = [];
  private errorListeners: Array<(logs: ApiErrorLogItem[]) => void> = [];

  constructor() {
    this.sessionToken = safeSessionStorage.getItem('ishwari_server_token') || safeStorage.getItem('ishwari_server_token') || null;
    try {
      const stored = safeStorage.getItem('ishwari_api_error_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.errorLogs = parsed;
        }
      }
    } catch {}
  }

  public recordErrorLog(entry: {
    endpoint: string;
    method: string;
    status: number | string;
    statusText?: string;
    message: string;
    details?: string;
    requestPayloadSnippet?: string;
    responseBodySnippet?: string;
  }): void {
    const isVercel =
      String(entry.status) === '404' ||
      String(entry.status) === '502' ||
      String(entry.status) === '504' ||
      (entry.responseBodySnippet && (
        entry.responseBodySnippet.toLowerCase().includes('could not be found') ||
        entry.responseBodySnippet.toLowerCase().includes('vercel') ||
        entry.responseBodySnippet.toLowerCase().includes('not_found') ||
        entry.responseBodySnippet.toLowerCase().includes('serverless')
      )) ||
      (entry.message && entry.message.toLowerCase().includes('could not be found'));

    const item: ApiErrorLogItem = {
      id: 'err_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      endpoint: entry.endpoint,
      method: entry.method,
      status: entry.status,
      statusText: entry.statusText || '',
      message: entry.message,
      details: entry.details,
      requestPayloadSnippet: entry.requestPayloadSnippet,
      responseBodySnippet: entry.responseBodySnippet,
      isVercelError: !!isVercel
    };

    // Prepend to ring buffer (max 20 stored, last 10 displayed)
    this.errorLogs = [item, ...this.errorLogs.filter(l => l.id !== item.id)].slice(0, 20);

    try {
      safeStorage.setItem('ishwari_api_error_logs', JSON.stringify(this.errorLogs));
    } catch {}

    this.notifyErrorListeners();
  }

  public getRecentErrorLogs(limit: number = 10): ApiErrorLogItem[] {
    if (this.errorLogs.length === 0) {
      try {
        const stored = safeStorage.getItem('ishwari_api_error_logs');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.errorLogs = parsed;
          }
        }
      } catch {}
    }
    return this.errorLogs.slice(0, limit);
  }

  public clearErrorLogs(): void {
    this.errorLogs = [];
    try {
      safeStorage.removeItem('ishwari_api_error_logs');
    } catch {}
    this.notifyErrorListeners();
  }

  public onErrorLogsChange(callback: (logs: ApiErrorLogItem[]) => void): () => void {
    this.errorListeners.push(callback);
    callback(this.getRecentErrorLogs(10));
    return () => {
      this.errorListeners = this.errorListeners.filter(cb => cb !== callback);
    };
  }

  private notifyErrorListeners(): void {
    const recent = this.getRecentErrorLogs(10);
    for (const listener of this.errorListeners) {
      try {
        listener(recent);
      } catch (err) {
        console.error('[APIClient] Error listener exception:', err);
      }
    }
  }

  public setToken(token: string | null) {
    this.sessionToken = token;
    if (token) {
      safeSessionStorage.setItem('ishwari_server_token', token);
      safeStorage.setItem('ishwari_server_token', token);
    } else {
      safeSessionStorage.removeItem('ishwari_server_token');
      safeStorage.removeItem('ishwari_server_token');
    }
  }

  public getToken(): string | null {
    const sharedToken = safeStorage.getItem('ishwari_server_token');
    if (sharedToken) {
      this.sessionToken = sharedToken;
      return sharedToken;
    }

    return (
      this.sessionToken ||
      safeSessionStorage.getItem('ishwari_server_token') ||
      null
    );
  }

  public getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private expireSessionForToken(requestToken: string | null): void {
    if (!requestToken || this.getToken() !== requestToken) return;
    this.setToken(null);
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      window.dispatchEvent(new CustomEvent('ishwari:session-expired', {
        detail: { message: 'Session expired. Please log in again.' }
      }));
    }
  }

  /**
   * Test internal same-origin backend health status
   */
  public async testHealth(): Promise<ApiHealthStatus> {
    try {
      const res = await fetch(getApiUrl('/api/health'), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (res.ok) {
        const json = await safeParseJson<{ success?: boolean; status?: string; version?: number; uptime?: number; timestamp?: string }>(res);
        if (json && (json.status === 'ok' || typeof json.version !== 'undefined')) {
          return {
            status: 'connected',
            message: `Connected: Same-origin API is healthy (${json.version ? `CMS DB v${json.version}` : 'Online'}).`,
            version: json.version,
            uptime: json.uptime,
            timestamp: json.timestamp
          };
        }
      }

      const snippet = await safeExtractResponseSnippet(res);
      this.recordErrorLog({
        endpoint: '/api/health',
        method: 'GET',
        status: res.status,
        statusText: res.statusText,
        message: `API Health Check Failed (HTTP ${res.status})`,
        details: res.status === 404
          ? 'Backend endpoint /api/health not found (HTTP 404). In Vercel, verify serverless adapter api/index.js is bundled.'
          : `Server returned unexpected status ${res.status}. Expected JSON health response.`,
        responseBodySnippet: snippet
      });

      return {
        status: 'unreachable',
        message: `API returned HTTP ${res.status}. Expected JSON health response.`
      };
    } catch (err: any) {
      this.recordErrorLog({
        endpoint: '/api/health',
        method: 'GET',
        status: 'NETWORK_ERROR',
        message: `Health connection error: ${err?.message || 'Server unreachable'}`,
        details: 'Browser could not connect to /api/health. Possible network failure or CORS restriction.'
      });
      return {
        status: 'unreachable',
        message: `API connection failed: ${err?.message || 'Server unreachable'}.`
      };
    }
  }

  /**
   * Authenticate against authoritative server API (Normal Password or Master Key)
   */
  public async login(payload: {
    username: string;
    password?: string;
    loginType?: 'password' | 'master_key';
    masterKey?: string;
  }): Promise<AuthLoginResponse> {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await safeParseJson<any>(res);

      // Check if server returned a host-level 404 or unmapped error (such as Vercel "The page could not be found")
      const isHostNotFound =
        res.status === 404 ||
        !data ||
        (data && typeof data.error === 'string' && (
          data.error.toLowerCase().includes('could not be found') ||
          data.error.toLowerCase().includes('not found') ||
          data.error.toLowerCase().includes('not_found')
        )) ||
        (data && data.error && typeof data.error.message === 'string' && (
          data.error.message.toLowerCase().includes('could not be found') ||
          data.error.message.toLowerCase().includes('not found')
        ));

      if (isHostNotFound || res.status >= 500) {
        const snippet = await safeExtractResponseSnippet(res);
        this.recordErrorLog({
          endpoint: '/api/auth/login',
          method: 'POST',
          status: res.status,
          statusText: res.statusText,
          message: data?.error ? formatErrorMessage(data.error) : `Login Server Error (HTTP ${res.status})`,
          details: isHostNotFound
            ? 'Endpoint returned HTTP 404 or Vercel "The page could not be found". Resilient local authentication fallback was triggered.'
            : (data?.error ? formatErrorMessage(data.error) : res.statusText),
          requestPayloadSnippet: JSON.stringify({ username: payload.username, loginType: payload.loginType || 'password' }),
          responseBodySnippet: snippet || (data ? JSON.stringify(data) : '')
        });
      }

      if (isHostNotFound) {
        return {
          success: false,
          error: 'Authentication service is unavailable. Please try again later.'
        };
      }

      if (res.status === 401) {
        return {
          success: false,
          error: data?.error ? formatErrorMessage(data.error) : 'Invalid username or password.'
        };
      }

      if (res.status === 403) {
        return {
          success: false,
          error: data?.error ? formatErrorMessage(data.error) : 'Access denied: account inactive or restricted.'
        };
      }

      // Strictly normalize any server error response (whether string, { code, message }, etc.)
      const normalizedError = data?.error ? formatErrorMessage(data.error, 'Authentication failed.') : undefined;

      if (data?.success && data?.token) {
        this.setToken(data.token);
      }
      return {
        ...data,
        error: normalizedError
      };
    } catch (networkErr: any) {
      this.recordErrorLog({
        endpoint: '/api/auth/login',
        method: 'POST',
        status: 'NETWORK_ERROR',
        message: networkErr?.message || 'Unable to connect to authentication server.',
        details: 'Network request to /api/auth/login failed. Offline credential fallback is disabled.',
        requestPayloadSnippet: JSON.stringify({ username: payload.username })
      });
      return {
        success: false,
        error: 'Unable to reach the authentication service. Check your connection and try again.'
      };
    }
  }

  /**
   * Check active authenticated session against server
   */
  public async checkAuth(): Promise<{
    authenticated: boolean;
    invalid?: boolean;
    account?: AdminAccount;
    sessionExpiresAt?: number;
  }> {
    try {
      const url = getApiUrl('/api/auth/me');
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await safeParseJson(res);
        if (data && data.authenticated) return data;
      }
      return { authenticated: false, invalid: res.status === 401 };
    } catch {
      return { authenticated: false, invalid: false };
    }
  }

  public async refreshAuthSession(): Promise<{
    success: boolean;
    authenticated: boolean;
    sessionExpiresAt?: number;
    expiredToken?: string;
  }> {
    const refresh = async () => {
      const requestToken = this.getToken();
      const res = await fetch(getApiUrl('/api/auth/refresh'), {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'include'
      });
      const data = await safeParseJson<{
        success?: boolean;
        authenticated?: boolean;
        token?: string;
        sessionExpiresAt?: number;
      }>(res);

      if (res.ok && data?.success && data.authenticated && data.token) {
        this.setToken(data.token);
        return {
          success: true,
          authenticated: true,
          sessionExpiresAt: data.sessionExpiresAt
        };
      }

      return {
        success: res.status === 401 && this.getToken() === requestToken,
        authenticated: false,
        expiredToken: res.status === 401 && this.getToken() === requestToken
          ? requestToken || undefined
          : undefined
      };
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.locks) {
        return await navigator.locks.request('ishwari-admin-session-refresh', refresh);
      }
      return await refresh();
    } catch {
      return { success: false, authenticated: false };
    }
  }

  /**
   * Terminate active session on server and invalidate tokens
   */
  public async logout(options: { keepalive?: boolean } = {}): Promise<boolean> {
    try {
      const url = getApiUrl('/api/auth/logout');
      const logoutRequest = fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        keepalive: options.keepalive
      });
      this.setToken(null);
      await logoutRequest;
    } catch {
      this.setToken(null);
    }
    return true;
  }

  /**
   * Secure Password Change on Server
   */
  public async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const url = getApiUrl('/api/auth/change-password');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await safeParseJson<{ success: boolean; error?: string; message?: string }>(res);
      return data || { success: false, error: 'Password change failed. Server returned non-JSON response.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error updating password.' };
    }
  }

  /**
   * Independent authoritative database fetch.
   * Never relies on admin browser state or local-only storage.
   */
  public async fetchAuthoritativeState(forceRefresh = false, signal?: AbortSignal): Promise<CMSStateResponse | null> {
    if (this.stateFetchPromise) {
      if (!forceRefresh) return this.stateFetchPromise;
      await this.stateFetchPromise;
      if (this.stateFetchPromise) return this.stateFetchPromise;
    }

    const request = this.requestAuthoritativeState(signal);
    this.stateFetchPromise = request;
    try {
      return await request;
    } finally {
      if (this.stateFetchPromise === request) {
        this.stateFetchPromise = null;
      }
    }
  }

  private async requestAuthoritativeState(signal?: AbortSignal): Promise<CMSStateResponse | null> {
    try {
      const url = getApiUrl('/api/cms/state');
      const res = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        signal
      });

      if (!res.ok) {
        const snippet = await safeExtractResponseSnippet(res);
        this.recordErrorLog({
          endpoint: '/api/cms/state',
          method: 'GET',
          status: res.status,
          statusText: res.statusText,
          message: `CMS State Fetch Failed (HTTP ${res.status})`,
          details: res.status === 404
            ? 'Endpoint /api/cms/state returned 404. On Vercel, verify serverless functions are deployed. Local offline snapshot was loaded.'
            : `Server returned HTTP ${res.status}. Falling back to cached snapshot.`,
          responseBodySnippet: snippet
        });
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await safeParseJson<CMSStateResponse>(res);
      if (json && json.success && json.data) {
        // Server returned authoritative database state
        this.currentVersion = json.version;

        // In-memory update and notify subscribers
        this.notifyListeners(json.data, json.version);
        return json;
      }
      return null;
    } catch (err) {
      console.warn('[CMS Sync] Backend fetch error:', err);
      return null;
    }
  }

  /**
   * Ultra lightweight version check to test whether new content was published.
   */
  public async checkVersion(): Promise<{ version: number; lastModified: string; hasUpdate: boolean } | null> {
    try {
      const url = getApiUrl('/api/cms/version');
      const res = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include'
      });
      if (!res.ok) return null;
      const json = await safeParseJson<{ version: number; lastModified: string }>(res);
      if (!json) return null;
      const hasUpdate = json.version > this.currentVersion;
      return {
        version: json.version,
        lastModified: json.lastModified,
        hasUpdate
      };
    } catch {
      return null;
    }
  }

  /**
   * Persist a module update directly to the backend database with server-side authorization check.
   */
  public async syncModule(module: string, data: any, actor = 'Admin'): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No active session' };
    }

    try {
      const url = getApiUrl('/api/cms/sync');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-cms-client-version': String(this.currentVersion || 1),
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ module, data, actor })
      });

      const json = await safeParseJson(res);

      if (res.status === 401) {
        this.expireSessionForToken(token);
        return { success: false, error: 'Session expired (HTTP 401). Please log in again.' };
      }

      if (res.status === 403) {
        return { success: false, error: json?.error || 'Access denied (HTTP 403): You lack required permissions for this operation.' };
      }

      if (res.status === 404) {
        return { success: false, error: 'Resource not found (HTTP 404).' };
      }

      if (res.status === 409) {
        // Concurrency version conflict - re-fetch fresh state
        await this.fetchAuthoritativeState(true);
        return { success: false, error: json?.error || 'Version conflict (HTTP 409): Newer content was published. State re-synchronized.' };
      }

      if (res.status === 422) {
        return { success: false, error: json?.error || 'Validation error (HTTP 422): Please check all form fields.' };
      }

      if (res.status === 429) {
        return { success: false, error: 'Too many requests (HTTP 429): Rate limit exceeded. Please wait a moment.' };
      }

      if (res.status >= 500) {
        return { success: false, error: json?.error || `Server error (HTTP ${res.status}): Please try again shortly.` };
      }

      if (res.ok && json?.success) {
        this.currentVersion = json.version;
        // Immediately trigger authoritative fetch so UI synchronizes with database
        await this.fetchAuthoritativeState(true);
        return { success: true };
      }
      return { success: false, error: json?.error || `Failed with status ${res.status}` };
    } catch (err: any) {
      console.error(`[CMS Sync] Failed to sync module [${module}]:`, err);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Persist multiple modules in a single atomic transaction.
   */
  public async syncBatch(batch: Partial<AuthoritativeCMSData>, actor = 'Super Admin'): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'No active session' };
    }

    try {
      const url = getApiUrl('/api/cms/sync');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'x-cms-client-version': String(this.currentVersion || 1),
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ batch, actor })
      });

      const json = await safeParseJson(res);

      if (res.status === 401) {
        this.expireSessionForToken(token);
        return { success: false, error: 'Session expired (HTTP 401). Please log in again.' };
      }

      if (res.status === 403) {
        return { success: false, error: json?.error || 'Access denied (HTTP 403).' };
      }

      if (res.status === 409) {
        await this.fetchAuthoritativeState(true);
        return { success: false, error: json?.error || 'Version conflict (HTTP 409): State re-synchronized.' };
      }

      if (res.status >= 500) {
        return { success: false, error: json?.error || `Server error (HTTP ${res.status})` };
      }

      if (res.ok && json?.success) {
        this.currentVersion = json.version;
        // Immediately trigger authoritative fetch so UI synchronizes with database
        await this.fetchAuthoritativeState(true);
        return { success: true };
      }
      return { success: false, error: json?.error || `Failed with status ${res.status}` };
    } catch (err: any) {
      console.error('[CMS Sync] Failed to sync batch:', err);
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Public contact message submission.
   */
  public async submitContactMessage(payload: {
    name: string;
    email?: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    try {
      const url = getApiUrl('/api/contact/submit');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const json = await safeParseJson(res);
      return !!json?.success;
    } catch (err) {
      console.error('[Contact] Failed to submit message to backend:', err);
      return false;
    }
  }

  /**
   * Reset backend database to authoritative factory defaults (Strict Super Admin only).
   */
  public async resetToDefaults(actor = 'Super Admin'): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Super Admin session required' };
    }

    try {
      const url = getApiUrl('/api/cms/reset');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify({ actor })
      });
      const json = await safeParseJson(res);
      if (res.ok && json?.success) {
        await this.fetchAuthoritativeState(true);
        return { success: true };
      }
      return { success: false, error: json?.error || 'Failed to reset database' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error' };
    }
  }

  /**
   * Upload file to backend with authoritative server-side verification and storage
   */
  public async uploadFile(payload: {
    fileName: string;
    fileType: string;
    base64Data: string;
    category: string;
    operation?: 'replace';
  }): Promise<{ success: boolean; url?: string; fileName?: string; uniqueFileName?: string; size?: number; error?: string }> {
    try {
      const url = getApiUrl('/api/cms/upload');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await safeParseJson(res);
      if (res.ok && data?.success) {
        return data;
      }
      return { success: false, error: data?.error || 'Failed to upload file' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during upload' };
    }
  }

  /**
   * Real-time Server-Sent Events (SSE) subscriber + Polling fallback.
   * Listens for backend changes published by Admin on another device.
   */
  public setupLiveSync(onDataChanged: (data: AuthoritativeCMSData, version: number) => void): () => void {
    this.listeners.add(onDataChanged);

    let eventSource: EventSource | null = null;
    let pollInterval: any = null;
    let sseRetryCount = 0;

    const connectSSE = () => {
      try {
        if (typeof window === 'undefined' || !window.EventSource) return;

        // Vercel serverless edge functions have strict execution timeout caps.
        // On Vercel, skip long-polling SSE to prevent connection timeout warnings,
        // relying cleanly on the auxiliary polling interval below.
        if (isVercelHost()) return;

        const streamUrl = getApiUrl('/api/cms/stream');
        eventSource = new EventSource(streamUrl);

        eventSource.addEventListener('update', async (e: MessageEvent) => {
          try {
            sseRetryCount = 0;
            const payload = JSON.parse(e.data);
            if (payload && payload.version > this.currentVersion) {
              await this.fetchAuthoritativeState(true);
            }
          } catch {
            // Safely ignore malformed update frames
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          sseRetryCount++;
          // Retry at most 3 times with exponential backoff, then gracefully rely on polling
          if (sseRetryCount <= 3) {
            setTimeout(connectSSE, sseRetryCount * 5000);
          }
        };
      } catch {
        // Fallback cleanly to polling
      }
    };

    // 1. Start SSE stream
    connectSSE();

    // 2. Auxiliary Polling Fallback (SSE is unavailable on Vercel serverless functions)
    pollInterval = setInterval(async () => {
      const check = await this.checkVersion();
      if (check && check.hasUpdate) {
        await this.fetchAuthoritativeState(true);
      }
    }, 5000);

    // 3. Focus / Visibility Resumption
    const handleVisibilityChange = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const check = await this.checkVersion();
        if (check && check.hasUpdate) {
          await this.fetchAuthoritativeState(true);
        }
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleVisibilityChange);
    }

    return () => {
      this.listeners.delete(onDataChanged);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleVisibilityChange);
      }
    };
  }

  private notifyListeners(data: AuthoritativeCMSData, version: number) {
    for (const listener of this.listeners) {
      try {
        listener(data, version);
      } catch (e) {
        console.error('[LiveSync] Listener error:', e);
      }
    }
  }

  public getCurrentVersion(): number {
    return this.currentVersion;
  }
}

export const apiClient = new APIClient();
