# Codebase Concerns — SkaleClub Mail

**Analysis Date:** 2026-03-31

---

## Security

| Issue | Location | Severity | Recommendation |
|-------|----------|----------|----------------|
| SMTP/IMAP credentials logged in plaintext | `src/server/smtp-server.ts:87` | Critical | `console.log` logs `SMTP_USER` value. Remove or mask the username. |
| SMTP credentials stored in plaintext in `email_accounts` | `src/db/schema.ts:617-620` (columns `smtp_password`, `imap_password`) | High | Encrypt at rest using `src/lib/crypto.ts` `encrypt()` like `mailboxes` table does. |
| DKIM private key stored in database | `src/db/schema.ts:87` (`dkim_private_key` column on `domains`) | High | Move to a secrets manager or encrypt at rest. The private key is readable by anyone with DB access. |
| Insecure SMTP submission server (`secure: false`, `allowInsecureAuth: true`) | `src/server/smtp-server.ts:136-137` | High | Require STARTTLS or TLS in production. Plain-text auth over unencrypted connection exposes credentials. |
| Inbound SMTP has `hideSTARTTLS: true` | `src/server/smtp-inbound.ts:92` | Medium | Comment says "Gmail/Outlook will fall back to plaintext." Document the risk; consider offering TLS for compliance. |
| IMAP server has no TLS | `src/server/imap-server.ts:134` (raw `net.createServer`) | High | IMAP credentials are sent in plaintext. Must wrap in TLS (`tls.createServer`) or offer STARTTLS. |
| Webhook secrets stored in plaintext | `src/db/schema.ts:263` (`secret` column on `webhooks`) | Medium | Encrypt at rest like Outlook tokens. |
| `x-user-*` headers set from JWT but not verified per-route | `src/server/index.ts:177-181` | Low | Headers are spoofable if an attacker bypasses the middleware. Acceptable for internal-only routing, but document the trust boundary. |
| Cookie `sameSite: 'lax'` may allow CSRF in some flows | `src/server/routes/auth.ts:31,40` | Low | Consider `sameSite: 'strict'` if cross-site login flows are not needed. |
| Rate limiting scope is per-IP only | `src/server/index.ts:52-56` | Medium | Per-IP limits are bypassable via IP rotation or shared NAT. Add per-user rate limiting for authenticated endpoints. |
| 10MB body limit on all endpoints | `src/server/index.ts:76-77` | Low | Auth endpoints should have much smaller limits. Add per-route body size limits. |
| `.env` file present in repo | `.env` | Medium | Ensure `.env` is in `.gitignore` and never committed. Audit git history for leaked secrets. |

## Performance

| Issue | Location | Impact | Recommendation |
|-------|----------|--------|----------------|
| IMAP server loads ALL messages into memory on SELECT/SEARCH/FETCH | `src/server/imap-server.ts:425-431,502-508,632-638` | High | For mailboxes with thousands of messages, this will OOM. Add pagination/cursor-based loading. |
| IMAP server builds raw message text on every FETCH | `src/server/imap-server.ts:201-206` (`buildRawMessage`) | Medium | Cache the raw message or store it at ingestion time. Rebuilding RFC 2822 from parts is expensive. |
| Background jobs have no distributed lock | `src/server/jobs/index.ts` (cron jobs), `src/server/jobs/processQueue.ts:7-14` | Medium | If deployed across multiple instances (e.g. Railway replicas), jobs will run in duplicate. Use a DB advisory lock or Redis-based lock. |
| `syncAllMailboxes` runs every 5 minutes with no concurrency guard | `src/server/jobs.ts:3-14` | Medium | If sync takes longer than 5 minutes, overlapping runs will occur. Add a running flag like `processOutreachSequences` has. |
| Statistics queries do full-table scans on `messages` | `src/server/routes/organizations.ts:488-513` | Medium | `count(*)` and `count(*)` with `isNotNull(openedAt)` on the entire messages table is unindexed. Add composite indexes on `(organization_id, status)` and `(organization_id, opened_at)`. |
| SMTP relay creates a new transporter per message | `src/server/smtp-server.ts:88-96`, `src/server/jobs/processQueue.ts:81-86` | Low | Connection pooling via `nodemailer.createTransport` would reduce SMTP handshake overhead. |
| No pagination on IMAP LIST/FETCH commands | `src/server/imap-server.ts:365-375,502-508` | Low | All folders and all messages loaded regardless of size. |
| React Query cache invalidation is not centralized | `src/pages/mail/*.tsx`, `src/pages/admin/*.tsx` | Low | Overly broad invalidations may cause excessive re-fetching. Define a query key factory in `src/lib/queryKeys.ts`. |

