# Requirements: SkaleClub Mail — Database Health

**Defined:** 2026-03-31
**Core Value:** A user can create a campaign, build a sequence, add leads, and have emails actually sent and tracked — with replies and bounces correctly detected and handled.

## v1 Requirements

### RLS & Migration Safety

- [ ] **DBS-01**: RLS policies audited and fixed — policies no longer reference removed `servers` table; data isolation verified between organizations
- [ ] **DBS-02**: Safe index migration workflow established — `sql/indexes.sql` file with `CREATE INDEX CONCURRENTLY` statements, applied via `npm run db:indexes` script (not `db:push`)
- [ ] **DBS-03**: Index health verification — script checks `indisvalid` after CONCURRENTLY creation; drops and retries invalid indexes

### Index Foundation

- [ ] **IDX-01**: All foreign key columns indexed — `organizationId`, `campaignId`, `serverId`, `domainId`, `credentialId`, `routeId`, `webhookId`, `leadListId` across all 17+ org-scoped tables
- [ ] **IDX-02**: Composite index on `messages(organizationId, status)` — dashboard stats queries return in <100ms
- [ ] **IDX-03**: Composite index on `campaignLeads(campaignId, status)` — campaign lead status counts return in <100ms
- [ ] **IDX-04**: Index on `campaignLeads.nextScheduledAt` — send pipeline cron job no longer scans all leads; filtered to pending/scheduled only
- [ ] **IDX-05**: Index on `messages.token` — open/click tracking lookups return in <10ms
- [ ] **IDX-06**: Index definitions consolidated in `src/db/schema.ts` using Drizzle `index()` API — single source of truth; old `013_add_performance_indexes.sql` deprecated

### Pagination

- [ ] **PAGE-01**: Pagination on campaigns list endpoint — `GET /api/outreach/campaigns` returns `{ items, pagination: { page, pageSize, total } }` instead of all rows
- [ ] **PAGE-02**: Pagination on leads list endpoint — `GET /api/outreach/leads` returns paginated results
- [ ] **PAGE-03**: Pagination on lead lists endpoint — `GET /api/outreach/lead-lists` returns paginated results
- [ ] **PAGE-04**: Pagination on email accounts endpoint — `GET /api/email-accounts` returns paginated results
- [ ] **PAGE-05**: Pagination on sequences endpoint — `GET /api/outreach/sequences` returns paginated results

### Query Optimization

- [ ] **QRY-01**: processQueue.ts N+1 fixed — batch-load messages and orgs before delivery loop (3*N queries → 2 queries)
- [ ] **QRY-02**: Column filtering on list endpoints — exclude `htmlBody`, `plainBody`, and other large text columns from list responses
- [ ] **QRY-03**: processOutreachSequences query scoped — lead query includes `WHERE nextScheduledAt <= now()` with index support; no full table scan

### Schema Hardening

- [ ] **SCH-01**: CHECK constraints on `campaignSteps.delayHours >= 0` and `campaignSteps.order >= 1`
- [ ] **SCH-02**: Old `013_add_performance_indexes.sql` migration marked as deprecated with comment header

## v2 Requirements

Deferred to future release.

- **CURSOR-01**: Cursor-based pagination for leads — only needed at 50K+ rows; offset pagination sufficient for now
- **CACHE-01**: Pre-computed denormalized counts — audit increment paths on `campaigns.totalLeads`, `totalOpens` before trusting them
- **LOG-01**: Slow query logging — EXPLAIN ANALYZE in dev mode for catching regressions
- **BATCH-01**: Chunked batch inserts for lead imports — only needed if bulk import starts timing out

## Out of Scope

| Feature | Reason |
|---------|--------|
| Redis caching | Overkill for single-instance deployment; in-memory sufficient |
| Full-text search | `ILIKE` with indexes handles current needs |
| Connection pooling changes | Supavisor already configured; pool size 20 is sufficient |
| Horizontal scaling | Personal project; vertical scaling sufficient |
| ORM migration (to Prisma/etc.) | Drizzle is adequate; migration cost not justified |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DBS-01 | — | Pending |
| DBS-02 | — | Pending |
| DBS-03 | — | Pending |
| IDX-01 | — | Pending |
| IDX-02 | — | Pending |
| IDX-03 | — | Pending |
| IDX-04 | — | Pending |
| IDX-05 | — | Pending |
| IDX-06 | — | Pending |
| PAGE-01 | — | Pending |
| PAGE-02 | — | Pending |
| PAGE-03 | — | Pending |
| PAGE-04 | — | Pending |
| PAGE-05 | — | Pending |
| QRY-01 | — | Pending |
| QRY-02 | — | Pending |
| QRY-03 | — | Pending |
| SCH-01 | — | Pending |
| SCH-02 | — | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 0 (roadmap pending)
- Unmapped: 19 ⚠️

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
