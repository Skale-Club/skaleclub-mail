# Roadmap: SkaleClub Mail — Outreach System Completion

## Overview

A targeted fix pass on a partially-built outreach module. The backend infrastructure is substantially complete; this milestone fills the implementation gaps that prevent end-to-end function: a daily send counter that never resets, a sequence job that duplicates and bypasses the shared sending module, a UI that never calls the API, and a reply detector using a legacy IMAP library. Phases are ordered so that the backend is correct before the UI connects to it, with code quality work running in parallel from the start.

## Phases

- [ ] **Phase 1: Sending Correctness** - Fix blocking backend bugs in the sequence processor and cron scheduler
- [ ] **Phase 2: Reply Detection** - Migrate processReplies.ts from `imap` to `imapflow`
- [ ] **Phase 3: Sequence Builder UI** - Wire NewSequencePage to the API with correct field names and route param
- [ ] **Phase 4: Code Quality** - Remove TypeScript errors, dead code, and inconsistent imports

## Phase Details

### Phase 1: Sending Correctness
**Goal**: The sequence processor correctly sends emails for all account types, records every send, resets daily limits at midnight, and cannot double-send on retry
**Depends on**: Nothing (first phase)
**Requirements**: SEND-01, SEND-02, SEND-03, SEND-04, SEND-05, SEND-06
**Success Criteria** (what must be TRUE):
  1. An email account that hit its daily send limit on day 1 resumes sending on day 2 without manual intervention
  2. An Outlook-configured email account has its messages delivered (not silently dropped)
  3. A step with `abTestEnabled: true` assigns the same variant to the same lead on every run — retries do not flip variants
  4. No lead receives the same sequence step email twice even if the job is interrupted between SMTP send and DB write
  5. `processOutreachSequences.ts` contains no local copies of `isWithinSendWindow`, `canSendFromAccount`, or `sendEmail`
**Plans**: TBD

### Phase 2: Reply Detection
**Goal**: processReplies.ts detects replies using imapflow with the same connection pattern as processBounces.ts, and the legacy `imap` package is removed
**Depends on**: Nothing (parallel with Phase 1)
**Requirements**: REPLY-01, REPLY-02, REPLY-03
**Success Criteria** (what must be TRUE):
  1. A reply to an outreach email is detected and marked as replied in the next cron tick without hanging connections
  2. A processed message is flagged `\Seen` so it is not reprocessed on the next run
  3. `package.json` contains no `imap` or `@types/imap` entries
**Plans**: TBD

### Phase 3: Sequence Builder UI
**Goal**: Users can create a sequence with steps through the NewSequencePage UI and have it saved to the database and executed by the job
**Depends on**: Phase 1
**Requirements**: SEQ-01, SEQ-02, SEQ-03, SEQ-04, SEQ-05
**Success Criteria** (what must be TRUE):
  1. Clicking Save on NewSequencePage creates a sequence record and all step records via the API — no console.log in the network tab
  2. A sequence created from a campaign's detail page is correctly associated with that campaign (no FK violation at the DB layer)
  3. Step delay and body fields submitted to the API match the schema column names (`delayHours`, `htmlBody`)
  4. After a successful save the user lands on the campaign/sequences list with a success toast visible
**Plans**: TBD
**UI hint**: yes

### Phase 4: Code Quality
**Goal**: TypeScript compiles cleanly, all outreach pages use lib/api-client consistently, and the cron scheduler has a concurrency guard
**Depends on**: Nothing (parallel with Phases 1 and 2)
**Requirements**: QUAL-01, QUAL-02, QUAL-03, QUAL-04
**Success Criteria** (what must be TRUE):
  1. `npx tsc --noEmit` exits with code 0 and zero TS6133 errors across all outreach files
  2. No outreach page imports from `lib/api` — all use `lib/api-client`
  3. An overlapping cron invocation of the sequence processor is skipped, not stacked
**Plans**: TBD

## Progress

**Execution Order:**
Phase 2 and Phase 4 can start immediately and run in parallel with Phase 1.
Phase 3 requires Phase 1 complete. Phase 3 is easier after Phase 4 (clean TypeScript baseline).

Recommended order: [1 + 2 + 4 in parallel] → [3]

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Sending Correctness | 0/? | Not started | - |
| 2. Reply Detection | 0/? | Not started | - |
| 3. Sequence Builder UI | 0/? | Not started | - |
| 4. Code Quality | 0/? | Not started | - |
