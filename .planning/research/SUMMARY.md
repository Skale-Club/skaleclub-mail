# Project Research Summary

**Project:** SkaleClub Mail — Database Health Improvements
**Domain:** Multi-tenant email platform database optimization (Supabase/PostgreSQL + Drizzle ORM)
**Researched:** 2026-03-31
**Confidence:** HIGH

---

## Executive Summary

SkaleClub Mail is a multi-tenant email server management platform with 30+ PostgreSQL tables managed by Drizzle ORM on Supabase. The codebase has **zero performance indexes** beyond primary keys and unique constraints — every query across messages, leads, campaigns, deliveries, and statistics performs full sequential scans. Combined with N+1 query patterns in background jobs and 11 of 15 list endpoints lacking pagination, the platform is one data spike away from severe performance degradation. Additionally, RLS policies reference a `servers` table that was removed in migration 008, meaning database-level data isolation between organizations may be completely broken.

The recommended approach is **schema-first index management**: consolidate all indexes into `src/db/schema.ts` using Drizzle's `index()` API (eliminating the current drift between schema.ts and a hand-written `013_add_performance_indexes.sql`), use `CREATE INDEX CONCURRENTLY` for production to avoid write locks, add pagination to all list endpoints, and fix N+1 patterns in processQueue and processOutreachSequences jobs. No new libraries are needed — Drizzle ORM and Supabase provide all required capabilities. The highest-risk change is the index migration itself: regular `CREATE INDEX` blocks all writes, and `CONCURRENTLY` cannot run inside transactions (which Drizzle's migration runner wraps by default), requiring a separate raw SQL workflow.

Key risk mitigation: Fix broken RLS policies FIRST (Phase 0) before any index work — building indexes on tables with broken data isolation is building on sand. Use `CREATE INDEX CONCURRENTLY` exclusively for production, verify each index with `indisvalid` checks, and never use `db:push` on production databases.

---

## Key Findings

### Recommended Stack

No new technologies needed. The existing stack is sufficient:

**Core technologies (validated, no changes needed):**
- **Drizzle ORM 0.30.4:** Use `index()` API in schema.ts for all performance indexes — single source of truth, type-safe
- **postgres.js 3.4.3:** Already has `prepare: true` for prepared statements and connection pooling configured
- **Supabase (Cloud):** Supavisor transaction-mode pooler already configured (port 6543, pool size 20)
- **No Redis, no PgBouncer, no Prisma:** In-memory caching sufficient; Supavisor replaces PgBouncer; Drizzle is adequate

**What NOT to add (anti-features):**
- Redis — overkill for single-instance deployment; in-memory cache sufficient
- PgBouncer — Supavisor already handles pooling
- External query caching — postgres.js prepared statement caching is sufficient
- Full-text search — `ILIKE` with indexes handles current needs

### Expected Features

**Must have (table stakes):**
- FK indexes on all org-scoped tables (17 tables) — every query filters by organizationId, currently does seq scans
- Pagination on all list endpoints (campaigns, email accounts, lead lists, sequences) — 11 of 15 endpoints load all rows
- Composite indexes for stats queries — `(organizationId, status)` on messages and campaignLeads makes dashboard sub-second
- Index on `campaignLeads.nextScheduledAt` — the send pipeline cron job scans ALL leads every 5 minutes

**Should have (competitive advantage):**
- SELECT column filtering on list endpoints — reduce payload 60%+ by excluding htmlBody/plainBody
- Pre-computed denormalized counts — audit and fix increment paths on `campaigns.totalLeads`, `totalOpens` columns
- Slow query logging (EXPLAIN ANALYZE in dev mode) — catch regressions early
- Batched lead import with chunked inserts — prevent timeouts on large imports

**Defer (v1.2+):**
- Cursor-based pagination for leads — only needed at 50K+ leads, offset pagination is fine now
- Database-level CHECK constraints — nice for data integrity, not performance-critical
- Chunked batch inserts — only needed if bulk import starts timing out

### Architecture Approach

The system has a **dual-track index problem**: indexes exist in both `src/db/schema.ts` (12 unique indexes) and `supabase/migrations/013_add_performance_indexes.sql` (35 hand-written indexes, 7 commented out). These are out of sync, creating schema drift risk. The architecture recommendation is to make `schema.ts` the single source of truth for all indexes using Drizzle's `index()` API, deprecate the manual SQL file, and use a separate raw SQL workflow only for `CONCURRENTLY` index creation in production.

**Major components to modify:**
1. **`src/db/schema.ts`** — Add `index()` definitions to all 30+ table definitions for FK columns and composite query patterns
2. **`src/server/jobs/processQueue.ts`** — Fix N+1: batch-load messages + orgs before the delivery loop (3*N queries -> 2 queries)
3. **`src/server/routes/outreach/campaigns.ts`** — Add pagination to list endpoint (currently loads ALL campaigns + nested sequences + steps)
4. **`src/server/routes/outreach/leads.ts`** — Add pagination to leads and lead lists endpoints
5. **`supabase/migrations/001_enable_rls.sql`** — Fix broken RLS policies referencing removed `servers` table

