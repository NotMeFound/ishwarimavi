import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db, ServerSession, verifyPasswordBcrypt, hashPasswordBcrypt } from './db';
import { AdminAccount } from './types';

export const apiRouter = express.Router();

// Helper to create minimal valid PDF files for seeded sample curriculum resources
function createSamplePdf(title: string, grade: string): Buffer {
  const content = `BT /F1 18 Tf 50 720 Td (${title.replace(/[\(\)]/g, '')}) Tj ET BT /F1 13 Tf 50 690 Td (Ishwari Secondary School - Curriculum Resource - ${grade.replace(/[\(\)]/g, '')}) Tj ET BT /F1 10 Tf 50 640 Td (1. Competencies and Learning Outcomes Framework) Tj ET BT /F1 9 Tf 50 610 Td (This official curriculum document specifies national competencies, pedagogical directives,) Tj ET BT /F1 9 Tf 50 595 Td (practical experimentation steps, internal assessment rubrics, and terminal SEE/NEB guidelines.) Tj ET BT /F1 9 Tf 50 560 Td (Curriculum Development Centre (CDC) & National Examinations Board (NEB) Prescribed Framework.) Tj ET BT /F1 9 Tf 50 530 Td (Ishwari Secondary School, Educational Planning & Evaluation Committee - 2083 B.S.) Tj ET`;
  const streamLength = Buffer.byteLength(content, 'utf8');
  const pdfStr = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length ${streamLength} >>\nstream\n${content}\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000244 00000 n \n0000000340 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n420\n%%EOF\n`;
  return Buffer.from(pdfStr, 'utf8');
}

// Backend storage directories helper
function getBackendUploadDir(category: string): string {
  const backendDir = path.join(process.cwd(), 'backend', 'uploads', category);
  if (!fs.existsSync(backendDir)) {
    try {
      fs.mkdirSync(backendDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create backend upload directory:', backendDir, e);
    }
  }
  return backendDir;
}

function resolveUploadFilePath(category: string, filename: string): string | null {
  const pBackend = path.join(process.cwd(), 'backend', 'uploads', category, filename);
  if (fs.existsSync(pBackend)) return pBackend;
  const pData = path.join(process.cwd(), 'data', 'uploads', category, filename);
  if (fs.existsSync(pData)) return pData;
  return null;
}

// Ensure curriculum upload directory and initial sample PDFs exist in backend storage
try {
  const currDir = getBackendUploadDir('curriculum');
  const samplePdfs = [
    { file: 'curr-math-grade10.pdf', title: 'Grade 10 Compulsory Mathematics Curriculum', grade: 'Grade 10' },
    { file: 'curr-science-grade9-10.pdf', title: 'Grade 9-10 Science and Technology Practical Manual', grade: 'Grade 9-10' },
    { file: 'curr-physics-grade11-12.pdf', title: 'Grade 11-12 Physics Practical Curriculum', grade: 'Grade 11-12' },
    { file: 'curr-english-grade6-8.pdf', title: 'Basic Level English Language Guidelines', grade: 'Grade 6-8' },
    { file: 'curr-nepali-grade10.pdf', title: 'Grade 10 Nepali Curriculum Framework', grade: 'Grade 10' },
    { file: 'curr-cs-grade11-12.pdf', title: 'Grade 11-12 Computer Science Practical Manual', grade: 'Grade 11-12' },
    { file: 'curr-primary-draft.pdf', title: 'Primary Integrated Curriculum Draft', grade: 'Grade 1-5' }
  ];
  for (const item of samplePdfs) {
    const target = path.join(currDir, item.file);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, createSamplePdf(item.title, item.grade));
    }
  }
} catch (err) {
  console.warn('Could not initialize sample curriculum PDFs in backend storage:', err);
}

// Strict Cache-Control headers for all dynamic API responses
apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Helper to extract session token from Authorization header or cookies
export function extractToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.substring(7).trim();
    if (bearer) return bearer;
  }

  const cookieToken = req.cookies?.ishwari_session;
  if (cookieToken) return cookieToken;

  return undefined;
}

// Authentication middleware for privileged operations
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  const session = db.validateSession(token);

  if (!session) {
    res.status(401).json({
      success: false,
      error: 'Authentication session expired or invalid. Please log in to proceed.'
    });
    return;
  }

  (req as any).session = session;
  next();
}

// 1. Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  const versionInfo = db.getVersion();
  res.json({
    success: true,
    status: 'ok',
    version: versionInfo.version,
    lastModified: versionInfo.lastModified,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 2. Authoritative Database State
apiRouter.get('/cms/state', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const token = extractToken(req);
  const session = db.validateSession(token);
  const state = db.getState();

  // If authenticated admin session, provide full operational data (sanitizing password hashes)
  if (session) {
    const sanitizedAccounts = state.adminAccounts.map((acc) => ({
      ...acc,
      passwordHash: '[PROTECTED_BCRYPT_HASH]'
    }));

    res.json({
      success: true,
      authenticated: true,
      role: session.role,
      version: state.version,
      lastModified: state.lastModified,
      data: {
        school: state.school,
        aboutSections: state.aboutSections || [],
        notices: state.notices,
        vacancies: state.vacancies || [],
        staff: state.staff,
        facilities: state.facilities,
        programs: state.programs,
        documents: state.documents,
        curriculumGuidelines: state.curriculumGuidelines || [],
        messages: state.messages,
        events: state.events,
        achievements: state.achievements,
        history: state.history,
        gallery: state.gallery,
        faqs: state.faqs || [],
        siteConfig: state.siteConfig,
        securityConfig: state.securityConfig,
        auditLogs: state.auditLogs,
        adminAccounts: sanitizedAccounts
      }
    });
    return;
  }

  // Unauthenticated public visitors receive sanitized public state
  const publicData = db.getPublicState();
  res.json({
    success: true,
    authenticated: false,
    version: publicData.version,
    lastModified: publicData.lastModified,
    data: publicData
  });
});

// 3. Ultra-lightweight Version Check (For Polling & Tab Resumption)
apiRouter.get('/cms/version', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  const versionInfo = db.getVersion();
  res.json({
    success: true,
    version: versionInfo.version,
    lastModified: versionInfo.lastModified
  });
});

// 3.1 Public Module Convenience Endpoints
apiRouter.get('/notices', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().notices || [] });
});

apiRouter.get('/gallery', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().gallery || [] });
});

apiRouter.get('/teachers', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().staff || [] });
});

apiRouter.get('/staff', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().staff || [] });
});

apiRouter.get('/programs', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().programs || [] });
});

apiRouter.get('/alumni', (req: Request, res: Response) => {
  res.json({ success: true, data: [] });
});

apiRouter.get('/faqs', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().faqs || [] });
});

apiRouter.get('/events', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().events || [] });
});

apiRouter.get('/facilities', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getState().facilities || [] });
});

// 4. Real-time Synchronization Stream (Server-Sent Events)
apiRouter.get('/cms/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable proxy buffering for nginx

  res.flushHeaders?.();

  // Send initial handshake
  const current = db.getVersion();
  res.write(`event: handshake\ndata: ${JSON.stringify({ version: current.version, lastModified: current.lastModified })}\n\n`);

  // Subscribe to database changes
  const unsubscribe = db.subscribe((change) => {
    try {
      res.write(`event: update\ndata: ${JSON.stringify(change)}\n\n`);
    } catch {
      // Stream closed
    }
  });

  // Keep connection alive with pings every 20 seconds
  const pingTimer = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingTimer);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(pingTimer);
    unsubscribe();
  });
});

/* ---------------- CAMPUS WEATHER PROXY ENDPOINT ---------------- */

interface CachedWeatherData {
  timestamp: number;
  data: any;
}
const weatherCache: { [key: string]: CachedWeatherData } = {};

// 4.1 Server-Side Weather Proxy
// Proxies Open-Meteo requests to bypass browser CORS / adblocker / network restrictions
// and provides in-memory caching and fallback
apiRouter.get('/weather', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.latitude as string) || 28.2167;
  const lon = parseFloat(req.query.longitude as string) || 81.6033;
  const cacheKey = `${lat.toFixed(4)}_${lon.toFixed(4)}`;
  const now = Date.now();

  // Return cached data if fresh (15 minutes TTL)
  const cached = weatherCache[cacheKey];
  if (cached && now - cached.timestamp < 15 * 60 * 1000) {
    return res.json({
      success: true,
      source: 'cache',
      data: cached.data
    });
  }

  const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKathmandu&forecast_days=4`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const apiRes = await fetch(openMeteoUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'IshwariSecondarySchoolPortal/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      throw new Error(`Open-Meteo returned status ${apiRes.status}`);
    }

    const json = await apiRes.json();
    weatherCache[cacheKey] = {
      timestamp: now,
      data: json
    };

    return res.json({
      success: true,
      source: 'live',
      data: json
    });
  } catch {
    // If cache exists (even if stale), return it gracefully
    if (cached) {
      return res.json({
        success: true,
        source: 'stale_cache',
        data: cached.data
      });
    }

    // Realistic seasonal baseline for Banke, Nepal
    const baselineData = {
      current: {
        time: new Date().toISOString(),
        temperature_2m: 26,
        apparent_temperature: 28,
        relative_humidity_2m: 62,
        weather_code: 1,
        wind_speed_10m: 7,
        precipitation: 0,
        is_day: 1
      },
      daily: {
        time: [
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 86400000).toISOString().split('T')[0],
          new Date(Date.now() + 172800000).toISOString().split('T')[0],
          new Date(Date.now() + 259200000).toISOString().split('T')[0]
        ],
        weather_code: [1, 0, 2, 1],
        temperature_2m_max: [31, 32, 30, 31],
        temperature_2m_min: [20, 21, 19, 20],
        precipitation_probability_max: [10, 5, 20, 15]
      }
    };

    return res.json({
      success: true,
      source: 'fallback',
      data: baselineData
    });
  }
});

