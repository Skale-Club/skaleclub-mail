import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    integer,
    jsonb,
    pgEnum,
    uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'member', 'viewer'])
export const serverModeEnum = pgEnum('server_mode', ['live', 'development'])
export const serverSendModeEnum = pgEnum('server_send_mode', ['smtp', 'api'])
export const domainVerificationEnum = pgEnum('domain_verification', ['pending', 'verified', 'failed'])
export const messageStatusEnum = pgEnum('message_status', ['pending', 'queued', 'sent', 'delivered', 'bounced', 'held', 'failed'])
export const credentialTypeEnum = pgEnum('credential_type', ['smtp', 'api'])
export const routeModeEnum = pgEnum('route_mode', ['endpoint', 'hold', 'reject'])
export const webhookEventEnum = pgEnum('webhook_event', [
    'message_sent',
    'message_delivered',
    'message_bounced',
    'message_held',
    'message_opened',
    'link_clicked',
    'domain_verified',
    'spam_alert'
])

// Users table
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    passwordHash: text('password_hash'),
    avatarUrl: text('avatar_url'),
    isAdmin: boolean('is_admin').default(false).notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
    twoFactorSecret: text('two_factor_secret'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Organizations table
export const organizations = pgTable('organizations', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    timezone: text('timezone').default('UTC').notNull(),
    owner_id: uuid('owner_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Organization users (membership)
export const organizationUsers = pgTable('organization_users', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    userId: uuid('user_id').references(() => users.id).notNull(),
    role: userRoleEnum('role').default('member').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    orgUserUnique: uniqueIndex('org_user_unique').on(table.organizationId, table.userId),
}))

// Servers table
export const servers = pgTable('servers', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    mode: serverModeEnum('mode').default('live').notNull(),
    sendMode: serverSendModeEnum('send_mode').default('smtp').notNull(),
    description: text('description'),
    defaultFromAddress: text('default_from_address'),
    defaultFromName: text('default_from_name'),
    ipPoolId: uuid('ip_pool_id'),
    // Limits
    sendLimit: integer('send_limit'),
    sendLimitPeriod: text('send_limit_period').default('day'),
    outboundSpamThreshold: integer('outbound_spam_threshold').default(5),
    // Settings
    trackOpens: boolean('track_opens').default(true).notNull(),
    trackClicks: boolean('track_clicks').default(true).notNull(),
    logSmtpData: boolean('log_smtp_data').default(false).notNull(),
    privacyMode: boolean('privacy_mode').default(false).notNull(),
    // Message retention
    retentionDays: integer('retention_days').default(30),
    retentionDaysHeld: integer('retention_days_held').default(14),
    // Status
    suspended: boolean('suspended').default(false).notNull(),
    suspendedReason: text('suspended_reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    orgSlugUnique: uniqueIndex('server_org_slug_unique').on(table.organizationId, table.slug),
}))

