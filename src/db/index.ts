import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
    throw new Error('Missing DATABASE_URL')
}

// For query purposes
export const queryClient = postgres(connectionString, {
    max: Number(process.env.DB_POOL_MAX || 10),
    idle_timeout: Number(process.env.DB_IDLE_TIMEOUT_SECONDS || 20),
    connect_timeout: Number(process.env.DB_CONNECT_TIMEOUT_SECONDS || 10),
    max_lifetime: Number(process.env.DB_MAX_LIFETIME_SECONDS || 60 * 30),
})

export const db = drizzle(queryClient, { schema })

export async function checkDatabaseHealth() {
    const startedAt = Date.now()
    await queryClient`select 1`
    return {
        ok: true as const,
        latencyMs: Date.now() - startedAt,
    }
}

export async function closeDatabaseConnection() {
    await queryClient.end()
}

// Export schema for convenience
export * from './schema'