## Technical Debt

| Issue | Location | Impact | Effort | Recommendation |
|-------|----------|--------|--------|----------------|
| No test framework configured | Root | High | Medium | No unit, integration, or E2E tests exist. Add Vitest for backend and frontend. |
| Express 5 is beta | `package.json:60` | Medium | High | Uses `^5.0.0-beta.2`. API may change. Pin the version and plan migration. |
| RLS migration 001 references `servers` and `server_id` columns that no longer exist | `supabase/migrations/001_enable_rls.sql:75-89,259-291,322,327,352,357,382,387,412,417,442,447,472,477,502,507,542,547,581,611,634` | High | Medium | The `servers` table was removed in migration 008 but RLS policies still reference `is_server_member(server_id)` and `is_server_admin(server_id)`. These policies are broken or silently failing. Run `db:audit` and reconcile. |
| Duplicate `storeMessage` function | `src/server/smtp-server.ts:31-77` and `src/server/smtp-inbound.ts:34-82` | Low | Low | Extract to a shared utility in `src/server/lib/`. |
| Hardcoded domain names (`skaleclub.com`, `mx.skaleclub.com`) | `src/server/routes/domains.ts:13,211,213,227`, `src/lib/branding.ts:17` | Medium | Low | Move to environment variables. These should be configurable per deployment. |
| Hardcoded DNS resolvers (`8.8.8.8,1.1.1.1`) | `src/server/routes/domains.ts:11` | Low | Trivial | Move to environment variable `DNS_SERVERS` (already partially done but has fallback). |
| Mixed `req.params` and `req.query` for resource IDs | Various route files | Low | Medium | Express 5 changed `req.params` behavior. Some routes use `req.params.id`, others use `req.query.serverId`. Standardize. |
| Registration endpoint disabled (403) with no alternative | `src/server/routes/auth.ts:66-68` | Medium | Low | No self-service onboarding path exists. Implement invite-based registration or admin user creation workflow. |
| `@types/*` packages in `dependencies` instead of `devDependencies` | `package.json:47-49` | Low | Trivial | Move `@types/bcrypt`, `@types/imap`, `@types/smtp-server` to `devDependencies`. |
| Monolithic schema file (1254+ lines) | `src/db/schema.ts` | Low | Medium | Split into domain-specific schema files (auth, mail, outreach, webmail). |
| Two separate `jobs` files with overlapping responsibility | `src/server/jobs.ts` and `src/server/jobs/index.ts` | Low | Low | `jobs.ts` runs mailbox sync via setInterval; `jobs/index.ts` runs cron jobs. Consolidate. |

## Code Quality

| Issue | Location | Severity | Recommendation |
|-------|----------|----------|----------------|
| `lodash` imported as full library | `package.json:67` | Low | Use `lodash-es` or import specific functions to reduce bundle size. |
| `as any` casts in multiple places | `src/server/lib/tracking.ts:266`, various | Low | Use proper type narrowing instead of type assertions. |
| `processOutreachSequences` has no guard against concurrent execution at the DB level | `src/server/jobs/index.ts:31-38` | Medium | The in-memory `isSequenceProcessing` flag doesn't protect against multiple server instances. Add a DB advisory lock. |
| `storeMessage` silently continues on folder-not-found | `src/server/smtp-server.ts:44-47`, `src/server/smtp-inbound.ts:47-49` | Medium | Email is silently dropped. Log more context and consider creating default folders. |
| Mock data files shipped in source | `src/lib/mock-data.ts` | Low | Move to `__fixtures__/` or conditionally exclude from production builds. |

## Reliability

