import 'dotenv/config'
import postgres from 'postgres'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function hasExecutableContent(statement: string) {
    return statement
        .replace(/--.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim().length > 0
}

function splitSqlStatements(sqlText: string) {
    const statements: string[] = []
    let current = ''
    let inSingleQuote = false
    let inDoubleQuote = false
    let inLineComment = false
    let inBlockComment = false
    let dollarQuoteTag: string | null = null

    for (let index = 0; index < sqlText.length; index++) {
        const char = sqlText[index]
        const nextChar = sqlText[index + 1]

        if (inLineComment) {
            current += char
            if (char === '\n') {
                inLineComment = false
            }
            continue
        }

        if (inBlockComment) {
            current += char
            if (char === '*' && nextChar === '/') {
                current += nextChar
                index++
                inBlockComment = false
            }
            continue
        }

        if (dollarQuoteTag) {
            if (sqlText.startsWith(dollarQuoteTag, index)) {
                current += dollarQuoteTag
                index += dollarQuoteTag.length - 1
                dollarQuoteTag = null
            } else {
                current += char
            }
            continue
        }

        if (!inSingleQuote && !inDoubleQuote) {
            if (char === '-' && nextChar === '-') {
                current += char + nextChar
                index++
                inLineComment = true
                continue
            }

            if (char === '/' && nextChar === '*') {
                current += char + nextChar
                index++
                inBlockComment = true
                continue
            }

            if (char === '$') {
                const match = sqlText.slice(index).match(/^\$[A-Za-z0-9_]*\$/)
                if (match) {
                    dollarQuoteTag = match[0]
                    current += dollarQuoteTag
                    index += dollarQuoteTag.length - 1
                    continue
                }
            }
        }

        if (char === '\'' && !inDoubleQuote) {
            current += char
            if (inSingleQuote && nextChar === '\'') {
                current += nextChar
                index++
            } else {
                inSingleQuote = !inSingleQuote
            }
            continue
        }

        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote
            current += char
            continue
        }

        if (char === ';' && !inSingleQuote && !inDoubleQuote) {
            const statement = current.trim()
            if (hasExecutableContent(statement)) {
                statements.push(statement)
            }
            current = ''
            continue
        }

        current += char
    }

    const finalStatement = current.trim()
    if (hasExecutableContent(finalStatement)) {
        statements.push(finalStatement)
    }

    return statements
}

async function runMigration() {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
        console.error('DATABASE_URL is not set in the .env file')
        process.exit(1)
    }

    const migrationsDir = path.join(__dirname, '../supabase/migrations')
    const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter((file) => file.endsWith('.sql'))
        .sort()

    if (migrationFiles.length === 0) {
        console.error('No SQL migration files found in supabase/migrations')
        process.exit(1)
    }

    console.log(`Connecting to database and applying ${migrationFiles.length} migration file(s)...`)
    const sql = postgres(connectionString, {
        ssl: 'require',
        onnotice: () => {},
    })

    try {
        for (const fileName of migrationFiles) {
            const migrationPath = path.join(migrationsDir, fileName)
            const migrationSql = fs.readFileSync(migrationPath, 'utf-8')
            const statements = splitSqlStatements(migrationSql)

            console.log(`\nRunning ${fileName} (${statements.length} statements)...`)

            for (const statement of statements) {
                try {
                    await sql.unsafe(statement)
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error)
                    console.error(`Failed statement in ${fileName}:`)
                    console.error(statement)
                    console.error(`Error: ${message}`)
                    throw error
                }
            }

            console.log(`[ok] ${fileName}`)
        }

        console.log('\nRLS migration completed successfully.')
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        console.error(`Migration failed: ${message}`)
        console.error(error)
        process.exitCode = 1
    } finally {
        await sql.end()
    }
}

runMigration()
