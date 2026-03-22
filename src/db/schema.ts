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
    dkimStatus: text('dkim_status').default('pending'),
    dkimError: text('dkim_error'),
    // SPF
    spfStatus: text('spf_status').default('pending'),
    spfError: text('spf_error'),
    // DMARC
    dmarcStatus: text('dmarc_status').default('pending'),
    dmarcError: text('dmarc_error'),
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

// Email templates
export const templates = pgTable('templates', {
    id: uuid('id').primaryKey().defaultRandom(),
    serverId: uuid('server_id').references(() => servers.id).notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    subject: text('subject').notNull(),
    plainBody: text('plain_body'),
    htmlBody: text('html_body'),
    variables: jsonb('variables').default([]), // list of template variable names
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    serverSlugUnique: uniqueIndex('template_server_slug_unique').on(table.serverId, table.slug),
}))

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
    templates: many(templates),
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

export const templatesRelations = relations(templates, ({ one }) => ({
    server: one(servers, {
        fields: [templates.serverId],
        references: [servers.id],
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

export const insertTemplateSchema = createInsertSchema(templates)
export const selectTemplateSchema = createSelectSchema(templates)

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

export type Template = typeof templates.$inferSelect
export type NewTemplate = typeof templates.$inferInsert

// ============================================
// OUTREACH MODULE SCHEMA (Instantly/SmartLead-like)
// ============================================

// Campaign status enum
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'active', 'paused', 'completed', 'archived'])

// Lead status enum
export const leadStatusEnum = pgEnum('lead_status', ['new', 'contacted', 'replied', 'interested', 'not_interested', 'bounced', 'unsubscribed'])

// Email account status enum
export const emailAccountStatusEnum = pgEnum('email_account_status', ['pending', 'verified', 'failed', 'paused'])

// Sequence step type enum
export const sequenceStepTypeEnum = pgEnum('sequence_step_type', ['email', 'delay', 'condition'])

// Email Accounts (Inboxes for sending outreach emails)
export const emailAccounts = pgTable('email_accounts', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    // Account details
    email: text('email').notNull(),
    displayName: text('display_name'),
    // SMTP settings
    smtpHost: text('smtp_host').notNull(),
    smtpPort: integer('smtp_port').default(587).notNull(),
    smtpUsername: text('smtp_username').notNull(),
    smtpPassword: text('smtp_password').notNull(), // encrypted
    smtpSecure: boolean('smtp_secure').default(true).notNull(),
    // IMAP settings (for reply tracking)
    imapHost: text('imap_host'),
    imapPort: integer('imap_port').default(993),
    imapUsername: text('imap_username'),
    imapPassword: text('imap_password'), // encrypted
    imapSecure: boolean('imap_secure').default(true),
    // Sending limits (warm-up and daily limits)
    dailySendLimit: integer('daily_send_limit').default(50).notNull(),
    currentDailySent: integer('current_daily_sent').default(0).notNull(),
    minMinutesBetweenEmails: integer('min_minutes_between_emails').default(5).notNull(),
    maxMinutesBetweenEmails: integer('max_minutes_between_emails').default(30).notNull(),
    // Warm-up settings
    warmupEnabled: boolean('warmup_enabled').default(true).notNull(),
    warmupDays: integer('warmup_days').default(14).notNull(),
    warmupCurrentDay: integer('warmup_current_day').default(0).notNull(),
    // Status
    status: emailAccountStatusEnum('status').default('pending').notNull(),
    lastError: text('last_error'),
    lastSyncAt: timestamp('last_sync_at'),
    verifiedAt: timestamp('verified_at'),
    // Tracking
    totalSent: integer('total_sent').default(0).notNull(),
    totalOpens: integer('total_opens').default(0).notNull(),
    totalClicks: integer('total_clicks').default(0).notNull(),
    totalReplies: integer('total_replies').default(0).notNull(),
    totalBounces: integer('total_bounces').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    orgEmailUnique: uniqueIndex('email_account_org_email_unique').on(table.organizationId, table.email),
}))

// Lead Lists (groups of leads)
export const leadLists = pgTable('lead_lists', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    color: text('color').default('#3B82F6'),
    leadCount: integer('lead_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Leads (Prospects)
export const leads = pgTable('leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    // Contact info
    email: text('email').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    companyName: text('company_name'),
    companySize: text('company_size'),
    industry: text('industry'),
    title: text('title'),
    website: text('website'),
    linkedinUrl: text('linkedin_url'),
    phone: text('phone'),
    location: text('location'),
    // Custom fields (JSON)
    customFields: jsonb('custom_fields').default({}),
    // Status
    status: leadStatusEnum('status').default('new').notNull(),
    // Source tracking
    source: text('source'),
    leadListId: uuid('lead_list_id').references(() => leadLists.id),
    // Engagement tracking
    totalEmailsSent: integer('total_emails_sent').default(0).notNull(),
    totalOpens: integer('total_opens').default(0).notNull(),
    totalClicks: integer('total_clicks').default(0).notNull(),
    totalReplies: integer('total_replies').default(0).notNull(),
    lastContactedAt: timestamp('last_contacted_at'),
    lastRepliedAt: timestamp('last_replied_at'),
    // Opt-out
    unsubscribedAt: timestamp('unsubscribed_at'),
    unsubscribedReason: text('unsubscribed_reason'),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    orgEmailUnique: uniqueIndex('lead_org_email_unique').on(table.organizationId, table.email),
}))

// Campaigns
export const campaigns = pgTable('campaigns', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    // Basic info
    name: text('name').notNull(),
    description: text('description'),
    // Settings
    status: campaignStatusEnum('status').default('draft').notNull(),
    // Sender settings
    fromName: text('from_name'),
    replyToEmail: text('reply_to_email'),
    // Schedule settings
    timezone: text('timezone').default('UTC').notNull(),
    sendOnWeekends: boolean('send_on_weekends').default(false).notNull(),
    sendStartTime: text('send_start_time').default('09:00').notNull(), // HH:mm
    sendEndTime: text('send_end_time').default('17:00').notNull(), // HH:mm
    // Tracking settings
    trackOpens: boolean('track_opens').default(true).notNull(),
    trackClicks: boolean('track_clicks').default(true).notNull(),
    // Statistics (cached)
    totalLeads: integer('total_leads').default(0).notNull(),
    leadsContacted: integer('leads_contacted').default(0).notNull(),
    totalOpens: integer('total_opens').default(0).notNull(),
    totalClicks: integer('total_clicks').default(0).notNull(),
    totalReplies: integer('total_replies').default(0).notNull(),
    totalBounces: integer('total_bounces').default(0).notNull(),
    totalUnsubscribes: integer('total_unsubscribes').default(0).notNull(),
    // Timestamps
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Sequences (email sequences for campaigns)
export const sequences = pgTable('sequences', {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id').references(() => campaigns.id).notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Sequence Steps (individual emails in a sequence)
export const sequenceSteps = pgTable('sequence_steps', {
    id: uuid('id').primaryKey().defaultRandom(),
    sequenceId: uuid('sequence_id').references(() => sequences.id).notNull(),
    // Step order
    stepOrder: integer('step_order').notNull(),
    // Type
    type: sequenceStepTypeEnum('type').default('email').notNull(),
    // Delay before this step (in hours)
    delayHours: integer('delay_hours').default(0).notNull(),
    // Email content
    subject: text('subject'),
    plainBody: text('plain_body'),
    htmlBody: text('html_body'),
    // A/B testing
    subjectB: text('subject_b'),
    plainBodyB: text('plain_body_b'),
    htmlBodyB: text('html_body_b'),
    abTestEnabled: boolean('ab_test_enabled').default(false).notNull(),
    abTestPercentage: integer('ab_test_percentage').default(50), // percentage for variant A
    // Statistics
    totalSent: integer('total_sent').default(0).notNull(),
    totalOpens: integer('total_opens').default(0).notNull(),
    totalClicks: integer('total_clicks').default(0).notNull(),
    totalReplies: integer('total_replies').default(0).notNull(),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    sequenceOrderUnique: uniqueIndex('sequence_step_order_unique').on(table.sequenceId, table.stepOrder),
}))

// Campaign Leads (junction table - leads assigned to campaigns)
export const campaignLeads = pgTable('campaign_leads', {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id').references(() => campaigns.id).notNull(),
    leadId: uuid('lead_id').references(() => leads.id).notNull(),
    // Assignment
    assignedEmailAccountId: uuid('assigned_email_account_id').references(() => emailAccounts.id),
    // Progress
    currentStepId: uuid('current_step_id').references(() => sequenceSteps.id),
    currentStepOrder: integer('current_step_order').default(0).notNull(),
    // Status
    status: leadStatusEnum('status').default('new').notNull(),
    // Next scheduled action
    nextScheduledAt: timestamp('next_scheduled_at'),
    // Tracking for this specific campaign/lead combination
    totalOpens: integer('total_opens').default(0).notNull(),
    totalClicks: integer('total_clicks').default(0).notNull(),
    totalReplies: integer('total_replies').default(0).notNull(),
    // Timestamps
    firstContactedAt: timestamp('first_contacted_at'),
    lastContactedAt: timestamp('last_contacted_at'),
    lastRepliedAt: timestamp('last_replied_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    campaignLeadUnique: uniqueIndex('campaign_lead_unique').on(table.campaignId, table.leadId),
}))

// Outreach Emails (sent emails from campaigns)
export const outreachEmails = pgTable('outreach_emails', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    campaignId: uuid('campaign_id').references(() => campaigns.id).notNull(),
    campaignLeadId: uuid('campaign_lead_id').references(() => campaignLeads.id).notNull(),
    sequenceStepId: uuid('sequence_step_id').references(() => sequenceSteps.id).notNull(),
    emailAccountId: uuid('email_account_id').references(() => emailAccounts.id).notNull(),
    // Message details
    messageId: text('message_id'), // RFC 2822 Message-ID
    // Content sent
    subject: text('subject').notNull(),
    plainBody: text('plain_body'),
    htmlBody: text('html_body'),
    // A/B variant
    abVariant: text('ab_variant'), // 'a' or 'b'
    // Tracking
    sentAt: timestamp('sent_at'),
    deliveredAt: timestamp('delivered_at'),
    openedAt: timestamp('opened_at'),
    openedCount: integer('opened_count').default(0).notNull(),
    clickedAt: timestamp('clicked_at'),
    clickedCount: integer('clicked_count').default(0).notNull(),
    repliedAt: timestamp('replied_at'),
    bouncedAt: timestamp('bounced_at'),
    bounceReason: text('bounce_reason'),
    unsubscribedAt: timestamp('unsubscribed_at'),
    // Status
    status: messageStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Outreach Analytics (daily aggregated stats)
export const outreachAnalytics = pgTable('outreach_analytics', {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id').references(() => organizations.id).notNull(),
    campaignId: uuid('campaign_id').references(() => campaigns.id),
    emailAccountId: uuid('email_account_id').references(() => emailAccounts.id),
    date: timestamp('date').notNull(),
    // Stats
    emailsSent: integer('emails_sent').default(0).notNull(),
    emailsDelivered: integer('emails_delivered').default(0).notNull(),
    emailsBounced: integer('emails_bounced').default(0).notNull(),
    opens: integer('opens').default(0).notNull(),
    clicks: integer('clicks').default(0).notNull(),
    replies: integer('replies').default(0).notNull(),
    unsubscribes: integer('unsubscribes').default(0).notNull(),
    leadsAdded: integer('leads_added').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    orgDateUnique: uniqueIndex('outreach_analytics_org_date_unique').on(table.organizationId, table.date, table.campaignId, table.emailAccountId),
}))

// Outreach Relations
export const emailAccountsRelations = relations(emailAccounts, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [emailAccounts.organizationId],
        references: [organizations.id],
    }),
    campaignLeads: many(campaignLeads),
    outreachEmails: many(outreachEmails),
}))

