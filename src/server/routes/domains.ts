import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { promises as dnsPromises } from 'node:dns'
import { generateKeyPairSync } from 'node:crypto'
import { db } from '../../db'
import { domains, organizationUsers, organizations } from '../../db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { isPlatformAdmin } from '../lib/admin'
import { readBranding } from '../lib/serverBranding'

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

async function resolveMx(hostname: string): Promise<{ exchange: string; priority: number }[]> {
    try {
        return await resolver.resolveMx(hostname)
    } catch {
        return []
    }
}

async function resolveCname(hostname: string): Promise<string[]> {
    try {
        return await resolver.resolveCname(hostname)
    } catch {
        return []
    }
}

const router = Router()

function generateDkimKeys(): { privateKey: string; publicKey: string } {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'der' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    })
    const publicKeyBase64 = (publicKey as Buffer).toString('base64')
    return {
        privateKey: privateKey as string,
        publicKey: `v=DKIM1; k=rsa; p=${publicKeyBase64}`,
    }
}

// Validation schemas
const createDomainSchema = z.object({
    organizationId: z.string().uuid(),
    name: z.string().min(1).max(255),
    verificationMethod: z.enum(['dns', 'email']).default('dns'),
})

// Helper to check access
async function checkDomainAccess(userId: string, organizationId: string) {
    const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, organizationId),
    })

    if (!organization) return { organization: null, membership: null }

    if (await isPlatformAdmin(userId)) {
        return { organization, membership: { role: "admin" as const } }
    }

    const membership = await db.query.organizationUsers.findFirst({
        where: and(
            eq(organizationUsers.organizationId, organization.id),
            eq(organizationUsers.userId, userId)
        ),
    })

    return { organization, membership }
}

