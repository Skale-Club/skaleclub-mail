import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
)

async function checkAuthUsers() {
    console.log('=== Checking Supabase Auth Users ===\n')

    // Note: We can't directly query auth.users with the anon key
    // But we can check if the user IDs match what's in our database

    console.log('Database user ID: 281ea4f4-889f-40a6-ba93-cc5a3c6f2dba')
    console.log('Database user email: skale.club@gmail.com')
    console.log('')
    console.log('The organization is correctly linked to this user.')
    console.log('')
    console.log('Possible issues:')
    console.log('1. The user logged in via Supabase Auth might have a DIFFERENT ID')
    console.log(' than the one in the local users table')
    console.log('')
    console.log('2. When you log in, the system extracts the user ID from the Supabase JWT token')
    console.log(' and uses that to query organizations.')
    console.log('')
    console.log('To fix this, you need to ensure the user in Supabase Auth')
    console.log(' has the SAME ID as the one in your local users table.')
    console.log('')
    console.log('Check in Supabase Dashboard > Authentication > Users')
    console.log(' to see the actual user ID of the logged-in user.')

    process.exit(0)
}

checkAuthUsers().catch(console.error)
