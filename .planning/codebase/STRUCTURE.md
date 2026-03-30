# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
skaleclub-mail/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/              # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   │   ├── admin/           # Admin layout shell components
│   │   └── mail/            # Mail-specific components (viewers, panels, etc.)
│   ├── db/
│   │   ├── index.ts         # Drizzle ORM client initialization
│   │   └── schema.ts        # Full database schema (tables, enums, relations)
│   ├── hooks/
│   │   └── useAuth.tsx      # Auth context provider and hook
│   ├── lib/
│   │   ├── supabase.ts      # Supabase browser client
│   │   └── utils.ts         # Shared utilities (cn, etc.)
│   ├── pages/
│   │   ├── Login.tsx        # Login page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── admin/           # Admin section pages
│   │   └── mail/            # Mail section pages (Inbox, Sent, Spam, etc.)
│   ├── server/
│   │   ├── index.ts         # Express entry point (middleware, auth, routing)
│   │   ├── lib/
│   │   │   └── tracking.ts  # Open/click tracking and webhook dispatch
│   │   └── routes/          # API route handlers (auth, users, orgs, servers, etc.)
│   └── main.tsx             # React entry point with client-side routes
├── supabase/
│   └── migrations/          # SQL migration files (RLS policies)
├── scripts/                 # Migration runner and utility scripts
├── public/                  # Static assets
├── CLAUDE.md                # Project instructions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

## Directory Purposes

**`src/components/ui/`:**
- Purpose: shadcn/ui primitive components, never modified directly
- Contains: Button, Card, Dialog, Input, Toast, Badge, Dropdown, Select, Table, etc.
- Key files: all lowercase kebab-case `.tsx` files matching shadcn naming

**`src/components/admin/`:**
- Purpose: Layout shell for the admin section
- Contains: Sidebar, header, nav components

**`src/components/mail/`:**
- Purpose: Mail-reading UI components
- Contains: `EmailHtmlViewer.tsx` (renders HTML email content with light/dark toggle), `ResizablePanels.tsx` (panel layout for mail views)

**`src/db/`:**
- Purpose: Database layer — schema definition and ORM client
- Key files: `src/db/schema.ts` (single source of truth for all tables), `src/db/index.ts` (Drizzle + postgres client)

**`src/hooks/`:**
- Purpose: Shared React hooks
- Key files: `src/hooks/useAuth.tsx` (Supabase session, user object, org context)

**`src/lib/`:**
- Purpose: Non-React utilities and external client initialization
- Key files: `src/lib/supabase.ts` (browser Supabase client), `src/lib/utils.ts` (Tailwind class merger `cn()`)

**`src/pages/admin/`:**
- Purpose: Full-page React components for each admin route
- Contains: Orgs, Servers, Domains, Messages, Credentials, Routes, Webhooks, Statistics pages

**`src/pages/mail/`:**
- Purpose: Full-page React components for the mail client UI
- Contains: `InboxPage.tsx`, `SentPage.tsx`, `SpamPage.tsx`, `StarredPage.tsx`, `SearchPage.tsx`

**`src/server/routes/`:**
- Purpose: Express route handlers, one file per resource domain
- Contains: `auth.ts`, `users.ts`, `organizations.ts`, `servers.ts`, `domains.ts`, `credentials.ts`, `routes.ts`, `messages.ts`, `webhooks.ts`, `track.ts`, `system.ts`

**`supabase/migrations/`:**
- Purpose: SQL files applied to Supabase — primarily RLS policies
- Key files: `001_enable_rls.sql`
- Generated: No (hand-authored)
- Committed: Yes

**`scripts/`:**
- Purpose: One-off migration runner scripts and database utilities
- Generated: No
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React app bootstrap, client-side route definitions (wouter)
- `src/server/index.ts`: Express server bootstrap, middleware stack, route mounting

**Configuration:**
- `vite.config.ts`: Vite build config, `/api` proxy to port 9001, `@/*` path alias
- `tsconfig.json`: TypeScript config, `@/*` alias mapped to `./src/*`
- `tailwind.config.ts`: Tailwind theme, shadcn CSS variable mappings
- `package.json`: Scripts, dependencies

**Core Logic:**
- `src/db/schema.ts`: All table definitions — the authoritative data model
- `src/hooks/useAuth.tsx`: Session management, org switching, auth state
- `src/server/lib/tracking.ts`: Email open/click tracking and webhook dispatch logic

**Mail UI:**
- `src/components/mail/EmailHtmlViewer.tsx`: HTML email renderer with per-email dark mode toggle
- `src/components/mail/ResizablePanels.tsx`: Resizable two-panel layout for mail views
- `src/pages/mail/InboxPage.tsx`: Inbox folder view

## Naming Conventions

**Files:**
- React components: PascalCase `.tsx` — `InboxPage.tsx`, `EmailHtmlViewer.tsx`
- Hooks: camelCase prefixed with `use` — `useAuth.tsx`
- Server routes: lowercase resource name — `messages.ts`, `webhooks.ts`
- Utilities: camelCase — `utils.ts`, `tracking.ts`
- shadcn primitives: kebab-case — `button.tsx`, `dropdown-menu.tsx`

**Directories:**
- Feature groupings: lowercase — `admin/`, `mail/`, `routes/`
- shadcn components: `ui/`

## Where to Add New Code

**New admin page:**
- Page component: `src/pages/admin/[FeatureName]Page.tsx`
- Route registration: `src/main.tsx` (add wouter `<Route>`)
- Nav link: `src/components/admin/` sidebar component

**New mail folder/view:**
- Page component: `src/pages/mail/[FolderName]Page.tsx` (follow pattern of `InboxPage.tsx`)
- Route registration: `src/main.tsx`

**New API endpoint:**
- Route handler: `src/server/routes/[resource].ts` (create new file or add to existing)
- Mount in: `src/server/index.ts`

**New database table:**
- Schema definition: `src/db/schema.ts` (add table and relations)
- Migration: run `npm run db:generate` then `npm run db:push`
- RLS policy: `supabase/migrations/` (new SQL file)

**New reusable component:**
- If generic UI primitive: `src/components/ui/[component-name].tsx`
- If mail-specific: `src/components/mail/[ComponentName].tsx`
- If admin layout: `src/components/admin/[ComponentName].tsx`

**Shared utilities:**
- Non-React helpers: `src/lib/utils.ts` or new file in `src/lib/`
- React hooks: `src/hooks/use[Name].tsx`

## Special Directories

**`src/components/ui/`:**
- Purpose: shadcn/ui generated components
- Generated: Partially (via shadcn CLI, then committed)
- Committed: Yes — do not regenerate over customizations

**`supabase/migrations/`:**
- Purpose: Database RLS and schema SQL applied to Supabase
- Generated: No
- Committed: Yes

**`scripts/`:**
- Purpose: Dev/ops utility scripts (migration runners, etc.)
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-30*
