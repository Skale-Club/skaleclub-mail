import 'dotenv/config'
import { db } from '../src/db/index'
import { domains, users, mailboxes, mailFolders, mailMessages } from '../src/db/schema'
import { eq, and, sql } from 'drizzle-orm'

async function main() {
  try {
    console.log('========================================')
    console.log('   MAIL SYSTEM DIAGNOSTIC')
    console.log('========================================\n')

    // 1. Domains
    console.log('=== DOMAINS ===')
    const allDomains = await db.select().from(domains)
    if (allDomains.length === 0) {
      console.log('  ❌ NO DOMAINS REGISTERED')
    }
    for (const d of allDomains) {
      const icon = d.verificationStatus === 'verified' ? '✅' : '❌'
      console.log(`  ${icon} ${d.name} | status: ${d.verificationStatus} | orgId: ${d.organizationId}`)
    }

    // 2. Users
    console.log('\n=== USERS ===')
    const allUsers = await db.select().from(users)
    for (const u of allUsers) {
      console.log(`  ${u.email} | admin: ${u.isAdmin} | hasPassword: ${!!u.passwordHash} | id: ${u.id}`)
    }

    // 3. Native mailboxes
    console.log('\n=== NATIVE MAILBOXES ===')
    const nativeMb = await db.select().from(mailboxes).where(eq(mailboxes.isNative, true))
    if (nativeMb.length === 0) {
      console.log('  ❌ NO NATIVE MAILBOXES')
    }
    for (const mb of nativeMb) {
      const folders = await db.select().from(mailFolders).where(eq(mailFolders.mailboxId, mb.id))
      const msgs = await db.select({ count: sql<number>`count(*)::int` }).from(mailMessages).where(eq(mailMessages.mailboxId, mb.id))
      console.log(`  ${mb.email} | userId: ${mb.userId} | folders: [${folders.map(f => f.type).join(', ')}] | messages: ${msgs[0]?.count ?? 0}`)
    }

    // 4. Env
    console.log('\n=== ENV (relay config) ===')
    console.log(`  SMTP_HOST:     ${process.env.SMTP_HOST || '❌ NOT SET'}`)
    console.log(`  SMTP_USER:     ${process.env.SMTP_USER ? '✅ SET' : '❌ NOT SET'}`)
    console.log(`  SMTP_PASS:     ${process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET'}`)
    console.log(`  SMTP_PORT:     ${process.env.SMTP_PORT || '(default 587)'}`)
    console.log(`  MAIL_HOST:     ${process.env.MAIL_HOST || '❌ NOT SET'}`)
    console.log(`  MAIL_DOMAIN:   ${process.env.MAIL_DOMAIN || '❌ NOT SET'}`)

    // 5. Specific test
    console.log('\n=== TEST: vanildo@skale.club ===')
    const testDomain = allDomains.find(d => d.name === 'skale.club' && d.verificationStatus === 'verified')
    const testUser = allUsers.find(u => u.email === 'vanildo@skale.club')
    const testMailbox = nativeMb.find(m => m.email === 'vanildo@skale.club')

    console.log(`  Domain "skale.club" verified:  ${testDomain ? '✅ YES (orgId=' + testDomain.organizationId + ')' : '❌ NO'}`)
    console.log(`  User "vanildo@skale.club":      ${testUser ? '✅ EXISTS (admin=' + testUser.isAdmin + ', hasPass=' + !!testUser.passwordHash + ')' : '❌ NOT FOUND'}`)
    console.log(`  Native mailbox:                  ${testMailbox ? '✅ EXISTS (id=' + testMailbox.id + ')' : '❌ NOT FOUND'}`)

    const canDeliverLocally = !!testDomain && !!testUser && !testUser.isAdmin && !!testMailbox
    console.log(`\n  → Would deliver locally:         ${canDeliverLocally ? '✅ YES' : '❌ NO'}`)

    if (!testDomain) console.log('  ⚠️  FIX: Domain "skale.club" needs to be added and verified in an organization')
    if (!testUser) console.log('  ⚠️  FIX: User "vanildo@skale.club" needs to exist in the users table')
    if (testUser?.isAdmin) console.log('  ⚠️  FIX: User is admin — admins are blocked from native SMTP/IMAP auth')
    if (testUser && !testUser.passwordHash) console.log('  ⚠️  FIX: User has no passwordHash — cannot authenticate via SMTP/IMAP')
    if (testUser && !testMailbox) console.log('  ⚠️  FIX: User exists but has no native mailbox. createUserMailbox() needs to be called')

    // 6. External relay
    console.log('\n=== EXTERNAL RELAY (gmail.com etc) ===')
    const hasRelay = !!(process.env.SMTP_HOST && process.env.SMTP_USER)
    if (hasRelay) {
      console.log(`  ✅ SMTP relay configured: ${process.env.SMTP_HOST}`)
    } else {
      console.log('  ❌ NO SMTP relay — external emails will attempt direct delivery')
      console.log('  ⚠️  Direct delivery usually FAILS without:')
      console.log('     - Port 25 open (blocked by most ISPs/cloud providers)')
      console.log('     - Valid PTR record for your IP')
      console.log('     - SPF/DKIM/DMARC configured')
      console.log('  ⚠️  FIX: Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env (e.g. use Amazon SES, SendGrid, Mailgun)')
    }

    console.log('\n========================================')
    process.exit(0)
  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err)
    process.exit(1)
  }
}

main()
