import { db } from '../../db'
import {
    deliveries, messages, webhookRequests, webhooks,
    credentials, routes, smtpEndpoints, httpEndpoints,
    addressEndpoints, domains, templates, trackDomains,
    suppressions, statistics, organizationUsers, organizations,
} from '../../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Deletes all child resources for an organization.
 */
async function deleteOrganizationChildrenCascade(organizationId: string): Promise<void> {
    // 1. Deliveries (has FK to messages + organizations)
    await db.delete(deliveries).where(eq(deliveries.organizationId, organizationId))

    // 2. Messages
    await db.delete(messages).where(eq(messages.organizationId, organizationId))

    // 3. Webhook requests (FK to webhooks)
    const orgWebhooks = await db.query.webhooks.findMany({
        where: eq(webhooks.organizationId, organizationId),
        columns: { id: true },
    })
    for (const wh of orgWebhooks) {
        await db.delete(webhookRequests).where(eq(webhookRequests.webhookId, wh.id))
    }

    // 4. Webhooks
    await db.delete(webhooks).where(eq(webhooks.organizationId, organizationId))

    // 5. Credentials
    await db.delete(credentials).where(eq(credentials.organizationId, organizationId))

    // 6. Routes
    await db.delete(routes).where(eq(routes.organizationId, organizationId))

    // 7. Endpoints
    await db.delete(smtpEndpoints).where(eq(smtpEndpoints.organizationId, organizationId))
    await db.delete(httpEndpoints).where(eq(httpEndpoints.organizationId, organizationId))
    await db.delete(addressEndpoints).where(eq(addressEndpoints.organizationId, organizationId))

    // 8. Domains
    await db.delete(domains).where(eq(domains.organizationId, organizationId))

    // 9. Templates
    await db.delete(templates).where(eq(templates.organizationId, organizationId))

    // 10. Track domains
    await db.delete(trackDomains).where(eq(trackDomains.organizationId, organizationId))

    // 11. Suppressions
    await db.delete(suppressions).where(eq(suppressions.organizationId, organizationId))

    // 12. Statistics
    await db.delete(statistics).where(eq(statistics.organizationId, organizationId))
}

/**
 * Deletes an organization and all its children,
 * then the membership rows and the organization itself.
 */
export async function deleteOrganizationCascade(organizationId: string): Promise<void> {
    // Delete all child resources
    await deleteOrganizationChildrenCascade(organizationId)

    // Delete organization memberships
    await db.delete(organizationUsers).where(eq(organizationUsers.organizationId, organizationId))

    // Delete the organization
    await db.delete(organizations).where(eq(organizations.id, organizationId))
}
