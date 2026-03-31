# Technology Stack — Database Performance & Reliability

**Project:** SkaleClub Mail — Database Health Improvements
**Researched:** 2026-03-31
**Focus:** Index strategies, query optimization, connection pooling, pagination

---

## Executive Summary

This research identifies stack additions needed to improve database performance and reliability for the existing email platform. The current stack uses Drizzle ORM 0.30.4 with PostgreSQL via Supabase (Supavisor pooler). Key issues identified: no indexes beyond primary keys, N+1 query patterns, pages loading all rows without pagination.

**Recommendation:** Add targeted indexes via Drizzle, implement prepared statements for hot paths, add cursor-based pagination, leverage existing Supavisor pooler with optimized configuration. No external libraries needed — Drizzle and Supabase provide all required capabilities.

---

## Current Stack (Validated)

| Technology | Version | Purpose |
|------------|---------|---------|
| drizzle-orm | 0.30.4 | Database ORM |
| postgres | 3.4.3 | Raw PostgreSQL driver |
| Supabase | Cloud | PostgreSQL hosting |
| Supavisor | (pooler) | Connection pooling (port 6543) |

**Existing pool configuration:**
- Max 20 connections
- 10s idle timeout
- 30s connect timeout
- 30min max lifetime

---

## Recommended Additions

### 1. Database Indexes (Drizzle ORM)

**Why needed:** Current schema has no indexes beyond primary keys and unique constraints. Every query performs full table scans.

**Implementation:** Add via Drizzle's `index()` in schema:

```typescript
// Example: Indexes for outreach tables
import { index } from 'drizzle-orm/pg-core'

// messages table - common query patterns
export const messages = pgTable('messages', { ... }, (table) => ({
  orgStatusIdx: index('messages_org_status_idx')
    .on(table.organizationId, table.status),
  createdAtIdx: index('messages_created_at_idx')
    .on(table.createdAt),
}))

// campaign_leads - for sequence processing
export const campaignLeads = pgTable('campaign_leads', { ... }, (table) => ({
  nextScheduledIdx: index('campaign_leads_next_scheduled_idx')
    .on(table.nextScheduledAt, table.status),
  campaignLeadIdx: index('campaign_leads_campaign_lead_idx')
    .on(table.campaignId, table.leadId),
}))

// outreach_emails - for tracking queries
export const outreachEmails = pgTable('outreach_emails', { ... }, (table) => ({
  campaignLeadIdx: index('outreach_emails_campaign_lead_idx')
    .on(table.campaignLeadId, table.sequenceStepId),
  sentAtIdx: index('outreach_emails_sent_at_idx')
    .on(table.sentAt),
}))
```

**Priority indexes for outreach module:**

| Table | Index Columns | Query Pattern |
|-------|---------------|---------------|
| `campaign_leads` | `(nextScheduledAt, status)` | Cron job finding leads to process |
| `campaign_leads` | `(campaignId, status)` | Campaign progress queries |
| `outreach_emails` | `(campaignLeadId, sentAt)` | Email history for lead |
| `leads` | `(organizationId, status)` | Lead filtering |
| `leads` | `(leadListId)` | Lead list membership |
| `messages` | `(organizationId, status, createdAt)` | Message filtering |
| `deliveries` | `(messageId, status)` | Delivery status lookups |
| `suppressions` | `(organizationId, emailAddress)` | Check before send |

**Confidence:** HIGH — Drizzle index API is well-documented and stable.

---

### 2. Prepared Statements (Drizzle ORM)

**Why needed:** Eliminates query parsing overhead on repeated queries. Drizzle is a thin TypeScript layer; prepared statements provide significant performance gains for frequently-executed queries.

**Implementation:**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq } from 'drizzle-orm'

const db = drizzle(client)

// Prepared statement for hot path - checking suppressions
const checkSuppression = db
  .select()
  .from(suppressions)
  .where(eq(suppressions.organizationId, sql.placeholder('orgId')))
  .prepare('check_suppression')

