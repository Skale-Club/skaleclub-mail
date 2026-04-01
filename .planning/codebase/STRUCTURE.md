# Codebase Structure

**Analysis Date:** 2026-03-31

## Top-Level Layout

```
skaleclub-mail/
├── src/                    # All application source code (frontend + backend)
├── supabase/migrations/    # SQL migration files (RLS policies, schema reconciliation)
├── scripts/                # Dev/ops utility scripts
├── public/                 # Static assets
├── api/                    # Vercel serverless entry point (api/index.js)
├── dist/                   # Build output (dist/client, dist/server)
├── drizzle/                # Drizzle Kit generated migration files
├── docs/                   # Documentation
├── plans/                  # Planning artifacts
├── .planning/              # GSD planning documents
├── CLAUDE.md               # Project instructions for AI agents
├── package.json            # Dependencies, scripts
├── tsconfig.json           # Frontend TypeScript config (excludes server/)
├── tsconfig.server.json    # Backend TypeScript config
├── tsconfig.node.json      # Node/Vite config
├── vite.config.ts          # Vite build config + dev proxy
├── drizzle.config.ts       # Drizzle Kit config
├── tailwind.config.ts      # Tailwind theme + shadcn CSS vars
├── postcss.config.js       # PostCSS (autoprefixer + tailwindcss)
├── components.json         # shadcn/ui config
├── Dockerfile              # Docker build
├── docker-compose.yml      # Docker Compose config
├── .env.example            # Environment variable template
├── index.html              # SPA entry HTML
└── README.md               # Project readme
```

## Source Code Organization

