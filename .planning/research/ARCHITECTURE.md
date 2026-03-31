# Architecture Research: Database Health Improvements

**Domain:** Multi-tenant email platform database optimization
**Researched:** 2026-03-31
**Confidence:** HIGH

## Current Architecture Assessment

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Current State (v1.0)                        │
├─────────────────────────────────────────────────────────────┤
│  src/db/schema.ts (1263 lines, 30+ tables)                   │
│  ├── 12 unique indexes defined in Drizzle schema             │
│  ├── 0 non-unique performance indexes in schema              │
│  ├── 30+ foreign keys (most without covering indexes)        │
│  └── Single-file schema, all tables in one place             │
├─────────────────────────────────────────────────────────────┤
│  supabase/migrations/013_add_performance_indexes.sql         │
│  ├── 35 hand-written CREATE INDEX statements                 │
│  ├── Exists OUTSIDE Drizzle schema (drift risk)              │
│  ├── 7 indexes commented out (not yet created)               │
│  └── No partial indexes beyond 2 webhooks/campaigns          │
├─────────────────────────────────────────────────────────────┤
│  Query Layer (route handlers + jobs)                         │
│  ├── db.query.*.findMany() — no pagination on most routes    │
│  ├── Nested eager loading via `with: {}` — full depth        │
│  ├── N+1 in processQueue (load delivery → load message →     │
│  │   load org separately per delivery)                       │
│  └── Raw SQL only in tracking.ts (upserts, increments)       │
├─────────────────────────────────────────────────────────────┤
│  Drizzle ORM + PostgreSQL (Supabase)                         │
│  ├── postgres.js pool (max 20, Supavisor transaction mode)   │
│  ├── drizzle.config.ts → ./drizzle (generated migrations)    │
│  └── RLS policies in supabase/migrations/*.sql               │
└─────────────────────────────────────────────────────────────┘
```

## Where Indexes Go: Dual-Track Problem

### The Core Issue

This project has **two places** where indexes can be defined, and they're out of sync:

| Location | What's There | Who Uses It |
|----------|-------------|-------------|
| `src/db/schema.ts` | 12 unique indexes (on unique constraints) | Drizzle ORM types, `db:generate` |
| `supabase/migrations/013_*.sql` | 35 hand-written indexes (7 commented out) | `npm run db:push` direct SQL |

**Drizzle schema-defined indexes** only generate SQL during `npm run db:generate`. The hand-written SQL migration in `013_add_performance_indexes.sql` runs via `npm run db:push` and exists outside Drizzle's awareness.

**Problem:** If someone runs `npm run db:generate` after modifying schema.ts, Drizzle may not know about the manual indexes. If someone modifies `013_*.sql`, the schema doesn't reflect it. This is schema drift.

### Recommended Approach: Schema-First with Drizzle

**Move all indexes INTO `src/db/schema.ts`** using Drizzle's index API. This is the correct integration point because:

1. **Drizzle ORM** uses `pgTable`'s second argument (callback) for indexes — `uniqueIndex`, `index`, etc.
2. **`npm run db:generate`** produces migration SQL that includes index changes
3. **Single source of truth** — schema.ts is the authority, no drift between manual SQL and ORM definitions
4. **Type safety** — index names are co-located with table definitions

```typescript
// Current: only unique indexes in schema.ts
export const campaignLeads = pgTable('campaign_leads', {
    // ...columns...
}, (table) => ({
    campaignLeadUnique: uniqueIndex('campaign_lead_unique').on(table.campaignId, table.leadId),
}))

// After optimization: add performance indexes alongside unique indexes
export const campaignLeads = pgTable('campaign_leads', {
    // ...columns...
}, (table) => ({
    // Existing unique constraint
    campaignLeadUnique: uniqueIndex('campaign_lead_unique').on(table.campaignId, table.leadId),
    // NEW: Performance indexes for common queries
    campaignIdIdx: index('idx_campaign_leads_campaign_id').on(table.campaignId),
    leadIdIdx: index('idx_campaign_leads_lead_id').on(table.leadId),
    statusIdx: index('idx_campaign_leads_status').on(table.status),
    nextScheduledIdx: index('idx_campaign_leads_next_scheduled').on(table.nextScheduledAt),
    // NEW: Composite index for the processOutreachSequences job query
    pendingLeadsIdx: index('idx_campaign_leads_pending').on(
        table.nextScheduledAt, table.status
    ),
}))
```

### Migration Strategy for Dual-Track

**Step 1:** Add all indexes to `src/db/schema.ts` using Drizzle's `index()` API
**Step 2:** Run `npm run db:generate` — Drizzle generates migration SQL
**Step 3:** Review generated migration — indexes that already exist in 013 will get `CREATE INDEX IF NOT EXISTS` (safe)
**Step 4:** `013_add_performance_indexes.sql` becomes legacy — can be kept for historical reference but schema.ts becomes source of truth
**Step 5:** Future `npm run db:push` applies schema changes directly

**Key constraint:** Drizzle's `index()` function in schema.ts is a **schema definition**, not a push action. The migration workflow is:
- `npm run db:generate` → generates migration files in `./drizzle/`
- `npm run db:push` → pushes schema to database directly (skips migration files)

The project currently uses `db:push` (direct push), not `db:migrate` (versioned migrations). This means schema.ts changes take effect immediately on push.

## Index Placement: Critical Locations

### Tier 1: Background Job Hot Paths (Highest Impact)

These queries run every 1-5 minutes and scan thousands of rows:

#### `processOutreachSequences` (every 5 min)

```typescript
// Current query (src/server/jobs/processOutreachSequences.ts line 80-91)
const pendingLeads = await db.query.campaignLeads.findMany({
    where: and(
        lte(campaignLeads.nextScheduledAt, now),
        notInArray(campaignLeads.status, ['replied', 'bounced', 'unsubscribed'])
    ),
    with: {
        campaign: true,
        lead: true,
        currentStep: true,
        assignedEmailAccount: true
    }
})
```

**Required index:** `campaign_leads(next_scheduled_at, status)` — composite index on the two filter columns. PostgreSQL can use this for the range scan on `nextScheduledAt <= now` AND the status exclusion.

```typescript
// In schema.ts — campaignLeads table
nextScheduledStatusIdx: index('idx_cl_next_sched_status').on(
    table.nextScheduledAt, table.status
),
```

#### `processQueue` (every 1 min)

```typescript
// Current query (src/server/jobs/processQueue.ts line 18-21)
const pendingDeliveries = await db.query.deliveries.findMany({
    where: eq(deliveries.status, 'pending'),
    limit: 50,
})
```

**Existing index:** `idx_deliveries_status` already exists in `013_*.sql`. This should be migrated to schema.ts.

**Required index (schema.ts):**
```typescript
// deliveries table
statusIdx: index('idx_deliveries_status').on(table.status),
```

#### `processReplies` (every 15 min) and `processBounces` (every 30 min)

These queries scan `messages` or `outreach_emails` filtered by status + timestamp.

**Required indexes:**
```typescript
// messages table — composite for org-scoped status queries
orgStatusCreatedIdx: index('idx_messages_org_status_created').on(
    table.organizationId, table.status, table.createdAt
),
tokenIdx: index('idx_messages_token').on(table.token),  // tracking lookups
```

```typescript
// outreach_emails table
campaignIdIdx: index('idx_outreach_emails_campaign').on(table.campaignId),
campaignLeadIdIdx: index('idx_outreach_emails_campaign_lead').on(table.campaignLeadId),
statusIdx: index('idx_outreach_emails_status').on(table.status),
```

### Tier 2: API Route Endpoints (Medium Impact)

These run on user interaction — list endpoints without pagination will become slow as data grows.

#### Campaign listing (GET /api/outreach/campaigns)

```typescript
// Current (campaigns.ts line 98-114) — loads ALL campaigns for org + nested sequences
const campaignsList = await db.query.campaigns.findMany({
    where: and(...conditions),  // eq(campaigns.organizationId, orgId)
    orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
    with: { sequences: { with: { steps: true } } },
})
```

**Required indexes:**
```typescript
// campaigns table
orgStatusIdx: index('idx_campaigns_org_status').on(table.organizationId, table.status),
orgCreatedIdx: index('idx_campaigns_org_created').on(table.organizationId, table.createdAt),
```

#### Leads listing (GET /api/outreach/leads)

Similar pattern — loads all leads for org, no pagination.

**Required indexes:**
```typescript
// leads table — org-scoped with optional list filter
orgListIdx: index('idx_leads_org_list').on(table.organizationId, table.leadListId),
orgStatusIdx: index('idx_leads_org_status').on(table.organizationId, table.status),
```

#### Message tracking (GET /t/open/:token, GET /t/click/:token)

```typescript
// In tracking.ts — looks up message by token for every tracking hit
const message = await db.query.messages.findFirst({
    where: eq(messages.token, token),
})
```

**Critical index:** `messages(token)` — this is a per-email-open lookup, must be instant.

### Tier 3: Supporting Tables — FK Column Indexes (Lower Impact)

PostgreSQL does NOT automatically index foreign key columns. Every FK needs a corresponding index for efficient joins and cascading deletes.

**All FK columns needing indexes:**

| Table | Column | Index Name |
|-------|--------|------------|
| `domains` | `organization_id` | `idx_domains_org` |
| `credentials` | `organization_id` | `idx_credentials_org` |
| `routes` | `organization_id` | `idx_routes_org` |
| `smtp_endpoints` | `organization_id` | `idx_smtp_endpoints_org` |
| `http_endpoints` | `organization_id` | `idx_http_endpoints_org` |
| `address_endpoints` | `organization_id` | `idx_address_endpoints_org` |
| `outlook_mailboxes` | `organization_id` | `idx_outlook_mailboxes_org` |
| `webhooks` | `organization_id` | `idx_webhooks_org` |
| `webhook_requests` | `webhook_id` | `idx_webhook_requests_webhook` |
| `suppressions` | `organization_id` | `idx_suppressions_org` |
| `track_domains` | `organization_id` | `idx_track_domains_org` |
| `statistics` | `organization_id` | `idx_statistics_org` |
| `templates` | `organization_id` | `idx_templates_org` |
| `email_accounts` | `organization_id` | `idx_email_accounts_org` |
| `lead_lists` | `organization_id` | `idx_lead_lists_org` |
| `leads` | `organization_id` | `idx_leads_org` |
| `leads` | `lead_list_id` | `idx_leads_list` |
| `campaigns` | `organization_id` | `idx_campaigns_org` |
| `sequences` | `campaign_id` | `idx_sequences_campaign` |
| `sequence_steps` | `sequence_id` | `idx_sequence_steps_seq` |
| `campaign_leads` | `campaign_id` | `idx_cl_campaign` |
| `campaign_leads` | `lead_id` | `idx_cl_lead` |
| `campaign_leads` | `assigned_email_account_id` | `idx_cl_email_account` |
| `campaign_leads` | `current_step_id` | `idx_cl_current_step` |
| `outreach_emails` | `organization_id` | `idx_oe_org` |
| `outreach_emails` | `campaign_id` | `idx_oe_campaign` |
| `outreach_emails` | `campaign_lead_id` | `idx_oe_campaign_lead` |
| `outreach_emails` | `sequence_step_id` | `idx_oe_step` |
| `outreach_emails` | `email_account_id` | `idx_oe_email_account` |
| `outreach_analytics` | `organization_id` | `idx_oa_org` |
| `outreach_analytics` | `campaign_id` | `idx_oa_campaign` |
| `outreach_analytics` | `email_account_id` | `idx_oa_email_account` |
| `deliveries` | `message_id` | `idx_deliveries_msg` |
| `deliveries` | `organization_id` | `idx_deliveries_org` |
| `mailboxes` | `user_id` | `idx_mailboxes_user` |
| `mail_folders` | `mailbox_id` | `idx_mail_folders_mb` |
| `mail_messages` | `mailbox_id` | `idx_mm_mailbox` |
| `mail_messages` | `folder_id` | `idx_mm_folder` |

## Query Layer Changes

### Pattern 1: Add Pagination to List Endpoints

**Current pattern (N+1 / full-table scans):**
```typescript
// BAD — loads entire table for org
const campaignsList = await db.query.campaigns.findMany({
    where: eq(campaigns.organizationId, orgId),
    orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
})
res.json({ campaigns: campaignsList })
```

**Target pattern:**
```typescript
// GOOD — offset pagination
const page = Math.max(1, parseInt(req.query.page as string) || 1)
const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 25))
const offset = (page - 1) * pageSize

const [items, [{ count }]] = await Promise.all([
    db.query.campaigns.findMany({
        where: eq(campaigns.organizationId, orgId),
        orderBy: (campaigns, { desc }) => [desc(campaigns.createdAt)],
        limit: pageSize,
        offset,
    }),
    db.select({ count: count() }).from(campaigns).where(eq(campaigns.organizationId, orgId)),
])
res.json({ campaigns: items, pagination: { page, pageSize, total: Number(count) } })
```

**Integration point:** All `GET /api/outreach/*` list routes and `GET /api/*` list routes.

**Files requiring modification:**
- `src/server/routes/outreach/campaigns.ts` — `GET /` (list campaigns)
- `src/server/routes/outreach/leads.ts` — `GET /` (list leads), `GET /lists` (list lead lists)
- `src/server/routes/outreach/email-accounts.ts` — `GET /` (list email accounts)

### Pattern 2: Fix N+1 in processQueue

**Current (processQueue.ts lines 35-68):**
```typescript
// BAD — 3 queries PER delivery (load delivery → load message → load org)
for (const delivery of readyDeliveries) {
    const message = await db.query.messages.findFirst({ where: eq(messages.id, delivery.messageId) })
    const org = await db.query.organizations.findFirst({ where: eq(organizations.id, message.organizationId) })
    // ...process
}
```

**Target: batch-load messages and orgs upfront:**
```typescript
// GOOD — 2 queries total instead of 3*N
const messageIds = readyDeliveries.map(d => d.messageId)
const messagesMap = new Map(
    (await db.query.messages.findMany({
        where: inArray(messages.id, messageIds),
    })).map(m => [m.id, m])
)
const orgIds = [...new Set([...messagesMap.values()].map(m => m.organizationId))]
const orgsMap = new Map(
    (await db.query.organizations.findMany({
        where: inArray(organizations.id, orgIds),
    })).map(o => [o.id, o])
)

for (const delivery of readyDeliveries) {
    const message = messagesMap.get(delivery.messageId)
    const org = message ? orgsMap.get(message.organizationId) : null
    // ...process
}
```

**Integration point:** `src/server/jobs/processQueue.ts` — modify `processDelivery()` function signature to accept pre-loaded maps, or restructure to batch-load before the loop.

### Pattern 3: Selective Column Loading

**Current:** Most queries use `db.query.*.findFirst()` which loads ALL columns including large text fields (htmlBody, plainBody).

**Target for specific cases:**
```typescript
// When only checking existence or getting a count
const count = await db.select({ count: count() })
    .from(campaignLeads)
    .where(eq(campaignLeads.campaignId, campaignId))

// When only needing specific fields (skip large text columns)
const statuses = await db.select({
    id: campaignLeads.id,
    status: campaignLeads.status,
    nextScheduledAt: campaignLeads.nextScheduledAt,
}).from(campaignLeads).where(eq(campaignLeads.campaignId, campaignId))
```

**Integration point:** `src/server/jobs/processOutreachSequences.ts`, route handlers where full objects aren't needed.

### Pattern 4: Partial Indexes for Hot Filters

For queries that always filter on the same value (e.g., `status = 'active'`, `active = true`):

```typescript
// In schema.ts — partial index only indexes rows matching the WHERE clause
// Smaller index = faster scans for hot-path queries
import { index } from 'drizzle-orm/pg-core'

export const campaigns = pgTable('campaigns', {
    // ...columns...
}, (table) => ({
    // Partial index: only active campaigns indexed
    activeOrgIdx: index('idx_campaigns_active_org')
        .on(table.organizationId)
        .where(sql`status = 'active'`),
}))
```

**Use cases:**
- `campaigns` where `status = 'active'` (processOutreachSequences joins active campaigns)
- `webhooks` where `active = true` (tracking webhook dispatch)
- `deliveries` where `status = 'pending'` (processQueue)
- `emailAccounts` where `status = 'active'` (account selection for sending)

## Schema Constraint Improvements

### Missing NOT NULL Constraints

Assessment: NOT NULL constraints are generally well-applied across the schema. All primary ownership columns (organizationId, campaignId, etc.) are `.notNull()`. No critical gaps found.

### Recommended CHECK Constraints

```typescript
// In schema.ts — add check constraints via the table callback
import { check, sql } from 'drizzle-orm/pg-core'

export const emailAccounts = pgTable('email_accounts', {
    // ...columns...
    dailySendLimit: integer('daily_send_limit').default(50).notNull(),
    currentDailySent: integer('current_daily_sent').default(0).notNull(),
}, (table) => ({
    orgEmailUnique: uniqueIndex('email_account_org_email_unique').on(table.organizationId, table.email),
    // NEW: validate daily limits are positive
    dailyLimitCheck: check('daily_send_limit_positive', sql`${table.dailySendLimit} > 0`),
    dailySentCheck: check('current_daily_sent_non_negative', sql`${table.currentDailySent} >= 0`),
}))

export const campaignLeads = pgTable('campaign_leads', {
    // ...columns...
    currentStepOrder: integer('current_step_order').default(0).notNull(),
}, (table) => ({
    campaignLeadUnique: uniqueIndex('campaign_lead_unique').on(table.campaignId, table.leadId),
    // NEW: step order cannot be negative
    stepOrderCheck: check('step_order_non_negative', sql`${table.currentStepOrder} >= 0`),
}))
```

## Migration Workflow: How Changes Integrate

### Current Workflow

```
Developer modifies schema.ts
    ↓
npm run db:push  →  Drizzle compares schema vs database
    ↓
Applies DDL directly to Supabase (CREATE TABLE, ALTER TABLE, CREATE INDEX)
    ↓
No migration file generated (push mode, not migrate mode)
```

### For Index Changes

1. **Edit `src/db/schema.ts`** — add `index()` or `uniqueIndex()` to table definitions
2. **Run `npm run db:push`** — Drizzle detects new indexes and creates them
3. **Optional: `npm run db:generate`** — generates SQL migration file in `./drizzle/` for version control

### For Schema Constraints

Same workflow. Drizzle handles `CHECK`, `NOT NULL`, `DEFAULT` changes via `db:push`.

### RLS Policies (Unchanged)

RLS policies remain in `supabase/migrations/*.sql` as hand-written SQL. Index optimization does NOT affect RLS.

## Component Boundaries After Changes

```
src/db/schema.ts (single source of truth for all tables, indexes, constraints)
    ├── pgTable() definitions with index() callbacks
    ├── relations() definitions (unchanged)
    ├── Zod schemas (unchanged)
    └── TypeScript types (unchanged)

src/db/index.ts (connection pool — unchanged)
    ├── postgres.js pool (unchanged)
    ├── withRetry() utility (unchanged)
    └── health checks (unchanged)

src/server/jobs/* (modified — batch queries, pagination-aware)
    ├── processQueue.ts — batch-load messages + orgs
    ├── processOutreachSequences.ts — selective column loading
    └── Other jobs — unchanged

src/server/routes/outreach/* (modified — add pagination)
    ├── campaigns.ts — paginated list endpoint
    ├── leads.ts — paginated list endpoint
    └── email-accounts.ts — paginated list endpoint

supabase/migrations/013_add_performance_indexes.sql (deprecated)
    └── Keep for reference, schema.ts is now source of truth
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Adding Indexes Everywhere

**What people do:** Index every column "just in case"
**Why it's wrong:** Each index slows INSERT/UPDATE (must maintain index). For a write-heavy email platform, over-indexing hurts throughput.
**Do this instead:** Index only columns used in WHERE, JOIN, ORDER BY. Prioritize hot-path queries (jobs, tracking).

### Anti-Pattern 2: Parallel Schema Definitions

**What people do:** Keep `013_add_performance_indexes.sql` AND add indexes to schema.ts
**Why it's wrong:** Two sources of truth — drift. `db:generate` may create conflicting migrations.
**Do this instead:** Migrate all indexes into schema.ts. Keep `013_*.sql` as historical record but don't modify it.

### Anti-Pattern 3: N+1 Queries in Loops

**What people do:** Load related records one-by-one inside a for loop
**Why it's wrong:** 50 deliveries x 3 queries = 150 DB round-trips per minute
**Do this instead:** Batch-load related records with `inArray()` before the loop, use Map for lookups.

### Anti-Pattern 4: Loading All Rows for Lists

**What people do:** `findMany({ where: eq(orgId) })` with no limit
**Why it's wrong:** Works at 100 rows, fails at 100K. Memory exhaustion, slow response.
**Do this instead:** Always paginate. Default pageSize=25, max=100.

## Build Order: Dependencies

### Phase Structure Recommendation

```
Phase 1: Index Foundation (schema.ts)
  ├── Import `index` from 'drizzle-orm/pg-core' (already imported uniqueIndex)
  ├── Add indexes to ALL tables for FK columns (Tier 3 from above)
  ├── Add composite indexes for job hot paths (Tier 1: campaignLeads, deliveries, messages)
  ├── Run `npm run db:push` to apply
  └── Verify with EXPLAIN ANALYZE on key queries

Phase 2: Partial Indexes (schema.ts)
  ├── Add partial indexes for status filters (active campaigns, pending deliveries)
  ├── Add partial indexes for boolean flags (active webhooks, active email accounts)
  ├── Run `npm run db:push`
  └── Verify index usage with pg_stat_user_indexes

Phase 3: Query Layer — Pagination (route handlers)
  ├── Add pagination to GET /api/outreach/campaigns
  ├── Add pagination to GET /api/outreach/leads
  ├── Add pagination to GET /api/outreach/email-accounts
  └── Each route: add limit/offset, return pagination metadata

Phase 4: Query Layer — N+1 Fixes (jobs)
  ├── Fix processQueue.ts — batch-load messages + orgs
  ├── Fix processOutreachSequences.ts — selective column loading
  └── Other jobs (processReplies, processBounces) — verify, fix if N+1

Phase 5: Schema Constraints (schema.ts)
  ├── Add CHECK constraints for positive/non-negative integers
  └── Run `npm run db:push`

Phase 6: Verification & Cleanup
  ├── Run EXPLAIN ANALYZE on all job queries
  ├── Check pg_stat_user_indexes for index usage
  ├── Compare query times before/after
  └── Deprecate supabase/migrations/013_add_performance_indexes.sql
```

**Dependency order matters because:**
- Indexes (Phase 1-2) must exist BEFORE query changes (Phase 3-4) take advantage of them
- Query changes before indexes = same slow queries, different code
- Schema constraints (Phase 5) are independent but should come after index/query work to avoid merge conflicts in schema.ts

## Sources

- Drizzle ORM indexes & constraints: https://orm.drizzle.team/docs/indexes-constraints (verified 2026-03-31)
- Drizzle ORM raw SQL & goodies: https://orm.drizzle.team/docs/goodies (verified 2026-03-31)
- Current schema: `src/db/schema.ts` (1263 lines, 30+ tables, 12 unique indexes)
- Existing manual indexes: `supabase/migrations/013_add_performance_indexes.sql` (35 indexes, 7 commented out)
- Query patterns: `src/server/jobs/processQueue.ts`, `src/server/jobs/processOutreachSequences.ts`
- Route patterns: `src/server/routes/outreach/campaigns.ts`, `src/server/routes/outreach/leads.ts`
- Connection config: `src/db/index.ts` (postgres.js pool, Supavisor transaction mode)
- Migration config: `drizzle.config.ts` (push mode, pg driver, DIRECT_URL)

---

*Architecture research for database health improvements*
*Researched: 2026-03-31*
