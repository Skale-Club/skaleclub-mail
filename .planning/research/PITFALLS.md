# Domain Pitfalls: Cold Email Outreach System Completion

**Domain:** Cold email outreach system — fixing and completing an existing partially-built module
**Researched:** 2026-03-30
**Scope:** Targeted at the specific gaps identified in PROJECT.md — not a general survey

---

## Critical Pitfalls

Mistakes that cause duplicate sends, lost data, or silent corruption.

---

### Pitfall 1: Double-Send on Job Retry — No Idempotency Guard

**What goes wrong:** `processOutreachSequences` sends the email first, then inserts the `outreachEmails` record and advances `campaignLeads.currentStepId`. If the job is interrupted or retried between the SMTP call and the DB write — or if two cron ticks fire close together — the same step is sent twice to the same lead. The lead's `status` is still `contacted` and `nextScheduledAt` is still in the past at retry time, so the pending query picks them up again.

**Why it happens:** The current code has no "in-flight" marker. The sequence is:
1. Query for `nextScheduledAt <= now` and non-terminal status
2. Send via SMTP (can succeed)
3. Insert `outreachEmails` record (can fail or be skipped)
4. Update `campaignLeads.currentStepId` and `nextScheduledAt` (only this prevents re-selection)

Steps 2 through 4 are not atomic. Any failure between steps 2 and 4 means the lead re-enters the queue on the next tick.

**Consequences:** Lead receives duplicate emails for the same sequence step. `outreachEmails` gets duplicate rows with the same `campaignLeadId` + `sequenceStepId` pair. Stats are double-counted.

**Prevention:** Before sending, set a "processing" status or clear `nextScheduledAt` in a single UPDATE, and return early if the update affects 0 rows (another worker already claimed it). Alternatively, query for a pre-existing `outreachEmails` row matching `(campaignLeadId, sequenceStepId)` and skip if found — there is no unique constraint on that pair in the current schema, so add one or enforce it in code.

**Detection:** Watch for `outreachEmails` rows where the same `(campaignLeadId, sequenceStepId)` appears more than once. A query checking `COUNT(*) > 1` grouped on those two columns will surface existing duplicates.

---

### Pitfall 2: A/B Variant Assignment Is Not Sticky — Variant Changes on Retry

**What goes wrong:** A/B variant selection logic (not yet implemented — the job hardcodes `abVariant: null`) must be deterministic per lead. If variant selection uses `Math.random()` at send time and the email fails after SMTP but before the DB write, the retry may assign a different variant. The lead ends up in the `outreachEmails` table with one variant but the analytics may count them against another.

**Why it happens:** `Math.random()` is stateless. Each job invocation generates a fresh random number. Without persisting the assignment before sending, retries are non-deterministic.

**Consequences:** A/B test results are corrupted — a lead is counted in both variants. Open/click rates become meaningless. If the variant affects subject line, the lead may receive two different subjects.

**Prevention:** Persist the variant assignment to `campaignLeads` (or a dedicated column) **before** calling `sendOutreachEmail`. Use a deterministic hash (e.g., `hash(leadId + stepId) % 100 < abTestPercentage ? 'a' : 'b'`) so that retries always produce the same variant for the same lead/step pair without any stored state. The hash approach is the simplest and most resilient option.

**Detection:** Check `outreachEmails` for rows where the same `campaignLeadId` has entries with different `abVariant` values for the same step.

---

### Pitfall 3: IMAP Library Migration — `imap` vs `imapflow` Behavioral Differences Break Existing Logic

**What goes wrong:** `processReplies.ts` uses the callback-based `imap` library. `processBounces.ts` uses the async/await `ImapFlow` library. Migrating `processReplies.ts` to `imapflow` is not a mechanical find-replace — the two libraries have fundamentally different state models.

**Specific behavioral differences to watch:**

1. **UID vs sequence number handling.** The `imap` library's `fetch()` uses sequence numbers by default; the code passes `results` from `search(['UNSEEN'])` which returns sequence numbers. `ImapFlow`'s `search()` returns UIDs by default when `{ uid: true }` is passed (as seen in `processBounces.ts` line 311). Confusing UIDs with sequence numbers causes fetching the wrong messages or a "UID FETCH" command error.

2. **Connection/mailbox lock model.** `ImapFlow` requires `client.getMailboxLock(mailbox)` and explicit `lock.release()` in a `finally` block. Missing `lock.release()` causes the client to hang indefinitely on the next operation — the connection appears alive but all commands queue up forever. The `processBounces.ts` pattern (lines 301–303) is the correct model to copy.