// Usage in send path
await checkSuppression.execute({ orgId: orgId })
```

**Apply to:**
- Suppression list checks (before every send)
- Organization lookups (frequent auth checks)
- Campaign lead status queries (cron jobs)
- Email account daily limit checks

**Confidence:** HIGH — Prepared statements are core Drizzle feature, documented at orm.drizzle.team/docs/perf-queries.

---

### 3. Pagination — Cursor-Based

**Why needed:** Current code loads all rows without pagination. For tables like `leads`, `messages`, `outreach_emails`, this becomes unsustainable.

**Implementation:** Use Drizzle's cursor-based pagination:

```typescript
// Cursor-based pagination for leads
const PAGE_SIZE = 50

async function getLeadsPage(orgId: string, cursor?: string) {
  const leads = await db
    .select()
    .from(leads)
    .where(eq(leads.organizationId, orgId))
    .orderBy(leads.id) // Must have deterministic order
    .limit(PAGE_SIZE + 1) // Fetch one extra to determine hasMore
  
  const hasMore = leads.length > PAGE_SIZE
  const items = hasMore ? leads.slice(0, -1) : leads
  const nextCursor = hasMore ? items[items.length - 1].id : null
  
  return { items, nextCursor }
}
```

**Alternative — Limit/Offset for simple cases:**

```typescript
// For admin pages with known page counts
const getPaginatedMessages = db
  .select()
  .from(messages)
  .where(eq(messages.organizationId, sql.placeholder('orgId')))
  .orderBy(messages.createdAt)
  .limit(sql.placeholder('limit'))
  .offset(sql.placeholder('offset'))
  .prepare('paginated_messages')
```

**When to use each:**
- **Cursor-based:** Large datasets, infinite scroll (leads list, message history)
- **Limit/Offset:** Known page counts, admin dashboards with page numbers

**Confidence:** HIGH — Drizzle supports both patterns natively.

---

### 4. Connection Pool Optimization

**Why needed:** Existing config uses defaults. Supavisor is already in use (port 6543), but pool settings can be tuned.

**Current state (from STACK.md):**
- Max 20 connections
- 10s idle timeout
- 30s connect timeout
- 30min max lifetime

**Recommended adjustments:**

```bash
# Environment variables (already supported)
DB_POOL_MAX=25           # Increase slightly for more headroom
DB_IDLE_TIMEOUT_SECONDS=5  # Faster cleanup of idle connections
DB_MAX_LIFETIME_SECONDS=600 # 10 minutes - refresh connections more often
```

**Why these values:**
- 25 connections: More headroom without overwhelming Supabase limits
- 5s idle: Faster reclaim for serverless/short-lived connections
- 600s lifetime: Prevents stale connections while avoiding frequent reconnects

**Supabase-specific:** Supavisor transaction mode (already configured) is correct for serverless. No additional pooler needed.

**Confidence:** HIGH — Supavisor is Supabase's recommended solution, configuration via env vars is standard.

---

### 5. Query Caching — In-Memory

**Why needed:** Some data changes rarely (organization settings, branding) but is queried frequently.

**Current state:** Already has in-memory cache for branding (`src/server/lib/serverBranding.ts`)

**Expand pattern for stable data:**

```typescript
// Simple in-memory cache with TTL
class QueryCache<T> {
  private cache = new Map<string, { data: T; expires: number }>()
  
  async getOrSet(key: string, fn: () => Promise<T>, ttlMs: number = 60000) {
    const cached = this.cache.get(key)
    if (cached && cached.expires > Date.now()) {
      return cached.data
    }
    
    const data = await fn()
    this.cache.set(key, { data, expires: Date.now() + ttlMs })
    return data
  }
  
  invalidate(key: string) {
    this.cache.delete(key)
  }
}

// Usage for rarely-changing org data
const orgCache = new QueryCache<Organization>()

