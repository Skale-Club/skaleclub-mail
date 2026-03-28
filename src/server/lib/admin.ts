import { db, withRetry } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function isPlatformAdmin(userId: string): Promise<boolean> {
    const user = await withRetry(
        () => db.query.users.findFirst({ where: eq(users.id, userId) }),
        2,
        100
    )
    return user?.isAdmin === true
}