### Critical Pitfalls

1. **CREATE INDEX blocks all writes on production tables** — Use `CREATE INDEX CONCURRENTLY` exclusively. Regular CREATE INDEX acquires ShareLock that blocks INSERT/UPDATE/DELETE for the duration of the build. On high-write tables like `messages` and `outreach_emails`, this freezes SMTP sessions.

2. **CONCURRENTLY cannot run inside transactions** — Drizzle's migration runner wraps migrations in transactions. Maintain a separate `sql/indexes.sql` file run directly via `psql` or a custom `npm run db:indexes` script. Never rely on `db:generate` for index migrations.

3. **Failed CONCURRENTLY leaves INVALID indexes** — If CONCURRENTLY fails, PostgreSQL leaves a broken index (`indisvalid = false`). Always verify after creation: `SELECT indisvalid FROM pg_index WHERE indexrelid = 'idx_name'::regclass;`. Drop and retry if invalid.

4. **RLS policies reference non-existent `servers` table** — Data isolation between organizations may be completely broken at the database layer. Must audit and fix BEFORE any other database work. Test with two users in different organizations.

5. **`db:push` destroys data on non-additive changes** — Never use `db:push` on production. It drops and recreates tables for column renames/type changes. Use `drizzle-kit generate` + review + `drizzle-kit migrate` for production.

---

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 0: Prerequisites — RLS Audit & Migration Workflow
**Rationale:** RLS policies reference a removed `servers` table — data isolation may be broken. This is a security prerequisite that must be resolved before any schema work. Additionally, the migration workflow must be established (raw SQL for CONCURRENTLY indexes) to avoid write locks.
**Delivers:** Fixed RLS policies, `sql/indexes.sql` workflow, verified data isolation
**Addresses:** PITFALLS #6 (broken RLS), PITFALLS #5 (db:push danger), PITFALLS #2 (CONCURRENTLY transaction issue)
**Avoids:** Building performance features on broken security foundation
**Research flag:** NEEDS RESEARCH — RLS policy fix complexity depends on current policy state; may require understanding how auth middleware bypasses RLS

### Phase 1: Index Foundation — All FK & Composite Indexes
**Rationale:** Indexes are the foundation everything else depends on. Pagination without indexes still scans full tables. This is the single biggest performance win (17 FK indexes + composite indexes for jobs).
**Delivers:** ~40 indexes added to schema.ts, applied via CONCURRENTLY, verified with EXPLAIN ANALYZE
**Addresses:** FEATURES table stakes (FK indexes, composite indexes, nextScheduledAt index), ARCHITECTURE Tier 1 & 3 indexes
**Avoids:** PITFALLS #1 (blocking writes), #3 (invalid indexes), #4 (missing FK indexes), #8 (wrong column order), #10 (over-indexing)
**Research flag:** STANDARD PATTERNS — Drizzle index API is well-documented; no additional research needed

### Phase 2: Pagination — All List Endpoints
**Rationale:** Depends on Phase 1 indexes (count queries need indexes to be fast). Adds pagination to the 11 unpaginated list endpoints, following the existing pattern in `messages.ts`.
**Delivers:** Paginated responses on campaigns, leads, lead lists, email accounts, sequences endpoints with `{ items, pagination: { page, pageSize, total } }` format
**Addresses:** FEATURES table stakes (pagination on all list endpoints), ARCHITECTURE Pattern 1
**Avoids:** PITFALLS #7 (N+1 from relational API in list views)
**Research flag:** STANDARD PATTERNS — Offset pagination pattern already exists in codebase (messages.ts); copy the pattern

### Phase 3: Query Optimization — N+1 Fixes & Column Filtering
**Rationale:** Depends on Phase 1 indexes for efficient batch queries. Fixes the N+1 in processQueue (3*N -> 2 queries) and adds selective column loading to reduce payload sizes.
**Delivers:** Fixed processQueue.ts batch loading, selective column loading on list endpoints, verified processOutreachSequences query efficiency
**Addresses:** FEATURES differentiators (SELECT column filtering), ARCHITECTURE Pattern 2 & 3, PITFALLS #7 (relational API N+1)
**Avoids:** PITFALLS #9 (db:generate missing index changes — using raw SQL)
**Research flag:** STANDARD PATTERNS — Batch query pattern is standard SQL; Drizzle `inArray()` is well-documented

