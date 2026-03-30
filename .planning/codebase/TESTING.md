# TESTING.md — SkaleClub Mail

## Status

**No testing framework is configured in this codebase.**

Confirmed by:
- `package.json` — no test runner in `scripts`, no jest/vitest/playwright in `devDependencies`
- No `jest.config.*` or `vitest.config.*` at project root
- No `*.test.*` or `*.spec.*` files anywhere under `src/`
- `CLAUDE.md` explicitly states: "No testing framework is currently configured"

## Current Test Coverage

- **Unit tests:** None
- **Integration tests:** None
- **E2E tests:** None
- **Coverage:** 0%

## Recommendations

### Unit Testing (Vitest — natural fit for Vite projects)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Integration Testing

Express routes can be tested with `supertest`:

```bash
npm install -D supertest @types/supertest
```

### E2E Testing (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

## Priority Areas to Test (if added)

1. **Auth middleware** (`src/server/index.ts`) — JWT validation logic
2. **API routes** (`src/server/routes/`) — CRUD operations against real DB
3. **Email tracking** (`src/server/lib/tracking.ts`) — open/click token logic
4. **React Query hooks** — data fetching and cache invalidation
5. **Form validation** — Zod schemas in react-hook-form forms

## Notes

- Supabase RLS makes pure unit tests difficult for DB-touching code — integration tests with a test DB are preferred
- The dev server setup (Vite + Express) supports hot reload but no test watcher is configured
- Express 5 beta may have quirks with some testing utilities
