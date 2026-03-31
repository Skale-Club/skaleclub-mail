# Domain Pitfalls: Database Health Improvements

**Domain:** Supabase/PostgreSQL + Drizzle ORM — adding indexes, optimizing queries, hardening schemas on existing system
**Researched:** 2026-03-31
**Confidence:** HIGH

---

## Critical Pitfalls

Mistakes that cause write locks, security breaches, or data loss during database optimization.

---

### Pitfall 1: `CREATE INDEX` Blocks All Writes on Production Tables

**What goes wrong:**
Running `CREATE INDEX` on a production table acquires a **SHARE (ShareLock)** on the table. This blocks every INSERT, UPDATE, and DELETE for the entire duration of the index build. On the `messages`, `campaign_leads`, or `outreach_emails` tables, this can freeze writes for seconds to minutes. SMTP sessions time out, cron jobs pile up, the application appears hung.

**Why it happens:**
Developers default to `CREATE INDEX` because it's standard SQL. Drizzle's `db:push` generates plain `CREATE INDEX` statements. The docs don't emphasize locking implications. The project's `npm run db:push` workflow makes it easy to accidentally push a blocking index.

**How to avoid:**
- Use `CREATE INDEX CONCURRENTLY` for ALL index additions on existing tables
- Drizzle does NOT support `CONCURRENTLY` natively in schema definitions — you must write raw SQL migrations
- CONCURRENTLY uses ShareUpdateExclusiveLock, which allows all DML to continue
- Schedule during low-traffic periods anyway — CONCURRENTLY is 2-3x slower and uses more I/O

**Warning signs:**
- `npm run db:push` hangs or takes unusually long
- API requests start timing out right after a schema push
- Cron job runs overlap (the `isSequenceProcessing` flag fires frequently)
- Supabase dashboard shows long-running queries with lock wait events

**Phase to address:**
Phase 1 (Index Audit & Foundation) — every index addition must use CONCURRENTLY

---

### Pitfall 2: `CREATE INDEX CONCURRENTLY` Cannot Run Inside a Transaction

**What goes wrong:**
You wrap your migration in `BEGIN; ... COMMIT;` and `CREATE INDEX CONCURRENTLY` fails with: `ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block`. Drizzle's migration runner wraps migrations in transactions — so generated migrations with CONCURRENTLY will fail.

**Why it happens:**
CONCURRENTLY commits multiple internal transactions during its multi-phase scan-then-validate process. A wrapping transaction prevents this.

**How to avoid:**
- Index migrations must run as standalone SQL statements, NOT inside transactions
- Maintain a separate `sql/indexes.sql` file for concurrent index creation
- Run it directly via `psql` or a custom `npm run db:indexes` script
- Edit any Drizzle-generated migration to remove the transaction wrapper around index statements

**Warning signs:**
- Migration fails with "cannot run inside a transaction block"
- Drizzle migration files contain `CREATE INDEX CONCURRENTLY` inside `BEGIN/COMMIT`

**Phase to address:**
Phase 1 (Index Audit & Foundation) — set up separate index migration workflow

---

### Pitfall 3: Failed `CONCURRENTLY` Leaves an INVALID Index Behind

**What goes wrong:**
If `CREATE INDEX CONCURRENTLY` fails (e.g., duplicate values for a unique index, or the connection drops), PostgreSQL leaves behind a broken index marked `indisvalid = false`. This wastes disk space, blocks future index creation with the same name, and does NOT auto-clean.

**Why it happens:**
CONCURRENTLY's two-scan approach means partial state persists after failure. Unlike regular `CREATE INDEX` (which rolls back inside a transaction), CONCURRENTLY commits its first phase then fails during validation.

**How to avoid:**
- After every CONCURRENTLY index creation, verify: `SELECT indisvalid FROM pg_index WHERE indexrelid = 'idx_name'::regclass;`
- If `false`, immediately: `DROP INDEX IF EXISTS idx_name;`
- Run a cleanup script to find all invalid indexes:
  ```sql
  SELECT schemaname, indexname
  FROM pg_indexes i
  JOIN pg_class c ON c.relname = i.indexname
  JOIN pg_index idx ON idx.indexrelid = c.oid
  WHERE NOT idx.indisvalid;
  ```

**Warning signs:**
- Index appears in `\d table_name` but `EXPLAIN` shows sequential scans
- Migration reports success but performance didn't improve
- Future migrations fail with "relation already exists"