/* ---------------- AUTHENTICATION & SESSION APIS ---------------- */

// 5. Admin Authentication (Normal Password & Master Key)
export const handleAdminLogin = async (req: Request, res: Response) => {
  const { username, password, loginType, masterKey } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  const trimmedUser = String(username || '').trim().toLowerCase();
  const rateLimitId = `${clientIp}:${trimmedUser || 'anon'}`;

  // Check brute force & rate limiting
  const rateCheck = db.checkRateLimit(rateLimitId);
  if (rateCheck.isLocked) {
    await db.appendAuditLog({
      action: 'LOGIN_RATE_LIMIT_BLOCKED',
      actor: trimmedUser || 'unknown',
      role: 'unknown',
      module: 'AUTH',
      status: 'danger',
      result: 'denied',
      details: `Request blocked: Rate limit lockout active for ${rateCheck.remainingSeconds} seconds.`,
      ipAddress: clientIp
    });

    res.status(429).json({
      success: false,
      isLocked: true,
      remainingSeconds: rateCheck.remainingSeconds,
      error: `Security lockout active. Too many failed login attempts. Please wait ${rateCheck.remainingSeconds} seconds.`
    });
    return;
  }

  if (!trimmedUser) {
    res.status(400).json({ success: false, error: 'Username or email is required.' });
    return;
  }

  const state = db.getState();
  const matchingAccount = state.adminAccounts.find(
    (a) => a.username.toLowerCase() === trimmedUser || a.email.toLowerCase() === trimmedUser
  );

  if (!matchingAccount) {
    const rateResult = db.recordFailedAttempt(rateLimitId);
    await db.appendAuditLog({
      action: 'ADMIN_LOGIN_FAILED',
      actor: trimmedUser,
      role: 'unknown',
      module: 'AUTH',
      status: 'warning',
      result: 'denied',
      details: `Invalid login attempt: Account not found. Remaining attempts: ${rateResult.remainingAttempts}`,
      ipAddress: clientIp
    });

    res.status(401).json({
      success: false,
      error: 'Invalid username or password.',
      remainingAttempts: rateResult.remainingAttempts,
      isLocked: rateResult.isLocked,
      lockoutSeconds: rateResult.remainingSeconds
    });
    return;
  }

  // Suspended account check
  if (matchingAccount.status !== 'active') {
    await db.appendAuditLog({
      action: 'ADMIN_LOGIN_SUSPENDED',
      actor: matchingAccount.username,
      role: matchingAccount.role,
      module: 'AUTH',
      status: 'danger',
      result: 'denied',
      details: `Access denied: Account @${matchingAccount.username} is suspended.`,
      ipAddress: clientIp
    });

    res.status(403).json({
      success: false,
      error: 'This administrator account has been suspended by the Super Admin.'
    });
    return;
  }

  let isAuthenticated = false;
  const isMasterKeyAttempt = loginType === 'master_key' || (masterKey && masterKey.trim().length > 0);

  if (isMasterKeyAttempt) {
    // Admin Master Key Authentication:
    // Requires Username + Master Key
    // Master Key must NEVER by itself authenticate a user.
    // The role identity MUST come from the authoritative user/account record.
    // A Master Key login MUST NEVER downgrade or upgrade roles!
    const enteredPin = String(masterKey || password || '').trim();
    const authoritativeRecoveryPin = state.securityConfig?.recoveryPin?.trim();

    if (!authoritativeRecoveryPin) {
      res.status(500).json({
        success: false,
        error: 'Institutional recovery PIN is not configured on the server. Please contact system administrator.'
      });
      return;
    }

    if (enteredPin === authoritativeRecoveryPin) {
      isAuthenticated = true;
    } else {
      const rateResult = db.recordFailedAttempt(rateLimitId);
      await db.appendAuditLog({
        action: 'MASTER_KEY_LOGIN_FAILED',
        actor: matchingAccount.username,
        role: matchingAccount.role,
        module: 'AUTH',
        status: 'danger',
        result: 'denied',
        details: `Invalid Master Key entered for account @${matchingAccount.username}. Remaining attempts: ${rateResult.remainingAttempts}`,
        ipAddress: clientIp
      });

      res.status(401).json({
        success: false,
        error: 'Invalid Master Recovery Key.',
        remainingAttempts: rateResult.remainingAttempts,
        isLocked: rateResult.isLocked,
        lockoutSeconds: rateResult.remainingSeconds
      });
      return;
    }
  } else {
    // Normal password authentication using modern bcrypt verification
    const enteredPass = String(password || '');
    isAuthenticated = verifyPasswordBcrypt(enteredPass, matchingAccount.passwordHash);

    if (!isAuthenticated) {
      const rateResult = db.recordFailedAttempt(rateLimitId);
      await db.appendAuditLog({
        action: 'ADMIN_LOGIN_FAILED',
        actor: matchingAccount.username,
        role: matchingAccount.role,
        module: 'AUTH',
        status: 'warning',
        result: 'denied',
        details: `Incorrect password attempt for @${matchingAccount.username}. Remaining attempts: ${rateResult.remainingAttempts}`,
        ipAddress: clientIp
      });

      res.status(401).json({
        success: false,
        error: 'Invalid username or password.',
        remainingAttempts: rateResult.remainingAttempts,
        isLocked: rateResult.isLocked,
        lockoutSeconds: rateResult.remainingSeconds
      });
      return;
    }
  }

  if (isAuthenticated) {
    // Reset rate limiter on success
    db.recordSuccessfulAttempt(rateLimitId);

    // Update account lastLogin timestamp in database
    const nowStr = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const updatedAccounts = state.adminAccounts.map((a) =>
      a.id === matchingAccount.id ? { ...a, lastLogin: nowStr } : a
    );
    await db.updateModule('adminAccounts', updatedAccounts, 'System Auth', clientIp);

    // Create secure server-side session with ID regeneration
    const session = db.createSession(matchingAccount, clientIp, userAgent);

    // Set secure HttpOnly cookie for same-origin session
    const timeoutMinutes = state.securityConfig?.sessionTimeoutMinutes || 30;
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('ishwari_session', session.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: timeoutMinutes * 60 * 1000
    });

    await db.appendAuditLog({
      action: isMasterKeyAttempt ? 'ADMIN_MASTER_KEY_LOGIN_SUCCESS' : 'ADMIN_LOGIN_SUCCESS',
      actor: matchingAccount.username,
      role: matchingAccount.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: `Successful login as ${matchingAccount.role === 'super_admin' ? 'Super Admin' : 'Admin'} (${matchingAccount.fullName}) via ${isMasterKeyAttempt ? 'Master Key' : 'password'}.`,
      ipAddress: clientIp
    });

    res.json({
      success: true,
      token: session.token,
      account: {
        id: matchingAccount.id,
        username: matchingAccount.username,
        fullName: matchingAccount.fullName,
        email: matchingAccount.email,
        role: matchingAccount.role,
        permissions: session.permissions,
        status: matchingAccount.status,
        lastLogin: nowStr
      },
      sessionExpiresAt: session.expiresAt
    });
  }
};

