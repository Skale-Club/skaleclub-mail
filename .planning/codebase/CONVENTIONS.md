# Coding Conventions

**Analysis Date:** 2026-03-31

## Naming Patterns

**Files:**
- React components: PascalCase, e.g. `EmailDetailView.tsx`, `AdminLayout.tsx`
- Hooks: camelCase prefixed with `use`, e.g. `useMail.ts`, `useApiError.ts`
- Server routes: lowercase, e.g. `auth.ts`, `messages.ts`, `organizations.ts`
- Utility libs: camelCase, e.g. `api-client.ts`, `mail-api.ts`, `email-threading.ts`
- Page components: PascalCase with `Page` suffix, e.g. `InboxPage.tsx`, `MessagesPage.tsx`
- Tab components: PascalCase with `Tab` suffix, e.g. `AnalyticsTab.tsx`, `WebhooksTab.tsx`

**Functions:**
- Regular functions: camelCase, e.g. `fetchOrganizations`, `handleDeleteOrg`, `generateSlug`
- Event handlers: `handle` prefix, e.g. `handleCreateOrg`, `handleDeleteOrg`, `handleRefresh`
- Boolean helpers: verb prefix, e.g. `isRetryableMethod`, `shouldSkipUrl`, `matchesSearch`
- Async data loaders: `load` prefix in shared helpers, e.g. `loadOrganizations`, `loadDomains`

**Variables:**
- camelCase throughout, e.g. `selectedOrgId`, `isLoading`, `searchQuery`
- Boolean state: `is` prefix for status flags, e.g. `isLoading`, `isError`, `isFetching`
- Loading state pattern: `const [isLoading, setIsLoading] = useState(true)`

**Types/Interfaces:**
- `interface` for component props and object shapes, e.g. `EmailDetailViewProps`, `AuthState`
- `type` for unions and records, e.g. `MessageRecord`, `ApiMethod`
- Props interfaces: PascalCase with `Props` suffix
- Internal record types (page-scoped): PascalCase with `Record` suffix, e.g. `DomainRecord`, `MessageRecord`
- Enums defined in schema: `pgEnum` with camelCase var names, e.g. `userRoleEnum`, `messageStatusEnum`

**Database schema:**
- Table columns: snake_case in DB, camelCase in TypeScript via Drizzle mapping
- Exception: some legacy columns use `owner_id` directly (mixed casing observed in `organizations` table)

## Code Style

**Formatting:**
- 4-space indentation throughout (TypeScript, TSX)
- Single quotes for strings
- Trailing commas in objects/arrays
- No semicolons in some files; semicolons used in others — inconsistent across the codebase
- No configured Prettier (no `.prettierrc` found); style is maintained manually

**Linting:**
- ESLint with `@typescript-eslint` plugin (`eslint.config` not found; configured via `package.json` scripts)
- Zero warnings allowed: `--max-warnings 0` in `npm run lint`
- TypeScript strict mode enabled: `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`

## Import Organization

