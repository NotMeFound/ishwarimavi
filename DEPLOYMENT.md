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
|   Database: data/cms_database.json (Atomic persistence)     |
+-------------------------------------------------------------+
```

### Advantages of Same-Origin Deployment:
- **Zero CORS issues**: Browser cookies (`ishwari_session`) and Bearer tokens are same-origin.
- **Single deployment target**: One git push builds and deploys both client and server.
- **Zero cold-start race conditions**: The React client communicates with the local Express server on the same host.

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

## 4. Default Verified Credentials

- **Super Administrator**:
  - Username: `ishwari-superadmin`
  - Password: `Ishwari12@`
- **School Operations Admin**:
  - Username: `ishwari`
  - Password: `Ishwari12@`
- **Emergency Recovery Master PIN**:
  - PIN: `782035`

