import 'dotenv/config'
import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface IndexInfo {
    indexName: string
    tableName: string
    isValid: boolean
    isReady: boolean
}

interface IndexDefinition {
    indexName: string
    createStatement: string
}

/**
 * Parse CREATE INDEX CONCURRENTLY IF NOT EXISTS statements from indexes.sql
 * and extract index names for re-creation.
 */
function parseIndexDefinitions(): IndexDefinition[] {
    const sqlPath = path.join(__dirname, '../sql/indexes.sql')
    if (!fs.existsSync(sqlPath)) {
        console.error('sql/indexes.sql not found')
        return []
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    const definitions: IndexDefinition[] = []

    // Match CREATE INDEX CONCURRENTLY IF NOT EXISTS statements
    const regex = /CREATE\s+INDEX\s+CONCURRENTLY\s+IF\s+NOT\s+EXISTS\s+(\w+)\s+ON\s+\w+/gi
    let match: RegExpExecArray | null

    while ((match = regex.exec(sqlContent)) !== null) {
        const indexName = match[1]
        // Extract the full statement (from this CREATE up to the next semicolon)
        const startIdx = match.index
        const endIdx = sqlContent.indexOf(';', startIdx)
        const createStatement = sqlContent.slice(startIdx, endIdx + 1).trim()

        definitions.push({ indexName, createStatement })
    }

    return definitions
}

/**
 * Get all indexes in the public schema with their validity status.
 */
async function getIndexes(sql: postgres.Sql): Promise<IndexInfo[]> {
    const result = await sql`
        SELECT
            i.indexrelid::regclass::text AS index_name,
            t.relname AS table_name,
            i.indisvalid AS is_valid,
            i.indisready AS is_ready
        FROM pg_index i
        JOIN pg_class t ON i.indrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.relkind = 'r'
          AND i.indexrelid::regclass::text NOT LIKE 'pg_%'
        ORDER BY t.relname, i.indexrelid::regclass::text
    `

    return result.map((row) => ({
        indexName: row.index_name,
        tableName: row.table_name,
        isValid: row.is_valid,
        isReady: row.is_ready,
    }))
}

async function main() {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        console.error('DATABASE_URL is not set')
        process.exit(1)
    }

    const sql = postgres(connectionString, {
        ssl: 'require',
        onnotice: () => {},
    })

    try {
        console.log('=== Index Health Check ===\n')

        // Parse known index definitions from sql/indexes.sql
        const knownIndexes = parseIndexDefinitions()
        console.log(`Found ${knownIndexes.length} index definitions in sql/indexes.sql\n`)

        // Get current indexes from database
        const indexes = await getIndexes(sql)

        if (indexes.length === 0) {
            console.log('No indexes found in public schema.')
            await sql.end()
            process.exit(0)
        }

        // Report status
        const valid = indexes.filter((i) => i.isValid)
        const invalid = indexes.filter((i) => !i.isValid)

        console.log(`Total indexes: ${indexes.length}`)
        console.log(`  Valid:   ${valid.length}`)
        console.log(`  Invalid: ${invalid.length}\n`)

        if (invalid.length === 0) {
            console.log('All indexes are valid. No action needed.')
            await sql.end()
            process.exit(0)
        }

        // Show invalid indexes
        console.log('Invalid indexes detected:')
        for (const idx of invalid) {
            console.log(`  - ${idx.indexName} on ${idx.tableName} (ready: ${idx.isReady})`)
        }
        console.log('')

        // Drop and retry invalid indexes
        const remainingInvalid: string[] = []
        for (const idx of invalid) {
            console.log(`Dropping invalid index: ${idx.indexName}...`)
            try {
                await sql.unsafe(`DROP INDEX CONCURRENTLY IF EXISTS ${idx.indexName}`)
            } catch (dropError) {
                const msg = dropError instanceof Error ? dropError.message : String(dropError)
                console.error(`  Failed to drop: ${msg}`)
                remainingInvalid.push(idx.indexName)
                continue
            }

            // Find the CREATE INDEX statement for this index
            const definition = knownIndexes.find(
                (d) => d.indexName.toLowerCase() === idx.indexName.toLowerCase()
            )

            if (!definition) {
                console.warn(`  No definition found in sql/indexes.sql for ${idx.indexName} — skipping re-creation`)
                remainingInvalid.push(idx.indexName)
                continue
            }

            console.log(`Re-creating: ${idx.indexName}...`)
            try {
                await sql.unsafe(definition.createStatement)
            } catch (recreateError) {
                const msg =
                    recreateError instanceof Error ? recreateError.message : String(recreateError)
                console.error(`  Failed to re-create: ${msg}`)
                remainingInvalid.push(idx.indexName)
                continue
            }

            // Re-check validity
            const [recheck] = await sql`
                SELECT indisvalid
                FROM pg_index i
                WHERE i.indexrelid::regclass::text = ${idx.indexName}
            `

            if (recheck && recheck.indisvalid) {
                console.log(`  ✓ ${idx.indexName} is now valid`)
            } else {
                console.error(`  ✗ ${idx.indexName} is still invalid after retry`)
                remainingInvalid.push(idx.indexName)
            }
        }

        // Final summary
        console.log('\n=== Final Summary ===')
        console.log(`Total indexes: ${indexes.length}`)
        console.log(`  Valid:   ${indexes.length - remainingInvalid.length}`)
        console.log(`  Invalid: ${remainingInvalid.length}`)

        if (remainingInvalid.length > 0) {
            console.error('\nIndexes still invalid after retry:')
            for (const name of remainingInvalid) {
                console.error(`  - ${name}`)
            }
            await sql.end()
            process.exit(1)
        }

        console.log('\nAll indexes are valid.')
        await sql.end()
        process.exit(0)
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Index verification failed: ${message}`)
        await sql.end()
        process.exit(1)
    }
}

main()