apiRouter.post('/auth/login', handleAdminLogin);
apiRouter.post('/login', handleAdminLogin);

// 6. Current Session Validation Endpoint
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const token = extractToken(req);
  const session = db.validateSession(token);

  if (!session) {
    res.status(401).json({ authenticated: false, error: 'Unauthorized: Session invalid or expired' });
    return;
  }

  const state = db.getState();
  const account = state.adminAccounts.find((a) => a.id === session.userId);

  if (!account || account.status !== 'active') {
    db.destroySession(token);
    res.status(401).json({ authenticated: false, reason: 'Account deactivated or deleted' });
    return;
  }

  res.json({
    authenticated: true,
    account: {
      id: account.id,
      username: account.username,
      fullName: account.fullName,
      email: account.email,
      role: account.role,
      permissions: session.permissions,
      status: account.status,
      lastLogin: account.lastLogin
    },
    sessionExpiresAt: session.expiresAt
  });
});

// 7. Secure Logout & Invalidation
apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const token = extractToken(req);
  const session = db.validateSession(token);
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (session) {
    db.destroySession(token);
    db.appendAuditLog({
      action: 'ADMIN_LOGOUT',
      actor: session.username,
      role: session.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: `Administrative session terminated by @${session.username}.`,
      ipAddress: clientIp
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('ishwari_session', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// 7b. Secure Password Change Endpoint
apiRouter.post('/auth/change-password', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const { currentPassword, newPassword } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    return;
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
    return;
  }

  const state = db.getState();
  const accountIndex = state.adminAccounts.findIndex((a) => a.id === session.userId);
  if (accountIndex === -1) {
    res.status(404).json({ success: false, error: 'Account not found.' });
    return;
  }

  const account = state.adminAccounts[accountIndex];
  const isMatch = verifyPasswordBcrypt(currentPassword, account.passwordHash);
  if (!isMatch) {
    await db.appendAuditLog({
      action: 'PASSWORD_CHANGE_FAILED',
      actor: session.username,
      role: session.role,
      module: 'AUTH_ACCOUNT',
      status: 'warning',
      result: 'denied',
      details: `Password change failed: Incorrect current password for @${session.username}.`,
      ipAddress: clientIp
    });

    res.status(400).json({ success: false, error: 'Incorrect current password.' });
    return;
  }

  const newHash = hashPasswordBcrypt(newPassword);
  const updatedAccounts = [...state.adminAccounts];
  updatedAccounts[accountIndex] = {
    ...account,
    passwordHash: newHash
  };

  await db.updateModule('adminAccounts', updatedAccounts, `@${session.username}`, clientIp);

  await db.appendAuditLog({
    action: 'ADMIN_PASSWORD_CHANGED',
    actor: session.username,
    role: session.role,
    module: 'AUTH_ACCOUNT',
    status: 'success',
    result: 'success',
    details: `Password changed successfully for @${session.username}.`,
    ipAddress: clientIp
  });

  res.json({ success: true, message: 'Password updated successfully.' });
});

/* ---------------- AUTHORITATIVE CMS DATA OPERATIONS ---------------- */

// 8. Authorized CMS Module Sync with Backend RBAC Enforcement
apiRouter.post('/cms/sync', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const { module, data, batch, actor } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
  const effectiveActor = actor || `@${session.username} (${session.role})`;

  try {
    if (batch && typeof batch === 'object') {
      // Check permissions for every module in batch
      for (const moduleKey of Object.keys(batch)) {
        const check = db.checkPermission(session, moduleKey);
        if (!check.allowed) {
          await db.appendAuditLog({
            action: 'RBAC_PERMISSION_DENIED',
            actor: session.username,
            role: session.role,
            module: moduleKey,
            status: 'danger',
            result: 'denied',
            details: `Unauthorized batch modification attempted on module [${moduleKey}]: ${check.reason}`,
            ipAddress: clientIp
          });

          res.status(403).json({
            success: false,
            error: `Permission denied for module [${moduleKey}]: ${check.reason}`
          });
          return;
        }
      }

      const result = await db.updateBatch(batch, effectiveActor, clientIp);
      res.json({ success: true, ...result });
      return;
    }

    if (!module || data === undefined) {
      res.status(400).json({ success: false, error: 'Module name and data payload are required' });
      return;
    }

    // Backend RBAC enforcement for the specific module
    const permCheck = db.checkPermission(session, module);
    if (!permCheck.allowed) {
      await db.appendAuditLog({
        action: 'RBAC_PERMISSION_DENIED',
        actor: session.username,
        role: session.role,
        module,
        status: 'danger',
        result: 'denied',
        details: `Unauthorized update attempt on module [${module}]: ${permCheck.reason}`,
        ipAddress: clientIp
      });

      res.status(403).json({
        success: false,
        error: `Permission denied: ${permCheck.reason}`
      });
      return;
    }

    // Backend validation for Document Uploads (Requirement 20: PDF only, max 200 KB)
    if (module === 'documents' && Array.isArray(data)) {
      for (const item of data) {
        if (item.file_name && !item.file_name.toLowerCase().endsWith('.pdf')) {
          res.status(400).json({
            success: false,
            error: `Validation failed: File "${item.file_name}" is not a PDF. Only PDF documents are allowed.`
          });
          return;
        }
        if (item.file_size_kb && item.file_size_kb > 200) {
          res.status(400).json({
            success: false,
            error: `Validation failed: File "${item.file_name || 'Document'}" size (${item.file_size_kb} KB) exceeds the maximum allowed limit of 200 KB.`
          });
          return;
        }
      }
    }

    // Backend validation for Curriculum Guidelines (Requirement: PDF only, max 10 MB, required fields)
    if (module === 'curriculumGuidelines' && Array.isArray(data)) {
      for (const item of data) {
        if (!item.title_en || !String(item.title_en).trim()) {
          res.status(400).json({
            success: false,
            error: 'Validation failed: Curriculum guideline title is required.'
          });
          return;
        }
        if (!item.subject || !String(item.subject).trim()) {
          res.status(400).json({
            success: false,
            error: `Validation failed: Subject is required for guideline "${item.title_en}".`
          });
          return;
        }
        if (!item.class_level || !String(item.class_level).trim()) {
          res.status(400).json({
            success: false,
            error: `Validation failed: Academic level / class is required for guideline "${item.title_en}".`
          });
          return;
        }
        if (item.status && item.status !== 'published' && item.status !== 'unpublished') {
          res.status(400).json({
            success: false,
            error: `Validation failed: Invalid status "${item.status}". Status must be "published" or "unpublished".`
          });
          return;
        }
        if (item.file_size_bytes && item.file_size_bytes > 10 * 1024 * 1024) {
          res.status(400).json({
            success: false,
            error: `Validation failed: Guideline "${item.title_en}" PDF size exceeds maximum allowed limit of 10 MB.`
          });
          return;
        }
      }
    }

    // Backend validation for Vacancies (Career / Notice module)
    if (module === 'vacancies' && Array.isArray(data)) {
      for (const item of data) {
        if (!item.title_en || !String(item.title_en).trim()) {
          res.status(400).json({
            success: false,
            error: 'Validation failed: Vacancy job title is required.'
          });
          return;
        }

        // Apply Now Validation: If Apply Now is enabled, a valid application URL is strictly required
        if (item.apply_now_enabled) {
          if (!item.application_url || !String(item.application_url).trim()) {
            res.status(400).json({
              success: false,
              error: `Validation failed: Apply Now cannot be enabled for "${item.title_en}" without a valid application destination URL.`
            });
            return;
          }
        }

        if (item.application_url && typeof item.application_url === 'string') {
          const trimmedUrl = item.application_url.trim();
          if (trimmedUrl) {
            if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(trimmedUrl)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Unsafe protocol in application URL for "${item.title_en}".`
              });
              return;
            }
            if (item.application_method === 'google_form') {
              const isGoogleForm = /^https:\/\/(forms\.gle\/[a-zA-Z0-9_-]+|docs\.google\.com\/forms\/[a-zA-Z0-9_\-\/]+)/i.test(trimmedUrl);
              if (!isGoogleForm) {
                res.status(400).json({
                  success: false,
                  error: `Validation failed: Application URL for "${item.title_en}" must be a valid Google Form URL (https://forms.gle/... or https://docs.google.com/forms/...).`
                });
                return;
              }
            } else if (!/^https?:\/\//i.test(trimmedUrl)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Application URL for "${item.title_en}" must start with https://`
              });
              return;
            }
          }
        }
      }
    }

    // Backend validation for About Sections (Background Media: JPG, PNG, GIF, valid URLs)
    if (module === 'aboutSections' && Array.isArray(data)) {
      for (const item of data) {
        if (item.image && typeof item.image === 'string') {
          const trimmedImg = item.image.trim();
          // Reject unsafe protocols
          if (/^(javascript:|data:(?!image\/(png|jpeg|jpg|gif|webp);base64)|vbscript:|file:|blob:)/i.test(trimmedImg)) {
            res.status(400).json({
              success: false,
              error: `Validation failed: Unsafe media protocol in section "${item.title_en || 'About Section'}". Only HTTPS, HTTP, local uploaded media or safe image data are allowed.`
            });
            return;
          }
        }
      }
    }

    // Backend validation for School & SiteConfig (History Background Media)
    if (module === 'school' && data && typeof data === 'object') {
      const bgImg = (data as any).history_bg_image;
      if (bgImg && typeof bgImg === 'string') {
        const trimmed = bgImg.trim();
        if (/^(javascript:|data:(?!image\/(png|jpeg|jpg|gif|webp);base64)|vbscript:|file:|blob:)/i.test(trimmed)) {
          res.status(400).json({
            success: false,
            error: 'Validation failed: Unsafe media protocol in School History background. Only HTTPS, HTTP, local uploaded media or safe image data are allowed.'
          });
          return;
        }
      }
    }

    if (module === 'siteConfig' && data && typeof data === 'object') {
      const bgImg = (data as any).historyBgImage;
      if (bgImg && typeof bgImg === 'string') {
        const trimmed = bgImg.trim();
        if (/^(javascript:|data:(?!image\/(png|jpeg|jpg|gif|webp);base64)|vbscript:|file:|blob:)/i.test(trimmed)) {
          res.status(400).json({
            success: false,
            error: 'Validation failed: Unsafe media protocol in School History background. Only HTTPS, HTTP, local uploaded media or safe image data are allowed.'
          });
          return;
        }
      }

      // Validate Social Media Links
      const socialLinks = (data as any).socialLinks;
      if (socialLinks !== undefined) {
        if (!Array.isArray(socialLinks)) {
          res.status(400).json({
            success: false,
            error: 'Validation failed: Social links must be an array.'
          });
          return;
        }

        for (const item of socialLinks) {
          if (!item || typeof item !== 'object') continue;
          const url = typeof item.url === 'string' ? item.url.trim() : '';
          if (url) {
            if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Unsafe URL scheme detected in social link for platform "${item.platform || 'unknown'}". Executable or data protocols are strictly forbidden.`
              });
              return;
            }
            if (!/^https?:\/\//i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Invalid URL in social link for platform "${item.platform || 'unknown'}". URLs must start with https:// or http://.`
              });
              return;
            }
          }
        }
      }

      // Validate Useful Links
      const usefulLinks = (data as any).usefulLinks;
      if (usefulLinks !== undefined) {
        if (!Array.isArray(usefulLinks)) {
          res.status(400).json({
            success: false,
            error: 'Validation failed: Useful links must be an array.'
          });
          return;
        }

        for (const item of usefulLinks) {
          if (!item || typeof item !== 'object') continue;
          const url = typeof item.url === 'string' ? item.url.trim() : '';
          if (url) {
            if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Unsafe URL scheme detected in useful link "${item.titleEn || 'unknown'}". Executable or data protocols are strictly forbidden.`
              });
              return;
            }
            if (!/^https?:\/\//i.test(url)) {
              res.status(400).json({
                success: false,
                error: `Validation failed: Invalid URL in useful link "${item.titleEn || 'unknown'}". URLs must start with https:// or http://.`
              });
              return;
            }
          }
        }
      }

      // Validate Map Embed URL if provided
      const mapEmbed = (data as any).footerMapEmbedUrl;
      if (mapEmbed && typeof mapEmbed === 'string') {
        const trimmedMap = mapEmbed.trim();
        if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(trimmedMap)) {
          res.status(400).json({
            success: false,
            error: 'Validation failed: Unsafe URL scheme detected in footer map embed URL.'
          });
          return;
        }
      }
    }

    const result = await db.updateModule(module, data, effectiveActor, clientIp);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Error during CMS sync:', err);
    res.status(500).json({ success: false, error: err?.message || 'Failed to update CMS database' });
  }
});