export const leadListsRelations = relations(leadLists, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [leadLists.organizationId],
        references: [organizations.id],
    }),
    leads: many(leads),
}))

export const leadsRelations = relations(leads, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [leads.organizationId],
        references: [organizations.id],
    }),
    leadList: one(leadLists, {
        fields: [leads.leadListId],
        references: [leadLists.id],
    }),
    campaignLeads: many(campaignLeads),
}))

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [campaigns.organizationId],
        references: [organizations.id],
    }),
    sequences: many(sequences),
    campaignLeads: many(campaignLeads),
    outreachEmails: many(outreachEmails),
}))

export const sequencesRelations = relations(sequences, ({ one, many }) => ({
    campaign: one(campaigns, {
        fields: [sequences.campaignId],
        references: [campaigns.id],
    }),
    steps: many(sequenceSteps),
}))

export const sequenceStepsRelations = relations(sequenceSteps, ({ one, many }) => ({
    sequence: one(sequences, {
        fields: [sequenceSteps.sequenceId],
        references: [sequences.id],
    }),
    campaignLeads: many(campaignLeads),
    outreachEmails: many(outreachEmails),
}))

export const campaignLeadsRelations = relations(campaignLeads, ({ one, many }) => ({
    campaign: one(campaigns, {
        fields: [campaignLeads.campaignId],
        references: [campaigns.id],
    }),
    lead: one(leads, {
        fields: [campaignLeads.leadId],
        references: [leads.id],
    }),
    assignedEmailAccount: one(emailAccounts, {
        fields: [campaignLeads.assignedEmailAccountId],
        references: [emailAccounts.id],
    }),
    currentStep: one(sequenceSteps, {
        fields: [campaignLeads.currentStepId],
        references: [sequenceSteps.id],
    }),
    outreachEmails: many(outreachEmails),
}))

