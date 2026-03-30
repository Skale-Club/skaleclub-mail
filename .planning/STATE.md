# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** A user can create a campaign, build a sequence, add leads, and have emails actually sent and tracked — with replies and bounces correctly detected and handled.
**Current focus:** Ready to plan Phase 1 (Sending Correctness)

## Current Position

Phase: 1 of 4 (Sending Correctness)
Plan: 1 of ? in current phase
Status: In progress
Last activity: 2026-03-30 — Completed plan 01-01 (daily reset + idempotency guard)

Progress: [█░░░░░░░░░] 10%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- No plans completed yet

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **DO NOT consolidate `calculateNextScheduledAt`** — the job's version enforces campaign send windows; the shared module's version ignores them. Keep the job's local copy. Defer reconciliation to v2 (ADV-01).
- **A/B variant must use deterministic hash** — `hash(leadId + stepId)`, not `Math.random()`. Retries must produce the same variant without stored state.
- **`sendOutreachEmail` + `recordOutreachEmail` must be called as a pair** — `sendOutreachEmail` does not insert the `outreachEmails` record; omitting `recordOutreachEmail` silently breaks tracking and reply/bounce matching.
- **`processBounces.ts` is the reference implementation** — use its `connect → getMailboxLock → search → fetch → lock.release → logout` pattern for the imapflow migration in Phase 2.
- **Idempotency guard fires at code level before SMTP** — code-level `findFirst` check on `(campaignLeadId, sequenceStepId)` gives clean log output; DB-level `uniqueIndex` is the backstop. Both must remain in place.
- **`resetDailyLimits` needs no lastSentAt reset** — only `currentDailySent` resets at midnight; `lastSentAt` tracks history and must not be cleared.

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3 is blocked on Phase 1 completion — do not wire the UI to a job that still has Outlook and A/B bugs.
- `canSendFromAccount` reads the daily counter as fetched at job start; within a single job run, multiple leads sharing one account may collectively exceed the limit. Low-priority; can be addressed in Phase 1 with an in-memory counter keyed by `accountId`.

## Session Continuity

Last session: 2026-03-30
Stopped at: Completed 01-01-PLAN.md (resetDailyLimits + idempotency guard)
Resume file: None
