# Technology Stack — Cold Email Outreach Patterns

**Project:** SkaleClub Mail — Outreach Module Completion
**Researched:** 2026-03-30
**Scope:** Stack dimension for fixing/completing existing outreach module
**Overall confidence:** HIGH (based on codebase evidence + training knowledge; web sources unavailable)

---

## 1. imapflow vs imap: Current Standard

### Verdict: imapflow is the current standard. The `imap` package is unmaintained.

**Evidence from this codebase:**
- `imapflow` (^1.2.16) — installed, used in `processBounces.ts` and `email-accounts.ts` (verify endpoint)
- `imap` (^0.8.19) — installed, used **only** in `processReplies.ts`
- The codebase itself already made this architectural decision: all new IMAP code uses `imapflow`

**Why imapflow won:**
- Async/await API — no callback pyramid. The `imap` package requires wrapping everything in `Promise` constructors and managing event streams manually (the existing `processReplies.ts` is 130+ lines of boilerplate for what imapflow does in ~30).
- Built by the same author (Andris Reinman) who wrote nodemailer and `mailparser` — consistent ecosystem
- Active maintenance; `imap` (mscdex) has not received meaningful updates since ~2019
- `ImapFlow` supports `for await...of` iteration over messages — dramatically cleaner inbox polling
- Handles connection reuse and idle IMAP NOTIFY natively

**Migration pattern from `imap` to `imapflow`** (confidence: HIGH — derived from the existing `processBounces.ts` pattern already in this repo):

```
imap pattern (processReplies.ts today):
  new Imap({}) → connect() → once('ready') → openBox() → search() → fetch() → events

imapflow equivalent:
  new ImapFlow({ host, port, secure, auth, logger: false })
  await client.connect()
  await client.mailboxOpen('INBOX')
  for await (const msg of client.fetch('1:*', { envelope: true, bodyStructure: true })) { ... }
  await client.logout()
```

The key structural change: replace the callback-based `imap.once('ready', ...)` wrapper with a straightforward `async` function. The `processAccountInbox` function in `processReplies.ts` goes from a `new Promise((resolve, reject) => {...})` wrapping 4 nested callbacks down to a linear async function.

**For `processReplies.ts` specifically:** The job needs `UNSEEN` messages and their `In-Reply-To` / `References` headers. imapflow handles this with:
```typescript
await client.mailboxOpen('INBOX')
for await (const msg of client.fetch({ seen: false }, { envelope: true, headers: ['in-reply-to', 'references'] })) {
    const inReplyTo = msg.headers.get('in-reply-to')
    const references = msg.headers.get('references')
    // ...
}
```

**Confidence:** HIGH — the codebase has both libraries installed and the migration target pattern (`processBounces.ts`) already exists as a reference.

---

## 2. nodemailer Patterns for Outreach

### Current State in This Codebase

`outreach-sender.ts` creates a **new transporter per send call** via `createSmtpTransporter()`. This is correct for outreach (each account has different credentials), but has no rate limiting, no retry, and no per-account throttling beyond the daily limit counter in the DB.

### Pattern: Transporter Creation

**Recommended: create once per account, reuse within a job run.** The current pattern in `processOutreachSequences.ts` creates a new SMTP connection for every email. For a job processing 50 leads, this means 50 TCP handshakes per run.

```typescript
// Better: cache transporters for the duration of a job run
const transporterCache = new Map<string, nodemailer.Transporter>()

function getTransporter(account: EmailAccount): nodemailer.Transporter {
    if (!transporterCache.has(account.id)) {
        transporterCache.set(account.id, createSmtpTransporter(account))
    }
    return transporterCache.get(account.id)!
}
```

This is a process-local cache (lives for the job run, not the process lifetime), so stale connections are not a concern. The transporter uses connection pooling internally when the same instance is reused.

**Confidence:** HIGH — nodemailer docs explicitly recommend connection reuse via `pool: true` or transporter reuse.

### Pattern: Per-Account Rate Limiting (Time-Based Throttle)

The current code only enforces a daily limit (counter in DB). For cold email, ESP-imposed per-minute limits (e.g., Gmail: ~500/day at ~1/sec sustained, Google Workspace: varies) require a delay between sends from the same account.

The correct pattern for this codebase — given it already uses cron-based polling every 5 minutes — is **scheduling-side throttling**: rather than sleeping inside the job, schedule fewer leads per account per run.

```typescript
// Inside the job loop: track sends per account in this run
const accountSendsThisRun = new Map<string, number>()
const MAX_SENDS_PER_ACCOUNT_PER_RUN = 10 // configurable per account

for (const campaignLead of pendingLeads) {
    const acctSends = accountSendsThisRun.get(emailAccount.id) ?? 0
    if (acctSends >= MAX_SENDS_PER_ACCOUNT_PER_RUN) {
        continue // will be picked up next run in 5 minutes
    }
    // ... send ...
    accountSendsThisRun.set(emailAccount.id, acctSends + 1)
}
```

