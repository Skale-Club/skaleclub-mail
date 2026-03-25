import 'dotenv/config'
import { db } from '../src/db/index.js'
import { users, mailboxes, mailFolders, domains, organizations, organizationUsers } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

const allUsers = await db.query.users.findMany({
    columns: { twoFactorSecret: false },
})

console.log('\n=== USERS ===')
for (const u of allUsers) {
    console.log(`  ${u.email} | admin=${u.isAdmin} | passwordHash=${u.passwordHash ? 'SET' : 'NULL'}`)
}

const allMailboxes = await db.query.mailboxes.findMany()
console.log('\n=== MAILBOXES ===')
for (const m of allMailboxes) {
    console.log(`  ${m.email} | userId=${m.userId} | isNative=${m.isNative} | isDefault=${m.isDefault}`)
}

const folderCounts = await db.query.mailFolders.findMany()
console.log(`\n=== MAIL FOLDERS (${folderCounts.length} total) ===`)

const allDomains = await db.query.domains.findMany()
console.log('\n=== DOMAINS ===')
for (const d of allDomains) {
    console.log(`  ${d.name} | status=${d.verificationStatus} | orgId=${d.organizationId}`)
}

const allOrgs = await db.query.organizations.findMany()
console.log('\n=== ORGANIZATIONS ===')
for (const o of allOrgs) {
    console.log(`  ${o.name} (${o.slug}) | id=${o.id}`)
}

process.exit(0)