```
src/
├── main.tsx                    # React entry point — route tree, context providers, role guards
├── index.css                   # Tailwind base styles + shadcn CSS variables
├── vite-env.d.ts               # Vite type declarations
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (generated, kebab-case)
│   │   ├── Badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── ConfirmDialog.tsx
│   │   ├── Dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── progress.tsx
│   │   ├── Skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── Table.tsx
│   │   ├── Toast.tsx
│   │   └── toaster.tsx
│   ├── admin/
│   │   ├── AdminLayout.tsx      # Admin sidebar + header shell
│   │   └── org-tabs/            # Tab components for org detail page
│   ├── mail/
│   │   ├── AccountSwitcher.tsx  # Multi-account switcher dropdown
│   │   ├── AddAccountDialog.tsx # Add new mail account dialog
│   │   ├── ComposeDialog.tsx    # Email compose overlay (lazy-loaded)
│   │   ├── ContactAutocomplete.tsx
│   │   ├── EmailDetailView.tsx  # Single email detail
│   │   ├── EmailHtmlViewer.tsx  # HTML email renderer (light/dark toggle)
│   │   ├── EmailList.tsx        # Email list with infinite scroll
│   │   ├── EmailMessageHeader.tsx
│   │   ├── EmailParts.tsx       # Email part components (from, subject, etc.)
│   │   ├── EmailThread.tsx      # Threaded email conversation
│   │   ├── KeyboardShortcutsHelp.tsx
│   │   ├── MailLayout.tsx       # Mail sidebar + content shell
│   │   ├── NotificationBell.tsx # Real-time notification bell
│   │   ├── ResizablePanels.tsx  # Two-panel resizable layout
│   │   └── RichTextEditor.tsx   # WYSIWYG editor (react-quill-new)
│   ├── outreach/
│   │   └── OutreachLayout.tsx   # Outreach section shell
│   ├── AppLogo.tsx              # Dynamic app logo (branding-aware)
│   ├── DeployFooter.tsx         # Deploy version footer
│   ├── mode-toggle.tsx          # Dark/light/system theme toggle
│   └── theme-provider.tsx       # ThemeContext provider
│
├── db/
│   ├── index.ts                 # Drizzle client init, connection pool, health checks, retry
│   └── schema.ts                # ALL tables, enums, relations, Zod schemas, types (1250+ lines)
│
├── hooks/
│   ├── useApiError.ts           # Maps ApiClientError codes to user messages
│   ├── useAuth.tsx              # AuthContext — Supabase session, user, isAdmin
│   ├── useCompose.tsx           # ComposeContext — compose overlay state
│   ├── useInfiniteScroll.ts     # Intersection observer for infinite scroll
│   ├── useIsMobile.ts           # Responsive breakpoint detection
│   ├── useKeyboardShortcuts.ts  # Global keyboard shortcut registration
│   ├── useMail.ts               # Mail API queries (messages, threads)
│   ├── useMailbox.tsx           # MailboxContext — mailbox selection state
│   ├── useMultiSession.tsx      # MultiSessionContext — multi-account management
│   ├── useNotifications.ts      # Notification polling and state
│   └── useOrganization.tsx      # OrganizationContext — org selection for outreach
│
├── lib/
│   ├── api-client.ts            # apiFetch() — authenticated HTTP client with token refresh
│   ├── api.ts                   # Legacy API helpers
│   ├── branding.ts              # useBranding() hook — fetches system branding config
│   ├── constants.ts             # Shared constants
│   ├── crypto.ts                # Client-side crypto utilities
│   ├── email-threading.ts       # Email thread grouping logic
│   ├── keyboard-shortcuts.ts    # Keyboard shortcut definitions
│   ├── mail-api.ts              # Mail-specific API functions
│   ├── mock-data.ts             # Development mock data
│   ├── session-store.ts         # localStorage session storage for multi-account
│   ├── supabase.ts              # Supabase browser client init
│   └── utils.ts                 # cn() Tailwind class merger, other utilities
│
├── pages/
│   ├── Login.tsx                # Login page
│   ├── Dashboard.tsx            # Legacy dashboard (may redirect)
│   ├── admin/
│   │   ├── AdminDashboard.tsx   # Admin overview with stats
│   │   ├── AdminsPage.tsx       # Platform admin management
│   │   ├── BrandingPage.tsx     # System branding configuration
│   │   ├── CredentialsPage.tsx  # SMTP/API credential management
│   │   ├── DomainsPage.tsx      # Domain verification management
│   │   ├── helpers.ts           # Admin page helper functions
│   │   ├── MessagesPage.tsx     # Platform message log viewer
│   │   ├── OrganizationDetailPage.tsx  # Single org detail with tabs
│   │   ├── OrganizationsPage.tsx       # Org list
│   │   ├── RoutesPage.tsx      # Email routing configuration
│   │   └── WebhooksPage.tsx    # Webhook management
│   ├── mail/
│   │   ├── ArchivePage.tsx
│   │   ├── ComposePage.tsx
│   │   ├── ContactsPage.tsx
│   │   ├── DraftsPage.tsx
│   │   ├── EmailDetailPage.tsx
│   │   ├── InboxPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── SentPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── SpamPage.tsx
│   │   ├── StarredPage.tsx
│   │   └── TrashPage.tsx
│   └── outreach/
│       ├── inboxes/             # Inbox sub-pages
│       │   └── NewInboxPage.tsx
│       ├── sequences/           # Sequence sub-pages
│       │   └── NewSequencePage.tsx
│       ├── AnalyticsPage.tsx
│       ├── CampaignsPage.tsx
│       ├── InboxesPage.tsx
│       ├── LeadsPage.tsx
│       ├── OutreachDashboard.tsx
│       ├── SequencesPage.tsx
│       └── SettingsPage.tsx
│
└── server/
    ├── index.ts                 # Express entry — middleware, auth, route mounts, static serving
    ├── imap-server.ts           # Native IMAP server (RFC 3501, raw TCP)
    ├── smtp-inbound.ts          # Inbound SMTP server (port 25, MX delivery)
    ├── smtp-server.ts           # Outbound SMTP submission (port 2587, auth required)
    ├── jobs.ts                  # Mail sync worker (interval-based, separate from cron)
    ├── jobs/
    │   ├── index.ts             # Cron scheduler — registers all 7 background jobs
    │   ├── cleanupMessages.ts   # Daily message purge
    │   ├── processBounces.ts    # Bounce detection and suppression
    │   ├── processHeld.ts       # Release expired held messages
    │   ├── processOutreachSequences.ts  # Outreach sequence stepper + daily limit reset
    │   ├── processQueue.ts      # Outbound email delivery queue
    │   └── processReplies.ts    # Reply detection for outreach campaigns
    ├── lib/
    │   ├── admin.ts             # isPlatformAdmin() check
    │   ├── cascade.ts           # deleteOrganizationCascade() — recursive delete
    │   ├── crypto.ts            # Server-side encryption (AES for Outlook tokens)
    │   ├── health.ts            # runReadinessChecks() — DB + auth health
    │   ├── html-to-text.ts      # HTML → plain text conversion
    │   ├── inline-css.ts        # CSS inlining for HTML emails
    │   ├── mail-sync.ts         # syncAllMailboxes() — IMAP sync worker
    │   ├── mail.ts              # parseRawEmail() — mailparser wrapper
    │   ├── native-mail.ts       # Native mailbox CRUD, auth, user creation
    │   ├── outlook.ts           # Microsoft Graph API integration
    │   ├── outreach-sender.ts   # Outreach email sending with throttling
    │   ├── route-matcher.ts     # Inbound email route matching (wildcard patterns)
    │   ├── serverBranding.ts    # Cached branding config loader
    │   ├── supabase.ts          # Supabase admin + anon client (server-side)
    │   ├── template-variables.ts # {{variable}} interpolation for email templates
    │   ├── tracking.ts          # Open/click tracking injection, stat increment, webhook dispatch
    │   └── user-sync.ts         # User profile sync utilities
    └── routes/
        ├── auth.ts              # Login, logout, register (403), refresh, password reset
        ├── credentials.ts       # SMTP/API credential CRUD
        ├── domains.ts           # Domain verification + DNS checks
        ├── messages.ts          # Platform message CRUD + sending
        ├── notifications.ts     # User notification endpoints
        ├── organizations.ts     # Org CRUD + member management
        ├── outlook.ts           # Outlook OAuth + mailbox management
        ├── routes.ts            # Email routing rule CRUD
        ├── system.ts            # System branding + mail server info
        ├── templates.ts         # Email template CRUD
        ├── track.ts             # Open/click tracking endpoints (/t/open, /t/click)
        ├── users.ts             # User profile + admin user management
        ├── webhooks.ts          # Webhook CRUD + request logs
        ├── mail/
        │   ├── index.ts         # Mail routes aggregator
        │   ├── contacts.ts      # Contact CRUD + autocomplete
        │   ├── filters.ts       # Mail filter rules CRUD
        │   ├── mailboxes.ts     # Mailbox CRUD + folder listing
        │   ├── messages.ts      # Mail message CRUD + search
        │   ├── send.ts          # Mail send endpoint
        │   ├── signatures.ts    # Email signature CRUD
        │   └── sync.ts          # Manual IMAP sync trigger
        └── outreach/
            ├── index.ts         # Outreach routes aggregator + admin guard middleware
            ├── campaigns.ts     # Campaign CRUD + sequence management
            ├── email-accounts.ts # Outreach inbox (email account) CRUD
            ├── leads.ts         # Lead + lead list CRUD + CSV import
            └── unsubscribe.ts   # Unsubscribe endpoint (public)
```

