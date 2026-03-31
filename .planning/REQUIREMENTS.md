# Requirements: SkaleClub Mail — Outreach System

**Defined:** 2026-03-30
**Core Value:** A user can create a campaign, build a sequence, add leads, and have emails actually sent and tracked — with replies and bounces correctly detected and handled.

## v1 Requirements

### Sending Correctness

- [ ] **SEND-01**: Daily send counter (`currentDailySent`) resets to 0 at midnight via cron — currently never resets, silently blocking all sends after day 1
- [x] **SEND-02**: Sequence processor uses `sendOutreachEmail()` from `outreach-sender.ts` — eliminates SMTP-only path and routes Outlook accounts correctly
- [x] **SEND-03**: Sequence processor calls `recordOutreachEmail()` after every successful send — no outbound email goes unrecorded
- [x] **SEND-04**: A/B variant is selected deterministically per lead (hash of `leadId + stepId`) when `step.abTestEnabled` is true — `Math.random()` breaks on retry
- [ ] **SEND-05**: Sequence processor has idempotency guard — duplicate send to same `(campaignLeadId, sequenceStepId)` pair is prevented before SMTP is called
- [x] **SEND-06**: Duplicate `isWithinSendWindow` and `canSendFromAccount` functions removed from `processOutreachSequences.ts` — shared module is the single source of truth

### Reply Detection

- [ ] **REPLY-01**: `processReplies.ts` migrated from `imap` package to `imapflow` — matches all other IMAP code in the codebase
- [ ] **REPLY-02**: IMAP connection management uses `connect()` → `getMailboxLock()` → `for await...of fetch()` → `lock.release()` in finally → `logout()` in finally — no hung connections or swallowed errors
- [ ] **REPLY-03**: `imap` package removed from `package.json` after migration — no dead dependency

### Sequence Builder UI

- [x] **SEQ-01**: `NewSequencePage` save button calls the API: `POST /api/outreach/campaigns/:campaignId/sequences` then `POST .../steps` for each step — currently does `console.log` only
- [x] **SEQ-02**: `NewSequencePage` uses correct field names: `delayHours` (not `delayDays`), `htmlBody` (not `bodyHtml`) — matches API schema and Zod validation
- [x] **SEQ-03**: `NewSequencePage` receives `campaignId` from route param (`/outreach/campaigns/:id/sequences/new`) — sequences require a campaign FK in schema
- [x] **SEQ-04**: Route for `NewSequencePage` added to `src/main.tsx` with the `:id` param pattern
- [x] **SEQ-05**: After successful save, user is navigated back to the campaign/sequences list with a success toast

### Code Quality

- [x] **QUAL-01**: `NewInboxPage.tsx` import updated from `lib/api` to `lib/api-client` — consistent with all other outreach pages
- [x] **QUAL-02**: Unused imports removed from `NewSequencePage.tsx` (`Plus`) and `SequencesPage.tsx` (`Link`) — eliminates TypeScript `TS6133` errors
- [x] **QUAL-03**: `processOutreachSequences.ts` private `sendEmail` function removed after consolidation to shared module
- [x] **QUAL-04**: Cron job concurrency guard added — `isProcessing` flag in `jobs/index.ts` prevents overlapping sequence processor runs

## v2 Requirements

### Bounce Handling

- **BOUNCE-01**: Soft vs hard bounce type persisted to `outreach_emails` — currently computed by `parseBounceMessage` but dropped before DB write
- **BOUNCE-02**: Soft bounces retry after delay instead of permanently stopping the lead — currently both bounce types stop the sequence

### Advanced Sending

- **ADV-01**: `calculateNextScheduledAt` unified across job and shared module with timezone-aware scheduling using campaign's `timezone` field
- **ADV-02**: Per-account minimum delay between sends (`minMinutesBetweenEmails` / `maxMinutesBetweenEmails`) enforced in sequence processor — schema fields exist but unused in job
- **ADV-03**: Email warm-up automation — schema fields exist, no sending logic built

### Analytics

- **ANAL-01**: Outreach analytics daily aggregation cron — `outreachAnalytics` table exists but no job populates it
- **ANAL-02**: Per-step open/click/reply rates on `AnalyticsPage`

## Out of Scope

| Feature | Reason |
|---------|--------|
| New outreach features (AI copywriting, templates library, multi-channel) | Improvements only — no net-new features this pass |
| Testing framework setup | No tests exist across the whole app; separate initiative |
| MailLayout `openCompose` prop error | Mail module bug, not outreach |
| Email warm-up sending logic | Schema supports it but out of scope for this fix pass |
| Outlook reply detection | Outlook uses different reply mechanism; separate initiative |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEND-01 | Phase 1 | Pending |
| SEND-02 | Phase 1 | Complete |
| SEND-03 | Phase 1 | Complete |
| SEND-04 | Phase 1 | Complete |
| SEND-05 | Phase 1 | Pending |
| SEND-06 | Phase 1 | Complete |
| REPLY-01 | Phase 2 | Pending |
| REPLY-02 | Phase 2 | Pending |
| REPLY-03 | Phase 2 | Pending |
| SEQ-01 | Phase 3 | Complete |
| SEQ-02 | Phase 3 | Complete |
| SEQ-03 | Phase 3 | Complete |
| SEQ-04 | Phase 3 | Complete |
| SEQ-05 | Phase 3 | Complete |
| QUAL-01 | Phase 4 | Complete |
| QUAL-02 | Phase 4 | Complete |
| QUAL-03 | Phase 4 | Complete |
| QUAL-04 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-30*
*Last updated: 2026-03-30 after initial definition*
