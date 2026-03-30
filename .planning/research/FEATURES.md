# Feature Landscape: Cold Email Outreach System

**Domain:** Cold email outreach (sequences, reply/bounce detection, send limit enforcement)
**Researched:** 2026-03-30
**Scope:** Milestone completion pass — filling implementation gaps in existing module
**Overall confidence:** HIGH (primary source is the actual codebase; industry patterns from training knowledge, confidence noted per section)

---

## 1. Sequence Builder UI — Campaign/Sequence Relationship

### How leading tools structure this (MEDIUM confidence — training knowledge)

**Instantly, Apollo, Lemlist** converge on the same model: a campaign is the container (settings, leads, sending schedule, analytics), and a sequence is a named ordered list of steps inside that campaign. The key UX insight is that users *create a campaign first* and then *build the sequence inside it* — the sequence is never an independent, free-floating object.

| Tool | Campaign / Sequence Relationship | UI Entry Point |
|------|----------------------------------|----------------|
| Instantly | 1 campaign : 1 sequence (merged UI; no explicit "sequence" object shown to user) | Create Campaign wizard → step editor inline |
| Apollo | 1 campaign : 1 active sequence + optional variants | Create Sequence → assign to campaign later |
| Lemlist | 1 campaign : 1 sequence (explicit sequence tab inside campaign) | Create Campaign → navigate to Sequence tab |
| Woodpecker | 1 campaign : multiple steps (no "sequence" layer exposed) | Steps are direct children of campaign in UI |

**What this means for SkaleClub Mail:** The data model already has a correct 1-campaign-to-many-sequences structure with sequences being children of campaigns (via `sequences.campaignId`). The `POST /api/outreach/campaigns` route even auto-creates a "Main Sequence" on campaign creation. The UI gap is that `NewSequencePage` treats sequences as standalone objects — it has no `campaignId` and calls `console.log` instead of the API.

### The two valid UI patterns for adding sequences

**Pattern A — "Sequence inside Campaign" (recommended for this fix pass):**
The user navigates into an existing campaign and clicks "Add Sequence". The `campaignId` comes from the route (`/outreach/campaigns/:id/sequences/new`), never from a picker. This is how Apollo and Lemlist work. It avoids the campaign-selection picker problem entirely.

**Pattern B — "Sequence first, then assign":**
Create sequence standalone, then assign to a campaign via a picker component. Adds complexity (picker state, validation that a campaign is selected) and breaks the mental model for most users. Not recommended unless sequences need to be reusable across campaigns (this codebase does not support that — the FK is non-nullable).

### Current broken state vs what it needs to be

| Current State (`NewSequencePage.tsx`) | Required State |
|---------------------------------------|----------------|
| Uses `delayDays` field name (local state) | Must map to `delayHours` (schema and API) |
| Uses `bodyHtml` field name (local state) | Must map to `htmlBody` (API schema) |
| `handleSave` calls `console.log` only | Must call `POST /api/outreach/campaigns/:id/sequences` then loop `POST /api/outreach/campaigns/:id/sequences/:seqId/steps` for each step |
| No `campaignId` captured anywhere | Must receive `campaignId` from route param (`/outreach/campaigns/:id/sequences/new`) or a picker |
| Imports unused `ArrowLeft`, `Save`, `Plus`, `Clock`, `Mail`, `Trash2` (some may be used; TS errors) | Remove or use all imported symbols |

### API contract for sequence creation (confirmed from `campaigns.ts`)

Step 1 — Create sequence:
```
POST /api/outreach/campaigns?organizationId=...
Body: { name: string, description?: string }
-- actually: POST /api/outreach/campaigns/:id/sequences
Body (createSequenceSchema): { name: string, description?: string }
```