// 9. Factory Reset Database (Strict Super Admin Only)
apiRouter.post('/cms/reset', requireAuth, async (req: Request, res: Response) => {
  const session: ServerSession = (req as any).session;
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

  if (session.role !== 'super_admin') {
    await db.appendAuditLog({
      action: 'SECURITY_VIOLATION_ATTEMPT',
      actor: session.username,
      role: session.role,
      module: 'SYSTEM',
      status: 'danger',
      result: 'denied',
      details: 'Unauthorized attempt by standard admin to execute database factory reset.',
      ipAddress: clientIp
    });

    res.status(403).json({
      success: false,
      error: 'Access denied. Database factory reset is restricted exclusively to the Super Administrator.'
    });
    return;
  }

  try {
    const result = await db.resetToDefaults(`@${session.username} (Super Admin)`, clientIp);
    res.json({ success: true, ...result });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to reset database' });
  }
});

// 10. Public Contact Message Submission
apiRouter.post('/contact/submit', async (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !phone || !message) {
    res.status(400).json({ success: false, error: 'Name, phone, and message are required fields' });
    return;
  }

  try {
    const newMsg = await db.addContactMessage({
      name: String(name).trim(),
      email: String(email || '').trim(),
      phone: String(phone).trim(),
      subject: String(subject || 'general').trim(),
      message: String(message).trim()
    });

    res.json({ success: true, message: newMsg });
  } catch (err: any) {
    console.error('Failed to submit contact message:', err);
    res.status(500).json({ success: false, error: 'Failed to record message in database' });
  }
});

