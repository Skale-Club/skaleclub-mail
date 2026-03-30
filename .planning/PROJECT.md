# SkaleClub Mail — Outreach System

## What This Is

SkaleClub Mail is a multi-tenant email server management platform. The outreach module provides cold email campaign tooling: leads management, email sequence building, campaign orchestration, reply/bounce detection, and analytics. This initiative is a targeted completion pass — filling implementation gaps and fixing errors so the outreach system works end-to-end.

## Core Value

A user can create a campaign, build a sequence, add leads, and have emails actually sent and tracked — with replies and bounces correctly detected and handled.

## Requirements

### Validated

- ✓ Email account (inbox) CRUD with SMTP/IMAP connection verification — existing
- ✓ Campaign CRUD (create, edit, pause, activate, archive) — existing
- ✓ Sequence and step CRUD at the API level — existing
- ✓ Lead and lead list CRUD with bulk import — existing
- ✓ Outreach dashboard with live stats (open rate, click rate, reply rate) — existing
- ✓ Send window enforcement (time-of-day and weekday-only) — existing
- ✓ Daily send limit per email account — existing
- ✓ Suppression list (unsubscribes honored before sending) — existing
- ✓ Open/click tracking injection (pixel + URL rewriting) — existing
- ✓ A/B testing schema fields on sequence steps — existing
- ✓ Unsubscribe endpoint and flow — existing
- ✓ Campaign completion detection (mark complete when all leads finish) — existing
- ✓ Outlook OAuth sending via `sendMessageWithOutlook` — existing (in outreach-sender.ts)

### Active

- [ ] **NewSequencePage connects to API** — save button calls `POST /api/outreach/campaigns/:id/sequences` then creates steps; currently does `console.log` only
- [ ] **NewSequencePage field names corrected** — uses `delayDays` and `bodyHtml` internally; schema and API expect `delayHours` and `htmlBody`
- [ ] **NewSequencePage campaign selection** — sequences must belong to a campaign; page needs to capture `campaignId` (either from route param or picker)
- [ ] **processOutreachSequences uses outreach-sender.ts** — job has duplicate `isWithinSendWindow`, `canSendFromAccount`, and `sendEmail` implementations; consolidate to shared module
- [ ] **Outlook support in sequence processor** — job only sends via SMTP; must route through `sendOutreachEmail()` from `outreach-sender.ts` which handles Outlook accounts
- [ ] **A/B variant selection in sequence processor** — job always uses variant 'a'; must read `abTestEnabled` and `abTestPercentage` from step to select variant per lead
- [ ] **processReplies.ts migrated to imapflow** — uses `imap` library while all other IMAP code uses `imapflow`; unify to single library
- [ ] **NewInboxPage imports corrected** — imports `apiFetch` from `lib/api`; all other outreach pages use `lib/api-client`; align to consistent import
- [ ] **TypeScript errors resolved** — unused imports in `NewSequencePage.tsx`, `SequencesPage.tsx`, and other outreach files causing `tsc --noEmit` failures

### Out of Scope

- Email warm-up automation — schema fields exist but warm-up sending logic is not built; deferred
- New outreach features (templates library, AI copywriting, multi-channel) — improvements only, not net-new features
- Testing framework setup — no tests currently exist across the whole app; deferred to separate initiative
- MailLayout `openCompose` prop error — belongs to mail module, not outreach; tracked separately

## Context

- The outreach system is large (~7600 lines across 20+ files) and was partially built — backend routes are solid, jobs have logic but with duplication and gaps
- Two API client utilities coexist: `src/lib/api.ts` and `src/lib/api-client.ts` — both export `apiFetch`; outreach pages inconsistently use one or the other
- `outreach-sender.ts` was created as a shared sending module but `processOutreachSequences.ts` duplicates it instead of using it
- The codebase uses `imapflow` for all new IMAP code (email-accounts verify, processBounces) but `processReplies.ts` still uses the older `imap` package
- Sequences belong to campaigns in the data model (`sequences.campaignId`) — the standalone `NewSequencePage` flow needs a campaign association mechanism
- All outreach routes require `isPlatformAdmin` middleware — org membership is checked per-route

## Constraints

- **Tech stack**: Express 5 beta, React 18, Drizzle ORM, Supabase — no changes to stack
- **Auth**: All outreach API routes go through `isPlatformAdmin` middleware; this pattern must be preserved
- **DB**: Schema changes require `npm run db:generate` + `npm run db:push`; avoid schema changes if possible for this fix pass
- **No new dependencies**: Use existing `imapflow`, `nodemailer`, and other deps already in package.json

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Consolidate job to use outreach-sender.ts | Eliminates ~100 lines of duplicated logic; ensures Outlook support is automatic | — Pending |
| Migrate processReplies.ts to imapflow | Matches all other IMAP code; single library to maintain | — Pending |
| Sequence creation tied to campaign | Data model requires it; UI flow must reflect this constraint | — Pending |
| Use lib/api-client.ts across all outreach pages | Consistent error handling and retry logic vs lib/api.ts | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-30 after initialization*
