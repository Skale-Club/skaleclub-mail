# CLAUDE.md — SkaleClub Mail

## Project Overview

SkaleClub Mail is a multi-tenant email server management platform inspired by Postal. It provides organization-based access control, domain verification, message tracking, email routing, webhooks, and analytics.

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, shadcn/ui (Radix UI), wouter (routing), TanStack React Query, react-hook-form + Zod
- **Backend:** Express 5 (beta), TypeScript, tsx (dev runner)
- **Database:** Supabase (PostgreSQL), Drizzle ORM, Row Level Security (RLS)
- **Auth:** Supabase Auth (JWT-based)
- **Email:** Nodemailer (SMTP sending), mailparser (parsing)

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/              # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   └── admin/           # Admin layout
├── db/
│   ├── index.ts         # Drizzle client init
│   └── schema.ts        # Full database schema (tables, enums, relations)
├── hooks/
│   └── useAuth.tsx      # Auth context & hook
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions (cn, etc.)
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── admin/           # Admin pages (Orgs, Servers, Domains, Messages, etc.)
├── server/
│   ├── index.ts         # Express entry point (middleware, auth, routing)
│   ├── lib/
│   │   └── tracking.ts  # Open/click tracking & webhook dispatch
│   └── routes/          # API route handlers
│       ├── auth.ts, users.ts, organizations.ts, servers.ts
│       ├── domains.ts, credentials.ts, routes.ts
│       ├── messages.ts, webhooks.ts, track.ts, system.ts
└── main.tsx             # React entry point with routes
supabase/migrations/     # RLS policies
scripts/                 # Migration runner scripts
```

## Commands

```bash
npm run dev              # Run client (port 9000) + server (port 9001) concurrently
npm run dev:client       # Vite dev server only
npm run dev:server       # Express server with tsx watch only
npm run build            # Build both client and server
npm start                # Run production build (node dist/server/index.js)
npm run lint             # ESLint (strict, zero warnings)
npm run db:generate      # Generate Drizzle migrations
npm run db:push          # Push schema to database
npm run db:studio        # Open Drizzle Studio
```

## Architecture Notes

### Authentication Flow
1. Frontend authenticates via Supabase Auth (`supabase.auth.signInWithPassword`)
2. JWT token sent as `Authorization: Bearer <token>` header
3. Express middleware validates token with Supabase, sets `x-user-id` header
4. RLS policies enforce organization-level data isolation at the database layer

### Multi-Tenancy Model
- Users belong to Organizations via `organization_users` (roles: admin, member, viewer)
- Servers belong to Organizations
- All resources (domains, credentials, routes, messages, webhooks) belong to Servers
- RLS policies enforce org-scoped data access

### API Conventions
- All API routes under `/api/`
- Rate limited: 100 req/IP/15min
- Resources typically require a parent ID as query param (e.g., `?serverId=...`, `?organizationId=...`)
- Standard REST patterns: GET (list/detail), POST (create), PUT (update), DELETE (remove)
- Zod validation on request bodies

### Email Tracking
- Open tracking: 1x1 transparent GIF pixel injected into HTML emails (`/t/open/:token`)
- Click tracking: URL rewriting with base64url-encoded redirect (`/t/click/:token?u=...`)
- Both respond immediately, process tracking asynchronously

### Frontend Patterns
- All admin pages under `/admin/*` route
- React Query for server state (auto-refetch, cache invalidation)
- Forms use react-hook-form + Zod schemas
- Toast notifications for user feedback
- Dark/Light/System theme support

## Environment Variables

Required: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATABASE_URL`

Optional: `PORT` (default 9001), `NODE_ENV`, `JWT_SECRET`, `FRONTEND_URL` (default http://localhost:9000), `SMTP_HOST/PORT/USER/PASS/FROM`

See `.env.example` for full list.

## Database

Schema defined in `src/db/schema.ts` using Drizzle ORM. Key tables: `users`, `organizations`, `organization_users`, `servers`, `domains`, `credentials`, `routes`, `messages`, `deliveries`, `webhooks`, `webhook_requests`, `statistics`, `suppressions`, `track_domains`.

All tables have RLS enabled (policies in `supabase/migrations/001_enable_rls.sql`).

## Key Constraints

- No testing framework is currently configured
- Registration endpoint is intentionally disabled (403)
- Express 5 is beta — uses `req.query` instead of `req.params` in some places
- Vite proxies `/api` requests to the backend in dev mode
- Request body limit: 10MB
- Path alias: `@/*` maps to `./src/*`
