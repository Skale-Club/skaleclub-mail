import { Router, Request, Response } from 'express'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../../db'
import { organizationUsers, outlookMailboxes, servers } from '../../db/schema'
import {
    buildOutlookOauthUrl,
    createOutlookOauthState,
    exchangeCodeForOutlookConnection,
    parseOutlookOauthState,
    resolveOutlookMailboxForServer,
    sanitizeOutlookMailbox,
    sendMessageWithOutlook,
} from '../lib/outlook'
import { encryptSecret } from '../lib/crypto'

const router = Router()

const startSchema = z.object({
    serverId: z.string().uuid(),
    loginHint: z.string().email().optional(),
})

const sendTestSchema = z.object({
    to: z.string().email(),
    subject: z.string().min(1).default('SkaleClub Mail Outlook test'),
    body: z.string().min(1).default('This is a test message sent through Microsoft Graph.'),
})

async function checkOutlookAccess(userId: string, serverId: string) {
    const server = await db.query.servers.findFirst({
        where: eq(servers.id, serverId),
    })

    if (!server) {
        return { server: null, membership: null }
    }

    const membership = await db.query.organizationUsers.findFirst({
        where: and(
            eq(organizationUsers.organizationId, server.organizationId),
            eq(organizationUsers.userId, userId),
        ),
    })

    return { server, membership }
}

function buildFrontendRedirect(params: Record<string, string>) {
    const url = new URL('/admin/servers', process.env.FRONTEND_URL || 'http://localhost:9000')

    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value)
    }

    return url.toString()
}

router.post('/connect/start', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const data = startSchema.parse(req.body)
        const { server, membership } = await checkOutlookAccess(userId, data.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can connect Outlook mailboxes' })
        }

        const state = createOutlookOauthState(userId, data.serverId)
        const authUrl = buildOutlookOauthUrl(state, data.loginHint)

        res.json({
            authUrl,
            state,
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }

        console.error('Error starting Outlook OAuth:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/callback', async (req: Request, res: Response) => {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined
    const stateParam = typeof req.query.state === 'string' ? req.query.state : undefined
    const oauthError = typeof req.query.error === 'string' ? req.query.error : undefined

    if (oauthError) {
        return res.redirect(buildFrontendRedirect({
            outlook: 'error',
            reason: oauthError,
        }))
    }

    if (!code || !stateParam) {
        return res.status(400).json({ error: 'Missing OAuth code or state' })
    }

    try {
        const state = parseOutlookOauthState(stateParam)
        const { server, membership } = await checkOutlookAccess(state.userId, state.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Outlook callback is no longer authorized' })
        }

        const connection = await exchangeCodeForOutlookConnection(code)
        const mailboxEmail = connection.profile.mail || connection.profile.userPrincipalName

        if (!mailboxEmail) {
            throw new Error('Outlook account does not expose a usable mailbox address')
        }

        const existingMailbox =
            await db.query.outlookMailboxes.findFirst({
                where: eq(outlookMailboxes.microsoftUserId, connection.profile.id),
            }) ||
            await db.query.outlookMailboxes.findFirst({
                where: and(
                    eq(outlookMailboxes.serverId, state.serverId),
                    eq(outlookMailboxes.email, mailboxEmail),
                ),
            })

        const payload = {
            serverId: state.serverId,
            email: mailboxEmail,
            displayName: connection.profile.displayName || null,
            microsoftUserId: connection.profile.id,
            tenantId: connection.tenantId,
            scopes: connection.scopes,
            accessTokenEncrypted: encryptSecret(connection.accessToken),
            refreshTokenEncrypted: encryptSecret(connection.refreshToken || connection.accessToken),
            tokenExpiresAt: connection.expiresAt,
            status: 'active' as const,
            lastSyncedAt: new Date(),
            updatedAt: new Date(),
        }

        const [mailbox] = existingMailbox
            ? await db
                .update(outlookMailboxes)
                .set(payload)
                .where(eq(outlookMailboxes.id, existingMailbox.id))
                .returning()
            : await db.insert(outlookMailboxes).values(payload).returning()

        return res.redirect(buildFrontendRedirect({
            outlook: 'connected',
            mailbox: mailbox.email,
        }))
    } catch (error) {
        console.error('Error completing Outlook OAuth:', error)
        return res.redirect(buildFrontendRedirect({
            outlook: 'error',
            reason: error instanceof Error ? error.message : 'callback_failed',
        }))
    }
})

router.get('/mailboxes', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.query.serverId as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!serverId) {
            return res.status(400).json({ error: 'Server ID required' })
        }

        const { server, membership } = await checkOutlookAccess(userId, serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const mailboxes = await db.query.outlookMailboxes.findMany({
            where: eq(outlookMailboxes.serverId, serverId),
        })

        res.json({
            mailboxes: mailboxes.map(sanitizeOutlookMailbox),
        })
    } catch (error) {
        console.error('Error listing Outlook mailboxes:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.post('/mailboxes/:id/send-test', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await db.query.outlookMailboxes.findFirst({
            where: eq(outlookMailboxes.id, mailboxId),
        })

        if (!mailbox) {
            return res.status(404).json({ error: 'Outlook mailbox not found' })
        }

        const { server, membership } = await checkOutlookAccess(userId, mailbox.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can send Outlook tests' })
        }

        const data = sendTestSchema.parse(req.body)

        await sendMessageWithOutlook({
            serverId: mailbox.serverId,
            mailboxId: mailbox.id,
            fromAddress: mailbox.email,
            to: [data.to],
            subject: data.subject,
            plainBody: data.body,
        })

        res.json({
            message: 'Test message sent successfully',
            mailbox: sanitizeOutlookMailbox(mailbox),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }

        console.error('Error sending Outlook test:', error)
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Internal server error',
        })
    }
})

router.delete('/mailboxes/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await db.query.outlookMailboxes.findFirst({
            where: eq(outlookMailboxes.id, mailboxId),
        })

        if (!mailbox) {
            return res.status(404).json({ error: 'Outlook mailbox not found' })
        }

        const { server, membership } = await checkOutlookAccess(userId, mailbox.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can disconnect Outlook mailboxes' })
        }

        await db.delete(outlookMailboxes).where(eq(outlookMailboxes.id, mailboxId))

        res.json({ message: 'Outlook mailbox disconnected successfully' })
    } catch (error) {
        console.error('Error disconnecting Outlook mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/mailboxes/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const mailboxId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const mailbox = await db.query.outlookMailboxes.findFirst({
            where: eq(outlookMailboxes.id, mailboxId),
        })

        if (!mailbox) {
            return res.status(404).json({ error: 'Outlook mailbox not found' })
        }

        const { server, membership } = await checkOutlookAccess(userId, mailbox.serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const activeMailbox = await resolveOutlookMailboxForServer(mailbox.serverId, mailbox.id)

        res.json({
            mailbox: sanitizeOutlookMailbox(activeMailbox || mailbox),
        })
    } catch (error) {
        console.error('Error fetching Outlook mailbox:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
