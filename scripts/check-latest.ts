import 'dotenv/config'
import { db } from '../src/db/index'
import { mailMessages } from '../src/db/schema'
import { desc } from 'drizzle-orm'

async function main() {
  const msgs = await db.select({
    subject: mailMessages.subject,
    fromAddress: mailMessages.fromAddress,
    fromName: mailMessages.fromName,
    toAddresses: mailMessages.toAddresses,
    ccAddresses: mailMessages.ccAddresses,
    bccAddresses: mailMessages.bccAddresses,
  }).from(mailMessages).orderBy(desc(mailMessages.receivedAt)).limit(2)

  for (const m of msgs) {
    console.log('---')
    console.log('subject:', m.subject)
    console.log('from:', m.fromAddress, '(', m.fromName, ')')
    console.log('toAddresses (raw):', JSON.stringify(m.toAddresses))
    console.log('ccAddresses (raw):', JSON.stringify(m.ccAddresses))
    console.log('bccAddresses (raw):', JSON.stringify(m.bccAddresses))
  }
  process.exit(0)
}
main().catch(e => { console.error(e); process.exit(1) })
