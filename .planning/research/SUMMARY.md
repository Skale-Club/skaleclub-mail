# Project Research Summary

**Project:** SkaleClub Mail — Outreach Module Completion
**Domain:** Cold email outreach system (sequences, reply/bounce detection, send scheduling)
**Researched:** 2026-03-30
**Confidence:** HIGH (all 4 research dimensions grounded in direct codebase inspection)

---

## Executive Summary

This is a targeted completion pass on a partially-built outreach module. The backend infrastructure — routes, schema, shared sending logic, bounce/reply jobs, and tracking — is substantially complete. The gaps are specific and well-understood: the sequence builder UI is disconnected from the API, the main send job duplicates and bypasses the shared sending module (breaking Outlook support and A/B testing), the reply detection job uses a legacy IMAP library inconsistent with the rest of the codebase, and a critical daily counter reset job is entirely absent. None of the required fixes involve architectural redesign or new dependencies.

The highest-risk items are correctness bugs, not missing features. The daily send counter never resetting means accounts permanently stop sending after day one — this silently kills all outreach. The sequence processor never routes Outlook accounts through the correct code path — Outlook sends appear to succeed but are silently dropped. A/B variants are hardcoded to 'a' regardless of configuration. And without an idempotency guard, a job interruption between SMTP send and DB write causes double-sends to leads. These four issues must be resolved as a group; fixing any one in isolation leaves the system broken in a different way.

The recommended approach is sequential: first fix the critical correctness bugs in the backend jobs (daily reset, Outlook routing, A/B variant, idempotency guard, imapflow migration), then wire up the frontend (NewSequencePage API connection and field name corrections), then clean up structural debt (code consolidation, TypeScript errors, API client standardization). This order ensures that the pipeline actually works correctly before the UI is connected to it. All fixes use existing dependencies only, consistent with the project constraint.

---

## Key Findings

### Recommended Stack

The full stack is already selected and installed; no new dependencies are permitted or needed. The key finding is that the codebase already made all the right technology choices — `imapflow` over `imap`, `outreach-sender.ts` as a shared sending module, `api-client.ts` as the capable API client — but the outreach jobs and pages partially bypass these choices, using the inferior alternatives instead.

**Core technologies relevant to this milestone:**
- `imapflow` (^1.2.16): IMAP library — the codebase standard; `processBounces.ts` is the reference pattern to follow for the `processReplies.ts` migration
- `nodemailer` (^6.9.12): SMTP sending — transporter should be cached per account within a job run rather than recreated per email; `sendOutreachEmail()` in `outreach-sender.ts` is the canonical wrapper
- `node-cron` (^4.2.1): Job scheduler — correct for single-process deployment at this scale; needs a concurrency guard (in-process flag) to prevent overlapping runs, and a new midnight job to reset daily send counters
- `imap` (^0.8.19): Legacy library — present only in `processReplies.ts`; should be removed from `package.json` after migration

**Decision already made by the codebase:** all IMAP code uses `imapflow`. The `processReplies.ts` migration is a consistency fix, not an architectural choice.

### Expected Features

The feature set required for end-to-end function is narrow and specific. Research confirmed that industry-standard cold email tools (Instantly, Apollo, Lemlist) follow the same model: a campaign is the container, sequences are children of campaigns, and sequence steps encode the cadence. The SkaleClub Mail schema correctly reflects this model; the UI does not currently enforce it.

**Must have (table stakes — system does not function without these):**
- Daily send counter reset at midnight — without this, accounts stop sending permanently after day one
- Sequence save connected to API — currently `console.log` only; the entire UI flow is broken
- `campaignId` captured in sequence builder — the FK is NOT NULL; sequence creation without it will fail at the DB layer
- Correct field names in sequence builder — `delayDays` must become `delayHours`; `bodyHtml` must become `htmlBody`
- Outlook account routing in sequence processor — the job only uses SMTP; Outlook accounts are silently non-functional
- A/B variant selection in sequence processor — currently hardcoded to variant 'a'; all A/B configuration is ignored

**Should have (correctness improvements that reduce silent failure):**
- Idempotency guard for double-send prevention — pre-send status flag or unique constraint on `(campaignLeadId, sequenceStepId)`
- `processReplies` migrated to `imapflow` — consistency; eliminates async error-swallowing from the Promise-wrapping anti-pattern
- Messages marked `\Seen` after reply detection — prevents reprocessing on next cron tick
- Concurrency guard on cron jobs — prevents overlapping runs if a job exceeds its interval

**Defer to v2+:**
- Email warm-up automation (schema fields exist; logic deferred per PROJECT.md)
- Rich text / WYSIWYG editor in sequence builder
- Drag-and-drop step reordering
- DSN MIME part parsing for bounce detection (text heuristics are adequate for this pass)
- Outlook reply detection via Graph API
- Timezone-aware `calculateNextScheduledAt` (timezone field accepted in schema but unused)

