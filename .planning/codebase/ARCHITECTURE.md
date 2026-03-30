# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Monorepo full-stack SPA with co-located frontend and backend, three distinct product domains, and background job processing.

**Key Characteristics:**
- Single Express server serves both the REST API and the built React SPA (production) or proxies in dev
- Frontend is split into three role-gated zones: `/admin/*` (platform admin), `/outreach/*` (admin-only outreach), `/mail/*` (end-user webmail)
- Database access is exclusively through Drizzle ORM with Supabase (PostgreSQL) as the persistence layer; RLS enforces org-level isolation at the DB layer
- Native SMTP/IMAP servers run in-process alongside the HTTP server, sharing the same DB connection pool
- Background cron jobs run in-process, started after server boot

## Layers

**Frontend - React SPA:**
- Purpose: User interface across three product zones
- Location: `src/main.tsx`, `src/pages/`, `src/components/`
- Contains: Route definitions, page components, layout components, shared UI primitives
- Depends on: `src/hooks/` (context providers), `src/lib/api-client.ts` (HTTP transport), `src/lib/supabase.ts` (auth)
- Used by: End users via browser

**Frontend - Context Providers (State Layer):**
- Purpose: Global state management for auth, sessions, mailboxes, compose
- Location: `src/hooks/useAuth.tsx`, `src/hooks/useMultiSession.tsx`, `src/hooks/useMailbox.tsx`, `src/hooks/useCompose.tsx`, `src/hooks/useOrganization.tsx`
- Contains: React context + providers, state derived from API calls
- Depends on: `src/lib/api-client.ts`, `src/lib/supabase.ts`, `src/lib/session-store.ts`
- Used by: All page and layout components

**Frontend - API Transport:**
- Purpose: Authenticated HTTP client with token caching, refresh, and retry
- Location: `src/lib/api-client.ts`, `src/lib/api.ts`, `src/lib/mail-api.ts`
- Contains: `apiFetch`, `apiRequest`, `ApiClientError`, token refresh logic
- Depends on: `src/lib/supabase.ts` (for token retrieval)
- Used by: Hooks and page components for all backend communication

**Backend - Express HTTP Server:**
- Purpose: REST API and static file serving
- Location: `src/server/index.ts`
- Contains: Middleware stack, auth middleware, route mounting, global error handler, graceful shutdown
- Depends on: All route modules, `src/db/index.ts`, `src/server/lib/supabase.ts`
- Used by: Frontend (via `/api/*`), external webhook callers

**Backend - Route Handlers:**
- Purpose: Handle individual API endpoints grouped by domain
- Location: `src/server/routes/` (root-level), `src/server/routes/mail/` (webmail), `src/server/routes/outreach/` (campaigns)
- Contains: Express Router instances, Zod validation, direct DB queries via Drizzle
- Depends on: `src/db/index.ts`, `src/db/schema.ts`, `src/server/lib/`
- Used by: Express server route mounts

**Backend - Server Library:**
- Purpose: Shared server-side logic
- Location: `src/server/lib/`
- Contains: `tracking.ts` (email tracking + webhooks), `native-mail.ts` (native mailbox management), `mail-sync.ts` (IMAP sync), `crypto.ts`, `admin.ts`, `health.ts`, `template-variables.ts`, `route-matcher.ts`, `outlook.ts`, `outreach-sender.ts`
- Depends on: `src/db/`
- Used by: Route handlers, SMTP servers, background jobs

**Backend - Background Jobs:**
- Purpose: Async email processing, outreach sequences, cleanup
- Location: `src/server/jobs/`
- Contains: `processQueue.ts`, `processHeld.ts`, `processReplies.ts`, `processBounces.ts`, `processOutreachSequences.ts`, `cleanupMessages.ts`
- Depends on: `src/db/`, `src/server/lib/`
- Used by: `src/server/jobs/index.ts` (cron scheduler, started from `src/server/index.ts`)

