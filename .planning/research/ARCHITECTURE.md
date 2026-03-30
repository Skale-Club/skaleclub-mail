# Architecture Patterns

**Domain:** Cold email outreach system — completion pass
**Researched:** 2026-03-30
**Confidence:** HIGH (all patterns derived from direct code inspection, not training assumptions)

---

## Context: What Was Found

Four distinct architectural gaps exist in the outreach module. Each is analyzed with
the concrete pattern to apply, grounded in what the codebase already does elsewhere.

---

## Gap 1: Code Consolidation — Shared Sending Logic

### Current State

`processOutreachSequences.ts` has three private functions that duplicate logic
already exported from `outreach-sender.ts`:

| Duplicate in job | Canonical in outreach-sender.ts |
|---|---|
| `isWithinSendWindow(campaign, now)` | `isWithinSendWindow(campaign, now)` — identical signature |
| `canSendFromAccount(account)` | `canSendFromAccount(account)` — slightly weaker (omits `.status !== 'verified'` check) |
| `sendEmail(account, to, ...)` | `sendOutreachEmail(params)` — superset: handles Outlook, A/B variants, template interpolation, tracking |

The job also duplicates `recordOutreachEmail` inline (`db.insert(outreachEmails)`) and
duplicates stat increment logic instead of calling `incrementAccountStats` and
`incrementCampaignStats`.

### Correct Pattern

**Replace private implementations with imports from the shared module.**

The shared module is the authoritative source. The job's role is orchestration:
fetch pending leads, apply eligibility filters, call the shared module, advance state.

```typescript
// processOutreachSequences.ts — correct import block
import {
    isWithinSendWindow,
    canSendFromAccount,
    sendOutreachEmail,
    recordOutreachEmail,
    updateCampaignLeadProgress,
    incrementAccountStats,
    incrementCampaignStats,
    calculateNextScheduledAt,
    getNextStepForLead,
} from '../lib/outreach-sender'
```

The private `sendEmail`, `isWithinSendWindow`, and `canSendFromAccount` functions in
the job file can then be deleted entirely.

### Why `sendOutreachEmail` is the Right Replacement for `sendEmail`

`sendEmail` in the job only handles SMTP. `sendOutreachEmail` in the shared module:
- Routes Outlook accounts through `sendMessageWithOutlook` automatically
- Handles A/B variant selection from `step.htmlBodyB` / `step.subjectB`
- Returns `{ success, messageId, finalHtml, finalText }` — the job needs to check
  `result.success` before proceeding, rather than catching a thrown error

Call signature difference to account for:

```typescript
// OLD: job private function (throws on SMTP failure)
const { messageId, finalHtml } = await sendEmail(account, lead.email, ...)

// NEW: shared module (returns success flag, never throws for send failures)
const result = await sendOutreachEmail({
    account,
    lead,
    campaign,
    step,
    campaignLeadId: campaignLead.id,
    trackOpens: campaign.trackOpens,
    trackClicks: campaign.trackClicks,
    trackingBaseUrl: process.env.FRONTEND_URL || 'http://localhost:9000',
    abVariant: selectAbVariant(step), // see Gap 3 below
})

if (!result.success) {
    console.error(`[processOutreachSequences] Send failed: ${result.error}`)
    result.errors++
    continue
}
```

### A/B Variant Selection

The job hardcodes `abVariant: null`. The correct pattern reads from the step:

```typescript
function selectAbVariant(step: typeof sequenceSteps.$inferSelect): 'a' | 'b' {
    if (!step.abTestEnabled) return 'a'
    const threshold = step.abTestPercentage ?? 50
    return Math.random() * 100 < threshold ? 'a' : 'b'
}
```

This function belongs in the job file (it is orchestration logic, not send logic), or
optionally exported from `outreach-sender.ts` if other callers need it.

---

## Gap 2: IMAP Polling Job — imapflow Pattern

### Current State

`processReplies.ts` uses the `imap` package (callback-based, event-driven). All other
IMAP code in this codebase uses `imapflow` (promise-based). The `imap` package
remains in `package.json` and `@types/imap` is present, so no install step is needed
for the migration — only `imapflow` must be kept, and the `imap` import removed.

