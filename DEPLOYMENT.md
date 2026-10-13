# Ishwari Secondary School - Production Deployment Architecture Guide

This document outlines the authoritative production architecture, audit findings, and configuration instructions for deploying the **Single-Origin Full-Stack Application on Render** (or split deployment with Vercel frontend and Render backend).

---

## 1. Primary Same-Origin Architecture (Recommended)

In production on Render, the application runs as a **single-origin full-stack Node.js/Express service**:

```
+-------------------------------------------------------------+
|               RENDER WEB SERVICE (Port 10000 / $PORT)       |
|                                                             |
|   / (All Public Pages & CMS)   ---> Express static (dist/)  |
|   /admin, /superadmin         ---> React SPA Client Router  |
|   /api/*                       ---> Express API Router      |
|   /api/health, /healthz       ---> Health Check Endpoints   |
|   /api/auth/*                  ---> Authentication Service  |
|   /backend/uploads/*           ---> File Storage            |
|                                                             |
|   Database: Firestore (Firebase Admin SDK)                  |
+-------------------------------------------------------------+
```

### Advantages of Same-Origin Deployment:
- **Zero CORS issues**: Browser cookies (`ishwari_session`) and Bearer tokens are same-origin.
- **Single deployment target**: One git push builds and deploys both client and server.
- **Zero cold-start race conditions**: The React client communicates with the local Express server on the same host.
- **Server-only database access**: Firestore access uses the Firebase Admin SDK; client reads and writes are denied by `firestore.rules`.

---

## 2. Root Cause Analysis & Solutions

### A. Render Error: `Cannot find module '/opt/render/project/src/dist/server.cjs'`
* **Root Cause**:
  1. Render runs `bun run start` or `npm start` which previously pointed to `node dist/server.cjs` or `node dist/server.js`.
  2. If Render's build command was set to default `npm install` or `vite build` without running `npm run build:server`, the compiled server bundles did not exist in `dist/`.
  3. Render lacked a committed `render.yaml`, leaving build and start commands to platform defaults.
* **Resolution**:
  - Committed `render.yaml` directly to the repository defining `buildCommand: npm run build` and `startCommand: npm start`.
  - Added compile-time definition `--define:IS_PRODUCTION_BUILD=true` to `esbuild` for both ESM (`dist/server.js`) and CommonJS (`dist/server.cjs`).
  - Added self-healing fallbacks in root `server.js` and `server.cjs`: if bundles are ever missing when launched, they automatically compile before booting.
  - Hardened `backend/server.ts` to detect production mode reliably, completely eliminating any accidental Vite dev middleware imports.

### B. Admin Login & Authentication Stability
* **Root Cause**:
  1. A client-side session lock (`acquireSessionLock`) was falsely rejecting verified users if a stale `localStorage` entry existed from an earlier tab or session.
  2. Sessions were not verified with `/api/auth/me` on mount, causing desynchronization on page refresh.
* **Resolution**:
  - Updated `acquireSessionLock` to allow verified authentications to claim the lock.
  - Added mount-time authoritative session validation (`apiClient.checkAuth()`) in `AdminView.tsx`.
  - Token is safely synchronized across `sessionStorage` and `localStorage`, ensuring refresh persistence and multi-tab synchronization.

---

## 3. Render Deployment Steps

1. Create a **Web Service** on [Render](https://render.com).
2. Connect your Git repository. Render will automatically detect `render.yaml`.
3. If setting manually:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Set **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render provides this automatically)
5. Deploy. The service will build the client, build the server, and launch the single-origin portal.

---

## 4. Database and administrator security

1. Create a Firebase service account with access only to the Firestore database used by this application. Add its JSON securely as the server-only `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable. Application Default Credentials may be used when provided by the hosting environment.
2. Set `FIREBASE_PROJECT_ID` and `FIRESTORE_DATABASE_ID` for the intended Firebase project and database.
3. Before first initialization, configure `SUPER_ADMIN_BOOTSTRAP_USERNAME` and a unique `SUPER_ADMIN_BOOTSTRAP_PASSWORD` of at least 14 characters. The server creates the initial Super Admin from these values. For existing Firestore data containing the published seeded administrator hash, configure these values before deployment so migration replaces the Super Admin credential and disables the other seeded accounts.
4. Set `SUPER_ADMIN_RECOVERY_SECRET` to a separate, randomly generated secret of at least 32 characters. Store it only in the hosting provider's secret manager.
5. Deploy the Firestore rules from this repository using the Firebase CLI (`firebase deploy --only firestore:rules --project <FIREBASE_PROJECT_ID>`). The rules deny all direct client access; the trusted server uses the Firebase Admin SDK.
6. Do not restore or reuse credentials previously published in this repository. Rotate any live administrator credentials and recovery secrets independently, and revoke service-account keys that may have been exposed.

The checked-in `.env.example` contains placeholders only. Never commit service-account credentials, bootstrap passwords, or recovery secrets.