// 11. Secure File Upload Validator (Images & PDF documents)
apiRouter.post('/cms/upload', requireAuth, (req: Request, res: Response) => {
  const { fileName, fileType, base64Data, category } = req.body;

  if (!base64Data || !fileName) {
    res.status(400).json({ success: false, error: 'Missing file data or file name' });
    return;
  }

  // Decode buffer to verify true binary length and magic bytes
  const commaIdx = base64Data.indexOf(',');
  const rawBase64 = commaIdx >= 0 ? base64Data.slice(commaIdx + 1) : base64Data;
  const buffer = Buffer.from(rawBase64, 'base64');
  const sizeInBytes = buffer.length;

  if (category === 'curriculum_guideline' || category === 'curriculum') {
    // Curriculum Guidelines: PDF only, max 10 MB limit
    if (!fileName.toLowerCase().endsWith('.pdf') && !fileType?.includes('pdf')) {
      res.status(400).json({ success: false, error: 'Curriculum guidelines must be in PDF format only (.pdf)' });
      return;
    }
    if (sizeInBytes > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'Curriculum guideline PDF size exceeds maximum 10 MB threshold' });
      return;
    }
    // Verify magic bytes for PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    const isPdf = buffer.length >= 5 && buffer.toString('utf8', 0, 5) === '%PDF-';
    if (!isPdf) {
      res.status(400).json({ success: false, error: 'Invalid file signature. File is not a valid PDF document.' });
      return;
    }

    // Persist file in dedicated backend uploads folder
    const currUploadDir = getBackendUploadDir('curriculum');
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `curr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBaseName}`;
    const filePath = path.join(currUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const formattedSize = sizeInBytes < 1024 * 1024
      ? `${Math.round(sizeInBytes / 1024)} KB`
      : `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;

    res.json({
      success: true,
      url: `/api/curriculum/file/${uniqueFileName}`,
      fileName: fileName,
      uniqueFileName,
      size: sizeInBytes,
      formattedSize,
      base64Data: base64Data
    });
    return;
  } else if (category === 'vacancy' || category === 'career' || category === 'vacancy_pdf') {
    // Vacancy PDF: PDF only, max 10 MB limit
    if (!fileName.toLowerCase().endsWith('.pdf') && !fileType?.includes('pdf')) {
      res.status(400).json({ success: false, error: 'Vacancy attachments must be in PDF format only (.pdf)' });
      return;
    }
    if (sizeInBytes > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'Vacancy PDF size exceeds maximum 10 MB threshold' });
      return;
    }
    // Verify magic bytes for PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    const isPdf = buffer.length >= 5 && buffer.toString('utf8', 0, 5) === '%PDF-';
    if (!isPdf) {
      res.status(400).json({ success: false, error: 'Invalid file signature. File is not a valid PDF document.' });
      return;
    }

    // Persist file in dedicated backend uploads folder backend/uploads/vacancies
    const vacUploadDir = getBackendUploadDir('vacancies');
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `vac-${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBaseName}`;
    const filePath = path.join(vacUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const formattedSize = sizeInBytes < 1024 * 1024
      ? `${Math.round(sizeInBytes / 1024)} KB`
      : `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;

    res.json({
      success: true,
      url: `/api/vacancy/file/${uniqueFileName}`,
      fileName: fileName,
      uniqueFileName,
      size: sizeInBytes,
      formattedSize,
      base64Data: base64Data
    });
    return;
  } else if (category === 'document') {
    // Must be PDF and <= 200 KB
    if (!fileName.toLowerCase().endsWith('.pdf') && !fileType?.includes('pdf')) {
      res.status(400).json({ success: false, error: 'Official documents must be PDF format only (.pdf)' });
      return;
    }
    if (sizeInBytes > 200 * 1024) {
      res.status(400).json({ success: false, error: 'Document size exceeds maximum 200 KB threshold' });
      return;
    }
    // Magic bytes verification for PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
    const isPdf = buffer.length >= 5 && buffer.toString('utf8', 0, 5) === '%PDF-';
    if (!isPdf) {
      res.status(400).json({ success: false, error: 'Invalid file signature. File is not a valid PDF document.' });
      return;
    }
  } else if (category === 'about_image' || category === 'about') {
    // About page inline & section media: PNG, JPG, JPEG, GIF, Max 1 MB (1024 * 1024 bytes)
    const ext = path.extname(fileName).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      res.status(400).json({ success: false, error: 'About page background media must be JPG, JPEG, PNG, or GIF format only.' });
      return;
    }
    if (fileType && !['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(fileType.toLowerCase())) {
      res.status(400).json({ success: false, error: 'Invalid MIME type. Supported: image/jpeg, image/png, image/gif.' });
      return;
    }
    if (sizeInBytes > 1024 * 1024) {
      res.status(400).json({
        success: false,
        error: `Media size exceeds the maximum allowed 1 MB limit (${(sizeInBytes / 1024).toFixed(0)} KB)`
      });
      return;
    }
    // Verify magic bytes for JPEG / PNG / GIF
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isGif = buffer.length >= 6 && (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a');
    if (!isJpeg && !isPng && !isGif) {
      res.status(400).json({
        success: false,
        error: 'Invalid file signature. Binary integrity check failed for JPG/PNG/GIF.'
      });
      return;
    }

    const mediaType: 'gif' | 'image' = isGif ? 'gif' : 'image';

    // Persist file in dedicated backend uploads folder backend/uploads/about
    const aboutUploadDir = getBackendUploadDir('about');
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `about-${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBaseName}`;
    const filePath = path.join(aboutUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      url: `/api/about/file/${uniqueFileName}`,
      fileName,
      uniqueFileName,
      size: sizeInBytes,
      mediaType,
      base64Data: base64Data
    });
    return;
  } else if (category === 'history_bg' || category === 'history') {
    // School History background media: JPG, JPEG, PNG, GIF, Max 2 MB (2 * 1024 * 1024 bytes)
    const ext = path.extname(fileName).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
      res.status(400).json({ success: false, error: 'Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB.' });
      return;
    }
    if (fileType && !['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(fileType.toLowerCase())) {
      res.status(400).json({ success: false, error: 'Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB.' });
      return;
    }
    if (sizeInBytes > 2 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        error: 'Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB.'
      });
      return;
    }
    // Verify magic bytes for JPEG / PNG / GIF
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isGif = buffer.length >= 6 && (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a');
    if (!isJpeg && !isPng && !isGif) {
      res.status(400).json({
        success: false,
        error: 'Background image must be JPG, JPEG, PNG or GIF and must not exceed 2 MB.'
      });
      return;
    }

    const mediaType: 'gif' | 'image' = isGif ? 'gif' : 'image';

    // Persist file in dedicated backend uploads folder backend/uploads/history
    const historyUploadDir = getBackendUploadDir('history');
    const safeBaseName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `history-${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBaseName}`;
    const filePath = path.join(historyUploadDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      url: `/api/history/file/${uniqueFileName}`,
      fileName,
      uniqueFileName,
      size: sizeInBytes,
      mediaType,
      base64Data: base64Data
    });
    return;
  } else {
    // Images: JPG, PNG, WebP, GIF <= 5 MB
    if (sizeInBytes > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'Image size exceeds maximum 5 MB limit' });
      return;
    }
    // Verify magic bytes for images:
    // JPEG: FF D8 FF
    // PNG: 89 50 4E 47
    // WebP: RIFF ... WEBP
    // GIF: GIF87a or GIF89a
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer.length >= 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    const isGif = buffer.length >= 6 && (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a');
    if (!isJpeg && !isPng && !isWebp && !isGif) {
      res.status(400).json({ success: false, error: 'Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP, GIF.' });
      return;
    }
  }

  res.json({
    success: true,
    url: base64Data,
    fileName,
    size: sizeInBytes
  });
});

