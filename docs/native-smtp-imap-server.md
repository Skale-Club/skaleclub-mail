# Native SMTP + IMAP Server — Implementation Complete

## What Was Built

Skale Club Mail now has its own native SMTP and IMAP servers, making it a full email provider like Gmail. Users can connect Thunderbird (or any email client) directly.

## New Files

| File | Purpose |
|------|---------|
| `src/server/smtp-server.ts` | SMTP submission server (port 2587/587) |
| `src/server/imap-server.ts` | IMAP4rev1 server (port 2993/993) |
| `src/server/routes/native-mailboxes.ts` | REST API for managing native accounts |
| `src/db/schema.ts` (modified) | Added nativeMailboxes DB table |
| `src/server/index.ts` (modified) | Starts SMTP + IMAP servers on boot |
| `.env.example` (modified) | Added MAIL_HOST, SMTP_SUBMISSION_PORT, IMAP_PORT |

## Architecture

```
Thunderbird → SMTP:2587 → [Our SMTP Server] → DB (mailMessages)
                               ↓ external recipients
                           Nodemailer relay → internet

Thunderbird ← IMAP:2993 ← [Our IMAP Server] ← reads DB
```

Native account data flows through the existing `mailboxes` / `mailFolders` / `mailMessages` tables — so the web UI and API work automatically.

## Verification Results

| Check | Result |
|-------|--------|
| TypeScript compilation | ✅ 0 errors |
| SMTP port 2587 | ✅ Listening |
| IMAP port 2993 | ✅ Listening |
| DB schema pushed | ✅ native_mailboxes table created |

## Usage: Create a Native Account

```bash
# 1. Create a native mailbox via the API
curl -X POST http://localhost:9001/api/native-mailboxes \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@yourdomain.com",
    "password": "SecurePass123",
    "displayName": "Alice"
  }'

# 2. Get server connection info
curl http://localhost:9001/api/native-mailboxes/server-info \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Thunderbird Setup

After creating a native mailbox, configure Thunderbird:

### Incoming (IMAP)

| Setting | Value |
|---------|-------|
| Server | `localhost` (or your server IP) |
| Port | `2993` (dev) / `993` (prod) |
| Connection security | None (dev) / SSL/TLS (prod) |
| Username | `alice@yourdomain.com` |
| Password | your chosen password |

### Outgoing (SMTP)

| Setting | Value |
|---------|-------|
| Server | `localhost` (or your server IP) |
| Port | `2587` (dev) / `587` (prod) |
| Connection security | None (dev) / STARTTLS (prod) |
| Username | `alice@yourdomain.com` |
| Password | same password |

## For Production Deployment

Add to `.env`:

```env
MAIL_HOST=mail.yourdomain.com
MAIL_DOMAIN=yourdomain.com
SMTP_SUBMISSION_PORT=587
IMAP_PORT=993
MAIL_TLS_CERT_PATH=/etc/letsencrypt/live/mail.yourdomain.com/fullchain.pem
MAIL_TLS_KEY_PATH=/etc/letsencrypt/live/mail.yourdomain.com/privkey.pem
```

1. Add MX record: `yourdomain.com` → `mail.yourdomain.com`
2. Open firewall ports `587` and `993`
3. Add TLS support in `smtp-server.ts` and `imap-server.ts` using the cert paths

## IMAP Commands Supported

`CAPABILITY`, `LOGIN`, `LIST`, `LSUB`, `STATUS`, `SELECT`, `EXAMINE`, `CREATE`, `DELETE`, `FETCH`, `STORE`, `EXPUNGE`, `SEARCH`, `APPEND`, `COPY`, `UID`, `IDLE`, `NOOP`, `LOGOUT`
