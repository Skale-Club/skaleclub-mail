import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAnonClient = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey)

export function createSupabaseUserClient(accessToken: string) {
    return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: { Authorization: `Bearer ${accessToken}` },
        },
    })
}

export async function checkSupabaseAuthHealth(timeoutMs = 5_000) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
            method: 'GET',
            headers: {
                apikey: supabaseAnonKey,
            },
            signal: controller.signal,
        })

        if (!response.ok) {
            throw new Error(`Supabase auth healthcheck failed with status ${response.status}`)
        }

        return { ok: true as const }
    } finally {
        clearTimeout(timeout)
    }
}
