# Ishwari Secondary School - Code Organization & Architecture

This repository is structured into two primary source-code domains separated strictly by responsibility:
- **`frontend/`**: Everything responsible for UI display, user interactions, public pages, admin interfaces, and styling.
- **`backend/`**: Everything responsible for server-side processing, APIs, authentication, authorization, database storage, and file uploads.

---

## 1. Directory Tree & Responsibility Breakdown

```text
ishwari-secondary-school/
│
├── frontend/                               # PURE FRONTEND / USER INTERFACE
│   ├── components/                         # Reusable UI components (Header, Footer, Modals, Uploaders, Controls)
│   ├── views/                              # Public views & pages (Home, About, Notices, Career, Gallery, Contact, etc.)
│   │   └── admin/                          # Administrative CMS views (NoticesTab, StaffTab, CurriculumTab, WebsiteTab)
│   ├── services/                           # Client-side API callers (apiClient.ts)
│   ├── utils/                              # Frontend helpers, formatters, storage & URL resolvers
│   ├── types/                              # Frontend state and presentation interfaces
│   ├── styles/                             # Global Tailwind CSS and typography
│   ├── data/                               # Client baseline content definitions
│   ├── php/                                # PHP UI Templates (Pure presentation, NO DB queries)
│   │   ├── admin/                          # Admin UI views (dashboard.php, login.php, notices.php, settings.php)
│   │   ├── components/                     # Header, navbar, footer, search modal templates
│   │   ├── pages/                          # Public institutional pages (home.php, about.php, notices.php, etc.)
│   │   ├── layouts/                        # Base app layout wrapper (app.php)
│   │   └── assets/                         # Frontend CSS and client JavaScript
│   ├── App.tsx                             # Main React Single Page Application orchestrator
│   └── main.tsx                            # React DOM root entry point
│
├── backend/                                # PURE BACKEND / SERVER & DATA
│   ├── app.ts                              # Express application setup, CORS policy, JSON error handling
│   ├── routes.ts                           # Node.js API router (/api/auth, /api/cms, /api/contact, /api/health)
│   ├── db.ts                               # Authoritative CMS database manager & transactional writer
│   ├── server.ts                           # Backend server entry point (Node.js / Express)
│   ├── types.ts                            # Backend database schemas, admin accounts, and API contract types
│   ├── database/                           # Persistent JSON database (cms_database.json) and SQL schemas
│   ├── uploads/                            # Server-managed file storage (curriculum PDFs, career documents, media)
│   └── php/                                # PHP Backend Processors & APIs
│       ├── config/                         # Database credentials, constants, and session settings
│       ├── database/                       # PDO database connection handler (getDb())
│       ├── auth/                           # Authentication processors (login.php, logout.php)
│       ├── api/                            # Backend JSON API endpoints (notices.php, settings.php, health.php)
│       └── utils/                          # Security helpers, CSRF verification, input sanitization
│
├── data/                                   # Database compatibility directory (cms_database.json)
├── public/                                 # Static public assets (icons, favicons, manifest)
├── dist/                                   # Compiled production distribution (client SPA + server bundles)
│   ├── index.html                          # Bundled client SPA
│   ├── server.js                           # Production ESM backend bundle
│   └── server.cjs                          # Production CommonJS backend bundle
│
├── server.ts                               # Root bootstrap delegate (for local tsx development)
├── index.html                              # Web entry point
├── index.php                               # PHP web front controller
├── admin.php                               # PHP admin portal gateway
├── package.json                            # Package scripts and dependencies
├── tsconfig.json                           # TypeScript configuration with path aliases
├── vite.config.ts                          # Vite bundler & dev server configuration
└── vercel.json                             # Vercel Single Page Application router rules
```

---

## 2. Separation of Responsibilities

### Frontend Rules Enforced
- **Zero Database Connections**: Frontend code never includes MySQL connection credentials, SQL queries, or direct database access.
- **Zero Sensitive Password Logic**: Passwords are never verified on the frontend; credentials are submitted to `/api/auth/login` or `/backend/php/auth/login.php`.
- **Pure Presentation**: All admin pages (`frontend/views/admin/` and `frontend/php/admin/`) contain only HTML, styling, form inputs, loading states, and client validation.

### Backend Rules Enforced
- **JSON API Standard**: All API endpoints return consistent JSON responses (`{ success: true, data: ... }` or `{ success: false, error: ... }`).
- **Server-Side Security**: Password hashing with bcrypt, session and JWT management, rate limiting, and RBAC authorization live exclusively in `backend/`.
- **Authoritative Storage**: Persistent state is managed in `backend/database/` with ACID-like atomic writes and automated backups.

---

## 3. Production Build & Deployment Artifacts

### Render (Backend Web Service)
- **Build Command**: `npm run build`
  - Compiles frontend client assets via `vite build`.
  - Compiles `backend/server.ts` into both `dist/server.js` (ESM) and `dist/server.cjs` (CJS) via `esbuild`.
- **Start Command**: `npm start` (or `bun run start`), which runs `node dist/server.js` or `node dist/server.cjs`.
- **Environment**: Set `NODE_ENV=production` and `FRONTEND_URL` for CORS.

### Vercel (Frontend React SPA)
- **Framework**: Vite
- **Build Command**: `npm run build:client`
- **Output Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://your-backend.onrender.com`