Step 2 — Create each step:
```
POST /api/outreach/campaigns/:id/sequences/:sequenceId/steps
Body (createSequenceStepSchema):
  stepOrder: number (int, min 0)
  type: 'email' | 'delay' | 'condition'
  delayHours: number (NOT delayDays)
  subject?: string
  plainBody?: string
  htmlBody?: string (NOT bodyHtml)
  subjectB?: string
  plainBodyB?: string
  htmlBodyB?: string
  abTestEnabled: boolean
  abTestPercentage: number (0-100)
```

**Key field name corrections required in `NewSequencePage.tsx`:**
- `step.delayDays` → `step.delayHours` (the UI shows "days" but the schema is hours; decide: either keep displaying "days" and multiply by 24 before sending, or rename to hours throughout)
- `step.bodyHtml` → `step.htmlBody`

### Table stakes for sequence builder UI

| Feature | Why Expected | Current State | Complexity |
|---------|--------------|---------------|------------|
| Visual step timeline with connectors | Users need to see email cadence at a glance | Partially built (connector line via absolute positioning) | Low |
| Add email step | Core action | Built | Done |
| Add delay step | Core action | Built | Done |
| Remove step | Core action | Built | Done |
| Reorder steps (drag-and-drop) | Expected by users of Instantly/Lemlist | Not built | High — defer |
| Subject field per email step | Core | Built | Done |
| HTML body textarea | Functional minimum | Built (plain textarea, no rich text) | Done |
| Template variable hints (`{{firstName}}` etc.) | Strongly expected | Placeholder text hints exist; no autocomplete | Low to add hint list |
| Save to API | Core — currently broken | BROKEN (console.log only) | Low (the fix this milestone targets) |
| Campaign association | Required by data model | BROKEN (no campaignId captured) | Low |

### Differentiators (out of scope for fix pass)

| Feature | Value | Complexity |
|---------|-------|------------|
| Rich text editor (WYSIWYG) for email body | Significant UX improvement | Medium — add Tiptap or Quill |
| Step-level preview ("Preview as lead") | Reduces errors | Medium |
| A/B variant editor in UI | Schema supports it; UI does not expose it | Medium |
| Drag-and-drop step reordering | Common in Instantly/Apollo | High |

---

## 2. Reply Detection via IMAP

### Standard industry patterns (HIGH confidence — confirmed against codebase)

Reply detection in cold email tools follows a consistent algorithm:

1. Connect to each sending account's IMAP inbox
2. Fetch messages (typically UNSEEN only, to avoid reprocessing)
3. For each message, extract `In-Reply-To` and `References` headers
4. Look up the stored `Message-ID` from the original outreach email
5. If a match is found, mark the lead as replied and stop the sequence

**Threading header precedence:**
- `In-Reply-To` is the primary match field — a reply MUST have this set to the original's `Message-ID`
- `References` is a fallback — it is a space-separated chain of all `Message-ID`s in the thread; the last entry is typically the immediate parent
- Matching against `References` first ID (as `extractFirstReference` does) can produce false positives in long threads — matching the *last* reference or any reference is more correct

### Current implementation (`processReplies.ts`) — what it does right

- Fetches UNSEEN messages only (avoids reprocessing already-seen mail)
- Parses both `In-Reply-To` and `References` headers
- Strips angle brackets from Message-ID before comparison (`cleanMessageId`)
- Updates `outreachEmails.repliedAt`, `campaignLeads.status = 'replied'`, `leads.lastRepliedAt`, and increments counters on both `campaigns` and `emailAccounts`
- Replied status stops sequence progression (the job skips leads with status `replied`)

### Current implementation gaps