export const outreachEmailsRelations = relations(outreachEmails, ({ one }) => ({
    organization: one(organizations, {
        fields: [outreachEmails.organizationId],
        references: [organizations.id],
    }),
    campaign: one(campaigns, {
        fields: [outreachEmails.campaignId],
        references: [campaigns.id],
    }),
    campaignLead: one(campaignLeads, {
        fields: [outreachEmails.campaignLeadId],
        references: [campaignLeads.id],
    }),
    sequenceStep: one(sequenceSteps, {
        fields: [outreachEmails.sequenceStepId],
        references: [sequenceSteps.id],
    }),
    emailAccount: one(emailAccounts, {
        fields: [outreachEmails.emailAccountId],
        references: [emailAccounts.id],
    }),
}))

export const outreachAnalyticsRelations = relations(outreachAnalytics, ({ one }) => ({
    organization: one(organizations, {
        fields: [outreachAnalytics.organizationId],
        references: [organizations.id],
    }),
    campaign: one(campaigns, {
        fields: [outreachAnalytics.campaignId],
        references: [campaigns.id],
    }),
    emailAccount: one(emailAccounts, {
        fields: [outreachAnalytics.emailAccountId],
        references: [emailAccounts.id],
    }),
}))

// Zod schemas for outreach module
export const insertEmailAccountSchema = createInsertSchema(emailAccounts)
export const selectEmailAccountSchema = createSelectSchema(emailAccounts)

