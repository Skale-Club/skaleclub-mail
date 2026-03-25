import { db } from '../../db'
import {
    deliveries, messages, webhookRequests, webhooks,
    credentials, routes, smtpEndpoints, httpEndpoints,
    addressEndpoints, domains, templates, trackDomains,
    suppressions, statistics, organizationUsers, organizations,
} from '../../db/schema'
import { eq } from 'drizzle-orm'

export async function deleteOrganizationCascade(organizationId: string): Promise<void> {
    await db.delete(deliveries).where(eq(deliveries.organizationId, organizationId))

    await db.delete(messages).where(eq(messages.organizationId, organizationId))

    const orgWebhooks = await db.select({ id: webhooks.id })
        .from(webhooks)
        .where(eq(webhooks.organizationId, organizationId))
    for (const wh of orgWebhooks) {
        await db.delete(webhookRequests).where(eq(webhookRequests.webhookId, wh.id))
    }

    await db.delete(webhooks).where(eq(webhooks.organizationId, organizationId))

    await db.delete(credentials).where(eq(credentials.organizationId, organizationId))

    await db.delete(routes).where(eq(routes.organizationId, organizationId))

    await db.delete(smtpEndpoints).where(eq(smtpEndpoints.organizationId, organizationId))
    await db.delete(httpEndpoints).where(eq(httpEndpoints.organizationId, organizationId))
    await db.delete(addressEndpoints).where(eq(addressEndpoints.organizationId, organizationId))

    await db.delete(domains).where(eq(domains.organizationId, organizationId))

    await db.delete(templates).where(eq(templates.organizationId, organizationId))

    await db.delete(trackDomains).where(eq(trackDomains.organizationId, organizationId))

    await db.delete(suppressions).where(eq(suppressions.organizationId, organizationId))

    await db.delete(statistics).where(eq(statistics.organizationId, organizationId))

    await db.delete(organizationUsers).where(eq(organizationUsers.organizationId, organizationId))

    await db.delete(organizations).where(eq(organizations.id, organizationId))
}
