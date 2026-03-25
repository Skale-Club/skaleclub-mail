/**
 * Route Matcher for Inbound Email
 *
 * Matches incoming email recipients against configured routes.
 * Supports wildcard patterns:
 *   - *@domain.com    — matches any local part on the domain
 *   - user@*          — matches the user on any domain
 *   - *               — matches everything
 *   - exact address   — exact match
 */

import { db } from '../../db'
import { routes, smtpEndpoints, httpEndpoints, addressEndpoints, domains } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export interface MatchedRoute {
    route: typeof routes.$inferSelect
    endpoint: {
        type: 'smtp' | 'http' | 'address' | 'hold' | 'reject'
        config: Record<string, unknown> | null
    }
}

/**
 * Check if a recipient address matches a route pattern.
 */
function addressMatchesPattern(address: string, pattern: string): boolean {
    const normalizedAddress = address.toLowerCase().trim()
    const normalizedPattern = pattern.toLowerCase().trim()

    if (normalizedPattern === '*') return true

    const [addrLocal, addrDomain] = normalizedAddress.split('@')
    const patternParts = normalizedPattern.split('@')

    if (patternParts.length === 1) {
        // No @ — treat as domain-only pattern
        return addrDomain === normalizedPattern
    }

    const [patternLocal, patternDomain] = patternParts

    const localMatch = patternLocal === '*' || patternLocal === addrLocal
    const domainMatch = patternDomain === '*' || patternDomain === addrDomain

    return localMatch && domainMatch
}

/**
 * Find matching routes for a recipient address within an organization.
 */
export async function findMatchingRoutes(
    organizationId: string,
    recipientAddress: string
): Promise<MatchedRoute[]> {
    const orgRoutes = await db.query.routes.findMany({
        where: eq(routes.organizationId, organizationId),
    })

    const matched: MatchedRoute[] = []

    for (const route of orgRoutes) {
        if (!addressMatchesPattern(recipientAddress, route.address)) {
            continue
        }

        let endpoint: MatchedRoute['endpoint'] = {
            type: route.mode === 'endpoint' ? 'smtp' : route.mode,
            config: null,
        }

        if (route.mode === 'endpoint') {
            if (route.smtpEndpointId) {
                const smtpEp = await db.query.smtpEndpoints.findFirst({
                    where: eq(smtpEndpoints.id, route.smtpEndpointId),
                })
                if (smtpEp) {
                    endpoint = {
                        type: 'smtp',
                        config: {
                            hostname: smtpEp.hostname,
                            port: smtpEp.port,
                            sslMode: smtpEp.sslMode,
                            username: smtpEp.username,
                            password: smtpEp.password,
                        },
                    }
                }
            } else if (route.httpEndpointId) {
                const httpEp = await db.query.httpEndpoints.findFirst({
                    where: eq(httpEndpoints.id, route.httpEndpointId),
                })
                if (httpEp) {
                    endpoint = {
                        type: 'http',
                        config: {
                            url: httpEp.url,
                            method: httpEp.method,
                            headers: httpEp.headers,
                            includeOriginal: httpEp.includeOriginal,
                        },
                    }
                }
            } else if (route.addressEndpointId) {
                const addrEp = await db.query.addressEndpoints.findFirst({
                    where: eq(addressEndpoints.id, route.addressEndpointId),
                })
                if (addrEp) {
                    endpoint = {
                        type: 'address',
                        config: {
                            emailAddress: addrEp.emailAddress,
                        },
                    }
                }
            }
        }

        matched.push({ route, endpoint })
    }

    return matched
}

/**
 * Check if a domain is registered in any organization for inbound routing.
 * Returns the organizationId if found.
 */
export async function findOrganizationForDomain(emailDomain: string): Promise<string | null> {
    const domain = await db.query.domains.findFirst({
        where: and(
            eq(domains.name, emailDomain.toLowerCase()),
            eq(domains.verificationStatus, 'verified')
        ),
    })

    return domain?.organizationId ?? null
}

/**
 * Process inbound email through route matching.
 * Returns delivery actions to take.
 */
export async function processInboundEmail(
    recipientAddress: string
): Promise<{
    organizationId: string | null
    routes: MatchedRoute[]
    action: 'deliver' | 'hold' | 'reject' | 'none'
}> {
    const domain = recipientAddress.split('@')[1]?.toLowerCase()
    if (!domain) {
        return { organizationId: null, routes: [], action: 'none' }
    }

    const organizationId = await findOrganizationForDomain(domain)
    if (!organizationId) {
        return { organizationId: null, routes: [], action: 'none' }
    }

    const matchedRoutes = await findMatchingRoutes(organizationId, recipientAddress)

    if (matchedRoutes.length === 0) {
        return { organizationId, routes: [], action: 'none' }
    }

    // If any route rejects, reject the entire message
    if (matchedRoutes.some((r) => r.endpoint.type === 'reject')) {
        return { organizationId, routes: matchedRoutes, action: 'reject' }
    }

    // If any route holds, hold the message
    if (matchedRoutes.some((r) => r.endpoint.type === 'hold')) {
        return { organizationId, routes: matchedRoutes, action: 'hold' }
    }

    return { organizationId, routes: matchedRoutes, action: 'deliver' }
}
