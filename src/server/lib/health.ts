import { checkDatabaseHealth } from '../../db'
import { checkSupabaseAuthHealth } from './supabase'

export async function runReadinessChecks() {
    const startedAt = Date.now()
    const [dbResult, authResult] = await Promise.allSettled([
        checkDatabaseHealth(),
        checkSupabaseAuthHealth(),
    ])

    const database = dbResult.status === 'fulfilled'
        ? { ok: true, latencyMs: dbResult.value.latencyMs }
        : { ok: false, error: dbResult.reason instanceof Error ? dbResult.reason.message : 'Database healthcheck failed' }

    const auth = authResult.status === 'fulfilled'
        ? { ok: true }
        : { ok: false, error: authResult.reason instanceof Error ? authResult.reason.message : 'Supabase auth healthcheck failed' }

    return {
        ok: database.ok && auth.ok,
        checkedAt: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        services: {
            database,
            auth,
        },
    }
}
