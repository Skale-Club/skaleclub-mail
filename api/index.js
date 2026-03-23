var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  addressEndpoints: () => addressEndpoints,
  campaignLeads: () => campaignLeads,
  campaignLeadsRelations: () => campaignLeadsRelations,
  campaignStatusEnum: () => campaignStatusEnum,
  campaigns: () => campaigns,
  campaignsRelations: () => campaignsRelations,
  credentialTypeEnum: () => credentialTypeEnum,
  credentials: () => credentials,
  credentialsRelations: () => credentialsRelations,
  deliveries: () => deliveries,
  deliveriesRelations: () => deliveriesRelations,
  domainVerificationEnum: () => domainVerificationEnum,
  domains: () => domains,
  domainsRelations: () => domainsRelations,
  emailAccountStatusEnum: () => emailAccountStatusEnum,
  emailAccounts: () => emailAccounts,
  emailAccountsRelations: () => emailAccountsRelations,
  httpEndpoints: () => httpEndpoints,
  insertCampaignLeadSchema: () => insertCampaignLeadSchema,
  insertCampaignSchema: () => insertCampaignSchema,
  insertCredentialSchema: () => insertCredentialSchema,
  insertDomainSchema: () => insertDomainSchema,
  insertEmailAccountSchema: () => insertEmailAccountSchema,
  insertLeadListSchema: () => insertLeadListSchema,
  insertLeadSchema: () => insertLeadSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertOrganizationSchema: () => insertOrganizationSchema,
  insertOutlookMailboxSchema: () => insertOutlookMailboxSchema,
  insertOutreachEmailSchema: () => insertOutreachEmailSchema,
  insertRouteSchema: () => insertRouteSchema,
  insertSequenceSchema: () => insertSequenceSchema,
  insertSequenceStepSchema: () => insertSequenceStepSchema,
  insertServerSchema: () => insertServerSchema,
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserSchema: () => insertUserSchema,
  insertWebhookSchema: () => insertWebhookSchema,
  leadLists: () => leadLists,
  leadListsRelations: () => leadListsRelations,
  leadStatusEnum: () => leadStatusEnum,
  leads: () => leads,
  leadsRelations: () => leadsRelations,
  mailFolders: () => mailFolders,
  mailFoldersRelations: () => mailFoldersRelations,
  mailMessages: () => mailMessages,
  mailMessagesRelations: () => mailMessagesRelations,
  mailboxes: () => mailboxes,
  mailboxesRelations: () => mailboxesRelations,
  messageStatusEnum: () => messageStatusEnum,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  organizationUsers: () => organizationUsers,
  organizationUsersRelations: () => organizationUsersRelations,
  organizations: () => organizations,
  organizationsRelations: () => organizationsRelations,
  outlookMailboxStatusEnum: () => outlookMailboxStatusEnum,
  outlookMailboxes: () => outlookMailboxes,
  outlookMailboxesRelations: () => outlookMailboxesRelations,
  outreachAnalytics: () => outreachAnalytics,
  outreachAnalyticsRelations: () => outreachAnalyticsRelations,
  outreachEmails: () => outreachEmails,
  outreachEmailsRelations: () => outreachEmailsRelations,
  routeModeEnum: () => routeModeEnum,
  routes: () => routes,
  routesRelations: () => routesRelations,
  selectCampaignLeadSchema: () => selectCampaignLeadSchema,
  selectCampaignSchema: () => selectCampaignSchema,
  selectCredentialSchema: () => selectCredentialSchema,
  selectDomainSchema: () => selectDomainSchema,
  selectEmailAccountSchema: () => selectEmailAccountSchema,
  selectLeadListSchema: () => selectLeadListSchema,
  selectLeadSchema: () => selectLeadSchema,
  selectMessageSchema: () => selectMessageSchema,
  selectOrganizationSchema: () => selectOrganizationSchema,
  selectOutlookMailboxSchema: () => selectOutlookMailboxSchema,
  selectOutreachEmailSchema: () => selectOutreachEmailSchema,
  selectRouteSchema: () => selectRouteSchema,
  selectSequenceSchema: () => selectSequenceSchema,
  selectSequenceStepSchema: () => selectSequenceStepSchema,
  selectServerSchema: () => selectServerSchema,
  selectTemplateSchema: () => selectTemplateSchema,
  selectUserSchema: () => selectUserSchema,
  selectWebhookSchema: () => selectWebhookSchema,
  sequenceStepTypeEnum: () => sequenceStepTypeEnum,
  sequenceSteps: () => sequenceSteps,
  sequenceStepsRelations: () => sequenceStepsRelations,
  sequences: () => sequences,
  sequencesRelations: () => sequencesRelations,
  serverModeEnum: () => serverModeEnum,
  serverSendModeEnum: () => serverSendModeEnum,
  servers: () => servers,
  serversRelations: () => serversRelations,
  smtpEndpoints: () => smtpEndpoints,
  statistics: () => statistics,
  suppressions: () => suppressions,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
  trackDomains: () => trackDomains,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  usersRelations: () => usersRelations,
  webhookEventEnum: () => webhookEventEnum,
  webhookRequests: () => webhookRequests,
  webhookRequestsRelations: () => webhookRequestsRelations,
  webhooks: () => webhooks,
  webhooksRelations: () => webhooksRelations
});
import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var userRoleEnum, serverModeEnum, serverSendModeEnum, domainVerificationEnum, messageStatusEnum, credentialTypeEnum, outlookMailboxStatusEnum, routeModeEnum, webhookEventEnum, users, organizations, organizationUsers, servers, domains, credentials, outlookMailboxes, routes, smtpEndpoints, httpEndpoints, addressEndpoints, messages, deliveries, webhooks, webhookRequests, templates, trackDomains, suppressions, statistics, usersRelations, organizationsRelations, organizationUsersRelations, serversRelations, domainsRelations, credentialsRelations, outlookMailboxesRelations, routesRelations, messagesRelations, deliveriesRelations, webhooksRelations, webhookRequestsRelations, templatesRelations, insertUserSchema, selectUserSchema, insertOrganizationSchema, selectOrganizationSchema, insertServerSchema, selectServerSchema, insertDomainSchema, selectDomainSchema, insertCredentialSchema, selectCredentialSchema, insertOutlookMailboxSchema, selectOutlookMailboxSchema, insertRouteSchema, selectRouteSchema, insertMessageSchema, selectMessageSchema, insertWebhookSchema, selectWebhookSchema, insertTemplateSchema, selectTemplateSchema, campaignStatusEnum, leadStatusEnum, emailAccountStatusEnum, sequenceStepTypeEnum, emailAccounts, leadLists, leads, campaigns, sequences, sequenceSteps, campaignLeads, outreachEmails, outreachAnalytics, emailAccountsRelations, leadListsRelations, leadsRelations, campaignsRelations, sequencesRelations, sequenceStepsRelations, campaignLeadsRelations, outreachEmailsRelations, outreachAnalyticsRelations, insertEmailAccountSchema, selectEmailAccountSchema, insertLeadListSchema, selectLeadListSchema, insertLeadSchema, selectLeadSchema, insertCampaignSchema, selectCampaignSchema, insertSequenceSchema, selectSequenceSchema, insertSequenceStepSchema, selectSequenceStepSchema, insertCampaignLeadSchema, selectCampaignLeadSchema, insertOutreachEmailSchema, selectOutreachEmailSchema, mailboxes, mailFolders, mailMessages, mailboxesRelations, mailFoldersRelations, mailMessagesRelations;
var init_schema = __esm({
  "src/db/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["admin", "member", "viewer"]);
    serverModeEnum = pgEnum("server_mode", ["live", "development"]);
    serverSendModeEnum = pgEnum("server_send_mode", ["smtp", "api", "outlook"]);
    domainVerificationEnum = pgEnum("domain_verification", ["pending", "verified", "failed"]);
    messageStatusEnum = pgEnum("message_status", ["pending", "queued", "sent", "delivered", "bounced", "held", "failed"]);
    credentialTypeEnum = pgEnum("credential_type", ["smtp", "api"]);
    outlookMailboxStatusEnum = pgEnum("outlook_mailbox_status", ["active", "expired", "revoked"]);
    routeModeEnum = pgEnum("route_mode", ["endpoint", "hold", "reject"]);
    webhookEventEnum = pgEnum("webhook_event", [
      "message_sent",
      "message_delivered",
      "message_bounced",
      "message_held",
      "message_opened",
      "link_clicked",
      "domain_verified",
      "spam_alert",
      "test"
    ]);
    users = pgTable("users", {
      id: uuid("id").primaryKey().defaultRandom(),
      email: text("email").notNull().unique(),
      firstName: text("first_name"),
      lastName: text("last_name"),
      passwordHash: text("password_hash"),
      avatarUrl: text("avatar_url"),
      isAdmin: boolean("is_admin").default(false).notNull(),
      emailVerified: boolean("email_verified").default(false).notNull(),
      twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
      twoFactorSecret: text("two_factor_secret"),
      lastLoginAt: timestamp("last_login_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    organizations = pgTable("organizations", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: text("name").notNull(),
      slug: text("slug").notNull().unique(),
      timezone: text("timezone").default("UTC").notNull(),
      owner_id: uuid("owner_id").references(() => users.id).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    organizationUsers = pgTable("organization_users", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      userId: uuid("user_id").references(() => users.id).notNull(),
      role: userRoleEnum("role").default("member").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => ({
      orgUserUnique: uniqueIndex("org_user_unique").on(table.organizationId, table.userId)
    }));
    servers = pgTable("servers", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      name: text("name").notNull(),
      slug: text("slug").notNull(),
      mode: serverModeEnum("mode").default("live").notNull(),
      sendMode: serverSendModeEnum("send_mode").default("smtp").notNull(),
      description: text("description"),
      defaultFromAddress: text("default_from_address"),
      defaultFromName: text("default_from_name"),
      ipPoolId: uuid("ip_pool_id"),
      // Limits
      sendLimit: integer("send_limit"),
      sendLimitPeriod: text("send_limit_period").default("day"),
      outboundSpamThreshold: integer("outbound_spam_threshold").default(5),
      // Settings
      trackOpens: boolean("track_opens").default(true).notNull(),
      trackClicks: boolean("track_clicks").default(true).notNull(),
      logSmtpData: boolean("log_smtp_data").default(false).notNull(),
      privacyMode: boolean("privacy_mode").default(false).notNull(),
      // Message retention
      retentionDays: integer("retention_days").default(30),
      retentionDaysHeld: integer("retention_days_held").default(14),
      // Status
      suspended: boolean("suspended").default(false).notNull(),
      suspendedReason: text("suspended_reason"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      orgSlugUnique: uniqueIndex("server_org_slug_unique").on(table.organizationId, table.slug)
    }));
    domains = pgTable("domains", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      verificationToken: text("verification_token"),
      verificationMethod: text("verification_method").default("dns"),
      verificationStatus: domainVerificationEnum("verification_status").default("pending").notNull(),
      verifiedAt: timestamp("verified_at"),
      // DKIM
      dkimPrivateKey: text("dkim_private_key"),
      dkimPublicKey: text("dkim_public_key"),
      dkimSelector: text("dkim_selector").default("postal"),
      dkimStatus: text("dkim_status").default("pending"),
      dkimError: text("dkim_error"),
      // SPF
      spfStatus: text("spf_status").default("pending"),
      spfError: text("spf_error"),
      // DMARC
      dmarcStatus: text("dmarc_status").default("pending"),
      dmarcError: text("dmarc_error"),
      // MX
      mxStatus: text("mx_status").default("pending"),
      mxError: text("mx_error"),
      // Return path
      returnPathStatus: text("return_path_status").default("pending"),
      returnPathError: text("return_path_error"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    credentials = pgTable("credentials", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      type: credentialTypeEnum("type").default("smtp").notNull(),
      key: text("key").notNull(),
      secretHash: text("secret_hash"),
      lastUsedAt: timestamp("last_used_at"),
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    outlookMailboxes = pgTable("outlook_mailboxes", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      email: text("email").notNull(),
      displayName: text("display_name"),
      microsoftUserId: text("microsoft_user_id").notNull(),
      tenantId: text("tenant_id"),
      scopes: jsonb("scopes").notNull().default([]),
      accessTokenEncrypted: text("access_token_encrypted").notNull(),
      refreshTokenEncrypted: text("refresh_token_encrypted").notNull(),
      tokenExpiresAt: timestamp("token_expires_at").notNull(),
      status: outlookMailboxStatusEnum("status").default("active").notNull(),
      lastSyncedAt: timestamp("last_synced_at"),
      lastSendAt: timestamp("last_send_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      serverEmailUnique: uniqueIndex("outlook_mailboxes_server_email_unique").on(table.serverId, table.email),
      microsoftUserUnique: uniqueIndex("outlook_mailboxes_microsoft_user_unique").on(table.microsoftUserId)
    }));
    routes = pgTable("routes", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      address: text("address").notNull(),
      mode: routeModeEnum("mode").default("endpoint").notNull(),
      // Endpoint configurations
      smtpEndpointId: uuid("smtp_endpoint_id"),
      httpEndpointId: uuid("http_endpoint_id"),
      addressEndpointId: uuid("address_endpoint_id"),
      // Spam handling
      spamMode: text("spam_mode").default("mark"),
      spamThreshold: integer("spam_threshold").default(5),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    smtpEndpoints = pgTable("smtp_endpoints", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      hostname: text("hostname").notNull(),
      port: integer("port").default(25).notNull(),
      sslMode: text("ssl_mode").default("auto").notNull(),
      username: text("username"),
      password: text("password"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    httpEndpoints = pgTable("http_endpoints", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      url: text("url").notNull(),
      method: text("method").default("POST").notNull(),
      headers: jsonb("headers").default({}),
      includeOriginal: boolean("include_original").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    addressEndpoints = pgTable("address_endpoints", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      emailAddress: text("email_address").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    messages = pgTable("messages", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      // Message identification
      messageId: text("message_id"),
      token: text("token").notNull(),
      // Direction
      direction: text("direction").notNull(),
      // 'incoming' | 'outgoing'
      // Sender/Recipient
      fromAddress: text("from_address").notNull(),
      fromName: text("from_name"),
      toAddresses: jsonb("to_addresses").notNull().default([]),
      ccAddresses: jsonb("cc_addresses").default([]),
      bccAddresses: jsonb("bcc_addresses").default([]),
      // Content
      subject: text("subject"),
      plainBody: text("plain_body"),
      htmlBody: text("html_body"),
      attachments: jsonb("attachments").default([]),
      headers: jsonb("headers").default({}),
      // Status
      status: messageStatusEnum("status").default("pending").notNull(),
      held: boolean("held").default(false).notNull(),
      holdExpiry: timestamp("hold_expiry"),
      heldReason: text("held_reason"),
      // Tracking
      spamScore: integer("spam_score"),
      spamChecks: jsonb("spam_checks").default([]),
      // Timestamps
      sentAt: timestamp("sent_at"),
      deliveredAt: timestamp("delivered_at"),
      bouncedAt: timestamp("bounced_at"),
      openedAt: timestamp("opened_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    deliveries = pgTable("deliveries", {
      id: uuid("id").primaryKey().defaultRandom(),
      messageId: uuid("message_id").references(() => messages.id).notNull(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      // Recipient
      rcptTo: text("rcpt_to").notNull(),
      // Status
      status: messageStatusEnum("status").default("pending").notNull(),
      // Details
      details: text("details"),
      output: text("output"),
      sentWithSsl: boolean("sent_with_ssl").default(false),
      // Timestamps
      sentAt: timestamp("sent_at"),
      deliveredAt: timestamp("delivered_at"),
      bouncedAt: timestamp("bounced_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    webhooks = pgTable("webhooks", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      url: text("url").notNull(),
      secret: text("secret"),
      active: boolean("active").default(true).notNull(),
      events: jsonb("events").notNull().default([]),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    webhookRequests = pgTable("webhook_requests", {
      id: uuid("id").primaryKey().defaultRandom(),
      webhookId: uuid("webhook_id").references(() => webhooks.id).notNull(),
      event: webhookEventEnum("event").notNull(),
      payload: jsonb("payload").notNull(),
      responseCode: integer("response_code"),
      responseBody: text("response_body"),
      success: boolean("success").default(false).notNull(),
      attempts: integer("attempts").default(1).notNull(),
      error: text("error"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    templates = pgTable("templates", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      name: text("name").notNull(),
      slug: text("slug").notNull(),
      subject: text("subject").notNull(),
      plainBody: text("plain_body"),
      htmlBody: text("html_body"),
      variables: jsonb("variables").default([]),
      // list of template variable names
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      serverSlugUnique: uniqueIndex("template_server_slug_unique").on(table.serverId, table.slug)
    }));
    trackDomains = pgTable("track_domains", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      domain: text("domain").notNull(),
      verificationToken: text("verification_token"),
      verificationStatus: domainVerificationEnum("verification_status").default("pending").notNull(),
      verifiedAt: timestamp("verified_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    suppressions = pgTable("suppressions", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      emailAddress: text("email_address").notNull(),
      reason: text("reason").notNull(),
      // 'bounce', 'complaint', 'manual'
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => ({
      serverEmailUnique: uniqueIndex("suppression_server_email_unique").on(table.serverId, table.emailAddress)
    }));
    statistics = pgTable("statistics", {
      id: uuid("id").primaryKey().defaultRandom(),
      serverId: uuid("server_id").references(() => servers.id).notNull(),
      date: timestamp("date").notNull(),
      // Counts
      messagesSent: integer("messages_sent").default(0).notNull(),
      messagesDelivered: integer("messages_delivered").default(0).notNull(),
      messagesBounced: integer("messages_bounced").default(0).notNull(),
      messagesHeld: integer("messages_held").default(0).notNull(),
      messagesOpened: integer("messages_opened").default(0).notNull(),
      linksClicked: integer("links_clicked").default(0).notNull(),
      // Incoming
      messagesIncoming: integer("messages_incoming").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => ({
      serverDateUnique: uniqueIndex("stats_server_date_unique").on(table.serverId, table.date)
    }));
    usersRelations = relations(users, ({ many }) => ({
      organizations: many(organizationUsers)
    }));
    organizationsRelations = relations(organizations, ({ one, many }) => ({
      owner: one(users, {
        fields: [organizations.owner_id],
        references: [users.id]
      }),
      members: many(organizationUsers),
      servers: many(servers)
    }));
    organizationUsersRelations = relations(organizationUsers, ({ one }) => ({
      organization: one(organizations, {
        fields: [organizationUsers.organizationId],
        references: [organizations.id]
      }),
      user: one(users, {
        fields: [organizationUsers.userId],
        references: [users.id]
      })
    }));
    serversRelations = relations(servers, ({ one, many }) => ({
      organization: one(organizations, {
        fields: [servers.organizationId],
        references: [organizations.id]
      }),
      domains: many(domains),
      credentials: many(credentials),
      routes: many(routes),
      messages: many(messages),
      webhooks: many(webhooks),
      smtpEndpoints: many(smtpEndpoints),
      httpEndpoints: many(httpEndpoints),
      addressEndpoints: many(addressEndpoints),
      outlookMailboxes: many(outlookMailboxes),
      trackDomains: many(trackDomains),
      suppressions: many(suppressions),
      statistics: many(statistics),
      templates: many(templates)
    }));
    domainsRelations = relations(domains, ({ one }) => ({
      server: one(servers, {
        fields: [domains.serverId],
        references: [servers.id]
      })
    }));
    credentialsRelations = relations(credentials, ({ one }) => ({
      server: one(servers, {
        fields: [credentials.serverId],
        references: [servers.id]
      })
    }));
    outlookMailboxesRelations = relations(outlookMailboxes, ({ one }) => ({
      server: one(servers, {
        fields: [outlookMailboxes.serverId],
        references: [servers.id]
      })
    }));
    routesRelations = relations(routes, ({ one }) => ({
      server: one(servers, {
        fields: [routes.serverId],
        references: [servers.id]
      }),
      smtpEndpoint: one(smtpEndpoints, {
        fields: [routes.smtpEndpointId],
        references: [smtpEndpoints.id]
      }),
      httpEndpoint: one(httpEndpoints, {
        fields: [routes.httpEndpointId],
        references: [httpEndpoints.id]
      }),
      addressEndpoint: one(addressEndpoints, {
        fields: [routes.addressEndpointId],
        references: [addressEndpoints.id]
      })
    }));
    messagesRelations = relations(messages, ({ one, many }) => ({
      server: one(servers, {
        fields: [messages.serverId],
        references: [servers.id]
      }),
      deliveries: many(deliveries)
    }));
    deliveriesRelations = relations(deliveries, ({ one }) => ({
      message: one(messages, {
        fields: [deliveries.messageId],
        references: [messages.id]
      }),
      server: one(servers, {
        fields: [deliveries.serverId],
        references: [servers.id]
      })
    }));
    webhooksRelations = relations(webhooks, ({ one, many }) => ({
      server: one(servers, {
        fields: [webhooks.serverId],
        references: [servers.id]
      }),
      requests: many(webhookRequests)
    }));
    webhookRequestsRelations = relations(webhookRequests, ({ one }) => ({
      webhook: one(webhooks, {
        fields: [webhookRequests.webhookId],
        references: [webhooks.id]
      })
    }));
    templatesRelations = relations(templates, ({ one }) => ({
      server: one(servers, {
        fields: [templates.serverId],
        references: [servers.id]
      })
    }));
    insertUserSchema = createInsertSchema(users);
    selectUserSchema = createSelectSchema(users);
    insertOrganizationSchema = createInsertSchema(organizations);
    selectOrganizationSchema = createSelectSchema(organizations);
    insertServerSchema = createInsertSchema(servers);
    selectServerSchema = createSelectSchema(servers);
    insertDomainSchema = createInsertSchema(domains);
    selectDomainSchema = createSelectSchema(domains);
    insertCredentialSchema = createInsertSchema(credentials);
    selectCredentialSchema = createSelectSchema(credentials);
    insertOutlookMailboxSchema = createInsertSchema(outlookMailboxes);
    selectOutlookMailboxSchema = createSelectSchema(outlookMailboxes);
    insertRouteSchema = createInsertSchema(routes);
    selectRouteSchema = createSelectSchema(routes);
    insertMessageSchema = createInsertSchema(messages);
    selectMessageSchema = createSelectSchema(messages);
    insertWebhookSchema = createInsertSchema(webhooks);
    selectWebhookSchema = createSelectSchema(webhooks);
    insertTemplateSchema = createInsertSchema(templates);
    selectTemplateSchema = createSelectSchema(templates);
    campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "paused", "completed", "archived"]);
    leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "replied", "interested", "not_interested", "bounced", "unsubscribed"]);
    emailAccountStatusEnum = pgEnum("email_account_status", ["pending", "verified", "failed", "paused"]);
    sequenceStepTypeEnum = pgEnum("sequence_step_type", ["email", "delay", "condition"]);
    emailAccounts = pgTable("email_accounts", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      // Account details
      email: text("email").notNull(),
      displayName: text("display_name"),
      // SMTP settings
      smtpHost: text("smtp_host").notNull(),
      smtpPort: integer("smtp_port").default(587).notNull(),
      smtpUsername: text("smtp_username").notNull(),
      smtpPassword: text("smtp_password").notNull(),
      // encrypted
      smtpSecure: boolean("smtp_secure").default(true).notNull(),
      // IMAP settings (for reply tracking)
      imapHost: text("imap_host"),
      imapPort: integer("imap_port").default(993),
      imapUsername: text("imap_username"),
      imapPassword: text("imap_password"),
      // encrypted
      imapSecure: boolean("imap_secure").default(true),
      // Sending limits (warm-up and daily limits)
      dailySendLimit: integer("daily_send_limit").default(50).notNull(),
      currentDailySent: integer("current_daily_sent").default(0).notNull(),
      minMinutesBetweenEmails: integer("min_minutes_between_emails").default(5).notNull(),
      maxMinutesBetweenEmails: integer("max_minutes_between_emails").default(30).notNull(),
      // Warm-up settings
      warmupEnabled: boolean("warmup_enabled").default(true).notNull(),
      warmupDays: integer("warmup_days").default(14).notNull(),
      warmupCurrentDay: integer("warmup_current_day").default(0).notNull(),
      // Status
      status: emailAccountStatusEnum("status").default("pending").notNull(),
      lastError: text("last_error"),
      lastSyncAt: timestamp("last_sync_at"),
      verifiedAt: timestamp("verified_at"),
      // Tracking
      totalSent: integer("total_sent").default(0).notNull(),
      totalOpens: integer("total_opens").default(0).notNull(),
      totalClicks: integer("total_clicks").default(0).notNull(),
      totalReplies: integer("total_replies").default(0).notNull(),
      totalBounces: integer("total_bounces").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      orgEmailUnique: uniqueIndex("email_account_org_email_unique").on(table.organizationId, table.email)
    }));
    leadLists = pgTable("lead_lists", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      name: text("name").notNull(),
      description: text("description"),
      color: text("color").default("#3B82F6"),
      leadCount: integer("lead_count").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    leads = pgTable("leads", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      // Contact info
      email: text("email").notNull(),
      firstName: text("first_name"),
      lastName: text("last_name"),
      companyName: text("company_name"),
      companySize: text("company_size"),
      industry: text("industry"),
      title: text("title"),
      website: text("website"),
      linkedinUrl: text("linkedin_url"),
      phone: text("phone"),
      location: text("location"),
      // Custom fields (JSON)
      customFields: jsonb("custom_fields").default({}),
      // Status
      status: leadStatusEnum("status").default("new").notNull(),
      // Source tracking
      source: text("source"),
      leadListId: uuid("lead_list_id").references(() => leadLists.id),
      // Engagement tracking
      totalEmailsSent: integer("total_emails_sent").default(0).notNull(),
      totalOpens: integer("total_opens").default(0).notNull(),
      totalClicks: integer("total_clicks").default(0).notNull(),
      totalReplies: integer("total_replies").default(0).notNull(),
      lastContactedAt: timestamp("last_contacted_at"),
      lastRepliedAt: timestamp("last_replied_at"),
      // Opt-out
      unsubscribedAt: timestamp("unsubscribed_at"),
      unsubscribedReason: text("unsubscribed_reason"),
      // Timestamps
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      orgEmailUnique: uniqueIndex("lead_org_email_unique").on(table.organizationId, table.email)
    }));
    campaigns = pgTable("campaigns", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      // Basic info
      name: text("name").notNull(),
      description: text("description"),
      // Settings
      status: campaignStatusEnum("status").default("draft").notNull(),
      // Sender settings
      fromName: text("from_name"),
      replyToEmail: text("reply_to_email"),
      // Schedule settings
      timezone: text("timezone").default("UTC").notNull(),
      sendOnWeekends: boolean("send_on_weekends").default(false).notNull(),
      sendStartTime: text("send_start_time").default("09:00").notNull(),
      // HH:mm
      sendEndTime: text("send_end_time").default("17:00").notNull(),
      // HH:mm
      // Tracking settings
      trackOpens: boolean("track_opens").default(true).notNull(),
      trackClicks: boolean("track_clicks").default(true).notNull(),
      // Statistics (cached)
      totalLeads: integer("total_leads").default(0).notNull(),
      leadsContacted: integer("leads_contacted").default(0).notNull(),
      totalOpens: integer("total_opens").default(0).notNull(),
      totalClicks: integer("total_clicks").default(0).notNull(),
      totalReplies: integer("total_replies").default(0).notNull(),
      totalBounces: integer("total_bounces").default(0).notNull(),
      totalUnsubscribes: integer("total_unsubscribes").default(0).notNull(),
      // Timestamps
      startedAt: timestamp("started_at"),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    sequences = pgTable("sequences", {
      id: uuid("id").primaryKey().defaultRandom(),
      campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
      name: text("name").notNull(),
      description: text("description"),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    sequenceSteps = pgTable("sequence_steps", {
      id: uuid("id").primaryKey().defaultRandom(),
      sequenceId: uuid("sequence_id").references(() => sequences.id).notNull(),
      // Step order
      stepOrder: integer("step_order").notNull(),
      // Type
      type: sequenceStepTypeEnum("type").default("email").notNull(),
      // Delay before this step (in hours)
      delayHours: integer("delay_hours").default(0).notNull(),
      // Email content
      subject: text("subject"),
      plainBody: text("plain_body"),
      htmlBody: text("html_body"),
      // A/B testing
      subjectB: text("subject_b"),
      plainBodyB: text("plain_body_b"),
      htmlBodyB: text("html_body_b"),
      abTestEnabled: boolean("ab_test_enabled").default(false).notNull(),
      abTestPercentage: integer("ab_test_percentage").default(50),
      // percentage for variant A
      // Statistics
      totalSent: integer("total_sent").default(0).notNull(),
      totalOpens: integer("total_opens").default(0).notNull(),
      totalClicks: integer("total_clicks").default(0).notNull(),
      totalReplies: integer("total_replies").default(0).notNull(),
      // Timestamps
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      sequenceOrderUnique: uniqueIndex("sequence_step_order_unique").on(table.sequenceId, table.stepOrder)
    }));
    campaignLeads = pgTable("campaign_leads", {
      id: uuid("id").primaryKey().defaultRandom(),
      campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
      leadId: uuid("lead_id").references(() => leads.id).notNull(),
      // Assignment
      assignedEmailAccountId: uuid("assigned_email_account_id").references(() => emailAccounts.id),
      // Progress
      currentStepId: uuid("current_step_id").references(() => sequenceSteps.id),
      currentStepOrder: integer("current_step_order").default(0).notNull(),
      // Status
      status: leadStatusEnum("status").default("new").notNull(),
      // Next scheduled action
      nextScheduledAt: timestamp("next_scheduled_at"),
      // Tracking for this specific campaign/lead combination
      totalOpens: integer("total_opens").default(0).notNull(),
      totalClicks: integer("total_clicks").default(0).notNull(),
      totalReplies: integer("total_replies").default(0).notNull(),
      // Timestamps
      firstContactedAt: timestamp("first_contacted_at"),
      lastContactedAt: timestamp("last_contacted_at"),
      lastRepliedAt: timestamp("last_replied_at"),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      campaignLeadUnique: uniqueIndex("campaign_lead_unique").on(table.campaignId, table.leadId)
    }));
    outreachEmails = pgTable("outreach_emails", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      campaignId: uuid("campaign_id").references(() => campaigns.id).notNull(),
      campaignLeadId: uuid("campaign_lead_id").references(() => campaignLeads.id).notNull(),
      sequenceStepId: uuid("sequence_step_id").references(() => sequenceSteps.id).notNull(),
      emailAccountId: uuid("email_account_id").references(() => emailAccounts.id).notNull(),
      // Message details
      messageId: text("message_id"),
      // RFC 2822 Message-ID
      // Content sent
      subject: text("subject").notNull(),
      plainBody: text("plain_body"),
      htmlBody: text("html_body"),
      // A/B variant
      abVariant: text("ab_variant"),
      // 'a' or 'b'
      // Tracking
      sentAt: timestamp("sent_at"),
      deliveredAt: timestamp("delivered_at"),
      openedAt: timestamp("opened_at"),
      openedCount: integer("opened_count").default(0).notNull(),
      clickedAt: timestamp("clicked_at"),
      clickedCount: integer("clicked_count").default(0).notNull(),
      repliedAt: timestamp("replied_at"),
      bouncedAt: timestamp("bounced_at"),
      bounceReason: text("bounce_reason"),
      unsubscribedAt: timestamp("unsubscribed_at"),
      // Status
      status: messageStatusEnum("status").default("pending").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    outreachAnalytics = pgTable("outreach_analytics", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      campaignId: uuid("campaign_id").references(() => campaigns.id),
      emailAccountId: uuid("email_account_id").references(() => emailAccounts.id),
      date: timestamp("date").notNull(),
      // Stats
      emailsSent: integer("emails_sent").default(0).notNull(),
      emailsDelivered: integer("emails_delivered").default(0).notNull(),
      emailsBounced: integer("emails_bounced").default(0).notNull(),
      opens: integer("opens").default(0).notNull(),
      clicks: integer("clicks").default(0).notNull(),
      replies: integer("replies").default(0).notNull(),
      unsubscribes: integer("unsubscribes").default(0).notNull(),
      leadsAdded: integer("leads_added").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => ({
      orgDateUnique: uniqueIndex("outreach_analytics_org_date_unique").on(table.organizationId, table.date, table.campaignId, table.emailAccountId)
    }));
    emailAccountsRelations = relations(emailAccounts, ({ one, many }) => ({
      organization: one(organizations, {
        fields: [emailAccounts.organizationId],
        references: [organizations.id]
      }),
      campaignLeads: many(campaignLeads),
      outreachEmails: many(outreachEmails)
    }));
    leadListsRelations = relations(leadLists, ({ one, many }) => ({
      organization: one(organizations, {
        fields: [leadLists.organizationId],
        references: [organizations.id]
      }),
      leads: many(leads)
    }));
    leadsRelations = relations(leads, ({ one, many }) => ({
      organization: one(organizations, {
        fields: [leads.organizationId],
        references: [organizations.id]
      }),
      leadList: one(leadLists, {
        fields: [leads.leadListId],
        references: [leadLists.id]
      }),
      campaignLeads: many(campaignLeads)
    }));
    campaignsRelations = relations(campaigns, ({ one, many }) => ({
      organization: one(organizations, {
        fields: [campaigns.organizationId],
        references: [organizations.id]
      }),
      sequences: many(sequences),
      campaignLeads: many(campaignLeads),
      outreachEmails: many(outreachEmails)
    }));
    sequencesRelations = relations(sequences, ({ one, many }) => ({
      campaign: one(campaigns, {
        fields: [sequences.campaignId],
        references: [campaigns.id]
      }),
      steps: many(sequenceSteps)
    }));
    sequenceStepsRelations = relations(sequenceSteps, ({ one, many }) => ({
      sequence: one(sequences, {
        fields: [sequenceSteps.sequenceId],
        references: [sequences.id]
      }),
      campaignLeads: many(campaignLeads),
      outreachEmails: many(outreachEmails)
    }));
    campaignLeadsRelations = relations(campaignLeads, ({ one, many }) => ({
      campaign: one(campaigns, {
        fields: [campaignLeads.campaignId],
        references: [campaigns.id]
      }),
      lead: one(leads, {
        fields: [campaignLeads.leadId],
        references: [leads.id]
      }),
      assignedEmailAccount: one(emailAccounts, {
        fields: [campaignLeads.assignedEmailAccountId],
        references: [emailAccounts.id]
      }),
      currentStep: one(sequenceSteps, {
        fields: [campaignLeads.currentStepId],
        references: [sequenceSteps.id]
      }),
      outreachEmails: many(outreachEmails)
    }));
    outreachEmailsRelations = relations(outreachEmails, ({ one }) => ({
      organization: one(organizations, {
        fields: [outreachEmails.organizationId],
        references: [organizations.id]
      }),
      campaign: one(campaigns, {
        fields: [outreachEmails.campaignId],
        references: [campaigns.id]
      }),
      campaignLead: one(campaignLeads, {
        fields: [outreachEmails.campaignLeadId],
        references: [campaignLeads.id]
      }),
      sequenceStep: one(sequenceSteps, {
        fields: [outreachEmails.sequenceStepId],
        references: [sequenceSteps.id]
      }),
      emailAccount: one(emailAccounts, {
        fields: [outreachEmails.emailAccountId],
        references: [emailAccounts.id]
      })
    }));
    outreachAnalyticsRelations = relations(outreachAnalytics, ({ one }) => ({
      organization: one(organizations, {
        fields: [outreachAnalytics.organizationId],
        references: [organizations.id]
      }),
      campaign: one(campaigns, {
        fields: [outreachAnalytics.campaignId],
        references: [campaigns.id]
      }),
      emailAccount: one(emailAccounts, {
        fields: [outreachAnalytics.emailAccountId],
        references: [emailAccounts.id]
      })
    }));
    insertEmailAccountSchema = createInsertSchema(emailAccounts);
    selectEmailAccountSchema = createSelectSchema(emailAccounts);
    insertLeadListSchema = createInsertSchema(leadLists);
    selectLeadListSchema = createSelectSchema(leadLists);
    insertLeadSchema = createInsertSchema(leads);
    selectLeadSchema = createSelectSchema(leads);
    insertCampaignSchema = createInsertSchema(campaigns);
    selectCampaignSchema = createSelectSchema(campaigns);
    insertSequenceSchema = createInsertSchema(sequences);
    selectSequenceSchema = createSelectSchema(sequences);
    insertSequenceStepSchema = createInsertSchema(sequenceSteps);
    selectSequenceStepSchema = createSelectSchema(sequenceSteps);
    insertCampaignLeadSchema = createInsertSchema(campaignLeads);
    selectCampaignLeadSchema = createSelectSchema(campaignLeads);
    insertOutreachEmailSchema = createInsertSchema(outreachEmails);
    selectOutreachEmailSchema = createSelectSchema(outreachEmails);
    mailboxes = pgTable("mailboxes", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").references(() => users.id).notNull(),
      email: text("email").notNull(),
      displayName: text("display_name"),
      // SMTP settings
      smtpHost: text("smtp_host").notNull(),
      smtpPort: integer("smtp_port").default(587).notNull(),
      smtpUsername: text("smtp_username").notNull(),
      smtpPasswordEncrypted: text("smtp_password_encrypted").notNull(),
      smtpSecure: boolean("smtp_secure").default(true).notNull(),
      // IMAP settings
      imapHost: text("imap_host").notNull(),
      imapPort: integer("imap_port").default(993).notNull(),
      imapUsername: text("imap_username").notNull(),
      imapPasswordEncrypted: text("imap_password_encrypted").notNull(),
      imapSecure: boolean("imap_secure").default(true).notNull(),
      // Status
      isDefault: boolean("is_default").default(false).notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      lastSyncAt: timestamp("last_sync_at"),
      syncError: text("sync_error"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    mailFolders = pgTable("mail_folders", {
      id: uuid("id").primaryKey().defaultRandom(),
      mailboxId: uuid("mailbox_id").references(() => mailboxes.id).notNull(),
      remoteId: text("remote_id").notNull(),
      name: text("name").notNull(),
      type: text("type").default("custom"),
      // 'inbox', 'sent', 'drafts', 'trash', 'spam', 'custom'
      unreadCount: integer("unread_count").default(0).notNull(),
      totalCount: integer("total_count").default(0).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      mailboxRemoteUnique: uniqueIndex("mail_folder_mailbox_remote_unique").on(table.mailboxId, table.remoteId)
    }));
    mailMessages = pgTable("mail_messages", {
      id: uuid("id").primaryKey().defaultRandom(),
      mailboxId: uuid("mailbox_id").references(() => mailboxes.id).notNull(),
      folderId: uuid("folder_id").references(() => mailFolders.id).notNull(),
      // RFC 2822
      messageId: text("message_id"),
      inReplyTo: text("in_reply_to"),
      references: text("references"),
      // Headers
      subject: text("subject"),
      fromAddress: text("from_address"),
      fromName: text("from_name"),
      toAddresses: jsonb("to_addresses").default([]),
      ccAddresses: jsonb("cc_addresses").default([]),
      bccAddresses: jsonb("bcc_addresses").default([]),
      // Content
      plainBody: text("plain_body"),
      htmlBody: text("html_body"),
      headers: jsonb("headers").default({}),
      // Attachments
      attachments: jsonb("attachments").default([]),
      hasAttachments: boolean("has_attachments").default(false).notNull(),
      // Status
      isRead: boolean("is_read").default(false).notNull(),
      isStarred: boolean("is_starred").default(false).notNull(),
      isDeleted: boolean("is_deleted").default(false).notNull(),
      isDraft: boolean("is_draft").default(false).notNull(),
      // Remote
      remoteUid: integer("remote_uid"),
      remoteDate: timestamp("remote_date"),
      size: integer("size").default(0),
      // Timestamps
      receivedAt: timestamp("received_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    }, (table) => ({
      mailboxUidUnique: uniqueIndex("mail_message_mailbox_uid_unique").on(table.mailboxId, table.remoteUid)
    }));
    mailboxesRelations = relations(mailboxes, ({ one, many }) => ({
      user: one(users, {
        fields: [mailboxes.userId],
        references: [users.id]
      }),
      folders: many(mailFolders),
      messages: many(mailMessages)
    }));
    mailFoldersRelations = relations(mailFolders, ({ one, many }) => ({
      mailbox: one(mailboxes, {
        fields: [mailFolders.mailboxId],
        references: [mailboxes.id]
      }),
      messages: many(mailMessages)
    }));
    mailMessagesRelations = relations(mailMessages, ({ one }) => ({
      mailbox: one(mailboxes, {
        fields: [mailMessages.mailboxId],
        references: [mailboxes.id]
      }),
      folder: one(mailFolders, {
        fields: [mailMessages.folderId],
        references: [mailFolders.id]
      })
    }));
  }
});

// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var connectionString, queryClient, db;
var init_db = __esm({
  "src/db/index.ts"() {
    "use strict";
    init_schema();
    init_schema();
    connectionString = process.env.DATABASE_URL;
    queryClient = postgres(connectionString);
    db = drizzle(queryClient, { schema: schema_exports });
  }
});

// src/lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
function getKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  return scryptSync(key, "skaleclub-salt", 32);
}
function encrypt(plaintext) {
  const iv = randomBytes(16);
  const key = getKey();
  const cipher = createCipheriv(ALGORITHM2, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}
function decrypt(encryptedText) {
  const parts = encryptedText.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted text format");
  }
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM2, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
var ALGORITHM2;
var init_crypto = __esm({
  "src/lib/crypto.ts"() {
    "use strict";
    ALGORITHM2 = "aes-256-gcm";
  }
});

// src/server/lib/mail-sync.ts
import Imap from "imap";
import { simpleParser as simpleParser2 } from "mailparser";
import { eq as eq23, and as and19 } from "drizzle-orm";
async function syncMailbox(mailboxId) {
  const result = {
    mailboxId,
    folderId: "",
    newMessages: 0,
    errors: []
  };
  try {
    const mailbox = await db.query.mailboxes.findFirst({
      where: eq23(mailboxes.id, mailboxId)
    });
    if (!mailbox) {
      throw new Error("Mailbox not found");
    }
    const imapConfig = {
      user: mailbox.imapUsername,
      password: decrypt(mailbox.imapPasswordEncrypted),
      host: mailbox.imapHost,
      port: mailbox.imapPort,
      tls: mailbox.imapSecure,
      tlsOptions: { rejectUnauthorized: false }
    };
    await ensureFoldersExist(mailboxId, imapConfig);
    await syncInboxFolder(mailboxId, imapConfig, result);
    await db.update(mailboxes).set({
      lastSyncAt: /* @__PURE__ */ new Date(),
      syncError: result.errors.length > 0 ? result.errors[0] : null
    }).where(eq23(mailboxes.id, mailboxId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(message);
    await db.update(mailboxes).set({ syncError: message }).where(eq23(mailboxes.id, mailboxId));
  }
  return result;
}
async function ensureFoldersExist(mailboxId, imapConfig) {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);
    imap.once("ready", async () => {
      try {
        const existingFolders = await new Promise((resolveFolders, rejectFolders) => {
          imap.getBoxes((err, boxes) => {
            if (err) {
              rejectFolders(err);
              return;
            }
            const folders = [];
            const processBox = (box, path) => {
              const fullPath = path ? `${path}${box.name}` : box.name;
              folders.push({
                remoteId: fullPath,
                name: box.name,
                type: getFolderType(fullPath)
              });
              if (box.children) {
                Object.entries(box.children).forEach(([_name, subBox]) => {
                  processBox(subBox, fullPath + "/");
                });
              }
            };
            if (boxes) {
              Object.entries(boxes).forEach(([_name, box]) => {
                processBox(box, "");
              });
            }
            resolveFolders(folders);
          });
        });
        for (const folder of existingFolders) {
          const existing = await db.query.mailFolders.findFirst({
            where: and19(
              eq23(mailFolders.mailboxId, mailboxId),
              eq23(mailFolders.remoteId, folder.remoteId)
            )
          });
          if (!existing) {
            await db.insert(mailFolders).values({
              mailboxId,
              remoteId: folder.remoteId,
              name: folder.name,
              type: folder.type
            });
          }
        }
        imap.end();
        resolve();
      } catch (error) {
        imap.end();
        reject(error);
      }
    });
    imap.once("error", (err) => {
      reject(err);
    });
    imap.connect();
  });
}
function getFolderType(remoteId) {
  const upper = remoteId.toUpperCase();
  if (upper === "INBOX")
    return "inbox";
  if (upper === "SENT" || upper === "SENT MAIL" || upper.endsWith("SENT"))
    return "sent";
  if (upper === "DRAFTS" || upper.endsWith("DRAFTS"))
    return "drafts";
  if (upper === "TRASH" || upper === "DELETED" || upper.endsWith("TRASH") || upper.endsWith("DELETED"))
    return "trash";
  if (upper === "SPAM" || upper === "JUNK" || upper.endsWith("SPAM") || upper.endsWith("JUNK"))
    return "spam";
  return "custom";
}
async function syncInboxFolder(mailboxId, imapConfig, result) {
  const folder = await db.query.mailFolders.findFirst({
    where: and19(
      eq23(mailFolders.mailboxId, mailboxId),
      eq23(mailFolders.remoteId, "INBOX")
    )
  });
  if (!folder) {
    result.errors.push("INBOX folder not found in database");
    return;
  }
  result.folderId = folder.id;
  return new Promise((resolve) => {
    const imap = new Imap(imapConfig);
    imap.once("ready", () => {
      imap.openBox("INBOX", true, async (err, box) => {
        if (err) {
          result.errors.push(`Failed to open INBOX: ${err.message}`);
          imap.end();
          resolve();
          return;
        }
        try {
          if (box.messages.total > 0) {
            const startSeq = Math.max(1, box.messages.total - 100);
            const messages2 = await fetchMessages(imap, box, mailboxId, folder.id, startSeq, box.messages.total);
            result.newMessages += messages2;
          }
          await db.update(mailFolders).set({
            unreadCount: box.messages.unseen,
            totalCount: box.messages.total
          }).where(eq23(mailFolders.id, folder.id));
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          result.errors.push(`Error syncing INBOX: ${msg}`);
        }
        imap.end();
        resolve();
      });
    });
    imap.once("error", (err) => {
      result.errors.push(`IMAP error: ${err.message}`);
      resolve();
    });
    imap.connect();
  });
}
async function fetchMessages(imap, box, mailboxId, folderId, startSeq, endSeq) {
  return new Promise((resolve, reject) => {
    const fetch2 = imap.fetch(`${startSeq}:${endSeq}`, {
      bodies: "",
      struct: true
    });
    let newCount = 0;
    let completed = 0;
    fetch2.on("message", (msg) => {
      let uid = null;
      let messageId = null;
      let raw = "";
      msg.on("attributes", (attrs) => {
        uid = attrs.uid;
        const headers = attrs.headers;
        if (headers) {
          const msgIdHeader = headers.find((h) => h.key === "message-id");
          messageId = msgIdHeader ? msgIdHeader.value : null;
        }
      });
      msg.on("body", (stream) => {
        stream.on("data", (chunk) => {
          raw += chunk.toString("utf8");
        });
      });
      msg.once("end", async () => {
        completed++;
        if (messageId && uid) {
          try {
            const existing = await db.query.mailMessages.findFirst({
              where: and19(
                eq23(mailMessages.mailboxId, mailboxId),
                eq23(mailMessages.folderId, folderId),
                eq23(mailMessages.remoteUid, uid)
              )
            });
            if (!existing) {
              const parsed = await simpleParser2(raw);
              const refs = parsed.references;
              const refsStr = Array.isArray(refs) ? refs.join(" ") : refs || null;
              const toObj = parsed.to && !Array.isArray(parsed.to) ? parsed.to : Array.isArray(parsed.to) ? parsed.to[0] : void 0;
              await db.insert(mailMessages).values({
                mailboxId,
                folderId,
                messageId: parsed.messageId || null,
                inReplyTo: parsed.inReplyTo || null,
                references: refsStr,
                subject: parsed.subject || null,
                fromAddress: parsed.from?.value[0]?.address || null,
                fromName: parsed.from?.value[0]?.name || null,
                toAddresses: toObj?.value.map((v) => ({
                  name: v.name,
                  address: v.address
                })) || [],
                plainBody: parsed.text || null,
                htmlBody: parsed.html || null,
                headers: {},
                hasAttachments: parsed.attachments.length > 0,
                attachments: parsed.attachments.map((att) => ({
                  filename: att.filename,
                  contentType: att.contentType,
                  size: att.size
                })),
                isRead: false,
                isDraft: false,
                remoteUid: uid,
                remoteDate: parsed.date || null,
                receivedAt: parsed.date || /* @__PURE__ */ new Date()
              });
              newCount++;
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        }
        if (completed >= endSeq - startSeq + 1) {
          resolve(newCount);
        }
      });
    });
    fetch2.once("error", (err) => {
      console.error("Fetch error:", err);
      resolve(0);
    });
  });
}
async function syncAllMailboxes() {
  const mailboxesToSync = await db.query.mailboxes.findMany({
    where: eq23(mailboxes.isActive, true)
  });
  const results = [];
  for (const mailbox of mailboxesToSync) {
    const result = await syncMailbox(mailbox.id);
    results.push(result);
  }
  return results;
}
var init_mail_sync = __esm({
  "src/server/lib/mail-sync.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_crypto();
  }
});

// src/server/jobs.ts
var jobs_exports = {};
__export(jobs_exports, {
  startSyncWorker: () => startSyncWorker
});
function startSyncWorker() {
  setInterval(async () => {
    try {
      console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Running mailbox sync...`);
      const results = await syncAllMailboxes();
      console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] Sync completed: ${results.length} mailboxes processed`);
    } catch (error) {
      console.error("Sync worker error:", error);
    }
  }, SYNC_INTERVAL);
  console.log(`Mail sync worker started (interval: ${SYNC_INTERVAL / 1e3}s)`);
}
var SYNC_INTERVAL;
var init_jobs = __esm({
  "src/server/jobs.ts"() {
    "use strict";
    init_mail_sync();
    SYNC_INTERVAL = 5 * 60 * 1e3;
  }
});

// src/server/index.ts
init_db();
init_schema();
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient as createClient3 } from "@supabase/supabase-js";
import { eq as eq24 } from "drizzle-orm";

// src/server/routes/auth.ts
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
var router = Router();
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
var supabase = createClient(supabaseUrl, supabaseAnonKey);
var REFRESH_TOKEN_COOKIE_NAME = "sb_refresh_token";
var COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1e3;
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader)
    return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) {
      cookies[name.trim()] = rest.join("=").trim();
    }
  });
  return cookies;
}
function setRefreshTokenCookie(res, refreshToken) {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/api/auth"
  });
}
function clearRefreshTokenCookie(res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth"
  });
}
var registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional()
});
var loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});
var resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
});
var updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters")
});
router.post("/register", (req, res) => {
  res.status(403).json({ error: "Self-registration is disabled. Please contact an administrator." });
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    setRefreshTokenCookie(res, data.session.refresh_token);
    res.json({
      message: "Login successful",
      user: data.user,
      accessToken: data.session.access_token,
      expiresIn: data.session.expires_in
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/logout", async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (refreshToken) {
      try {
        await supabase.auth.refreshSession({ refresh_token: refreshToken });
        await supabase.auth.signOut();
      } catch {
      }
    }
    clearRefreshTokenCookie(res);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    clearRefreshTokenCookie(res);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    res.json({ user: data.user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const { email } = resetPasswordSchema.parse(req.body);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: "Password reset email sent" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/update-password", async (req, res) => {
  try {
    const { password } = updatePasswordSchema.parse(req.body);
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });
    const { error } = await userClient.auth.updateUser({ password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/refresh", async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    let refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      refreshToken = req.body?.refreshToken;
    }
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });
    if (error || !data.session) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: error?.message || "Session error" });
    }
    setRefreshTokenCookie(res, data.session.refresh_token);
    res.json({
      user: data.user,
      accessToken: data.session.access_token,
      expiresIn: data.session.expires_in
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    res.status(500).json({ error: "Internal server error" });
  }
});
var auth_default = router;