**Phase to address:**
Phase 1 (Index Audit & Foundation) — add post-migration verification step

---

### Pitfall 4: Missing Indexes on Foreign Key Columns (Especially `organizationId`)

**What goes wrong:**
PostgreSQL does NOT automatically create indexes on foreign key columns. Every table in this project has `organizationId` FK, but most have no index on it. The `messages`, `leads`, `campaign_leads`, `outreach_emails`, `statistics` tables all query `WHERE organizationId = ?` — and do sequential scans. The statistics queries in `organizations.ts:488-559` hit the full `messages` table.

**Why it happens:**
Developers assume FK = indexed. This is true for the referenced (parent) side (PK is indexed), but NOT for the referencing (child) side. Drizzle's `.references(() => organizations.id)` creates a constraint, not an index.

**How to avoid:**
- Index EVERY foreign key column in WHERE/JOIN clauses
- Priority order for this codebase:
  1. `messages.organizationId` — statistics queries do full-table scans
  2. `campaign_leads.campaignId` + `campaign_leads.nextScheduledAt` — cron processor's primary filter
  3. `outreach_emails.campaignId` and `outreach_emails.campaignLeadId`
  4. `leads.organizationId` and `leads.leadListId`
  5. `statistics.organizationId` — dashboard stats
  6. `deliveries.messageId` — delivery lookups
  7. `webhook_requests.webhookId` — log queries
- Use composite indexes: `(organizationId, status)` on `messages` covers the GROUP BY query

**Warning signs:**
- `EXPLAIN ANALYZE` shows `Seq Scan` on large tables
- Dashboard stats endpoint takes >500ms
- Sequence processing cron takes increasingly longer

**Phase to address:**
Phase 1 (Index Audit & Foundation) — highest-impact single change

---

### Pitfall 5: `db:push` Destroys Data on Non-Additive Schema Changes

**What goes wrong:**
`npm run db:push` applies schema changes directly. For new columns/tables, this is fine. But if you rename a column, change a type, or remove a column, `db:push` will DROP and RECREATE the table, destroying all data. No rollback.

**Why it happens:**
`db:push` is designed for rapid prototyping. It can't do complex ALTER operations — it falls back to drop-and-recreate. It prompts for confirmation, but the prompt is easy to skip.

**How to avoid:**
- NEVER use `db:push` on production databases
- Use `drizzle-kit generate` to create migration files, review them, then `drizzle-kit migrate` to apply
- For index additions, `db:push` uses regular `CREATE INDEX` (blocking writes) — write raw SQL anyway
- Keep `db:push` for local development only

**Warning signs:**
- Running `db:push` shows "table will be dropped and recreated"
- Data disappears after a schema push
- Migration history is out of sync

**Phase to address:**
Phase 0 (before any changes) — establish the migration workflow

---

### Pitfall 6: RLS Policies Reference Non-Existent Columns/Tables — Data Isolation May Be Broken

**What goes wrong:**
The RLS migration (`supabase/migrations/001_enable_rls.sql`) references a `servers` table and `server_id` columns that were removed in migration 008. Policies using `is_server_member(server_id)` are broken. **Data isolation between organizations may be completely non-functional at the database layer.**

**Why it happens:**
The `servers` table was removed but RLS migration wasn't updated. Drizzle doesn't manage RLS policies — they're raw SQL that must be maintained separately.

**How to avoid:**
- Audit ALL RLS policies before adding any indexes: `SELECT tablename, policyname, qual FROM pg_policies WHERE schemaname = 'public';`
- Fix broken policies FIRST — indexes on tables with broken RLS is building on sand
- For Supabase RLS, always use `(select auth.uid())` instead of `auth.uid()` (99.94% performance improvement per Supabase benchmarks)
- Index columns referenced in RLS policies (especially organizationId joins)

**Warning signs:**
- RLS migration errors in Supabase logs
- Users can see data from other organizations (security breach)
- Queries through Supabase client return empty when they shouldn't

**Phase to address:**
Phase 0 (prerequisite) — must fix before any other database work

---

## Moderate Pitfalls

---

### Pitfall 7: Drizzle Relations API Causes N+1 Queries

