/**
 * Usage: npx tsx scripts/set-admin.ts <email>
 * Example: npx tsx scripts/set-admin.ts skale.club@gmail.com
 */
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import * as schema from '../src/db/schema'

const email = process.argv[2]
if (!email) {
    console.error('Usage: npx tsx scripts/set-admin.ts <email>')
    process.exit(1)
}

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client, { schema })

const [user] = await db
    .update(schema.users)
    .set({ isAdmin: true })
    .where(eq(schema.users.email, email))
    .returning({ id: schema.users.id, email: schema.users.email, isAdmin: schema.users.isAdmin })

if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
}

console.log(`✅ User promoted to admin: ${user.email} (id: ${user.id})`)
await client.end()
