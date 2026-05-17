---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: — Outreach Hardening)
status: executing
stopped_at: Completed 15-01-PLAN.md (CampaignDetailPage skeleton + Overview tab + new-campaign redirect)
last_updated: "2026-05-17T14:15:51.432Z"
progress:
  total_phases: 9
  completed_phases: 6
  total_plans: 20
  completed_plans: 18
  percent: 75
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-15)

**Core value (v1.2):** An end-user can configure `user@skale.club` in Thunderbird / Outlook / Apple Mail and send/receive email reliably from/to the public internet.

## Deploy target

**Hetzner VPS** — Docker container via GitHub Actions `.github/workflows/deploy-hetzner.yml`. Caddy reverse-proxies HTTP only; mail ports (25/587/993) are direct TCP from container. **Not Vercel, not Railway.**

## Current Position

Phase: 15 (campaign-detail-page) — EXECUTING
Plan: 2 of 3
Milestone: v1.2
All 4 phase codebases merged (commit `3b2cc41`).
Status: Ready to execute

**Resume point:** See `.planning/HANDOFF.md` and `.planning/OPERATOR-CHECKLIST.md`.

Progress: [███████░░░] 75% (code done, ops pending)

### v1.2 Phase Status

| Phase | Code | Ops | Notes |
|---|---|---|---|
| 10 TLS certs | ✅ merged | ⏳ certbot install on host + docker restart | Deploy wiring in `.github/workflows/deploy-hetzner.yml` ready |
| 11 DNS + autoconfig | ✅ merged | ✅ **DNS records already published** | Verified: `skale.club` is `verification_status=verified` in DB with spf/dkim/dmarc/mx all verified |
| 12 DKIM + mailauth | ✅ merged | — (no ops) | Active on next deploy; `src/server/lib/dkim.ts`, `mail-auth.ts`; wired into `smtp-server.ts` and `mx-server.ts` |
| 13 MX hardening | ✅ merged | ⏳ Hetzner ticket for port 25 unblock | `src/server/lib/mx-guard.ts` with rate-limit/DNSBL/greylist wired into `mx-server.ts` |

## Completed milestones

### v1.1 — Database Health (2026-04-01)

- [x] Phase 05: RLS & Migration Safety
- [x] Phase 06: Index Foundation
- [x] Phase 07: Pagination
- [x] Phase 08: Query Optimization
- [x] Phase 09: Schema Hardening

### v1.1 mid-cycle — Mail Server Core (2026-04-15, commit `8316a86`)

Full IMAP/SMTP/MX stack, SASL PLAIN/LOGIN, UID ops, autodiscovery routes, UI card, migration 018.

### v1.2 code (2026-04-15, commit `3b2cc41`)

- TLS deploy wiring (volume mount + env vars)
- DKIM signing in relayMessage via nodemailer `dkim` option
- mailauth SPF/DKIM/DMARC verification in MX receiver
- MX hardening (rate-limit, DNSBL, greylist, header validators)
- `scripts/dns-checklist.ts` helper
- `.planning/OPERATOR-CHECKLIST.md` for remaining manual ops

## Pending next actions (in order)

1. **Install certbot on Hetzner host** (one-time, ~5 min). See `.planning/OPERATOR-CHECKLIST.md` §2.
2. **Open Hetzner ticket** requesting port 25 unblock. See `.planning/OPERATOR-CHECKLIST.md` §3. Wait 24-48h.
3. **End-to-end Thunderbird test** with `user@skale.club`. See `.planning/OPERATOR-CHECKLIST.md` §4.
4. **48h observability** of MX logs for false positives (`.planning/OPERATOR-CHECKLIST.md` §5).
5. **Optional — promote DMARC policy** from `p=none` to `p=quarantine` after 1-2 weeks clean (`.planning/OPERATOR-CHECKLIST.md` §6).

## Accumulated Context

### Roadmap Evolution

- 2026-05-16: Phase 14 added — **Outreach P0 fixes** (numbered 14 to follow v1.2 phases 10-13; effectively kicks off informal milestone v1.3 "Outreach Hardening"). Driven by deep audit at `.planning/debug/outreach-system-deep-audit.md` (10 P0 / 20 P1 / 19 P2 findings).

### Decisions (v1.3 — Outreach Hardening)

- **(15-01) Campaign detail tabs as component state, not nested wouter routes**: preserves `/outreach/campaigns/:id` as a stable bookmarkable URL; skips installing the shadcn Tabs primitive since `src/components/ui/` doesn't have one. CONTEXT.md §66 authorises the fallback.
- **(15-01) Stub-then-fill pattern for parallel waves**: `CampaignDetailPage.tsx` imports default-exported placeholder tab children (`LeadsTab`, `SequenceTab`, `StatsTab`) so plans 15-02 and 15-03 can overwrite entire tab files in parallel without touching the parent page or `main.tsx`.
- **(15-01) queryKey conventions for parallel tabs**: `['campaign', orgId, id]` for the detail fetch; `['campaign-stats', orgId, campaignId]` for OverviewTab stats. Plan 15-03's Stats tab should use a distinct key (e.g. `['campaign-stats-detail', ...]`) to avoid invalidation fights with Overview.

### Decisions (v1.2)

- **Hetzner over Vercel for mail**: Vercel Functions are HTTP-only serverless; mail servers need long-lived TCP. Hetzner VPS + Docker + GitHub Actions already in place.
- **mx-server.ts kept, smtp-inbound.ts removed during merge**: mine has TLS + UID allocation + folder-count recompute.
- **Let's Encrypt via certbot, not Caddy**: Caddy has its own certs but in Caddy-specific layout. Dedicated certbot keeps standard path `/etc/letsencrypt/live/...` and clear renewal hook via `docker restart`.
- **mailauth over custom verification code**: one-call SPF/DKIM/DMARC/ARC verification; actively maintained; used by Postal itself.
- **DKIM signing ONLY in relayMessage (not outreach-sender)**: outreach-sender uses user's own SMTP (Gmail/Outlook) which signs with their own DKIM — re-signing with ours would invalidate.
- **DMARC reject downgraded to quarantine in dev**: `hasMailTLS()=false` → `verdict: 'reject' → 'quarantine'` so local testing with spoofed From isn't blocked.
- **Greylist in-memory Map, not DB**: acceptable for single-container deploy; resets on restart re-greylists everyone for 5min (acceptable trade-off).

### Blockers/Concerns

- **Hetzner port 25 approval timing** — 24-48h SLA; don't block parallel work
- **Supabase migration history drift** (015-017 local/remote mismatch) — carried from v1.1
- **ESLint config missing** — pre-existing; not blocking

## Session Continuity

Last session: 2026-05-17T14:15:51.425Z
Stopped at: Completed 15-01-PLAN.md (CampaignDetailPage skeleton + Overview tab + new-campaign redirect)
Resume file: None
Next action: execute `.planning/OPERATOR-CHECKLIST.md` section 2 (install certbot on Hetzner) — unblocks Thunderbird TLS connection