3. **`fetch` vs `fetchOne` / async iteration.** The `imap` library uses an event-emitter fetch model (`fetch.on('message', ...)`). `ImapFlow` uses `client.fetch()` as an async generator or `client.fetchOne()` for single messages. Attempting to use the old event listener pattern against `imapflow` will silently fail or throw.

4. **`UNSEEN` flag search.** The `imap` library's `search(['UNSEEN'])` works correctly. `ImapFlow`'s equivalent is `client.search({ seen: false })` — passing the string `'UNSEEN'` to `imapflow`'s search will not work as expected.

5. **Connection cleanup on error.** In the `imap` library, `imap.end()` is called in error paths explicitly. `ImapFlow` uses `client.logout()` for graceful close or `client.close()` to force-close. Calling `client.logout()` inside an error handler when the connection is already broken causes a second error; always prefer `client.close()` in catch blocks.

**Consequences:** Silent message mis-fetch (wrong messages processed), hung connections exhausting file descriptors, replies never detected because `UNSEEN` search returns nothing, or the job crashes on every run.

**Prevention:** Follow the `processBounces.ts` pattern exactly:
- `new ImapFlow({ ..., logger: false })`
- `await client.connect()`
- `const lock = await client.getMailboxLock('INBOX')` in try
- `lock.release()` in finally
- `await client.logout()` in the outer finally (or `client.close()` in catch)
- `client.search({ seen: false }, { uid: true })` for unseen messages
- `client.fetchOne(uid, { source: true })` with UID-mode fetch

**Detection:** Run the migrated job against a test account with known unread messages and verify the reply count matches expectations before deploying.

---

### Pitfall 4: IMAP UID Tracking — UNSEEN Scan Marks Messages as Seen, Causing Lost Replies on Error

**What goes wrong:** Scanning `UNSEEN` messages without marking them as seen mid-processing means: if the job crashes after fetching message UIDs but before processing them all, the next run rescans the same messages. Depending on IMAP server behavior, some servers auto-mark messages as seen when they are fetched with a `BODY` or `RFC822` fetch command (not just `PEEK`). The `imap` library's fetch uses `BODY` (not `BODY.PEEK`), which sets the `\Seen` flag server-side. `ImapFlow`'s `fetchOne(uid, { source: true })` also does not use `PEEK` by default.

**Consequence:** On a slow job run, some messages get `\Seen` set on the server but are not yet processed in the DB. On the next run they no longer appear in `{ seen: false }` search. Replies are silently lost.

**Prevention:** In `ImapFlow`, use `markSeen: false` option if available, or fetch with the source option and handle the `\Seen` flag intentionally. Alternatively, track the last processed UID per account in the database and use `{ uid: { range: lastUid + ':*' } }` for incremental scanning instead of `UNSEEN`. The `processBounces.ts` pattern does not address this — it is a latent bug in that file too.

---

## Moderate Pitfalls

---

### Pitfall 5: Consolidating Duplicate Sending Code — Subtle Behavioral Differences Between Versions

**What goes wrong:** `processOutreachSequences.ts` has its own `sendEmail`, `isWithinSendWindow`, `canSendFromAccount`, and `calculateNextScheduledAt` functions. `outreach-sender.ts` has different implementations of the same functions. When consolidating, the differences are not cosmetic:

1. **`isWithinSendWindow` boundary condition.** The job version (line 40) uses `currentMinutes <= endMinutes` (inclusive upper bound). The shared module version (line 73) uses `currentTimeMinutes <= endTimeMinutes` (also inclusive). These match, but the job version does not call `(campaign.sendStartTime)` directly — it falls back to `'09:00'` if null, while the shared module calls `parseTime(campaign.sendStartTime)` without a null guard. If `sendStartTime` is null in the DB, the shared module crashes; the job silently uses 09:00.

2. **`canSendFromAccount` status check.** The job version (line 43) only checks `currentDailySent < dailySendLimit`. The shared module (line 77–86) also checks `account.status !== 'verified'`. The job checks status separately earlier in the loop. After consolidation, the shared module's `canSendFromAccount` would reject accounts the job previously handled through a separate status guard — the behavior is equivalent but the error path changes (the job currently logs "account is not verified" as an error; the shared module silently returns false).

