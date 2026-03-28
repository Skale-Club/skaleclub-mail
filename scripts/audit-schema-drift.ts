import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('Missing DATABASE_URL')
}

const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
})

const expected = [
    {
        table: 'contacts',
        columns: ['id', 'user_id', 'email', 'emailed_count', 'last_emailed_at', 'created_at', 'updated_at'],
        rls: true,
    },
    {
        table: 'mail_filters',
        columns: ['id', 'mailbox_id', 'conditions', 'actions', 'is_active', 'priority', 'created_at', 'updated_at'],
        rls: true,
    },
    {
        table: 'signatures',
        columns: ['id', 'mailbox_id', 'name', 'content', 'is_default', 'created_at', 'updated_at'],
        rls: true,
    },
    {
        table: 'mailboxes',
        columns: ['is_native'],
    },
    {
        table: 'email_accounts',
        columns: ['provider', 'outlook_mailbox_id', 'last_sent_at'],
    },
    {
        table: 'system_branding',
        columns: ['logo_storage', 'favicon_storage', 'mail_host'],
        rls: true,
    },
    {
        table: 'user_notifications',
        columns: ['user_id', 'type', 'title', 'message', 'metadata', 'read'],
        rls: true,
    },
] as const

async function main() {
    const [tables, columns, rls] = await Promise.all([
        sql<{ table_name: string }[]>`
            select table_name
            from information_schema.tables
            where table_schema = 'public'
        `,
        sql<{ table_name: string; column_name: string }[]>`
            select table_name, column_name
            from information_schema.columns
            where table_schema = 'public'
        `,
        sql<{ table_name: string; rls_enabled: boolean }[]>`
            select c.relname as table_name, c.relrowsecurity as rls_enabled
            from pg_class c
            join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public'
              and c.relkind = 'r'
        `,
    ])

    const tableSet = new Set(tables.map((row) => row.table_name))
    const columnMap = new Map<string, Set<string>>()
    const rlsMap = new Map<string, boolean>()

    for (const row of columns) {
        if (!columnMap.has(row.table_name)) {
            columnMap.set(row.table_name, new Set())
        }

        columnMap.get(row.table_name)!.add(row.column_name)
    }

    for (const row of rls) {
        rlsMap.set(row.table_name, row.rls_enabled)
    }

    const failures: string[] = []

    for (const item of expected) {
        if (!tableSet.has(item.table)) {
            failures.push(`Missing table: ${item.table}`)
            continue
        }

        const availableColumns = columnMap.get(item.table) ?? new Set<string>()

        for (const column of item.columns) {
            if (!availableColumns.has(column)) {
                failures.push(`Missing column: ${item.table}.${column}`)
            }
        }

        if (typeof item.rls === 'boolean' && rlsMap.get(item.table) !== item.rls) {
            failures.push(`Unexpected RLS flag: ${item.table} expected=${item.rls} actual=${rlsMap.get(item.table) ?? false}`)
        }
    }

    if (failures.length === 0) {
        console.log('Schema audit passed.')
        return
    }

    console.error('Schema audit failed:')
    for (const failure of failures) {
        console.error(`- ${failure}`)
    }

    process.exitCode = 1
}

main()
    .catch((error) => {
        console.error('Schema audit error:', error)
        process.exitCode = 1
    })
    .finally(async () => {
        await sql.end({ timeout: 1 })
    })