**Order (observed pattern):**
1. External libraries (React, lucide-react, wouter, etc.)
2. Internal components (`../../components/...`)
3. Internal hooks (`../../hooks/...`)
4. Internal lib utilities (`../../lib/...`)
5. Local/sibling files (`./helpers`)

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json` and `vite.config.ts`)
- In practice, relative imports (`../../`) are used more commonly than `@/` alias in pages/hooks

**No barrel files observed** — each module imports directly from source files.

## Error Handling

**Server routes (Express):**
- Wrap entire handler in `try/catch`
- Validate request body with Zod: `schema.parse(req.body)` — throws `ZodError` on failure
- Catch `ZodError` explicitly and return `400` with `error.errors`
- All other errors return `500` with `{ error: 'Internal server error' }`
- Auth errors return `401` with `{ error: '...' }`
- Pattern:
  ```typescript
  try {
      const { field } = schema.parse(req.body)
      // ... logic ...
      res.json({ result })
  } catch (error) {
      if (error instanceof z.ZodError) {
          return res.status(400).json({ error: error.errors })
      }
      res.status(500).json({ error: 'Internal server error' })
  }
  ```

**Frontend API calls (admin pages using raw `apiFetch`):**
- Async functions in `useEffect` are wrapped in `void`-cast calls: `void fetchData()`
- `try/catch` inside the async function, errors logged via `console.error`
- No centralized error toast in admin pages; some use `alert()` for simple flows
- Pattern:
  ```typescript
  useEffect(() => {
      void fetchData()
  }, [])

  async function fetchData() {
      try {
          const data = await apiFetch<T>(url)
          setState(data.items)
      } catch (error) {
          console.error('Error fetching:', error)
      } finally {
          setIsLoading(false)
      }
  }
  ```

**Frontend API calls (mail hooks using React Query):**
- Custom `ApiError` class (`src/lib/api.ts`) with `status`, `code`, `details` fields
- `useApiError` hook (`src/hooks/useApiError.ts`) for centralized error state + toast
- React Query mutations use `onMutate`/`onError` for optimistic updates with rollback
- Auth errors (401/403) trigger automatic sign-out and redirect to `/login`

**API client classes:**
- `ApiError` in `src/lib/api.ts` — used by mail pages and React Query hooks
- `ApiClientError` in `src/lib/api-client.ts` — alternative client with token caching, used by `useAuth`
- Note: two parallel API client implementations exist (see CONCERNS.md)

## Logging

**Framework:** `console.error` / `console.log` / `console.warn` directly — no structured logger.

**Patterns:**
- Server-side: `console.error('Error fetching X:', error)` before returning 500 response
- Client-side: `console.error('Error loading X:', error)` inside catch blocks
- ~358 console logging calls across 67 files
- No log levels, no correlation IDs, no structured output format

## Comments

**When to Comment:**
- Inline comments explain non-obvious logic (e.g. regex patterns, race condition guards)
- Section dividers use `// ---` style with descriptive labels in longer files
- Short inline comments on single lines: `// Ignore errors during cleanup`
- JSDoc not used

**Example pattern:**
```typescript
// Prevent browsers from caching API responses
app.use('/api/', (_req, res, next) => { ... })

// Race against a timeout so the app never stays on the spinner forever
const sessionResult = await Promise.race([...])
```

## Function Design

**Size:** Functions tend to be short and single-purpose. Route handlers are self-contained.

**Parameters:** Prefer destructured objects for multi-parameter functions; primitive params for single values.

**Return Values:**
- Server handlers: always end with `res.json(...)` or `res.status(...).json(...)`
- React components: single JSX expression return
- Utility functions: typed return values, explicit `return` statements

**Async patterns:**
- `async/await` used universally — no `.then()/.catch()` chains observed
- Floating promises in `useEffect` wrapped with `void`: `void asyncFn()`
- `Promise.race` used for timeout guarding in auth init

## Module Design

**Exports:**
- React components: `export default function ComponentName()` for pages; `export function ComponentName()` for reusable components
- Hooks: named exports only, e.g. `export function useMail()`
- Utilities: named exports from `src/lib/utils.ts`, `src/lib/api.ts`
- Server routes: `export default router` (Express Router instance)

**Barrel Files:** Not used — imports reference specific files directly.

## React-Specific Patterns

**State management:**
- `useState` for local UI state
- React Query (`useQuery`, `useMutation`, `useInfiniteQuery`) for server state
- Context providers for cross-cutting app state (auth, mailbox, compose, multi-session)

**Component patterns:**
- `React.memo` not observed — no explicit memoization wrappers
- `useMemo` used for derived data computations (filtered lists, current index)
- `useCallback` used in hook utilities (`useApiError`)
- `React.lazy` + `Suspense` for all page-level code splitting in `src/main.tsx`

**Optimistic updates:**
- Implemented in mutation hooks via `onMutate` snapshot + `onError` rollback
- Example: `useUpdateMessage`, `useDeleteMessage` in `src/hooks/useMail.ts`

**Zod schemas on backend:**
- All request body schemas defined at the top of route files as `const xSchema = z.object({...})`
- Called via `.parse(req.body)` — throws synchronously on invalid input

---

*Convention analysis: 2026-03-31*