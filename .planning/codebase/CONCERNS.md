# Codebase Concerns

**Analysis Date:** 2026-03-30

## Tech Debt

**Express 5 Beta Dependency:**
- Issue: The project uses Express 5 (beta), which is not production-stable
- Files: `src/server/index.ts`, `src/server/routes/*.ts`
- Impact: Breaking changes may occur on Express 5 stable release; `req.query` used in place of `req.params` in some routes is a known workaround for Express 5 beta behavior
- Fix approach: Pin to a specific Express 5 beta version, add upgrade path tracking, or migrate back to Express 4 until v5 stabilizes

**Registration Endpoint Intentionally Disabled:**
- Issue: User registration returns 403 by design, meaning no self-service onboarding path exists
- Files: `src/server/routes/auth.ts`
- Impact: New users cannot be added without direct database intervention or a separate admin workflow; blocks organic growth and onboarding automation
- Fix approach: Implement an invite-based registration flow or an admin-only user creation endpoint

**No Testing Framework Configured:**
- Issue: Zero test coverage across the entire codebase — no unit, integration, or E2E tests
- Files: All `src/` files
- Impact: Every change is unverified; regressions in auth, RLS, email routing, and tracking logic go undetected until production
- Fix approach: Add Vitest for unit/integration tests targeting `src/server/routes/`, `src/server/lib/tracking.ts`, and `src/db/schema.ts` validation logic as first priority

**Drizzle ORM Schema as Single File:**
- Issue: Entire database schema lives in one file
- Files: `src/db/schema.ts`
- Impact: As the schema grows, this file becomes a maintenance bottleneck; merge conflicts and readability degrade
- Fix approach: Split into domain-scoped files (e.g., `schema/users.ts`, `schema/messages.ts`) with a barrel re-export

---

## Known Bugs

**Race Condition on First Folder Navigation (Recently Fixed):**
- Symptoms: Black screen when first navigating between mail folders
- Files: `src/pages/mail/InboxPage.tsx`, `src/pages/mail/SentPage.tsx`, `src/pages/mail/SpamPage.tsx`, `src/pages/mail/StarredPage.tsx`
- Trigger: Initial render before async session/mailbox state resolves
- Workaround: Addressed in commit `1364b2c`, but underlying async initialization pattern may still be fragile across other pages

**Mailbox Session Refresh on Switch:**
- Symptoms: Stale mailbox list shown when switching active sessions
- Files: `src/pages/mail/InboxPage.tsx`
- Trigger: Switching active session without triggering a mailbox re-fetch
- Workaround: Fixed in commit `f44e8c2`; watch for similar stale-state issues in other session-aware components

---

## Security Considerations

**Service Role Key Exposure Risk:**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely; if leaked, all tenant data is exposed
- Files: `src/server/index.ts`, `src/db/index.ts`
- Current mitigation: Server-side only, not exposed to client; `.env` file excluded from git
- Recommendations: Add secret scanning to CI, rotate key if ever committed, audit all service-role usages to ensure they are intentional and necessary

**Rate Limiting Scope:**
- Risk: Rate limiting (100 req/IP/15min) applies at the IP level, which is bypassable via IP rotation or shared NAT environments
- Files: `src/server/index.ts`
- Current mitigation: Global rate limit applied
- Recommendations: Add per-user/per-token rate limiting for authenticated endpoints; add stricter limits on auth endpoints specifically

**JWT Validation Delegates to Supabase:**
- Risk: If `SUPABASE_URL` is misconfigured or Supabase is unreachable, token validation may fail open or produce inconsistent behavior
- Files: `src/server/index.ts`
- Current mitigation: Standard Supabase JWT middleware
- Recommendations: Add explicit error handling for Supabase auth service unavailability; fail closed (deny requests) when validation cannot complete

**10MB Request Body Limit:**
- Risk: Large email payloads accepted without content-type validation may be used for resource exhaustion
- Files: `src/server/index.ts`
- Current mitigation: 10MB hard cap
- Recommendations: Add MIME-type validation and per-endpoint body size limits (auth endpoints should be far smaller than 10MB)

---

## Performance Bottlenecks

**Single-Schema RLS Policy File:**
- Problem: All RLS policies in one migration file; as policy count grows, policy evaluation overhead is harder to audit
- Files: `supabase/migrations/001_enable_rls.sql`
- Cause: Monolithic migration approach
- Improvement path: Split into per-table migration files; review policy complexity for hot-path tables like `messages` and `deliveries`

**Email Tracking Async Processing:**
- Problem: Open/click tracking responds immediately but processes asynchronously — if the async queue backs up or throws silently, tracking data is lost
- Files: `src/server/lib/tracking.ts`, `src/server/routes/track.ts`
- Cause: Fire-and-forget async pattern with no persistence layer for the tracking queue
- Improvement path: Persist tracking events to a queue table before processing, or use a dedicated job queue (e.g., pg-boss, BullMQ)

**React Query Cache Invalidation Pattern:**
- Problem: Cache invalidation strategy is not documented; overly broad invalidations may cause excessive re-fetching on write operations
- Files: `src/pages/mail/*.tsx`, `src/pages/admin/*.tsx`
- Cause: No centralized query key registry
- Improvement path: Define a query key factory in `src/lib/queryKeys.ts` and scope invalidations precisely

---

## Fragile Areas