3. **`calculateNextScheduledAt` signatures differ.** The job version takes `(delayHours, timezone, sendStartTime, sendEndTime, sendOnWeekends)` — five parameters. The shared module version (line 97) takes only a `step` object and ignores campaign timezone/window entirely. The shared module version is simpler but less correct — it does not push past-window times to the next window start. After switching, the next email in a sequence may be scheduled outside the send window and then silently skipped on every tick until it falls within window again.

4. **Outlook support gap.** The job's `sendEmail` function (line 84) only does SMTP. After switching to `sendOutreachEmail()` from the shared module, Outlook accounts are supported. This is the desired behavior but the `outreachEmails` record logic differs: the job inserts the record itself; the shared module's `sendOutreachEmail` does not — `recordOutreachEmail` is a separate export. The consolidation must call both `sendOutreachEmail` and `recordOutreachEmail` or the email is sent but not recorded.

**Prevention:** Diff both implementations line-by-line before removing the job-local copies. Run the shared module's functions against the same inputs as the job's functions and compare outputs. Specifically test: null `sendStartTime`, an Outlook account, and a step that is the last in a sequence.

---

### Pitfall 6: Express 5 Beta — `req.params` Works Differently on Sub-Routers Mounted at Path

**What goes wrong:** Express 5 changed how path parameters are inherited by sub-routers. In Express 4, a child router mounted with `router.use('/campaigns/:campaignId/sequences', sequenceRouter)` would expose `req.params.campaignId` inside `sequenceRouter` handlers. In Express 5 beta, this inheritance is stricter — child routers do not inherit parent params by default unless `mergeParams: true` is set on the child router.

**In this codebase:** The outreach routes use `req.params` extensively in `campaigns.ts` (e.g., `req.params.campaignId`, `req.params.sequenceId`, `req.params.stepId`). These work because the routes are defined on the same router object. But if new sequence/step routes are added on a separate Router instance and mounted as a nested router, params from the parent path segment will be undefined.

**Current state confirmed:** `campaigns.ts` accesses `req.params.campaignId` at line 549 on what appears to be a nested route (`/campaigns/:campaignId/sequences`). This works today because everything is on the same flat router. Any refactor that splits sequence/step handlers into a child router must pass `Router({ mergeParams: true })`.

**Prevention:** When adding new routes or splitting `campaigns.ts` into sub-routers, always pass `{ mergeParams: true }` to `Router()`. Never assume param inheritance works without it in Express 5.

**Detection:** `req.params.campaignId` returns `undefined` when the route is matched. The handler then queries with `campaignId = undefined`, which either returns all campaigns or throws a Drizzle type error.

---

### Pitfall 7: `markCompletedCampaigns` — Incorrectly Marks Campaigns Complete When Leads Still Pending

**What goes wrong:** `markCompletedCampaigns` (line 362 in `processOutreachSequences.ts`) queries for incomplete leads using:

```typescript
notInArray(campaignLeads.status, ['replied', 'bounced', 'unsubscribed'])
```

This means leads with status `'new'` or `'contacted'` with a future `nextScheduledAt` are counted as "incomplete" and correctly prevent completion. However, it also means leads with status `'contacted'` and `nextScheduledAt = null` (no next step, waiting for sequence end) are not in the terminal states list — so a campaign with all leads finished but not yet having their `completedAt` set by the sequence processor will be incorrectly left as active. Additionally, the query has no `completedAt IS NULL` guard, so already-completed leads are re-counted on every invocation.

**Prevention:** The completion check should also exclude leads where `completedAt IS NOT NULL` or include `'completed'` in the exclusion list if that status exists, and verify the campaign does not have any leads with `nextScheduledAt` still in the future.

---

### Pitfall 8: `processReplies` — `In-Reply-To` Header Parsing Is Fragile

**What goes wrong:** The current `imap`-based code parses `In-Reply-To` using a regex on the raw header buffer:

```typescript
const inReplyToMatch = buffer.match(/^In-Reply-To:\s*(.+)$/im)
```

This works for simple `<messageid@domain>` values but breaks silently if:
- The header value spans multiple lines (RFC 2822 header folding — a CRLF followed by whitespace continues the header value)
- The header contains angle brackets that the later `cleanMessageId` strip handles, but the `outreachEmails.messageId` was stored without angle brackets by Nodemailer

The `outreachEmails.messageId` column stores whatever Nodemailer's `info.messageId` returns. Nodemailer may or may not include angle brackets. The `findOutreachEmailByMessageId` function in `processReplies.ts` strips angle brackets before querying. But if the stored value has angle brackets and the reply's `In-Reply-To` does not (or vice versa), the lookup fails and the reply is never recorded.

