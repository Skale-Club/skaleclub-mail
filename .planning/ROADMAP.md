# Roadmap: SkaleClub Mail — Database Health (v1.1)

**Milestone:** v1.1 — Database Health
**Created:** 2026-03-31
**Granularity:** coarse
**Requirements:** 19 v1 requirements
**Phases:** 5 (continuing from v1.0 phase 04)

---

## Phases

- [ ] **Phase 05: RLS & Migration Safety** — Fix broken RLS policies and establish safe index migration workflow
- [ ] **Phase 06: Index Foundation** — Add all FK and composite indexes to schema.ts, apply via CONCURRENTLY
- [ ] **Phase 07: Pagination** — Add paginated responses to all list endpoints
- [ ] **Phase 08: Query Optimization** — Fix N+1 patterns, add column filtering, scope unbounded queries
- [ ] **Phase 09: Schema Hardening** — Add CHECK constraints, deprecate old migration file

---

## Phase Details

### Phase 05: RLS & Migration Safety
**Goal:** Data isolation between organizations is verified and index migrations can be applied safely without blocking writes
**Depends on:** Nothing (prerequisite for all other phases)
**Requirements:** DBS-01, DBS-02, DBS-03
**Success Criteria** (what must be TRUE):
  1. RLS policies no longer reference the removed `servers` table — verified by inspecting the migration SQL
  2. A user in one organization cannot read or modify another organization's data — verified by testing with two org accounts
  3. `npm run db:indexes` script executes `sql/indexes.sql` containing `CREATE INDEX CONCURRENTLY` statements
  4. Invalid indexes (where `indisvalid = false`) are automatically detected, dropped, and retried by the verification script
**Plans:** TBD

### Phase 06: Index Foundation
**Goal:** All foreign key and composite query columns are indexed so that no query performs a full sequential scan
**Depends on:** Phase 05
**Requirements:** IDX-01, IDX-02, IDX-03, IDX-04, IDX-05, IDX-06
**Success Criteria** (what must be TRUE):
  1. Every FK column (`organizationId`, `campaignId`, `serverId`, `domainId`, `credentialId`, `routeId`, `webhookId`, `leadListId`) has an index across all org-scoped tables
  2. Dashboard stats query (`messages WHERE organizationId = ? AND status = ?`) returns in under 100ms with EXPLAIN ANALYZE showing index usage
  3. Campaign lead status counts (`campaignLeads WHERE campaignId = ? AND status = ?`) return in under 100ms
  4. Send pipeline cron query filters on `nextScheduledAt` without scanning all leads — verified with EXPLAIN ANALYZE
  5. Open/click tracking lookup by `messages.token` returns in under 10ms
  6. All index definitions exist in `src/db/schema.ts` using Drizzle `index()` API — `013_add_performance_indexes.sql` is superseded
**Plans:** TBD

### Phase 07: Pagination
**Goal:** All list endpoints return paginated results so that page loads don't degrade as data grows
**Depends on:** Phase 06
**Requirements:** PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05
**Success Criteria** (what must be TRUE):
  1. `GET /api/outreach/campaigns` returns `{ items, pagination: { page, pageSize, total } }` instead of all rows
  2. `GET /api/outreach/leads` returns paginated results
  3. `GET /api/outreach/lead-lists` returns paginated results
  4. `GET /api/email-accounts` returns paginated results
  5. `GET /api/outreach/sequences` returns paginated results
  6. List endpoints accept `?page=1&pageSize=25` query parameters and return correct `total` count
**Plans:** TBD

### Phase 08: Query Optimization
**Goal:** Background jobs and list endpoints load data efficiently with no N+1 patterns and no oversized payloads
**Depends on:** Phase 06, Phase 07
**Requirements:** QRY-01, QRY-02, QRY-03
**Success Criteria** (what must be TRUE):
  1. `processQueue.ts` batch-loads all needed messages and organizations before the delivery loop — 2 queries instead of 3*N (verified by logging query count)
  2. List endpoints exclude `htmlBody`, `plainBody`, and other large text columns from SELECT — response payload sizes reduced (verified by comparing before/after)
  3. `processOutreachSequences` lead query includes `WHERE nextScheduledAt <= now()` and uses the index from Phase 06 — no full table scan (verified with EXPLAIN ANALYZE)
**Plans:** TBD

### Phase 09: Schema Hardening
**Goal:** Database constraints prevent invalid data and the old migration file is properly deprecated
**Depends on:** Nothing (independent, last to avoid schema.ts merge conflicts)
**Requirements:** SCH-01, SCH-02
**Success Criteria** (what must be TRUE):
  1. `campaignSteps.delayHours` rejects negative values — insert of -1 fails with constraint violation (verified by testing)
  2. `campaignSteps.order` rejects values less than 1 — insert of 0 fails with constraint violation (verified by testing)
  3. `supabase/migrations/013_add_performance_indexes.sql` has a deprecation comment header explaining that indexes are now managed via Drizzle schema.ts
**Plans:** TBD

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 05. RLS & Migration Safety | 0/0 | Not started | — |
| 06. Index Foundation | 0/0 | Not started | — |
| 07. Pagination | 0/0 | Not started | — |
| 08. Query Optimization | 0/0 | Not started | — |
| 09. Schema Hardening | 0/0 | Not started | — |

---

## Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| DBS-01 | Phase 05 | Pending |
| DBS-02 | Phase 05 | Pending |
| DBS-03 | Phase 05 | Pending |
| IDX-01 | Phase 06 | Pending |
| IDX-02 | Phase 06 | Pending |
| IDX-03 | Phase 06 | Pending |
| IDX-04 | Phase 06 | Pending |
| IDX-05 | Phase 06 | Pending |
| IDX-06 | Phase 06 | Pending |
| PAGE-01 | Phase 07 | Pending |
| PAGE-02 | Phase 07 | Pending |
| PAGE-03 | Phase 07 | Pending |
| PAGE-04 | Phase 07 | Pending |
| PAGE-05 | Phase 07 | Pending |
| QRY-01 | Phase 08 | Pending |
| QRY-02 | Phase 08 | Pending |
| QRY-03 | Phase 08 | Pending |
| SCH-01 | Phase 09 | Pending |
| SCH-02 | Phase 09 | Pending |

**Coverage: 19/19 requirements mapped ✓**

---

## Dependency Chain

```
Phase 05 (RLS & Migration Safety)
    ↓
Phase 06 (Index Foundation)
    ↓
Phase 07 (Pagination) ──→ Phase 08 (Query Optimization)
                               ↑
Phase 09 (Schema Hardening) ───┘  (independent)
```

Phase 09 is independent — it can run in parallel with any other phase but is ordered last to avoid merge conflicts in schema.ts.