// 12. Public & Filtered Curriculum Guidelines API
apiRouter.get('/curriculum', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  const token = extractToken(req);
  const session = db.validateSession(token);
  const state = db.getState();
  let list = [...(state.curriculumGuidelines || [])];

  // Unauthenticated requests strictly receive ONLY published items
  if (!session) {
    list = list.filter((item) => item.status === 'published');
  } else if (req.query.status && req.query.status !== 'all') {
    list = list.filter((item) => item.status === req.query.status);
  }

  // Filter by query string
  if (req.query.q) {
    const q = String(req.query.q).toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.title_en?.toLowerCase().includes(q) ||
        item.title_np?.toLowerCase().includes(q) ||
        item.subject?.toLowerCase().includes(q) ||
        item.class_level?.toLowerCase().includes(q) ||
        item.description_en?.toLowerCase().includes(q) ||
        item.description_np?.toLowerCase().includes(q) ||
        item.original_filename?.toLowerCase().includes(q)
    );
  }

  // Filter by Class / Level
  if (req.query.class_level && req.query.class_level !== 'all') {
    const targetClass = String(req.query.class_level).toLowerCase();
    list = list.filter(
      (item) =>
        item.class_level?.toLowerCase() === targetClass ||
        item.academic_level_id?.toLowerCase() === targetClass
    );
  }

  // Filter by Subject
  if (req.query.subject && req.query.subject !== 'all') {
    const targetSubject = String(req.query.subject).toLowerCase();
    list = list.filter((item) => item.subject?.toLowerCase() === targetSubject);
  }

  // Sort by display_order then updated_at
  list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// 13. Serve Curriculum PDF Files with Security Headers and Path Traversal Protection
