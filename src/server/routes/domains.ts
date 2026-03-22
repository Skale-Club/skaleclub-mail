import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { promises as dnsPromises } from 'node:dns'
import { db } from '../../db'
import { domains, servers, organizationUsers } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { isPlatformAdmin } from '../lib/admin'

const resolver = new dnsPromises.Resolver()
resolver.setServers((process.env.DNS_SERVERS || '8.8.8.8,1.1.1.1').split(','))

async function resolveTxt(hostname: string): Promise<string[]> {
    try {
        const records = await resolver.resolveTxt(hostname)
        return records.map((chunks) => chunks.join(''))
    } catch {
        return []
    }
}

const router = Router()

// Validation schemas
const createDomainSchema = z.object({
    serverId: z.string().uuid(),
    name: z.string().min(1).max(255),
    verificationMethod: z.enum(['dns', 'email']).default('dns'),
})

// Helper to check access
async function checkDomainAccess(userId: string, serverId: string) {
    const server = await db.query.servers.findFirst({
        where: eq(servers.id, serverId),
    })

    if (!server) return { server: null, membership: null }

    if (await isPlatformAdmin(userId)) {
        return { server, membership: { role: 'admin' as const } }
    }

    const membership = await db.query.organizationUsers.findFirst({
        where: and(
            eq(organizationUsers.organizationId, server.organizationId),
            eq(organizationUsers.userId, userId)
        ),
    })

    return { server, membership }
}

// List domains for server
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const serverId = req.query.serverId as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!serverId) {
            return res.status(400).json({ error: 'Server ID required' })
        }

        const { server, membership } = await checkDomainAccess(userId, serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        const domainsList = await db.query.domains.findMany({
            where: eq(domains.serverId, serverId),
        })

        res.json({ domains: domainsList })
    } catch (error) {
        console.error('Error fetching domains:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Get domain by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const domainId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const domain = await db.query.domains.findFirst({
            where: eq(domains.id, domainId),
        })

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' })
        }

        const { server, membership } = await checkDomainAccess(userId, domain.serverId)

        if (!server || !membership) {
            return res.status(403).json({ error: 'Access denied' })
        }

        res.json({ domain })
    } catch (error) {
        console.error('Error fetching domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Create domain
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const data = createDomainSchema.parse(req.body)

        const { server, membership } = await checkDomainAccess(userId, data.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can add domains' })
        }

        // Check if domain already exists
        const existingDomain = await db.query.domains.findFirst({
            where: and(
                eq(domains.serverId, data.serverId),
                eq(domains.name, data.name)
            ),
        })

        if (existingDomain) {
            return res.status(400).json({ error: 'Domain already exists' })
        }

        const [domain] = await db.insert(domains).values({
            serverId: data.serverId,
            name: data.name,
            verificationMethod: data.verificationMethod,
            verificationToken: uuidv4(),
        }).returning()

        res.status(201).json({ domain })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors })
        }
        console.error('Error creating domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Verify domain — performs real DNS lookups
router.post('/:id/verify', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const domainId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const domain = await db.query.domains.findFirst({
            where: eq(domains.id, domainId),
        })

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' })
        }

        const { server, membership } = await checkDomainAccess(userId, domain.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can verify domains' })
        }

        const domainName = domain.name
        const expectedToken = `skaleclub-verification:${domain.verificationToken}`
        const dkimSelector = domain.dkimSelector || 'postal'

        // Run all DNS lookups in parallel
        const [rootTxt, dkimTxt, dmarcTxt] = await Promise.all([
            resolveTxt(domainName),
            resolveTxt(`${dkimSelector}._domainkey.${domainName}`),
            resolveTxt(`_dmarc.${domainName}`),
        ])

        // 1) Skale Club verification code
        const verificationFound = rootTxt.some((r) => r === expectedToken)
        const verificationStatus = verificationFound ? 'verified' as const : 'failed' as const

        // 2) SPF
        const spfFound = rootTxt.some((r) => r.startsWith('v=spf1') && r.includes('spf.skaleclub.com'))
        const spfStatus = spfFound ? 'verified' : 'failed'
        const spfError = spfFound ? null : 'SPF record not found or does not include spf.skaleclub.com'

        // 3) DKIM
        const dkimFound = dkimTxt.length > 0 && dkimTxt.some((r) => r.startsWith('v=DKIM1'))
        const dkimStatus = dkimFound ? 'verified' : 'failed'
        const dkimError = dkimFound ? null : 'DKIM record not found'

        // 4) DMARC
        const dmarcFound = dmarcTxt.some((r) => r.startsWith('v=DMARC1'))
        const dmarcStatus = dmarcFound ? 'verified' : 'failed'
        const dmarcError = dmarcFound ? null : 'DMARC record not found'

        const allVerified = verificationFound && spfFound && dkimFound && dmarcFound

        const [updatedDomain] = await db
            .update(domains)
            .set({
                verificationStatus,
                verifiedAt: allVerified ? new Date() : null,
                spfStatus,
                spfError,
                dkimStatus,
                dkimError,
                dmarcStatus,
                dmarcError,
                updatedAt: new Date(),
            })
            .where(eq(domains.id, domainId))
            .returning()

        // Return per-record results so the frontend can show individual statuses
        res.json({
            domain: updatedDomain,
            dnsResults: {
                verification: { found: verificationFound },
                spf: { found: spfFound, error: spfError },
                dkim: { found: dkimFound, error: dkimError },
                dmarc: { found: dmarcFound, error: dmarcError },
            },
        })
    } catch (error) {
        console.error('Error verifying domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// Delete domain
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const domainId = req.params.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const domain = await db.query.domains.findFirst({
            where: eq(domains.id, domainId),
        })

        if (!domain) {
            return res.status(404).json({ error: 'Domain not found' })
        }

        const { server, membership } = await checkDomainAccess(userId, domain.serverId)

        if (!server || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can delete domains' })
        }

        await db.delete(domains).where(eq(domains.id, domainId))

        res.json({ message: 'Domain deleted successfully' })
    } catch (error) {
        console.error('Error deleting domain:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
