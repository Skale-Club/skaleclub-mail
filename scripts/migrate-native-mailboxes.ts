/**
 * One-time migration: copy existing native_mailboxes data into the new model.
 *
 * Run BEFORE dropping the native_mailboxes table.
 *
 * For each native_mailboxes row:
 *  1. Find the matching users row by email.
 *  2. Copy passwordHash to users.passwordHash.
 *  3. Create a mailboxes row (isNative=true) + default folders if not present.
 *  4. Log orphan rows (no matching user).
 *
 * Usage:
 *   npx tsx scripts/migrate-native-mailboxes.ts
 */

import 'dotenv/config'
import { db } from '../src/db'
import { users, mailboxes, mailFolders } from '../src/db/schema'
import { eq, and } from 'drizzle-orm'
import { encryptSecret } from '../src/server/lib/crypto'
import { sql } from 'drizzle-orm'

async function main() {
    console.log('Starting native_mailboxes migration...\n')

    // Read all native mailboxes directly via raw SQL (table may not be in schema anymore)
    const rows = await db.execute(sql`
        SELECT id, organization_id, email, password_hash, is_active
        FROM native_mailboxes
        ORDER BY created_at ASC
    `) as Array<{
        id: string
        organization_id: string
        email: string
        password_hash: string
        is_active: boolean
    }>

    console.log(`Found ${rows.length} native mailbox(es) to migrate.\n`)

    let migrated = 0
    let orphans = 0

    for (const row of rows) {
        const email = row.email.toLowerCase()

        // Find matching user
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        })

        if (!user) {
            console.warn(`[ORPHAN] No user found for mailbox email: ${email}`)
            orphans++
            continue
        }

        // Copy passwordHash if not already set
        if (!user.passwordHash) {
            await db.update(users)
                .set({ passwordHash: row.password_hash, updatedAt: new Date() })
                .where(eq(users.id, user.id))
            console.log(`[OK] Copied passwordHash for ${email}`)
        } else {
            console.log(`[SKIP] User ${email} already has passwordHash`)
        }

        // Create companion mailboxes entry if not present
        const existing = await db.query.mailboxes.findFirst({
            where: and(
                eq(mailboxes.userId, user.id),
                eq(mailboxes.isNative, true)
            ),
        })

        if (!existing) {
            const mailHost = process.env.MAIL_HOST || 'localhost'
            const smtpPort = parseInt(process.env.SMTP_SUBMISSION_PORT || '2587')
            const imapPort = parseInt(process.env.IMAP_PORT || '2993')
            const placeholder = encryptSecret('__NATIVE__')

            const [companion] = await db.insert(mailboxes).values({
                userId: user.id,
                email,
                smtpHost: mailHost,
                smtpPort,
                smtpUsername: email,
                smtpPasswordEncrypted: placeholder,
                smtpSecure: false,
                imapHost: mailHost,
                imapPort,
                imapUsername: email,
                imapPasswordEncrypted: placeholder,
                imapSecure: false,
                isDefault: true,
                isNative: true,
            }).returning()

            await db.insert(mailFolders).values([
                { mailboxId: companion.id, remoteId: 'INBOX',  name: 'Inbox',  type: 'inbox' },
                { mailboxId: companion.id, remoteId: 'Sent',   name: 'Sent',   type: 'sent' },
                { mailboxId: companion.id, remoteId: 'Drafts', name: 'Drafts', type: 'drafts' },
                { mailboxId: companion.id, remoteId: 'Trash',  name: 'Trash',  type: 'trash' },
                { mailboxId: companion.id, remoteId: 'Spam',   name: 'Spam',   type: 'spam' },
            ])

            console.log(`[OK] Created native mailbox entry for ${email}`)
        } else {
            console.log(`[SKIP] Mailbox entry already exists for ${email}`)
        }

        migrated++
    }

    console.log(`\nMigration complete.`)
    console.log(`  Migrated: ${migrated}`)
    console.log(`  Orphans (no matching user): ${orphans}`)

    if (orphans > 0) {
        console.log('\nOrphan mailboxes cannot be auto-migrated.')
        console.log('These addresses had no platform user account.')
        console.log('You can drop them or create user accounts manually before dropping the table.')
    }

    process.exit(0)
}

main().catch(err => {
    console.error('Migration failed:', err)
    process.exit(1)
})