| Issue | Location | Impact | Recommendation |
|-------|----------|--------|----------------|
| SMTP relay error is silently swallowed | `src/server/smtp-server.ts:243-246` | High | If relay fails, the sender thinks the email was sent. Propagate the error or store a failure status. |
| `markCompletedCampaigns` function is exported but never called | `src/server/jobs/processOutreachSequences.ts:309-332` | Medium | Campaigns may stay in "active" status forever even when all leads are done. Wire this into the cron scheduler. |
| `processQueue` has no backoff for SMTP connection failures | `src/server/jobs/processQueue.ts:12-43` | Medium | If the SMTP server is down, it retries every 60s indefinitely until max retries. Add circuit-breaker logic. |
| IMAP server has no IDLE command implementation (real-time push) | `src/server/imap-server.ts:763-768` | Low | Email clients expecting push notifications won't get them. Clients will poll instead. |
| IMAP server `APPEND` command is a no-op | `src/server/imap-server.ts:673-693` | Low | Clients using APPEND (e.g., for uploading sent mail) will silently succeed without storing data. |
| `COPY` command doesn't handle duplicates | `src/server/imap-server.ts:722-744` | Low | `onConflictDoNothing` silently drops the copy. User sees OK but message wasn't copied. |
| Tracking async processing has no persistence layer | `src/server/lib/tracking.ts`, `src/server/routes/track.ts` | Medium | Fire-and-forget pattern; if async throws, tracking data is lost silently. Add a tracking events queue table. |

## Scalability

| Issue | Location | Limit | Recommendation |
|-------|----------|-------|----------------|
| Single-process architecture | `src/server/index.ts` | Cannot horizontally scale without duplicate jobs | Use a job queue (BullMQ, pg-boss) with Redis or Postgres advisory locks for distributed scheduling. |
| Rate limits are in-memory (per-instance) | `src/server/index.ts:52-56` | Resets on restart; not shared across instances | Use a Redis-backed rate limiter for multi-instance deployments. |
| All mailboxes synced sequentially | `src/server/jobs.ts:6-14` | Slow with many mailboxes | Parallelize with a worker pool or split into per-organization sync tasks. |
| Statistics aggregation is done at query time | `src/server/routes/organizations.ts:488-559` | Slow for large orgs | Pre-aggregate in the `statistics` table or use materialized views. |
| Supabase connection pool limits | `src/db/index.ts` | Typically 60 direct connections on free tier | Enable PgBouncer (transaction mode) and configure Drizzle to use the pooled connection string. |

## Maintainability

| Issue | Location | Impact | Recommendation |
|-------|----------|--------|----------------|
| Monolithic schema file (1254+ lines) | `src/db/schema.ts` | Hard to navigate | Split into domain-specific schema files (auth, mail, outreach, webmail). |
| `IMAP server` is 861 lines with no tests | `src/server/imap-server.ts` | Fragile, hard to extend | Extract command handlers into separate modules. Add integration tests against a real IMAP client. |
| No API documentation | Root | Onboarding friction | Add OpenAPI/Swagger spec for all `/api/` routes. |
| `src/server/lib/tracking.ts` combines multiple concerns | `src/server/lib/tracking.ts` | Fragile, coupled side effects | Isolate open tracking, click tracking, and webhook dispatch into separate modules. |
| `tsx` as dev runner | `package.json:9,111` | Medium risk | Community tool without major vendor backing. Evaluate `ts-node` or native `--experimental-strip-types` as fallback. |

## TODOs & FIXMEs

No explicit `TODO`, `FIXME`, `HACK`, or `XXX` comments were found in the codebase. However, the following implicit TODOs are evident from code comments and incomplete implementations:

| File | Line | Type | Observation |
|------|------|------|-------------|
| `src/server/imap-server.ts` | 340-347 | Incomplete | AUTHENTICATE PLAIN is not implemented — returns "Use LOGIN instead" |
| `src/server/imap-server.ts` | 673-693 | Incomplete | APPEND command doesn't actually read the literal body |
| `src/server/imap-server.ts` | 763-768 | Incomplete | IDLE command doesn't implement real DONE handling |
| `src/server/jobs/processOutreachSequences.ts` | 309-332 | Dead code | `markCompletedCampaigns` is defined but never called |
| `src/server/smtp-server.ts` | 243-246 | Silent failure | Relay error is silently swallowed (catch with empty comment) |

## Dependency Risks