## Key Entry Points

| File | Purpose | Entry Type |
|-----|---------|-----------|
| `src/main.tsx` | React SPA bootstrap, all client routes, context provider tree | Browser |
| `src/server/index.ts` | Express server, middleware stack, API routes, static serving, job startup | Node.js (primary) |
| `api/index.js` | Vercel serverless wrapper around Express app | Vercel function |
| `src/server/jobs/index.ts` | Cron job scheduler — registers all 7 background jobs | Called from server/index.ts |

## Module Dependency Graph

```
Frontend:
  main.tsx
    → pages/* (lazy-loaded via React.lazy)
    → components/admin/AdminLayout, components/mail/MailLayout
    → hooks/useAuth, useMailbox, useMultiSession, useCompose, useOrganization
      → lib/api-client (authenticated HTTP)
        → lib/supabase (JWT token retrieval)

Backend:
  server/index.ts
    → server/routes/* (route handlers)
      → server/lib/* (business logic)
        → db/index.ts + db/schema.ts (Drizzle ORM)
    → server/smtp-server.ts, smtp-inbound.ts, imap-server.ts (native servers)
      → server/lib/native-mail.ts (auth), server/lib/mail.ts (parsing)
        → db/*
    → server/jobs/index.ts (cron scheduler)
      → server/jobs/* (individual jobs)
        → server/lib/* + db/*

Shared:
  db/schema.ts ← used by ALL server-side code
  server/lib/tracking.ts ← used by routes, jobs, SMTP servers
```

## File Naming Conventions

**React Components (Pages):**
- PascalCase with `Page` suffix: `InboxPage.tsx`, `OrganizationsPage.tsx`, `AdminDashboard.tsx`
- Located in `src/pages/{domain}/`

**React Components (UI):**
- shadcn primitives: lowercase kebab-case — `button.tsx`, `card.tsx`, `input.tsx`
- Domain components: PascalCase — `EmailHtmlViewer.tsx`, `ComposeDialog.tsx`, `AccountSwitcher.tsx`

**Hooks:**
- camelCase with `use` prefix: `useAuth.tsx`, `useMailbox.tsx`, `useCompose.tsx`
- Located in `src/hooks/`

**Server Routes:**
- Lowercase resource name: `messages.ts`, `webhooks.ts`, `organizations.ts`
- Sub-routes in subdirectories: `src/server/routes/mail/`, `src/server/routes/outreach/`

**Server Lib:**
- lowercase kebab-case: `route-matcher.ts`, `native-mail.ts`, `outreach-sender.ts`

**Server Lib (exceptions):**
- Some files use camelCase: `tracking.ts`, `health.ts`, `mail.ts`

## Configuration Files