apiRouter.get('/curriculum/file/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);

  // Validate filename strictly against traversal attacks
  if (!filename.match(/^[a-zA-Z0-9._-]+\.pdf$/i)) {
    res.status(400).json({ success: false, error: 'Invalid file identifier' });
    return;
  }

  const filePath = resolveUploadFilePath('curriculum', filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: 'Curriculum PDF resource not found on server' });
    return;
  }

  const stat = fs.statSync(filePath);
  const download = req.query.download === '1' || req.query.download === 'true';
  const originalName = req.query.name ? String(req.query.name) : filename;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', stat.size);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader(
    'Content-Disposition',
    `${download ? 'attachment' : 'inline'}; filename="${encodeURIComponent(originalName)}"`
  );
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// 14. History Milestones API
apiRouter.get('/history', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  const token = extractToken(req);
  const session = db.validateSession(token);
  const state = db.getState();
  let list = [...(state.history || [])];

  if (!session) {
    list = list.filter((item: any) => item.status !== 'unpublished' && item.is_enabled !== false);
  }

  // Sort by display_order if present, then preserve array sequence
  list.sort((a: any, b: any) => {
    const orderA = a.display_order !== undefined ? a.display_order : 999;
    const orderB = b.display_order !== undefined ? b.display_order : 999;
    return orderA - orderB;
  });

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// 15. Serve About Page Media (Images & GIFs) with Security Headers and Path Traversal Protection
apiRouter.get('/about/file/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: 'Invalid file identifier' });
    return;
  }
  const filePath = resolveUploadFilePath('about', filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: 'About media resource not found' });
    return;
  }
  const ext = path.extname(filename).toLowerCase();
  const mimeType = ext === '.gif' ? 'image/gif' : ext === '.png' ? 'image/png' : 'image/jpeg';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.sendFile(filePath);
});