**Backend - Native Mail Servers:**
- Purpose: SMTP sending, SMTP inbound receiving, IMAP access
- Location: `src/server/smtp-server.ts`, `src/server/smtp-inbound.ts`, `src/server/imap-server.ts`
- Contains: Custom protocol server implementations
- Depends on: `src/db/`, `src/server/lib/`
- Used by: Express server startup, external mail clients

**Database Layer:**
- Purpose: Schema definition, ORM client, Zod schema generation
- Location: `src/db/index.ts` (Drizzle client), `src/db/schema.ts` (all tables, enums, relations, insert/select Zod schemas)
- Contains: All table definitions, all Drizzle relations, auto-generated Zod schemas via `drizzle-zod`
- Depends on: Supabase PostgreSQL via `DATABASE_URL`
- Used by: All server-side code that touches the database

## Data Flow

**Outbound Email (API-triggered):**
1. Frontend calls `POST /api/messages` with auth token
2. Express auth middleware validates JWT via Supabase, sets `x-user-id` header
3. Route handler validates body with Zod, creates `messages` row with `status: pending`
4. `processQueue` cron job (every 1 min) picks up pending messages
5. Job calls `src/server/lib/tracking.ts` to inject tracking pixel and rewrite links
6. Nodemailer sends via configured SMTP; delivery status recorded in `deliveries` table
7. Webhook dispatch fires for relevant events (`message_sent`, `message_delivered`)

**Inbound Email:**
1. External SMTP server delivers to `src/server/smtp-inbound.ts`
2. `mailparser` parses raw message; stored in `messages` table with `direction: incoming`
3. `src/server/lib/route-matcher.ts` matches address to a configured `routes` record
4. Route dispatches to endpoint (SMTP relay, HTTP webhook, or address forward) per route mode
5. Frontend `useMail` hook polls `GET /api/mail/mailboxes/:id/messages` to reflect new mail

**Authentication:**
1. User submits credentials; `POST /api/auth/login` calls Supabase Auth, returns JWT
2. Frontend stores session via Supabase client; `src/lib/api-client.ts` caches token in memory
3. Every API request attaches `Authorization: Bearer <token>`
4. Express middleware (`src/server/index.ts` lines 158-184) validates token with Supabase, populates `x-user-*` headers for downstream handlers
5. On 401 response, `api-client.ts` auto-refreshes session and retries once

**Multi-Session (Webmail):**
1. `src/hooks/useMultiSession.tsx` maintains multiple stored sessions in `src/lib/session-store.ts` (localStorage-backed)
2. `switchSession` swaps the active Supabase client session
3. `src/hooks/useMailbox.tsx` re-fetches mailboxes whenever `activeSessionId` changes

**State Management (Frontend):**
- Server state: TanStack React Query (cache, refetch, invalidation)
- Auth state: `AuthContext` from `src/hooks/useAuth.tsx`
- Mailbox state: `MailboxContext` from `src/hooks/useMailbox.tsx`
- Multi-account state: `MultiSessionContext` from `src/hooks/useMultiSession.tsx`
- Compose overlay state: `ComposeContext` from `src/hooks/useCompose.tsx`
- Organization state (outreach/admin): `OrganizationContext` from `src/hooks/useOrganization.tsx`
- UI/theme: `ThemeProvider` from `src/components/theme-provider.tsx`

## Key Abstractions

**Organization:**
- Purpose: Top-level multi-tenancy boundary; all resources (domains, credentials, routes, messages, webhooks) belong to an organization
- Examples: `src/db/schema.ts` (`organizations`, `organizationUsers` tables), `src/server/routes/organizations.ts`
- Pattern: UUID primary key, RLS policies enforce access; `organizationId` FK on all child resources

**Mailbox:**
- Purpose: Represents a user's email account (native platform mailbox or linked IMAP account)
- Examples: `src/db/schema.ts` (`mailboxes` table), `src/server/routes/mail/mailboxes.ts`, `src/hooks/useMailbox.tsx`
- Pattern: `isNative: boolean` distinguishes platform-managed from IMAP-synced; `userId` scoped (not org-scoped)