### Architecture Approach

The existing architecture is correct: a shared module (`outreach-sender.ts`) owns all send mechanics, and jobs own orchestration. The problem is that `processOutreachSequences.ts` bypasses the shared module entirely by duplicating three of its functions — and the duplicates are weaker (no Outlook support, no A/B, no status check). The fix is to delete the job's private implementations and import from the shared module. `processBounces.ts` is the exemplary job in this codebase — it uses `imapflow` correctly, calls shared helpers, and follows the established error-handling pattern. Both `processOutreachSequences.ts` and `processReplies.ts` should be brought to the standard set by `processBounces.ts`.

**Major components and their post-fix responsibilities:**

1. `outreach-sender.ts` (shared module) — owns: SMTP vs Outlook routing, tracking injection, template interpolation, stat increments, `canSendFromAccount` check, `isWithinSendWindow` check, `recordOutreachEmail`
2. `processOutreachSequences.ts` (job, orchestration only) — owns: fetching pending leads, applying eligibility filters, calling `sendOutreachEmail`, advancing lead state; must not duplicate any logic from the shared module
3. `processReplies.ts` (job, after imapflow migration) — owns: per-account IMAP polling with `imapflow`, header extraction, `findOutreachEmailByMessageId` lookup, `markAsReplied`
4. `processBounces.ts` (job, reference implementation) — already correct; the pattern to copy for the imapflow migration
5. `NewSequencePage.tsx` (UI) — must connect to `POST /api/outreach/campaigns/:id/sequences` + step creation loop; campaignId from route param
6. `lib/api-client.ts` — the single API client for all outreach pages; `lib/api.ts` is not to be used in new outreach code

**Critical architectural constraint:** `sendOutreachEmail()` does not insert the `outreachEmails` record — that is done by `recordOutreachEmail()` separately. When switching the job to use `sendOutreachEmail`, both calls must be made as a pair or emails are sent but never logged.

**Critical architectural constraint:** The shared module's `calculateNextScheduledAt` ignores campaign send window parameters. The job's local version is more correct (it pushes out-of-window times to the next window start). This must be resolved before removing the local copy — either extend the shared module's signature or keep the local version as-is.

### Critical Pitfalls

1. **Daily counter never resets** — `emailAccounts.currentDailySent` increments on every send but no job resets it at midnight. Accounts stop sending after day one and never recover. Fix: add `cron.schedule('0 0 * * *', ...)` resetting `current_daily_sent = 0` on all accounts. This is a blocking bug for any non-test usage.

2. **Double-send on job retry** — no "in-flight" marker before sending means a job interrupted between SMTP send and DB write sends the same email twice on retry. The pending query re-selects the lead because `nextScheduledAt` was not yet advanced. Fix: set a processing status or clear `nextScheduledAt` before sending, checking that the UPDATE affected exactly 1 row (claim-then-process pattern).

3. **A/B variant determinism gap** — if `Math.random()` is used for A/B selection and the job is retried after a failed DB write, the retry may assign a different variant. The lead ends up counted in both variants, corrupting A/B results. Fix: use a deterministic hash of `leadId + stepId` so retries always produce the same variant without requiring stored state.

4. **`sendOutreachEmail` + `recordOutreachEmail` must be called as a pair** — `sendOutreachEmail()` sends the email but does not record it. Calling only `sendOutreachEmail` during consolidation causes emails to be delivered to leads but never logged in `outreachEmails`, breaking tracking, reply matching, and bounce matching.

5. **`calculateNextScheduledAt` signature mismatch** — the shared module's version takes only a `step` object and ignores campaign window/timezone. The job's local version takes five parameters and correctly enforces the send window. Swapping to the shared module version without reconciling this causes next-step scheduling to ignore send windows, sending emails at any time of day.

---

## Implications for Roadmap

The feature dependency graph is linear, not parallel: the backend must be correct before the UI is wired up, and the correctness fixes within the backend have their own internal ordering. However, the TypeScript cleanup and API client standardization are genuinely independent and can be done in parallel with the backend fixes.

### Phase 1: Critical Backend Correctness

