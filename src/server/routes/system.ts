import { Router, Request, Response } from 'express'
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'

const router = Router()

// GET /api/system/usage - Admin only
router.get('/usage', async (req: Request, res: Response) => {
    try {
        const requestingUserId = req.headers['x-user-id'] as string

        if (!requestingUserId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const requestingUser = await db.query.users.findFirst({
            where: eq(users.id, requestingUserId),
        })

        if (!requestingUser?.isAdmin) {
            return res.status(403).json({ error: 'Forbidden' })
        }

        // System storage from Supabase storage schema (direct Postgres access)
        const storageResult = await db.execute(sql`
            SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint AS total_bytes
            FROM storage.objects
            WHERE metadata->>'size' IS NOT NULL
        `)
        const totalStorageBytes = Number((storageResult as any)[0]?.total_bytes ?? 0)
        const storageLimitBytes = Number(process.env.STORAGE_LIMIT_BYTES) || 10 * 1024 * 1024 * 1024

        // Per-user usage: message count + estimated attachment size from base64 content in DB
        // Exclude admin users (they manage the system, not part of organizations/plans)
        const userUsageResult = await db.execute(sql`
            SELECT
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                COUNT(DISTINCT m.id)::int AS message_count,
                COALESCE(
                    SUM(
                        CASE
                            WHEN jsonb_array_length(m.attachments) > 0
                            THEN (
                                SELECT COALESCE(SUM((length(att->>'content') * 3 / 4)::bigint), 0)
                                FROM jsonb_array_elements(m.attachments) AS att
                                WHERE att->>'content' IS NOT NULL
                            )
                            ELSE 0
                        END
                    )
                , 0)::bigint AS attachment_bytes
            FROM users u
            LEFT JOIN organization_users ou ON ou.user_id = u.id
            LEFT JOIN organizations org ON org.id = ou.organization_id
            LEFT JOIN servers s ON s.organization_id = org.id
            LEFT JOIN messages m ON m.server_id = s.id
            WHERE u.is_admin = false
            GROUP BY u.id, u.email, u.first_name, u.last_name
            ORDER BY message_count DESC
        `)

        res.json({
            storage: {
                used: totalStorageBytes,
                limit: storageLimitBytes,
            },
            users: (userUsageResult as any[]).map((row) => ({
                id: row.id,
                email: row.email,
                firstName: row.first_name,
                lastName: row.last_name,
                messageCount: Number(row.message_count),
                attachmentBytes: Number(row.attachment_bytes),
            })),
        })
    } catch (error) {
        console.error('Error fetching system usage:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