// Domains table
export const domains = pgTable('domains', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    verificationToken: text('verification_token'),
    verificationMethod: text('verification_method').default('dns'),
    verificationStatus: domainVerificationEnum('verification_status').default('pending').notNull(),
    verifiedAt: timestamp('verified_at'),
    // DKIM
    dkimPrivateKey: text('dkim_private_key'),
    dkimPublicKey: text('dkim_public_key'),
    dkimSelector: text('dkim_selector').default('postal'),
    // SPF
    spfStatus: text('spf_status').default('pending'),
    spfError: text('spf_error'),
    // MX
    mxStatus: text('mx_status').default('pending'),
    mxError: text('mx_error'),
    // Return path
    returnPathStatus: text('return_path_status').default('pending'),
    returnPathError: text('return_path_error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Credentials table
export const credentials = pgTable('credentials', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    type: credentialTypeEnum('type').default('smtp').notNull(),
    key: text('key').notNull(),
    secretHash: text('secret_hash'),
    lastUsedAt: timestamp('last_used_at'),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Routes table
export const routes = pgTable('routes', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    address: text('address').notNull(),
    mode: routeModeEnum('mode').default('endpoint').notNull(),
    // Endpoint configurations
    smtpEndpointId: uuid('smtp_endpoint_id'),
    httpEndpointId: uuid('http_endpoint_id'),
    addressEndpointId: uuid('address_endpoint_id'),
    // Spam handling
    spamMode: text('spam_mode').default('mark'),
    spamThreshold: integer('spam_threshold').default(5),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// SMTP Endpoints
export const smtpEndpoints = pgTable('smtp_endpoints', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    hostname: text('hostname').notNull(),
    port: integer('port').default(25).notNull(),
    sslMode: text('ssl_mode').default('auto').notNull(),
    username: text('username'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// HTTP Endpoints
export const httpEndpoints = pgTable('http_endpoints', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    method: text('method').default('POST').notNull(),
    headers: jsonb('headers').default({}),
    includeOriginal: boolean('include_original').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Address Endpoints
export const addressEndpoints = pgTable('address_endpoints', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    emailAddress: text('email_address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Messages table
export const messages = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    // Message identification
    messageId: text('message_id'),
    token: text('token').notNull(),
    // Direction
    direction: text('direction').notNull(), // 'incoming' | 'outgoing'
    // Sender/Recipient
    fromAddress: text('from_address').notNull(),
    fromName: text('from_name'),
    toAddresses: jsonb('to_addresses').notNull().default([]),
    ccAddresses: jsonb('cc_addresses').default([]),
    bccAddresses: jsonb('bcc_addresses').default([]),
    // Content
    subject: text('subject'),
    plainBody: text('plain_body'),
    htmlBody: text('html_body'),
    attachments: jsonb('attachments').default([]),
    headers: jsonb('headers').default({}),
    // Status
    status: messageStatusEnum('status').default('pending').notNull(),
    held: boolean('held').default(false).notNull(),
    holdExpiry: timestamp('hold_expiry'),
    heldReason: text('held_reason'),
    // Tracking
    spamScore: integer('spam_score'),
    spamChecks: jsonb('spam_checks').default([]),
    // Timestamps
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    bouncedAt: timestamp('bounced_at'),
    openedAt: timestamp('opened_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Message deliveries
export const deliveries = pgTable('deliveries', {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id').references(() => messages.id).notNull(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    // Recipient
    rcptTo: text('rcpt_to').notNull(),
    // Status
    status: messageStatusEnum('status').default('pending').notNull(),
    // Details
    details: text('details'),
    output: text('output'),
    sentWithSsl: boolean('sent_with_ssl').default(false),
    // Timestamps
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    bouncedAt: timestamp('bounced_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Webhooks table
export const webhooks = pgTable('webhooks', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    secret: text('secret'),
    active: boolean('active').default(true).notNull(),
    events: jsonb('events').notNull().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Webhook requests log
export const webhookRequests = pgTable('webhook_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    webhookId: uuid('webhook_id').references(() => webhooks.id).notNull(),
    event: webhookEventEnum('event').notNull(),
    payload: jsonb('payload').notNull(),
    responseCode: integer('response_code'),
    responseBody: text('response_body'),
    success: boolean('success').default(false).notNull(),
    attempts: integer('attempts').default(1).notNull(),
    error: text('error'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Track domains (for open/click tracking)
export const trackDomains = pgTable('track_domains', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    domain: text('domain').notNull(),
    verificationToken: text('verification_token'),
    verificationStatus: domainVerificationEnum('verification_status').default('pending').notNull(),
    verifiedAt: timestamp('verified_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Suppression list
export const suppressions = pgTable('suppressions', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    emailAddress: text('email_address').notNull(),
    reason: text('reason').notNull(), // 'bounce', 'complaint', 'manual'
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    serverEmailUnique: uniqueIndex('suppression_server_email_unique').on(table.serverId, table.emailAddress),
}))

// Statistics (aggregated)
export const statistics = pgTable('statistics', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    date: timestamp('date').notNull(),
    // Counts
    messagesSent: integer('messages_sent').default(0).notNull(),
    messagesDelivered: integer('messages_delivered').default(0).notNull(),
    messagesBounced: integer('messages_bounced').default(0).notNull(),
    messagesHeld: integer('messages_held').default(0).notNull(),
    messagesOpened: integer('messages_opened').default(0).notNull(),
    linksClicked: integer('links_clicked').default(0).notNull(),
    // Incoming
    messagesIncoming: integer('messages_incoming').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    serverDateUnique: uniqueIndex('stats_server_date_unique').on(table.serverId, table.date),
}))

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    organizations: many(organizationUsers),
}))

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
    owner: one(users, {
        fields: [organizations.owner_id],
        references: [users.id],
    }),
    members: many(organizationUsers),
    servers: many(servers),
}))

export const organizationUsersRelations = relations(organizationUsers, ({ one }) => ({
    organization: one(organizations, {
        fields: [organizationUsers.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [organizationUsers.userId],
        references: [users.id],
    }),
}))

export const serversRelations = relations(servers, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [servers.organizationId],
        references: [organizations.id],
    }),
    domains: many(domains),
    credentials: many(credentials),
    routes: many(routes),
    messages: many(messages),
    webhooks: many(webhooks),
    smtpEndpoints: many(smtpEndpoints),
    httpEndpoints: many(httpEndpoints),
    addressEndpoints: many(addressEndpoints),
    trackDomains: many(trackDomains),
    suppressions: many(suppressions),
    statistics: many(statistics),
}))

export const domainsRelations = relations(domains, ({ one }) => ({
    server: one(servers, {
        fields: [domains.serverId],
        references: [servers.id],
    }),
}))

export const credentialsRelations = relations(credentials, ({ one }) => ({
    server: one(servers, {
        fields: [credentials.serverId],
        references: [servers.id],
    }),
}))

export const routesRelations = relations(routes, ({ one }) => ({
    server: one(servers, {
        fields: [routes.serverId],
        references: [servers.id],
    }),
    smtpEndpoint: one(smtpEndpoints, {
        fields: [routes.smtpEndpointId],
        references: [smtpEndpoints.id],
    }),
    httpEndpoint: one(httpEndpoints, {
        fields: [routes.httpEndpointId],
        references: [httpEndpoints.id],
    }),
    addressEndpoint: one(addressEndpoints, {
        fields: [routes.addressEndpointId],
        references: [addressEndpoints.id],
    }),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
    server: one(servers, {
        fields: [messages.serverId],
        references: [servers.id],
    }),
    deliveries: many(deliveries),
}))

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
    message: one(messages, {
        fields: [deliveries.messageId],
        references: [messages.id],
    }),
    server: one(servers, {
        fields: [deliveries.serverId],
        references: [servers.id],
    }),
}))

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
    server: one(servers, {
        fields: [webhooks.serverId],
        references: [servers.id],
    }),
    requests: many(webhookRequests),
}))

