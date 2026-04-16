---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Mail Server Production Readiness (Thunderbird-Ready)
status: planned
stopped_at: Roadmap + CONTEXT + PLANs for phases 10-13 created
last_updated: "2026-04-15T23:00:00.000Z"
last_activity: 2026-04-15
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 4
  completed_plans: 0
  percent: 0
previous_milestone:
  milestone: v1.1
  name: Database Health
  status: completed
  completed_phases: 5
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-15)

**Core value (v1.2):** An end-user can configure `user@skale.club` in Thunderbird / Outlook / Apple Mail and send/receive email reliably from/to the public internet.

**Current focus:** Phase 11 — DNS + Autodiscovery (unblocks everything else)

## Deploy target

**Hetzner VPS** — Docker container via GitHub Actions `.github/workflows/deploy-hetzner.yml`. Caddy reverse-proxies HTTP only; mail ports (25/587/993) are direct TCP from container. **Not Vercel, not Railway.**

## Current Position

Milestone: v1.2
Phase: 11 (DNS + Autodiscovery) — next to start
Status: Planning complete, execution pending

Progress: [░░░░░░░░░░] 0% of v1.2

### v1.2 Phase List

- [ ] **Phase 10:** TLS Certificates for Mail Ports (TLS-01, TLS-02, TLS-03)
- [ ] **Phase 11:** DNS + Autodiscovery (DNS-01, DNS-02, DISCO-01) ← START HERE
- [ ] **Phase 12:** DKIM Signing + Mail-Auth (DKIM-01, AUTH-01, AUTH-02)
- [ ] **Phase 13:** MX Hardening + Port 25 Unblock (OPS-01, MX-01, MX-02)

### Dependency graph

```
Phase 11 (DNS) ──┬──► Phase 10 (TLS: Let's Encrypt needs A record)
                 │
                 └──► Phase 12 (DKIM needs public key in DNS)
                                    │
                                    └──► Phase 13 (hardening on working stack)
```

## Completed milestones

### v1.1 — Database Health (2026-04-01)
- [x] **Phase 05:** RLS & Migration Safety
- [x] **Phase 06:** Index Foundation
- [x] **Phase 07:** Pagination
- [x] **Phase 08:** Query Optimization
- [x] **Phase 09:** Schema Hardening

### v1.1 mid-cycle work — Mail Server Core (2026-04-15, commit `8316a86`)
Merged outside GSD phase structure; effectively Phase 9.5:
- Full IMAP server rewrite (RFC 3501 + STARTTLS + IDLE + LITERAL+)
- SASL PLAIN/LOGIN
- UID operations correctness (FETCH/STORE/COPY/SEARCH)
- Atomic UID allocation (`allocateNextUid`)
- Folder count maintenance (`recomputeFolderCounts`)
- SMTP submission with TLS/rate-limit/events
- MX receiver (`mx-server.ts`) on port 25
- Autodiscovery routes (Thunderbird XML, Outlook XML, Apple mobileconfig)
- Settings UI dynamic connection-info card
- Migration 018 (`uid_validity`, `uid_next` columns)
- Graceful shutdown for all mail servers

## Accumulated Context

### Decisions (v1.2)

- **Hetzner over Vercel for mail**: Vercel Functions are HTTP-only serverless; mail servers need long-lived TCP. Hetzner VPS + Docker + GitHub Actions already in place.
- **mx-server.ts kept, smtp-inbound.ts removed during merge**: mine has TLS + UID allocation + folder-count recompute that the upstream `smtp-inbound.ts` lacked.
- **Phase 11 first**: DNS records are prerequisite for both Let's Encrypt HTTP-01 (Phase 10) and DKIM public key publishing (Phase 12). Sequential dependency.
- **Let's Encrypt via certbot, not Caddy**: Caddy already has its own certs but in a Caddy-specific layout. Dedicated certbot keeps standard path `/etc/letsencrypt/live/...` and clear renewal hook.
- **mailauth over custom SPF/DKIM/DMARC code**: one-call verification; actively maintained; used by Postal itself.
- **DKIM key not rotated automatically**: admin-managed; one key per domain lives in `domains.dkim_private_key`.

### Pending Todos

- Phase 11 execution (DNS records at registrar, autoconfig CNAME, verify endpoint)
- Phase 10 execution (certbot install, volume mount, deploy workflow update)
- Phase 12 execution (nodemailer DKIM wiring, mailauth inbound, port25 tester)
- Phase 13 execution (Hetzner ticket, mx-guard.ts implementation)

### Blockers/Concerns

- **DNS provider unknown** — need to confirm where `skale.club` is managed before Phase 11 can start
- **Hetzner port 25 approval timing** — 24-48h; don't block Phase 10-12 on this
- **Supabase migration history drift** (015-017 local/remote mismatch) — carried from v1.1; unrelated to v1.2
- **ESLint config missing** — carried from pre-v1.1; unrelated

## Session Continuity

Last session: 2026-04-15T23:00:00Z
Stopped at: v1.2 roadmap + phase plans authored; ready for execution
Resume file: None
Next action: Start Phase 11 (DNS + Autodiscovery) — see `.planning/phases/11-dns-autodiscovery/11-01-PLAN.md`