| Gap | Impact | Fix |
|-----|--------|-----|
| Uses `imap` library (callback/event model) | Inconsistency — all other IMAP code uses `imapflow` (promise-based). Two libraries to maintain, different error models | Migrate to `imapflow` (existing dependency) |
| `extractFirstReference` returns refs[0] (oldest in chain) | In a long thread, refs[0] is the original message which may predate the outreach email being looked for | Should match against *any* reference in the chain, or prefer the last |
| No IMAP IDLE / push notification | Job runs on cron schedule (polling). Reply detection lags by the cron interval | Acceptable for v1; IDLE would reduce lag but adds complexity |
| Does not mark messages as `\Seen` after processing | Same UNSEEN messages will be reprocessed on next run, generating duplicate match attempts | Add `imap.addFlags(uid, '\\Seen')` after successful processing |
| Accounts with `provider: 'outlook'` are never processed | `processReplies.ts` only has IMAP logic; Outlook accounts use Graph API for mail access | Medium complexity fix; out of scope for this milestone but worth noting |

### imapflow migration pattern (what the fix looks like)

`processBounces.ts` is the reference implementation. Pattern:
```typescript
const client = new ImapFlow({ host, port, secure, auth: { user, pass }, logger: false })
await client.connect()
const lock = await client.getMailboxLock('INBOX')
try {
    const uids = await client.search({ seen: false }, { uid: true })
    for (const uid of uids) {
        const msg = await client.fetchOne(uid, { headers: ['in-reply-to', 'references'] })
        // ... process headers
        await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
    }
} finally {
    lock.release()
    await client.logout()
}
```

The key difference from `processBounces.ts`: fetch headers only (not full `source`) to minimize bandwidth.

---

## 3. Bounce Detection

### Standard industry classification (HIGH confidence — confirmed against codebase + well-established SMTP standards)

**Hard bounce** — permanent delivery failure. The recipient address does not exist or is permanently rejected. Action: suppress the address immediately, stop all future sending.
- SMTP codes: 5xx (550, 551, 553 most common)
- DSN status codes: 5.x.x

**Soft bounce** — temporary delivery failure. Mailbox full, server temporarily unavailable, greylisted. Action: retry later (typically 3-5 attempts), then convert to hard bounce if persistent.
- SMTP codes: 4xx (450, 451, 452)
- DSN status codes: 4.x.x

### Current implementation (`processBounces.ts`) — what it does right

- Uses `imapflow` (correct, consistent with all other IMAP code)
- Uses `mailparser` (simpleParser) to parse full message source
- Sender-based heuristic: `BOUNCE_SENDERS` list + `BOUNCE_SUBJECTS` list
- Keyword-based classification into hard vs soft via `hardBounceIndicators` / `softBounceIndicators`
- Extracts diagnostic SMTP code from message content
- Two-pass lookup: tries `originalMessageId` first, falls back to `recipientEmail + accountId`
- Updates `outreachEmails.status = 'bounced'`, `campaignLeads.status = 'bounced'`, `leads.status = 'bounced'`, increments bounce counters
- Also supports webhook-based bounce ingestion (`processBounceFromWebhook`) for ESPs like SendGrid/Mailgun

### Current implementation gaps

| Gap | Impact | Fix |
|-----|--------|-----|
| Hard/soft distinction not persisted | `bounceType` is computed but never stored; only `bounceReason` text is saved. Soft bounces are treated identically to hard bounces (lead permanently stopped) | Add `bounceType` column to `outreach_emails`; only hard bounces should permanently suppress |
| No DSN MIME part parsing | RFC 3464 DSN messages contain a `message/delivery-status` MIME part with structured fields (`Final-Recipient`, `Action`, `Status`, `Diagnostic-Code`). Current code does text search on full content — less reliable | Use `mailparser`'s attachment parsing to find the `message/delivery-status` part directly |
| Duplicate processing risk | Processed bounce emails are marked `\Seen` but the IMAP search only looks for `from: mailer-daemon` etc., not `unseen`. Messages could be reprocessed | Add `{ seen: false }` to the search query alongside the sender filters |
| `currentDailySent` not reset daily | The `canSendFromAccount` check uses `currentDailySent` but nothing in the codebase resets it at midnight | Need a daily cron job: `UPDATE email_accounts SET current_daily_sent = 0 WHERE ...` |
| Bounce from IMAP search only finds 4 sender patterns | `bounce@` and `bounces@` won't match `bounce+hash@domain.com` (common in Mailchimp-style bounce addresses) | Use `LIKE 'bounce%'` style search or broader heuristic |