| Package | Risk | Recommendation |
|---------|------|----------------|
| `express@^5.0.0-beta.2` | Beta software; API may change before release | Pin exact version. Monitor Express 5 GA release and migrate promptly. |
| `imap@^0.8.19` | Last published 2016; unmaintained | Consider switching to `imapflow` (already a dependency) for all IMAP operations. |
| `bcrypt@^6.0.0` | Native binary dependency; requires build tools | Acceptable, but consider `bcryptjs` for simpler deployment if performance is not critical. |
| `react-quill-new@^3.8.3` | Community fork; uncertain maintenance | Monitor for updates or consider a more actively maintained rich text editor. |
| `node-cron@^4.2.1` | In-memory only; no persistence | For production, switch to a persistent job scheduler (pg-boss, BullMQ) that survives restarts. |
| `tsx@^4.7.1` | Community tool without major vendor backing | Evaluate `ts-node` or native Node.js `--experimental-strip-types` as fallback options. |

## Overall Health Assessment

**Strengths:**
- Well-structured multi-tenant architecture with RLS at the database layer
- Good use of Zod for request validation across all API routes
- Comprehensive SMTP, IMAP, and webmail modules — impressive feature breadth
- Proper auth flow with Supabase Auth + JWT middleware
- Tracking system (opens/links) has SSRF protection with private-host blocking (`src/server/routes/track.ts:15-28`)
- Rate limiting on auth endpoints is properly configured (5 req/15min)
- Credential hashing uses proper scrypt with random salts (`src/server/routes/credentials.ts:206-215`)
- DKIM encryption uses AES-256-GCM with proper IV and auth tags (`src/lib/crypto.ts`)

**Weaknesses:**
- **Zero test coverage** is the single biggest risk. No safety net for refactoring or regressions.
- **RLS migration drift** — the 001 migration references tables/columns (`servers`, `server_id`) that no longer exist after migration 008. This means RLS policies on many tables are effectively broken or non-functional.
- **Security gaps** in SMTP/IMAP — unencrypted auth, credentials logged to console, plaintext password storage in `email_accounts` table.
- **No distributed locking** — background jobs will duplicate in multi-instance deployments.
- **IMAP server is fragile** — 861 lines of hand-rolled protocol parsing with no tests and several incomplete commands (APPEND, IDLE, AUTHENTICATE PLAIN).

**Verdict:** The codebase is functional and feature-rich for a single-instance deployment, but has significant security and reliability risks for production use, especially around SMTP/IMAP encryption, RLS policy integrity, and test coverage.

## Priority Fixes

1. **Fix RLS policy drift** — Run `npm run db:audit` and reconcile migration 001 policies with the current schema. Broken RLS means data isolation between organizations may not be enforced at the database layer.

2. **Encrypt SMTP/IMAP credentials at rest** — The `email_accounts.smtp_password` and `email_accounts.imap_password` columns store passwords in plaintext. Use the existing `encrypt()`/`decrypt()` functions from `src/lib/crypto.ts`.

3. **Remove sensitive data from logs** — `src/server/smtp-server.ts:87` logs `SMTP_USER`. Audit all `console.log` calls in server code for credential leakage.

4. **Add TLS to SMTP/IMAP servers** — At minimum, require STARTTLS for SMTP submission and wrap IMAP in TLS. Unencrypted auth is unacceptable in production.

5. **Set up a test framework** — Add Vitest with basic integration tests for auth, message sending, and IMAP operations. This is prerequisite for safe refactoring.

6. **Wire up `markCompletedCampaigns`** — The function exists in `processOutreachSequences.ts` but is never called. Campaigns will stay active indefinitely.

7. **Consolidate job scheduling** — Merge `src/server/jobs.ts` (setInterval) and `src/server/jobs/index.ts` (cron) into a single scheduler. Add distributed locking for multi-instance safety.

8. **Extract IMAP command handlers** — The 861-line IMAP server file is brittle. Split into `src/server/imap/commands/` with one file per command group.

9. **Replace hardcoded domain names** — Move `skaleclub.com`, `mx.skaleclub.com`, `spf.skaleclub.com` from source code to environment variables for deployment flexibility.

10. **Audit `.env` in git history** — Ensure no secrets were ever committed. Add `.env` to `.gitignore` if not already present.

---

*Concerns audit: 2026-03-31*