### Phase 4: Schema Hardening — Constraints & Cleanup
**Rationale:** Independent of other phases but best done last to avoid merge conflicts in schema.ts. Adds CHECK constraints for data integrity and deprecates the old `013_*.sql` migration file.
**Delivers:** CHECK constraints on daily limits, step orders; deprecated `013_add_performance_indexes.sql`; EXPLAIN ANALYZE verification report
**Addresses:** FEATURES defer items (CHECK constraints), ARCHITECTURE Phase 5-6
**Avoids:** PITFALLS #5 (db:push data loss — using generate+migrate for constraints)
**Research flag:** STANDARD PATTERNS — CHECK constraints are basic PostgreSQL; no research needed

### Phase Ordering Rationale

- **Phase 0 first** because security (broken RLS) must be fixed before building on the database layer. A performance index on a table with broken data isolation is dangerous.
- **Phase 1 before Phase 2** because pagination count queries need indexes to be fast. Without indexes, `SELECT COUNT(*) FROM messages WHERE organizationId = ?` still does a full table scan.
- **Phase 2 before Phase 3** because pagination reduces the data volume that N+1 fixes need to handle. Fixing N+1 on unpaginated full-table loads is only a partial win.
- **Phase 4 last** because CHECK constraints are independent, non-critical, and doing them last avoids schema.ts merge conflicts with the larger Phase 1-3 changes.

### Research Flags

Phases needing deeper research during planning:
- **Phase 0:** RLS policy fix complexity is unknown — need to audit current policies and understand how the auth middleware interacts with Supabase RLS. May reveal that RLS is bypassed entirely by the service role key.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Drizzle `index()` API is well-documented, CONCURRENTLY workflow is established PostgreSQL practice
- **Phase 2:** Offset pagination pattern already exists in codebase — direct replication
- **Phase 3:** Batch query pattern is standard SQL, Drizzle `inArray()` is documented
- **Phase 4:** CHECK constraints are basic PostgreSQL DDL

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing stack validated; no new dependencies needed; Drizzle index API is stable and documented |
| Features | HIGH | Grounded in direct codebase analysis — 1254-line schema.ts audited, 15 endpoints analyzed |
| Architecture | HIGH | Drizzle + Supabase patterns are well-established; dual-track problem identified with clear resolution |
| Pitfalls | HIGH | All pitfalls sourced from official PostgreSQL docs, Supabase best practices, and Drizzle documentation |

**Overall confidence:** HIGH

### Gaps to Address

- **RLS current state:** Need to verify whether RLS policies are actually enforced or bypassed by service role key usage in the Express middleware. If middleware uses service role key, RLS may be irrelevant (but still should be fixed for defense-in-depth).
- **Index effectiveness:** Need to run `EXPLAIN ANALYZE` on actual production queries after index creation to verify PostgreSQL picks up the indexes (especially composite indexes with specific column ordering).
- **Write performance regression:** Need to benchmark INSERT latency before/after adding ~40 indexes, especially on write-heavy tables (`outreach_emails`, `deliveries`). Over-indexing is a real risk for the sending pipeline.
- **Supabase plan limits:** Need to verify that the Supabase plan supports the index count and connection pool size (25 recommended). Free tier has limitations.

---

## Sources

### Primary (HIGH confidence)
- Drizzle ORM Indexes & Constraints — https://orm.drizzle.team/docs/indexes-constraints (index API documentation)
- Drizzle ORM Performance — https://orm.drizzle.team/docs/perf-queries (prepared statements, placeholders)
- PostgreSQL CREATE INDEX CONCURRENTLY — https://www.bytebase.com/blog/postgres-create-index-concurrently
- Supabase RLS Performance — https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Connection Management — https://supabase.com/docs/guides/database/connection-management
- PostgreSQL Locking Documentation — https://www.postgresql.org/docs/current/explicit-locking.html

### Secondary (MEDIUM confidence)
- Drizzle ORM Gotchas — https://orm.drizzle.team/docs/gotchas (relational API N+1 behavior)
- PostgreSQL Migration Mistakes — https://dev.to/mickelsamuel/the-5-postgresql-migration-mistakes-that-cause-production-outages-ngg
- Drizzle ORM Best Practices Gist — https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717

### Tertiary (Codebase analysis — HIGH confidence)
- `src/db/schema.ts` — 1263 lines, 30+ tables, 12 unique indexes, 0 performance indexes
- `supabase/migrations/013_add_performance_indexes.sql` — 35 hand-written indexes, 7 commented out
- `src/server/routes/outreach/campaigns.ts` — 6/8 endpoints unpaginated
- `src/server/jobs/processQueue.ts` — N+1 pattern (3 queries per delivery)
- `src/server/jobs/processOutreachSequences.ts` — unbounded lead query
- `.planning/codebase/CONCERNS.md` — Performance section documenting missing indexes

---
*Research completed: 2026-03-31*
*Ready for roadmap: yes*