export const insertLeadListSchema = createInsertSchema(leadLists)
export const selectLeadListSchema = createSelectSchema(leadLists)

export const insertLeadSchema = createInsertSchema(leads)
export const selectLeadSchema = createSelectSchema(leads)

export const insertCampaignSchema = createInsertSchema(campaigns)
export const selectCampaignSchema = createSelectSchema(campaigns)

export const insertSequenceSchema = createInsertSchema(sequences)
export const selectSequenceSchema = createSelectSchema(sequences)

export const insertSequenceStepSchema = createInsertSchema(sequenceSteps)
export const selectSequenceStepSchema = createSelectSchema(sequenceSteps)

export const insertCampaignLeadSchema = createInsertSchema(campaignLeads)
export const selectCampaignLeadSchema = createSelectSchema(campaignLeads)

export const insertOutreachEmailSchema = createInsertSchema(outreachEmails)
export const selectOutreachEmailSchema = createSelectSchema(outreachEmails)

// Outreach Types
export type EmailAccount = typeof emailAccounts.$inferSelect
export type NewEmailAccount = typeof emailAccounts.$inferInsert

export type LeadList = typeof leadLists.$inferSelect
export type NewLeadList = typeof leadLists.$inferInsert

export type Lead = typeof leads.$inferSelect
export type NewLead = typeof leads.$inferInsert

export type Campaign = typeof campaigns.$inferSelect
export type NewCampaign = typeof campaigns.$inferInsert

export type Sequence = typeof sequences.$inferSelect
export type NewSequence = typeof sequences.$inferInsert

export type SequenceStep = typeof sequenceSteps.$inferSelect
export type NewSequenceStep = typeof sequenceSteps.$inferInsert

export type CampaignLead = typeof campaignLeads.$inferSelect
export type NewCampaignLead = typeof campaignLeads.$inferInsert

export type OutreachEmail = typeof outreachEmails.$inferSelect
export type NewOutreachEmail = typeof outreachEmails.$inferInsert

export type OutreachAnalytic = typeof outreachAnalytics.$inferSelect
export type NewOutreachAnalytic = typeof outreachAnalytics.$inferInsert
