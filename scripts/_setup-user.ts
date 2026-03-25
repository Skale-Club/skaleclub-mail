import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { db } from '../src/db/index.js'
import { users } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'
import { hashPassword, createUserMailbox } from '../src/server/lib/native-mail.js'

const EMAIL = 'vanildo@skale.club'
const PASSWORD = process.argv[2]

if (!PASSWORD) {
    console.error('Usage: npx tsx scripts/_setup-user.ts <password>')
    process.exit(1)
}

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const user = await db.query.users.findFirst({ where: eq(users.email, EMAIL) })
if (!user) {
    console.error(`User ${EMAIL} not found`)
    process.exit(1)
}

// 1. Hash password and update DB
const hash = await hashPassword(PASSWORD)
await db.update(users)
    .set({ passwordHash: hash, updatedAt: new Date() })
    .where(eq(users.id, user.id))
console.log('[OK] passwordHash updated')

// 2. Create native mailbox
const mailboxId = await createUserMailbox(user.id, EMAIL)
console.log(`[OK] Mailbox created: ${mailboxId}`)

// 3. Sync to Supabase Auth
const { data: supaUsers } = await supabaseAdmin.auth.admin.listUsers()
const supaUser = supaUsers?.users?.find(u => u.email === EMAIL)
if (supaUser) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(supaUser.id, { password: PASSWORD })
    if (error) console.warn('[WARN] Supabase Auth update failed:', error.message)
    else console.log('[OK] Supabase Auth password updated')
} else {
    console.warn('[WARN] User not found in Supabase Auth — web login password unchanged')
}

console.log('\nDone! vanildo@skale.club is ready.')
process.exit(0)