**`src/server/lib/tracking.ts`:**
- Why fragile: Combines open tracking, click tracking, and webhook dispatch in one module; side effects (pixel response, URL redirect, async DB write, webhook fire) are tightly coupled
- Safe modification: Isolate each concern into its own function before extending; add tests before any changes
- Test coverage: None

**`src/db/schema.ts`:**
- Why fragile: Single file defines all tables, enums, and relations; a bad merge or type error here breaks the entire application at startup
- Safe modification: Only add/modify one table at a time; run `npm run db:generate` and inspect generated migration before applying
- Test coverage: None; schema correctness relies entirely on Drizzle's type-checking at build time

**Multi-Session Mail State (`src/pages/mail/`):**
- Files: `src/pages/mail/InboxPage.tsx`, `src/pages/mail/SearchPage.tsx`, `src/pages/mail/StarredPage.tsx`, `src/pages/mail/SentPage.tsx`, `src/pages/mail/SpamPage.tsx`, `src/components/mail/ResizablePanels.tsx`
- Why fragile: Per-commit history shows repeated race conditions and stale-state bugs in session switching and folder navigation; the async initialization pattern is replicated across multiple page components without abstraction
- Safe modification: Extract shared session/mailbox initialization into a custom hook before adding new mail features
- Test coverage: None

**`EmailHtmlViewer.tsx` Dark Mode Toggle:**
- Files: `src/components/mail/EmailHtmlViewer.tsx`
- Why fragile: Per-email dark mode state was added alongside a recently moved UI control; iframe-based HTML rendering with CSS injection is inherently brittle across email client rendering quirks
- Safe modification: Treat dark mode CSS injection as an enhancement only; ensure graceful fallback when email HTML is malformed or sandboxed
- Test coverage: None

---

## Scaling Limits

**Supabase Free Tier / Connection Pooling:**
- Current capacity: Depends on Supabase plan; default Postgres connection limit is low (typically 60 direct connections)
- Limit: High concurrency will exhaust connections; Drizzle does not use a connection pool by default
- Scaling path: Enable Supabase's built-in PgBouncer (transaction mode) and configure Drizzle to use the pooled connection string

**Single-Process Express Server:**
- Current capacity: One Node.js process; no clustering
- Limit: CPU-bound operations (email parsing, tracking) block the event loop under load
- Scaling path: Add Node.js cluster mode or deploy behind a process manager (PM2) with worker processes; offload heavy processing to a queue

---

## Dependencies at Risk

**`express@5.x` (Beta):**
- Risk: Pre-release software with potential breaking changes before stable release
- Impact: Routing behavior, middleware compatibility, and error handling may change
- Migration plan: Monitor Express 5 release notes; maintain a compatibility shim layer for the `req.query`/`req.params` workarounds already in place

**`tsx` as Dev Runner:**
- Risk: `tsx` is used for both development and is referenced in the build pipeline; it is a community tool without the backing of a major vendor
- Impact: If `tsx` introduces a breaking change or is abandoned, the dev/build workflow breaks
- Migration plan: Evaluate `ts-node` or native Node.js `--experimental-strip-types` as fallback options

---

## Missing Critical Features

**No Email Queue / Retry Mechanism:**
- Problem: Outbound email sending via Nodemailer has no retry, dead-letter, or bounce handling queue
- Blocks: Reliable email delivery guarantees; tracking delivery failures at scale

**No Admin Audit Log:**
- Problem: No record of admin actions (user creation, server config changes, domain verification, credential issuance)
- Blocks: Compliance requirements; debugging unauthorized changes in multi-tenant environments

**No Invite-Based Onboarding:**
- Problem: Registration is disabled with no alternative user-addition flow
- Blocks: Self-service tenant onboarding; any growth beyond manually inserted database rows

---

## Test Coverage Gaps

**All Server Routes Untested:**
- What's not tested: Auth middleware, organization scoping, Zod validation rejection, error response shapes
- Files: `src/server/routes/auth.ts`, `src/server/routes/users.ts`, `src/server/routes/organizations.ts`, `src/server/routes/servers.ts`, `src/server/routes/messages.ts`, `src/server/routes/webhooks.ts`
- Risk: Any refactor silently breaks API contracts consumed by the frontend
- Priority: High

**Tracking Logic Untested:**
- What's not tested: Token generation, open/click event persistence, webhook dispatch, async error paths
- Files: `src/server/lib/tracking.ts`, `src/server/routes/track.ts`
- Risk: Silent data loss in tracking pipeline goes undetected
- Priority: High

**RLS Policies Untested:**
- What's not tested: Cross-tenant data isolation; privilege escalation via direct DB queries
- Files: `supabase/migrations/001_enable_rls.sql`
- Risk: A misconfigured RLS policy exposes one tenant's data to another; this is a critical multi-tenancy failure mode
- Priority: Critical

**Frontend Mail State Management Untested:**
- What's not tested: Session switching behavior, folder navigation initialization, stale cache scenarios
- Files: `src/pages/mail/InboxPage.tsx`, `src/pages/mail/SentPage.tsx`, `src/pages/mail/SpamPage.tsx`, `src/pages/mail/StarredPage.tsx`, `src/pages/mail/SearchPage.tsx`
- Risk: Regression of the race conditions fixed in recent commits
- Priority: High

---

*Concerns audit: 2026-03-30*