async function getOrganization(id: string) {
  return orgCache.getOrSet(
    `org:${id}`,
    () => db.select().from(organizations).where(eq(organizations.id, id)).get(),
    300000 // 5 minutes TTL
  )
}
```

**Apply to:**
- Organization settings (changes rarely)
- Domain configurations (changes rarely)
- Email account configs (changes rarely)

**Confidence:** MEDIUM — In-memory cache is simple but has limitations (not shared across instances). For single-instance deployments, sufficient. For horizontal scaling, would need Redis (out of scope for personal project).

---

### 6. N+1 Query Prevention

**Why needed:** Current codebase has N+1 patterns. Each related entity fetched separately.

**Implementation:** Use Drizzle's `withRelations` or eager loading:

```typescript
// Instead of N+1:
const campaigns = await db.select().from(campaigns).get()
for (const campaign of campaigns) {
  const leads = await db.select().from(campaignLeads)
    .where(eq(campaignLeads.campaignId, campaign.id)).all() // N+1!
}

// Use relations:
const campaignsWithLeads = await db
  .select()
  .from(campaigns)
  .leftJoin(campaignLeads, eq(campaigns.id, campaignLeads.campaignId))
  .all()

// Or use Drizzle relations API:
const campaignsWithLeads = await db
  .select()
  .from(campaigns)
  .innerJoin(campaignsRelations.campaignLeads, ...) // Check exact syntax
```

**Alternative — Batch queries:**

```typescript
// Batch load related entities
async function getCampaignsWithStats(orgId: string) {
  const campaignsList = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.organizationId, orgId))
    .all()
  
  // Single query for all leads
  const campaignIds = campaignsList.map(c => c.id)
  const allLeads = await db
    .select()
    .from(campaignLeads)
    .where(sql`${campaignLeads.campaignId} in ${campaignIds}`)
    .all()
  
  // Group in memory
  const leadsByCampaign = new Map(allLeads.map(l => [l.campaignId, l]))
  
  return campaignsList.map(c => ({
    ...c,
    leads: leadsByCampaign.get(c.id) || []
  }))
}
```

**Confidence:** HIGH — Drizzle relations are well-documented, batch queries are standard SQL.

---

## What NOT to Add

| Library/Tool | Why Not |
|--------------|---------|
| Redis | Overkill for personal project; in-memory cache sufficient |
| PgBouncer | Supavisor already handles pooling; redundant |
| Prisma | Would require full rewrite; Drizzle is adequate |
| Query builder (knex) | Drizzle provides equivalent functionality |
| External caching service | Adds cost/complexity without benefit for current scale |

---

## Migration Strategy

1. **Phase 1:** Add indexes via Drizzle migrations
   ```bash
   npm run db:generate
   npm run db:push
   ```

2. **Phase 2:** Implement prepared statements for hot paths (suppression checks, org lookups)

3. **Phase 3:** Add pagination to list endpoints (leads, messages, campaigns)

4. **Phase 4:** Optimize connection pool settings via environment variables

---

## Sources

- **Drizzle Performance:** orm.drizzle.team/docs/perf-queries (prepared statements, placeholders)
- **Drizzle Indexes:** orm.drizzle.team/docs/indexes-constraints (index API)
- **Drizzle Pagination:** orm.drizzle.team/docs/guides/cursor-based-pagination, orm.drizzle.team/docs/guides/limit-offset-pagination
- **Supabase Connection:** supabase.com/docs/guides/database/connection-management
- **Supavisor:** supabase.com/docs/guides/database/supavisor

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Indexes | HIGH | Drizzle index API is stable, well-documented |
| Prepared Statements | HIGH | Core Drizzle feature, documented |
| Pagination | HIGH | Both cursor and offset patterns supported |
| Connection Pool | HIGH | Supavisor is Supabase standard, env vars already in use |
| Query Caching | MEDIUM | In-memory sufficient for current scale |
| N+1 Prevention | HIGH | Drizzle relations API is mature |

---

## Gaps to Address

- **Query analysis:** Need to run EXPLAIN on actual queries to verify index effectiveness
- **RLS performance:** Row Level Security policies may need indexes for complex org-scoped queries
- **Monitoring:** No query performance monitoring configured — consider Supabase dashboard for slow queries