apiRouter.delete('/about/file/:filename', requireAuth, (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: 'Invalid file identifier' });
    return;
  }
  const filePath = resolveUploadFilePath('about', filename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Media file deleted successfully' });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to delete file' });
      return;
    }
  }
  res.json({ success: true, message: 'File does not exist or already removed' });
});

// 16. Serve School History Page Media (Images & GIFs) with Security Headers and Path Traversal Protection
apiRouter.get('/history/file/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: 'Invalid file identifier' });
    return;
  }
  const filePath = resolveUploadFilePath('history', filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: 'History media resource not found' });
    return;
  }
  const ext = path.extname(filename).toLowerCase();
  const mimeType = ext === '.gif' ? 'image/gif' : ext === '.png' ? 'image/png' : 'image/jpeg';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.sendFile(filePath);
});

apiRouter.delete('/history/file/:filename', requireAuth, (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif)$/i)) {
    res.status(400).json({ success: false, error: 'Invalid file identifier' });
    return;
  }
  const filePath = resolveUploadFilePath('history', filename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'History media file deleted successfully' });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to delete file' });
      return;
    }
  }
  res.json({ success: true, message: 'File does not exist or already removed' });
});

// 17. Serve Vacancy / Career PDF Documents with Security Headers and Path Traversal Protection
apiRouter.get('/vacancy/file/:filename', (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.pdf$/i)) {
    res.status(400).json({ success: false, error: 'Invalid file identifier' });
    return;
  }
  const filePath = resolveUploadFilePath('vacancies', filename);
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).json({ success: false, error: 'Vacancy document not found' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(filePath);
});

apiRouter.delete('/vacancy/file/:filename', requireAuth, (req: Request, res: Response) => {
  const filename = path.basename(req.params.filename);
  if (!filename.match(/^[a-zA-Z0-9._-]+\.pdf$/i)) {
    res.status(400).json({ success: false, error: 'Invalid file identifier' });
    return;
  }
  const filePath = resolveUploadFilePath('vacancies', filename);
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Vacancy PDF deleted successfully' });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to delete file' });
      return;
    }
  }
  res.json({ success: true, message: 'File does not exist or already removed' });
});
