# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**Microsoft Graph / Azure AD (OAuth 2.0):**
- Used for Outlook mailbox integration — read, send, and sync email via Microsoft Graph
- OAuth flow: `POST /api/outlook/connect/start` → redirect to `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` → callback at `/api/outlook/connect/callback`
- SDK/Client: Native `fetch` against `https://graph.microsoft.com/v1.0` (no official SDK)
- Auth: `OUTLOOK_CLIENT_ID`, `OUTLOOK_CLIENT_SECRET` env vars; tokens encrypted in DB with `OUTLOOK_TOKEN_ENCRYPTION_KEY`
- Scopes: `offline_access`, `openid`, `profile`, `User.Read`, `Mail.Read`, `Mail.ReadWrite`, `Mail.Send`
- Implementation: `src/server/lib/outlook.ts`, `src/server/routes/outlook.ts`
- Token refresh handled server-side with `REFRESH_SKEW_MS = 2 min` buffer

**Supabase Auth (JWT validation):**
- Frontend authenticates via `supabase.auth.signInWithPassword`; JWT validated on every protected API request
- Healthcheck endpoint pings `${SUPABASE_URL}/auth/v1/settings`
- Implementation: `src/server/lib/supabase.ts`, `src/lib/supabase.ts`

## Data Storage

**Databases:**
- PostgreSQL via Supabase (cloud-hosted)
  - Connection: `DATABASE_URL` env var (Supavisor pooler, port 6543, transaction mode)
  - Direct URL: `DIRECT_URL` env var (used by drizzle-kit for migrations)
  - Client: `drizzle-orm` + `postgres` driver (`src/db/index.ts`)
  - Pool: max 20 connections (configurable via `DB_POOL_MAX`), 10s idle timeout, 30s connect timeout, 30min max lifetime
  - Retry logic: exponential backoff up to 3 attempts for connection errors (`withRetry` in `src/db/index.ts`)
  - Schema: `src/db/schema.ts`
  - RLS policies: `supabase/migrations/001_enable_rls.sql` through `015_schema_reconciliation.sql`

**Key Schema Tables:**
- `users`, `organizations`, `organization_users` — multi-tenancy core
- `servers`, `domains`, `credentials`, `routes` — email server config
- `messages`, `deliveries`, `statistics`, `suppressions`, `track_domains` — email lifecycle
- `webhooks`, `webhook_requests` — outgoing webhook system
- `mailboxes`, `mail_folders`, `mail_messages`, `email_accounts` — native/IMAP mail storage
- `outlook_mailboxes` — Microsoft OAuth token storage
- `outreach_*` tables — outreach campaign system
- `templates`, `user_notifications`, `system_branding` — app config

**File Storage:**
- Supabase Storage (avatars referenced by `avatarUrl` on `users` table; CSP `img-src` allows the Supabase origin)
- Local filesystem: not used for persistent storage

**Caching:**
- Server-side in-memory cache for system branding (`src/server/lib/serverBranding.ts`, `getCachedBranding`)
- No Redis or external cache layer

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (JWT-based)
  - Frontend: `createClient` from `@supabase/supabase-js` (`src/lib/supabase.ts`)
  - Server (anon): `supabaseAnonClient` — validates user JWTs on every API request (`src/server/lib/supabase.ts`)
  - Server (admin): `supabaseAdminClient` (service role) — used for admin-level operations
  - Auth context/hook: `src/hooks/useAuth.tsx`
  - All protected routes validate `Authorization: Bearer <token>` header and inject `x-user-id`, `x-user-email`, etc.

**Native Mail Auth:**
- SMTP/IMAP clients authenticate with bcrypt-hashed passwords from `users.passwordHash`
- JWT tokens issued for SMTP/IMAP session management (`JWT_SECRET` env var)
- Implementation: `src/server/lib/native-mail.ts`

**Platform Admin:**
- `users.isAdmin` boolean flag; checked via `isPlatformAdmin()` in `src/server/lib/admin.ts`
- Set via `scripts/set-admin.ts`

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, etc. detected)

**Logs:**
- `console.log` / `console.error` throughout server code
- DB query logging in development via Drizzle's `logger` option (`src/db/index.ts`)
- SMTP/IMAP event logging inline

