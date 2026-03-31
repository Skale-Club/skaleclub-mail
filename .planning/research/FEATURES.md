# Feature Research — Database Health Improvements

**Domain:** Database performance & reliability for email/campaign platform
**Researched:** 2026-03-31
**Confidence:** HIGH (grounded in direct codebase analysis)

## Current State Summary

The codebase has **zero non-unique indexes** beyond primary keys and uniqueness constraints. 15 unique indexes exist (for duplicate prevention), but no query-performance indexes on `organizationId`, `status`, `created_at`, or any foreign key columns used in WHERE/JOIN clauses. Pagination exists on only 4 of ~15 list endpoints. Connection pooling is already properly configured via `postgres.js` (pool size 20, transaction mode through Supavisor).

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete (pages are slow, data can be corrupted).

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Foreign key indexes on all org-scoped tables** | Every query filters by `organizationId`. Without indexes, Postgres does sequential scans. | LOW | Add B-tree indexes on `(organizationId)` for: `messages`, `deliveries`, `domains`, `credentials`, `routes`, `webhooks`, `webhook_requests`, `email_accounts`, `lead_lists`, `leads`, `campaigns`, `campaign_leads`, `outreach_emails`, `track_domains`, `suppressions`, `statistics`, `outlook_mailboxes`. Drizzle schema pattern: `index('name').on(table.orgId)` |
| **Pagination on all list endpoints** | Lists that load all rows (campaigns, email accounts, lead lists, sequences, analytics) freeze the UI at scale. 5 endpoints already paginated, 6+ are not. | MEDIUM | Campaigns list (`/api/outreach/campaigns`) loads ALL campaigns + nested sequences + steps (triple JOIN). Email accounts list loads ALL. Lead lists load ALL. Sequences loads ALL across ALL campaigns. Each needs `page`/`limit` params matching the existing pattern in `messages.ts` and `leads.ts`. |
| **Composite indexes for filter queries** | The `messages` stats endpoint does `count(*) filter where status = X` and `count(*) where openedAt IS NOT NULL` on full table. | LOW | Add `(organizationId, status)` and `(organizationId, openedAt)` composite indexes on `messages`. Same pattern needed for `campaignLeads(campaignId, status)` for campaign stats. |
| **Index on `campaignLeads.nextScheduledAt`** | The `processOutreachSequences` job queries `WHERE nextScheduledAt <= now()` across ALL unprocessed leads. This is the send pipeline hot path. | LOW | Add index on `(nextScheduledAt)` with a partial filter for non-terminal statuses: `WHERE status NOT IN ('replied', 'bounced', 'unsubscribed')`. This makes the cron job O(log n) instead of O(n). |
| **Count query optimization** | Every paginated endpoint runs `count(*)` twice (once for total, once for data). At scale, the count query scans the same index as the data query. | LOW | Acceptable pattern at this scale. The count query will use the new indexes. No code change needed — just the indexes. |
| **`created_at` indexes for sort** | Most endpoints sort by `createdAt DESC`. Without an index, Postgres sorts in memory on every request. | LOW | Add `(organizationId, createdAt DESC)` indexes on tables with list endpoints. Drizzle `index('name').on(table.orgId, table.createdAt)` |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Cursor-based pagination for leads** | Offset pagination is O(offset) on large lead lists — page 100 of 10K leads scans 5000 rows. Cursor pagination is O(1). Essential if lead imports reach 10K+. | HIGH | Requires API change (opaque cursor instead of page number). Use `id` or `createdAt` as cursor. Drizzle `.where(gt(table.createdAt, cursor)).limit(50)`. Only needed for `leads` endpoint — other lists stay small. |
| **Query-level SELECT column filtering** | Campaigns endpoint loads ALL columns including description, tracking settings, timestamps. List views only need `id, name, status, createdAt, totalLeads`. Reduces payload size 60%+. | LOW | Drizzle supports `.columns({ id: true, name: true, status: true })` on `findMany`. Already used in campaigns stats endpoint (`columns: { id: true, status: true }`). Apply to list endpoints. |
| **Pre-computed denormalized counts** | Campaign stats query does 7 aggregate functions on `campaignLeads` table. The `campaigns` table already has `totalLeads`, `totalOpens`, etc. columns — but they're not always in sync. | MEDIUM | Audit and fix the increment paths (`incrementCampaignStats` in `outreach-sender.ts`). The columns exist but aren't consistently updated. If fixed, stats endpoint can read columns directly instead of aggregating. |
| **Batched lead import** | Current bulk import inserts 1000 leads in one `db.insert(leads).values([...1000 items])`. Works but can timeout on slow connections. | LOW | Already has a 1000-item cap. Add chunked inserts (100 per batch) with transaction wrapping for reliability. Drizzle supports transactions: `db.transaction(async (tx) => { ... })` |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Redis caching layer** | "Cache the stats so they load instantly" | Adds infrastructure dependency (Redis). Cache invalidation is hard — stale stats show wrong numbers. Current scale doesn't need it. | Fix the indexes first. The stats queries are fast with proper indexes. Pre-computed columns on `campaigns` table already serve as a cache. |
| **Materialized views for analytics** | "Pre-aggregate the daily stats" | Materialized views need manual refresh. Stale data. Extra complexity. Current `statistics` table already does daily aggregation. | Add the missing indexes. The `outreachAnalytics` table already aggregates daily stats. Fix the increment paths to keep it in sync. |
| **ORM-level query caching (Drizzle cache)** | "Cache query results in Drizzle" | Drizzle doesn't have built-in query caching. Forcing it adds wrapper complexity. postgres.js already has prepared statement caching. | Connection pooling (already configured) + indexes solve the actual problem. |
| **Full-text search on leads** | "Search leads by company name, title, etc." | PostgreSQL full-text search requires GIN indexes, tsvector columns, query rewrites. Overkill for a platform with small datasets. | `ILIKE '%term%'` with the new indexes handles the current need. Can revisit at 100K+ leads. |
| **Read replicas** | "Split read/write traffic for performance" | Supabase doesn't expose read replicas on standard plans. Adds connection management complexity. | Connection pool (already 20 connections) handles current load. Indexes fix the actual slowness. |

