import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DIRECT_URL!
const client = postgres(connectionString)

async function main() {
  const result = await `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'mail_filters' ORDER BY ordinal_position`
  console.log('mail_filters columns:')
  for (const row of result) {
    console.log(`  ${row.column_name}: ${row.data_type}`)
  }
  await client.end()
}

main().catch(console.error)