**Health Endpoints:**
- `GET /health` — uptime, memory, Node version
- `GET /health/db` — Drizzle DB ping latency
- `GET /health/auth` — Supabase auth reachability
- `GET /health/ready` — combined readiness check
- Implementation: `src/server/lib/health.ts`

## CI/CD & Deployment

**Hosting:**
- Docker: `Dockerfile` (node:20-alpine), `docker-compose.yml` for self-hosting
- Railway: detected via `RAILWAY_ENVIRONMENT`; SMTP/IMAP disabled by default (set `ENABLE_MAIL_SERVER=true` to enable)
- Vercel: `build:vercel` script creates `api/index.js` serverless bundle; SMTP/IMAP unavailable in this mode
- Static client served from `dist/client/` by Express in production

**CI Pipeline:**
- None configured (no GitHub Actions, CircleCI, etc. detected)

## SMTP / Email Transport

**Outbound (relay):**
- nodemailer 6.9 sending via configurable SMTP relay
- Config: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` env vars
- Used for transactional delivery of queued messages

**Native SMTP Submission Server (port 587/2587):**
- `smtp-server` package; accepts authenticated submissions from email clients (Thunderbird, etc.)
- Auth: PLAIN/LOGIN against bcrypt-hashed user passwords
- Implementation: `src/server/smtp-server.ts`

**Native SMTP Inbound Server (port 25):**
- `smtp-server` package; accepts delivery from external MTAs (Gmail, Outlook, etc.)
- No auth required (standard MX delivery)
- Validates recipient domain against verified domains in DB
- Implementation: `src/server/smtp-inbound.ts`

**Native IMAP Server (port 993/2993):**
- Custom implementation using raw Node.js `net` module (no third-party IMAP server library)
- Supports RFC 3501: LOGIN, CAPABILITY, LIST, LSUB, SELECT, EXAMINE, FETCH, STORE, EXPUNGE, SEARCH, APPEND, NOOP, LOGOUT, UID
- Implementation: `src/server/imap-server.ts`

**External IMAP Sync:**
- `imapflow` 1.2 and `imap` 0.8 for connecting to external mailboxes (e.g., Gmail IMAP)
- `mailparser` 3.6 for parsing raw MIME messages
- Sync job: `src/server/jobs/processReplies.ts` (runs every 15 min)
- Sync lib: `src/server/lib/mail-sync.ts`

## Background Jobs (node-cron)

- `processQueue` — every 1 min: sends queued outbound messages
- `processHeldMessages` — every 5 min: processes expired held messages
- `cleanupOldMessages` — daily 3am: purges old messages
- `processOutreachSequences` — every 5 min: advances outreach campaigns
- `resetDailyLimits` — daily midnight: resets outreach sending caps
- `processReplies` — every 15 min: syncs inbound replies from external IMAP accounts
- `processBounces` — every 30 min: processes bounce notifications
- Scheduler entry: `src/server/jobs/index.ts`

## Webhooks & Callbacks

**Outgoing (user-configured):**
- Users configure webhook endpoints per organization in `/api/webhooks`
- Events: `message_sent`, `message_delivered`, `message_bounced`, `message_held`, `message_opened`, `link_clicked`, `domain_verified`, `spam_alert`, `test`
- Signed with HMAC-SHA256 using a user-provided secret
- Delivery tracked in `webhook_requests` table
- Dispatch: `src/server/lib/tracking.ts` (`fireWebhooks`)

**Incoming (tracking):**
- `GET /t/open/:token` — 1×1 GIF pixel for email open tracking
- `GET /t/click/:token?u=<base64url>` — click tracking redirect
- Rate limited to 100 req/min
- Tracking processed asynchronously after immediate response
- Implementation: `src/server/routes/track.ts`

**Microsoft OAuth Callback:**
- `GET /api/outlook/connect/callback` — receives authorization code from Azure AD
- State validated with HMAC + TTL (10 min expiry)
- Tokens encrypted with AES before DB storage

## Encryption

**Secrets at rest:**
- IMAP/SMTP passwords for external mailboxes encrypted before DB storage
- Outlook OAuth tokens encrypted before DB storage
- Keys: `ENCRYPTION_KEY` (general), `OUTLOOK_TOKEN_ENCRYPTION_KEY` (Outlook tokens)
- Implementation: `src/server/lib/crypto.ts`

---

*Integration audit: 2026-03-30*