export const webhookRequestsRelations = relations(webhookRequests, ({ one }) => ({
    webhook: one(webhooks, {
        fields: [webhookRequests.webhookId],
        references: [webhooks.id],
    }),
}))

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users)
export const selectUserSchema = createSelectSchema(users)

export const insertOrganizationSchema = createInsertSchema(organizations)
export const selectOrganizationSchema = createSelectSchema(organizations)

export const insertServerSchema = createInsertSchema(servers)
export const selectServerSchema = createSelectSchema(servers)

export const insertDomainSchema = createInsertSchema(domains)
export const selectDomainSchema = createSelectSchema(domains)

export const insertCredentialSchema = createInsertSchema(credentials)
export const selectCredentialSchema = createSelectSchema(credentials)

export const insertRouteSchema = createInsertSchema(routes)
export const selectRouteSchema = createSelectSchema(routes)

export const insertMessageSchema = createInsertSchema(messages)
export const selectMessageSchema = createSelectSchema(messages)

export const insertWebhookSchema = createInsertSchema(webhooks)
export const selectWebhookSchema = createSelectSchema(webhooks)

// Types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Organization = typeof organizations.$inferSelect
export type NewOrganization = typeof organizations.$inferInsert

export type OrganizationUser = typeof organizationUsers.$inferSelect
export type NewOrganizationUser = typeof organizationUsers.$inferInsert

export type Server = typeof servers.$inferSelect
export type NewServer = typeof servers.$inferInsert

export type Domain = typeof domains.$inferSelect
export type NewDomain = typeof domains.$inferInsert

export type Credential = typeof credentials.$inferSelect
export type NewCredential = typeof credentials.$inferInsert

export type Route = typeof routes.$inferSelect
export type NewRoute = typeof routes.$inferInsert

export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

export type Delivery = typeof deliveries.$inferSelect
export type NewDelivery = typeof deliveries.$inferInsert

export type Webhook = typeof webhooks.$inferSelect
export type NewWebhook = typeof webhooks.$inferInsert

export type WebhookRequest = typeof webhookRequests.$inferSelect
export type NewWebhookRequest = typeof webhookRequests.$inferInsert

export type Suppression = typeof suppressions.$inferSelect
export type NewSuppression = typeof suppressions.$inferInsert

export type Statistic = typeof statistics.$inferSelect
export type NewStatistic = typeof statistics.$inferInsert