### Canonical Pattern (from processBounces.ts)

`processBounces.ts` is the reference implementation. It demonstrates the complete
imapflow lifecycle as used in this codebase:

```typescript
import { ImapFlow } from 'imapflow'

// Per-account iteration — one connection per account
for (const account of accounts) {
    let client: ImapFlow | null = null

    try {
        client = new ImapFlow({
            host: account.imapHost!,
            port: account.imapPort || 993,
            secure: account.imapSecure !== false,
            auth: {
                user: account.imapUsername!,
                pass: decryptSecret(account.imapPassword!),
            },
            logger: false,     // suppress imapflow's built-in logging
        })

        await client.connect()

        const lock = await client.getMailboxLock('INBOX')

        try {
            // All mailbox operations go inside the lock block
            const uids = await client.search({ unseen: true }, { uid: true })

            for (const uid of uids) {
                const message = await client.fetchOne(uid, { source: true })
                // process message ...
            }
        } finally {
            lock.release()   // ALWAYS release in finally — prevents deadlock
        }
    } catch (error) {
        console.error(`Error processing account ${account.email}:`, error)
        result.errors++
    } finally {
        if (client) {
            try {
                await client.logout()
            } catch {
                // Ignore logout errors — connection may already be dead
            }
        }
    }
}
```

### Key imapflow Concepts for processReplies Migration

**Fetching headers only (not full source):**

The replies job only needs `In-Reply-To` and `References` headers, not the full
message body. imapflow supports this:

```typescript
for await (const message of client.fetch(
    { unseen: true },
    { headers: ['in-reply-to', 'references'] },
    { uid: true }
)) {
    const inReplyTo = message.headers.get('in-reply-to') || null
    const references = message.headers.get('references') || null
    // match against outreach_emails.message_id ...
}
```

`client.fetch()` returns an async iterator. Use `for await...of` rather than the
callback-heavy event emitter pattern from the `imap` library.

**Marking messages as seen after processing:**

```typescript
await client.messageFlagsAdd(uid, ['\\Seen'], { uid: true })
```

This is the same call used in `processBounces.ts` line 380.

**Connection management rules (imapflow-specific):**

1. One `getMailboxLock` at a time per connection — never nest locks
2. Always `lock.release()` in a `finally` block
3. `client.logout()` in a `finally` block — safe to ignore errors from it
4. `logger: false` suppresses verbose output in the job context
5. Do not reuse `ImapFlow` instances across reconnect attempts — create a new instance

**Error handling for transient failures:**

imapflow throws `Error` with descriptive messages for connection failures. The
per-account `try/catch` in the outer loop (shown above) is sufficient — if one
account's connection fails, processing continues for remaining accounts and
`result.errors` is incremented. This matches the pattern in `processBounces.ts`.

There is no reconnect logic in `processBounces.ts` and none is needed here — the
job runs on a cron interval, so the next scheduled invocation provides the retry.

### processReplies Migration Checklist

- Replace `import Imap from 'imap'` with `import { ImapFlow } from 'imapflow'`
- Remove the `Promise`-wrapper anti-pattern (`new Promise((resolve, reject) => { ... imap.connect() })`)
- Replace `connectImap()` exported function (builds old `Imap` instance) — delete or rewrite as an imapflow helper if still needed
- Replace `imap.search(['UNSEEN'], callback)` with `await client.search({ unseen: true }, { uid: true })`
- Replace `imap.fetch(results, { bodies: 'HEADER.FIELDS (IN-REPLY-TO REFERENCES)' })` with `client.fetch(..., { headers: ['in-reply-to', 'references'] })`
- Replace event-based message stream parsing with direct `message.headers.get()`
- Wrap all mailbox operations in `getMailboxLock` / `lock.release()` in finally
- The business logic (`findOutreachEmailByMessageId`, `markAsReplied`) stays unchanged

---

## Gap 3: TypeScript Unused Import Errors

### Current State

