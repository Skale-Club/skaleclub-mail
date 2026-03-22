import { supabase } from '../../../lib/supabase'

export async function getAccessToken() {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token
}

export function generateSlug(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50)
}

export const timezoneOptions = [
    'UTC',
    'America/Sao_Paulo',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
]