**Rationale:** These are blocking bugs. The system cannot function correctly without them, and they are prerequisite to everything else. The daily counter reset is the most critical single fix in the entire milestone — without it, any testing or validation of the rest of the system is impossible beyond day one.
**Delivers:** A backend that correctly executes campaigns end-to-end without silent data corruption
**Addresses:** Daily send counter reset, Outlook routing, A/B variant selection, idempotency guard, `sendOutreachEmail` + `recordOutreachEmail` pair
**Avoids:** Pitfalls 1 (double-send), 2 (A/B variant on retry), Pitfall 3 (`calculateNextScheduledAt` mismatch when consolidating)
**Work items:**
- Add midnight cron to reset `current_daily_sent = 0` on all email accounts
- Switch `processOutreachSequences.ts` to import `isWithinSendWindow`, `canSendFromAccount` from `outreach-sender.ts`; delete local duplicates
- Switch job to call `sendOutreachEmail()` (handles Outlook + SMTP) + `recordOutreachEmail()`; keep or extend `calculateNextScheduledAt` to preserve campaign window enforcement
- Implement A/B variant selection using deterministic hash of `leadId + stepId`
- Add pre-send idempotency check: query `outreachEmails` for existing `(campaignLeadId, sequenceStepId)` row before sending, or set processing status before SMTP call

**Research flag:** Standard patterns — no research phase needed. All patterns are directly derived from existing code in this repo.

### Phase 2: IMAP Library Migration

**Rationale:** `processReplies.ts` must be migrated to `imapflow` to eliminate the async error-swallowing anti-pattern (Promise-wrapping a callback library) and align with the codebase standard. This is its own phase because it requires a careful mechanical migration with behavioral differences to account for, and it is not blocked by or blocking Phase 1.
**Delivers:** Reply detection that correctly processes UNSEEN messages using the same library and error model as `processBounces.ts`
**Addresses:** Reply detection correctness, consistent IMAP library usage
**Avoids:** Pitfall 3 (UID vs sequence number confusion), Pitfall 4 (mailbox lock not released on error), Pitfall 8 (fragile `In-Reply-To` header parsing)
**Work items:**
- Replace `import Imap from 'imap'` with `import { ImapFlow } from 'imapflow'`
- Rewrite `processAccountInbox` using the `processBounces.ts` pattern: `connect → getMailboxLock → search({ seen: false }) → fetch headers only → messageFlagsAdd(Seen) → lock.release() → logout`
- Replace regex-based `In-Reply-To` parsing with `mailparser`'s `simpleParser` for robust folded-header handling
- Fix `extractFirstReference` to match against any reference in the chain (not just `refs[0]`)
- Delete `connectImap` export (dead code after migration); remove `imap` and `@types/imap` from `package.json`

**Research flag:** Standard patterns — `processBounces.ts` is the complete reference. No research phase needed.

### Phase 3: Sequence Builder UI Connection

**Rationale:** The UI can only be meaningfully connected after the backend is confirmed correct. Wiring a broken backend to the UI makes bugs harder to isolate. This phase completes the user-visible end-to-end flow.
**Delivers:** Users can create a sequence with steps through the UI and have it saved to the database and executed by the job
**Addresses:** `NewSequencePage` API connection, field name corrections, campaign association
**Avoids:** Pitfall 6 (Express 5 `mergeParams` if adding nested routes)
**Work items:**
- Route `NewSequencePage` to `/outreach/campaigns/:id/sequences/new`; extract `campaignId` from route param using wouter's `useParams`
- Replace `handleSave`'s `console.log` with: `POST /api/outreach/campaigns/:id/sequences` then loop `POST /api/outreach/campaigns/:id/sequences/:seqId/steps` for each step
- Fix field name mappings: `step.delayDays` → `step.delayHours` (decide: display "days" and multiply by 24, or rename to hours throughout); `step.bodyHtml` → `step.htmlBody`
- Switch `NewInboxPage` import from `lib/api` to `lib/api-client`

**Research flag:** Standard patterns — the API contracts are confirmed. No research phase needed.

### Phase 4: TypeScript Cleanup and Structural Debt

**Rationale:** This phase can start in parallel with Phase 1 (it is fully independent) but is lower priority than correctness fixes. TypeScript errors and unused imports do not affect runtime behavior but block `tsc --noEmit` from being clean, which undermines future refactoring confidence.
**Delivers:** Clean TypeScript compilation, consistent API client usage across all outreach pages
**Addresses:** Unused imports in `NewSequencePage.tsx`, `SequencesPage.tsx`, and other outreach files; `api.ts` vs `api-client.ts` inconsistency
**Work items:**
- Run `npx tsc --noEmit 2>&1 | grep "TS6133\|is declared but"` to identify all offending symbols
- Manually remove unused named imports file by file (no ESLint auto-fix available without a config)
- Add concurrency guards (in-process flags) to cron job registrations in `jobs/index.ts`
- Standardize all outreach pages to import from `lib/api-client`; update catch blocks from `ApiError` to `ApiClientError` where type-checked

**Research flag:** Standard patterns — no research phase needed.

### Phase Ordering Rationale