**What goes wrong:**
Using `db.query.campaigns.findMany({ with: { sequences: true, campaignLeads: true, outreachEmails: true } })` fires separate queries for each relation. With 100 campaigns, this means 100+ SQL queries. The `campaignsRelations` definition with `many(sequences)`, `many(campaignLeads)`, `many(outreachEmails)` is particularly dangerous.

**Why it happens:**
Drizzle's relational API uses a "split query" strategy — separate queries for `many` relations. This is fine for detail views but disastrous for list views.

**How to avoid:**
- Use explicit JOINs (`db.select().from().leftJoin()`) for list views and dashboards
- Reserve `db.query` for single-record detail views
- Use `columns` to limit fetched fields: `{ columns: { id: true, name: true, status: true } }`
- Add `limit` to nested `many` relations: `{ with: { campaignLeads: { limit: 10 } } }`
- For statistics, always use `select().from().where().groupBy()` — never the relational API

**Warning signs:**
- Browser network tab shows dozens of identical API calls per page
- Database query log shows same pattern repeated with different IDs
- Page load scales linearly with record count

**Phase to address:**
Phase 2 (Query Pattern Fixes) — audit and rewrite high-traffic queries

---

### Pitfall 8: Composite Index Column Order Matters — Wrong Order = Useless Index

**What goes wrong:**
`CREATE INDEX ON messages(status, organizationId)` when the query is `WHERE organizationId = ? AND status = ?` works but is suboptimal. PostgreSQL can only efficiently use leftmost columns of a B-tree index. `organizationId` is more selective (tenant filter) and should come first.

**Why it happens:**
Developers create composite indexes without considering column order. The WHERE clause order doesn't matter — the INDEX definition order does.

**How to avoid:**
- Put the most selective column first (narrows rows the most)
- For multi-tenant apps: `organizationId` always comes first
- Correct: `CREATE INDEX ON messages(organizationId, status)`
- Range queries: equality column first, range last: `(organizationId, createdAt)` supports `WHERE organizationId = ? AND createdAt > ?`
- Verify with `EXPLAIN (ANALYZE, BUFFERS)` after creation

**Warning signs:**
- `EXPLAIN` shows "Index Scan" but still reads many blocks
- Index exists but query is slower than expected

**Phase to address:**
Phase 1 (Index Audit & Foundation) — design indexes correctly from the start

---

### Pitfall 9: `npm run db:generate` Misses Index Changes

**What goes wrong:**
Drizzle Kit's `generate` command may NOT reliably detect index additions/changes, especially raw SQL indexes. It focuses on table structure diffing. Generated SQL doesn't support PostgreSQL-specific options like `CONCURRENTLY`.

**Why it happens:**
Drizzle's migration diffing prioritizes table structure. Index operations are sometimes missed or simplified.

**How to avoid:**
- Maintain a separate `sql/indexes.sql` file for all index operations
- Don't rely on Drizzle for index migrations — use raw SQL
- Keep Drizzle schema definition for documentation/type safety
- Add `npm run db:indexes` script that runs the raw SQL file
- Document which migrations are auto-generated vs hand-written

**Warning signs:**
- `db:generate` produces empty migration after adding indexes
- Generated migration uses `CREATE INDEX` without `CONCURRENTLY`
- Index exists in schema.ts but not in database

**Phase to address:**
Phase 0 (process setup) — establish workflow before touching indexes

---

### Pitfall 10: Over-Indexing Slows Down Writes

**What goes wrong:**
Adding 10 indexes to `messages` means every INSERT/UPDATE must update 10 B-tree structures. For high-write tables like `outreach_emails` (one row per campaign lead per step), this adds measurable latency to the sending pipeline.

**Why it happens:**
"Index everything" after discovering missing indexes is tempting. But indexes have a write cost proportional to their count.

**How to avoid:**
- Only index columns in WHERE, JOIN, or ORDER BY clauses
- Use partial indexes for filtered queries: `CREATE INDEX ON messages(organizationId) WHERE status = 'pending'`
- Use covering indexes (`INCLUDE`) to avoid table lookups
- Monitor write latency after adding indexes — >20% regression = problem
- Prioritize read optimization on dashboard; leave write-heavy tables with fewer targeted indexes

**Warning signs:**
- SMTP send latency increases after adding indexes
- Sequence processing cron takes longer per lead
- Dead tuple counts growing on write-heavy tables

