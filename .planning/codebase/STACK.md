# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- TypeScript 5.4 - All source code (client and server)

**Secondary:**
- SQL - Drizzle migrations and raw Supabase RLS policies in `supabase/migrations/`
- HTML/CSS - Email templates and frontend markup

## Runtime

**Environment:**
- Node.js 20 (Alpine, per `Dockerfile`; dev machine running v24.13.0)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core (Frontend):**
- React 18.2 - UI rendering (`src/main.tsx`)
- Vite 5.1 - Dev server (port 9000) and production build (`vite.config.ts`)
- wouter 3.0 - Client-side routing (lightweight alternative to react-router)
- TailwindCSS 3.4 - Utility-first CSS (`tailwind.config.ts`)
- shadcn/ui (Radix UI) - Component primitives under `src/components/ui/` (`components.json`)

**Core (Backend):**
- Express 5.0 (beta) - HTTP server (`src/server/index.ts`)
- tsx 4.7 - TypeScript execution for dev server (`npm run dev:server`)

**Forms & Validation:**
- react-hook-form 7.51 - Form state management
- Zod 3.22 - Schema validation (shared client + server)
- @hookform/resolvers 3.3 - Connects Zod schemas to react-hook-form

**Data Fetching:**
- @tanstack/react-query 5.28 - Server state management with caching and auto-refetch

**UI Components:**
- @radix-ui/* - Full suite of headless primitives (accordion, dialog, dropdown, select, tabs, toast, etc.)
- lucide-react 0.358 - Icon set
- recharts 2.12 - Analytics charts
- react-quill-new 3.8 - Rich text editor for email composition (`src/components/`)
- react-markdown 9.0 - Markdown rendering
- cmdk 1.0 - Command palette component

**Testing:**
- None configured

**Build/Dev:**
- esbuild - Used via `build:api` script for Vercel serverless bundle
- concurrently 8.2 - Runs client and server in parallel (`npm run dev`)
- drizzle-kit 0.20 - Schema generation and migration tooling

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.39 - Auth client (frontend + backend token validation)
- `drizzle-orm` 0.30 + `postgres` 3.4 - Database ORM + raw PostgreSQL driver (Supavisor pooler on port 6543)
- `nodemailer` 6.9 - SMTP email sending for outbound messages
- `smtp-server` 3.18 - Native SMTP server (submission port 587, inbound port 25)
- `imapflow` 1.2 - IMAP client for syncing external mailboxes
- `imap` 0.8 - Lower-level IMAP client used alongside imapflow
- `mailparser` 3.6 - Parsing raw MIME email messages
- `node-cron` 4.2 - Background job scheduler (`src/server/jobs/index.ts`)

**Infrastructure:**
- `helmet` 7.1 - HTTP security headers on Express
- `express-rate-limit` 7.2 - Rate limiting (global 500 req/15min prod, auth 5 req/15min, tracking 100 req/min)
- `cors` 2.8 - CORS middleware scoped to `FRONTEND_URL`
- `jsonwebtoken` 9.0 - JWT signing for SMTP/IMAP authentication
- `bcrypt` 6.0 - Password hashing for native mail auth
- `uuid` 9.0 - UUID generation throughout
- `date-fns` 3.6 + `date-fns-tz` 3.1 - Date formatting and timezone handling
- `lodash` 4.17 - Utility functions
- `html-to-text` 9.0 - Email HTML to plain text conversion
- `drizzle-zod` 0.5 - Auto-generates Zod schemas from Drizzle table definitions

## Configuration

**Environment:**
- Loaded via `dotenv` in server entry (`import 'dotenv/config'` at top of `src/server/index.ts`)
- Client-side config served via `/app-config.js` endpoint (injected into `window.__APP_CONFIG__`) to support runtime config without rebuild
- `src/lib/supabase.ts` reads from `window.__APP_CONFIG__` first, then `import.meta.env`
- `.env.example` documents all required and optional vars

**Required vars:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `DATABASE_URL` (Supabase Supavisor pooler connection string, port 6543)
- `JWT_SECRET`, `ENCRYPTION_KEY`, `OUTLOOK_TOKEN_ENCRYPTION_KEY`

**Optional vars:**
- `PORT` (default 9001), `NODE_ENV`, `FRONTEND_URL` (default http://localhost:9000)
- `SMTP_HOST/PORT/USER/PASS/FROM` (outbound relay)
- `MAIL_HOST`, `MAIL_DOMAIN`, `SMTP_SUBMISSION_PORT` (2587 dev / 587 prod), `IMAP_PORT` (2993 dev / 993 prod)
- `MAIL_TLS_CERT_PATH`, `MAIL_TLS_KEY_PATH` (production TLS)
- `ENABLE_MAIL_SERVER` (set to `true` to start SMTP/IMAP on Railway)
- `DB_POOL_MAX` (default 20), `DB_IDLE_TIMEOUT_SECONDS` (default 10), `DB_CONNECT_TIMEOUT_SECONDS` (default 30)
- `APP_COMPANY_NAME`, `APP_APPLICATION_NAME`, `VITE_APP_NAME`

**Build:**
- `tsconfig.json` - Client TypeScript (targets ESNext/bundler, excludes server + db dirs)
- `tsconfig.server.json` - Server TypeScript (targets CommonJS/Node, emits to `dist/`)
- `tsconfig.node.json` - Vite config compilation
- `vite.config.ts` - Client build with manual chunk splitting: vendor-react, vendor-router, vendor-query, vendor-ui, vendor-quill, vendor-date
- `postcss.config.js` - PostCSS for Tailwind
- `drizzle.config.ts` - Points to `src/db/schema.ts`, outputs to `drizzle/`

## Platform Requirements

**Development:**
- Node.js 20+
- npm
- Supabase project (cloud or local)
- Ports: 9000 (Vite), 9001 (Express), 2587 (SMTP submission), 25 (SMTP inbound), 2993 (IMAP)

**Production:**
- Docker (Dockerfile uses `node:20-alpine`)
- Exposed ports: 9001 (HTTP), 25 (SMTP inbound), 587 (SMTP submission), 993 (IMAP)
- Vercel supported via `build:vercel` script and `api/index.js` serverless entry (SMTP/IMAP not available on Vercel)
- Railway supported (detects `RAILWAY_ENVIRONMENT` to disable SMTP/IMAP by default)

---

*Stack analysis: 2026-03-30*
