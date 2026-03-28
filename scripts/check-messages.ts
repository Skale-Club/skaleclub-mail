import 'dotenv/config'
import { db } from '../src/db/index'
import { mailMessages, mailFolders } from '../src/db/schema'
import { eq, desc } from 'drizzle-orm'

async function main() {
  const msgs = await db.select({
    id: mailMessages.id,
    folderId: mailMessages.folderId,
    subject: mailMessages.subject,
    fromAddress: mailMessages.fromAddress,
    toAddresses: mailMessages.toAddresses,
    receivedAt: mailMessages.receivedAt,
    isRead: mailMessages.isRead,
  }).from(mailMessages)
    .orderBy(desc(mailMessages.receivedAt))
    .limit(5)

  console.log(`\nLatest ${msgs.length} messages:\n`)

  for (const m of msgs) {
    const folder = await db.select({ type: mailFolders.type }).from(mailFolders).where(eq(mailFolders.id, m.folderId))
    const to = (m.toAddresses as any[]).map((t: any) => t.address).join(', ')
    console.log('---')
    console.log(`  Subject:  ${m.subject}`)
    console.log(`  From:     ${m.fromAddress}`)
    console.log(`  To:       ${to}`)
    console.log(`  Folder:   ${folder[0]?.type || '???'}`)
    console.log(`  Date:     ${m.receivedAt}`)
    console.log(`  Read:     ${m.isRead}`)
  }

  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
