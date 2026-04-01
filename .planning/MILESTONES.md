# Milestones

## v1.1 v1.1 (Shipped: 2026-04-01)

**Phases completed:** 5 phases, 11 plans, 22 tasks

**Key accomplishments:**

- Migration 016 drops 11 dead server-scoped RLS policies and rewrites all policies to use organizationId with is_org_member/is_org_admin helpers, plus a static analysis verification script
- One-liner:
- One-liner:
- Shared paginate() utility with Zod-validated query params applied to 4 list endpoints — campaigns, sequences, lead lists, email accounts — returning consistent `{ <resource>: [...], pagination: { page, limit, total, totalPages } }` responses.
- Commit:
- Commit:
- Commit:
- Batch N+1 query fixes in cascade.ts, messages.ts POST, and processHeld.ts using inArray and bulk inserts

---

## v1.0 — Outreach System Completion

**Status:** Complete
**Date:** 2026-03-30 → 2026-03-31
**Goal:** Fill implementation gaps and fix errors so the outreach system works end-to-end.

**Phases:**

1. sending-correctness — Outlook support, A/B variant, idempotency, daily limits
2. sequence-builder-ui — NewSequencePage API connection, field names, campaign selection
3. code-quality — Duplicate consolidation, imapflow migration, TypeScript errors
4. code-quality — Cron concurrency guard

**Shipped:** Campaign CRUD, sequence/step management, lead import, send window enforcement, open/click tracking, reply/bounce detection, suppression list, Outlook OAuth sending, A/B testing support.

---

## v1.1 — Database Health

**Status:** Defining requirements
**Date:** 2026-03-31 →
**Goal:** Make every page load fast and make the database layer robust enough that changes don't break things.

**Phases:**

5. RLS & Migration Safety — Fix broken RLS policies, establish safe index migration workflow
6. Index Foundation — Add all FK and composite indexes to schema.ts
7. Pagination — Paginated responses on all list endpoints
8. Query Optimization — N+1 fixes, column filtering, scoped queries
9. Schema Hardening — CHECK constraints, deprecate old migration file

---