**Message (Platform):**
- Purpose: Outbound/inbound email record for the email server platform (admin domain)
- Examples: `src/db/schema.ts` (`messages` table), `src/server/routes/messages.ts`
- Pattern: `direction` field (`incoming`/`outgoing`), `status` enum, tracking `token` for open/click tracking

**Mail Message (Webmail):**
- Purpose: Individual email in a user's mailbox folder
- Examples: `src/db/schema.ts` (`mailMessages` table), `src/server/routes/mail/messages.ts`
- Pattern: Scoped to `mailboxId`, folder-based organization via `mailFolders` table

**ApiClientError:**
- Purpose: Typed error from all API calls; carries `status`, `path`, `code`, and `details`
- Examples: `src/lib/api-client.ts`
- Pattern: All `apiFetch` / `apiRequest` calls throw this on non-2xx responses; callers check `instanceof ApiClientError`

**Background Job:**
- Purpose: Cron-scheduled async processing, decoupled from HTTP request lifecycle
- Examples: `src/server/jobs/processQueue.ts`, `src/server/jobs/processOutreachSequences.ts`
- Pattern: Each job is an exported async function; `src/server/jobs/index.ts` schedules all of them with `node-cron`

## Entry Points

**Frontend SPA:**
- Location: `src/main.tsx`
- Triggers: Browser load, Vite dev server
- Responsibilities: Creates React root, wraps app in all context providers, defines all client-side routes with `wouter`, implements role-based route guards (`AdminCheck`, `MailCheck`, `RootRedirect`)

**Backend HTTP Server:**
- Location: `src/server/index.ts`
- Triggers: `node dist/server/index.js` (production) or `tsx watch src/server/index.ts` (dev)
- Responsibilities: Configures Express middleware (helmet, CORS, rate limiting, JSON parsing), mounts all API routes, applies JWT auth middleware, starts native mail servers and background jobs, serves static SPA in production

**Vercel Serverless:**
- Location: `api/index.js`
- Triggers: Vercel function invocations
- Responsibilities: Wraps Express app for serverless deployment (SMTP/IMAP servers not started)

**Background Jobs Scheduler:**
- Location: `src/server/jobs/index.ts`
- Triggers: Called during server startup (`import('./jobs/index').then(jobs => jobs.startJobs())`)
- Responsibilities: Registers all cron schedules

## Error Handling

**Strategy:** Centralized global error handler in Express; typed `ApiClientError` class on frontend for all API errors.

**Patterns:**
- Express global error handler at `src/server/index.ts` (lines 211-219): logs and returns 500 with message only in development
- Route handlers use try/catch and return specific status codes (400 Zod validation, 401 auth, 403 org membership, 404 not found, 500 server)
- Frontend `ApiClientError` carries `status` and `code`; `src/hooks/useApiError.ts` maps these to user-facing messages
- React Query `retry` option skips retries for 401 and rate limit errors

## Cross-Cutting Concerns

**Logging:** `console.error` / `console.warn` / `console.log` directly; no structured logging library. Background jobs prefix messages with `[jobs]`.

**Validation:** Zod on both sides. Server route handlers validate request bodies with inline Zod schemas. `src/db/schema.ts` exports `insertXSchema` / `selectXSchema` generated by `drizzle-zod` for reuse.

**Authentication:** JWT from Supabase Auth. Public paths whitelisted in `PUBLIC_PATHS` array in `src/server/index.ts`. All other `/api/` routes require `Authorization: Bearer <token>`. User identity propagated via `x-user-id`, `x-user-email`, `x-user-first-name`, `x-user-last-name` headers.

**Multi-tenancy Isolation:** Drizzle queries always filter by `organizationId` from the authenticated user context. Supabase RLS policies (`supabase/migrations/001_enable_rls.sql`) enforce this at the database layer as a safety net.

**Branding:** `systemBranding` table + `src/server/lib/serverBranding.ts` + `src/lib/branding.ts`; consumed by frontend `BrandingHead` component to dynamically set page title, favicon, and app name.

---

*Architecture analysis: 2026-03-30*
