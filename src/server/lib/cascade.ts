import { db } from '../../db'
import {
    deliveries, messages, webhookRequests, webhooks,
    credentials, routes, smtpEndpoints, httpEndpoints,
    addressEndpoints, domains, templates, trackDomains,
    suppressions, statistics, servers, organizationUsers, organizations,
} from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Deletes all child resources for a single server, then the server itself.
 * Call this before deleting the server row.
 */
export async function deleteServerCascade(serverId: string): Promise<void> {
    // 1. Deliveries (has FK to messages + servers)
    await db.delete(deliveries).where(eq(deliveries.serverId, serverId))

    // 2. Messages
    await db.delete(messages).where(eq(messages.serverId, serverId))

    // 3. Webhook requests (FK to webhooks)
    const serverWebhooks = await db.query.webhooks.findMany({
        where: eq(webhooks.serverId, serverId),
        columns: { id: true },
    })
    for (const wh of serverWebhooks) {
        await db.delete(webhookRequests).where(eq(webhookRequests.webhookId, wh.id))
    }

    // 4. Webhooks
    await db.delete(webhooks).where(eq(webhooks.serverId, serverId))

    // 5. Credentials
    await db.delete(credentials).where(eq(credentials.serverId, serverId))

    // 6. Routes
    await db.delete(routes).where(eq(routes.serverId, serverId))

    // 7. Endpoints
    await db.delete(smtpEndpoints).where(eq(smtpEndpoints.serverId, serverId))
    await db.delete(httpEndpoints).where(eq(httpEndpoints.serverId, serverId))
    await db.delete(addressEndpoints).where(eq(addressEndpoints.serverId, serverId))

    // 8. Domains
    await db.delete(domains).where(eq(domains.serverId, serverId))

    // 9. Templates
    await db.delete(templates).where(eq(templates.serverId, serverId))

    // 10. Track domains
    await db.delete(trackDomains).where(eq(trackDomains.serverId, serverId))

    // 11. Suppressions
    await db.delete(suppressions).where(eq(suppressions.serverId, serverId))

    // 12. Statistics
    await db.delete(statistics).where(eq(statistics.serverId, serverId))

    // 13. The server itself
    await db.delete(servers).where(eq(servers.id, serverId))
}

/**
 * Deletes all servers and their children for an organization,
 * then the membership rows and the organization itself.
 */
export async function deleteOrganizationCascade(organizationId: string): Promise<void> {
    // Get all servers for this org
    const orgServers = await db.query.servers.findMany({
        where: eq(servers.organizationId, organizationId),
        columns: { id: true },
    })

    // Delete each server (and its children)
    for (const s of orgServers) {
        await deleteServerCascade(s.id)
    }

    // Delete organization memberships
    await db.delete(organizationUsers).where(eq(organizationUsers.organizationId, organizationId))

    // Delete the organization
    await db.delete(organizations).where(eq(organizations.id, organizationId))
}