This is preferred over `await sleep(1000)` inside the loop because:
- The cron job is fire-and-forget; sleeping blocks the job for its entire duration
- The 5-minute cron interval naturally provides time between batches
- No external queue dependency needed

**Confidence:** MEDIUM — derived from codebase pattern + general outreach best practice; no official nodemailer doc covers per-account throttle.

### Pattern: Retry on Transient Errors

The current `sendEmail` in `processOutreachSequences.ts` has no retry. SMTP connections occasionally fail with transient errors (421, 450, connection reset).

Standard pattern is a simple exponential backoff retry at the transporter level. nodemailer itself does not have built-in retry, but the pattern is:

```typescript
async function sendWithRetry(
    transporter: nodemailer.Transporter,
    mailOptions: nodemailer.SendMailOptions,
    maxAttempts = 3
): Promise<nodemailer.SentMessageInfo> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await transporter.sendMail(mailOptions)
        } catch (err) {
            const isTransient = isTransientSmtpError(err)
            if (!isTransient || attempt === maxAttempts) throw err
            await new Promise(r => setTimeout(r, 1000 * attempt))
        }
    }
    throw new Error('unreachable')
}

function isTransientSmtpError(err: unknown): boolean {
    if (!(err instanceof Error)) return false
    // SMTP 4xx = transient, 5xx = permanent
    return /^4\d\d/.test(err.message) || err.message.includes('ECONNRESET')
}
```

**Confidence:** MEDIUM — well-established pattern, not nodemailer-specific.

### Pattern: Outlook vs SMTP Routing

`outreach-sender.ts` already implements the correct pattern: check `account.provider === 'outlook'` and route to `sendMessageWithOutlook()`, otherwise use SMTP. The bug is that `processOutreachSequences.ts` duplicates `sendEmail()` without this branch, which silently drops Outlook account sends (they appear to succeed via SMTP with bad credentials).

The fix is straightforward: delete the local `sendEmail()` function from the job and import `sendOutreachEmail()` from `outreach-sender.ts`. This is already identified in `PROJECT.md`.

**Confidence:** HIGH — the correct implementation exists; the gap is non-use.

---

## 3. A/B Testing Implementation Pattern for Email Sequences

### Current Schema

The `sequenceSteps` table has:
- `abTestEnabled: boolean` (default false)
- `abTestPercentage: integer` (default 50 — percentage for variant A)
- `subjectB`, `htmlBodyB`, `plainBodyB` — variant B content fields
- `outreachEmails.abVariant: text` — records which variant was sent

The `outreach-sender.ts` already handles A/B selection: it accepts `abVariant?: 'a' | 'b'` and selects the correct subject/body fields. The bug is in `processOutreachSequences.ts`, which always passes `abVariant: null`.

### Correct A/B Selection Pattern

Standard split testing for email sequences uses deterministic assignment: assign the variant once per lead and keep it consistent across all steps (or randomize per step — the simpler approach). This codebase has no "lead variant memory" in the schema, so per-send randomization is appropriate.

```typescript
function selectAbVariant(step: SequenceStep): 'a' | 'b' {
    if (!step.abTestEnabled) return 'a'
    const threshold = step.abTestPercentage ?? 50 // % for variant A
    return Math.random() * 100 < threshold ? 'a' : 'b'
}
```

This is the minimum viable implementation matching the existing schema fields. `abTestPercentage` represents "percentage assigned to variant A" (per the schema comment), so threshold < 50 = more B sends.

**Deterministic alternative** (if reproducibility matters — not required for this fix pass):
```typescript
function selectAbVariantDeterministic(step: SequenceStep, leadId: string): 'a' | 'b' {
    if (!step.abTestEnabled) return 'a'
    const hash = leadId.charCodeAt(0) + leadId.charCodeAt(leadId.length - 1)
    const threshold = step.abTestPercentage ?? 50
    return (hash % 100) < threshold ? 'a' : 'b'
}
```

Deterministic variant assignment means a lead always gets the same variant for the same step. Useful for A/B result integrity but not required for the current fix pass.

**Integration point:** In `processOutreachSequences.ts`, replace the current hardcoded `abVariant: null` in the `outreachEmails.insert` with the result of `selectAbVariant(currentStep)`, and pass the same value to `sendOutreachEmail()`.

**Confidence:** HIGH — the schema fields are clearly defined; the pattern follows standard split testing.

---

## 4. Background Job Patterns: Cron vs Queue

### Current Architecture

The project uses `node-cron` (^4.2.1) with a cron-based polling pattern:
- `processOutreachSequences` — every 5 minutes
- `processReplies` — every 15 minutes
- `processBounces` — every 30 minutes
- `processQueue`, `processHeld` — every 1 and 5 minutes
- Daily jobs (cleanup, reset limits) — midnight/3am

All jobs follow the same structure: query DB for pending work, process in a for-loop, catch errors per item, return a result count.