// src/server/routes/users.ts
init_db();
init_schema();
import { Router as Router2 } from "express";
import { z as z2 } from "zod";
import { createClient as createClient2 } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
var router2 = Router2();
var supabaseAdmin = createClient2(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
function mapAdminUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    organizations: (user.organizations || []).map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      slug: membership.organization.slug,
      role: membership.role
    }))
  };
}
async function getAdminUserRecord(userId) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      passwordHash: false,
      twoFactorSecret: false
    },
    with: {
      organizations: {
        columns: {
          role: true
        },
        with: {
          organization: {
            columns: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });
  return user ? mapAdminUser(user) : null;
}
router2.get("/profile", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        passwordHash: false,
        twoFactorSecret: false
      }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.patch("/profile", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const updateSchema = z2.object({
      firstName: z2.string().optional(),
      lastName: z2.string().optional(),
      avatarUrl: z2.string().url().optional()
    });
    const updates = updateSchema.parse(req.body);
    const [updatedUser] = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId)).returning();
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/organizations", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const memberships = await db.query.organizationUsers.findMany({
      where: eq(organizationUsers.userId, userId),
      with: {
        organization: true
      }
    });
    const organizationsList = memberships.map((m) => ({
      ...m.organization,
      role: m.role
    }));
    res.json({ organizations: organizationsList });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/", async (req, res) => {
  try {
    const requestingUserId = req.headers["x-user-id"];
    if (!requestingUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const requestingUser = await db.query.users.findFirst({
      where: eq(users.id, requestingUserId)
    });
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    const createUserSchema = z2.object({
      email: z2.string().email("Invalid email address"),
      password: z2.string().min(8, "Password must be at least 8 characters").optional(),
      firstName: z2.string().optional(),
      lastName: z2.string().optional(),
      isAdmin: z2.boolean().default(false),
      sendInvite: z2.boolean().default(true),
      // If true, send password reset email instead of setting password
      organizationId: z2.string().uuid().optional(),
      organizationRole: z2.enum(["admin", "member", "viewer"]).default("member")
    }).superRefine((value, ctx) => {
      if (!value.sendInvite && !value.password) {
        ctx.addIssue({
          code: z2.ZodIssueCode.custom,
          path: ["password"],
          message: "Password is required when invite sending is disabled"
        });
      }
    });
    const userData = createUserSchema.parse(req.body);
    if (userData.organizationId) {
      const targetOrganization = await db.query.organizations.findFirst({
        where: eq(organizations.id, userData.organizationId),
        columns: {
          id: true
        }
      });
      if (!targetOrganization) {
        return res.status(404).json({ error: "Organization not found" });
      }
    }
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, userData.email)
    });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.sendInvite ? void 0 : userData.password,
      email_confirm: true,
      user_metadata: {
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    });
    if (authError) {
      console.error("Supabase auth error:", authError);
      return res.status(400).json({ error: authError.message });
    }
    if (!authData.user) {
      return res.status(500).json({ error: "Failed to create user" });
    }
    const [newUser] = await db.insert(users).values({
      id: authData.user.id,
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      isAdmin: userData.isAdmin,
      emailVerified: true
    }).returning();
    if (userData.organizationId) {
      await db.insert(organizationUsers).values({
        organizationId: userData.organizationId,
        userId: newUser.id,
        role: userData.organizationRole
      });
    }
    if (userData.sendInvite) {
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: userData.email,
        options: {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`
        }
      });
    }
    const createdUser = await getAdminUserRecord(newUser.id);
    res.status(201).json({
      message: userData.sendInvite ? "User created successfully. Invitation email sent." : "User created successfully",
      user: createdUser
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/", async (req, res) => {
  try {
    const requestingUserId = req.headers["x-user-id"];
    if (!requestingUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const requestingUser = await db.query.users.findFirst({
      where: eq(users.id, requestingUserId)
    });
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const allUsers = await db.query.users.findMany({
      columns: {
        passwordHash: false,
        twoFactorSecret: false
      },
      with: {
        organizations: {
          columns: {
            role: true
          },
          with: {
            organization: {
              columns: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy: (usersTable, { desc: desc8 }) => [desc8(usersTable.createdAt)]
    });
    res.json({ users: allUsers.map(mapAdminUser) });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.patch("/:id", async (req, res) => {
  try {
    const requestingUserId = req.headers["x-user-id"];
    const targetUserId = req.params.id;
    if (!requestingUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const requestingUser = await db.query.users.findFirst({
      where: eq(users.id, requestingUserId)
    });
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const updateUserSchema = z2.object({
      firstName: z2.string().optional(),
      lastName: z2.string().optional(),
      isAdmin: z2.boolean().optional(),
      emailVerified: z2.boolean().optional()
    });
    const updates = updateUserSchema.parse(req.body);
    const [updatedUser] = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, targetUserId)).returning();
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const fullUser = await getAdminUserRecord(updatedUser.id);
    res.json({ user: fullUser });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/:id/resend-invite", async (req, res) => {
  try {
    const requestingUserId = req.headers["x-user-id"];
    const targetUserId = req.params.id;
    if (!requestingUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const requestingUser = await db.query.users.findFirst({
      where: eq(users.id, requestingUserId)
    });
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const targetUser = await db.query.users.findFirst({
      where: eq(users.id, targetUserId)
    });
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: targetUser.email,
      options: {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      }
    });
    if (error) {
      console.error("Error sending invite:", error);
      return res.status(400).json({ error: error.message });
    }
    res.json({ message: "Invitation email sent successfully" });
  } catch (error) {
    console.error("Error resending invite:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.delete("/:id", async (req, res) => {
  try {
    const requestingUserId = req.headers["x-user-id"];
    const targetUserId = req.params.id;
    if (!requestingUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const requestingUser = await db.query.users.findFirst({
      where: eq(users.id, requestingUserId)
    });
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (requestingUserId === targetUserId) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (authError) {
      console.error("Error deleting user from auth:", authError);
    }
    await db.delete(users).where(eq(users.id, targetUserId));
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var users_default = router2;

// src/server/routes/organizations.ts
init_db();
init_schema();
import { Router as Router3 } from "express";
import { z as z3 } from "zod";
import { eq as eq4, and as and2 } from "drizzle-orm";

// src/server/lib/cascade.ts
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";
async function deleteServerCascade(serverId) {
  await db.delete(deliveries).where(eq2(deliveries.serverId, serverId));
  await db.delete(messages).where(eq2(messages.serverId, serverId));
  const serverWebhooks = await db.query.webhooks.findMany({
    where: eq2(webhooks.serverId, serverId),
    columns: { id: true }
  });
  for (const wh of serverWebhooks) {
    await db.delete(webhookRequests).where(eq2(webhookRequests.webhookId, wh.id));
  }
  await db.delete(webhooks).where(eq2(webhooks.serverId, serverId));
  await db.delete(credentials).where(eq2(credentials.serverId, serverId));
  await db.delete(routes).where(eq2(routes.serverId, serverId));
  await db.delete(smtpEndpoints).where(eq2(smtpEndpoints.serverId, serverId));
  await db.delete(httpEndpoints).where(eq2(httpEndpoints.serverId, serverId));
  await db.delete(addressEndpoints).where(eq2(addressEndpoints.serverId, serverId));
  await db.delete(domains).where(eq2(domains.serverId, serverId));
  await db.delete(templates).where(eq2(templates.serverId, serverId));
  await db.delete(trackDomains).where(eq2(trackDomains.serverId, serverId));
  await db.delete(suppressions).where(eq2(suppressions.serverId, serverId));
  await db.delete(statistics).where(eq2(statistics.serverId, serverId));
  await db.delete(servers).where(eq2(servers.id, serverId));
}
async function deleteOrganizationCascade(organizationId) {
  const orgServers = await db.query.servers.findMany({
    where: eq2(servers.organizationId, organizationId),
    columns: { id: true }
  });
  for (const s of orgServers) {
    await deleteServerCascade(s.id);
  }
  await db.delete(organizationUsers).where(eq2(organizationUsers.organizationId, organizationId));
  await db.delete(organizations).where(eq2(organizations.id, organizationId));
}

// src/server/lib/admin.ts
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";
async function isPlatformAdmin(userId) {
  const user = await db.query.users.findFirst({ where: eq3(users.id, userId) });
  return user?.isAdmin === true;
}

// src/server/routes/organizations.ts
var router3 = Router3();
var createOrganizationSchema = z3.object({
  name: z3.string().min(1, "Name is required").max(100),
  slug: z3.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  timezone: z3.string().optional()
});
var updateOrganizationSchema = z3.object({
  name: z3.string().min(1).max(100).optional(),
  timezone: z3.string().optional()
});
var addMemberSchema = z3.object({
  email: z3.string().email("Invalid email address"),
  role: z3.enum(["admin", "member", "viewer"]).default("member")
});
router3.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (await isPlatformAdmin(userId)) {
      const allOrgs = await db.query.organizations.findMany({
        with: { servers: true }
      });
      return res.json({ organizations: allOrgs });
    }
    const memberships = await db.query.organizationUsers.findMany({
      where: eq4(organizationUsers.userId, userId),
      with: {
        organization: {
          with: { servers: true }
        }
      }
    });
    const organizationsList = memberships.map((m) => ({
      ...m.organization,
      role: m.role
    }));
    res.json({ organizations: organizationsList });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      const membership2 = await db.query.organizationUsers.findFirst({
        where: and2(
          eq4(organizationUsers.organizationId, organizationId),
          eq4(organizationUsers.userId, userId)
        )
      });
      if (!membership2) {
        return res.status(404).json({ error: "Organization not found" });
      }
    }
    const organization = await db.query.organizations.findFirst({
      where: eq4(organizations.id, organizationId),
      with: {
        owner: true,
        members: {
          with: {
            user: {
              columns: {
                passwordHash: false,
                twoFactorSecret: false
              }
            }
          }
        },
        servers: true
      }
    });
    const membership = isAdmin ? null : await db.query.organizationUsers.findFirst({
      where: and2(
        eq4(organizationUsers.organizationId, organizationId),
        eq4(organizationUsers.userId, userId)
      )
    });
    res.json({ organization, role: isAdmin ? "admin" : membership?.role });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { name, slug, timezone } = createOrganizationSchema.parse(req.body);
    const existingOrg = await db.query.organizations.findFirst({
      where: eq4(organizations.slug, slug)
    });
    if (existingOrg) {
      return res.status(400).json({ error: "Organization slug already exists" });
    }
    const isAdmin = await isPlatformAdmin(userId);
    const [organization] = await db.insert(organizations).values({
      name,
      slug,
      timezone: timezone || "UTC",
      owner_id: userId
    }).returning();
    if (!isAdmin) {
      await db.insert(organizationUsers).values({
        organizationId: organization.id,
        userId,
        role: "admin"
      });
    }
    const [defaultServer] = await db.insert(servers).values({
      name,
      slug,
      organizationId: organization.id,
      mode: "live",
      sendMode: "smtp"
    }).returning();
    res.status(201).json({ organization, defaultServer });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating organization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.patch("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!await isPlatformAdmin(userId)) {
      const membership = await db.query.organizationUsers.findFirst({
        where: and2(
          eq4(organizationUsers.organizationId, organizationId),
          eq4(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const updates = updateOrganizationSchema.parse(req.body);
    const [updatedOrg] = await db.update(organizations).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(organizations.id, organizationId)).returning();
    res.json({ organization: updatedOrg });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating organization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const organization = await db.query.organizations.findFirst({
      where: eq4(organizations.id, organizationId)
    });
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin && organization.owner_id !== userId) {
      return res.status(403).json({ error: "Only the owner can delete the organization" });
    }
    await deleteOrganizationCascade(organizationId);
    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.post("/:id/members", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!await isPlatformAdmin(userId)) {
      const membership = await db.query.organizationUsers.findFirst({
        where: and2(
          eq4(organizationUsers.organizationId, organizationId),
          eq4(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const { email, role } = addMemberSchema.parse(req.body);
    const userToAdd = await db.query.users.findFirst({
      where: eq4(users.email, email)
    });
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingMembership = await db.query.organizationUsers.findFirst({
      where: and2(
        eq4(organizationUsers.organizationId, organizationId),
        eq4(organizationUsers.userId, userToAdd.id)
      )
    });
    if (existingMembership) {
      return res.status(400).json({ error: "User is already a member" });
    }
    const [newMembership] = await db.insert(organizationUsers).values({
      organizationId,
      userId: userToAdd.id,
      role
    }).returning();
    res.status(201).json({ membership: newMembership });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error adding member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.delete("/:id/members/:userId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.params.id;
    const targetUserId = req.params.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!await isPlatformAdmin(userId)) {
      const membership = await db.query.organizationUsers.findFirst({
        where: and2(
          eq4(organizationUsers.organizationId, organizationId),
          eq4(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const organization = await db.query.organizations.findFirst({
      where: eq4(organizations.id, organizationId)
    });
    if (organization?.owner_id === targetUserId) {
      return res.status(400).json({ error: "Cannot remove the owner" });
    }
    await db.delete(organizationUsers).where(
      and2(
        eq4(organizationUsers.organizationId, organizationId),
        eq4(organizationUsers.userId, targetUserId)
      )
    );
    res.json({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router3.patch("/:id/members/:userId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.params.id;
    const targetUserId = req.params.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { role } = z3.object({
      role: z3.enum(["admin", "member", "viewer"])
    }).parse(req.body);
    if (!await isPlatformAdmin(userId)) {
      const membership = await db.query.organizationUsers.findFirst({
        where: and2(
          eq4(organizationUsers.organizationId, organizationId),
          eq4(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const organization = await db.query.organizations.findFirst({
      where: eq4(organizations.id, organizationId)
    });
    if (organization?.owner_id === targetUserId) {
      return res.status(400).json({ error: "Cannot change the owner's role" });
    }
    const [updatedMembership] = await db.update(organizationUsers).set({ role }).where(
      and2(
        eq4(organizationUsers.organizationId, organizationId),
        eq4(organizationUsers.userId, targetUserId)
      )
    ).returning();
    res.json({ membership: updatedMembership });
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating member role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var organizations_default = router3;

// src/server/routes/servers.ts
init_db();
init_schema();
import { Router as Router4 } from "express";
import { z as z4 } from "zod";
import { eq as eq5, and as and3, desc, gte, sql, isNotNull } from "drizzle-orm";
var router4 = Router4();
var createServerSchema = z4.object({
  name: z4.string().min(1, "Name is required").max(100),
  slug: z4.string().min(1).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  organizationId: z4.string().uuid(),
  mode: z4.enum(["live", "development"]).default("live"),
  sendMode: z4.enum(["smtp", "api", "outlook"]).default("smtp"),
  description: z4.string().optional(),
  defaultFromAddress: z4.string().email().optional(),
  defaultFromName: z4.string().optional()
});
var updateServerSchema = z4.object({
  name: z4.string().min(1).max(100).optional(),
  mode: z4.enum(["live", "development"]).optional(),
  sendMode: z4.enum(["smtp", "api", "outlook"]).optional(),
  description: z4.string().optional(),
  defaultFromAddress: z4.string().email().optional(),
  defaultFromName: z4.string().optional(),
  sendLimit: z4.number().int().min(0).optional(),
  trackOpens: z4.boolean().optional(),
  trackClicks: z4.boolean().optional(),
  retentionDays: z4.number().int().min(1).max(365).optional(),
  suspended: z4.boolean().optional(),
  suspendedReason: z4.string().optional()
});
async function checkServerAccess(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq5(servers.id, serverId)
  });
  if (!server)
    return { server: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and3(
      eq5(organizationUsers.organizationId, server.organizationId),
      eq5(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
router4.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID required" });
    }
    if (!await isPlatformAdmin(userId)) {
      const membership = await db.query.organizationUsers.findFirst({
        where: and3(
          eq5(organizationUsers.organizationId, organizationId),
          eq5(organizationUsers.userId, userId)
        )
      });
      if (!membership) {
        return res.status(403).json({ error: "Access denied" });
      }
    }
    const serversList = await db.query.servers.findMany({
      where: eq5(servers.organizationId, organizationId),
      orderBy: [desc(servers.createdAt)]
    });
    res.json({ servers: serversList });
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { server, membership } = await checkServerAccess(userId, serverId);
    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ server, role: membership.role });
  } catch (error) {
    console.error("Error fetching server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createServerSchema.parse(req.body);
    const membership = await db.query.organizationUsers.findFirst({
      where: and3(
        eq5(organizationUsers.organizationId, data.organizationId),
        eq5(organizationUsers.userId, userId)
      )
    });
    if (!membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create servers" });
    }
    const [server] = await db.insert(servers).values({
      ...data,
      organizationId: data.organizationId
    }).returning();
    res.status(201).json({ server });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.patch("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const updates = updateServerSchema.parse(req.body);
    const { server, membership } = await checkServerAccess(userId, serverId);
    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }
    if (!membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update servers" });
    }
    const [updatedServer] = await db.update(servers).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(servers.id, serverId)).returning();
    res.json({ server: updatedServer });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { server, membership } = await checkServerAccess(userId, serverId);
    if (!server) {
      return res.status(404).json({ error: "Server not found" });
    }
    if (!membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete servers" });
    }
    await deleteServerCascade(serverId);
    res.json({ message: "Server deleted successfully" });
  } catch (error) {
    console.error("Error deleting server:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.get("/:id/statistics", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.params.id;
    const days = parseInt(req.query.days) || 30;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { server, membership } = await checkServerAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(404).json({ error: "Server not found" });
    }
    const since = /* @__PURE__ */ new Date();
    since.setDate(since.getDate() - days);
    const statusCounts = await db.select({
      status: messages.status,
      count: sql`count(*)`
    }).from(messages).where(eq5(messages.serverId, serverId)).groupBy(messages.status);
    const countMap = {};
    for (const row of statusCounts) {
      countMap[row.status] = Number(row.count);
    }
    const sent = (countMap["sent"] || 0) + (countMap["delivered"] || 0);
    const delivered = countMap["delivered"] || 0;
    const bounced = countMap["bounced"] || 0;
    const held = countMap["held"] || 0;
    const pending = (countMap["pending"] || 0) + (countMap["queued"] || 0);
    const [openedRow] = await db.select({ count: sql`count(*)` }).from(messages).where(and3(eq5(messages.serverId, serverId), isNotNull(messages.openedAt)));
    const opened = Number(openedRow?.count || 0);
    const [clickRow] = await db.select({ total: sql`coalesce(sum(links_clicked), 0)` }).from(statistics).where(eq5(statistics.serverId, serverId));
    const clicked = Number(clickRow?.total || 0);
    const total = sent + (countMap["failed"] || 0) + pending + held + bounced;
    const daily = await db.select({
      date: statistics.date,
      sent: statistics.messagesSent,
      delivered: statistics.messagesDelivered,
      opened: statistics.messagesOpened,
      clicked: statistics.linksClicked,
      bounced: statistics.messagesBounced,
      held: statistics.messagesHeld
    }).from(statistics).where(and3(eq5(statistics.serverId, serverId), gte(statistics.date, since))).orderBy(statistics.date);
    const recentMessages = await db.query.messages.findMany({
      where: eq5(messages.serverId, serverId),
      orderBy: [desc(messages.createdAt)],
      limit: 20,
      columns: {
        id: true,
        subject: true,
        fromAddress: true,
        toAddresses: true,
        status: true,
        direction: true,
        openedAt: true,
        sentAt: true,
        deliveredAt: true,
        createdAt: true
      }
    });
    res.json({
      summary: { total, sent, delivered, bounced, held, pending, opened, clicked },
      rates: {
        deliveryRate: sent > 0 ? Math.round(delivered / sent * 1e3) / 10 : 0,
        openRate: sent > 0 ? Math.round(opened / sent * 1e3) / 10 : 0,
        clickRate: sent > 0 ? Math.round(clicked / sent * 1e3) / 10 : 0,
        bounceRate: sent > 0 ? Math.round(bounced / sent * 1e3) / 10 : 0
      },
      daily,
      recentMessages
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.get("/:id/queue", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { server, membership } = await checkServerAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(404).json({ error: "Server not found" });
    }
    const heldMessages = await db.query.messages.findMany({
      where: and3(
        eq5(messages.serverId, serverId),
        eq5(messages.held, true)
      ),
      orderBy: [desc(messages.createdAt)],
      limit: 100
    });
    res.json({ messages: heldMessages });
  } catch (error) {
    console.error("Error fetching queue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var servers_default = router4;

// src/server/routes/domains.ts
init_db();
init_schema();
import { Router as Router5 } from "express";
import { z as z5 } from "zod";
import { promises as dnsPromises } from "node:dns";
import { eq as eq6, and as and4 } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
var resolver = new dnsPromises.Resolver();
resolver.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(","));
async function resolveTxt(hostname) {
  try {
    const records = await resolver.resolveTxt(hostname);
    return records.map((chunks) => chunks.join(""));
  } catch {
    return [];
  }
}
var router5 = Router5();
var createDomainSchema = z5.object({
  serverId: z5.string().uuid(),
  name: z5.string().min(1).max(255),
  verificationMethod: z5.enum(["dns", "email"]).default("dns")
});
async function checkDomainAccess(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq6(servers.id, serverId)
  });
  if (!server)
    return { server: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and4(
      eq6(organizationUsers.organizationId, server.organizationId),
      eq6(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
router5.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.query.serverId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    const { server, membership } = await checkDomainAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const domainsList = await db.query.domains.findMany({
      where: eq6(domains.serverId, serverId)
    });
    res.json({ domains: domainsList });
  } catch (error) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const domainId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const domain = await db.query.domains.findFirst({
      where: eq6(domains.id, domainId)
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }
    const { server, membership } = await checkDomainAccess(userId, domain.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ domain });
  } catch (error) {
    console.error("Error fetching domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createDomainSchema.parse(req.body);
    const { server, membership } = await checkDomainAccess(userId, data.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can add domains" });
    }
    const existingDomain = await db.query.domains.findFirst({
      where: and4(
        eq6(domains.serverId, data.serverId),
        eq6(domains.name, data.name)
      )
    });
    if (existingDomain) {
      return res.status(400).json({ error: "Domain already exists" });
    }
    const [domain] = await db.insert(domains).values({
      serverId: data.serverId,
      name: data.name,
      verificationMethod: data.verificationMethod,
      verificationToken: uuidv4()
    }).returning();
    res.status(201).json({ domain });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.post("/:id/verify", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const domainId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const domain = await db.query.domains.findFirst({
      where: eq6(domains.id, domainId)
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }
    const { server, membership } = await checkDomainAccess(userId, domain.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can verify domains" });
    }
    const domainName = domain.name;
    const expectedToken = `skaleclub-verification:${domain.verificationToken}`;
    const dkimSelector = domain.dkimSelector || "postal";
    const [rootTxt, dkimTxt, dmarcTxt] = await Promise.all([
      resolveTxt(domainName),
      resolveTxt(`${dkimSelector}._domainkey.${domainName}`),
      resolveTxt(`_dmarc.${domainName}`)
    ]);
    const verificationFound = rootTxt.some((r) => r === expectedToken);
    const verificationStatus = verificationFound ? "verified" : "failed";
    const spfFound = rootTxt.some((r) => r.startsWith("v=spf1") && r.includes("spf.skaleclub.com"));
    const spfStatus = spfFound ? "verified" : "failed";
    const spfError = spfFound ? null : "SPF record not found or does not include spf.skaleclub.com";
    const dkimFound = dkimTxt.length > 0 && dkimTxt.some((r) => r.startsWith("v=DKIM1"));
    const dkimStatus = dkimFound ? "verified" : "failed";
    const dkimError = dkimFound ? null : "DKIM record not found";
    const dmarcFound = dmarcTxt.some((r) => r.startsWith("v=DMARC1"));
    const dmarcStatus = dmarcFound ? "verified" : "failed";
    const dmarcError = dmarcFound ? null : "DMARC record not found";
    const allVerified = verificationFound && spfFound && dkimFound && dmarcFound;
    const [updatedDomain] = await db.update(domains).set({
      verificationStatus,
      verifiedAt: allVerified ? /* @__PURE__ */ new Date() : null,
      spfStatus,
      spfError,
      dkimStatus,
      dkimError,
      dmarcStatus,
      dmarcError,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq6(domains.id, domainId)).returning();
    res.json({
      domain: updatedDomain,
      dnsResults: {
        verification: { found: verificationFound },
        spf: { found: spfFound, error: spfError },
        dkim: { found: dkimFound, error: dkimError },
        dmarc: { found: dmarcFound, error: dmarcError }
      }
    });
  } catch (error) {
    console.error("Error verifying domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const domainId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const domain = await db.query.domains.findFirst({
      where: eq6(domains.id, domainId)
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }
    const { server, membership } = await checkDomainAccess(userId, domain.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete domains" });
    }
    await db.delete(domains).where(eq6(domains.id, domainId));
    res.json({ message: "Domain deleted successfully" });
  } catch (error) {
    console.error("Error deleting domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var domains_default = router5;

// src/server/routes/messages.ts
init_db();
init_schema();
import { Router as Router6 } from "express";
import { z as z6 } from "zod";
import { eq as eq9, and as and7, desc as desc2, like, sql as sql3 } from "drizzle-orm";
import { v4 as uuidv42 } from "uuid";

// src/server/lib/tracking.ts
init_db();
init_schema();
import { createHmac } from "crypto";
import { eq as eq7, and as and5, sql as sql2 } from "drizzle-orm";
function injectTracking(html, token, baseUrl, trackOpens, trackClicks) {
  let result = html;
  if (trackClicks) {
    result = result.replace(
      /href="(https?:\/\/[^"#][^"]*?)"/gi,
      (_, url) => {
        const encoded = Buffer.from(url).toString("base64url");
        return `href="${baseUrl}/t/click/${token}?u=${encoded}"`;
      }
    );
  }
  if (trackOpens) {
    const pixel = `<img src="${baseUrl}/t/open/${token}" width="1" height="1" alt="" style="display:none!important;width:1px!important;height:1px!important" />`;
    if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, `${pixel}</body>`);
    } else {
      result += pixel;
    }
  }
  return result;
}
var STAT_COLUMNS = {
  messagesOpened: "messages_opened",
  linksClicked: "links_clicked",
  messagesSent: "messages_sent",
  messagesDelivered: "messages_delivered",
  messagesBounced: "messages_bounced",
  messagesHeld: "messages_held",
  messagesIncoming: "messages_incoming"
};
async function incrementStat(serverId, field) {
  const col = STAT_COLUMNS[field];
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  try {
    await db.execute(sql2`
            INSERT INTO statistics (id, server_id, date, ${sql2.raw(col)})
            VALUES (gen_random_uuid(), ${serverId}, ${today}, 1)
            ON CONFLICT (server_id, date)
            DO UPDATE SET ${sql2.raw(col)} = statistics.${sql2.raw(col)} + 1
        `);
  } catch (err) {
    console.error("incrementStat error:", err);
  }
}
async function fireWebhooks(serverId, event, data) {
  try {
    const allWebhooks = await db.query.webhooks.findMany({
      where: and5(
        eq7(webhooks.serverId, serverId),
        eq7(webhooks.active, true)
      )
    });
    const matching = allWebhooks.filter(
      (wh) => wh.events.includes(event)
    );
    if (matching.length === 0)
      return;
    const payload = {
      event,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      serverId,
      data
    };
    await Promise.allSettled(
      matching.map(async (wh) => {
        const headers = {
          "Content-Type": "application/json",
          "X-Webhook-Event": event
        };
        if (wh.secret) {
          const sig = createHmac("sha256", wh.secret).update(JSON.stringify(payload)).digest("hex");
          headers["X-Webhook-Signature"] = `sha256=${sig}`;
        }
        try {
          const response = await fetch(wh.url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(1e4)
          });
          const body = await response.text();
          await db.insert(webhookRequests).values({
            webhookId: wh.id,
            event,
            payload,
            responseCode: response.status,
            responseBody: body.substring(0, 5e3),
            success: response.ok
          });
        } catch (err) {
          await db.insert(webhookRequests).values({
            webhookId: wh.id,
            event,
            payload,
            success: false,
            error: err instanceof Error ? err.message : "Request failed"
          });
        }
      })
    );
  } catch (err) {
    console.error("fireWebhooks error:", err);
  }
}

// src/server/lib/outlook.ts
init_db();
init_schema();
import crypto2 from "crypto";
import { and as and6, asc, eq as eq8 } from "drizzle-orm";

// src/server/lib/crypto.ts
import crypto from "crypto";
var ALGORITHM = "aes-256-gcm";
var IV_LENGTH = 12;
function getEncryptionKey() {
  const secret = process.env.OUTLOOK_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing OUTLOOK_TOKEN_ENCRYPTION_KEY (or JWT_SECRET fallback)");
  }
  return crypto.createHash("sha256").update(secret).digest();
}
function encryptSecret(value) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url")
  ].join(".");
}
function decryptSecret(payload) {
  const [ivPart, tagPart, encryptedPart] = payload.split(".");
  if (!ivPart || !tagPart || !encryptedPart) {
    throw new Error("Invalid encrypted payload");
  }
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivPart, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, "base64url")),
    decipher.final()
  ]);
  return decrypted.toString("utf8");
}

// src/server/lib/outlook.ts
var GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
var OAUTH_BASE_URL = "https://login.microsoftonline.com/common/oauth2/v2.0";
var STATE_TTL_MS = 10 * 60 * 1e3;
var REFRESH_SKEW_MS = 2 * 60 * 1e3;
var OUTLOOK_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "User.Read",
  "Mail.Read",
  "Mail.ReadWrite",
  "Mail.Send"
];
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
function getStateSecret() {
  return process.env.OUTLOOK_TOKEN_ENCRYPTION_KEY || getRequiredEnv("JWT_SECRET");
}
function signState(payload) {
  return crypto2.createHmac("sha256", getStateSecret()).update(payload).digest("base64url");
}
function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
function mapRecipients(addresses = []) {
  return addresses.map((address) => ({
    emailAddress: { address }
  }));
}
async function fetchToken(params) {
  const body = new URLSearchParams({
    client_id: getRequiredEnv("MICROSOFT_CLIENT_ID"),
    client_secret: getRequiredEnv("MICROSOFT_CLIENT_SECRET"),
    ...params
  });
  const response = await fetch(`${OAUTH_BASE_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body,
    signal: AbortSignal.timeout(15e3)
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Failed to obtain Outlook token");
  }
  return data;
}
async function fetchOutlookProfile(accessToken) {
  const response = await fetch(`${GRAPH_BASE_URL}/me?$select=id,displayName,mail,userPrincipalName`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    signal: AbortSignal.timeout(15e3)
  });
  const data = await response.json();
  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || "Failed to read Outlook profile");
  }
  return data;
}
function sanitizeOutlookMailbox(mailbox) {
  return {
    id: mailbox.id,
    serverId: mailbox.serverId,
    email: mailbox.email,
    displayName: mailbox.displayName,
    microsoftUserId: mailbox.microsoftUserId,
    tenantId: mailbox.tenantId,
    scopes: mailbox.scopes || [],
    status: mailbox.status,
    tokenExpiresAt: mailbox.tokenExpiresAt,
    lastSyncedAt: mailbox.lastSyncedAt,
    lastSendAt: mailbox.lastSendAt,
    createdAt: mailbox.createdAt,
    updatedAt: mailbox.updatedAt
  };
}
function createOutlookOauthState(userId, serverId) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    serverId,
    nonce: crypto2.randomUUID(),
    exp: Date.now() + STATE_TTL_MS
  })).toString("base64url");
  return `${payload}.${signState(payload)}`;
}
function parseOutlookOauthState(state) {
  const [payload, signature] = state.split(".");
  if (!payload || !signature || signState(payload) !== signature) {
    throw new Error("Invalid Outlook OAuth state");
  }
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  if (parsed.exp < Date.now()) {
    throw new Error("Expired Outlook OAuth state");
  }
  return parsed;
}
function buildOutlookOauthUrl(state, loginHint) {
  const redirectUri = getRequiredEnv("MICROSOFT_REDIRECT_URI");
  const url = new URL(`${OAUTH_BASE_URL}/authorize`);
  url.searchParams.set("client_id", getRequiredEnv("MICROSOFT_CLIENT_ID"));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", OUTLOOK_SCOPES.join(" "));
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  if (loginHint) {
    url.searchParams.set("login_hint", loginHint);
  }
  return url.toString();
}
async function exchangeCodeForOutlookConnection(code) {
  const token = await fetchToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: getRequiredEnv("MICROSOFT_REDIRECT_URI")
  });
  const profile = await fetchOutlookProfile(token.access_token);
  const jwtPayload = decodeJwtPayload(token.access_token);
  const tenantId = typeof jwtPayload?.tid === "string" ? jwtPayload.tid : null;
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1e3),
    scopes: token.scope?.split(" ").filter(Boolean) || [...OUTLOOK_SCOPES],
    profile,
    tenantId
  };
}
async function resolveOutlookMailboxForServer(serverId, mailboxId) {
  if (mailboxId) {
    return db.query.outlookMailboxes.findFirst({
      where: and6(
        eq8(outlookMailboxes.id, mailboxId),
        eq8(outlookMailboxes.serverId, serverId)
      )
    });
  }
  return db.query.outlookMailboxes.findFirst({
    where: and6(
      eq8(outlookMailboxes.serverId, serverId),
      eq8(outlookMailboxes.status, "active")
    ),
    orderBy: [asc(outlookMailboxes.createdAt)]
  });
}
async function refreshOutlookAccessToken(mailbox) {
  const refreshToken = decryptSecret(mailbox.refreshTokenEncrypted);
  const token = await fetchToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    redirect_uri: getRequiredEnv("MICROSOFT_REDIRECT_URI"),
    scope: (mailbox.scopes || OUTLOOK_SCOPES).join(" ")
  });
  const nextRefreshToken = token.refresh_token || refreshToken;
  const updates = {
    accessTokenEncrypted: encryptSecret(token.access_token),
    refreshTokenEncrypted: encryptSecret(nextRefreshToken),
    tokenExpiresAt: new Date(Date.now() + token.expires_in * 1e3),
    status: "active",
    lastSyncedAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
  const [updated] = await db.update(outlookMailboxes).set(updates).where(eq8(outlookMailboxes.id, mailbox.id)).returning();
  return {
    mailbox: updated,
    accessToken: token.access_token
  };
}
async function getValidOutlookAccessToken(mailbox) {
  const expiresAtMs = mailbox.tokenExpiresAt.getTime();
  if (expiresAtMs - Date.now() > REFRESH_SKEW_MS) {
    return {
      mailbox,
      accessToken: decryptSecret(mailbox.accessTokenEncrypted)
    };
  }
  try {
    return await refreshOutlookAccessToken(mailbox);
  } catch (error) {
    await db.update(outlookMailboxes).set({
      status: "expired",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq8(outlookMailboxes.id, mailbox.id));
    throw error;
  }
}
async function sendMessageWithOutlook(input) {
  const mailbox = await resolveOutlookMailboxForServer(input.serverId, input.mailboxId);
  if (!mailbox) {
    throw new Error("No active Outlook mailbox found for this server");
  }
  if (input.fromAddress.toLowerCase() !== mailbox.email.toLowerCase()) {
    throw new Error(`Outlook mailbox ${mailbox.email} can only send with its own address`);
  }
  const { accessToken, mailbox: activeMailbox } = await getValidOutlookAccessToken(mailbox);
  const bodyContent = input.htmlBody || input.plainBody || "";
  const contentType = input.htmlBody ? "HTML" : "Text";
  const response = await fetch(`${GRAPH_BASE_URL}/me/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: {
        subject: input.subject,
        body: {
          contentType,
          content: bodyContent
        },
        toRecipients: mapRecipients(input.to),
        ccRecipients: mapRecipients(input.cc),
        bccRecipients: mapRecipients(input.bcc),
        attachments: (input.attachments || []).map((attachment) => ({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: attachment.filename,
          contentType: attachment.contentType,
          contentBytes: attachment.content
        }))
      },
      saveToSentItems: true
    }),
    signal: AbortSignal.timeout(2e4)
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || "Outlook sendMail failed");
  }
  await db.update(outlookMailboxes).set({
    lastSendAt: /* @__PURE__ */ new Date(),
    lastSyncedAt: /* @__PURE__ */ new Date(),
    status: "active",
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq8(outlookMailboxes.id, activeMailbox.id));
  return sanitizeOutlookMailbox(activeMailbox);
}

// src/server/routes/messages.ts
var router6 = Router6();
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var sendMessageSchema = z6.object({
  serverId: z6.string().uuid(),
  outlookMailboxId: z6.string().uuid().optional(),
  from: z6.string().email(),
  to: z6.array(z6.string().email()).min(1),
  cc: z6.array(z6.string().email()).optional(),
  bcc: z6.array(z6.string().email()).optional(),
  subject: z6.string().min(1).max(998),
  plainBody: z6.string().max(5e6).optional(),
  htmlBody: z6.string().max(5e6).optional(),
  headers: z6.record(z6.string()).optional(),
  attachments: z6.array(z6.object({
    filename: z6.string(),
    content: z6.string(),
    contentType: z6.string()
  })).optional(),
  templateId: z6.string().uuid().optional(),
  templateVariables: z6.record(z6.string()).optional()
});
var searchMessagesSchema = z6.object({
  query: z6.string().optional(),
  status: z6.enum(["pending", "queued", "sent", "delivered", "bounced", "held", "failed"]).optional(),
  direction: z6.enum(["incoming", "outgoing"]).optional(),
  from: z6.string().optional(),
  to: z6.string().optional(),
  page: z6.coerce.number().int().min(1).default(1),
  limit: z6.coerce.number().int().min(1).max(100).default(50)
});
async function checkMessageAccess(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq9(servers.id, serverId)
  });
  if (!server)
    return { server: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and7(
      eq9(organizationUsers.organizationId, server.organizationId),
      eq9(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
router6.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.query.serverId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    const { server, membership } = await checkMessageAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const { query, status, direction, from, to, page, limit } = searchMessagesSchema.parse(req.query);
    const offset = (page - 1) * limit;
    const conditions = [eq9(messages.serverId, serverId)];
    if (status) {
      conditions.push(eq9(messages.status, status));
    }
    if (direction) {
      conditions.push(eq9(messages.direction, direction));
    }
    if (from) {
      const fromPattern = `%${from}%`;
      conditions.push(like(messages.fromAddress, fromPattern));
    }
    if (to) {
      const toPattern = `%${to}%`;
      conditions.push(sql3`${messages.toAddresses}::text ilike ${toPattern}`);
    }
    if (query) {
      const queryPattern = `%${query}%`;
      conditions.push(
        sql3`(
                    ${messages.subject} ilike ${queryPattern}
                    OR ${messages.fromAddress} ilike ${queryPattern}
                    OR ${messages.toAddresses}::text ilike ${queryPattern}
                )`
      );
    }
    const messagesList = await db.query.messages.findMany({
      where: and7(...conditions),
      orderBy: [desc2(messages.createdAt)],
      limit,
      offset
    });
    const [{ count }] = await db.select({ count: sql3`count(*)` }).from(messages).where(and7(...conditions));
    res.json({
      messages: messagesList,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    });
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq9(messages.id, messageId),
      with: {
        deliveries: true
      }
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { server, membership } = await checkMessageAccess(userId, message.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ message });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = sendMessageSchema.parse(req.body);
    const { server, membership } = await checkMessageAccess(userId, data.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (server.suspended) {
      return res.status(400).json({ error: "Server is suspended" });
    }
    let subject = data.subject;
    let plainBody = data.plainBody;
    let htmlBody = data.htmlBody;
    if (data.templateId) {
      const template = await db.query.templates.findFirst({
        where: eq9(templates.id, data.templateId)
      });
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      if (template.serverId !== data.serverId) {
        return res.status(403).json({ error: "Template does not belong to this server" });
      }
      const variables = data.templateVariables || {};
      const render = (text2, isHtml) => {
        if (!text2)
          return text2;
        return text2.replace(/\{\{(\w+)\}\}/g, (_, key) => {
          const value = variables[key] ?? `{{${key}}}`;
          return isHtml ? escapeHtml(value) : value;
        });
      };
      subject = render(template.subject, false) || subject;
      plainBody = render(template.plainBody, false) || plainBody;
      htmlBody = render(template.htmlBody, true) || htmlBody;
    }
    const outlookMailbox = server.sendMode === "outlook" ? await resolveOutlookMailboxForServer(data.serverId, data.outlookMailboxId) : null;
    if (server.sendMode === "outlook") {
      if (!outlookMailbox) {
        return res.status(400).json({ error: "No active Outlook mailbox configured for this server" });
      }
      if (data.from.toLowerCase() !== outlookMailbox.email.toLowerCase()) {
        return res.status(400).json({
          error: `Outlook send mode requires the from address to match the connected mailbox (${outlookMailbox.email})`
        });
      }
    }
    if (!plainBody && !htmlBody) {
      return res.status(400).json({ error: "Message body is required" });
    }
    const messageToken = uuidv42();
    if (htmlBody && !server.privacyMode && (server.trackOpens || server.trackClicks)) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 9001}`;
      htmlBody = injectTracking(htmlBody, messageToken, baseUrl, server.trackOpens, server.trackClicks);
    }
    const [message] = await db.insert(messages).values({
      serverId: data.serverId,
      messageId: `<${uuidv42()}@${server.defaultFromAddress?.split("@")[1] || "mail.local"}>`,
      token: messageToken,
      direction: "outgoing",
      fromAddress: data.from,
      toAddresses: data.to,
      ccAddresses: data.cc || [],
      bccAddresses: data.bcc || [],
      subject,
      plainBody,
      htmlBody,
      headers: data.headers || {},
      attachments: data.attachments || [],
      status: "queued"
    }).returning();
    const allRecipients = [...data.to, ...data.cc || [], ...data.bcc || []];
    for (const recipient of allRecipients) {
      await db.insert(deliveries).values({
        messageId: message.id,
        serverId: data.serverId,
        rcptTo: recipient,
        status: "pending"
      });
    }
    if (server.sendMode === "outlook" && outlookMailbox) {
      try {
        await sendMessageWithOutlook({
          serverId: data.serverId,
          mailboxId: outlookMailbox.id,
          fromAddress: data.from,
          to: data.to,
          cc: data.cc,
          bcc: data.bcc,
          subject,
          plainBody,
          htmlBody,
          attachments: data.attachments
        });
        const sentAt = /* @__PURE__ */ new Date();
        await db.update(messages).set({
          status: "sent",
          sentAt,
          updatedAt: sentAt
        }).where(eq9(messages.id, message.id));
        await db.update(deliveries).set({
          status: "sent",
          sentAt
        }).where(eq9(deliveries.messageId, message.id));
        message.status = "sent";
        message.sentAt = sentAt;
      } catch (error) {
        const details = error instanceof Error ? error.message : "Outlook send failed";
        const failedAt = /* @__PURE__ */ new Date();
        await db.update(messages).set({
          status: "failed",
          updatedAt: failedAt
        }).where(eq9(messages.id, message.id));
        await db.update(deliveries).set({
          status: "failed",
          details
        }).where(eq9(deliveries.messageId, message.id));
        return res.status(502).json({
          error: details,
          message: {
            ...message,
            status: "failed"
          }
        });
      }
    }
    Promise.allSettled([
      incrementStat(data.serverId, "messagesSent"),
      fireWebhooks(data.serverId, "message_sent", {
        messageId: message.id,
        subject: message.subject,
        from: message.fromAddress,
        to: message.toAddresses,
        recipients: allRecipients.length
      })
    ]).catch(() => {
    });
    res.status(201).json({
      message,
      recipients: allRecipients.length
    });
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.post("/:id/release", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq9(messages.id, messageId)
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { server, membership } = await checkMessageAccess(userId, message.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can release held messages" });
    }
    if (!message.held) {
      return res.status(400).json({ error: "Message is not held" });
    }
    const [updatedMessage] = await db.update(messages).set({
      held: false,
      holdExpiry: null,
      heldReason: null,
      status: "queued",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq9(messages.id, messageId)).returning();
    res.json({ message: updatedMessage });
  } catch (error) {
    console.error("Error releasing message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq9(messages.id, messageId)
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { server, membership } = await checkMessageAccess(userId, message.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete messages" });
    }
    await db.delete(deliveries).where(eq9(deliveries.messageId, messageId));
    await db.delete(messages).where(eq9(messages.id, messageId));
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.get("/:id/attachments", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq9(messages.id, messageId),
      columns: {
        id: true,
        serverId: true,
        attachments: true
      }
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { server, membership } = await checkMessageAccess(userId, message.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ attachments: message.attachments || [] });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var messages_default = router6;

// src/server/routes/webhooks.ts
init_db();
init_schema();
import { Router as Router7 } from "express";
import { z as z7 } from "zod";
import { eq as eq10, and as and8, desc as desc3 } from "drizzle-orm";
var router7 = Router7();
var createWebhookSchema = z7.object({
  serverId: z7.string().uuid(),
  name: z7.string().min(1).max(100),
  url: z7.string().url(),
  secret: z7.string().optional(),
  active: z7.boolean().default(true),
  events: z7.array(z7.enum([
    "message_sent",
    "message_delivered",
    "message_bounced",
    "message_held",
    "message_opened",
    "link_clicked",
    "domain_verified",
    "spam_alert"
  ])).min(1)
});
var updateWebhookSchema = z7.object({
  name: z7.string().min(1).max(100).optional(),
  url: z7.string().url().optional(),
  secret: z7.string().optional(),
  active: z7.boolean().optional(),
  events: z7.array(z7.string()).min(1).optional()
});
async function checkWebhookAccess(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq10(servers.id, serverId)
  });
  if (!server)
    return { server: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and8(
      eq10(organizationUsers.organizationId, server.organizationId),
      eq10(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
router7.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.query.serverId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    const { server, membership } = await checkWebhookAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const webhooksList = await db.query.webhooks.findMany({
      where: eq10(webhooks.serverId, serverId),
      orderBy: [desc3(webhooks.createdAt)]
    });
    res.json({ webhooks: webhooksList });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq10(webhooks.id, webhookId),
      with: {
        server: true
      }
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { server, membership } = await checkWebhookAccess(userId, webhook.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ webhook });
  } catch (error) {
    console.error("Error fetching webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createWebhookSchema.parse(req.body);
    const { server, membership } = await checkWebhookAccess(userId, data.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create webhooks" });
    }
    const [webhook] = await db.insert(webhooks).values({
      serverId: data.serverId,
      name: data.name,
      url: data.url,
      secret: data.secret,
      active: data.active,
      events: data.events
    }).returning();
    res.status(201).json({ webhook });
  } catch (error) {
    if (error instanceof z7.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.patch("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const updates = updateWebhookSchema.parse(req.body);
    const webhook = await db.query.webhooks.findFirst({
      where: eq10(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { server, membership } = await checkWebhookAccess(userId, webhook.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update webhooks" });
    }
    const [updatedWebhook] = await db.update(webhooks).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq10(webhooks.id, webhookId)).returning();
    res.json({ webhook: updatedWebhook });
  } catch (error) {
    if (error instanceof z7.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq10(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { server, membership } = await checkWebhookAccess(userId, webhook.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete webhooks" });
    }
    await db.delete(webhookRequests).where(eq10(webhookRequests.webhookId, webhookId));
    await db.delete(webhooks).where(eq10(webhooks.id, webhookId));
    res.json({ message: "Webhook deleted successfully" });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.get("/:id/requests", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq10(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { server, membership } = await checkWebhookAccess(userId, webhook.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const requests = await db.query.webhookRequests.findMany({
      where: eq10(webhookRequests.webhookId, webhookId),
      orderBy: [desc3(webhookRequests.createdAt)],
      limit
    });
    res.json({ requests });
  } catch (error) {
    console.error("Error fetching webhook requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.post("/:id/test", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq10(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { server, membership } = await checkWebhookAccess(userId, webhook.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can test webhooks" });
    }
    const testPayload = {
      event: "test",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      server: {
        id: server.id,
        name: server.name
      },
      data: {
        message: "This is a test webhook from SkaleClub Mail"
      }
    };
    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Secret": webhook.secret || "",
          "X-Webhook-Event": "test"
        },
        body: JSON.stringify(testPayload)
      });
      const responseBody = await response.text();
      await db.insert(webhookRequests).values({
        webhookId: webhook.id,
        event: "test",
        payload: testPayload,
        responseCode: response.status,
        responseBody: responseBody.substring(0, 5e3),
        success: response.ok
      });
      res.json({
        success: response.ok,
        statusCode: response.status,
        response: responseBody.substring(0, 1e3)
      });
    } catch (fetchError) {
      await db.insert(webhookRequests).values({
        webhookId: webhook.id,
        event: "test",
        payload: testPayload,
        success: false,
        error: fetchError instanceof Error ? fetchError.message : "Unknown error"
      });
      res.status(400).json({
        success: false,
        error: fetchError instanceof Error ? fetchError.message : "Failed to send webhook"
      });
    }
  } catch (error) {
    console.error("Error testing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var webhooks_default = router7;

// src/server/routes/credentials.ts
init_db();
init_schema();
import { Router as Router8 } from "express";
import { z as z8 } from "zod";
import { eq as eq11, desc as desc4, and as and9 } from "drizzle-orm";
import { v4 as uuidv43 } from "uuid";
var router8 = Router8();
var createCredentialSchema = z8.object({
  serverId: z8.string().uuid(),
  name: z8.string().min(1).max(100),
  type: z8.enum(["smtp", "api"]),
  key: z8.string().min(1),
  secret: z8.string().optional()
});
var updateCredentialSchema = z8.object({
  name: z8.string().min(1).max(100).optional(),
  secret: z8.string().optional()
});
async function checkCredentialAccess(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq11(servers.id, serverId)
  });
  if (!server)
    return { server: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and9(
      eq11(organizationUsers.organizationId, server.organizationId),
      eq11(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
router8.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.query.serverId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    const { server, membership } = await checkCredentialAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const credentialsList = await db.query.credentials.findMany({
      where: eq11(credentials.serverId, serverId),
      orderBy: [desc4(credentials.createdAt)]
    });
    res.json({ credentials: credentialsList });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router8.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createCredentialSchema.parse(req.body);
    const { server, membership } = await checkCredentialAccess(userId, data.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create credentials" });
    }
    const key = uuidv43();
    const secret = uuidv43();
    let hashedSecret = null;
    if (data.secret) {
      hashedSecret = await hashSecret(data.secret);
    }
    const [credential] = await db.insert(credentials).values({
      serverId: data.serverId,
      name: data.name,
      type: data.type,
      key: data.key || key,
      secretHash: hashedSecret
    }).returning();
    res.status(201).json({ credential });
  } catch (error) {
    if (error instanceof z8.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating credential:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router8.post("/:id/regenerate", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const credentialId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const credential = await db.query.credentials.findFirst({
      where: eq11(credentials.id, credentialId)
    });
    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }
    const { server, membership } = await checkCredentialAccess(userId, credential.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can regenerate credentials" });
    }
    const newKey = uuidv43();
    const newSecret = uuidv43();
    const hashedNewSecret = await hashSecret(newSecret);
    const [updatedCredential] = await db.update(credentials).set({
      key: newKey,
      secretHash: hashedNewSecret,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq11(credentials.id, credentialId)).returning();
    res.json({
      credential: updatedCredential,
      newKey,
      newSecret
    });
  } catch (error) {
    console.error("Error regenerating credential:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router8.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const credentialId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const credential = await db.query.credentials.findFirst({
      where: eq11(credentials.id, credentialId)
    });
    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }
    const { server, membership } = await checkCredentialAccess(userId, credential.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete credentials" });
    }
    await db.delete(credentials).where(eq11(credentials.id, credentialId));
    res.json({ message: "Credential deleted successfully" });
  } catch (error) {
    console.error("Error deleting credential:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
async function hashSecret(secret) {
  const { scrypt, randomBytes: randomBytes2 } = await import("crypto");
  return new Promise((resolve, reject) => {
    const salt = randomBytes2(16).toString("hex");
    scrypt(secret, salt, 64, (err, derived) => {
      if (err)
        return reject(err);
      resolve(`${salt}:${derived.toString("hex")}`);
    });
  });
}
var credentials_default = router8;

// src/server/routes/routes.ts
init_db();
init_schema();
import { Router as Router9 } from "express";
import { z as z9 } from "zod";
import { eq as eq12, and as and10 } from "drizzle-orm";
var router9 = Router9();
var createRouteSchema = z9.object({
  serverId: z9.string().uuid(),
  name: z9.string().min(1).max(100),
  address: z9.string().min(1),
  mode: z9.enum(["endpoint", "hold", "reject"]),
  spamMode: z9.enum(["mark", "reject"]),
  spamThreshold: z9.number().int().min(0).max(100).default(5)
});
var updateRouteSchema = z9.object({
  name: z9.string().min(1).max(100).optional(),
  address: z9.string().optional(),
  mode: z9.enum(["endpoint", "hold", "reject"]).optional(),
  spamMode: z9.enum(["mark", "reject"]).optional(),
  spamThreshold: z9.number().int().min(0).max(100).default(5)
});
async function checkRouteAccess(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq12(servers.id, serverId)
  });
  if (!server)
    return { server: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and10(
      eq12(organizationUsers.organizationId, server.organizationId),
      eq12(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
router9.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.query.serverId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    const { server, membership } = await checkRouteAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const routesList = await db.query.routes.findMany({
      where: eq12(routes.serverId, serverId)
    });
    res.json({ routes: routesList });
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router9.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createRouteSchema.parse(req.body);
    const { server, membership } = await checkRouteAccess(userId, data.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create routes" });
    }
    const [route] = await db.insert(routes).values({
      ...data
    }).returning();
    res.status(201).json({ route });
  } catch (error) {
    if (error instanceof z9.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router9.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const routeId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = updateRouteSchema.parse(req.body);
    const route = await db.query.routes.findFirst({
      where: eq12(routes.id, routeId)
    });
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    const { server, membership } = await checkRouteAccess(userId, route.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update routes" });
    }
    const [updatedRoute] = await db.update(routes).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq12(routes.id, routeId)).returning();
    res.json({ route: updatedRoute });
  } catch (error) {
    if (error instanceof z9.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router9.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const routeId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const route = await db.query.routes.findFirst({
      where: eq12(routes.id, routeId)
    });
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    const { server, membership } = await checkRouteAccess(userId, route.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete routes" });
    }
    await db.delete(routes).where(eq12(routes.id, routeId));
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Error deleting route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var routes_default = router9;

// src/server/routes/system.ts
init_db();
init_schema();
import { Router as Router10 } from "express";
import { eq as eq13, sql as sql4 } from "drizzle-orm";
var router10 = Router10();
router10.get("/usage", async (req, res) => {
  try {
    const requestingUserId = req.headers["x-user-id"];
    if (!requestingUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const requestingUser = await db.query.users.findFirst({
      where: eq13(users.id, requestingUserId)
    });
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const storageResult = await db.execute(sql4`
            SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)::bigint AS total_bytes
            FROM storage.objects
            WHERE metadata->>'size' IS NOT NULL
        `);
    const totalStorageBytes = Number(storageResult[0]?.total_bytes ?? 0);
    const storageLimitBytes = Number(process.env.STORAGE_LIMIT_BYTES) || 10 * 1024 * 1024 * 1024;
    const userUsageResult = await db.execute(sql4`
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
        `);
    res.json({
      storage: {
        used: totalStorageBytes,
        limit: storageLimitBytes
      },
      users: userUsageResult.map((row) => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        messageCount: Number(row.message_count),
        attachmentBytes: Number(row.attachment_bytes)
      }))
    });
  } catch (error) {
    console.error("Error fetching system usage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var system_default = router10;

// src/server/routes/track.ts
init_db();
init_schema();
import { Router as Router11 } from "express";
import { eq as eq14 } from "drizzle-orm";
var router11 = Router11();
var PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);
var BLOCKED_HOSTS = /* @__PURE__ */ new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254"
]);
function isPrivateHost(hostname) {
  if (BLOCKED_HOSTS.has(hostname))
    return true;
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN))
    return false;
  if (parts[0] === 10)
    return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    return true;
  if (parts[0] === 192 && parts[1] === 168)
    return true;
  return false;
}
router11.get("/open/:token", async (req, res) => {
  res.set({
    "Content-Type": "image/gif",
    "Content-Length": String(PIXEL.length),
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  res.end(PIXEL);
  const { token } = req.params;
  try {
    const message = await db.query.messages.findFirst({
      where: eq14(messages.token, token)
    });
    if (!message || message.openedAt)
      return;
    const server = await db.query.servers.findFirst({
      where: eq14(servers.id, message.serverId)
    });
    if (!server || !server.trackOpens || server.privacyMode)
      return;
    const now = /* @__PURE__ */ new Date();
    await db.update(messages).set({ openedAt: now, updatedAt: now }).where(eq14(messages.token, token));
    await Promise.allSettled([
      incrementStat(message.serverId, "messagesOpened"),
      fireWebhooks(message.serverId, "message_opened", {
        messageId: message.id,
        subject: message.subject,
        from: message.fromAddress,
        openedAt: now.toISOString()
      })
    ]);
  } catch (err) {
    console.error("Open tracking error:", err);
  }
});
router11.get("/click/:token", async (req, res) => {
  const { token } = req.params;
  const encodedUrl = req.query.u;
  if (!encodedUrl) {
    return res.status(400).send("Missing parameter");
  }
  let targetUrl;
  try {
    targetUrl = Buffer.from(encodedUrl, "base64url").toString("utf8");
    const parsed = new URL(targetUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).send("Invalid URL");
    }
    if (isPrivateHost(parsed.hostname)) {
      return res.status(400).send("Invalid URL");
    }
  } catch {
    return res.status(400).send("Invalid URL");
  }
  res.redirect(302, targetUrl);
  try {
    const message = await db.query.messages.findFirst({
      where: eq14(messages.token, token)
    });
    if (!message)
      return;
    const server = await db.query.servers.findFirst({
      where: eq14(servers.id, message.serverId)
    });
    if (!server || !server.trackClicks || server.privacyMode)
      return;
    await Promise.allSettled([
      incrementStat(message.serverId, "linksClicked"),
      fireWebhooks(message.serverId, "link_clicked", {
        messageId: message.id,
        subject: message.subject,
        url: targetUrl,
        clickedAt: (/* @__PURE__ */ new Date()).toISOString()
      })
    ]);
  } catch (err) {
    console.error("Click tracking error:", err);
  }
});
var track_default = router11;

// src/server/routes/templates.ts
init_db();
init_schema();
import { Router as Router12 } from "express";
import { z as z10 } from "zod";
import { eq as eq15, and as and11, desc as desc5, like as like2 } from "drizzle-orm";
var router12 = Router12();
function escapeHtml2(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var createTemplateSchema = z10.object({
  serverId: z10.string().uuid(),
  name: z10.string().min(1, "Name is required"),
  slug: z10.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  subject: z10.string().min(1, "Subject is required"),
  plainBody: z10.string().optional(),
  htmlBody: z10.string().optional(),
  variables: z10.array(z10.string()).optional()
});
var updateTemplateSchema = z10.object({
  name: z10.string().min(1).optional(),
  slug: z10.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  subject: z10.string().min(1).optional(),
  plainBody: z10.string().optional(),
  htmlBody: z10.string().optional(),
  variables: z10.array(z10.string()).optional()
});
async function checkServerAccess2(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq15(servers.id, serverId)
  });
  if (!server)
    return { server: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and11(
      eq15(organizationUsers.organizationId, server.organizationId),
      eq15(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
router12.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.query.serverId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    const { server, membership } = await checkServerAccess2(userId, serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const search = req.query.search;
    const conditions = [eq15(templates.serverId, serverId)];
    if (search) {
      conditions.push(like2(templates.name, `%${search}%`));
    }
    const templatesList = await db.query.templates.findMany({
      where: and11(...conditions),
      orderBy: [desc5(templates.createdAt)]
    });
    res.json({ templates: templatesList });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router12.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const template = await db.query.templates.findFirst({
      where: eq15(templates.id, templateId)
    });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { server, membership } = await checkServerAccess2(userId, template.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router12.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createTemplateSchema.parse(req.body);
    const { server, membership } = await checkServerAccess2(userId, data.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const existing = await db.query.templates.findFirst({
      where: and11(
        eq15(templates.serverId, data.serverId),
        eq15(templates.slug, data.slug)
      )
    });
    if (existing) {
      return res.status(409).json({ error: "Template with this slug already exists for this server" });
    }
    const [template] = await db.insert(templates).values({
      serverId: data.serverId,
      name: data.name,
      slug: data.slug,
      subject: data.subject,
      plainBody: data.plainBody,
      htmlBody: data.htmlBody,
      variables: data.variables || []
    }).returning();
    res.status(201).json({ template });
  } catch (error) {
    if (error instanceof z10.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router12.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const existingTemplate = await db.query.templates.findFirst({
      where: eq15(templates.id, templateId)
    });
    if (!existingTemplate) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { server, membership } = await checkServerAccess2(userId, existingTemplate.serverId);
    if (!server || !membership || membership.role === "viewer") {
      return res.status(403).json({ error: "Access denied" });
    }
    const data = updateTemplateSchema.parse(req.body);
    if (data.slug && data.slug !== existingTemplate.slug) {
      const slugExists = await db.query.templates.findFirst({
        where: and11(
          eq15(templates.serverId, existingTemplate.serverId),
          eq15(templates.slug, data.slug)
        )
      });
      if (slugExists) {
        return res.status(409).json({ error: "Template with this slug already exists for this server" });
      }
    }
    const [updatedTemplate] = await db.update(templates).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq15(templates.id, templateId)).returning();
    res.json({ template: updatedTemplate });
  } catch (error) {
    if (error instanceof z10.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router12.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const template = await db.query.templates.findFirst({
      where: eq15(templates.id, templateId)
    });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { server, membership } = await checkServerAccess2(userId, template.serverId);
    if (!server || !membership || membership.role === "viewer") {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(templates).where(eq15(templates.id, templateId));
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router12.post("/:id/render", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const template = await db.query.templates.findFirst({
      where: eq15(templates.id, templateId)
    });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { server, membership } = await checkServerAccess2(userId, template.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const variables = z10.record(z10.string()).default({}).parse(req.body.variables || {});
    const render = (text2, isHtml) => {
      if (!text2)
        return text2;
      return text2.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        const value = variables[key] ?? `{{${key}}}`;
        return isHtml ? escapeHtml2(value) : value;
      });
    };
    res.json({
      subject: render(template.subject, false),
      plainBody: render(template.plainBody, false),
      htmlBody: render(template.htmlBody, true)
    });
  } catch (error) {
    if (error instanceof z10.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error rendering template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var templates_default = router12;

// src/server/routes/outreach/index.ts
import { Router as Router16 } from "express";

// src/server/routes/outreach/email-accounts.ts
init_db();
init_schema();
init_crypto();
import { Router as Router13 } from "express";
import { z as z11 } from "zod";
import { eq as eq16, and as and12 } from "drizzle-orm";
var router13 = Router13();
var createEmailAccountSchema = z11.object({
  email: z11.string().email("Invalid email address"),
  displayName: z11.string().optional(),
  smtpHost: z11.string().min(1, "SMTP host is required"),
  smtpPort: z11.number().int().min(1).max(65535).default(587),
  smtpUsername: z11.string().min(1, "SMTP username is required"),
  smtpPassword: z11.string().min(1, "SMTP password is required"),
  smtpSecure: z11.boolean().default(true),
  imapHost: z11.string().optional(),
  imapPort: z11.number().int().min(1).max(65535).default(993),
  imapUsername: z11.string().optional(),
  imapPassword: z11.string().optional(),
  imapSecure: z11.boolean().default(true),
  dailySendLimit: z11.number().int().min(1).max(1e4).default(50),
  minMinutesBetweenEmails: z11.number().int().min(1).default(5),
  maxMinutesBetweenEmails: z11.number().int().min(1).default(30),
  warmupEnabled: z11.boolean().default(true),
  warmupDays: z11.number().int().min(1).max(60).default(14)
});
var updateEmailAccountSchema = z11.object({
  displayName: z11.string().optional(),
  smtpHost: z11.string().min(1).optional(),
  smtpPort: z11.number().int().min(1).max(65535).optional(),
  smtpUsername: z11.string().min(1).optional(),
  smtpPassword: z11.string().min(1).optional(),
  smtpSecure: z11.boolean().optional(),
  imapHost: z11.string().optional(),
  imapPort: z11.number().int().min(1).max(65535).optional(),
  imapUsername: z11.string().optional(),
  imapPassword: z11.string().optional(),
  imapSecure: z11.boolean().optional(),
  dailySendLimit: z11.number().int().min(1).max(1e4).optional(),
  minMinutesBetweenEmails: z11.number().int().min(1).optional(),
  maxMinutesBetweenEmails: z11.number().int().min(1).optional(),
  warmupEnabled: z11.boolean().optional(),
  warmupDays: z11.number().int().min(1).max(60).optional(),
  status: z11.enum(["pending", "verified", "failed", "paused"]).optional()
});
async function checkOrgMembership(userId, organizationId) {
  const membership = await db.query.organizationUsers.findFirst({
    where: and12(
      eq16(organizationUsers.organizationId, organizationId),
      eq16(organizationUsers.userId, userId)
    )
  });
  return membership;
}
router13.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const accounts = await db.query.emailAccounts.findMany({
      where: eq16(emailAccounts.organizationId, organizationId),
      orderBy: (accounts2, { desc: desc8 }) => [desc8(accounts2.createdAt)]
    });
    const safeAccounts = accounts.map((account) => ({
      ...account,
      smtpPassword: void 0,
      imapPassword: void 0
    }));
    res.json({ emailAccounts: safeAccounts });
  } catch (error) {
    console.error("Error fetching email accounts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq16(emailAccounts.id, accountId)
    });
    if (!account) {
      return res.status(404).json({ error: "Email account not found" });
    }
    const membership = await checkOrgMembership(userId, account.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({
      emailAccount: {
        ...account,
        smtpPassword: void 0,
        imapPassword: void 0
      }
    });
  } catch (error) {
    console.error("Error fetching email account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createEmailAccountSchema.parse(req.body);
    const existing = await db.query.emailAccounts.findFirst({
      where: and12(
        eq16(emailAccounts.organizationId, organizationId),
        eq16(emailAccounts.email, validatedData.email)
      )
    });
    if (existing) {
      return res.status(400).json({ error: "Email account already exists" });
    }
    const [newAccount] = await db.insert(emailAccounts).values({
      organizationId,
      email: validatedData.email,
      displayName: validatedData.displayName,
      smtpHost: validatedData.smtpHost,
      smtpPort: validatedData.smtpPort,
      smtpUsername: validatedData.smtpUsername,
      smtpPassword: encrypt(validatedData.smtpPassword),
      smtpSecure: validatedData.smtpSecure,
      imapHost: validatedData.imapHost,
      imapPort: validatedData.imapPort,
      imapUsername: validatedData.imapUsername,
      imapPassword: validatedData.imapPassword ? encrypt(validatedData.imapPassword) : null,
      imapSecure: validatedData.imapSecure,
      dailySendLimit: validatedData.dailySendLimit,
      minMinutesBetweenEmails: validatedData.minMinutesBetweenEmails,
      maxMinutesBetweenEmails: validatedData.maxMinutesBetweenEmails,
      warmupEnabled: validatedData.warmupEnabled,
      warmupDays: validatedData.warmupDays,
      status: "pending"
    }).returning();
    res.status(201).json({
      emailAccount: {
        ...newAccount,
        smtpPassword: void 0,
        imapPassword: void 0
      }
    });
  } catch (error) {
    if (error instanceof z11.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating email account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq16(emailAccounts.id, accountId)
    });
    if (!account) {
      return res.status(404).json({ error: "Email account not found" });
    }
    const membership = await checkOrgMembership(userId, account.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = updateEmailAccountSchema.parse(req.body);
    const updateValues = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (validatedData.displayName !== void 0)
      updateValues.displayName = validatedData.displayName;
    if (validatedData.smtpHost !== void 0)
      updateValues.smtpHost = validatedData.smtpHost;
    if (validatedData.smtpPort !== void 0)
      updateValues.smtpPort = validatedData.smtpPort;
    if (validatedData.smtpUsername !== void 0)
      updateValues.smtpUsername = validatedData.smtpUsername;
    if (validatedData.smtpPassword !== void 0)
      updateValues.smtpPassword = encrypt(validatedData.smtpPassword);
    if (validatedData.smtpSecure !== void 0)
      updateValues.smtpSecure = validatedData.smtpSecure;
    if (validatedData.imapHost !== void 0)
      updateValues.imapHost = validatedData.imapHost;
    if (validatedData.imapPort !== void 0)
      updateValues.imapPort = validatedData.imapPort;
    if (validatedData.imapUsername !== void 0)
      updateValues.imapUsername = validatedData.imapUsername;
    if (validatedData.imapPassword !== void 0)
      updateValues.imapPassword = validatedData.imapPassword ? encrypt(validatedData.imapPassword) : null;
    if (validatedData.imapSecure !== void 0)
      updateValues.imapSecure = validatedData.imapSecure;
    if (validatedData.dailySendLimit !== void 0)
      updateValues.dailySendLimit = validatedData.dailySendLimit;
    if (validatedData.minMinutesBetweenEmails !== void 0)
      updateValues.minMinutesBetweenEmails = validatedData.minMinutesBetweenEmails;
    if (validatedData.maxMinutesBetweenEmails !== void 0)
      updateValues.maxMinutesBetweenEmails = validatedData.maxMinutesBetweenEmails;
    if (validatedData.warmupEnabled !== void 0)
      updateValues.warmupEnabled = validatedData.warmupEnabled;
    if (validatedData.warmupDays !== void 0)
      updateValues.warmupDays = validatedData.warmupDays;
    if (validatedData.status !== void 0)
      updateValues.status = validatedData.status;
    const [updatedAccount] = await db.update(emailAccounts).set(updateValues).where(eq16(emailAccounts.id, accountId)).returning();
    res.json({
      emailAccount: {
        ...updatedAccount,
        smtpPassword: void 0,
        imapPassword: void 0
      }
    });
  } catch (error) {
    if (error instanceof z11.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating email account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq16(emailAccounts.id, accountId)
    });
    if (!account) {
      return res.status(404).json({ error: "Email account not found" });
    }
    const membership = await checkOrgMembership(userId, account.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(emailAccounts).where(eq16(emailAccounts.id, accountId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting email account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.post("/:id/verify", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq16(emailAccounts.id, accountId)
    });
    if (!account) {
      return res.status(404).json({ error: "Email account not found" });
    }
    const membership = await checkOrgMembership(userId, account.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const [updatedAccount] = await db.update(emailAccounts).set({
      status: "verified",
      verifiedAt: /* @__PURE__ */ new Date(),
      lastError: null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq16(emailAccounts.id, accountId)).returning();
    res.json({
      emailAccount: {
        ...updatedAccount,
        smtpPassword: void 0,
        imapPassword: void 0
      },
      verified: true
    });
  } catch (error) {
    console.error("Error verifying email account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var email_accounts_default = router13;

// src/server/routes/outreach/leads.ts
init_db();
init_schema();
import { Router as Router14 } from "express";
import { z as z12 } from "zod";
import { eq as eq17, and as and13, sql as sql5, inArray } from "drizzle-orm";
var router14 = Router14();
var createLeadSchema = z12.object({
  email: z12.string().email("Invalid email address"),
  firstName: z12.string().optional(),
  lastName: z12.string().optional(),
  companyName: z12.string().optional(),
  companySize: z12.string().optional(),
  industry: z12.string().optional(),
  title: z12.string().optional(),
  website: z12.string().optional(),
  linkedinUrl: z12.string().optional(),
  phone: z12.string().optional(),
  location: z12.string().optional(),
  customFields: z12.record(z12.any()).optional(),
  source: z12.string().optional(),
  leadListId: z12.string().uuid().optional()
});
var updateLeadSchema = z12.object({
  firstName: z12.string().optional(),
  lastName: z12.string().optional(),
  companyName: z12.string().optional(),
  companySize: z12.string().optional(),
  industry: z12.string().optional(),
  title: z12.string().optional(),
  website: z12.string().optional(),
  linkedinUrl: z12.string().optional(),
  phone: z12.string().optional(),
  location: z12.string().optional(),
  customFields: z12.record(z12.any()).optional(),
  status: z12.enum(["new", "contacted", "replied", "interested", "not_interested", "bounced", "unsubscribed"]).optional()
});
var bulkImportSchema = z12.object({
  leads: z12.array(createLeadSchema).min(1).max(1e3),
  leadListId: z12.string().uuid().optional()
});
var createLeadListSchema = z12.object({
  name: z12.string().min(1, "Name is required").max(100),
  description: z12.string().optional(),
  color: z12.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});
async function checkOrgMembership2(userId, organizationId) {
  const membership = await db.query.organizationUsers.findFirst({
    where: and13(
      eq17(organizationUsers.organizationId, organizationId),
      eq17(organizationUsers.userId, userId)
    )
  });
  return membership;
}
router14.get("/lists", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership2(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const lists = await db.query.leadLists.findMany({
      where: eq17(leadLists.organizationId, organizationId),
      orderBy: (lists2, { desc: desc8 }) => [desc8(lists2.createdAt)]
    });
    res.json({ leadLists: lists });
  } catch (error) {
    console.error("Error fetching lead lists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.post("/lists", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership2(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createLeadListSchema.parse(req.body);
    const [newList] = await db.insert(leadLists).values({
      organizationId,
      ...validatedData
    }).returning();
    res.status(201).json({ leadList: newList });
  } catch (error) {
    if (error instanceof z12.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating lead list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.delete("/lists/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const listId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const list = await db.query.leadLists.findFirst({
      where: eq17(leadLists.id, listId)
    });
    if (!list) {
      return res.status(404).json({ error: "Lead list not found" });
    }
    const membership = await checkOrgMembership2(userId, list.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.update(leads).set({ leadListId: null }).where(eq17(leads.leadListId, listId));
    await db.delete(leadLists).where(eq17(leadLists.id, listId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search;
    const status = req.query.status;
    const leadListId = req.query.leadListId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership2(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const offset = (page - 1) * limit;
    const conditions = [eq17(leads.organizationId, organizationId)];
    if (status) {
      conditions.push(eq17(leads.status, status));
    }
    if (leadListId) {
      conditions.push(eq17(leads.leadListId, leadListId));
    }
    const countResult = await db.select({ count: sql5`count(*)` }).from(leads).where(and13(...conditions));
    const total = Number(countResult[0]?.count || 0);
    const leadsList = await db.query.leads.findMany({
      where: and13(...conditions),
      limit,
      offset,
      orderBy: (leads2, { desc: desc8 }) => [desc8(leads2.createdAt)],
      with: {
        leadList: true
      }
    });
    res.json({
      leads: leadsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const leadId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const lead = await db.query.leads.findFirst({
      where: eq17(leads.id, leadId),
      with: {
        leadList: true
      }
    });
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    const membership = await checkOrgMembership2(userId, lead.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership2(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createLeadSchema.parse(req.body);
    const existing = await db.query.leads.findFirst({
      where: and13(
        eq17(leads.organizationId, organizationId),
        eq17(leads.email, validatedData.email)
      )
    });
    if (existing) {
      return res.status(400).json({ error: "Lead with this email already exists" });
    }
    const [newLead] = await db.insert(leads).values({
      organizationId,
      ...validatedData
    }).returning();
    if (validatedData.leadListId) {
      await db.update(leadLists).set({
        leadCount: sql5`${leadLists.leadCount} + 1`
      }).where(eq17(leadLists.id, validatedData.leadListId));
    }
    res.status(201).json({ lead: newLead });
  } catch (error) {
    if (error instanceof z12.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.post("/bulk-import", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership2(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = bulkImportSchema.parse(req.body);
    const existingLeads = await db.query.leads.findMany({
      where: and13(
        eq17(leads.organizationId, organizationId),
        inArray(leads.email, validatedData.leads.map((l) => l.email))
      ),
      columns: { email: true }
    });
    const existingEmails = new Set(existingLeads.map((l) => l.email));
    const newLeads = validatedData.leads.filter((l) => !existingEmails.has(l.email));
    if (newLeads.length === 0) {
      return res.status(400).json({ error: "All leads already exist", imported: 0, duplicates: validatedData.leads.length });
    }
    const insertedLeads = await db.insert(leads).values(
      newLeads.map((lead) => ({
        organizationId,
        ...lead,
        leadListId: validatedData.leadListId || lead.leadListId
      }))
    ).returning();
    if (validatedData.leadListId) {
      await db.update(leadLists).set({
        leadCount: sql5`${leadLists.leadCount} + ${insertedLeads.length}`
      }).where(eq17(leadLists.id, validatedData.leadListId));
    }
    res.status(201).json({
      imported: insertedLeads.length,
      duplicates: validatedData.leads.length - insertedLeads.length,
      leads: insertedLeads
    });
  } catch (error) {
    if (error instanceof z12.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error bulk importing leads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const leadId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const lead = await db.query.leads.findFirst({
      where: eq17(leads.id, leadId)
    });
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    const membership = await checkOrgMembership2(userId, lead.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = updateLeadSchema.parse(req.body);
    const [updatedLead] = await db.update(leads).set({
      ...validatedData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq17(leads.id, leadId)).returning();
    res.json({ lead: updatedLead });
  } catch (error) {
    if (error instanceof z12.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const leadId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const lead = await db.query.leads.findFirst({
      where: eq17(leads.id, leadId)
    });
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    const membership = await checkOrgMembership2(userId, lead.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(leads).where(eq17(leads.id, leadId));
    if (lead.leadListId) {
      await db.update(leadLists).set({
        leadCount: sql5`GREATEST(0, ${leadLists.leadCount} - 1)`
      }).where(eq17(leadLists.id, lead.leadListId));
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.post("/bulk-delete", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    const { leadIds } = req.body;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ error: "leadIds array is required" });
    }
    const membership = await checkOrgMembership2(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const leadsToDelete = await db.query.leads.findMany({
      where: and13(
        eq17(leads.organizationId, organizationId),
        inArray(leads.id, leadIds)
      )
    });
    if (leadsToDelete.length !== leadIds.length) {
      return res.status(400).json({ error: "Some leads not found or access denied" });
    }
    await db.delete(leads).where(inArray(leads.id, leadIds));
    res.json({ success: true, deleted: leadsToDelete.length });
  } catch (error) {
    console.error("Error bulk deleting leads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var leads_default = router14;

// src/server/routes/outreach/campaigns.ts
init_db();
init_schema();
import { Router as Router15 } from "express";
import { z as z13 } from "zod";
import { eq as eq18, and as and14, sql as sql6, inArray as inArray2 } from "drizzle-orm";
var router15 = Router15();
var createCampaignSchema = z13.object({
  name: z13.string().min(1, "Name is required").max(100),
  description: z13.string().optional(),
  fromName: z13.string().optional(),
  replyToEmail: z13.string().email().optional(),
  timezone: z13.string().default("UTC"),
  sendOnWeekends: z13.boolean().default(false),
  sendStartTime: z13.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default("09:00"),
  sendEndTime: z13.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).default("17:00"),
  trackOpens: z13.boolean().default(true),
  trackClicks: z13.boolean().default(true)
});
var updateCampaignSchema = z13.object({
  name: z13.string().min(1).max(100).optional(),
  description: z13.string().optional(),
  fromName: z13.string().optional(),
  replyToEmail: z13.string().email().optional(),
  timezone: z13.string().optional(),
  sendOnWeekends: z13.boolean().optional(),
  sendStartTime: z13.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  sendEndTime: z13.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  trackOpens: z13.boolean().optional(),
  trackClicks: z13.boolean().optional(),
  status: z13.enum(["draft", "active", "paused", "completed", "archived"]).optional()
});
var createSequenceSchema = z13.object({
  name: z13.string().min(1, "Name is required").max(100),
  description: z13.string().optional()
});
var createSequenceStepSchema = z13.object({
  stepOrder: z13.number().int().min(0),
  type: z13.enum(["email", "delay", "condition"]).default("email"),
  delayHours: z13.number().int().min(0).default(0),
  subject: z13.string().optional(),
  plainBody: z13.string().optional(),
  htmlBody: z13.string().optional(),
  subjectB: z13.string().optional(),
  plainBodyB: z13.string().optional(),
  htmlBodyB: z13.string().optional(),
  abTestEnabled: z13.boolean().default(false),
  abTestPercentage: z13.number().int().min(0).max(100).default(50)
});
var addLeadsToCampaignSchema = z13.object({
  leadIds: z13.array(z13.string().uuid()).min(1),
  emailAccountId: z13.string().uuid().optional()
});
async function checkOrgMembership3(userId, organizationId) {
  const membership = await db.query.organizationUsers.findFirst({
    where: and14(
      eq18(organizationUsers.organizationId, organizationId),
      eq18(organizationUsers.userId, userId)
    )
  });
  return membership;
}
router15.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    const status = req.query.status;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership3(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const conditions = [eq18(campaigns.organizationId, organizationId)];
    if (status) {
      conditions.push(eq18(campaigns.status, status));
    }
    const campaignsList = await db.query.campaigns.findMany({
      where: and14(...conditions),
      orderBy: (campaigns2, { desc: desc8 }) => [desc8(campaigns2.createdAt)],
      with: {
        sequences: {
          with: {
            steps: true
          }
        }
      }
    });
    res.json({ campaigns: campaignsList });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId),
      with: {
        sequences: {
          with: {
            steps: {
              orderBy: (steps, { asc: asc2 }) => [asc2(steps.stepOrder)]
            }
          }
        }
      }
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "organizationId is required" });
    }
    const membership = await checkOrgMembership3(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createCampaignSchema.parse(req.body);
    const [newCampaign] = await db.insert(campaigns).values({
      organizationId,
      ...validatedData
    }).returning();
    const [defaultSequence] = await db.insert(sequences).values({
      campaignId: newCampaign.id,
      name: "Main Sequence",
      description: "Default email sequence for this campaign"
    }).returning();
    res.status(201).json({
      campaign: newCampaign,
      sequence: defaultSequence
    });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = updateCampaignSchema.parse(req.body);
    const updateData = { ...validatedData, updatedAt: /* @__PURE__ */ new Date() };
    if (validatedData.status === "active" && campaign.status !== "active") {
      updateData.startedAt = /* @__PURE__ */ new Date();
    } else if (validatedData.status === "completed" && campaign.status !== "completed") {
      updateData.completedAt = /* @__PURE__ */ new Date();
    }
    const [updatedCampaign] = await db.update(campaigns).set(updateData).where(eq18(campaigns.id, campaignId)).returning();
    res.json({ campaign: updatedCampaign });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(campaigns).where(eq18(campaigns.id, campaignId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.get("/:campaignId/sequences", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const sequencesList = await db.query.sequences.findMany({
      where: eq18(sequences.campaignId, campaignId),
      with: {
        steps: {
          orderBy: (steps, { asc: asc2 }) => [asc2(steps.stepOrder)]
        }
      }
    });
    res.json({ sequences: sequencesList });
  } catch (error) {
    console.error("Error fetching sequences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.post("/:campaignId/sequences", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createSequenceSchema.parse(req.body);
    const [newSequence] = await db.insert(sequences).values({
      campaignId,
      ...validatedData
    }).returning();
    res.status(201).json({ sequence: newSequence });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating sequence:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.post("/sequences/:sequenceId/steps", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const sequenceId = req.params.sequenceId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const sequence = await db.query.sequences.findFirst({
      where: eq18(sequences.id, sequenceId),
      with: {
        campaign: true
      }
    });
    if (!sequence) {
      return res.status(404).json({ error: "Sequence not found" });
    }
    const membership = await checkOrgMembership3(userId, sequence.campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createSequenceStepSchema.parse(req.body);
    const [newStep] = await db.insert(sequenceSteps).values({
      sequenceId,
      ...validatedData
    }).returning();
    res.status(201).json({ step: newStep });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error creating sequence step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.put("/sequences/steps/:stepId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const stepId = req.params.stepId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const step = await db.query.sequenceSteps.findFirst({
      where: eq18(sequenceSteps.id, stepId),
      with: {
        sequence: {
          with: {
            campaign: true
          }
        }
      }
    });
    if (!step) {
      return res.status(404).json({ error: "Step not found" });
    }
    const membership = await checkOrgMembership3(userId, step.sequence.campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createSequenceStepSchema.partial().parse(req.body);
    const [updatedStep] = await db.update(sequenceSteps).set({
      ...validatedData,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq18(sequenceSteps.id, stepId)).returning();
    res.json({ step: updatedStep });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating sequence step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.delete("/sequences/steps/:stepId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const stepId = req.params.stepId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const step = await db.query.sequenceSteps.findFirst({
      where: eq18(sequenceSteps.id, stepId),
      with: {
        sequence: {
          with: {
            campaign: true
          }
        }
      }
    });
    if (!step) {
      return res.status(404).json({ error: "Step not found" });
    }
    const membership = await checkOrgMembership3(userId, step.sequence.campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(sequenceSteps).where(eq18(sequenceSteps.id, stepId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting sequence step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.get("/:campaignId/leads", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const offset = (page - 1) * limit;
    const conditions = [eq18(campaignLeads.campaignId, campaignId)];
    if (status) {
      conditions.push(eq18(campaignLeads.status, status));
    }
    const countResult = await db.select({ count: sql6`count(*)` }).from(campaignLeads).where(and14(...conditions));
    const total = Number(countResult[0]?.count || 0);
    const campaignLeadsList = await db.query.campaignLeads.findMany({
      where: and14(...conditions),
      limit,
      offset,
      with: {
        lead: true,
        assignedEmailAccount: true,
        currentStep: true
      },
      orderBy: (campaignLeads2, { desc: desc8 }) => [desc8(campaignLeads2.createdAt)]
    });
    res.json({
      campaignLeads: campaignLeadsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching campaign leads:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.post("/:campaignId/leads", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = addLeadsToCampaignSchema.parse(req.body);
    const leadsList = await db.query.leads.findMany({
      where: and14(
        eq18(leads.organizationId, campaign.organizationId),
        inArray2(leads.id, validatedData.leadIds)
      )
    });
    if (leadsList.length !== validatedData.leadIds.length) {
      return res.status(400).json({ error: "Some leads not found or access denied" });
    }
    const existingCampaignLeads = await db.query.campaignLeads.findMany({
      where: and14(
        eq18(campaignLeads.campaignId, campaignId),
        inArray2(campaignLeads.leadId, validatedData.leadIds)
      ),
      columns: { leadId: true }
    });
    const existingLeadIds = new Set(existingCampaignLeads.map((cl) => cl.leadId));
    const newLeadIds = validatedData.leadIds.filter((id) => !existingLeadIds.has(id));
    if (newLeadIds.length === 0) {
      return res.status(400).json({ error: "All leads already in campaign", added: 0, existing: existingLeadIds.size });
    }
    const firstStep = await db.query.sequenceSteps.findFirst({
      where: eq18(
        sequenceSteps.sequenceId,
        db.select({ id: sequences.id }).from(sequences).where(eq18(sequences.campaignId, campaignId)).limit(1)
      ),
      orderBy: (steps, { asc: asc2 }) => [asc2(steps.stepOrder)]
    });
    const insertedCampaignLeads = await db.insert(campaignLeads).values(
      newLeadIds.map((leadId) => ({
        campaignId,
        leadId,
        assignedEmailAccountId: validatedData.emailAccountId,
        currentStepId: firstStep?.id,
        currentStepOrder: firstStep?.stepOrder || 0
      }))
    ).returning();
    await db.update(campaigns).set({
      totalLeads: sql6`${campaigns.totalLeads} + ${insertedCampaignLeads.length}`
    }).where(eq18(campaigns.id, campaignId));
    res.status(201).json({
      added: insertedCampaignLeads.length,
      existing: existingLeadIds.size,
      campaignLeads: insertedCampaignLeads
    });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error adding leads to campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.delete("/:campaignId/leads/:leadId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    const leadId = req.params.leadId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(campaignLeads).where(and14(
      eq18(campaignLeads.campaignId, campaignId),
      eq18(campaignLeads.leadId, leadId)
    ));
    await db.update(campaigns).set({
      totalLeads: sql6`GREATEST(0, ${campaigns.totalLeads} - 1)`
    }).where(eq18(campaigns.id, campaignId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing lead from campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router15.get("/:id/stats", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq18(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const statsResult = await db.select({
      totalLeads: sql6`count(*)`,
      contacted: sql6`count(*) filter (where ${campaignLeads.status} != 'new')`,
      replied: sql6`count(*) filter (where ${campaignLeads.status} = 'replied' or ${campaignLeads.status} = 'interested')`,
      bounced: sql6`count(*) filter (where ${campaignLeads.status} = 'bounced')`,
      totalOpens: sql6`coalesce(sum(${campaignLeads.totalOpens}), 0)`,
      totalClicks: sql6`coalesce(sum(${campaignLeads.totalClicks}), 0)`,
      totalReplies: sql6`coalesce(sum(${campaignLeads.totalReplies}), 0)`
    }).from(campaignLeads).where(eq18(campaignLeads.campaignId, campaignId));
    const stats = statsResult[0] || {
      totalLeads: 0,
      contacted: 0,
      replied: 0,
      bounced: 0,
      totalOpens: 0,
      totalClicks: 0,
      totalReplies: 0
    };
    res.json({ stats });
  } catch (error) {
    console.error("Error fetching campaign stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var campaigns_default = router15;

// src/server/routes/outreach/index.ts
var router16 = Router16();
router16.use("/email-accounts", email_accounts_default);
router16.use("/leads", leads_default);
router16.use("/campaigns", campaigns_default);
var outreach_default = router16;

// src/server/routes/outlook.ts
init_db();
init_schema();
import { Router as Router17 } from "express";
import { and as and15, eq as eq19 } from "drizzle-orm";
import { z as z14 } from "zod";
var router17 = Router17();
var startSchema = z14.object({
  serverId: z14.string().uuid(),
  loginHint: z14.string().email().optional()
});
var sendTestSchema = z14.object({
  to: z14.string().email(),
  subject: z14.string().min(1).default("SkaleClub Mail Outlook test"),
  body: z14.string().min(1).default("This is a test message sent through Microsoft Graph.")
});
async function checkOutlookAccess(userId, serverId) {
  const server = await db.query.servers.findFirst({
    where: eq19(servers.id, serverId)
  });
  if (!server) {
    return { server: null, membership: null };
  }
  if (await isPlatformAdmin(userId)) {
    return { server, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and15(
      eq19(organizationUsers.organizationId, server.organizationId),
      eq19(organizationUsers.userId, userId)
    )
  });
  return { server, membership };
}
function buildFrontendRedirect(params) {
  const url = new URL("/admin/servers", process.env.FRONTEND_URL || "http://localhost:9000");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}
router17.post("/connect/start", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = startSchema.parse(req.body);
    const { server, membership } = await checkOutlookAccess(userId, data.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can connect Outlook mailboxes" });
    }
    const state = createOutlookOauthState(userId, data.serverId);
    const authUrl = buildOutlookOauthUrl(state, data.loginHint);
    res.json({
      authUrl,
      state
    });
  } catch (error) {
    if (error instanceof z14.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error starting Outlook OAuth:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router17.get("/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : void 0;
  const stateParam = typeof req.query.state === "string" ? req.query.state : void 0;
  const oauthError = typeof req.query.error === "string" ? req.query.error : void 0;
  if (oauthError) {
    return res.redirect(buildFrontendRedirect({
      outlook: "error",
      reason: oauthError
    }));
  }
  if (!code || !stateParam) {
    return res.status(400).json({ error: "Missing OAuth code or state" });
  }
  try {
    const state = parseOutlookOauthState(stateParam);
    const { server, membership } = await checkOutlookAccess(state.userId, state.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Outlook callback is no longer authorized" });
    }
    const connection = await exchangeCodeForOutlookConnection(code);
    const mailboxEmail = connection.profile.mail || connection.profile.userPrincipalName;
    if (!mailboxEmail) {
      throw new Error("Outlook account does not expose a usable mailbox address");
    }
    const existingMailbox = await db.query.outlookMailboxes.findFirst({
      where: eq19(outlookMailboxes.microsoftUserId, connection.profile.id)
    }) || await db.query.outlookMailboxes.findFirst({
      where: and15(
        eq19(outlookMailboxes.serverId, state.serverId),
        eq19(outlookMailboxes.email, mailboxEmail)
      )
    });
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
      status: "active",
      lastSyncedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const [mailbox] = existingMailbox ? await db.update(outlookMailboxes).set(payload).where(eq19(outlookMailboxes.id, existingMailbox.id)).returning() : await db.insert(outlookMailboxes).values(payload).returning();
    return res.redirect(buildFrontendRedirect({
      outlook: "connected",
      mailbox: mailbox.email
    }));
  } catch (error) {
    console.error("Error completing Outlook OAuth:", error);
    return res.redirect(buildFrontendRedirect({
      outlook: "error",
      reason: error instanceof Error ? error.message : "callback_failed"
    }));
  }
});
router17.get("/mailboxes", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const serverId = req.query.serverId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!serverId) {
      return res.status(400).json({ error: "Server ID required" });
    }
    const { server, membership } = await checkOutlookAccess(userId, serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const mailboxes3 = await db.query.outlookMailboxes.findMany({
      where: eq19(outlookMailboxes.serverId, serverId)
    });
    res.json({
      mailboxes: mailboxes3.map(sanitizeOutlookMailbox)
    });
  } catch (error) {
    console.error("Error listing Outlook mailboxes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router17.post("/mailboxes/:id/send-test", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.outlookMailboxes.findFirst({
      where: eq19(outlookMailboxes.id, mailboxId)
    });
    if (!mailbox) {
      return res.status(404).json({ error: "Outlook mailbox not found" });
    }
    const { server, membership } = await checkOutlookAccess(userId, mailbox.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can send Outlook tests" });
    }
    const data = sendTestSchema.parse(req.body);
    await sendMessageWithOutlook({
      serverId: mailbox.serverId,
      mailboxId: mailbox.id,
      fromAddress: mailbox.email,
      to: [data.to],
      subject: data.subject,
      plainBody: data.body
    });
    res.json({
      message: "Test message sent successfully",
      mailbox: sanitizeOutlookMailbox(mailbox)
    });
  } catch (error) {
    if (error instanceof z14.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error sending Outlook test:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});
router17.delete("/mailboxes/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.outlookMailboxes.findFirst({
      where: eq19(outlookMailboxes.id, mailboxId)
    });
    if (!mailbox) {
      return res.status(404).json({ error: "Outlook mailbox not found" });
    }
    const { server, membership } = await checkOutlookAccess(userId, mailbox.serverId);
    if (!server || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can disconnect Outlook mailboxes" });
    }
    await db.delete(outlookMailboxes).where(eq19(outlookMailboxes.id, mailboxId));
    res.json({ message: "Outlook mailbox disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting Outlook mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router17.get("/mailboxes/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.outlookMailboxes.findFirst({
      where: eq19(outlookMailboxes.id, mailboxId)
    });
    if (!mailbox) {
      return res.status(404).json({ error: "Outlook mailbox not found" });
    }
    const { server, membership } = await checkOutlookAccess(userId, mailbox.serverId);
    if (!server || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const activeMailbox = await resolveOutlookMailboxForServer(mailbox.serverId, mailbox.id);
    res.json({
      mailbox: sanitizeOutlookMailbox(activeMailbox || mailbox)
    });
  } catch (error) {
    console.error("Error fetching Outlook mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var outlook_default = router17;

// src/server/routes/mail/index.ts
import { Router as Router22 } from "express";

// src/server/routes/mail/mailboxes.ts
init_db();
init_schema();
init_crypto();
import { Router as Router18 } from "express";
import { z as z15 } from "zod";
import { eq as eq20, and as and16, desc as desc6 } from "drizzle-orm";
var router18 = Router18();
async function checkUserMailboxAccess(userId, mailboxId) {
  const mailbox = await db.query.mailboxes.findFirst({
    where: and16(
      eq20(mailboxes.id, mailboxId),
      eq20(mailboxes.userId, userId)
    )
  });
  return mailbox;
}
router18.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userMailboxes = await db.query.mailboxes.findMany({
      where: eq20(mailboxes.userId, userId),
      orderBy: [desc6(mailboxes.createdAt)]
    });
    const safeMailboxes = userMailboxes.map((mb) => ({
      id: mb.id,
      email: mb.email,
      displayName: mb.displayName,
      isDefault: mb.isDefault,
      isActive: mb.isActive,
      lastSyncAt: mb.lastSyncAt,
      syncError: mb.syncError
    }));
    res.json({ mailboxes: safeMailboxes });
  } catch (error) {
    console.error("Error fetching mailboxes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.mailboxes.findFirst({
      where: and16(
        eq20(mailboxes.id, mailboxId),
        eq20(mailboxes.userId, userId)
      )
    });
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    res.json({
      mailbox: {
        id: mailbox.id,
        email: mailbox.email,
        displayName: mailbox.displayName,
        isDefault: mailbox.isDefault,
        isActive: mailbox.isActive,
        lastSyncAt: mailbox.lastSyncAt,
        syncError: mailbox.syncError
      }
    });
  } catch (error) {
    console.error("Error fetching mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const schema = z15.object({
      email: z15.string().email(),
      displayName: z15.string().optional(),
      smtpHost: z15.string(),
      smtpPort: z15.number().int().min(1).max(65535),
      smtpUsername: z15.string(),
      smtpPassword: z15.string(),
      smtpSecure: z15.boolean().default(true),
      imapHost: z15.string(),
      imapPort: z15.number().int().min(1).max(65535),
      imapUsername: z15.string(),
      imapPassword: z15.string(),
      imapSecure: z15.boolean().default(true),
      isDefault: z15.boolean().default(false)
    });
    const data = schema.parse(req.body);
    if (data.isDefault) {
      await db.update(mailboxes).set({ isDefault: false }).where(eq20(mailboxes.userId, userId));
    }
    const newMailboxValues = {
      userId,
      email: data.email,
      displayName: data.displayName,
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUsername: data.smtpUsername,
      smtpPasswordEncrypted: encrypt(data.smtpPassword),
      smtpSecure: data.smtpSecure,
      imapHost: data.imapHost,
      imapPort: data.imapPort,
      imapUsername: data.imapUsername,
      imapPasswordEncrypted: encrypt(data.imapPassword),
      imapSecure: data.imapSecure,
      isDefault: data.isDefault
    };
    const insertedMailboxes = await db.insert(mailboxes).values(newMailboxValues).returning();
    const insertedMailbox = insertedMailboxes[0];
    const mailboxId = insertedMailbox.id;
    const insertedEmail = insertedMailbox.email;
    const insertedDisplayName = insertedMailbox.displayName;
    const insertedIsDefault = insertedMailbox.isDefault;
    const insertedIsActive = insertedMailbox.isActive;
    await db.insert(mailFolders).values([
      { mailboxId, remoteId: "INBOX", name: "INBOX", type: "inbox" },
      { mailboxId, remoteId: "Sent", name: "Sent", type: "sent" },
      { mailboxId, remoteId: "Drafts", name: "Drafts", type: "drafts" },
      { mailboxId, remoteId: "Trash", name: "Trash", type: "trash" }
    ]);
    res.status(201).json({
      mailbox: {
        id: mailboxId,
        email: insertedEmail,
        displayName: insertedDisplayName,
        isDefault: insertedIsDefault,
        isActive: insertedIsActive
      }
    });
  } catch (error) {
    if (error instanceof z15.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const schema = z15.object({
      displayName: z15.string().optional(),
      smtpPassword: z15.string().optional(),
      imapPassword: z15.string().optional(),
      isDefault: z15.boolean().optional(),
      isActive: z15.boolean().optional()
    });
    const data = schema.parse(req.body);
    const existing = await db.query.mailboxes.findFirst({
      where: and16(
        eq20(mailboxes.id, mailboxId),
        eq20(mailboxes.userId, userId)
      )
    });
    if (!existing) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    if (data.isDefault) {
      await db.update(mailboxes).set({ isDefault: false }).where(eq20(mailboxes.userId, userId));
    }
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (data.displayName !== void 0)
      updateData.displayName = data.displayName;
    if (data.smtpPassword !== void 0)
      updateData.smtpPasswordEncrypted = encrypt(data.smtpPassword);
    if (data.imapPassword !== void 0)
      updateData.imapPasswordEncrypted = encrypt(data.imapPassword);
    if (data.isDefault !== void 0)
      updateData.isDefault = data.isDefault;
    if (data.isActive !== void 0)
      updateData.isActive = data.isActive;
    const [updated] = await db.update(mailboxes).set(updateData).where(eq20(mailboxes.id, mailboxId)).returning();
    res.json({
      mailbox: {
        id: updated.id,
        email: updated.email,
        displayName: updated.displayName,
        isDefault: updated.isDefault,
        isActive: updated.isActive
      }
    });
  } catch (error) {
    if (error instanceof z15.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const existing = await db.query.mailboxes.findFirst({
      where: and16(
        eq20(mailboxes.id, mailboxId),
        eq20(mailboxes.userId, userId)
      )
    });
    if (!existing) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    await db.delete(mailMessages).where(eq20(mailMessages.mailboxId, mailboxId));
    await db.delete(mailFolders).where(eq20(mailFolders.mailboxId, mailboxId));
    await db.delete(mailboxes).where(eq20(mailboxes.id, mailboxId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var mailboxes_default = router18;

// src/server/routes/mail/messages.ts
init_db();
init_schema();
import { Router as Router19 } from "express";
import { z as z16 } from "zod";
import { eq as eq21, and as and17, desc as desc7 } from "drizzle-orm";

// src/server/lib/mail.ts
init_crypto();
import { simpleParser } from "mailparser";
function mailMessageToListItem(msg) {
  const toAddresses = msg.toAddresses || [];
  const { snippet, snippetPlain } = {
    snippet: msg.plainBody?.slice(0, 150) || msg.htmlBody?.slice(0, 150) || "",
    snippetPlain: msg.plainBody?.slice(0, 150) || ""
  };
  return {
    id: msg.id,
    messageId: msg.messageId,
    subject: msg.subject,
    from: { name: msg.fromName, address: msg.fromAddress },
    to: toAddresses.map((a) => ({ name: a.name || null, address: a.address || null })),
    date: msg.receivedAt || msg.remoteDate || null,
    isRead: msg.isRead,
    isStarred: msg.isStarred,
    hasAttachments: msg.hasAttachments,
    snippet: snippet.replace(/<[^>]*>/g, "").slice(0, 150),
    snippetPlain
  };
}

// src/server/routes/mail/messages.ts
var router19 = Router19();
router19.get("/:mailboxId/folders", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const folders = await db.query.mailFolders.findMany({
      where: eq21(mailFolders.mailboxId, mailboxId),
      orderBy: [desc7(mailFolders.createdAt)]
    });
    res.json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.get("/:mailboxId/messages", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const folderId = req.query.folderId;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = (page - 1) * limit;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const conditions = [eq21(mailMessages.mailboxId, mailboxId)];
    if (folderId) {
      conditions.push(eq21(mailMessages.folderId, folderId));
    }
    const messages2 = await db.query.mailMessages.findMany({
      where: and17(...conditions),
      orderBy: [desc7(mailMessages.receivedAt)],
      limit,
      offset
    });
    const [{ count }] = await db.select({ count: eq21(mailMessages.id, mailMessages.id) }).from(mailMessages).where(and17(...conditions));
    const items = messages2.map(mailMessageToListItem);
    res.json({
      messages: items,
      pagination: {
        page,
        limit,
        total: messages2.length,
        totalPages: Math.ceil(messages2.length / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.get("/:mailboxId/messages/:messageId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const messageId = req.params.messageId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const message = await db.query.mailMessages.findFirst({
      where: and17(
        eq21(mailMessages.id, messageId),
        eq21(mailMessages.mailboxId, mailboxId)
      )
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (!message.isRead) {
      await db.update(mailMessages).set({ isRead: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq21(mailMessages.id, messageId));
    }
    res.json({
      message: {
        id: message.id,
        messageId: message.messageId,
        inReplyTo: message.inReplyTo,
        references: message.references,
        subject: message.subject,
        from: { name: message.fromName, address: message.fromAddress },
        to: message.toAddresses,
        cc: message.ccAddresses,
        bcc: message.bccAddresses,
        plainBody: message.plainBody,
        htmlBody: message.htmlBody,
        headers: message.headers,
        attachments: message.attachments,
        hasAttachments: message.hasAttachments,
        isRead: true,
        isStarred: message.isStarred,
        receivedAt: message.receivedAt
      }
    });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.put("/:mailboxId/messages/:messageId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const messageId = req.params.messageId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const schema = z16.object({
      isRead: z16.boolean().optional(),
      isStarred: z16.boolean().optional()
    });
    const data = schema.parse(req.body);
    const existing = await db.query.mailMessages.findFirst({
      where: and17(
        eq21(mailMessages.id, messageId),
        eq21(mailMessages.mailboxId, mailboxId)
      )
    });
    if (!existing) {
      return res.status(404).json({ error: "Message not found" });
    }
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (data.isRead !== void 0)
      updateData.isRead = data.isRead;
    if (data.isStarred !== void 0)
      updateData.isStarred = data.isStarred;
    const [updated] = await db.update(mailMessages).set(updateData).where(eq21(mailMessages.id, messageId)).returning();
    res.json({
      message: mailMessageToListItem(updated)
    });
  } catch (error) {
    if (error instanceof z16.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.delete("/:mailboxId/messages/:messageId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const messageId = req.params.messageId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    await db.update(mailMessages).set({ isDeleted: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq21(mailMessages.id, messageId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var messages_default2 = router19;

// src/server/routes/mail/send.ts
init_db();
init_schema();
init_crypto();
import { Router as Router20 } from "express";
import { z as z17 } from "zod";
import nodemailer from "nodemailer";
import { v4 as uuidv44 } from "uuid";
import { eq as eq22, and as and18 } from "drizzle-orm";
var router20 = Router20();
router20.post("/:mailboxId/send", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const schema = z17.object({
      to: z17.array(z17.object({
        address: z17.string().email(),
        name: z17.string().optional()
      })).min(1),
      cc: z17.array(z17.object({
        address: z17.string().email(),
        name: z17.string().optional()
      })).optional(),
      bcc: z17.array(z17.object({
        address: z17.string().email(),
        name: z17.string().optional()
      })).optional(),
      subject: z17.string().min(1).max(998),
      plainBody: z17.string().optional(),
      htmlBody: z17.string().optional(),
      inReplyTo: z17.string().optional(),
      references: z17.string().optional(),
      attachments: z17.array(z17.object({
        filename: z17.string(),
        content: z17.string(),
        contentType: z17.string().optional()
      })).optional(),
      saveToSent: z17.boolean().default(true)
    });
    const data = schema.parse(req.body);
    if (!data.plainBody && !data.htmlBody) {
      return res.status(400).json({ error: "Message body is required" });
    }
    const smtpConfig = {
      host: mailbox.smtpHost,
      port: mailbox.smtpPort,
      secure: mailbox.smtpSecure,
      auth: {
        user: mailbox.smtpUsername,
        pass: decrypt(mailbox.smtpPasswordEncrypted)
      }
    };
    const transporter = nodemailer.createTransport(smtpConfig);
    const messageId = `<${uuidv44()}@${mailbox.email.split("@")[1] || "mail.local"}>`;
    const mailOptions = {
      from: mailbox.displayName ? `${mailbox.displayName} <${mailbox.email}>` : mailbox.email,
      to: data.to.map((t) => t.address),
      cc: data.cc?.map((c) => c.address),
      bcc: data.bcc?.map((b) => b.address),
      subject: data.subject,
      text: data.plainBody,
      html: data.htmlBody,
      messageId,
      inReplyTo: data.inReplyTo,
      references: data.references,
      attachments: data.attachments?.map((att) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"),
        contentType: att.contentType
      }))
    };
    await transporter.sendMail(mailOptions);
    if (data.saveToSent) {
      const sentFolder = await db.query.mailFolders.findFirst({
        where: and18(
          eq22(mailFolders.mailboxId, mailboxId),
          eq22(mailFolders.remoteId, "Sent")
        )
      });
      if (sentFolder) {
        await db.insert(mailMessages).values({
          mailboxId,
          folderId: sentFolder.id,
          messageId,
          inReplyTo: data.inReplyTo,
          references: data.references,
          subject: data.subject,
          fromAddress: mailbox.email,
          fromName: mailbox.displayName,
          toAddresses: data.to.map((t) => ({ name: t.name || null, address: t.address })),
          ccAddresses: data.cc?.map((c) => ({ name: c.name || null, address: c.address })) || [],
          plainBody: data.plainBody,
          htmlBody: data.htmlBody,
          headers: {},
          hasAttachments: (data.attachments?.length || 0) > 0,
          attachments: data.attachments?.map((att) => ({
            filename: att.filename,
            contentType: att.contentType || "application/octet-stream",
            size: Math.ceil(att.content.length * 0.75)
          })) || [],
          isRead: true,
          isDraft: false,
          remoteDate: /* @__PURE__ */ new Date(),
          receivedAt: /* @__PURE__ */ new Date()
        });
      }
    }
    res.json({
      success: true,
      messageId,
      message: "Email sent successfully"
    });
  } catch (error) {
    if (error instanceof z17.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});
router20.post("/:mailboxId/save-draft", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const schema = z17.object({
      to: z17.array(z17.object({
        address: z17.string().email(),
        name: z17.string().optional()
      })).optional(),
      cc: z17.array(z17.object({
        address: z17.string().email(),
        name: z17.string().optional()
      })).optional(),
      bcc: z17.array(z17.object({
        address: z17.string().email(),
        name: z17.string().optional()
      })).optional(),
      subject: z17.string().optional(),
      plainBody: z17.string().optional(),
      htmlBody: z17.string().optional(),
      attachments: z17.array(z17.object({
        filename: z17.string(),
        content: z17.string(),
        contentType: z17.string().optional()
      })).optional()
    });
    const data = schema.parse(req.body);
    const draftsFolder = await db.query.mailFolders.findFirst({
      where: and18(
        eq22(mailFolders.mailboxId, mailboxId),
        eq22(mailFolders.remoteId, "Drafts")
      )
    });
    if (!draftsFolder) {
      return res.status(400).json({ error: "Drafts folder not found" });
    }
    const messageId = `<${uuidv44()}@${mailbox.email.split("@")[1] || "mail.local"}>`;
    const [savedMessage] = await db.insert(mailMessages).values({
      mailboxId,
      folderId: draftsFolder.id,
      messageId,
      subject: data.subject || null,
      fromAddress: mailbox.email,
      fromName: mailbox.displayName,
      toAddresses: data.to?.map((t) => ({ name: t.name || null, address: t.address })) || [],
      ccAddresses: data.cc?.map((c) => ({ name: c.name || null, address: c.address })) || [],
      bccAddresses: data.bcc?.map((b) => ({ name: b.name || null, address: b.address })) || [],
      plainBody: data.plainBody,
      htmlBody: data.htmlBody,
      headers: {},
      hasAttachments: (data.attachments?.length || 0) > 0,
      attachments: data.attachments?.map((att) => ({
        filename: att.filename,
        contentType: att.contentType || "application/octet-stream",
        size: Math.ceil(att.content.length * 0.75)
      })) || [],
      isDraft: true,
      remoteDate: /* @__PURE__ */ new Date(),
      receivedAt: /* @__PURE__ */ new Date()
    }).returning();
    res.json({
      success: true,
      messageId,
      draftId: savedMessage.id,
      message: "Draft saved"
    });
  } catch (error) {
    if (error instanceof z17.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error saving draft:", error);
    res.status(500).json({ error: "Failed to save draft" });
  }
});
var send_default = router20;

// src/server/routes/mail/sync.ts
init_mail_sync();
import { Router as Router21 } from "express";
var router21 = Router21();
router21.post("/:mailboxId/sync", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const result = await syncMailbox(mailboxId);
    res.json({
      success: result.errors.length === 0,
      newMessages: result.newMessages,
      errors: result.errors
    });
  } catch (error) {
    console.error("Error syncing mailbox:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});
router21.post("/sync-all", async (_req, res) => {
  try {
    const results = await syncAllMailboxes();
    const totalNew = results.reduce((sum, r) => sum + r.newMessages, 0);
    const totalErrors = results.flatMap((r) => r.errors);
    res.json({
      success: totalErrors.length === 0,
      mailboxesProcessed: results.length,
      totalNewMessages: totalNew,
      errors: totalErrors
    });
  } catch (error) {
    console.error("Error syncing all mailboxes:", error);
    res.status(500).json({ error: "Sync failed" });
  }
});
var sync_default = router21;

// src/server/routes/mail/index.ts
var router22 = Router22();
router22.use("/mailboxes", mailboxes_default);
router22.use("/mail/mailboxes", messages_default2);
router22.use("/mail/mailboxes", send_default);
router22.use("/mail/mailboxes", sync_default);
var mail_default = router22;

// src/server/index.ts
var app = express();
var PORT = process.env.PORT || 3001;
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:9000",
  credentials: true
}));
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  message: { error: "Too many requests, please try again later." }
});
app.use("/api/", limiter);
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 5,
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/reset-password", authLimiter);
var trackingLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 100,
  message: { error: "Too many requests, please try again later." }
});
app.use("/t/", trackingLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var supabase2 = createClient3(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
var PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/refresh"
];
app.use("/api", async (req, res, next) => {
  const path = req.path;
  if (PUBLIC_PATHS.some((p) => path === p)) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase2.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.headers["x-user-id"] = user.id;
  const existing = await db.query.users.findFirst({
    where: eq24(users.id, user.id)
  });
  if (!existing) {
    await db.insert(users).values({
      id: user.id,
      email: user.email,
      firstName: user.user_metadata?.firstName || null,
      lastName: user.user_metadata?.lastName || null,
      isAdmin: false,
      emailVerified: true
    });
  }
  next();
});
app.use("/api/auth", auth_default);
app.use("/api/users", users_default);
app.use("/api/organizations", organizations_default);
app.use("/api/servers", servers_default);
app.use("/api/domains", domains_default);
app.use("/api/messages", messages_default);
app.use("/api/webhooks", webhooks_default);
app.use("/api/credentials", credentials_default);
app.use("/api/routes", routes_default);
app.use("/api/system", system_default);
app.use("/api/templates", templates_default);
app.use("/api/outreach", outreach_default);
app.use("/api/outlook", outlook_default);
app.use("/api/mail", mail_default);
app.use("/t", track_default);
app.use((err, _req, res, _next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : void 0
  });
});
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("SkaleClub Mail API ready");
    Promise.resolve().then(() => (init_jobs(), jobs_exports)).then(({ startSyncWorker: startSyncWorker2 }) => startSyncWorker2());
  });
}
var server_default = app;
export {
  server_default as default
};
