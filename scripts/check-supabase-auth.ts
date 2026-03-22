import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function checkSupabaseAuthUsers() {
    console.log('=== Supabase Auth Users ===\n')

    // Use admin API to list all auth users
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error fetching users:', error)
        process.exit(1)
    }

    if (!data.users || data.users.length === 0) {
        console.log('No users found in Supabase Auth')
        process.exit(0)
    }

    console.log('Users in Supabase Auth:')
    data.users.forEach(user => {
        console.log(`ID: ${user.id}`)
        console.log(`Email: ${user.email}`)
        console.log(`Created: ${user.created_at}`)
        console.log(`Last Sign In: ${user.last_sign_in_at}`)
        console.log('---')
    })

    // Check if any user matches the local database user
    const localDbUserId = '281ea4f4-889f-40a6-ba93-cc5a3c6f2dba'
    const localDbEmail = 'skale.club@gmail.com'

    const matchingUser = data.users.find(u => u.email === localDbEmail)

    console.log('\n=== Analysis ===')
    if (matchingUser) {
        console.log(`User with email ${localDbEmail} found in Supabase Auth`)
        console.log(`Supabase Auth ID: ${matchingUser.id}`)
        console.log(`Local Database ID: ${localDbUserId}`)

        if (matchingUser.id === localDbUserId) {
            console.log('\nIDs MATCH! The issue is somewhere else.')
        } else {
            console.log('\nIDs DO NOT MATCH!')
            console.log('This is the problem. The organization is linked to the local DB ID,')
            console.log('but the system uses the Supabase Auth ID.')
            console.log('\nTo fix this, you need to update the organization_users table')
            console.log(`to use the Supabase Auth ID: ${matchingUser.id}`)
        }
    } else {
        console.log(`No user with email ${localDbEmail} found in Supabase Auth`)
        console.log('You need to create/login with this email first.')
    }

    process.exit(0)
}

checkSupabaseAuthUsers().catch(console.error)