| File | Purpose |
|-----|---------|
| `package.json` | npm scripts, dependencies (ESM: `"type": "module"`) |
| `tsconfig.json` | Frontend TypeScript — targets ES2020, excludes `server/` and `db/` |
| `tsconfig.server.json` | Backend TypeScript — includes server + db code |
| `tsconfig.node.json` | Node tooling TypeScript (Vite config) |
| `vite.config.ts` | Vite build config, `/api` proxy (9000→9001), `@/*` path alias, manual chunks |
| `drizzle.config.ts` | Drizzle Kit config for migration generation |
| `tailwind.config.ts` | Tailwind theme with shadcn CSS variable mappings |
| `postcss.config.js` | PostCSS plugins (tailwindcss + autoprefixer) |
| `components.json` | shadcn/ui config (style, paths, aliases) |
| `Dockerfile` | Multi-stage Docker build |
| `docker-compose.yml` | Docker Compose orchestration |
| `.env.example` | Environment variable documentation |

## Generated / Build Artifacts

| Path | Generated By | Notes |
|-----|-------------|-------|
| `dist/client/` | `vite build` | SPA static assets (HTML, JS, CSS) |
| `dist/server/` | `tsc -p tsconfig.server.json` | Compiled backend JS |
| `api/index.js` | `esbuild` (for Vercel) | Bundled server for serverless |
| `drizzle/` | `drizzle-kit generate:pg` | Generated SQL migration files |
| `node_modules/` | `npm install` | Dependencies (not committed) |
| `components/ui/*.tsx` | shadcn CLI (partially) | Generated primitives, then committed with customizations |

## Where to Add New Code

**New admin page:**
- Page component: `src/pages/admin/[FeatureName]Page.tsx`
- Route registration: `src/main.tsx` (add wouter `<Route>` wrapped in `<AdminCheck>`)
- Nav link: `src/components/admin/AdminLayout.tsx` sidebar

**New mail page:**
- Page component: `src/pages/mail/[FolderName]Page.tsx` (follow `InboxPage.tsx` pattern)
- Route registration: `src/main.tsx` inside `<MailRoutes>` component

**New outreach page:**
- Page component: `src/pages/outreach/[FeatureName]Page.tsx`
- Route registration: `src/main.tsx` (wrapped in `<AdminCheck>` + `<OrganizationProvider>`)

**New API endpoint:**
- Route handler: `src/server/routes/[resource].ts` (new file or extend existing)
- Mount: `src/server/index.ts` with `app.use('/api/[resource]', [resource]Routes)`
- If sub-route of mail/outreach: add to `src/server/routes/mail/index.ts` or `src/server/routes/outreach/index.ts`

**New database table:**
- Schema: `src/db/schema.ts` (add table, relations, insert/select Zod schemas, TypeScript types)
- Migration: `npm run db:generate` then `npm run db:push`
- RLS: `supabase/migrations/[NNN]_[description].sql`

**New background job:**
- Job function: `src/server/jobs/[jobName].ts` (export async function)
- Schedule: `src/server/jobs/index.ts` (add `cron.schedule()` call)

**New reusable component:**
- Generic UI: `src/components/ui/[component-name].tsx` (kebab-case)
- Mail-specific: `src/components/mail/[ComponentName].tsx` (PascalCase)
- Admin layout: `src/components/admin/[ComponentName].tsx` (PascalCase)
- Outreach: `src/components/outreach/[ComponentName].tsx` (PascalCase)

**New hook:**
- File: `src/hooks/use[Name].tsx`
- Context provider: export Provider component + useXxx() hook

**Shared utilities:**
- Non-React: `src/lib/[name].ts`
- Server-side: `src/server/lib/[name].ts`

**New server lib:**
- File: `src/server/lib/[name].ts`
- Use kebab-case for multi-word names (e.g., `route-matcher.ts`)

## Special Directories

**`src/components/ui/`:**
- Purpose: shadcn/ui generated primitives
- Generated: Partially (via shadcn CLI, then committed with customizations)
- Committed: Yes — do not regenerate over customizations
- Naming: lowercase kebab-case (shadcn convention)

**`supabase/migrations/`:**
- Purpose: Database RLS policies and schema reconciliation SQL
- Generated: No (hand-authored)
- Committed: Yes
- Naming: `NNN_description.sql` (sequential numbering)

**`scripts/`:**
- Purpose: Dev/ops utility scripts (migration runners, diagnostics, setup)
- Generated: No
- Committed: Yes
- Notable: `set-admin.ts`, `run-rls-migration.ts`, `audit-schema-drift.ts`, `migrate-native-mailboxes.ts`

**`drizzle/`:**
- Purpose: Drizzle Kit generated migration SQL
- Generated: Yes (via `npm run db:generate`)
- Committed: Yes

**`api/`:**
- Purpose: Vercel serverless entry point
- Generated: Yes (via `npm run build:api`)
- Committed: Yes (single `index.js` bundling Express app)

---

*Structure analysis: 2026-03-31*
