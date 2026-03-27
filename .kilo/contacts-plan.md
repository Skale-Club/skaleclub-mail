# Plan: Contacts + CSV Upload + Autocomplete for Webmail

## Overview
Add a contacts system to the webmail module with:
1. A `contacts` table scoped to each user
2. CRUD API + CSV import/export + autocomplete search endpoint
3. Auto-registration of contacts when emails are sent
4. Autocomplete dropdown on To/Cc/Bcc fields in the Compose page
5. A Contacts management page in the sidebar

---

## Files to Create

### 1. `src/server/routes/mail/contacts.ts` — Backend API
- `GET /` — List contacts (paginated, search by name/email)
- `GET /search` — Fast autocomplete search (returns top 10 matches by email or name, used by compose fields)
- `POST /` — Create a single contact
- `PUT /:id` — Update a contact
- `DELETE /:id` — Delete a contact
- `POST /import-csv` — Accept multipart CSV file upload, parse it, bulk insert contacts (skip duplicates on `userId + email`)
- `GET /export` — Export all contacts as CSV

Access control: All endpoints scoped to `req.headers['x-user-id']` via `checkUserMailboxAccess` pattern (verify user owns their contacts).

### 2. `src/pages/mail/ContactsPage.tsx` — Frontend Page
- Table listing contacts: email, name, company, last emailed date
- Search bar to filter contacts
- "Add Contact" button → modal/dialog with form (email, firstName, lastName, company)
- "Import CSV" button → file upload with drag-and-drop zone
- Edit/Delete actions per row
- CSV format hint shown near upload area: `email,firstName,lastName,company`

### 3. `src/components/mail/ContactAutocomplete.tsx` — Autocomplete Component
- Reusable input wrapper component
- Props: `value`, `onChange`, `placeholder`, `onSelect(contact)`, `className`
- Debounced API call to `GET /api/mail/contacts/search?q=<query>` (300ms debounce)
- Dropdown with matching contacts showing: name + email
- Keyboard navigation: Arrow up/down, Enter to select, Escape to close
- Click outside to dismiss
- Supports comma-separated multi-entry (autocomplete on the last typed email segment)

---

## Files to Modify

### 4. `src/db/schema.ts` — Add `contacts` table
Insert after the `signatures` table in the webmail module section:
```ts
export const contacts = pgTable('contacts', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    email: text('email').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    company: text('company'),
    emailedCount: integer('emailed_count').default(0).notNull(),
    lastEmailedAt: timestamp('last_emailed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userEmailUnique: uniqueIndex('contact_user_email_unique').on(table.userId, sql`lower(${table.email})`),
}))
```
Add relations, types (`Contact`, `NewContact`), and insert/select schemas.

### 5. `src/server/routes/mail/index.ts` — Register contacts route
Add:
```ts
import contactRoutes from './contacts'
router.use('/contacts', contactRoutes)
```

### 6. `src/server/routes/mail/send.ts` — Auto-register contacts on send
After a successful send, iterate over all recipients (to, cc, bcc) and upsert into the `contacts` table:
```ts
import { contacts } from '../../../db/schema'
import { sql } from 'drizzle-orm'

// After sending succeeds, auto-register contacts
for (const addr of allRecipients) {
    await db.insert(contacts).values({
        userId,
        email: addr,
        firstName: null,
        lastName: null,
        company: null,
        emailedCount: 1,
        lastEmailedAt: new Date(),
    }).onConflictDoUpdate({
        target: [contacts.userId, sql`lower(${contacts.email})`],
        set: {
            emailedCount: sql`${contacts.emailedCount} + 1`,
            lastEmailedAt: new Date(),
            updatedAt: new Date(),
        },
    })
}
```

### 7. `src/pages/mail/ComposePage.tsx` — Integrate autocomplete
- Import `ContactAutocomplete` component
- Replace the 3 plain `<input>` fields (To, Cc, Bcc) with `<ContactAutocomplete>` components
- When a contact is selected from dropdown, append the email to the comma-separated value

### 8. `src/components/mail/MailLayout.tsx` — Add Contacts to sidebar
- Add `Users` icon import from lucide-react
- Add contacts folder item to the `folders` array: `{ id: 'contacts', label: 'Contacts', icon: <Users className="w-5 h-5" />, href: '/mail/contacts' }`

### 9. `src/main.tsx` — Add contacts route
- Import `ContactsPage`
- Add route: `<Route path="/mail/contacts"><MailCheck><ContactsPage /></MailCheck></Route>` (before the `/:folder/:id` catch-all)

### 10. `src/hooks/useMail.ts` — Add contacts hooks
- `useContacts(search?, page?, limit?)` — list contacts
- `useSearchContacts(query)` — autocomplete search

### 11. `src/lib/mail-api.ts` — Add contacts API methods
- `getContacts(params)` — GET /api/mail/mailboxes/:id/contacts
- `searchContacts(query)` — GET /api/mail/mailboxes/:id/contacts/search?q=
- `createContact(data)` — POST
- `updateContact(id, data)` — PUT
- `deleteContact(id)` — DELETE
- `importContactsCsv(file)` — POST /import-csv with FormData

Note: Contacts are user-scoped, not mailbox-scoped. The API path will be `/api/mail/contacts` (not under mailboxId). But for consistency with the existing routing structure that mounts everything under `/mailboxes`, we'll use `/api/mail/mailboxes/contacts` or add a separate mount. Actually, looking at the route structure, contacts should be user-level. We'll mount contacts at `/api/mail/contacts` directly in `src/server/routes/mail/index.ts` instead of under `/mailboxes`.

Revised route registration in `src/server/routes/mail/index.ts`:
```ts
router.use('/contacts', contactRoutes)  // → /api/mail/contacts
```

This is cleaner since contacts belong to the user, not a specific mailbox.

---

## CSV Format
```csv
email,firstName,lastName,company
john@example.com,John,Doe,Acme Corp
jane@example.com,Jane,Smith,
```

The import endpoint will:
1. Accept a `multipart/form-data` upload with a `file` field
2. Auto-detect delimiter (comma or semicolon) from the first line
3. Parse CSV rows (skip header if detected)
4. Validate email format per row
5. Bulk insert with `onConflictDoNothing` on `userId + email`
6. Return `{ imported: number, skipped: number, errors: string[] }`

---

## Auto-Register on Send — Name Extraction
When auto-registering contacts from sent emails, extract name from the `name` field in the recipient object (which comes from the parsed `'Name <email>'` format in ComposePage's `parseEmailList`). Split on space to populate `firstName` and `lastName`. If no name is available, leave both null.

---

## Implementation Order
1. Schema (`contacts` table)
2. Backend API (`contacts.ts` route)
3. Backend route registration (`mail/index.ts`)
4. Auto-register on send (`send.ts`)
5. Frontend API client (`mail-api.ts` contacts methods)
6. Frontend hooks (`useMail.ts` contacts hooks)
7. Autocomplete component (`ContactAutocomplete.tsx`)
8. Contacts page (`ContactsPage.tsx`)
9. ComposePage integration (replace inputs)
10. MailLayout sidebar update
11. main.tsx route registration

---

## Testing
Run `npm run lint` after implementation to verify no lint errors.
Run `npm run build` to verify the build succeeds.