// List domains for organization (or all domains for user if no organizationId)
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string
        const organizationId = req.query.organizationId as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // If organizationId is provided, list domains for that organization
        if (organizationId) {
            const { organization, membership } = await checkDomainAccess(userId, organizationId)

            if (!organization || !membership) {
                return res.status(403).json({ error: 'Access denied' })
            }

            const domainsList = await db.query.domains.findMany({
                where: eq(domains.organizationId, organizationId),
            })

            return res.json({ domains: domainsList })
        }

        // No organizationId - list all domains for user's organizations
        const userOrgs = await db.query.organizationUsers.findMany({
            where: eq(organizationUsers.userId, userId),
            columns: { organizationId: true },
        })

        // Also include orgs where user is platform admin
        const isAdmin = await isPlatformAdmin(userId)
        
        let domainsList: typeof domains.$inferSelect[] = []
        if (isAdmin && userOrgs.length === 0) {
            // Platform admin with no org membership - show all domains
            domainsList = await db.query.domains.findMany()
        } else if (userOrgs.length > 0) {
            // Get domains from all user's organizations
            const orgIds = userOrgs.map(o => o.organizationId)
            domainsList = await db.query.domains.findMany({
                where: inArray(domains.organizationId, orgIds),
            })
        }

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

        const { organization, membership } = await checkDomainAccess(userId, domain.organizationId)

        if (!organization || !membership) {
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

        const { organization, membership } = await checkDomainAccess(userId, data.organizationId)

        if (!organization || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can add domains' })
        }

        // Check if domain already exists
        const existingDomain = await db.query.domains.findFirst({
            where: and(
                eq(domains.organizationId, data.organizationId),
                eq(domains.name, data.name)
            ),
        })

        if (existingDomain) {
            return res.status(400).json({ error: 'Domain already exists' })
        }

        const { privateKey: dkimPrivateKey, publicKey: dkimPublicKey } = generateDkimKeys()

        const [domain] = await db.insert(domains).values({
            organizationId: data.organizationId,
            name: data.name,
            verificationMethod: data.verificationMethod,
            verificationToken: uuidv4(),
            dkimSelector: 'skaleclub',
            dkimPrivateKey,
            dkimPublicKey,
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

        const { organization, membership } = await checkDomainAccess(userId, domain.organizationId)

        if (!organization || !membership || membership.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can verify domains' })
        }

        // Ensure DKIM keys exist — generate for legacy domains created before this feature
        let resolvedDkimPrivateKey = domain.dkimPrivateKey
        let resolvedDkimPublicKey = domain.dkimPublicKey
        if (!resolvedDkimPrivateKey || !resolvedDkimPublicKey) {
            const keys = generateDkimKeys()
            resolvedDkimPrivateKey = keys.privateKey
            resolvedDkimPublicKey = keys.publicKey
        }

        const { mailHost: configuredMailHost } = await readBranding()
        const MAIL_HOST = configuredMailHost

        const domainName = domain.name
        const expectedToken = `skaleclub-verification:${domain.verificationToken}`
        const dkimSelector = 'skaleclub'
        const normalizeDns = (s: string) => s.toLowerCase().replace(/\.$/, '')
        const returnPathTarget = 'rp.skaleclub.com'

        // Optional: verify only a specific record (avoids overwriting other verified records)
        const targetRecord = req.body?.record as string | undefined

        // Determine which lookups we need
        const needsRoot = !targetRecord || targetRecord === 'verification' || targetRecord === 'spf'
        const needsDkim = !targetRecord || targetRecord === 'dkim'
        const needsDmarc = !targetRecord || targetRecord === 'dmarc'
        const needsMx = !targetRecord || targetRecord === 'mx'
        const needsReturnPath = !targetRecord || targetRecord === 'returnPath'

        const [rootTxt, dkimTxt, dmarcTxt, mxRecords, returnPathCname] = await Promise.all([
            needsRoot       ? resolveTxt(domainName)                               : Promise.resolve([]),
            needsDkim       ? resolveTxt(`${dkimSelector}._domainkey.${domainName}`) : Promise.resolve([]),
            needsDmarc      ? resolveTxt(`_dmarc.${domainName}`)                   : Promise.resolve([]),
            needsMx         ? resolveMx(domainName)                                : Promise.resolve([]),
            needsReturnPath ? resolveCname(`rp.${domainName}`)                     : Promise.resolve([]),
        ])

        // Compute results only for records being checked; fall back to current DB value otherwise
        const verificationFound = needsRoot ? rootTxt.some((r) => r === expectedToken) : domain.verificationStatus === 'verified'
        const verificationStatus = verificationFound ? 'verified' as const : 'failed' as const

        const spfFound = needsRoot ? rootTxt.some((r) => r.startsWith('v=spf1') && r.includes('spf.skaleclub.com')) : domain.spfStatus === 'verified'
        const spfStatus = spfFound ? 'verified' : 'failed'
        const spfError = spfFound ? null : 'SPF record not found or does not include spf.skaleclub.com'

        const dkimFound = needsDkim ? (dkimTxt.length > 0 && dkimTxt.some((r) => r.startsWith('v=DKIM1'))) : domain.dkimStatus === 'verified'
        const dkimStatus = dkimFound ? 'verified' : 'failed'
        const dkimError = dkimFound ? null : 'DKIM record not found'

        const dmarcFound = needsDmarc ? dmarcTxt.some((r) => r.startsWith('v=DMARC1')) : domain.dmarcStatus === 'verified'
        const dmarcStatus = dmarcFound ? 'verified' : 'failed'
        const dmarcError = dmarcFound ? null : 'DMARC record not found'

        const mxFound = needsMx ? mxRecords.some((r) => normalizeDns(r.exchange) === normalizeDns(MAIL_HOST)) : domain.mxStatus === 'verified'
        const mxStatus = mxFound ? 'verified' : 'failed'
        const mxFoundValues = needsMx ? mxRecords.map((r) => `${r.exchange} (priority ${r.priority})`).join(', ') : ''
        const mxError = mxFound ? null : `MX record not found or does not point to ${MAIL_HOST}${mxFoundValues ? `. Found: ${mxFoundValues}` : ' (no MX records found)'}`

        const returnPathFound = needsReturnPath ? returnPathCname.some((r) => normalizeDns(r) === normalizeDns(returnPathTarget)) : domain.returnPathStatus === 'verified'
        const returnPathStatus = returnPathFound ? 'verified' : 'failed'
        const returnPathError = returnPathFound ? null : `Return-Path CNAME not found (expected rp.${domainName} → ${returnPathTarget})`

        const allVerified = verificationFound && spfFound && dkimFound && dmarcFound && mxFound && returnPathFound

        const [updatedDomain] = await db
            .update(domains)
            .set({
                verificationStatus,
                verifiedAt: allVerified ? new Date() : null,
                dkimPrivateKey: resolvedDkimPrivateKey,
                dkimPublicKey: resolvedDkimPublicKey,
                dkimSelector: 'skaleclub',
                spfStatus,
                spfError,
                dkimStatus,
                dkimError,
                dmarcStatus,
                dmarcError,
                mxStatus,
                mxError,
                returnPathStatus,
                returnPathError,
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
                mx: { found: mxFound, error: mxError },
                returnPath: { found: returnPathFound, error: returnPathError },
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

        const { organization, membership } = await checkDomainAccess(userId, domain.organizationId)

        if (!organization || !membership || membership.role !== 'admin') {
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
