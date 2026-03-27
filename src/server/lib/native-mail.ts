/**
 * Shared helpers for the user-as-mailbox model.
 *
 * Every non-admin user on the platform has a native mailbox scoped to their
 * organisation's verified domain. Authentication for SMTP/IMAP uses
 * users.passwordHash (bcrypt) – the same credential used for the web login.
 */

import bcrypt from 'bcrypt'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db'
import { users, domains, mailboxes, mailFolders, mailMessages } from '../../db/schema'
import { encryptSecret } from './crypto'

const BCRYPT_ROUNDS = 12

/**
 * Authenticate a user for SMTP/IMAP access.
 * Returns the user record on success, null on failure.
 * Platform admins (isAdmin=true) cannot authenticate via SMTP/IMAP.
 */
export async function authenticateNativeUser(email: string, password: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
    })

    if (!user || !user.passwordHash || user.isAdmin) return null

    const valid = await bcrypt.compare(password, user.passwordHash)
    return valid ? user : null
}

/**
 * Hash a plaintext password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Create a native mailbox entry (mailboxes row + default folders) for a user.
 * Safe to call multiple times — checks for an existing native mailbox first.
 */
export async function createUserMailbox(userId: string, email: string): Promise<string | null> {
    const existing = await db.query.mailboxes.findFirst({
        where: and(
            eq(mailboxes.userId, userId),
            eq(mailboxes.isNative, true)
        ),
    })

    if (existing) return existing.id

    const mailHost = process.env.MAIL_HOST || 'localhost'
    const smtpPort = parseInt(process.env.SMTP_SUBMISSION_PORT || '2587')
    const imapPort = parseInt(process.env.IMAP_PORT || '2993')
    const placeholder = encryptSecret('__NATIVE__')

    const [companion] = await db.insert(mailboxes).values({
        userId,
        email: email.toLowerCase(),
        smtpHost: mailHost,
        smtpPort,
        smtpUsername: email.toLowerCase(),
        smtpPasswordEncrypted: placeholder,
        smtpSecure: false,
        imapHost: mailHost,
        imapPort,
        imapUsername: email.toLowerCase(),
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

    return companion.id
}

/**
 * Delete a user's native mailbox and all its messages/folders.
 */
export async function deleteUserMailbox(userId: string): Promise<void> {
    const companion = await db.query.mailboxes.findFirst({
        where: and(
            eq(mailboxes.userId, userId),
            eq(mailboxes.isNative, true)
        ),
    })

    if (!companion) return

    await db.delete(mailMessages).where(eq(mailMessages.mailboxId, companion.id))
    await db.delete(mailFolders).where(eq(mailFolders.mailboxId, companion.id))
    await db.delete(mailboxes).where(eq(mailboxes.id, companion.id))
}

/**
 * Validate that an email's domain matches a verified domain in an organisation.
 */
export async function validateEmailDomainForOrg(email: string, organizationId: string): Promise<boolean> {
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!emailDomain) return false

    const verifiedDomain = await db.query.domains.findFirst({
        where: and(
            eq(domains.organizationId, organizationId),
            eq(domains.name, emailDomain),
            eq(domains.verificationStatus, 'verified')
        ),
    })

    return !!verifiedDomain
}

/**
 * Check if an email address belongs to a local (native) user on this server.
 * Returns the user's ID if found, null otherwise.
 */
export async function findLocalUser(email: string): Promise<{ userId: string } | null> {
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (!emailDomain) return null

    // Domain must be verified in some org
    const verifiedDomain = await db.query.domains.findFirst({
        where: and(
            eq(domains.name, emailDomain),
            eq(domains.verificationStatus, 'verified')
        ),
    })
    if (!verifiedDomain) return null

    // A non-admin user with that exact email must exist
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
    })

    if (!user) return null

    return { userId: user.id }
}