**Phase to address:**
Phase 2 (Query Pattern Fixes) — balance read vs write index costs

---

### Pitfall 11: RLS Performance Without `(select auth.uid())` Wrapper

**What goes wrong:**
RLS policies using `auth.uid() = user_id` call the function for EVERY row. On a table with 100K rows, that's 100K function calls per query. Wrapping in `(select auth.uid())` causes PostgreSQL to run it once (initPlan) and reuse the result.

**Why it happens:**
The Supabase docs and most tutorials show the unwrapped form. The performance difference isn't obvious until the table grows.

**How to avoid:**
- Always write: `(select auth.uid()) = user_id` — not `auth.uid() = user_id`
- Same for `(select auth.jwt())` and any `security definer` functions in policies
- Per Supabase benchmarks: 94-99.99% performance improvement
- Always specify `TO authenticated` in policies to prevent evaluation for `anon` users

**Warning signs:**
- RLS-protected queries are 10-100x slower than expected
- `EXPLAIN` shows function call in every row's filter condition

**Phase to address:**
Phase 1 (Index Audit & Foundation) — fix when auditing RLS policies

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `db:push` for all changes | Fast iteration, no migration files | No rollback, data loss risk, can't reproduce environments | Local development only |
| Adding indexes without `CONCURRENTLY` | Simpler syntax | Blocks all writes, application freeze | Empty tables or initial setup only |
| Querying `messages` for live stats | No pre-aggregation needed | O(n) scan, doesn't scale | <10K messages only |
| Using Drizzle relational API for lists | Clean syntax, type-safe | N+1 queries, hidden perf cliffs | Detail views only |
| Skipping RLS policy audit | Saves time now | Security vulnerability, broken isolation | Never |
| Creating indexes on all columns "just in case" | Covers all patterns | Slow writes, wasted disk | Never |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Drizzle + PostgreSQL indexes | Relying on schema for index migrations | Maintain raw SQL index file; Drizzle for types only |
| Drizzle + `db:push` in production | Using push for quick fixes | Always `generate` + `migrate` for production |
| Supabase + RLS + indexes | Adding indexes without verifying RLS policies reference correct columns | Fix RLS first, then index RLS-referenced columns |
| Supabase + connection pool | Not configuring PgBouncer | Enable transaction-mode PgBouncer; Drizzle pool ≤ PgBouncer limit |
| Drizzle relational API + pagination | `findMany` with `with` and `limit` but no efficient pagination | Use explicit JOIN + cursor-based pagination |
| `node-cron` + long-running queries | Cron fires again before previous completes | Concurrency guard; advisory locks for index operations |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Sequential scan on `messages` for stats | Dashboard >1s | Composite index `(organizationId, status)` | >50K messages |
| No pagination on lead lists | Browser hangs | Cursor pagination: `WHERE id > ? LIMIT N` | >5K leads |
| N+1 from campaign → leads → steps | API time scales with records | Explicit JOINs or batch-load relations | >100 campaigns |
| Stats computed at query time | Stats endpoint seconds | Pre-aggregate in `statistics` table via cron | >100K messages |
| RLS without `(select auth.uid())` | Per-row function call | Wrap in `(select ...)` for initPlan | >1K rows |
| No index on `campaign_leads.nextScheduledAt` | Sequence processor full scan | Partial index on `nextScheduledAt` | >10K campaign leads |
| Full `SELECT *` on message bodies | Fetches KB-scale for lists | Select only needed columns; exclude bodies | Always |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Broken RLS after schema changes | Cross-tenant data exposure | Audit RLS after every migration; test with two users |
| `db:push` on production without backup | Irrecoverable data loss | Never push to production; use migration files |
| Dropping RLS "temporarily" for migration | Window of unprotected access | Use service role key for migrations; never disable RLS in app |
| Index on sensitive column reveals timing | Timing side-channel | Acceptable for internal tools; relevant if exposing to end users |

## "Looks Done But Isn't" Checklist

