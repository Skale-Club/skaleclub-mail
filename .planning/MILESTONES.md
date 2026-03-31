# Milestones

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

**Phases:** TBD (requirements being defined)

---