---

## Feature Dependencies

```
[FK Indexes]
    └──enables──> [Pagination] (indexes make count queries fast)
    └──enables──> [Stats Performance] (composite indexes for aggregate queries)

[Composite Indexes]
    └──enables──> [Pre-computed Counts] (fast enough to keep denormalized data consistent)

[Pagination — Campaigns]
    └──requires──> [SELECT Column Filtering] (reduce payload size)

[Cursor Pagination — Leads]
    └──requires──> [FK Indexes on leads] (cursor needs indexed sort column)
    └──enhances──> [Bulk Import Reliability] (consistent performance at scale)
```

### Dependency Notes

- **FK Indexes are the foundation**: Everything else depends on indexes being in place. Pagination without indexes still scans full tables.
- **Pagination is independent per endpoint**: Can roll out incrementally (campaigns first, then email accounts, etc.)
- **Pre-computed counts conflict with fresh aggregation**: If we fix denormalized column updates, we can skip aggregate queries entirely for stats.

---

## MVP Definition

### Launch With (v1.1)

Minimum to fix "every page loads slow" and "no indexes set up":

- [ ] **FK indexes on all org-scoped tables** — 17 `CREATE INDEX` statements via Drizzle migration. The single biggest performance win.
- [ ] **Composite indexes for stats queries** — `(organizationId, status)` on messages and campaignLeads. Makes dashboard stats sub-second.
- [ ] **Index on `campaignLeads.nextScheduledAt`** — Unblocks the send pipeline from scanning all leads every cron cycle.
- [ ] **Pagination on campaigns list** — Currently the worst offender (loads all campaigns + nested sequences + steps with zero limit).
- [ ] **Pagination on email accounts and lead lists** — Follow the existing `page`/`limit` pattern from `messages.ts`.

### Add After Validation (v1.1.x)