### Assessment: Cron-Based Polling is Correct for This Project

**Cron is appropriate when:**
- Work volumes are moderate (hundreds to low thousands per run)
- The job is already database-polling (you need a DB query regardless)
- The platform is a single Node.js process (Railway, Docker single container)
- No external queue infrastructure is available or wanted

**Queue-based (BullMQ, pg-boss) is better when:**
- High concurrency is required (multiple workers processing in parallel)
- Job fan-out at high volumes (10K+ sends/hour per instance)
- Reliable at-least-once delivery with dead-letter queues is critical
- Fine-grained per-job retry with exponential backoff is needed

**For this project:** The constraint is `No new dependencies` (PROJECT.md). The current cron architecture is sound for the scale. The only meaningful improvement within the existing pattern is **concurrency guard** — preventing overlapping cron runs if a job takes longer than its interval.

### Concurrency Guard Pattern (fits existing cron architecture)

The current jobs have no guard against overlapping execution. If `processOutreachSequences` takes >5 minutes (slow DB or many leads), two instances run simultaneously and both try to send the same emails.

```typescript
let isProcessingOutreach = false

cron.schedule('*/5 * * * *', async () => {
    if (isProcessingOutreach) {
        console.warn('[jobs] processOutreachSequences: previous run still active, skipping')
        return
    }
    isProcessingOutreach = true
    try {
        await processOutreachSequences()
    } catch (err) {
        console.error('[jobs] processOutreachSequences failed:', err)
    } finally {
        isProcessingOutreach = false
    }
})
```

This is a process-local lock (sufficient for single-process deployment). For multi-instance deployments (multiple Railway replicas), a DB-level advisory lock or Redis lock would be needed, but that is out of scope per PROJECT.md.

**Confidence:** HIGH — this is a well-known Node.js pattern; the codebase already shows single-process deployment assumptions.

### Why Not Migrate to BullMQ/pg-boss

- **BullMQ** requires Redis — not in the current stack
- **pg-boss** would work with existing Supabase PostgreSQL but adds a new dependency (blocked by PROJECT.md constraint)
- The polling pattern with a 5-minute interval and per-account send caps already provides sufficient natural throttling for the scale this system targets
- The fix pass is about correctness, not performance at scale

**Confidence:** HIGH — constrained by explicit PROJECT.md decision "No new dependencies."

---

## Summary of Decisions for This Milestone

| Topic | Decision | Rationale |
|-------|----------|-----------|
| IMAP library | Use `imapflow` exclusively | Already the codebase standard; `imap` is unmaintained; migration pattern exists in `processBounces.ts` |
| Transporter creation | Cache per account within a job run | Reduces SMTP handshake overhead; safe for cron pattern |
| Rate limiting | Per-account cap per job run (in-memory counter) | No new deps; natural 5-min throttle from cron interval |
| Retry | Simple 3-attempt backoff for transient SMTP errors | Standard pattern; no new deps |
| Outlook routing | Use `sendOutreachEmail()` from `outreach-sender.ts` | Already implemented; job must stop duplicating it |
| A/B variant | `Math.random()` against `abTestPercentage` threshold | Matches schema; simplest correct implementation |
| Job architecture | Keep `node-cron` polling; add concurrency guard | No new deps; correct for single-process deployment |

---

## Installed Package Versions (from package.json)

| Package | Version | Status |
|---------|---------|--------|
| `imapflow` | ^1.2.16 | Active, maintained |
| `imap` | ^0.8.19 | Installed but should be removed after migration |
| `nodemailer` | ^6.9.12 | Active, current |
| `node-cron` | ^4.2.1 | Active, current |
| `mailparser` | ^3.6.9 | Active, current |

The `imap` package (along with `@types/imap`) can be removed from `package.json` once `processReplies.ts` is migrated to `imapflow`. This reduces the dependency surface and removes the `tlsOptions: { rejectUnauthorized: false }` pattern that the old library required.

---

## Sources

- Codebase evidence: `src/server/jobs/processBounces.ts` (imapflow usage reference)
- Codebase evidence: `src/server/routes/outreach/email-accounts.ts` (imapflow connect/logout pattern)
- Codebase evidence: `src/server/jobs/processReplies.ts` (current imap pattern to migrate)
- Codebase evidence: `src/server/lib/outreach-sender.ts` (correct SMTP + Outlook routing)
- Codebase evidence: `src/server/jobs/processOutreachSequences.ts` (gaps: no Outlook, no A/B, duplicate logic)
- Codebase evidence: `src/db/schema.ts` (A/B test schema fields)
- Codebase evidence: `src/server/jobs/index.ts` (cron schedule architecture)
- `.planning/PROJECT.md` (constraints: no new dependencies, existing stack only)
- Training knowledge: nodemailer transporter reuse, SMTP error codes, split-test patterns (MEDIUM confidence where not verified against live docs)
