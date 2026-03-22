import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function isPlatformAdmin(userId: string): Promise<boolean> {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
    return user?.isAdmin === true
}