- Phase 1 before Phase 3: the backend must be correct before the UI calls it; connecting a UI to a job that silently drops Outlook sends or never recovers from the daily limit would make validation impossible
- Phase 2 can overlap with Phase 1: the imapflow migration in `processReplies.ts` does not touch any code modified in Phase 1; the two jobs are independent
- Phase 4 can start immediately in parallel: TypeScript cleanup touches only import lines, not logic; it does not interfere with any other phase
- Phase 3 is last because it depends on both Phase 1 (backend correctness) and Phase 4 (clean TypeScript is easier before adding new UI logic)

### Research Flags

Phases with standard patterns — no additional research needed:
- **Phase 1:** All patterns derived from existing code in `processBounces.ts` and `outreach-sender.ts`; no unknowns
- **Phase 2:** `processBounces.ts` is a complete reference implementation for `imapflow` in this codebase
- **Phase 3:** API contracts confirmed from `campaigns.ts` route file; schema confirmed from `schema.ts`
- **Phase 4:** Manual TypeScript cleanup; no architectural decisions

**One open question requiring a decision before Phase 1 work starts:**

`calculateNextScheduledAt` exists in both the job and the shared module with incompatible signatures. The job's version is more correct (enforces campaign send window). Three options:
  1. Keep the job's local `calculateNextScheduledAt` and do not consolidate it (simplest; partial consolidation)
  2. Extend the shared module's `calculateNextScheduledAt` to accept campaign window parameters, then consolidate
  3. Keep the job's version during this fix pass; file a follow-up to align the shared module

**Recommendation: option 3.** Refactoring `calculateNextScheduledAt` in the shared module during a correctness fix pass introduces risk. The behavior is currently correct in the job; leave it there and consolidate only the functions that are clearly deficient (the ones missing Outlook support and A/B logic).

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings from direct `package.json` and source file inspection; no web sources needed |
| Features | HIGH | Primary sources are the actual schema, API routes, and job code; industry patterns (Instantly/Apollo/Lemlist) are MEDIUM but not load-bearing for decisions |
| Architecture | HIGH | All architectural findings from direct code inspection of the 6 key files; no external sources consulted |
| Pitfalls | HIGH | All pitfalls derived from static analysis of the actual code; verified against `schema.ts` for constraint gaps |

**Overall confidence:** HIGH

The unusually high overall confidence is because this is a completion pass on existing code, not greenfield research. Every finding can be verified by reading a specific file at a specific line number. There are no unknowns that require external validation.

### Gaps to Address

- **`calculateNextScheduledAt` reconciliation** — the open question above; needs a decision before Phase 1 begins. It is the only meaningful design choice left unresolved by research. See Phase Ordering Rationale above for the recommendation.

- **Soft vs hard bounce type persistence** — `processBounces.ts` computes `bounceType` (hard/soft) but never stores it; soft bounces are treated identically to hard bounces, permanently suppressing leads that should be retried. Noted as deferred for this fix pass per FEATURES.md, but the data loss impact is meaningful. Should be flagged for the next milestone.

- **`canSendFromAccount` stale in-memory read** — the daily limit check reads the account's counter as fetched at job start; if multiple leads share the same account, the limit is not re-read between sends in the same job run. A local in-memory counter keyed by `accountId` would prevent over-sending within a single job run. Moderate priority; can be addressed in Phase 1 alongside the daily reset fix.

- **Outlook reply detection** — Outlook accounts' replies cannot be detected because `processReplies.ts` only has IMAP logic and Outlook uses the Graph API for mail access. This means Outlook-sent campaigns will never detect replies. Out of scope for this milestone per PROJECT.md, but the impact should be communicated: Outlook accounts will accumulate replied leads that the system counts as still active.

---

## Sources

### Primary (HIGH confidence — direct code inspection)
- `src/server/jobs/processOutreachSequences.ts` — sequence processor with gaps
- `src/server/jobs/processBounces.ts` — reference implementation for imapflow and job patterns
- `src/server/jobs/processReplies.ts` — legacy imap implementation to migrate
- `src/server/lib/outreach-sender.ts` — canonical shared sending module
- `src/server/jobs/index.ts` — cron schedule architecture
- `src/lib/api.ts` and `src/lib/api-client.ts` — both API clients
- `src/db/schema.ts` — field names, types, constraints, FK relationships
- `src/pages/outreach/sequences/NewSequencePage.tsx` — broken UI component
- `src/server/routes/outreach/campaigns.ts` — API contracts for sequence creation
- `.planning/PROJECT.md` — scope, constraints, and decisions

### Secondary (MEDIUM confidence — training knowledge)
- Industry patterns: Instantly, Apollo, Lemlist campaign/sequence UI model
- SMTP retry and transient error classification (4xx vs 5xx)
- RFC 3464 DSN bounce message structure
- Express 5 `mergeParams` behavior for nested routers

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