- [ ] **Pagination on sequences list** — Loads ALL sequences across ALL campaigns. Less frequent access than campaigns.
- [ ] **SELECT column filtering on list endpoints** — Reduce payload sizes for campaigns, email accounts.
- [ ] **Audit and fix denormalized count columns** — Ensure `campaigns.totalLeads`, `campaigns.totalOpens`, etc. stay in sync.
- [ ] **Add `EXPLAIN ANALYZE` logging in dev mode** — Log slow queries (>100ms) to catch regressions.

### Future Consideration (v1.2+)

- [ ] **Cursor-based pagination for leads** — Only needed at 50K+ leads. Offset pagination is fine for now.
- [ ] **Chunked batch inserts** — Only needed if bulk import starts timing out.
- [ ] **Database-level constraints** — NOT NULL defaults, CHECK constraints on status fields.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| FK indexes (17 tables) | HIGH | LOW | P1 |
| Composite indexes (stats) | HIGH | LOW | P1 |
| nextScheduledAt index | HIGH | LOW | P1 |
| Pagination — campaigns | HIGH | MEDIUM | P1 |
| Pagination — email accounts | MEDIUM | LOW | P1 |
| Pagination — lead lists | MEDIUM | LOW | P1 |
| SELECT column filtering | MEDIUM | LOW | P2 |
| Fix denormalized counts | MEDIUM | MEDIUM | P2 |
| Pagination — sequences | MEDIUM | MEDIUM | P2 |
| Slow query logging | LOW | LOW | P2 |
| Cursor pagination — leads | LOW | HIGH | P3 |
| Batch insert chunking | LOW | LOW | P3 |

**Priority key:**
- P1: Must have — fixes the "every page loads slow" problem
- P2: Should have — improves quality, prevents future issues
- P3: Nice to have — only needed at significant scale

---

## Competitor Feature Analysis

| Feature | Postal | SmartLead | Instantly | Our Approach |
|---------|--------|-----------|-----------|--------------|
| Indexes on org-scoped columns | Yes (Rails auto-indexes FKs) | Yes | Yes | Add manually via Drizzle — we're behind |
| Paginated list endpoints | Yes | Yes | Yes | 4/15 endpoints paginated — need to complete |
| Cursor pagination for leads | No (offset) | Yes | Yes | Defer — offset is fine at current scale |
| Stats via denormalized columns | No (aggregate queries) | Yes | Yes | Columns exist, increment paths need audit |
| Slow query detection | No | Yes (logging) | Yes | Add EXPLAIN ANALYZE in dev mode |

---

## Existing Infrastructure (Already Working)

These don't need to be built — they're already in place:

| Feature | Status | Location |
|---------|--------|----------|
| Connection pooling | Configured | `src/db/index.ts` — pool of 20, Supavisor transaction mode |
| Prepared statements | Enabled | `postgres.js` with `prepare: true` |
| Query logging in dev | Configured | `src/db/index.ts` — Drizzle logger enabled when `NODE_ENV=development` |
| Database health check | Working | `checkDatabaseHealth()` in `src/db/index.ts` |
| Pool stats monitoring | Working | `getPoolStats()` in `src/db/index.ts` |
| Retry with backoff | Working | `withRetry()` in `src/db/index.ts` |
| Zod validation on all routes | Working | All API routes validate request bodies |
| RLS policies | Partially broken | Migration 001 references removed `servers` table — out of scope for this milestone |

---

## Sources

- Direct codebase analysis: `src/db/schema.ts` (1254 lines, 15 unique indexes, 0 performance indexes)
- Direct codebase analysis: `src/server/routes/outreach/campaigns.ts` (6/8 endpoints unpaginated)
- Direct codebase analysis: `src/server/routes/outreach/leads.ts` (3/7 endpoints unpaginated)
- Direct codebase analysis: `src/server/routes/organizations.ts` (stats endpoint, full table scans)
- Direct codebase analysis: `src/server/routes/messages.ts` (reference pagination implementation)
- Direct codebase analysis: `src/server/jobs/processOutreachSequences.ts` (unbounded lead query)
- Direct codebase analysis: `src/db/index.ts` (connection pool, retry, health checks)
- `.planning/codebase/CONCERNS.md` (Performance section, lines 24-36)

---

*Feature research for: database health improvements*
*Researched: 2026-03-31*