**Prevention:** When migrating to `imapflow`, use `mailparser`'s `simpleParser` (already used in `processBounces.ts`) to parse message headers rather than manual regex. `mailparser` handles folded headers and normalizes message IDs. Normalize `messageId` storage at insert time (always strip angle brackets) and normalize the lookup value (always strip angle brackets) to guarantee matching.

---

## Minor Pitfalls

---

### Pitfall 9: `canSendFromAccount` Uses In-Memory Count — Stale After Parallel Sends

**What goes wrong:** `canSendFromAccount` reads `account.currentDailySent` from the value fetched at query time (the `assignedEmailAccount` relation on `campaignLeads`). If multiple campaign leads share the same `emailAccount`, all of them pass the daily limit check using the same stale count fetched at job start. The job then sends N emails from that account before the first `UPDATE emailAccounts SET currentDailySent = currentDailySent + 1` runs, potentially exceeding the daily limit.

**Prevention:** After switching to `sendOutreachEmail` + `incrementAccountStats`, the counter is updated in the DB after each send, but the in-memory `canSendFromAccount` guard still reads the pre-fetch value. Re-fetch account state per send, or maintain a local in-memory counter keyed by `accountId` that increments each time an email is sent within the current job run.

---

### Pitfall 10: Timezone Is Ignored in `calculateNextScheduledAt`

**What goes wrong:** Both the job's local `calculateNextScheduledAt` and the shared module's `calculateNextScheduledAt` use `new Date()` (server local time) without applying the campaign's `timezone` field. Campaigns targeting leads in specific timezones will send emails at the wrong local time for the recipient.

**Prevention:** Use a timezone-aware date library (e.g., `date-fns-tz` or `luxon`, both likely already available as transitive dependencies) to convert the server's `now` into the campaign's configured timezone before checking window boundaries. This is a known gap — the `timezone` parameter is accepted in the schema but unused in the implementation.

---

### Pitfall 11: `processReplies.ts` Exports `connectImap` That Will Be Dead Code After Migration

**What goes wrong:** `processReplies.ts` exports `connectImap` (line 206), which returns the raw `Imap` instance. No other file in the codebase imports this function. After migrating to `imapflow`, this function must be deleted — leaving it creates confusion about which IMAP library is canonical and may cause a developer to use it in new code.

**Prevention:** Delete `connectImap` as part of the migration. Search the codebase for any imports of it before removing.

---

## Phase-Specific Warnings for This Milestone

| Topic | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Switch job to `sendOutreachEmail()` | `recordOutreachEmail` is separate — send succeeds but email not logged | Call both; treat them as a pair |
| Switch job to `sendOutreachEmail()` | `calculateNextScheduledAt` in shared module ignores campaign window | Keep job's version or extend shared module to accept campaign params |
| Migrate `processReplies` to `imapflow` | Mailbox lock not released on error path hangs next run | Always use try/finally around `lock.release()` |
| Migrate `processReplies` to `imapflow` | `{ seen: false }` search vs `['UNSEEN']` — API difference | Follow `processBounces.ts` search pattern exactly |
| A/B variant assignment | `Math.random()` on retry assigns different variant | Use deterministic hash on `leadId + stepId` |
| Deduplication on retry | No unique constraint on `(campaignLeadId, sequenceStepId)` in `outreachEmails` | Add a pre-send check or DB unique constraint |
| Express 5 nested routes | Missing `mergeParams: true` on child routers | Pass `{ mergeParams: true }` on every new `Router()` instance under nested paths |
| Consolidating duplicate functions | `calculateNextScheduledAt` signatures differ | Align signatures before removing the local copy |

---

## Sources

- Direct code analysis: `src/server/jobs/processOutreachSequences.ts`, `src/server/jobs/processReplies.ts`, `src/server/jobs/processBounces.ts`, `src/server/lib/outreach-sender.ts`
- Schema analysis: `src/db/schema.ts` (lines 786–845)
- Known issues: `.planning/codebase/CONCERNS.md`
- Project requirements: `.planning/PROJECT.md`
- `imapflow` async/await pattern: observed in `processBounces.ts` and `src/server/routes/outreach/email-accounts.ts`
- Express 5 `mergeParams` behavior: Express 5 official changelog (HIGH confidence — documented breaking change from Express 4)
- `imap` library event model vs `imapflow` async generator model: HIGH confidence based on both libraries' documented APIs