`tsconfig.json` has `"noUnusedLocals": true` and `"noUnusedParameters": true`.
There is no `.eslintrc.*` or `eslintConfig` key in `package.json` at the project root —
the lint command (`eslint . --ext ts,tsx`) uses the old-style config lookup but no
config file was found. This means the TypeScript compiler itself (via `tsc --noEmit`)
is the active enforcement mechanism for unused imports.

### How ESLint Auto-Fix Works for This Project

The `@typescript-eslint/no-unused-vars` rule supports `--fix` via ESLint. However,
because there is no ESLint config file at the root, ESLint currently applies no
TypeScript-specific rules — `tsc --noEmit` is what catches the errors.

**ESLint cannot auto-remove unused imports without a rule configured.** The fix
must be done manually (or with editor tooling).

### Correct Pattern: Manual Removal

For each file with unused import errors:

1. Run `tsc --noEmit` to see the exact list of offending symbols
2. Remove only the named import that is unused — do not remove the entire import
   line if other names from the same module are still used
3. If an entire `import` statement is unused, delete the whole line

Example pattern for a typical case:

```typescript
// BEFORE — causes TS2305 or TS6133 (unused)
import { useState, useEffect, useCallback } from 'react'
//                             ^ never referenced

// AFTER
import { useState, useEffect } from 'react'
```

### ESLint Rule That Would Auto-Fix (for future reference)

If an ESLint config is added to the project, the rule to configure is:

```json
{
    "rules": {
        "@typescript-eslint/no-unused-vars": ["error", {
            "vars": "all",
            "args": "after-used",
            "ignoreRestSiblings": true
        }]
    }
}
```

With this rule active, `eslint --fix` will remove unused variable declarations.
**However, ESLint does not remove unused import specifiers automatically — it errors
on them, but the removal must be done by the developer or by an editor integration
(VS Code "Organize Imports", or the `unused-imports` ESLint plugin).**

The `eslint-plugin-unused-imports` package adds a rule (`unused-imports/no-unused-imports`)
that does auto-remove import lines on `--fix`. It is not currently installed.

**For this fix pass:** Manual removal is the correct approach. Do not add new
dependencies or configure ESLint as part of this milestone — that is out of scope
per the project constraints.

### Verification Command

```bash
npx tsc --noEmit 2>&1 | grep "TS6133\|TS6196\|is declared but"
```

This surfaces all unused local / import errors from the TypeScript compiler.

---

## Gap 4: API Client Consistency

### Current State

Two modules both export `apiFetch`:

| File | Class | Token handling | Retry | Timeout |
|---|---|---|---|---|
| `src/lib/api.ts` | `ApiError` | `getSession()` each call | No | 30s (AbortController) |
| `src/lib/api-client.ts` | `ApiClientError` | Token cache + proactive refresh | GET/HEAD once | No explicit timeout |

`api-client.ts` is the more capable implementation:
- Token caching avoids a Supabase round-trip on every request
- Proactive token refresh before expiry (60-second buffer)
- On-401 automatic refresh-and-retry
- GET/HEAD network error retry (250ms delay, once)
- `204 No Content` handled (returns `null` instead of trying to parse empty body)
- `apiRequest` / `apiFetch` separation (callers who need the raw `Response` use `apiRequest`)

`api.ts` is simpler but weaker:
- Calls `supabase.auth.getSession()` on every request (extra async overhead)
- No retry logic
- Aborts after 30 seconds (good for long requests, but hardcoded)
- `fetchWithAuth` utility for raw Response access

### Correct Pattern: Standardize on api-client.ts

The project decision in `PROJECT.md` is: "Use `lib/api-client.ts` across all outreach
pages." This aligns with what `CONVENTIONS.md` documents — `ApiClientError` is the
client used by `useAuth`.

**For new outreach page code and for the `NewInboxPage` fix:**

```typescript
// CORRECT import for outreach pages
import { apiFetch } from '../../lib/api-client'

// WRONG import (what NewInboxPage currently uses)
import { apiFetch } from '../../lib/api'
```

### Migration Rule for This Fix Pass

Only change the import source, not the call sites. Both modules export `apiFetch<T>(path, options)` with compatible signatures for the simple GET/POST cases used in outreach pages:

```typescript
// api.ts signature
apiFetch<T>(path: string, init: ApiFetchOptions): Promise<T>
// where ApiFetchOptions extends RequestInit

// api-client.ts signature
apiFetch<T>(path: string, options: ApiRequestOptions): Promise<T>
// where ApiRequestOptions extends RequestInit
```

Both accept the same `{ method, body }` shape for POST calls. The only behavioral
difference is that `api-client.ts` sets `Content-Type: application/json` only when
`body` is a string (not when it is a FormData or absent), whereas `api.ts` sets it
whenever body is not FormData. For outreach pages sending `JSON.stringify(payload)`,
both behave identically — the switch is safe.

### Error Handling After Switch

After switching to `api-client.ts`, catch blocks must handle `ApiClientError` instead
of `ApiError`:

```typescript
import { apiFetch, ApiClientError } from '../../lib/api-client'

// In catch blocks:
} catch (error) {
    if (error instanceof ApiClientError) {
        console.error('API error:', error.message, 'status:', error.status)
    } else {
        console.error('Unexpected error:', error)
    }
}
```

If existing outreach pages catch `ApiError` by name, those catch blocks need updating.
If they only catch generic `Error` or log the error without type-checking, no change
is needed.

---

## Component Boundaries After Changes

```
processOutreachSequences.ts (orchestration)
    |
    +-- imports --> outreach-sender.ts (send logic, stat helpers)
                        |
                        +-- imports --> nodemailer (SMTP)
                        +-- imports --> outlook.ts (Outlook OAuth)
                        +-- imports --> tracking.ts (pixel/URL injection)
                        +-- imports --> template-variables.ts (interpolation)

processReplies.ts (IMAP polling, after migration)
    |
    +-- imports --> imapflow (replaces imap)
    +-- imports --> crypto.ts (password decrypt)
    +-- internal --> findOutreachEmailByMessageId (unchanged)
    +-- internal --> markAsReplied (unchanged)

src/pages/outreach/* (React pages, after fix)
    |
    +-- imports --> lib/api-client.ts (all outreach pages, uniform)
```

`processBounces.ts` already matches this boundary and serves as the reference for
both the imapflow pattern and the job structure pattern.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Promise-wrapping a callback library alongside async/await

`processReplies.ts` currently wraps the `imap` callback API in a `new Promise(...)` and
then runs async DB calls inside `fetch.once('end', async () => { ... })`. Mixing
`async/await` inside event-callback chains creates silent error swallowing — errors
thrown inside the async callback are not connected to the outer Promise's `reject`.

**Instead:** Use imapflow's native promise/async-iterator API throughout. No
Promise wrapping required.

### Anti-Pattern 2: Duplicating shared module logic in jobs

The `sendEmail` function in `processOutreachSequences.ts` is a reduced copy of
`sendOutreachEmail` in `outreach-sender.ts`. When Outlook support was added to the
shared module, the job did not receive it. Duplication causes silent feature gaps.

**Instead:** Jobs own orchestration (which leads to process, in what order, guard
conditions). Shared modules own mechanics (how to send, how to record, how to
increment stats). The boundary is strict.

### Anti-Pattern 3: Importing from two API clients in the same feature area

Having half the outreach pages use `api.ts` and half use `api-client.ts` means
different retry and error behavior depending on which page the user is on. This
makes debugging inconsistent.

**Instead:** Pick one client per domain area and enforce it consistently. Outreach
pages use `api-client.ts`.

---

## Sources

All findings are based on direct code inspection of:
- `src/server/lib/outreach-sender.ts` — canonical shared module
- `src/server/jobs/processOutreachSequences.ts` — job with duplications
- `src/server/jobs/processBounces.ts` — reference imapflow implementation
- `src/server/jobs/processReplies.ts` — legacy imap implementation to replace
- `src/lib/api.ts` — simpler API client
- `src/lib/api-client.ts` — more capable API client
- `tsconfig.json` — compiler enforcement of unused locals
- `package.json` — dependency inventory and lint command

No external sources consulted. Confidence is HIGH because all architectural
decisions are grounded in existing, working code in the same repository.