- [ ] **Index creation:** Verify with `SELECT * FROM pg_indexes WHERE tablename = ?`
- [ ] **CONCURRENTLY index:** Check `indisvalid` is `true` — failed builds leave invalid indexes
- [ ] **RLS policies:** Test with two users in different organizations — can user A see user B's data?
- [ ] **Query performance:** Run `EXPLAIN (ANALYZE, BUFFERS)` — don't assume indexes are used
- [ ] **Write performance:** Benchmark INSERT latency before/after indexes — >20% regression = problem
- [ ] **Migration rollback:** Can you reverse every migration? Test the rollback path
- [ ] **Connection pool:** Pool size configured for production? Default may be wrong
- [ ] **Stats accuracy:** Do dashboard numbers match raw counts? Pre-aggregation can drift

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Regular `CREATE INDEX` locked production | LOW | Wait for completion; next time use CONCURRENTLY |
| Failed CONCURRENTLY left invalid index | LOW | `DROP INDEX IF EXISTS idx_name;` then retry |
| `db:push` destroyed data | HIGH | Restore from Supabase backup (if available) |
| Broken RLS allows cross-org access | MEDIUM | Fix policies immediately; audit logs; rotate keys |
| Over-indexing slowed writes | MEDIUM | Drop non-essential indexes; keep only EXPLAIN-verified |
| N+1 queries causing high DB load | LOW | Rewrite with explicit JOINs; add query logging |
| Wrong composite column order | LOW | Drop and recreate with correct order |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|-------------|
| RLS policies reference dead columns | Phase 0 (prerequisite) | RLS audit SQL; cross-org isolation test |
| `CREATE INDEX` blocks writes | Phase 1 (Index Audit) | CONCURRENTLY; monitor lock waits |
| CONCURRENTLY inside transaction fails | Phase 1 (Index Audit) | Separate SQL file; no transaction wrapper |
| Invalid index left behind | Phase 1 (Index Audit) | Check `indisvalid` after creation |
| Missing FK indexes | Phase 1 (Index Audit) | `EXPLAIN ANALYZE` on every key query |
| Wrong composite column order | Phase 1 (Index Audit) | `EXPLAIN (ANALYZE, BUFFERS)` shows efficient use |
| Statistics full-table scans | Phase 1 (Index Audit) | Dashboard stats <200ms |
| `db:push` data loss | Phase 0 (process) | Never push to production |
| Drizzle misses index changes | Phase 0 (process) | Manual verification of generated SQL |
| N+1 from relational API | Phase 2 (Query Fixes) | Query log shows <5 queries per page |
| Over-indexing write penalty | Phase 2 (Query Fixes) | INSERT latency <20% regression |
| Live stats too expensive | Phase 2 (Query Fixes) | Pre-aggregation produces correct numbers |
| RLS without `(select ...)` | Phase 1 (RLS fix) | EXPLAIN shows initPlan, not per-row call |

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Adding indexes to `messages` | Regular CREATE INDEX blocks writes on largest table | Use CONCURRENTLY; low-traffic window |
| Adding indexes to `campaign_leads` | Wrong column order makes index ineffective | `campaignId` first, then `nextScheduledAt` |
| Fixing RLS policies | App code assumes working RLS | Test every endpoint with two-org isolation |
| Rewriting queries for N+1 | Breaking type-safe API contract | Keep Drizzle types; change query execution |
| Statistics pre-aggregation | Drifts from real data | Reconciliation check in cron |
| Connection pool tuning | Too many/few connections | Check Supabase plan limits; PgBouncer |

## Sources

- [PostgreSQL CREATE INDEX CONCURRENTLY — Bytebase (2025)](https://www.bytebase.com/blog/postgres-create-index-concurrently) — HIGH confidence
- [PostgreSQL Locking Documentation (2026)](https://www.postgresql.org/docs/current/explicit-locking.html) — HIGH confidence
- [Supabase RLS Performance Best Practices (2025)](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- [Drizzle ORM PostgreSQL Best Practices (2025)](https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717) — MEDIUM confidence
- [Drizzle ORM Gotchas — Official Docs](https://orm.drizzle.team/docs/gotchas) — HIGH confidence
- [CONCERNS.md — Codebase analysis (2026-03-31)](../codebase/CONCERNS.md) — HIGH confidence
- [PostgreSQL Index Locking Considerations (2026)](https://www.postgresql.org/docs/current/index-locking.html) — HIGH confidence
- [PostgreSQL Migration Mistakes — DEV (2026)](https://dev.to/mickelsamuel/the-5-postgresql-migration-mistakes-that-cause-production-outages-ngg) — MEDIUM confidence

---

*Pitfalls research for: Database health improvements on Supabase + Drizzle system*
*Researched: 2026-03-31*