### DSN parsing — what proper RFC 3464 parsing looks like (MEDIUM confidence)

A proper DSN bounce email has three MIME parts:
1. `text/plain` — human-readable explanation
2. `message/delivery-status` — machine-readable status per recipient
3. `message/rfc822` — original message (optional)

The `message/delivery-status` part contains:
```
Final-Recipient: rfc822; user@example.com
Action: failed
Status: 5.1.1
Diagnostic-Code: smtp; 550 5.1.1 The email account that you tried to reach does not exist
```

`mailparser` exposes attachments with `contentType === 'message/delivery-status'`. Parsing this directly is more reliable than text scanning.

---

## 4. Daily Send Limit Enforcement

### Industry patterns (HIGH confidence — confirmed against codebase schema)

Cold email tools enforce send limits at the email-account level (not campaign level) because a single account has a fixed reputation budget regardless of how many campaigns use it.

**Standard pattern:**
1. `emailAccounts.dailySendLimit` — maximum per day (configurable per account)
2. `emailAccounts.currentDailySent` — counter incremented on each send
3. Before sending: check `currentDailySent < dailySendLimit`
4. After midnight: reset `currentDailySent = 0` for all accounts
5. Optional: random jitter between sends (humanization) via `minMinutesBetweenEmails` / `maxMinutesBetweenEmails`

The schema already has all these fields. `outreach-sender.ts` has the correct `canSendFromAccount` check. `processOutreachSequences.ts` has a duplicate version.

### Current implementation gaps

| Gap | Impact | Fix |
|-----|--------|-----|
| `currentDailySent` is never reset to 0 | After hitting the daily limit, an account will never send again (counter never resets) | Add a midnight cron: `UPDATE email_accounts SET current_daily_sent = 0` |
| `processOutreachSequences.ts` has its own `canSendFromAccount` | Duplicates the logic in `outreach-sender.ts`; if the limit check logic changes, only one version gets updated | Remove from job, import from `outreach-sender.ts` |
| Warm-up fields exist but logic is not implemented | `warmupEnabled`, `warmupDays`, `warmupCurrentDay` are in schema but nothing ramps up `dailySendLimit` over time | Out of scope per PROJECT.md |
| No random send interval (jitter) | `minMinutesBetweenEmails` / `maxMinutesBetweenEmails` exist on the schema but the job does not respect them | Moderate fix: before scheduling `nextScheduledAt`, add random jitter within the configured range |
| Per-account send counting not incremented in all paths | `outreach-sender.ts` should increment `currentDailySent` after a successful send. Need to verify this actually happens in the job | Check `processOutreachSequences.ts` post-send update logic |

### Daily reset cron — required pattern

```typescript
// In jobs/index.ts — schedule at midnight UTC
cron.schedule('0 0 * * *', async () => {
    await db.update(emailAccounts).set({ currentDailySent: 0 })
    console.log('[jobs] Reset daily send counters for all email accounts')
})
```

This is a critical missing piece. Without it, accounts hit their limit on day 1 and never send again.

---

## Table Stakes (What Must Work for End-to-End Function)

Features users expect to work before the system is considered functional:

| Feature | Why Expected | Current State | Fix Required |
|---------|--------------|---------------|--------------|
| Create sequence with steps linked to a campaign | Core flow | BROKEN — UI disconnected from API | Yes (this milestone) |
| Correct field names (delayHours, htmlBody) | API contract | BROKEN — UI uses delayDays, bodyHtml | Yes (this milestone) |
| Reply detection via IMAP | Sequence must stop on reply | Partially working but uses wrong IMAP library | Yes (this milestone) |
| Bounce detection via IMAP | Lead must be suppressed on hard bounce | Working but soft/hard distinction not persisted | Partial |
| Daily send counter reset at midnight | Accounts must recover each day | MISSING — counter never resets | Yes (critical) |
| Per-account send limit respected | Inbox reputation protection | Logic exists but duplicated | Consolidate |
| Outlook sending via sequence processor | Outlook accounts must work | MISSING — job only uses SMTP path | Yes (this milestone) |
| A/B variant selection | Schema and sender support it; job always picks variant A | BROKEN — job hardcodes variant 'a' | Yes (this milestone) |

## Anti-Features (Do Not Build)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Warm-up automation logic | Schema fields exist but explicitly deferred in PROJECT.md; adds complexity | Leave `warmupEnabled` fields dormant; mark as future work |
| Rich text / WYSIWYG editor in NewSequencePage | High complexity; not needed for functional fix | Keep the textarea; add a comment for future enhancement |
| Multi-channel steps (LinkedIn, SMS) | Net-new feature; out of scope per PROJECT.md | Not applicable |
| Drag-and-drop step reordering | High complexity; the sequence builder works without it | Use "Add above/below" buttons if needed, or defer entirely |
| Webhook-based bounce ingestion expansion | Current `processBounceFromWebhook` is sufficient for the fix pass | Do not add new webhook providers |

## Feature Dependencies

```
Campaign exists
    → Sequence can be created (sequences.campaignId is NOT NULL)
        → Steps can be created (steps.sequenceId)
            → Leads can be assigned to campaign (campaignLeads)
                → processOutreachSequences job can run
                    → outreachEmails records created with messageId
                        → processReplies can match replies (via messageId)
                        → processBounces can match bounces (via messageId or email)

Daily counter reset
    → canSendFromAccount returns true after midnight
        → sequence processing resumes after hitting daily limit
```

## MVP for This Fix Pass

The minimum to make the system work end-to-end:

1. **Fix `NewSequencePage` field names** — `delayDays` → `delayHours`, `bodyHtml` → `htmlBody`
2. **Connect `NewSequencePage` save to API** — replace `console.log` with API calls to create sequence + steps
3. **Capture `campaignId` in `NewSequencePage`** — from route param or picker
4. **Migrate `processReplies.ts` to imapflow** — consistent with all other IMAP code
5. **Consolidate `processOutreachSequences.ts`** — remove duplicated functions, import from `outreach-sender.ts`
6. **Add daily counter reset cron** — `UPDATE email_accounts SET current_daily_sent = 0` at midnight
7. **Fix A/B variant selection in job** — read `abTestEnabled` and `abTestPercentage`, select variant probabilistically

Defer: bounce type persistence, DSN MIME parsing, random jitter, Outlook reply detection.

## Sources

- `src/pages/outreach/sequences/NewSequencePage.tsx` — direct code inspection (HIGH confidence)
- `src/server/routes/outreach/campaigns.ts` — API contract confirmed (HIGH confidence)
- `src/server/jobs/processReplies.ts` — reply detection implementation (HIGH confidence)
- `src/server/jobs/processBounces.ts` — bounce detection implementation (HIGH confidence)
- `src/server/jobs/processOutreachSequences.ts` — sequence processor (HIGH confidence)
- `src/server/lib/outreach-sender.ts` — shared sender module (HIGH confidence)
- `src/db/schema.ts` — field names, types, and constraints (HIGH confidence)
- `.planning/PROJECT.md` — scope decisions and active requirements (HIGH confidence)
- Industry patterns (Instantly, Apollo, Lemlist campaign/sequence model) — training knowledge (MEDIUM confidence)
- RFC 3464 DSN structure — training knowledge (HIGH confidence, well-established standard)
- SMTP bounce code classification (5xx hard, 4xx soft) — training knowledge (HIGH confidence, well-established standard)
