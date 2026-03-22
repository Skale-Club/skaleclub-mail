# SkaleClub Mail

A complete email system built with modern web technologies, inspired by Postal. This application provides a full-featured email management platform with organization-based access control.

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, shadcn/ui, wouter
- **Backend**: Express 5, tsx
- **Database**: Supabase (PostgreSQL, Auth, Storage)
- **Validation**: Zod with drizzle-zod
- **ORM**: Drizzle ORM

## Features

- 🏢 **Organization Management** - Multi-tenant architecture with role-based access
- 📧 **Email Server Management** - Create and manage mail servers
- 🌐 **Domain Verification** - DNS verification for sending domains
- 🔑 **Credential Management** - SMTP and API credentials
- 📨 **Message Tracking** - Send and track email messages
- 🔗 **Webhook Support** - Event notifications via webhooks
- 📊 **Statistics** - Email delivery analytics
- 🔒 **Row Level Security** - Supabase RLS for data isolation

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Skale-Club/skaleclub-mail.git
cd skaleclub-mail
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

5. Push the database schema:
```bash
npm run db:push
```

6. Apply RLS policies:
```bash
npm run db:rls
```

If you prefer Supabase SQL Editor, run all files in `supabase/migrations` in filename order.

### Development

Start the development server:
```bash
npm run dev
```

- Frontend: http://localhost:9000
- Backend API: http://localhost:9001

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
skaleclub-mail/
├── src/
│   ├── components/         # React components
│   │   └── ui/            # shadcn/ui components
│   ├── db/                # Database schema and connection
│   │   ├── index.ts       # Drizzle client
│   │   └── schema.ts      # Database schema
│   ├── hooks/             # React hooks
│   │   └── useAuth.tsx    # Authentication hook
│   ├── lib/               # Utility libraries
│   │   ├── supabase.ts    # Supabase client
│   │   └── utils.ts       # Utility functions
│   ├── pages/             # Page components
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   └── Login.tsx      # Login page
│   └── server/            # Express backend
│       ├── index.ts       # Server entry point
│       └── routes/        # API routes
│           ├── auth.ts
│           ├── credentials.ts
│           ├── domains.ts
│           ├── messages.ts
│           ├── organizations.ts
│           ├── routes.ts
│           ├── servers.ts
│           ├── users.ts
│           └── webhooks.ts
├── supabase/
│   └── migrations/        # SQL migrations
│       └── 001_enable_rls.sql
├── drizzle.config.ts      # Drizzle ORM config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations/:id` - Get organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Servers
- `GET /api/servers` - List servers
- `POST /api/servers` - Create server
- `GET /api/servers/:id` - Get server
- `PUT /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server

### Domains
- `GET /api/domains` - List domains
- `POST /api/domains` - Create domain
- `GET /api/domains/:id` - Get domain
- `PUT /api/domains/:id` - Update domain
- `DELETE /api/domains/:id` - Delete domain

### Messages
- `GET /api/messages` - List messages
- `POST /api/messages` - Send message
- `GET /api/messages/:id` - Get message
- `DELETE /api/messages/:id` - Delete message

### Webhooks
- `GET /api/webhooks` - List webhooks
- `POST /api/webhooks` - Create webhook
- `GET /api/webhooks/:id` - Get webhook
- `PUT /api/webhooks/:id` - Update webhook
- `DELETE /api/webhooks/:id` - Delete webhook

### Credentials
- `GET /api/credentials` - List credentials
- `POST /api/credentials` - Create credential
- `GET /api/credentials/:id` - Get credential
- `DELETE /api/credentials/:id` - Delete credential

### Routes
- `GET /api/routes` - List routes
- `POST /api/routes` - Create route
- `GET /api/routes/:id` - Get route
- `PUT /api/routes/:id` - Update route
- `DELETE /api/routes/:id` - Delete route

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles (linked to Supabase Auth) |
| `organizations` | Email organizations |
| `organization_users` | Organization membership |
| `servers` | Mail servers |
| `domains` | Sending domains |
| `credentials` | SMTP/API credentials |
| `routes` | Email routing rules |
| `messages` | Email messages |
| `deliveries` | Message delivery tracking |
| `webhooks` | Webhook configurations |
| `webhook_requests` | Webhook request logs |
| `track_domains` | Tracking domains |
| `suppressions` | Email suppressions |
| `statistics` | Email statistics |

## Security

- Row Level Security (RLS) enabled on all tables
- Organization-based data isolation
- Role-based access control (owner, admin, member)
- Supabase Auth for authentication
- Service role for system operations

## License

MIT
