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
  addressEndpointsRelations: () => addressEndpointsRelations,
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
  httpEndpointsRelations: () => httpEndpointsRelations,
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
  insertTemplateSchema: () => insertTemplateSchema,
  insertUserSchema: () => insertUserSchema,
  insertWebhookSchema: () => insertWebhookSchema,
  leadLists: () => leadLists,
  leadListsRelations: () => leadListsRelations,
  leadStatusEnum: () => leadStatusEnum,
  leads: () => leads,
  leadsRelations: () => leadsRelations,
  mailFilters: () => mailFilters,
  mailFiltersRelations: () => mailFiltersRelations,
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
  smtpEndpoints: () => smtpEndpoints,
  smtpEndpointsRelations: () => smtpEndpointsRelations,
  statistics: () => statistics,
  statisticsRelations: () => statisticsRelations,
  suppressions: () => suppressions,
  suppressionsRelations: () => suppressionsRelations,
  systemBranding: () => systemBranding,
  templates: () => templates,
  templatesRelations: () => templatesRelations,
  trackDomains: () => trackDomains,
  trackDomainsRelations: () => trackDomainsRelations,
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
var userRoleEnum, serverModeEnum, serverSendModeEnum, domainVerificationEnum, messageStatusEnum, credentialTypeEnum, outlookMailboxStatusEnum, routeModeEnum, webhookEventEnum, users, organizations, organizationUsers, domains, credentials, outlookMailboxes, routes, smtpEndpoints, httpEndpoints, addressEndpoints, messages, deliveries, webhooks, webhookRequests, templates, trackDomains, suppressions, statistics, systemBranding, usersRelations, organizationsRelations, organizationUsersRelations, domainsRelations, credentialsRelations, outlookMailboxesRelations, routesRelations, messagesRelations, deliveriesRelations, webhooksRelations, webhookRequestsRelations, templatesRelations, trackDomainsRelations, suppressionsRelations, statisticsRelations, smtpEndpointsRelations, httpEndpointsRelations, addressEndpointsRelations, insertUserSchema, selectUserSchema, insertOrganizationSchema, selectOrganizationSchema, insertDomainSchema, selectDomainSchema, insertCredentialSchema, selectCredentialSchema, insertOutlookMailboxSchema, selectOutlookMailboxSchema, insertRouteSchema, selectRouteSchema, insertMessageSchema, selectMessageSchema, insertWebhookSchema, selectWebhookSchema, insertTemplateSchema, selectTemplateSchema, campaignStatusEnum, leadStatusEnum, emailAccountStatusEnum, sequenceStepTypeEnum, emailAccounts, leadLists, leads, campaigns, sequences, sequenceSteps, campaignLeads, outreachEmails, outreachAnalytics, emailAccountsRelations, leadListsRelations, leadsRelations, campaignsRelations, sequencesRelations, sequenceStepsRelations, campaignLeadsRelations, outreachEmailsRelations, outreachAnalyticsRelations, insertEmailAccountSchema, selectEmailAccountSchema, insertLeadListSchema, selectLeadListSchema, insertLeadSchema, selectLeadSchema, insertCampaignSchema, selectCampaignSchema, insertSequenceSchema, selectSequenceSchema, insertSequenceStepSchema, selectSequenceStepSchema, insertCampaignLeadSchema, selectCampaignLeadSchema, insertOutreachEmailSchema, selectOutreachEmailSchema, mailboxes, mailFolders, mailMessages, mailFilters, mailboxesRelations, mailFoldersRelations, mailMessagesRelations, mailFiltersRelations;
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
      outreach_enabled: boolean("outreach_enabled").default(true).notNull(),
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
    domains = pgTable("domains", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      name: text("name").notNull(),
      verificationToken: text("verification_token"),
      verificationMethod: text("verification_method").default("dns"),
      verificationStatus: domainVerificationEnum("verification_status").default("pending").notNull(),
      verifiedAt: timestamp("verified_at"),
      // DKIM
      dkimPrivateKey: text("dkim_private_key"),
      dkimPublicKey: text("dkim_public_key"),
      dkimSelector: text("dkim_selector").default("skaleclub"),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      orgEmailUnique: uniqueIndex("outlook_mailboxes_org_email_unique").on(table.organizationId, table.email),
      microsoftUserUnique: uniqueIndex("outlook_mailboxes_microsoft_user_unique").on(table.microsoftUserId)
    }));
    routes = pgTable("routes", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      name: text("name").notNull(),
      emailAddress: text("email_address").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    messages = pgTable("messages", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      orgSlugUnique: uniqueIndex("template_org_slug_unique").on(table.organizationId, table.slug)
    }));
    trackDomains = pgTable("track_domains", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      domain: text("domain").notNull(),
      verificationToken: text("verification_token"),
      verificationStatus: domainVerificationEnum("verification_status").default("pending").notNull(),
      verifiedAt: timestamp("verified_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    suppressions = pgTable("suppressions", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
      emailAddress: text("email_address").notNull(),
      reason: text("reason").notNull(),
      // 'bounce', 'complaint', 'manual'
      createdAt: timestamp("created_at").defaultNow().notNull()
    }, (table) => ({
      orgEmailUnique: uniqueIndex("suppression_org_email_unique").on(table.organizationId, table.emailAddress)
    }));
    statistics = pgTable("statistics", {
      id: uuid("id").primaryKey().defaultRandom(),
      organizationId: uuid("organization_id").references(() => organizations.id).notNull(),
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
      orgDateUnique: uniqueIndex("stats_org_date_unique").on(table.organizationId, table.date)
    }));
    systemBranding = pgTable("system_branding", {
      id: text("id").primaryKey().default("default"),
      companyName: text("company_name").notNull().default(""),
      applicationName: text("application_name").notNull().default("Mail Platform"),
      logoStorage: text("logo_storage"),
      faviconStorage: text("favicon_storage"),
      mailHost: text("mail_host"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    usersRelations = relations(users, ({ many }) => ({
      organizations: many(organizationUsers)
    }));
    organizationsRelations = relations(organizations, ({ one, many }) => ({
      owner: one(users, {
        fields: [organizations.owner_id],
        references: [users.id]
      }),
      members: many(organizationUsers),
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
    domainsRelations = relations(domains, ({ one }) => ({
      organization: one(organizations, {
        fields: [domains.organizationId],
        references: [organizations.id]
      })
    }));
    credentialsRelations = relations(credentials, ({ one }) => ({
      organization: one(organizations, {
        fields: [credentials.organizationId],
        references: [organizations.id]
      })
    }));
    outlookMailboxesRelations = relations(outlookMailboxes, ({ one }) => ({
      organization: one(organizations, {
        fields: [outlookMailboxes.organizationId],
        references: [organizations.id]
      })
    }));
    routesRelations = relations(routes, ({ one }) => ({
      organization: one(organizations, {
        fields: [routes.organizationId],
        references: [organizations.id]
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
      organization: one(organizations, {
        fields: [messages.organizationId],
        references: [organizations.id]
      }),
      deliveries: many(deliveries)
    }));
    deliveriesRelations = relations(deliveries, ({ one }) => ({
      message: one(messages, {
        fields: [deliveries.messageId],
        references: [messages.id]
      }),
      organization: one(organizations, {
        fields: [deliveries.organizationId],
        references: [organizations.id]
      })
    }));
    webhooksRelations = relations(webhooks, ({ one, many }) => ({
      organization: one(organizations, {
        fields: [webhooks.organizationId],
        references: [organizations.id]
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
      organization: one(organizations, {
        fields: [templates.organizationId],
        references: [organizations.id]
      })
    }));
    trackDomainsRelations = relations(trackDomains, ({ one }) => ({
      organization: one(organizations, {
        fields: [trackDomains.organizationId],
        references: [organizations.id]
      })
    }));
    suppressionsRelations = relations(suppressions, ({ one }) => ({
      organization: one(organizations, {
        fields: [suppressions.organizationId],
        references: [organizations.id]
      })
    }));
    statisticsRelations = relations(statistics, ({ one }) => ({
      organization: one(organizations, {
        fields: [statistics.organizationId],
        references: [organizations.id]
      })
    }));
    smtpEndpointsRelations = relations(smtpEndpoints, ({ one }) => ({
      organization: one(organizations, {
        fields: [smtpEndpoints.organizationId],
        references: [organizations.id]
      })
    }));
    httpEndpointsRelations = relations(httpEndpoints, ({ one }) => ({
      organization: one(organizations, {
        fields: [httpEndpoints.organizationId],
        references: [organizations.id]
      })
    }));
    addressEndpointsRelations = relations(addressEndpoints, ({ one }) => ({
      organization: one(organizations, {
        fields: [addressEndpoints.organizationId],
        references: [organizations.id]
      })
    }));
    insertUserSchema = createInsertSchema(users);
    selectUserSchema = createSelectSchema(users);
    insertOrganizationSchema = createInsertSchema(organizations);
    selectOrganizationSchema = createSelectSchema(organizations);
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
      isNative: boolean("is_native").default(false).notNull(),
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
    mailFilters = pgTable("mail_filters", {
      id: uuid("id").primaryKey().defaultRandom(),
      mailboxId: uuid("mailbox_id").references(() => mailboxes.id).notNull(),
      name: text("name").notNull(),
      // Conditions (JSON)
      conditions: jsonb("conditions").notNull(),
      // { field: 'from'|'to'|'subject'|'body', operator: 'contains'|'equals'|'startsWith'|'regex', value: string }
      // Actions
      actions: jsonb("actions").notNull(),
      // { action: 'markRead'|'markStarred'|'moveToFolder'|'addLabel'|'markSpam'|'archive', value?: string }
      isActive: boolean("is_active").default(true).notNull(),
      priority: integer("priority").default(0).notNull(),
      // Higher = runs first
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
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
    mailFiltersRelations = relations(mailFilters, ({ one }) => ({
      mailbox: one(mailboxes, {
        fields: [mailFilters.mailboxId],
        references: [mailboxes.id]
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

// src/server/lib/crypto.ts
import crypto from "crypto";
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
var ALGORITHM, IV_LENGTH;
var init_crypto = __esm({
  "src/server/lib/crypto.ts"() {
    "use strict";
    ALGORITHM = "aes-256-gcm";
    IV_LENGTH = 12;
  }
});

// src/server/lib/admin.ts
var admin_exports = {};
__export(admin_exports, {
  isPlatformAdmin: () => isPlatformAdmin
});
import { eq as eq3 } from "drizzle-orm";
async function isPlatformAdmin(userId) {
  const user = await db.query.users.findFirst({ where: eq3(users.id, userId) });
  return user?.isAdmin === true;
}
var init_admin = __esm({
  "src/server/lib/admin.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// src/server/lib/tracking.ts
import { createHmac } from "crypto";
import { eq as eq8, and as and5, sql as sql2 } from "drizzle-orm";
function shouldSkipUrl(url) {
  const lower = url.toLowerCase().trim();
  if (SKIP_PROTOCOLS.some((p) => lower.startsWith(p)))
    return true;
  if (lower.startsWith("#"))
    return true;
  if (/\{\{.*?\}\}/.test(url))
    return true;
  return false;
}
function encodeTrackingUrl(url, baseUrl, token) {
  const encoded = Buffer.from(url).toString("base64url");
  return `${baseUrl}/t/click/${token}?u=${encoded}`;
}
function rewriteLinks(html, baseUrl, token) {
  const hrefRegex = /href\s*=\s*(["'])([^"']*?)\1|href\s*=\s*([^\s>]+)/gi;
  return html.replace(hrefRegex, (match, quote, quotedUrl, unquotedUrl) => {
    const url = quotedUrl ?? unquotedUrl;
    if (!url)
      return match;
    if (shouldSkipUrl(url))
      return match;
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed))
      return match;
    const trackingUrl = encodeTrackingUrl(trimmed, baseUrl, token);
    if (quote) {
      return `href=${quote}${trackingUrl}${quote}`;
    }
    return `href="${trackingUrl}"`;
  });
}
function injectTrackingPixel(html, token, baseUrl) {
  const pixel = `<img src="${baseUrl}/t/open/${token}" width="1" height="1" alt="" style="display:none!important;width:1px!important;height:1px!important" />`;
  if (/<\/body>/i.test(html)) {
    return html.replace(/<\/body>/i, `${pixel}</body>`);
  }
  return html + pixel;
}
function injectTracking(html, token, baseUrl, trackOpens, trackClicks) {
  let result = html;
  if (trackClicks) {
    result = rewriteLinks(result, baseUrl, token);
  }
  if (trackOpens) {
    result = injectTrackingPixel(result, token, baseUrl);
  }
  return result;
}
async function incrementStat(organizationId, field) {
  const col = STAT_COLUMNS[field];
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  try {
    await db.execute(sql2`
            INSERT INTO statistics (id, organization_id, date, ${sql2.raw(col)})
            VALUES (gen_random_uuid(), ${organizationId}, ${today}, 1)
            ON CONFLICT (organization_id, date)
            DO UPDATE SET ${sql2.raw(col)} = statistics.${sql2.raw(col)} + 1
        `);
  } catch (err) {
    console.error("incrementStat error:", err);
  }
}
async function fireWebhooks(organizationId, event, data) {
  try {
    const allWebhooks = await db.query.webhooks.findMany({
      where: and5(
        eq8(webhooks.organizationId, organizationId),
        eq8(webhooks.active, true)
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
      organizationId,
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
var SKIP_PROTOCOLS, STAT_COLUMNS;
var init_tracking = __esm({
  "src/server/lib/tracking.ts"() {
    "use strict";
    init_db();
    init_schema();
    SKIP_PROTOCOLS = ["javascript:", "mailto:", "tel:", "data:"];
    STAT_COLUMNS = {
      messagesOpened: "messages_opened",
      linksClicked: "links_clicked",
      messagesSent: "messages_sent",
      messagesDelivered: "messages_delivered",
      messagesBounced: "messages_bounced",
      messagesHeld: "messages_held",
      messagesIncoming: "messages_incoming"
    };
  }
});

// src/server/jobs/processQueue.ts
import { createTransport } from "nodemailer";
import { eq as eq29, and as and23 } from "drizzle-orm";
async function processQueue() {
  if (running)
    return;
  running = true;
  try {
    const pendingDeliveries = await db.query.deliveries.findMany({
      where: eq29(deliveries.status, "pending"),
      limit: 50
    });
    for (const delivery of pendingDeliveries) {
      await processDelivery(delivery);
    }
  } catch (err) {
    console.error("[processQueue] Error:", err);
  } finally {
    running = false;
  }
}
async function processDelivery(delivery) {
  try {
    const message = await db.query.messages.findFirst({
      where: eq29(messages.id, delivery.messageId)
    });
    if (!message) {
      await db.update(deliveries).set({ status: "failed", details: "Message not found" }).where(eq29(deliveries.id, delivery.id));
      return;
    }
    if (message.held)
      return;
    const org = await db.query.organizations.findFirst({
      where: eq29(organizations.id, message.organizationId)
    });
    if (!org) {
      await db.update(deliveries).set({ status: "failed", details: "Organization not found" }).where(eq29(deliveries.id, delivery.id));
      return;
    }
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!host) {
      console.warn("[processQueue] SMTP_HOST not configured, skipping delivery");
      return;
    }
    const transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : void 0
    });
    const fromAddress = message.fromAddress || process.env.SMTP_FROM || "";
    const attachments = (message.attachments || []).map((att) => ({
      filename: att.filename,
      content: Buffer.from(att.content, "base64"),
      contentType: att.contentType
    }));
    const result = await transporter.sendMail({
      from: fromAddress,
      to: delivery.rcptTo,
      subject: message.subject || "",
      text: message.plainBody || void 0,
      html: message.htmlBody || void 0,
      headers: message.headers || {},
      attachments: attachments.length > 0 ? attachments : void 0,
      messageId: message.messageId || void 0
    });
    const now = /* @__PURE__ */ new Date();
    await db.update(deliveries).set({
      status: "sent",
      sentAt: now,
      sentWithSsl: port === 465,
      output: result.messageId || null
    }).where(eq29(deliveries.id, delivery.id));
    const remaining = await db.query.deliveries.findMany({
      where: and23(
        eq29(deliveries.messageId, message.id),
        eq29(deliveries.status, "pending")
      )
    });
    if (remaining.length === 0) {
      await db.update(messages).set({ status: "sent", sentAt: now, updatedAt: now }).where(eq29(messages.id, message.id));
      await Promise.allSettled([
        incrementStat(message.organizationId, "messagesSent"),
        fireWebhooks(message.organizationId, "message_sent", {
          messageId: message.id,
          subject: message.subject,
          from: message.fromAddress,
          to: message.toAddresses
        })
      ]);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[processQueue] Delivery ${delivery.id} failed:`, errorMsg);
    await db.update(deliveries).set({
      status: "bounced",
      bouncedAt: /* @__PURE__ */ new Date(),
      details: errorMsg
    }).where(eq29(deliveries.id, delivery.id));
  }
}
var running;
var init_processQueue = __esm({
  "src/server/jobs/processQueue.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_tracking();
    running = false;
  }
});

// src/server/jobs/processHeld.ts
import { eq as eq30, and as and24, lt, isNotNull as isNotNull2 } from "drizzle-orm";
async function processHeldMessages() {
  if (running2)
    return;
  running2 = true;
  try {
    const now = /* @__PURE__ */ new Date();
    const heldMessages = await db.query.messages.findMany({
      where: and24(
        eq30(messages.held, true),
        isNotNull2(messages.holdExpiry),
        lt(messages.holdExpiry, now)
      ),
      limit: 100
    });
    for (const msg of heldMessages) {
      await db.update(messages).set({
        held: false,
        holdExpiry: null,
        heldReason: null,
        status: "queued",
        updatedAt: now
      }).where(eq30(messages.id, msg.id));
    }
    if (heldMessages.length > 0) {
      console.log(`[processHeld] Released ${heldMessages.length} expired held messages`);
    }
  } catch (err) {
    console.error("[processHeld] Error:", err);
  } finally {
    running2 = false;
  }
}
var running2;
var init_processHeld = __esm({
  "src/server/jobs/processHeld.ts"() {
    "use strict";
    init_db();
    init_schema();
    running2 = false;
  }
});

// src/server/jobs/cleanupMessages.ts
import { eq as eq31 } from "drizzle-orm";
async function cleanupOldMessages() {
  if (running3)
    return;
  running3 = true;
  try {
    const allOrganizations = await db.select({ id: organizations.id }).from(organizations);
    let totalDeleted = 0;
    for (const org of allOrganizations) {
      const oldMessages = await db.select({ id: messages.id }).from(messages).where(eq31(messages.organizationId, org.id));
      if (oldMessages.length === 0)
        continue;
      const messageIds = oldMessages.map((m) => m.id);
      for (const msgId of messageIds) {
        await db.delete(deliveries).where(eq31(deliveries.messageId, msgId));
      }
      for (const msgId of messageIds) {
        await db.delete(messages).where(eq31(messages.id, msgId));
      }
      totalDeleted += oldMessages.length;
    }
    if (totalDeleted > 0) {
      console.log(`[cleanup] Deleted ${totalDeleted} old messages`);
    }
  } catch (err) {
    console.error("[cleanup] Error:", err);
  } finally {
    running3 = false;
  }
}
var running3;
var init_cleanupMessages = __esm({
  "src/server/jobs/cleanupMessages.ts"() {
    "use strict";
    init_db();
    init_schema();
    running3 = false;
  }
});

// src/server/lib/template-variables.ts
function interpolateTemplate(template, lead) {
  if (!template)
    return template;
  let result = template;
  for (const [token, handler] of Object.entries(BUILTIN_VARIABLES)) {
    const lowerToken = token.toLowerCase();
    const regex = new RegExp(escapeRegex(token) + "|" + escapeRegex(lowerToken), "gi");
    result = result.replace(regex, handler(lead));
  }
  result = result.replace(VARIABLE_REGEX, (match, variableName) => {
    if (lead.customFields && variableName in lead.customFields) {
      const value = lead.customFields[variableName];
      return value != null ? String(value) : "";
    }
    const lowerName = variableName.toLowerCase();
    for (const [token, handler] of Object.entries(BUILTIN_VARIABLES)) {
      if (token.toLowerCase() === `{{${lowerName}}}`) {
        return handler(lead);
      }
    }
    return "";
  });
  return result;
}
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
var DEFAULT_VALUES, BUILTIN_VARIABLES, VARIABLE_REGEX;
var init_template_variables = __esm({
  "src/server/lib/template-variables.ts"() {
    "use strict";
    DEFAULT_VALUES = {
      firstName: "there",
      lastName: "",
      companyName: "your company",
      companySize: "",
      industry: "",
      title: "",
      website: "",
      linkedinUrl: "",
      phone: "",
      location: ""
    };
    BUILTIN_VARIABLES = {
      "{{firstName}}": (lead) => lead.firstName || DEFAULT_VALUES.firstName,
      "{{lastname}}": (lead) => lead.lastName || DEFAULT_VALUES.lastName,
      "{{lastName}}": (lead) => lead.lastName || DEFAULT_VALUES.lastName,
      "{{email}}": (lead) => lead.email,
      "{{companyName}}": (lead) => lead.companyName || DEFAULT_VALUES.companyName,
      "{{company}}": (lead) => lead.companyName || DEFAULT_VALUES.companyName,
      "{{companySize}}": (lead) => lead.companySize || DEFAULT_VALUES.companySize,
      "{{industry}}": (lead) => lead.industry || DEFAULT_VALUES.industry,
      "{{title}}": (lead) => lead.title || DEFAULT_VALUES.title,
      "{{website}}": (lead) => lead.website || DEFAULT_VALUES.website,
      "{{linkedinUrl}}": (lead) => lead.linkedinUrl || DEFAULT_VALUES.linkedinUrl,
      "{{phone}}": (lead) => lead.phone || DEFAULT_VALUES.phone,
      "{{location}}": (lead) => lead.location || DEFAULT_VALUES.location,
      "{{fullName}}": (lead) => {
        const parts = [lead.firstName, lead.lastName].filter(Boolean);
        return parts.length > 0 ? parts.join(" ") : "there";
      }
    };
    VARIABLE_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g;
  }
});

// src/server/jobs/processOutreachSequences.ts
import nodemailer3 from "nodemailer";
import { eq as eq32, and as and25, lte, gt as gt2, sql as sql7, inArray as inArray4, notInArray } from "drizzle-orm";
function isWithinSendWindow(campaign, now) {
  if (!campaign.sendOnWeekends) {
    const day = now.getDay();
    if (day === 0 || day === 6) {
      return false;
    }
  }
  const [startHour, startMin] = (campaign.sendStartTime || "09:00").split(":").map(Number);
  const [endHour, endMin] = (campaign.sendEndTime || "17:00").split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60 + (startMin || 0);
  const endMinutes = endHour * 60 + (endMin || 0);
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
function canSendFromAccount(account) {
  return account.currentDailySent < account.dailySendLimit;
}
function getNextStep(steps, currentStepOrder) {
  return steps.find((s) => s.stepOrder > currentStepOrder) || null;
}
function calculateNextScheduledAt(delayHours, timezone, sendStartTime, sendEndTime, sendOnWeekends) {
  const next = /* @__PURE__ */ new Date();
  next.setHours(next.getHours() + delayHours);
  const [startHour] = (sendStartTime || "09:00").split(":").map(Number);
  const [endHour] = (sendEndTime || "17:00").split(":").map(Number);
  const hour = next.getHours();
  if (hour < startHour) {
    next.setHours(startHour, 0, 0, 0);
  } else if (hour >= endHour) {
    next.setDate(next.getDate() + 1);
    next.setHours(startHour, 0, 0, 0);
  }
  if (!sendOnWeekends) {
    const day = next.getDay();
    if (day === 0) {
      next.setDate(next.getDate() + 1);
    } else if (day === 6) {
      next.setDate(next.getDate() + 2);
    }
  }
  return next;
}
async function sendEmail(account, to, fromName, subject, htmlBody, plainBody, replyTo) {
  const transporter = nodemailer3.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpSecure,
    auth: {
      user: account.smtpUsername,
      pass: decryptSecret(account.smtpPassword)
    }
  });
  const from = fromName ? `${fromName} <${account.email}>` : account.email;
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html: htmlBody || void 0,
    text: plainBody || void 0,
    replyTo: replyTo || void 0
  });
  return { messageId: info.messageId };
}
async function processOutreachSequences() {
  const now = /* @__PURE__ */ new Date();
  const result = { processed: 0, sent: 0, errors: 0 };
  const pendingLeads = await db.query.campaignLeads.findMany({
    where: and25(
      lte(campaignLeads.nextScheduledAt, now),
      notInArray(campaignLeads.status, ["replied", "bounced", "unsubscribed"])
    ),
    with: {
      campaign: true,
      lead: true,
      currentStep: true,
      assignedEmailAccount: true
    }
  });
  if (pendingLeads.length === 0) {
    return result;
  }
  const campaignIds = [...new Set(pendingLeads.map((cl) => cl.campaignId))];
  const campaignsMap = new Map(
    (await db.query.campaigns.findMany({
      where: inArray4(campaigns.id, campaignIds)
    })).map((c) => [c.id, c])
  );
  const sequenceIds = [...new Set(
    pendingLeads.filter((cl) => cl.currentStep?.sequenceId).map((cl) => cl.currentStep.sequenceId)
  )];
  const allSteps = await db.query.sequenceSteps.findMany({
    where: inArray4(sequenceSteps.sequenceId, sequenceIds),
    orderBy: (steps, { asc: asc3 }) => [asc3(steps.stepOrder)]
  });
  const stepsBySequence = /* @__PURE__ */ new Map();
  for (const step of allSteps) {
    if (!stepsBySequence.has(step.sequenceId)) {
      stepsBySequence.set(step.sequenceId, []);
    }
    stepsBySequence.get(step.sequenceId).push(step);
  }
  for (const campaignLead of pendingLeads) {
    result.processed++;
    try {
      const campaign = campaignsMap.get(campaignLead.campaignId);
      if (!campaign) {
        console.error(`Campaign ${campaignLead.campaignId} not found`);
        result.errors++;
        continue;
      }
      if (campaign.status !== "active") {
        continue;
      }
      const lead = campaignLead.lead;
      if (!lead) {
        console.error(`Lead not found for campaign lead ${campaignLead.id}`);
        result.errors++;
        continue;
      }
      if (lead.unsubscribedAt) {
        await db.update(campaignLeads).set({ status: "unsubscribed", nextScheduledAt: null }).where(eq32(campaignLeads.id, campaignLead.id));
        continue;
      }
      if (!isWithinSendWindow(campaign, now)) {
        continue;
      }
      const emailAccount = campaignLead.assignedEmailAccount;
      if (!emailAccount) {
        console.error(`No email account assigned for campaign lead ${campaignLead.id}`);
        result.errors++;
        continue;
      }
      if (emailAccount.status !== "verified") {
        console.error(`Email account ${emailAccount.id} is not verified`);
        result.errors++;
        continue;
      }
      if (!canSendFromAccount(emailAccount)) {
        console.log(`Email account ${emailAccount.id} has reached daily limit`);
        continue;
      }
      const currentStep = campaignLead.currentStep;
      if (!currentStep) {
        console.error(`No current step for campaign lead ${campaignLead.id}`);
        result.errors++;
        continue;
      }
      const subject = interpolateTemplate(currentStep.subject || "", lead);
      const htmlBody = currentStep.htmlBody ? interpolateTemplate(currentStep.htmlBody, lead) : null;
      const plainBody = currentStep.plainBody ? interpolateTemplate(currentStep.plainBody, lead) : null;
      const { messageId } = await sendEmail(
        emailAccount,
        lead.email,
        campaign.fromName,
        subject,
        htmlBody,
        plainBody,
        campaign.replyToEmail
      );
      await db.insert(outreachEmails).values({
        organizationId: campaign.organizationId,
        campaignId: campaign.id,
        campaignLeadId: campaignLead.id,
        sequenceStepId: currentStep.id,
        emailAccountId: emailAccount.id,
        messageId,
        subject,
        plainBody,
        htmlBody,
        abVariant: null,
        status: "sent",
        sentAt: /* @__PURE__ */ new Date()
      });
      const isFirstContact = !campaignLead.firstContactedAt;
      await db.update(campaignLeads).set({
        status: "contacted",
        firstContactedAt: campaignLead.firstContactedAt || /* @__PURE__ */ new Date(),
        lastContactedAt: /* @__PURE__ */ new Date(),
        currentStepId: currentStep.id,
        currentStepOrder: currentStep.stepOrder
      }).where(eq32(campaignLeads.id, campaignLead.id));
      if (lead.status === "new") {
        await db.update(leads).set({ status: "contacted", lastContactedAt: /* @__PURE__ */ new Date() }).where(eq32(leads.id, lead.id));
      }
      await db.update(emailAccounts).set({
        currentDailySent: sql7`${emailAccounts.currentDailySent} + 1`,
        totalSent: sql7`${emailAccounts.totalSent} + 1`
      }).where(eq32(emailAccounts.id, emailAccount.id));
      if (isFirstContact) {
        await db.update(campaigns).set({
          leadsContacted: sql7`${campaigns.leadsContacted} + 1`
        }).where(eq32(campaigns.id, campaign.id));
      }
      const steps = stepsBySequence.get(currentStep.sequenceId) || [];
      const nextStep = getNextStep(steps, currentStep.stepOrder);
      if (nextStep) {
        const nextScheduledAt = calculateNextScheduledAt(
          nextStep.delayHours,
          campaign.timezone,
          campaign.sendStartTime,
          campaign.sendEndTime,
          campaign.sendOnWeekends
        );
        await db.update(campaignLeads).set({
          currentStepId: nextStep.id,
          currentStepOrder: nextStep.stepOrder,
          nextScheduledAt
        }).where(eq32(campaignLeads.id, campaignLead.id));
      } else {
        await db.update(campaignLeads).set({
          completedAt: /* @__PURE__ */ new Date(),
          nextScheduledAt: null
        }).where(eq32(campaignLeads.id, campaignLead.id));
      }
      result.sent++;
    } catch (error) {
      console.error(`Error processing campaign lead ${campaignLead.id}:`, error);
      result.errors++;
    }
  }
  return result;
}
async function resetDailyLimits() {
  await db.update(emailAccounts).set({ currentDailySent: 0 }).where(gt2(emailAccounts.currentDailySent, 0));
}
var init_processOutreachSequences = __esm({
  "src/server/jobs/processOutreachSequences.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_crypto();
    init_template_variables();
  }
});

// src/server/jobs/processReplies.ts
import Imap3 from "imap";
import { eq as eq33, and as and26, isNotNull as isNotNull4, sql as sql8 } from "drizzle-orm";
async function processReplies() {
  const result = {
    processed: 0,
    replies: 0,
    errors: 0
  };
  const accounts = await db.select({
    id: emailAccounts.id,
    email: emailAccounts.email,
    imapHost: emailAccounts.imapHost,
    imapPort: emailAccounts.imapPort,
    imapUsername: emailAccounts.imapUsername,
    imapPassword: emailAccounts.imapPassword,
    imapSecure: emailAccounts.imapSecure
  }).from(emailAccounts).where(
    and26(
      eq33(emailAccounts.status, "verified"),
      isNotNull4(emailAccounts.imapHost),
      isNotNull4(emailAccounts.imapUsername),
      isNotNull4(emailAccounts.imapPassword)
    )
  );
  for (const account of accounts) {
    try {
      const replyCount = await processAccountInbox(account);
      result.processed++;
      result.replies += replyCount;
    } catch (error) {
      result.errors++;
      console.error(`[processReplies] Error processing account ${account.email}:`, error);
    }
  }
  return result;
}
async function processAccountInbox(account) {
  return new Promise((resolve, reject) => {
    let replyCount = 0;
    let imap = null;
    const password = decryptSecret(account.imapPassword);
    imap = new Imap3({
      user: account.imapUsername,
      password,
      host: account.imapHost,
      port: account.imapPort || 993,
      tls: account.imapSecure !== false,
      tlsOptions: { rejectUnauthorized: false }
    });
    imap.once("error", (err) => {
      reject(err);
    });
    imap.once("end", () => {
      resolve(replyCount);
    });
    imap.once("ready", () => {
      imap.openBox("INBOX", false, (openErr, box) => {
        if (openErr) {
          imap.end();
          reject(openErr);
          return;
        }
        imap.search(["UNSEEN"], (searchErr, results) => {
          if (searchErr) {
            imap.end();
            reject(searchErr);
            return;
          }
          if (!results || results.length === 0) {
            imap.end();
            return;
          }
          const fetch2 = imap.fetch(results, {
            bodies: "HEADER.FIELDS (IN-REPLY-TO REFERENCES)",
            struct: false
          });
          const messages2 = [];
          fetch2.on("message", (msg, seqno) => {
            let inReplyTo = null;
            let references = null;
            let uid = 0;
            msg.on("body", (stream) => {
              let buffer = "";
              stream.on("data", (chunk) => {
                buffer += chunk.toString("utf8");
              });
              stream.once("end", () => {
                const inReplyToMatch = buffer.match(/^In-Reply-To:\s*(.+)$/im);
                const referencesMatch = buffer.match(/^References:\s*(.+)$/im);
                inReplyTo = inReplyToMatch ? inReplyToMatch[1].trim() : null;
                references = referencesMatch ? referencesMatch[1].trim() : null;
              });
            });
            msg.once("attributes", (attrs) => {
              uid = attrs.uid;
            });
            msg.once("end", () => {
              messages2.push({ uid, inReplyTo, references });
            });
          });
          fetch2.once("error", (fetchErr) => {
            imap.end();
            reject(fetchErr);
          });
          fetch2.once("end", async () => {
            for (const msg of messages2) {
              const messageId = msg.inReplyTo || extractFirstReference(msg.references);
              if (!messageId)
                continue;
              const outreachEmail = await findOutreachEmailByMessageId(messageId);
              if (!outreachEmail)
                continue;
              try {
                await markAsReplied(
                  outreachEmail.id,
                  outreachEmail.campaignLeadId,
                  outreachEmail.leadId,
                  outreachEmail.campaignId,
                  outreachEmail.emailAccountId
                );
                replyCount++;
              } catch (markErr) {
                console.error(`[processReplies] Error marking email as replied:`, markErr);
              }
            }
            imap.end();
          });
        });
      });
    });
    imap.connect();
  });
}
function extractFirstReference(references) {
  if (!references)
    return null;
  const refs = references.split(/\s+/).filter(Boolean);
  return refs.length > 0 ? refs[0] : null;
}
async function findOutreachEmailByMessageId(messageId) {
  const cleanMessageId = messageId.replace(/[<>]/g, "").trim();
  const result = await db.select({
    id: outreachEmails.id,
    campaignLeadId: outreachEmails.campaignLeadId,
    campaignId: outreachEmails.campaignId,
    emailAccountId: outreachEmails.emailAccountId,
    leadId: campaignLeads.leadId
  }).from(outreachEmails).innerJoin(campaignLeads, eq33(outreachEmails.campaignLeadId, campaignLeads.id)).where(eq33(outreachEmails.messageId, cleanMessageId)).limit(1);
  return result[0] || null;
}
async function markAsReplied(outreachEmailId, campaignLeadId, leadId, campaignId, accountId) {
  const now = /* @__PURE__ */ new Date();
  await Promise.all([
    db.update(outreachEmails).set({ repliedAt: now }).where(eq33(outreachEmails.id, outreachEmailId)),
    db.update(campaignLeads).set({
      status: "replied",
      lastRepliedAt: now,
      totalReplies: sql8`${campaignLeads.totalReplies} + 1`
    }).where(eq33(campaignLeads.id, campaignLeadId)),
    db.update(leads).set({
      status: sql8`CASE WHEN ${leads.status} IN ('replied', 'interested', 'not_interested') THEN ${leads.status} ELSE 'replied' END`,
      lastRepliedAt: now,
      totalReplies: sql8`${leads.totalReplies} + 1`
    }).where(eq33(leads.id, leadId)),
    db.update(campaigns).set({
      totalReplies: sql8`${campaigns.totalReplies} + 1`
    }).where(eq33(campaigns.id, campaignId)),
    db.update(emailAccounts).set({
      totalReplies: sql8`${emailAccounts.totalReplies} + 1`
    }).where(eq33(emailAccounts.id, accountId))
  ]);
}
var init_processReplies = __esm({
  "src/server/jobs/processReplies.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_crypto();
  }
});

// src/server/jobs/processBounces.ts
import { ImapFlow } from "imapflow";
import { simpleParser as simpleParser3 } from "mailparser";
import { eq as eq34, and as and27, isNotNull as isNotNull5, sql as sql9, desc as desc10 } from "drizzle-orm";
function isBounceEmail(from, subject) {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const isBounceSender = BOUNCE_SENDERS.some((sender) => fromLower.includes(sender));
  const isBounceSubject = BOUNCE_SUBJECTS.some((s) => subjectLower.includes(s));
  return isBounceSender || isBounceSubject;
}
function parseBounceMessage(message) {
  let recipientEmail = "";
  let originalMessageId;
  let bounceType = "hard";
  let reason = "Unknown bounce reason";
  let diagnosticCode;
  const textContent = (message.text || "").toLowerCase();
  const htmlContent = (message.html || "").toString().toLowerCase();
  const fullContent = `${textContent} ${htmlContent}`;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = fullContent.match(emailRegex) || [];
  for (const email of emails) {
    if (!email.includes("mailer-daemon") && !email.includes("postmaster") && !email.includes("noreply") && !email.includes("no-reply")) {
      recipientEmail = email;
      break;
    }
  }
  if (message.messageId) {
    originalMessageId = message.messageId;
  }
  const messageIdMatch = fullContent.match(/message-id:\s*<([^>]+)>/i);
  if (messageIdMatch) {
    originalMessageId = messageIdMatch[1];
  }
  const hardBounceIndicators = [
    "user unknown",
    "no such user",
    "address not found",
    "recipient rejected",
    "mailbox unavailable",
    "does not exist",
    "invalid recipient",
    "recipient invalid",
    "550 ",
    "551 ",
    "553 ",
    "permanent failure",
    "permanent error"
  ];
  const softBounceIndicators = [
    "mailbox full",
    "quota exceeded",
    "over quota",
    "temporarily unavailable",
    "try again later",
    "deferred",
    "greylisted",
    "rate limit",
    "too many",
    "450 ",
    "451 ",
    "452 ",
    "temporary failure",
    "transient failure"
  ];
  for (const indicator of hardBounceIndicators) {
    if (fullContent.includes(indicator)) {
      bounceType = "hard";
      reason = extractReason(fullContent, indicator);
      break;
    }
  }
  if (bounceType === "hard") {
    for (const indicator of softBounceIndicators) {
      if (fullContent.includes(indicator)) {
        bounceType = "soft";
        reason = extractReason(fullContent, indicator);
        break;
      }
    }
  }
  const codeMatch = fullContent.match(/(?:#|status:)\s*(\d\.\d\.\d)/i);
  if (codeMatch) {
    diagnosticCode = codeMatch[1];
  }
  const smtpCodeMatch = fullContent.match(/(\d{3})\s+[^\n]*/);
  if (smtpCodeMatch) {
    diagnosticCode = smtpCodeMatch[1];
  }
  return {
    recipientEmail,
    originalMessageId,
    bounceType,
    reason,
    diagnosticCode
  };
}
function extractReason(content, indicator) {
  const index = content.indexOf(indicator);
  if (index === -1)
    return indicator;
  const start = Math.max(0, index - 50);
  const end = Math.min(content.length, index + indicator.length + 100);
  const context = content.substring(start, end).trim();
  const sentenceMatch = context.match(/[^.!?]*[.!?]/);
  if (sentenceMatch) {
    return sentenceMatch[0].trim();
  }
  return indicator;
}
async function findOutreachEmailByRecipient(email, accountId) {
  const result = await db.query.outreachEmails.findFirst({
    where: and27(
      eq34(outreachEmails.emailAccountId, accountId),
      sql9`LOWER(${outreachEmails.campaignLeadId}) IN (
                SELECT cl.id FROM campaign_leads cl
                JOIN leads l ON cl.lead_id = l.id
                WHERE LOWER(l.email) = LOWER(${email})
            )`
    ),
    orderBy: [desc10(outreachEmails.sentAt)],
    with: {
      campaignLead: {
        with: {
          lead: true
        }
      }
    }
  });
  return result || null;
}
async function findOutreachEmailByMessageId2(messageId) {
  const cleanMessageId = messageId.replace(/[<>]/g, "");
  const result = await db.query.outreachEmails.findFirst({
    where: sql9`LOWER(${outreachEmails.messageId}) LIKE LOWER(${"%" + cleanMessageId + "%"})`,
    orderBy: [desc10(outreachEmails.sentAt)]
  });
  return result || null;
}
async function markAsBounced(outreachEmailId, campaignLeadId, leadId, campaignId, accountId, reason) {
  const now = /* @__PURE__ */ new Date();
  await db.update(outreachEmails).set({
    status: "bounced",
    bouncedAt: now,
    bounceReason: reason,
    updatedAt: now
  }).where(eq34(outreachEmails.id, outreachEmailId));
  await db.update(campaignLeads).set({
    status: "bounced",
    nextScheduledAt: null,
    updatedAt: now
  }).where(eq34(campaignLeads.id, campaignLeadId));
  await db.update(leads).set({
    status: "bounced",
    updatedAt: now
  }).where(eq34(leads.id, leadId));
  await db.update(campaigns).set({
    totalBounces: sql9`${campaigns.totalBounces} + 1`,
    updatedAt: now
  }).where(eq34(campaigns.id, campaignId));
  await db.update(emailAccounts).set({
    totalBounces: sql9`${emailAccounts.totalBounces} + 1`,
    updatedAt: now
  }).where(eq34(emailAccounts.id, accountId));
}
async function processBounces() {
  const result = { processed: 0, bounces: 0, errors: 0 };
  const accounts = await db.query.emailAccounts.findMany({
    where: and27(
      eq34(emailAccounts.status, "verified"),
      isNotNull5(emailAccounts.imapHost),
      isNotNull5(emailAccounts.imapUsername),
      isNotNull5(emailAccounts.imapPassword)
    )
  });
  for (const account of accounts) {
    let client = null;
    try {
      const password = decryptSecret(account.imapPassword);
      client = new ImapFlow({
        host: account.imapHost,
        port: account.imapPort || 993,
        secure: account.imapSecure !== false,
        auth: {
          user: account.imapUsername,
          pass: password
        },
        logger: false
      });
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");
      try {
        const messages2 = await client.search({
          or: [
            { from: "mailer-daemon" },
            { from: "postmaster" },
            { from: "bounce@" },
            { from: "bounces@" }
          ]
        }, { uid: true });
        if (!messages2)
          return { processed: 0, bounces: 0, errors: 0 };
        for (const uid of messages2) {
          try {
            const message = await client.fetchOne(uid, { source: true });
            if (!message || typeof message === "boolean" || !("source" in message))
              continue;
            const parsed = await simpleParser3(message.source);
            if (!isBounceEmail(parsed.from?.text || "", parsed.subject || "")) {
              continue;
            }
            result.processed++;
            const bounceInfo = parseBounceMessage(parsed);
            if (!bounceInfo.recipientEmail) {
              console.warn(`Could not extract recipient email from bounce message`);
              continue;
            }
            let outreachEmail = bounceInfo.originalMessageId ? await findOutreachEmailByMessageId2(bounceInfo.originalMessageId) : null;
            if (!outreachEmail) {
              outreachEmail = await findOutreachEmailByRecipient(
                bounceInfo.recipientEmail,
                account.id
              );
            }
            if (!outreachEmail) {
              console.warn(`No outreach email found for bounce: ${bounceInfo.recipientEmail}`);
              continue;
            }
            const campaignLead = await db.query.campaignLeads.findFirst({
              where: eq34(campaignLeads.id, outreachEmail.campaignLeadId),
              with: { lead: true }
            });
            if (!campaignLead?.lead) {
              console.warn(`Campaign lead not found for outreach email: ${outreachEmail.id}`);
              continue;
            }
            if (campaignLead.status === "bounced") {
              continue;
            }
            const fullReason = bounceInfo.diagnosticCode ? `${bounceInfo.reason} (${bounceInfo.diagnosticCode})` : bounceInfo.reason;
            await markAsBounced(
              outreachEmail.id,
              campaignLead.id,
              campaignLead.lead.id,
              outreachEmail.campaignId,
              account.id,
              fullReason
            );
            result.bounces++;
            try {
              await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
            } catch {
            }
          } catch (error) {
            console.error(`Error processing bounce message ${uid}:`, error);
            result.errors++;
          }
        }
      } finally {
        lock.release();
      }
    } catch (error) {
      console.error(`Error processing bounces for account ${account.email}:`, error);
      result.errors++;
    } finally {
      if (client) {
        try {
          await client.logout();
        } catch {
        }
      }
    }
  }
  await db.update(emailAccounts).set({ lastSyncAt: /* @__PURE__ */ new Date() }).where(isNotNull5(emailAccounts.imapHost));
  return result;
}
var BOUNCE_SENDERS, BOUNCE_SUBJECTS;
var init_processBounces = __esm({
  "src/server/jobs/processBounces.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_crypto();
    BOUNCE_SENDERS = [
      "mailer-daemon",
      "postmaster",
      "bounce@",
      "bounces@",
      "noreply@",
      "no-reply@"
    ];
    BOUNCE_SUBJECTS = [
      "undeliverable",
      "returned mail",
      "returned message",
      "bounce",
      "failure",
      "delivery failure",
      "delivery status",
      "delivery report",
      "mail delivery failed",
      "message bounced",
      "unable to deliver"
    ];
  }
});

// src/server/jobs/index.ts
var jobs_exports = {};
__export(jobs_exports, {
  startJobs: () => startJobs
});
import cron from "node-cron";
function startJobs() {
  console.log("[jobs] Starting background job scheduler...");
  cron.schedule("* * * * *", () => {
    processQueue().catch((err) => console.error("[jobs] processQueue failed:", err));
  });
  cron.schedule("*/5 * * * *", () => {
    processHeldMessages().catch((err) => console.error("[jobs] processHeld failed:", err));
  });
  cron.schedule("0 3 * * *", () => {
    cleanupOldMessages().catch((err) => console.error("[jobs] cleanup failed:", err));
  });
  cron.schedule("*/5 * * * *", () => {
    processOutreachSequences().catch((err) => console.error("[jobs] processOutreachSequences failed:", err));
  });
  cron.schedule("0 0 * * *", () => {
    resetDailyLimits().catch((err) => console.error("[jobs] resetDailyLimits failed:", err));
  });
  cron.schedule("*/15 * * * *", () => {
    processReplies().catch((err) => console.error("[jobs] processReplies failed:", err));
  });
  cron.schedule("*/30 * * * *", () => {
    processBounces().catch((err) => console.error("[jobs] processBounces failed:", err));
  });
  console.log("[jobs] Scheduled: processQueue (1min), processHeld (5min), cleanup (daily 3am), outreach (5min), resetLimits (daily midnight), replies (15min), bounces (30min)");
}
var init_jobs = __esm({
  "src/server/jobs/index.ts"() {
    "use strict";
    init_processQueue();
    init_processHeld();
    init_cleanupMessages();
    init_processOutreachSequences();
    init_processReplies();
    init_processBounces();
  }
});

// src/server/index.ts
init_db();
init_schema();
import "dotenv/config";
import express from "express";
import cors from "cors";
import { join } from "path";
import { existsSync } from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createClient as createClient4 } from "@supabase/supabase-js";
import { eq as eq35 } from "drizzle-orm";

// src/server/routes/auth.ts
init_db();
init_schema();
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { eq as eq2 } from "drizzle-orm";

// src/server/lib/native-mail.ts
init_db();
init_schema();
init_crypto();
import bcrypt from "bcrypt";
import { eq, and } from "drizzle-orm";
var BCRYPT_ROUNDS = 12;
async function authenticateNativeUser(email, password) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase())
  });
  if (!user || !user.passwordHash || user.isAdmin)
    return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
async function createUserMailbox(userId, email) {
  const existing = await db.query.mailboxes.findFirst({
    where: and(
      eq(mailboxes.userId, userId),
      eq(mailboxes.isNative, true)
    )
  });
  if (existing)
    return existing.id;
  const mailHost = process.env.MAIL_HOST || "localhost";
  const smtpPort = parseInt(process.env.SMTP_SUBMISSION_PORT || "2587");
  const imapPort = parseInt(process.env.IMAP_PORT || "2993");
  const placeholder = encryptSecret("__NATIVE__");
  const [companion] = await db.insert(mailboxes).values({
    userId,
    email: email.toLowerCase(),
    smtpHost: mailHost,
    smtpPort,
    smtpUsername: email.toLowerCase(),
    smtpPasswordEncrypted: placeholder,
    smtpSecure: false,
    imapHost: mailHost,
    imapPort,
    imapUsername: email.toLowerCase(),
    imapPasswordEncrypted: placeholder,
    imapSecure: false,
    isDefault: true,
    isNative: true
  }).returning();
  await db.insert(mailFolders).values([
    { mailboxId: companion.id, remoteId: "INBOX", name: "Inbox", type: "inbox" },
    { mailboxId: companion.id, remoteId: "Sent", name: "Sent", type: "sent" },
    { mailboxId: companion.id, remoteId: "Drafts", name: "Drafts", type: "drafts" },
    { mailboxId: companion.id, remoteId: "Trash", name: "Trash", type: "trash" },
    { mailboxId: companion.id, remoteId: "Spam", name: "Spam", type: "spam" }
  ]);
  return companion.id;
}
async function deleteUserMailbox(userId) {
  const companion = await db.query.mailboxes.findFirst({
    where: and(
      eq(mailboxes.userId, userId),
      eq(mailboxes.isNative, true)
    )
  });
  if (!companion)
    return;
  await db.delete(mailMessages).where(eq(mailMessages.mailboxId, companion.id));
  await db.delete(mailFolders).where(eq(mailFolders.mailboxId, companion.id));
  await db.delete(mailboxes).where(eq(mailboxes.id, companion.id));
}
async function validateEmailDomainForOrg(email, organizationId) {
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain)
    return false;
  const verifiedDomain = await db.query.domains.findFirst({
    where: and(
      eq(domains.organizationId, organizationId),
      eq(domains.name, emailDomain),
      eq(domains.verificationStatus, "verified")
    )
  });
  return !!verifiedDomain;
}
async function findLocalUser(email) {
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain)
    return null;
  const verifiedDomain = await db.query.domains.findFirst({
    where: and(
      eq(domains.name, emailDomain),
      eq(domains.verificationStatus, "verified")
    )
  });
  if (!verifiedDomain)
    return null;
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase())
  });
  if (!user || user.isAdmin)
    return null;
  return { userId: user.id };
}

// src/server/routes/auth.ts
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
    const { error, data: updatedData } = await userClient.auth.updateUser({ password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    if (updatedData?.user) {
      const userId = updatedData.user.id;
      const dbUser = await db.query.users.findFirst({ where: eq2(users.id, userId) });
      if (dbUser && !dbUser.isAdmin) {
        const newHash = await hashPassword(password);
        await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(users.id, userId));
        await createUserMailbox(userId, dbUser.email);
      }
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
init_admin();
import { Router as Router2 } from "express";
import { z as z2 } from "zod";
import { createClient as createClient2 } from "@supabase/supabase-js";
import { eq as eq4, and as and2 } from "drizzle-orm";
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
    where: eq4(users.id, userId),
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
      where: eq4(users.id, userId),
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
    }).where(eq4(users.id, userId)).returning();
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
      where: eq4(organizationUsers.userId, userId),
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
      where: eq4(users.id, requestingUserId)
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
        where: eq4(organizations.id, userData.organizationId),
        columns: {
          id: true
        }
      });
      if (!targetOrganization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      if (!userData.isAdmin) {
        const domainValid = await validateEmailDomainForOrg(userData.email, userData.organizationId);
        if (!domainValid) {
          return res.status(400).json({
            error: "User email domain must match a verified domain of the organization. Verify the domain first, then create the user."
          });
        }
      }
    }
    const existingUser = await db.query.users.findFirst({
      where: eq4(users.email, userData.email)
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
    let passwordHash = null;
    if (!userData.isAdmin && userData.password && !userData.sendInvite) {
      passwordHash = await hashPassword(userData.password);
    }
    const [newUser] = await db.insert(users).values({
      id: authData.user.id,
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      isAdmin: userData.isAdmin,
      emailVerified: true,
      passwordHash
    }).returning();
    if (userData.organizationId) {
      await db.insert(organizationUsers).values({
        organizationId: userData.organizationId,
        userId: newUser.id,
        role: userData.organizationRole
      });
      if (!userData.isAdmin && passwordHash) {
        await createUserMailbox(newUser.id, userData.email);
      }
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
      where: eq4(users.id, requestingUserId)
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
      orderBy: (usersTable, { desc: desc11 }) => [desc11(usersTable.createdAt)]
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
      where: eq4(users.id, requestingUserId)
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
    }).where(eq4(users.id, targetUserId)).returning();
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
      where: eq4(users.id, requestingUserId)
    });
    if (!requestingUser?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const targetUser = await db.query.users.findFirst({
      where: eq4(users.id, targetUserId)
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
router2.put("/:id/password", async (req, res) => {
  try {
    const requestingUserId = req.headers["x-user-id"];
    const targetUserId = req.params.id;
    if (!requestingUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const isPlatAdmin = await isPlatformAdmin(requestingUserId);
    if (!isPlatAdmin) {
      const sharedOrg = await db.query.organizationUsers.findFirst({
        where: and2(
          eq4(organizationUsers.userId, requestingUserId),
          eq4(organizationUsers.role, "admin")
        )
      });
      if (!sharedOrg) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const targetInOrg = await db.query.organizationUsers.findFirst({
        where: and2(
          eq4(organizationUsers.userId, targetUserId),
          eq4(organizationUsers.organizationId, sharedOrg.organizationId)
        )
      });
      if (!targetInOrg) {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const { password } = z2.object({
      password: z2.string().min(6, "Password must be at least 6 characters")
    }).parse(req.body);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, { password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    const targetUser = await db.query.users.findFirst({ where: eq4(users.id, targetUserId) });
    if (targetUser && !targetUser.isAdmin) {
      const newHash = await hashPassword(password);
      await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(users.id, targetUserId));
      await createUserMailbox(targetUserId, targetUser.email);
    }
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating password:", error);
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
      where: eq4(users.id, requestingUserId)
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
    await deleteUserMailbox(targetUserId);
    await db.delete(users).where(eq4(users.id, targetUserId));
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/me/change-password", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId)
      return res.status(401).json({ error: "Unauthorized" });
    const { currentPassword, newPassword } = z2.object({
      currentPassword: z2.string(),
      newPassword: z2.string().min(8, "Password must be at least 8 characters")
    }).parse(req.body);
    const user = await db.query.users.findFirst({ where: eq4(users.id, userId) });
    if (!user)
      return res.status(404).json({ error: "User not found" });
    if (user.isAdmin)
      return res.status(403).json({ error: "Platform admins cannot use this endpoint" });
    if (!user.passwordHash)
      return res.status(400).json({ error: "No password set on this account" });
    const bcrypt2 = await import("bcrypt");
    const valid = await bcrypt2.default.compare(currentPassword, user.passwordHash);
    if (!valid)
      return res.status(400).json({ error: "Current password is incorrect" });
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword });
    if (error)
      return res.status(400).json({ error: error.message });
    const newHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash: newHash, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(users.id, userId));
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var users_default = router2;

// src/server/routes/organizations.ts
init_db();
init_schema();
import { Router as Router3 } from "express";
import { z as z3 } from "zod";
import { eq as eq6, and as and3, isNotNull, sql, gte, desc } from "drizzle-orm";

// src/server/lib/cascade.ts
init_db();
init_schema();
import { eq as eq5 } from "drizzle-orm";
async function deleteOrganizationCascade(organizationId) {
  await db.delete(deliveries).where(eq5(deliveries.organizationId, organizationId));
  await db.delete(messages).where(eq5(messages.organizationId, organizationId));
  const orgWebhooks = await db.select({ id: webhooks.id }).from(webhooks).where(eq5(webhooks.organizationId, organizationId));
  for (const wh of orgWebhooks) {
    await db.delete(webhookRequests).where(eq5(webhookRequests.webhookId, wh.id));
  }
  await db.delete(webhooks).where(eq5(webhooks.organizationId, organizationId));
  await db.delete(credentials).where(eq5(credentials.organizationId, organizationId));
  await db.delete(routes).where(eq5(routes.organizationId, organizationId));
  await db.delete(smtpEndpoints).where(eq5(smtpEndpoints.organizationId, organizationId));
  await db.delete(httpEndpoints).where(eq5(httpEndpoints.organizationId, organizationId));
  await db.delete(addressEndpoints).where(eq5(addressEndpoints.organizationId, organizationId));
  await db.delete(domains).where(eq5(domains.organizationId, organizationId));
  await db.delete(templates).where(eq5(templates.organizationId, organizationId));
  await db.delete(trackDomains).where(eq5(trackDomains.organizationId, organizationId));
  await db.delete(suppressions).where(eq5(suppressions.organizationId, organizationId));
  await db.delete(statistics).where(eq5(statistics.organizationId, organizationId));
  const memberships = await db.query.organizationUsers.findMany({
    where: eq5(organizationUsers.organizationId, organizationId),
    columns: { userId: true }
  });
  for (const { userId } of memberships) {
    await deleteUserMailbox(userId);
    await db.update(users).set({ passwordHash: null }).where(eq5(users.id, userId));
  }
  await db.delete(organizationUsers).where(eq5(organizationUsers.organizationId, organizationId));
  await db.delete(organizations).where(eq5(organizations.id, organizationId));
}

// src/server/routes/organizations.ts
init_admin();
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
      const allOrgs = await db.query.organizations.findMany();
      return res.json({ organizations: allOrgs });
    }
    const memberships = await db.query.organizationUsers.findMany({
      where: eq6(organizationUsers.userId, userId),
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
        where: and3(
          eq6(organizationUsers.organizationId, organizationId),
          eq6(organizationUsers.userId, userId)
        )
      });
      if (!membership2) {
        return res.status(404).json({ error: "Organization not found" });
      }
    }
    const organization = await db.query.organizations.findFirst({
      where: eq6(organizations.id, organizationId),
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
        }
      }
    });
    const membership = isAdmin ? null : await db.query.organizationUsers.findFirst({
      where: and3(
        eq6(organizationUsers.organizationId, organizationId),
        eq6(organizationUsers.userId, userId)
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
      where: eq6(organizations.slug, slug)
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
    res.status(201).json({ organization });
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
        where: and3(
          eq6(organizationUsers.organizationId, organizationId),
          eq6(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const updates = updateOrganizationSchema.parse(req.body);
    const [updatedOrg] = await db.update(organizations).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(organizations.id, organizationId)).returning();
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
      where: eq6(organizations.id, organizationId)
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
        where: and3(
          eq6(organizationUsers.organizationId, organizationId),
          eq6(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const { email, role } = addMemberSchema.parse(req.body);
    const userToAdd = await db.query.users.findFirst({
      where: eq6(users.email, email)
    });
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!userToAdd.isAdmin) {
      const domainValid = await validateEmailDomainForOrg(userToAdd.email, organizationId);
      if (!domainValid) {
        return res.status(400).json({
          error: "User email domain does not match any verified domain of this organization."
        });
      }
    }
    const existingMembership = await db.query.organizationUsers.findFirst({
      where: and3(
        eq6(organizationUsers.organizationId, organizationId),
        eq6(organizationUsers.userId, userToAdd.id)
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
    if (!userToAdd.isAdmin && userToAdd.passwordHash) {
      await createUserMailbox(userToAdd.id, userToAdd.email);
    }
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
        where: and3(
          eq6(organizationUsers.organizationId, organizationId),
          eq6(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const organization = await db.query.organizations.findFirst({
      where: eq6(organizations.id, organizationId)
    });
    if (organization?.owner_id === targetUserId) {
      return res.status(400).json({ error: "Cannot remove the owner" });
    }
    await db.delete(organizationUsers).where(
      and3(
        eq6(organizationUsers.organizationId, organizationId),
        eq6(organizationUsers.userId, targetUserId)
      )
    );
    await deleteUserMailbox(targetUserId);
    await db.update(users).set({ passwordHash: null, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(users.id, targetUserId));
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
        where: and3(
          eq6(organizationUsers.organizationId, organizationId),
          eq6(organizationUsers.userId, userId)
        )
      });
      if (!membership || membership.role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }
    }
    const organization = await db.query.organizations.findFirst({
      where: eq6(organizations.id, organizationId)
    });
    if (organization?.owner_id === targetUserId) {
      return res.status(400).json({ error: "Cannot change the owner's role" });
    }
    const [updatedMembership] = await db.update(organizationUsers).set({ role }).where(
      and3(
        eq6(organizationUsers.organizationId, organizationId),
        eq6(organizationUsers.userId, targetUserId)
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
router3.get("/:id/statistics", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.params.id;
    const days = parseInt(req.query.days) || 30;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const isAdmin = await isPlatformAdmin(userId);
    if (!isAdmin) {
      const membership = await db.query.organizationUsers.findFirst({
        where: and3(
          eq6(organizationUsers.organizationId, organizationId),
          eq6(organizationUsers.userId, userId)
        )
      });
      if (!membership) {
        return res.status(404).json({ error: "Organization not found" });
      }
    }
    const organization = await db.query.organizations.findFirst({
      where: eq6(organizations.id, organizationId)
    });
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    const since = /* @__PURE__ */ new Date();
    since.setDate(since.getDate() - days);
    const statusCounts = await db.select({
      status: messages.status,
      count: sql`count(*)`
    }).from(messages).where(eq6(messages.organizationId, organizationId)).groupBy(messages.status);
    const countMap = {};
    for (const row of statusCounts) {
      countMap[row.status] = Number(row.count);
    }
    const sent = (countMap["sent"] || 0) + (countMap["delivered"] || 0);
    const delivered = countMap["delivered"] || 0;
    const bounced = countMap["bounced"] || 0;
    const held = countMap["held"] || 0;
    const pending = (countMap["pending"] || 0) + (countMap["queued"] || 0);
    const [openedRow] = await db.select({ count: sql`count(*)` }).from(messages).where(and3(eq6(messages.organizationId, organizationId), isNotNull(messages.openedAt)));
    const opened = Number(openedRow?.count || 0);
    const [clickRow] = await db.select({ total: sql`coalesce(sum(links_clicked), 0)` }).from(statistics).where(eq6(statistics.organizationId, organizationId));
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
    }).from(statistics).where(and3(eq6(statistics.organizationId, organizationId), gte(statistics.date, since))).orderBy(statistics.date);
    const dailyMap = /* @__PURE__ */ new Map();
    for (const row of daily) {
      const dateKey = row.date.toISOString().split("T")[0];
      const existing = dailyMap.get(dateKey) || { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, held: 0 };
      dailyMap.set(dateKey, {
        sent: existing.sent + (row.sent || 0),
        delivered: existing.delivered + (row.delivered || 0),
        opened: existing.opened + (row.opened || 0),
        clicked: existing.clicked + (row.clicked || 0),
        bounced: existing.bounced + (row.bounced || 0),
        held: existing.held + (row.held || 0)
      });
    }
    const aggregatedDaily = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => a.date.localeCompare(b.date));
    const recentMessages = await db.query.messages.findMany({
      where: eq6(messages.organizationId, organizationId),
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
      daily: aggregatedDaily,
      recentMessages
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var organizations_default = router3;

// src/server/routes/domains.ts
init_db();
init_schema();
init_admin();
import { Router as Router4 } from "express";
import { z as z4 } from "zod";
import { promises as dnsPromises } from "node:dns";
import { eq as eq7, and as and4 } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
var resolver = new dnsPromises.Resolver();
resolver.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(","));
var MAIL_HOST = process.env.MAIL_HOST || "mx.skaleclub.com";
async function resolveTxt(hostname) {
  try {
    const records = await resolver.resolveTxt(hostname);
    return records.map((chunks) => chunks.join(""));
  } catch {
    return [];
  }
}
async function resolveMx(hostname) {
  try {
    return await resolver.resolveMx(hostname);
  } catch {
    return [];
  }
}
async function resolveCname(hostname) {
  try {
    return await resolver.resolveCname(hostname);
  } catch {
    return [];
  }
}
var router4 = Router4();
var createDomainSchema = z4.object({
  organizationId: z4.string().uuid(),
  name: z4.string().min(1).max(255),
  verificationMethod: z4.enum(["dns", "email"]).default("dns")
});
async function checkDomainAccess(userId, organizationId) {
  const organization = await db.query.organizations.findFirst({
    where: eq7(organizations.id, organizationId)
  });
  if (!organization)
    return { organization: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { organization, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and4(
      eq7(organizationUsers.organizationId, organizationId),
      eq7(organizationUsers.userId, userId)
    )
  });
  return { organization, membership };
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
    const { organization, membership } = await checkDomainAccess(userId, organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const domainsList = await db.query.domains.findMany({
      where: eq7(domains.organizationId, organizationId)
    });
    res.json({ domains: domainsList });
  } catch (error) {
    console.error("Error fetching domains:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const domainId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const domain = await db.query.domains.findFirst({
      where: eq7(domains.id, domainId)
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }
    const { organization, membership } = await checkDomainAccess(userId, domain.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ domain });
  } catch (error) {
    console.error("Error fetching domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createDomainSchema.parse(req.body);
    const { organization, membership } = await checkDomainAccess(userId, data.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can add domains" });
    }
    const existingDomain = await db.query.domains.findFirst({
      where: and4(
        eq7(domains.organizationId, data.organizationId),
        eq7(domains.name, data.name)
      )
    });
    if (existingDomain) {
      return res.status(400).json({ error: "Domain already exists" });
    }
    const [domain] = await db.insert(domains).values({
      organizationId: data.organizationId,
      name: data.name,
      verificationMethod: data.verificationMethod,
      verificationToken: uuidv4()
    }).returning();
    res.status(201).json({ domain });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.post("/:id/verify", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const domainId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const domain = await db.query.domains.findFirst({
      where: eq7(domains.id, domainId)
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }
    const { organization, membership } = await checkDomainAccess(userId, domain.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can verify domains" });
    }
    const domainName = domain.name;
    const expectedToken = `skaleclub-verification:${domain.verificationToken}`;
    const dkimSelector = domain.dkimSelector || "skaleclub";
    const [rootTxt, dkimTxt, dmarcTxt, mxRecords, returnPathCname] = await Promise.all([
      resolveTxt(domainName),
      resolveTxt(`${dkimSelector}._domainkey.${domainName}`),
      resolveTxt(`_dmarc.${domainName}`),
      resolveMx(domainName),
      resolveCname(`rp.${domainName}`)
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
    const mxFound = mxRecords.some((r) => r.exchange.toLowerCase() === MAIL_HOST.toLowerCase());
    const mxStatus = mxFound ? "verified" : "failed";
    const mxError = mxFound ? null : `MX record not found or does not point to ${MAIL_HOST}`;
    const returnPathTarget = "rp.skaleclub.com";
    const returnPathFound = returnPathCname.some((r) => r.toLowerCase() === returnPathTarget);
    const returnPathStatus = returnPathFound ? "verified" : "failed";
    const returnPathError = returnPathFound ? null : `Return-Path CNAME not found (expected rp.${domainName} \u2192 ${returnPathTarget})`;
    const allVerified = verificationFound && spfFound && dkimFound && dmarcFound && mxFound && returnPathFound;
    const [updatedDomain] = await db.update(domains).set({
      verificationStatus,
      verifiedAt: allVerified ? /* @__PURE__ */ new Date() : null,
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
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq7(domains.id, domainId)).returning();
    res.json({
      domain: updatedDomain,
      dnsResults: {
        verification: { found: verificationFound },
        spf: { found: spfFound, error: spfError },
        dkim: { found: dkimFound, error: dkimError },
        dmarc: { found: dmarcFound, error: dmarcError },
        mx: { found: mxFound, error: mxError },
        returnPath: { found: returnPathFound, error: returnPathError }
      }
    });
  } catch (error) {
    console.error("Error verifying domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router4.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const domainId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const domain = await db.query.domains.findFirst({
      where: eq7(domains.id, domainId)
    });
    if (!domain) {
      return res.status(404).json({ error: "Domain not found" });
    }
    const { organization, membership } = await checkDomainAccess(userId, domain.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete domains" });
    }
    await db.delete(domains).where(eq7(domains.id, domainId));
    res.json({ message: "Domain deleted successfully" });
  } catch (error) {
    console.error("Error deleting domain:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var domains_default = router4;

// src/server/routes/messages.ts
init_db();
init_schema();
init_admin();
init_tracking();
import { Router as Router5 } from "express";
import { z as z5 } from "zod";
import { eq as eq10, and as and7, desc as desc2, like, sql as sql3 } from "drizzle-orm";
import { v4 as uuidv42 } from "uuid";

// src/server/lib/outlook.ts
init_db();
init_schema();
init_crypto();
import crypto2 from "crypto";
import { and as and6, asc, eq as eq9 } from "drizzle-orm";
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
    organizationId: mailbox.organizationId,
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
function createOutlookOauthState(userId, organizationId) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    organizationId,
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
async function resolveOutlookMailboxForServer(organizationId, mailboxId) {
  if (mailboxId) {
    return db.query.outlookMailboxes.findFirst({
      where: and6(
        eq9(outlookMailboxes.id, mailboxId),
        eq9(outlookMailboxes.organizationId, organizationId)
      )
    });
  }
  return db.query.outlookMailboxes.findFirst({
    where: and6(
      eq9(outlookMailboxes.organizationId, organizationId),
      eq9(outlookMailboxes.status, "active")
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
  const [updated] = await db.update(outlookMailboxes).set(updates).where(eq9(outlookMailboxes.id, mailbox.id)).returning();
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
    }).where(eq9(outlookMailboxes.id, mailbox.id));
    throw error;
  }
}
async function sendMessageWithOutlook(input) {
  const mailbox = await resolveOutlookMailboxForServer(input.organizationId, input.mailboxId);
  if (!mailbox) {
    throw new Error("No active Outlook mailbox found for this organization");
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
  }).where(eq9(outlookMailboxes.id, activeMailbox.id));
  return sanitizeOutlookMailbox(activeMailbox);
}

// src/server/routes/messages.ts
var router5 = Router5();
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var sendMessageSchema = z5.object({
  organizationId: z5.string().uuid(),
  outlookMailboxId: z5.string().uuid().optional(),
  from: z5.string().email(),
  to: z5.array(z5.string().email()).min(1),
  cc: z5.array(z5.string().email()).optional(),
  bcc: z5.array(z5.string().email()).optional(),
  subject: z5.string().min(1).max(998),
  plainBody: z5.string().max(5e6).optional(),
  htmlBody: z5.string().max(5e6).optional(),
  headers: z5.record(z5.string()).optional(),
  attachments: z5.array(z5.object({
    filename: z5.string(),
    content: z5.string(),
    contentType: z5.string()
  })).optional(),
  templateId: z5.string().uuid().optional(),
  templateVariables: z5.record(z5.string()).optional()
});
var searchMessagesSchema = z5.object({
  query: z5.string().optional(),
  status: z5.enum(["pending", "queued", "sent", "delivered", "bounced", "held", "failed"]).optional(),
  direction: z5.enum(["incoming", "outgoing"]).optional(),
  from: z5.string().optional(),
  to: z5.string().optional(),
  page: z5.coerce.number().int().min(1).default(1),
  limit: z5.coerce.number().int().min(1).max(100).default(50)
});
async function checkMessageAccess(userId, organizationId) {
  const organization = await db.query.organizations.findFirst({
    where: eq10(organizations.id, organizationId)
  });
  if (!organization)
    return { organization: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { organization, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and7(
      eq10(organizationUsers.organizationId, organizationId),
      eq10(organizationUsers.userId, userId)
    )
  });
  return { organization, membership };
}
router5.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID required" });
    }
    const { organization, membership } = await checkMessageAccess(userId, organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const { query, status, direction, from, to, page, limit } = searchMessagesSchema.parse(req.query);
    const offset = (page - 1) * limit;
    const conditions = [eq10(messages.organizationId, organizationId)];
    if (status) {
      conditions.push(eq10(messages.status, status));
    }
    if (direction) {
      conditions.push(eq10(messages.direction, direction));
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
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq10(messages.id, messageId),
      with: {
        deliveries: true
      }
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { organization, membership } = await checkMessageAccess(userId, message.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ message });
  } catch (error) {
    console.error("Error fetching message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = sendMessageSchema.parse(req.body);
    const { organization, membership } = await checkMessageAccess(userId, data.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const sendMode = data.outlookMailboxId ? "outlook" : "smtp";
    const trackOpens = true;
    const trackClicks = true;
    const privacyMode = false;
    let subject = data.subject;
    let plainBody = data.plainBody;
    let htmlBody = data.htmlBody;
    if (data.templateId) {
      const template = await db.query.templates.findFirst({
        where: eq10(templates.id, data.templateId)
      });
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      if (template.organizationId !== data.organizationId) {
        return res.status(403).json({ error: "Template does not belong to this organization" });
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
    const outlookMailbox = sendMode === "outlook" ? await resolveOutlookMailboxForServer(data.organizationId, data.outlookMailboxId) : null;
    if (sendMode === "outlook") {
      if (!outlookMailbox) {
        return res.status(400).json({ error: "No active Outlook mailbox configured for this organization" });
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
    if (htmlBody && !privacyMode && (trackOpens || trackClicks)) {
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 9001}`;
      htmlBody = injectTracking(htmlBody, messageToken, baseUrl, trackOpens, trackClicks);
    }
    const [message] = await db.insert(messages).values({
      organizationId: data.organizationId,
      messageId: `<${uuidv42()}@mail.local>`,
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
        organizationId: data.organizationId,
        rcptTo: recipient,
        status: "pending"
      });
    }
    if (sendMode === "outlook" && outlookMailbox) {
      try {
        await sendMessageWithOutlook({
          organizationId: data.organizationId,
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
        }).where(eq10(messages.id, message.id));
        await db.update(deliveries).set({
          status: "sent",
          sentAt
        }).where(eq10(deliveries.messageId, message.id));
        message.status = "sent";
        message.sentAt = sentAt;
      } catch (error) {
        const details = error instanceof Error ? error.message : "Outlook send failed";
        const failedAt = /* @__PURE__ */ new Date();
        await db.update(messages).set({
          status: "failed",
          updatedAt: failedAt
        }).where(eq10(messages.id, message.id));
        await db.update(deliveries).set({
          status: "failed",
          details
        }).where(eq10(deliveries.messageId, message.id));
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
      incrementStat(data.organizationId, "messagesSent"),
      fireWebhooks(data.organizationId, "message_sent", {
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
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.post("/:id/release", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq10(messages.id, messageId)
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { organization, membership } = await checkMessageAccess(userId, message.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
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
    }).where(eq10(messages.id, messageId)).returning();
    res.json({ message: updatedMessage });
  } catch (error) {
    console.error("Error releasing message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq10(messages.id, messageId)
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { organization, membership } = await checkMessageAccess(userId, message.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete messages" });
    }
    await db.delete(deliveries).where(eq10(deliveries.messageId, messageId));
    await db.delete(messages).where(eq10(messages.id, messageId));
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router5.get("/:id/attachments", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const messageId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const message = await db.query.messages.findFirst({
      where: eq10(messages.id, messageId),
      columns: {
        id: true,
        organizationId: true,
        attachments: true
      }
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    const { organization, membership } = await checkMessageAccess(userId, message.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ attachments: message.attachments || [] });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var messages_default = router5;

// src/server/routes/webhooks.ts
init_db();
init_schema();
init_admin();
import { Router as Router6 } from "express";
import { z as z6 } from "zod";
import { eq as eq11, and as and8, desc as desc3 } from "drizzle-orm";
var router6 = Router6();
var createWebhookSchema = z6.object({
  organizationId: z6.string().uuid(),
  name: z6.string().min(1).max(100),
  url: z6.string().url(),
  secret: z6.string().optional(),
  active: z6.boolean().default(true),
  events: z6.array(z6.enum([
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
var updateWebhookSchema = z6.object({
  name: z6.string().min(1).max(100).optional(),
  url: z6.string().url().optional(),
  secret: z6.string().optional(),
  active: z6.boolean().optional(),
  events: z6.array(z6.string()).min(1).optional()
});
async function checkWebhookAccess(userId, organizationId) {
  const organization = await db.query.organizations.findFirst({
    where: eq11(organizations.id, organizationId)
  });
  if (!organization)
    return { organization: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { organization, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and8(
      eq11(organizationUsers.organizationId, organization.id),
      eq11(organizationUsers.userId, userId)
    )
  });
  return { organization, membership };
}
router6.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID required" });
    }
    const { organization, membership } = await checkWebhookAccess(userId, organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const webhooksList = await db.query.webhooks.findMany({
      where: eq11(webhooks.organizationId, organizationId),
      orderBy: [desc3(webhooks.createdAt)]
    });
    res.json({ webhooks: webhooksList });
  } catch (error) {
    console.error("Error fetching webhooks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq11(webhooks.id, webhookId),
      with: {
        organization: true
      }
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { organization, membership } = await checkWebhookAccess(userId, webhook.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ webhook });
  } catch (error) {
    console.error("Error fetching webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createWebhookSchema.parse(req.body);
    const { organization, membership } = await checkWebhookAccess(userId, data.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create webhooks" });
    }
    const [webhook] = await db.insert(webhooks).values({
      organizationId: data.organizationId,
      name: data.name,
      url: data.url,
      secret: data.secret,
      active: data.active,
      events: data.events
    }).returning();
    res.status(201).json({ webhook });
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.patch("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const updates = updateWebhookSchema.parse(req.body);
    const webhook = await db.query.webhooks.findFirst({
      where: eq11(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { organization, membership } = await checkWebhookAccess(userId, webhook.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update webhooks" });
    }
    const [updatedWebhook] = await db.update(webhooks).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq11(webhooks.id, webhookId)).returning();
    res.json({ webhook: updatedWebhook });
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq11(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { organization, membership } = await checkWebhookAccess(userId, webhook.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete webhooks" });
    }
    await db.delete(webhookRequests).where(eq11(webhookRequests.webhookId, webhookId));
    await db.delete(webhooks).where(eq11(webhooks.id, webhookId));
    res.json({ message: "Webhook deleted successfully" });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.get("/:id/requests", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq11(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { organization, membership } = await checkWebhookAccess(userId, webhook.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const requests = await db.query.webhookRequests.findMany({
      where: eq11(webhookRequests.webhookId, webhookId),
      orderBy: [desc3(webhookRequests.createdAt)],
      limit
    });
    res.json({ requests });
  } catch (error) {
    console.error("Error fetching webhook requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router6.post("/:id/test", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const webhookId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const webhook = await db.query.webhooks.findFirst({
      where: eq11(webhooks.id, webhookId)
    });
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    const { organization, membership } = await checkWebhookAccess(userId, webhook.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can test webhooks" });
    }
    const testPayload = {
      event: "test",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      organization: {
        id: organization.id,
        name: organization.name
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
var webhooks_default = router6;

// src/server/routes/credentials.ts
init_db();
init_schema();
init_admin();
import { Router as Router7 } from "express";
import { z as z7 } from "zod";
import { eq as eq12, desc as desc4, and as and9 } from "drizzle-orm";
import { v4 as uuidv43 } from "uuid";
var router7 = Router7();
var createCredentialSchema = z7.object({
  organizationId: z7.string().uuid(),
  name: z7.string().min(1).max(100),
  type: z7.enum(["smtp", "api"]),
  key: z7.string().min(1),
  secret: z7.string().optional()
});
var updateCredentialSchema = z7.object({
  name: z7.string().min(1).max(100).optional(),
  secret: z7.string().optional()
});
async function checkCredentialAccess(userId, organizationId) {
  const organization = await db.query.organizations.findFirst({
    where: eq12(organizations.id, organizationId)
  });
  if (!organization)
    return { organization: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { organization, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and9(
      eq12(organizationUsers.organizationId, organization.id),
      eq12(organizationUsers.userId, userId)
    )
  });
  return { organization, membership };
}
router7.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID required" });
    }
    const { organization, membership } = await checkCredentialAccess(userId, organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const credentialsList = await db.query.credentials.findMany({
      where: eq12(credentials.organizationId, organizationId),
      orderBy: [desc4(credentials.createdAt)]
    });
    res.json({ credentials: credentialsList });
  } catch (error) {
    console.error("Error fetching credentials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createCredentialSchema.parse(req.body);
    const { organization, membership } = await checkCredentialAccess(userId, data.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create credentials" });
    }
    const key = uuidv43();
    const secret = uuidv43();
    let hashedSecret = null;
    if (data.secret) {
      hashedSecret = await hashSecret(data.secret);
    }
    const [credential] = await db.insert(credentials).values({
      organizationId: data.organizationId,
      name: data.name,
      type: data.type,
      key: data.key || key,
      secretHash: hashedSecret
    }).returning();
    res.status(201).json({ credential });
  } catch (error) {
    if (error instanceof z7.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating credential:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router7.post("/:id/regenerate", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const credentialId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const credential = await db.query.credentials.findFirst({
      where: eq12(credentials.id, credentialId)
    });
    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }
    const { organization, membership } = await checkCredentialAccess(userId, credential.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can regenerate credentials" });
    }
    const newKey = uuidv43();
    const newSecret = uuidv43();
    const hashedNewSecret = await hashSecret(newSecret);
    const [updatedCredential] = await db.update(credentials).set({
      key: newKey,
      secretHash: hashedNewSecret,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq12(credentials.id, credentialId)).returning();
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
router7.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const credentialId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const credential = await db.query.credentials.findFirst({
      where: eq12(credentials.id, credentialId)
    });
    if (!credential) {
      return res.status(404).json({ error: "Credential not found" });
    }
    const { organization, membership } = await checkCredentialAccess(userId, credential.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete credentials" });
    }
    await db.delete(credentials).where(eq12(credentials.id, credentialId));
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
var credentials_default = router7;

// src/server/routes/routes.ts
init_db();
init_schema();
init_admin();
import { Router as Router8 } from "express";
import { z as z8 } from "zod";
import { eq as eq13, and as and10 } from "drizzle-orm";
var router8 = Router8();
var createRouteSchema = z8.object({
  organizationId: z8.string().uuid(),
  name: z8.string().min(1).max(100),
  address: z8.string().min(1),
  mode: z8.enum(["endpoint", "hold", "reject"]),
  spamMode: z8.enum(["mark", "reject"]),
  spamThreshold: z8.number().int().min(0).max(100).default(5)
});
var updateRouteSchema = z8.object({
  name: z8.string().min(1).max(100).optional(),
  address: z8.string().optional(),
  mode: z8.enum(["endpoint", "hold", "reject"]).optional(),
  spamMode: z8.enum(["mark", "reject"]).optional(),
  spamThreshold: z8.number().int().min(0).max(100).default(5)
});
async function checkRouteAccess(userId, organizationId) {
  const organization = await db.query.organizations.findFirst({
    where: eq13(organizations.id, organizationId)
  });
  if (!organization)
    return { organization: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { organization, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and10(
      eq13(organizationUsers.organizationId, organization.id),
      eq13(organizationUsers.userId, userId)
    )
  });
  return { organization, membership };
}
router8.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID required" });
    }
    const { organization, membership } = await checkRouteAccess(userId, organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const routesList = await db.query.routes.findMany({
      where: eq13(routes.organizationId, organizationId)
    });
    res.json({ routes: routesList });
  } catch (error) {
    console.error("Error fetching routes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router8.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createRouteSchema.parse(req.body);
    const { organization, membership } = await checkRouteAccess(userId, data.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can create routes" });
    }
    const [route] = await db.insert(routes).values({
      ...data
    }).returning();
    res.status(201).json({ route });
  } catch (error) {
    if (error instanceof z8.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router8.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const routeId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = updateRouteSchema.parse(req.body);
    const route = await db.query.routes.findFirst({
      where: eq13(routes.id, routeId)
    });
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    const { organization, membership } = await checkRouteAccess(userId, route.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can update routes" });
    }
    const [updatedRoute] = await db.update(routes).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq13(routes.id, routeId)).returning();
    res.json({ route: updatedRoute });
  } catch (error) {
    if (error instanceof z8.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router8.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const routeId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const route = await db.query.routes.findFirst({
      where: eq13(routes.id, routeId)
    });
    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }
    const { organization, membership } = await checkRouteAccess(userId, route.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can delete routes" });
    }
    await db.delete(routes).where(eq13(routes.id, routeId));
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Error deleting route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var routes_default = router8;

// src/server/routes/system.ts
init_db();
init_schema();
import { Router as Router9 } from "express";
import { createClient as createClient3 } from "@supabase/supabase-js";
import { sql as sql4 } from "drizzle-orm";
import { eq as eq15 } from "drizzle-orm";
import { z as z9 } from "zod";

// src/server/lib/serverBranding.ts
init_db();
init_schema();
import { eq as eq14 } from "drizzle-orm";
var BRAND_ID = "default";
async function readBranding() {
  const row = await db.query.systemBranding.findFirst({
    where: eq14(systemBranding.id, BRAND_ID)
  });
  return {
    companyName: row?.companyName ?? process.env.APP_COMPANY_NAME ?? "",
    applicationName: row?.applicationName ?? process.env.APP_APPLICATION_NAME ?? "",
    logoStorage: row?.logoStorage ?? null,
    faviconStorage: row?.faviconStorage ?? null,
    mailHost: row?.mailHost ?? process.env.MAIL_HOST ?? "mx.skaleclub.com"
  };
}
var _cache = null;
async function getCachedBranding() {
  if (!_cache) {
    const b = await readBranding();
    _cache = { companyName: b.companyName, applicationName: b.applicationName };
    setTimeout(() => {
      _cache = null;
    }, 10 * 60 * 1e3).unref();
  }
  return _cache;
}
function clearBrandingCache() {
  _cache = null;
}

// src/server/routes/system.ts
var router9 = Router9();
var brandingId = "default";
var BUCKET_NAME = "branding-assets";
var brandingSchema = z9.object({
  companyName: z9.string().trim().min(1).max(120).optional(),
  applicationName: z9.string().trim().min(1).max(160).optional(),
  mailHost: z9.string().trim().min(1).max(253).optional()
});
var supabaseAdmin2 = createClient3(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
function getRequestingUser(req) {
  const requestingUserId = req.headers["x-user-id"];
  if (!requestingUserId) {
    return null;
  }
  return db.query.users.findFirst({
    where: eq15(users.id, requestingUserId)
  });
}
async function readBranding2() {
  const b = await readBranding();
  return {
    id: brandingId,
    companyName: b.companyName,
    applicationName: b.applicationName,
    logoStorage: b.logoStorage,
    faviconStorage: b.faviconStorage,
    mailHost: b.mailHost,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
}
function getPublicUrl(storage) {
  if (!storage) {
    return "/brand-mark.svg";
  }
  const [bucket, path] = storage.split("/");
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
function getFaviconPublicUrl(storage) {
  if (!storage) {
    return "/favicon.svg";
  }
  const [bucket, path] = storage.split("/");
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
router9.get("/branding", async (_req, res) => {
  try {
    const branding = await readBranding2();
    res.json({
      companyName: branding.companyName,
      applicationName: branding.applicationName,
      logoUrl: getPublicUrl(branding.logoStorage),
      faviconUrl: getFaviconPublicUrl(branding.faviconStorage),
      mailHost: branding.mailHost
    });
  } catch (error) {
    console.error("Error fetching branding settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var ALLOWED_MIME_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/webp"
];
var MAX_FILE_SIZE = 5 * 1024 * 1024;
router9.post("/branding/upload", async (req, res) => {
  try {
    const requestingUser = await getRequestingUser(req);
    if (!requestingUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!requestingUser.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!req.is("multipart/form-data")) {
      return res.status(400).json({ error: "Content-Type must be multipart/form-data" });
    }
    const chunks = [];
    let totalSize = 0;
    let fileType = "";
    let fieldName = "";
    await new Promise((resolve, reject) => {
      req.on("data", (chunk) => {
        totalSize += chunk.length;
        if (totalSize > MAX_FILE_SIZE) {
          req.destroy();
          return reject(new Error("File size exceeds 5MB limit"));
        }
        chunks.push(chunk);
      });
      req.on("end", () => {
        resolve();
      });
      req.on("error", (error) => {
        reject(error);
      });
    });
    const buffer = Buffer.concat(chunks);
    const contentType = req.headers["content-type"] || "";
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) {
      return res.status(400).json({ error: "Invalid multipart data" });
    }
    const boundary = boundaryMatch[1];
    const parts = buffer.toString("binary").split(`--${boundary}`);
    let fileBuffer = null;
    let filename = "";
    for (const part of parts) {
      if (part.includes("Content-Disposition")) {
        const headerEnd = part.indexOf("\r\n\r\n");
        if (headerEnd !== -1) {
          const headers = part.substring(0, headerEnd);
          const body = part.substring(headerEnd + 4);
          const fieldMatch = headers.match(/name="(\w+)"/);
          if (fieldMatch) {
            fieldName = fieldMatch[1];
          }
          const filenameMatch = headers.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
          if (fieldName === "logo" || fieldName === "favicon") {
            const bodyEnd = body.lastIndexOf("\r\n");
            const fileData = bodyEnd !== -1 ? body.substring(0, bodyEnd) : body.trim();
            fileBuffer = Buffer.from(fileData, "binary");
            const mimeMatch = headers.match(/Content-Type:\s*(.+)/i);
            if (mimeMatch) {
              fileType = mimeMatch[1].trim();
            }
          }
        }
      }
    }
    if (!fileBuffer || !fieldName) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return res.status(400).json({
        error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`
      });
    }
    const timestamp2 = Date.now();
    const storagePath = `${fieldName}-${timestamp2}-${filename}`;
    const storageKey = `${BUCKET_NAME}/${storagePath}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin2.storage.from(BUCKET_NAME).upload(storagePath, fileBuffer, {
      contentType: fileType,
      upsert: true
    });
    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload file" });
    }
    const field = fieldName === "logo" ? "logoStorage" : "faviconStorage";
    const currentBranding = await readBranding2();
    await db.insert(systemBranding).values({
      id: brandingId,
      companyName: currentBranding.companyName,
      applicationName: currentBranding.applicationName
    }).onConflictDoNothing();
    const [branding] = await db.update(systemBranding).set({
      [field]: storageKey,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq15(systemBranding.id, brandingId)).returning();
    clearBrandingCache();
    res.json({
      companyName: branding.companyName,
      applicationName: branding.applicationName,
      logoUrl: getPublicUrl(branding.logoStorage),
      faviconUrl: getPublicUrl(branding.faviconStorage)
    });
  } catch (error) {
    console.error("Error uploading branding file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router9.patch("/branding", async (req, res) => {
  try {
    const requestingUser = await getRequestingUser(req);
    if (!requestingUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!requestingUser.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const updates = brandingSchema.parse(req.body);
    const currentBranding = await readBranding2();
    const payload = {
      companyName: updates.companyName ?? currentBranding.companyName,
      applicationName: updates.applicationName ?? currentBranding.applicationName,
      mailHost: updates.mailHost ?? currentBranding.mailHost,
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db.insert(systemBranding).values({
      id: brandingId,
      companyName: currentBranding.companyName,
      applicationName: currentBranding.applicationName
    }).onConflictDoNothing();
    const [branding] = await db.update(systemBranding).set(payload).where(eq15(systemBranding.id, brandingId)).returning();
    clearBrandingCache();
    res.json({
      companyName: branding.companyName,
      applicationName: branding.applicationName,
      logoUrl: getPublicUrl(branding.logoStorage),
      faviconUrl: getPublicUrl(branding.faviconStorage),
      mailHost: branding.mailHost
    });
  } catch (error) {
    if (error instanceof z9.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating branding settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router9.get("/usage", async (req, res) => {
  try {
    const requestingUser = await getRequestingUser(req);
    if (!requestingUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
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
                , 1)::bigint AS attachment_bytes
            FROM users u
            LEFT JOIN organization_users ou ON ou.user_id = u.id
            LEFT JOIN organizations org ON org.id = ou.organization_id
            LEFT JOIN organizations org ON org.id = ou.organization_id
            LEFT JOIN messages m ON m.organization_id = s.id
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
router9.get("/mail-server-info", (_req, res) => {
  const mailHost = process.env.MAIL_HOST || "localhost";
  const smtpPort = parseInt(process.env.SMTP_SUBMISSION_PORT || "2587");
  const imapPort = parseInt(process.env.IMAP_PORT || "2993");
  res.json({
    smtp: {
      host: mailHost,
      port: smtpPort,
      security: "STARTTLS",
      auth: "PLAIN/LOGIN",
      description: "Use your account email and password to authenticate"
    },
    imap: {
      host: mailHost,
      port: imapPort,
      security: "SSL/TLS",
      auth: "PLAIN",
      description: "Use your account email and password to authenticate"
    }
  });
});
router9.get("/outreach", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { isPlatformAdmin: isPlatformAdmin2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
    if (!await isPlatformAdmin2(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const allOrgs = await db.select({ outreach_enabled: organizations.outreach_enabled }).from(organizations);
    const enabledOrgs = allOrgs.filter((o) => o.outreach_enabled).length;
    const totalOrgs = allOrgs.length;
    res.json({
      outreach_enabled: enabledOrgs === totalOrgs,
      enabled_count: enabledOrgs,
      total_count: totalOrgs
    });
  } catch (error) {
    console.error("Error fetching outreach status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router9.put("/outreach", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { isPlatformAdmin: isPlatformAdmin2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
    if (!await isPlatformAdmin2(userId)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { enabled } = req.body;
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ error: "enabled must be a boolean" });
    }
    await db.update(organizations).set({ outreach_enabled: enabled });
    res.json({ success: true, outreach_enabled: enabled });
  } catch (error) {
    console.error("Error updating outreach status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var system_default = router9;

// src/server/routes/track.ts
init_db();
init_schema();
init_tracking();
import { Router as Router10 } from "express";
import { eq as eq16 } from "drizzle-orm";
var router10 = Router10();
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
router10.get("/open/:token", async (req, res) => {
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
      where: eq16(messages.token, token)
    });
    if (!message || message.openedAt)
      return;
    const organization = await db.query.organizations.findFirst({
      where: eq16(organizations.id, message.organizationId)
    });
    const trackOpens = true;
    const privacyMode = false;
    if (!organization || !trackOpens || privacyMode)
      return;
    const now = /* @__PURE__ */ new Date();
    await db.update(messages).set({ openedAt: now, updatedAt: now }).where(eq16(messages.token, token));
    await Promise.allSettled([
      incrementStat(message.organizationId, "messagesOpened"),
      fireWebhooks(message.organizationId, "message_opened", {
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
router10.get("/click/:token", async (req, res) => {
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
      where: eq16(messages.token, token)
    });
    if (!message)
      return;
    const organization = await db.query.organizations.findFirst({
      where: eq16(organizations.id, message.organizationId)
    });
    const trackClicks = true;
    const privacyMode = false;
    if (!organization || !trackClicks || privacyMode)
      return;
    await Promise.allSettled([
      incrementStat(message.organizationId, "linksClicked"),
      fireWebhooks(message.organizationId, "link_clicked", {
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
var track_default = router10;

// src/server/routes/templates.ts
init_db();
init_schema();
init_admin();
import { Router as Router11 } from "express";
import { z as z10 } from "zod";
import { eq as eq17, and as and11, desc as desc5, like as like2 } from "drizzle-orm";
var router11 = Router11();
function escapeHtml2(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var createTemplateSchema = z10.object({
  organizationId: z10.string().uuid(),
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
async function checkOrganizationAccess(userId, organizationId) {
  const organization = await db.query.organizations.findFirst({
    where: eq17(organizations.id, organizationId)
  });
  if (!organization)
    return { organization: null, membership: null };
  if (await isPlatformAdmin(userId)) {
    return { organization, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and11(
      eq17(organizationUsers.organizationId, organization.id),
      eq17(organizationUsers.userId, userId)
    )
  });
  return { organization, membership };
}
router11.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID required" });
    }
    const { organization, membership } = await checkOrganizationAccess(userId, organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const search = req.query.search;
    const conditions = [eq17(templates.organizationId, organizationId)];
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
router11.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const template = await db.query.templates.findFirst({
      where: eq17(templates.id, templateId)
    });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { organization, membership } = await checkOrganizationAccess(userId, template.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    res.json({ template });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router11.post("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = createTemplateSchema.parse(req.body);
    const { organization, membership } = await checkOrganizationAccess(userId, data.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const existing = await db.query.templates.findFirst({
      where: and11(
        eq17(templates.organizationId, data.organizationId),
        eq17(templates.slug, data.slug)
      )
    });
    if (existing) {
      return res.status(409).json({ error: "Template with this slug already exists for this organization" });
    }
    const [template] = await db.insert(templates).values({
      organizationId: data.organizationId,
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
router11.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const existingTemplate = await db.query.templates.findFirst({
      where: eq17(templates.id, templateId)
    });
    if (!existingTemplate) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { organization, membership } = await checkOrganizationAccess(userId, existingTemplate.organizationId);
    if (!organization || !membership || membership.role === "viewer") {
      return res.status(403).json({ error: "Access denied" });
    }
    const data = updateTemplateSchema.parse(req.body);
    if (data.slug && data.slug !== existingTemplate.slug) {
      const slugExists = await db.query.templates.findFirst({
        where: and11(
          eq17(templates.organizationId, existingTemplate.organizationId),
          eq17(templates.slug, data.slug)
        )
      });
      if (slugExists) {
        return res.status(409).json({ error: "Template with this slug already exists for this organization" });
      }
    }
    const [updatedTemplate] = await db.update(templates).set({
      ...data,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq17(templates.id, templateId)).returning();
    res.json({ template: updatedTemplate });
  } catch (error) {
    if (error instanceof z10.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router11.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const template = await db.query.templates.findFirst({
      where: eq17(templates.id, templateId)
    });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { organization, membership } = await checkOrganizationAccess(userId, template.organizationId);
    if (!organization || !membership || membership.role === "viewer") {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(templates).where(eq17(templates.id, templateId));
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router11.post("/:id/render", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const templateId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const template = await db.query.templates.findFirst({
      where: eq17(templates.id, templateId)
    });
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    const { organization, membership } = await checkOrganizationAccess(userId, template.organizationId);
    if (!organization || !membership) {
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
var templates_default = router11;

// src/server/routes/outreach/index.ts
import { Router as Router15 } from "express";

// src/server/routes/outreach/email-accounts.ts
init_db();
init_schema();
import { Router as Router12 } from "express";
import { z as z11 } from "zod";
import { eq as eq18, and as and12 } from "drizzle-orm";

// src/lib/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
var ALGORITHM2 = "aes-256-gcm";
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

// src/server/routes/outreach/email-accounts.ts
var router12 = Router12();
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
      eq18(organizationUsers.organizationId, organizationId),
      eq18(organizationUsers.userId, userId)
    )
  });
  return membership;
}
router12.get("/", async (req, res) => {
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
      where: eq18(emailAccounts.organizationId, organizationId),
      orderBy: (accounts2, { desc: desc11 }) => [desc11(accounts2.createdAt)]
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
router12.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq18(emailAccounts.id, accountId)
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
router12.post("/", async (req, res) => {
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
        eq18(emailAccounts.organizationId, organizationId),
        eq18(emailAccounts.email, validatedData.email)
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
router12.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq18(emailAccounts.id, accountId)
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
    const [updatedAccount] = await db.update(emailAccounts).set(updateValues).where(eq18(emailAccounts.id, accountId)).returning();
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
router12.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq18(emailAccounts.id, accountId)
    });
    if (!account) {
      return res.status(404).json({ error: "Email account not found" });
    }
    const membership = await checkOrgMembership(userId, account.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(emailAccounts).where(eq18(emailAccounts.id, accountId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting email account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router12.post("/:id/verify", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const accountId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = await db.query.emailAccounts.findFirst({
      where: eq18(emailAccounts.id, accountId)
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
    }).where(eq18(emailAccounts.id, accountId)).returning();
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
var email_accounts_default = router12;

// src/server/routes/outreach/leads.ts
init_db();
init_schema();
import { Router as Router13 } from "express";
import { z as z12 } from "zod";
import { eq as eq19, and as and13, sql as sql5, inArray } from "drizzle-orm";
var router13 = Router13();
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
      eq19(organizationUsers.organizationId, organizationId),
      eq19(organizationUsers.userId, userId)
    )
  });
  return membership;
}
router13.get("/lists", async (req, res) => {
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
      where: eq19(leadLists.organizationId, organizationId),
      orderBy: (lists2, { desc: desc11 }) => [desc11(lists2.createdAt)]
    });
    res.json({ leadLists: lists });
  } catch (error) {
    console.error("Error fetching lead lists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.post("/lists", async (req, res) => {
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
router13.delete("/lists/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const listId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const list = await db.query.leadLists.findFirst({
      where: eq19(leadLists.id, listId)
    });
    if (!list) {
      return res.status(404).json({ error: "Lead list not found" });
    }
    const membership = await checkOrgMembership2(userId, list.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.update(leads).set({ leadListId: null }).where(eq19(leads.leadListId, listId));
    await db.delete(leadLists).where(eq19(leadLists.id, listId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.get("/", async (req, res) => {
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
    const conditions = [eq19(leads.organizationId, organizationId)];
    if (status) {
      conditions.push(eq19(leads.status, status));
    }
    if (leadListId) {
      conditions.push(eq19(leads.leadListId, leadListId));
    }
    const countResult = await db.select({ count: sql5`count(*)` }).from(leads).where(and13(...conditions));
    const total = Number(countResult[0]?.count || 0);
    const leadsList = await db.query.leads.findMany({
      where: and13(...conditions),
      limit,
      offset,
      orderBy: (leads2, { desc: desc11 }) => [desc11(leads2.createdAt)],
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
router13.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const leadId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const lead = await db.query.leads.findFirst({
      where: eq19(leads.id, leadId),
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
    const membership = await checkOrgMembership2(userId, organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const validatedData = createLeadSchema.parse(req.body);
    const existing = await db.query.leads.findFirst({
      where: and13(
        eq19(leads.organizationId, organizationId),
        eq19(leads.email, validatedData.email)
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
      }).where(eq19(leadLists.id, validatedData.leadListId));
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
router13.post("/bulk-import", async (req, res) => {
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
        eq19(leads.organizationId, organizationId),
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
      }).where(eq19(leadLists.id, validatedData.leadListId));
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
router13.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const leadId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const lead = await db.query.leads.findFirst({
      where: eq19(leads.id, leadId)
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
    }).where(eq19(leads.id, leadId)).returning();
    res.json({ lead: updatedLead });
  } catch (error) {
    if (error instanceof z12.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const leadId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const lead = await db.query.leads.findFirst({
      where: eq19(leads.id, leadId)
    });
    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }
    const membership = await checkOrgMembership2(userId, lead.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(leads).where(eq19(leads.id, leadId));
    if (lead.leadListId) {
      await db.update(leadLists).set({
        leadCount: sql5`GREATEST(0, ${leadLists.leadCount} - 1)`
      }).where(eq19(leadLists.id, lead.leadListId));
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router13.post("/bulk-delete", async (req, res) => {
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
        eq19(leads.organizationId, organizationId),
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
var leads_default = router13;

// src/server/routes/outreach/campaigns.ts
init_db();
init_schema();
import { Router as Router14 } from "express";
import { z as z13 } from "zod";
import { eq as eq20, and as and14, sql as sql6, inArray as inArray2 } from "drizzle-orm";
var router14 = Router14();
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
      eq20(organizationUsers.organizationId, organizationId),
      eq20(organizationUsers.userId, userId)
    )
  });
  return membership;
}
router14.get("/", async (req, res) => {
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
    const conditions = [eq20(campaigns.organizationId, organizationId)];
    if (status) {
      conditions.push(eq20(campaigns.status, status));
    }
    const campaignsList = await db.query.campaigns.findMany({
      where: and14(...conditions),
      orderBy: (campaigns2, { desc: desc11 }) => [desc11(campaigns2.createdAt)],
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
router14.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId),
      with: {
        sequences: {
          with: {
            steps: {
              orderBy: (steps, { asc: asc3 }) => [asc3(steps.stepOrder)]
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
router14.put("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId)
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
    const [updatedCampaign] = await db.update(campaigns).set(updateData).where(eq20(campaigns.id, campaignId)).returning();
    res.json({ campaign: updatedCampaign });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(campaigns).where(eq20(campaigns.id, campaignId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.get("/:campaignId/sequences", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const sequencesList = await db.query.sequences.findMany({
      where: eq20(sequences.campaignId, campaignId),
      with: {
        steps: {
          orderBy: (steps, { asc: asc3 }) => [asc3(steps.stepOrder)]
        }
      }
    });
    res.json({ sequences: sequencesList });
  } catch (error) {
    console.error("Error fetching sequences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.post("/:campaignId/sequences", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId)
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
router14.post("/sequences/:sequenceId/steps", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const sequenceId = req.params.sequenceId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const sequence = await db.query.sequences.findFirst({
      where: eq20(sequences.id, sequenceId),
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
router14.put("/sequences/steps/:stepId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const stepId = req.params.stepId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const step = await db.query.sequenceSteps.findFirst({
      where: eq20(sequenceSteps.id, stepId),
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
    }).where(eq20(sequenceSteps.id, stepId)).returning();
    res.json({ step: updatedStep });
  } catch (error) {
    if (error instanceof z13.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    console.error("Error updating sequence step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.delete("/sequences/steps/:stepId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const stepId = req.params.stepId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const step = await db.query.sequenceSteps.findFirst({
      where: eq20(sequenceSteps.id, stepId),
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
    await db.delete(sequenceSteps).where(eq20(sequenceSteps.id, stepId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting sequence step:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.get("/:campaignId/leads", async (req, res) => {
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
      where: eq20(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const offset = (page - 1) * limit;
    const conditions = [eq20(campaignLeads.campaignId, campaignId)];
    if (status) {
      conditions.push(eq20(campaignLeads.status, status));
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
      orderBy: (campaignLeads2, { desc: desc11 }) => [desc11(campaignLeads2.createdAt)]
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
router14.post("/:campaignId/leads", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId)
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
        eq20(leads.organizationId, campaign.organizationId),
        inArray2(leads.id, validatedData.leadIds)
      )
    });
    if (leadsList.length !== validatedData.leadIds.length) {
      return res.status(400).json({ error: "Some leads not found or access denied" });
    }
    const existingCampaignLeads = await db.query.campaignLeads.findMany({
      where: and14(
        eq20(campaignLeads.campaignId, campaignId),
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
      where: eq20(
        sequenceSteps.sequenceId,
        db.select({ id: sequences.id }).from(sequences).where(eq20(sequences.campaignId, campaignId)).limit(1)
      ),
      orderBy: (steps, { asc: asc3 }) => [asc3(steps.stepOrder)]
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
    }).where(eq20(campaigns.id, campaignId));
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
router14.delete("/:campaignId/leads/:leadId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.campaignId;
    const leadId = req.params.leadId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId)
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    const membership = await checkOrgMembership3(userId, campaign.organizationId);
    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    await db.delete(campaignLeads).where(and14(
      eq20(campaignLeads.campaignId, campaignId),
      eq20(campaignLeads.leadId, leadId)
    ));
    await db.update(campaigns).set({
      totalLeads: sql6`GREATEST(0, ${campaigns.totalLeads} - 1)`
    }).where(eq20(campaigns.id, campaignId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing lead from campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router14.get("/:id/stats", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const campaignId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const campaign = await db.query.campaigns.findFirst({
      where: eq20(campaigns.id, campaignId)
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
    }).from(campaignLeads).where(eq20(campaignLeads.campaignId, campaignId));
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
var campaigns_default = router14;

// src/server/routes/outreach/index.ts
var router15 = Router15();
router15.use("/email-accounts", email_accounts_default);
router15.use("/leads", leads_default);
router15.use("/campaigns", campaigns_default);
var outreach_default = router15;

// src/server/routes/outlook.ts
init_db();
init_schema();
init_admin();
import { Router as Router16 } from "express";
import { and as and15, eq as eq21 } from "drizzle-orm";
import { z as z14 } from "zod";
init_crypto();
var router16 = Router16();
var startSchema = z14.object({
  organizationId: z14.string().uuid(),
  loginHint: z14.string().email().optional()
});
var sendTestSchema = z14.object({
  to: z14.string().email(),
  subject: z14.string().min(1).default("SkaleClub Mail Outlook test"),
  body: z14.string().min(1).default("This is a test message sent through Microsoft Graph.")
});
async function checkOutlookAccess(userId, organizationId) {
  const organization = await db.query.organizations.findFirst({
    where: eq21(organizations.id, organizationId)
  });
  if (!organization) {
    return { organization: null, membership: null };
  }
  if (await isPlatformAdmin(userId)) {
    return { organization, membership: { role: "admin" } };
  }
  const membership = await db.query.organizationUsers.findFirst({
    where: and15(
      eq21(organizationUsers.organizationId, organization.id),
      eq21(organizationUsers.userId, userId)
    )
  });
  return { organization, membership };
}
function buildFrontendRedirect(params) {
  const url = new URL("/admin/servers", process.env.FRONTEND_URL || "http://localhost:9000");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}
router16.post("/connect/start", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = startSchema.parse(req.body);
    const { organization, membership } = await checkOutlookAccess(userId, data.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can connect Outlook mailboxes" });
    }
    const state = createOutlookOauthState(userId, data.organizationId);
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
router16.get("/callback", async (req, res) => {
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
    const { organization, membership } = await checkOutlookAccess(state.userId, state.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Outlook callback is no longer authorized" });
    }
    const connection = await exchangeCodeForOutlookConnection(code);
    const mailboxEmail = connection.profile.mail || connection.profile.userPrincipalName;
    if (!mailboxEmail) {
      throw new Error("Outlook account does not expose a usable mailbox address");
    }
    const existingMailbox = await db.query.outlookMailboxes.findFirst({
      where: eq21(outlookMailboxes.microsoftUserId, connection.profile.id)
    }) || await db.query.outlookMailboxes.findFirst({
      where: and15(
        eq21(outlookMailboxes.organizationId, state.organizationId),
        eq21(outlookMailboxes.email, mailboxEmail)
      )
    });
    const payload = {
      organizationId: state.organizationId,
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
    const [mailbox] = existingMailbox ? await db.update(outlookMailboxes).set(payload).where(eq21(outlookMailboxes.id, existingMailbox.id)).returning() : await db.insert(outlookMailboxes).values(payload).returning();
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
router16.get("/mailboxes", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const organizationId = req.query.organizationId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID required" });
    }
    const { organization, membership } = await checkOutlookAccess(userId, organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const mailboxes3 = await db.query.outlookMailboxes.findMany({
      where: eq21(outlookMailboxes.organizationId, organizationId)
    });
    res.json({
      mailboxes: mailboxes3.map(sanitizeOutlookMailbox)
    });
  } catch (error) {
    console.error("Error listing Outlook mailboxes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router16.post("/mailboxes/:id/send-test", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.outlookMailboxes.findFirst({
      where: eq21(outlookMailboxes.id, mailboxId)
    });
    if (!mailbox) {
      return res.status(404).json({ error: "Outlook mailbox not found" });
    }
    const { organization, membership } = await checkOutlookAccess(userId, mailbox.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can send Outlook tests" });
    }
    const data = sendTestSchema.parse(req.body);
    await sendMessageWithOutlook({
      organizationId: mailbox.organizationId,
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
router16.delete("/mailboxes/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.outlookMailboxes.findFirst({
      where: eq21(outlookMailboxes.id, mailboxId)
    });
    if (!mailbox) {
      return res.status(404).json({ error: "Outlook mailbox not found" });
    }
    const { organization, membership } = await checkOutlookAccess(userId, mailbox.organizationId);
    if (!organization || !membership || membership.role !== "admin") {
      return res.status(403).json({ error: "Only admins can disconnect Outlook mailboxes" });
    }
    await db.delete(outlookMailboxes).where(eq21(outlookMailboxes.id, mailboxId));
    res.json({ message: "Outlook mailbox disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting Outlook mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router16.get("/mailboxes/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.outlookMailboxes.findFirst({
      where: eq21(outlookMailboxes.id, mailboxId)
    });
    if (!mailbox) {
      return res.status(404).json({ error: "Outlook mailbox not found" });
    }
    const { organization, membership } = await checkOutlookAccess(userId, mailbox.organizationId);
    if (!organization || !membership) {
      return res.status(403).json({ error: "Access denied" });
    }
    const activeMailbox = await resolveOutlookMailboxForServer(mailbox.organizationId, mailbox.id);
    res.json({
      mailbox: sanitizeOutlookMailbox(activeMailbox || mailbox)
    });
  } catch (error) {
    console.error("Error fetching Outlook mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var outlook_default = router16;

// src/server/routes/mail/index.ts
import { Router as Router22 } from "express";

// src/server/routes/mail/mailboxes.ts
init_db();
init_schema();
import { Router as Router17 } from "express";
import { z as z15 } from "zod";
import { eq as eq22, and as and16, desc as desc6 } from "drizzle-orm";
var router17 = Router17();
async function checkUserMailboxAccess(userId, mailboxId) {
  const mailbox = await db.query.mailboxes.findFirst({
    where: and16(
      eq22(mailboxes.id, mailboxId),
      eq22(mailboxes.userId, userId)
    )
  });
  return mailbox;
}
router17.get("/", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userMailboxes = await db.query.mailboxes.findMany({
      where: eq22(mailboxes.userId, userId),
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
router17.get("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await db.query.mailboxes.findFirst({
      where: and16(
        eq22(mailboxes.id, mailboxId),
        eq22(mailboxes.userId, userId)
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
router17.post("/", async (req, res) => {
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
      await db.update(mailboxes).set({ isDefault: false }).where(eq22(mailboxes.userId, userId));
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
router17.put("/:id", async (req, res) => {
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
        eq22(mailboxes.id, mailboxId),
        eq22(mailboxes.userId, userId)
      )
    });
    if (!existing) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    if (data.isDefault) {
      await db.update(mailboxes).set({ isDefault: false }).where(eq22(mailboxes.userId, userId));
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
    const [updated] = await db.update(mailboxes).set(updateData).where(eq22(mailboxes.id, mailboxId)).returning();
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
router17.delete("/:id", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const existing = await db.query.mailboxes.findFirst({
      where: and16(
        eq22(mailboxes.id, mailboxId),
        eq22(mailboxes.userId, userId)
      )
    });
    if (!existing) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    await db.delete(mailMessages).where(eq22(mailMessages.mailboxId, mailboxId));
    await db.delete(mailFolders).where(eq22(mailFolders.mailboxId, mailboxId));
    await db.delete(mailboxes).where(eq22(mailboxes.id, mailboxId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting mailbox:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router17.post("/test-connection", async (req, res) => {
  try {
    const schema = z15.object({
      smtpHost: z15.string(),
      smtpPort: z15.number().int().min(1).max(65535),
      smtpSecure: z15.boolean(),
      smtpUsername: z15.string(),
      smtpPassword: z15.string(),
      imapHost: z15.string(),
      imapPort: z15.number().int().min(1).max(65535),
      imapSecure: z15.boolean(),
      imapUsername: z15.string(),
      imapPassword: z15.string()
    });
    const data = schema.parse(req.body);
    const nodemailer4 = await import("nodemailer");
    let smtpSuccess = false;
    let imapSuccess = false;
    const errors = [];
    try {
      const smtpTransporter = nodemailer4.createTransport({
        host: data.smtpHost,
        port: data.smtpPort,
        secure: data.smtpSecure,
        auth: {
          user: data.smtpUsername,
          pass: data.smtpPassword
        }
      });
      await smtpTransporter.verify();
      smtpSuccess = true;
    } catch (err) {
      errors.push(`SMTP: ${err instanceof Error ? err.message : String(err)}`);
    }
    try {
      const Imap4 = (await import("imap")).default;
      const imap = new Imap4({
        user: data.imapUsername,
        password: data.imapPassword,
        host: data.imapHost,
        port: data.imapPort,
        tls: data.imapSecure,
        tlsOptions: { rejectUnauthorized: false }
      });
      await new Promise((resolve, reject) => {
        imap.once("ready", () => {
          imap.end();
          resolve();
        });
        imap.once("error", (err) => {
          reject(err);
        });
        imap.connect();
      });
      imapSuccess = true;
    } catch (err) {
      errors.push(`IMAP: ${err instanceof Error ? err.message : String(err)}`);
    }
    res.json({
      data: {
        smtp: smtpSuccess,
        imap: imapSuccess,
        errors: errors.length > 0 ? errors : void 0
      }
    });
  } catch (error) {
    if (error instanceof z15.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error testing connection:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var mailboxes_default = router17;

// src/server/routes/mail/messages.ts
init_db();
init_schema();
import { Router as Router19 } from "express";
import { z as z17 } from "zod";
import { eq as eq24, and as and18, desc as desc8, inArray as inArray3 } from "drizzle-orm";

// src/server/lib/mail.ts
import { simpleParser } from "mailparser";
async function parseRawEmail(rawContent) {
  const parsed = await simpleParser(rawContent);
  const getAddressList = (addr) => {
    if (!addr)
      return [];
    const obj = Array.isArray(addr) ? addr[0] : addr;
    return obj?.value.map((v) => ({ name: v.name || null, address: v.address || null })) || [];
  };
  const refs = parsed.references;
  const referencesStr = Array.isArray(refs) ? refs.join(" ") : refs || null;
  const headers = {};
  if (parsed.headers) {
    parsed.headers.forEach((value, key) => {
      headers[key] = typeof value === "string" ? value : Array.isArray(value) ? value.join(", ") : String(value);
    });
  }
  return {
    messageId: parsed.messageId || null,
    inReplyTo: parsed.inReplyTo || null,
    references: referencesStr,
    subject: parsed.subject || null,
    from: {
      name: parsed.from?.value[0]?.name || null,
      address: parsed.from?.value[0]?.address || null
    },
    to: getAddressList(parsed.to),
    cc: getAddressList(parsed.cc),
    bcc: getAddressList(parsed.bcc),
    plainBody: parsed.text || null,
    htmlBody: parsed.html || null,
    headers,
    attachments: parsed.attachments.map((att) => ({
      filename: att.filename || "",
      contentType: att.contentType,
      size: att.size,
      content: att.content
    })),
    hasAttachments: parsed.attachments.length > 0,
    date: parsed.date || null
  };
}
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

// src/server/routes/mail/filters.ts
init_db();
init_schema();
import { Router as Router18 } from "express";
import { z as z16 } from "zod";
import { eq as eq23, and as and17, desc as desc7 } from "drizzle-orm";
var router18 = Router18();
function evaluateCondition(condition, message) {
  let fieldValue = "";
  switch (condition.field) {
    case "from":
      fieldValue = message.fromAddress?.toLowerCase() || "";
      break;
    case "to":
      fieldValue = Array.isArray(message.toAddresses) ? message.toAddresses.map((t) => t.address).join(" ").toLowerCase() : "";
      break;
    case "subject":
      fieldValue = message.subject?.toLowerCase() || "";
      break;
    case "body":
      fieldValue = (message.plainBody || message.htmlBody || "").toLowerCase();
      break;
    case "hasAttachment":
      return condition.value === "yes" ? message.hasAttachments : !message.hasAttachments;
  }
  const searchValue = condition.value.toLowerCase();
  switch (condition.operator) {
    case "contains":
      return fieldValue.includes(searchValue);
    case "notContains":
      return !fieldValue.includes(searchValue);
    case "equals":
      return fieldValue === searchValue;
    case "startsWith":
      return fieldValue.startsWith(searchValue);
    case "regex":
      try {
        const regex = new RegExp(condition.value, "i");
        return regex.test(fieldValue);
      } catch {
        return false;
      }
    default:
      return false;
  }
}
async function applyFilter(message, actions) {
  const updates = { updatedAt: /* @__PURE__ */ new Date() };
  for (const action of actions) {
    switch (action.action) {
      case "markRead":
        updates.isRead = true;
        break;
      case "markUnread":
        updates.isRead = false;
        break;
      case "markStarred":
        updates.isStarred = true;
        break;
      case "unmarkStarred":
        updates.isStarred = false;
        break;
      case "markSpam":
        updates.isSpam = true;
        break;
      case "markNotSpam":
        updates.isSpam = false;
        break;
      case "archive":
        const archiveFolder = await db.query.mailFolders.findFirst({
          where: and17(
            eq23(mailFolders.mailboxId, message.mailboxId),
            eq23(mailFolders.remoteId, "Archive")
          )
        });
        if (archiveFolder) {
          updates.folderId = archiveFolder.id;
        }
        break;
      case "moveToFolder":
        if (action.value) {
          const targetFolder = await db.query.mailFolders.findFirst({
            where: and17(
              eq23(mailFolders.mailboxId, message.mailboxId),
              eq23(mailFolders.id, action.value)
            )
          });
          if (targetFolder) {
            updates.folderId = targetFolder.id;
          }
        }
        break;
    }
  }
  if (Object.keys(updates).length > 1) {
    await db.update(mailMessages).set(updates).where(eq23(mailMessages.id, message.id));
  }
}
router18.get("/:mailboxId/filters", async (req, res) => {
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
    const filters = await db.query.mailFilters.findMany({
      where: eq23(mailFilters.mailboxId, mailboxId),
      orderBy: [desc7(mailFilters.priority), desc7(mailFilters.createdAt)]
    });
    res.json({ filters });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.post("/:mailboxId/filters", async (req, res) => {
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
    const schema = z16.object({
      name: z16.string().min(1).max(100),
      conditions: z16.array(z16.object({
        field: z16.enum(["from", "to", "subject", "body", "hasAttachment"]),
        operator: z16.enum(["contains", "equals", "startsWith", "notContains", "regex"]),
        value: z16.string()
      })).min(1),
      actions: z16.array(z16.object({
        action: z16.enum(["markRead", "markUnread", "markStarred", "unmarkStarred", "moveToFolder", "markSpam", "markNotSpam", "archive", "addLabel"]),
        value: z16.string().optional()
      })).min(1),
      isActive: z16.boolean().default(true),
      priority: z16.number().int().default(0)
    });
    const data = schema.parse(req.body);
    const [created] = await db.insert(mailFilters).values({
      mailboxId,
      name: data.name,
      conditions: data.conditions,
      actions: data.actions,
      isActive: data.isActive,
      priority: data.priority
    }).returning();
    res.status(201).json({ filter: created });
  } catch (error) {
    if (error instanceof z16.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error creating filter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.put("/:mailboxId/filters/:filterId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const filterId = req.params.filterId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const schema = z16.object({
      name: z16.string().min(1).max(100).optional(),
      conditions: z16.array(z16.object({
        field: z16.enum(["from", "to", "subject", "body", "hasAttachment"]),
        operator: z16.enum(["contains", "equals", "startsWith", "notContains", "regex"]),
        value: z16.string()
      })).min(1).optional(),
      actions: z16.array(z16.object({
        action: z16.enum(["markRead", "markUnread", "markStarred", "unmarkStarred", "moveToFolder", "markSpam", "markNotSpam", "archive", "addLabel"]),
        value: z16.string().optional()
      })).min(1).optional(),
      isActive: z16.boolean().optional(),
      priority: z16.number().int().optional()
    });
    const data = schema.parse(req.body);
    const existing = await db.query.mailFilters.findFirst({
      where: and17(
        eq23(mailFilters.id, filterId),
        eq23(mailFilters.mailboxId, mailboxId)
      )
    });
    if (!existing) {
      return res.status(404).json({ error: "Filter not found" });
    }
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    if (data.name !== void 0)
      updateData.name = data.name;
    if (data.conditions !== void 0)
      updateData.conditions = data.conditions;
    if (data.actions !== void 0)
      updateData.actions = data.actions;
    if (data.isActive !== void 0)
      updateData.isActive = data.isActive;
    if (data.priority !== void 0)
      updateData.priority = data.priority;
    const [updated] = await db.update(mailFilters).set(updateData).where(eq23(mailFilters.id, filterId)).returning();
    res.json({ filter: updated });
  } catch (error) {
    if (error instanceof z16.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error updating filter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.delete("/:mailboxId/filters/:filterId", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const filterId = req.params.filterId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    await db.delete(mailFilters).where(
      and17(
        eq23(mailFilters.id, filterId),
        eq23(mailFilters.mailboxId, mailboxId)
      )
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting filter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router18.post("/:mailboxId/filters/:filterId/test", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const filterId = req.params.filterId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const filter = await db.query.mailFilters.findFirst({
      where: and17(
        eq23(mailFilters.id, filterId),
        eq23(mailFilters.mailboxId, mailboxId)
      )
    });
    if (!filter) {
      return res.status(404).json({ error: "Filter not found" });
    }
    const conditions = filter.conditions;
    const messages2 = await db.query.mailMessages.findMany({
      where: eq23(mailMessages.mailboxId, mailboxId),
      limit: 50
    });
    const matchingMessages = [];
    for (const message of messages2) {
      const matches = conditions.every((cond) => evaluateCondition(cond, message));
      if (matches) {
        matchingMessages.push(message);
      }
    }
    res.json({
      filter: filter.name,
      matchingCount: matchingMessages.length,
      sampleMessages: matchingMessages.slice(0, 5).map((m) => ({
        id: m.id,
        subject: m.subject,
        from: m.fromAddress
      }))
    });
  } catch (error) {
    console.error("Error testing filter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
async function runFiltersOnMessage(messageId) {
  const message = await db.query.mailMessages.findFirst({
    where: eq23(mailMessages.id, messageId)
  });
  if (!message)
    return;
  const filters = await db.query.mailFilters.findMany({
    where: and17(
      eq23(mailFilters.mailboxId, message.mailboxId),
      eq23(mailFilters.isActive, true)
    ),
    orderBy: [desc7(mailFilters.priority)]
  });
  for (const filter of filters) {
    const conditions = filter.conditions;
    const matches = conditions.every((cond) => evaluateCondition(cond, message));
    if (matches) {
      const actions = filter.actions;
      await applyFilter(message, actions);
    }
  }
}
var filters_default = router18;

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
      where: eq24(mailFolders.mailboxId, mailboxId),
      orderBy: [desc8(mailFolders.createdAt)]
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
    const conditions = [eq24(mailMessages.mailboxId, mailboxId)];
    if (folderId) {
      conditions.push(eq24(mailMessages.folderId, folderId));
    }
    const messages2 = await db.query.mailMessages.findMany({
      where: and18(...conditions),
      orderBy: [desc8(mailMessages.receivedAt)],
      limit,
      offset
    });
    const [{ count }] = await db.select({ count: eq24(mailMessages.id, mailMessages.id) }).from(mailMessages).where(and18(...conditions));
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
      where: and18(
        eq24(mailMessages.id, messageId),
        eq24(mailMessages.mailboxId, mailboxId)
      )
    });
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (!message.isRead) {
      await db.update(mailMessages).set({ isRead: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq24(mailMessages.id, messageId));
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
    const schema = z17.object({
      isRead: z17.boolean().optional(),
      isStarred: z17.boolean().optional()
    });
    const data = schema.parse(req.body);
    const existing = await db.query.mailMessages.findFirst({
      where: and18(
        eq24(mailMessages.id, messageId),
        eq24(mailMessages.mailboxId, mailboxId)
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
    const [updated] = await db.update(mailMessages).set(updateData).where(eq24(mailMessages.id, messageId)).returning();
    res.json({
      message: mailMessageToListItem(updated)
    });
  } catch (error) {
    if (error instanceof z17.ZodError) {
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
    await db.update(mailMessages).set({ isDeleted: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq24(mailMessages.id, messageId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.post("/:mailboxId/messages/:messageId/archive", async (req, res) => {
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
    const archiveFolder = await db.query.mailFolders.findFirst({
      where: and18(
        eq24(mailFolders.mailboxId, mailboxId),
        eq24(mailFolders.remoteId, "Archive")
      )
    });
    if (archiveFolder) {
      await db.update(mailMessages).set({ folderId: archiveFolder.id, updatedAt: /* @__PURE__ */ new Date() }).where(eq24(mailMessages.id, messageId));
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error archiving message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.post("/:mailboxId/messages/:messageId/spam", async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];
    const mailboxId = req.params.mailboxId;
    const messageId = req.params.messageId;
    const isSpam = req.body.isSpam ?? true;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const mailbox = await checkUserMailboxAccess(userId, mailboxId);
    if (!mailbox) {
      return res.status(404).json({ error: "Mailbox not found" });
    }
    const spamFolder = await db.query.mailFolders.findFirst({
      where: and18(
        eq24(mailFolders.mailboxId, mailboxId),
        eq24(mailFolders.type, "spam")
      )
    });
    if (spamFolder && isSpam) {
      await db.update(mailMessages).set({ folderId: spamFolder.id, updatedAt: /* @__PURE__ */ new Date() }).where(eq24(mailMessages.id, messageId));
    } else {
      const inboxFolder = await db.query.mailFolders.findFirst({
        where: and18(
          eq24(mailFolders.mailboxId, mailboxId),
          eq24(mailFolders.remoteId, "INBOX")
        )
      });
      if (inboxFolder) {
        await db.update(mailMessages).set({ folderId: inboxFolder.id, updatedAt: /* @__PURE__ */ new Date() }).where(eq24(mailMessages.id, messageId));
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking message as spam:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.post("/:mailboxId/messages/:messageId/move", async (req, res) => {
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
    const schema = z17.object({
      folderId: z17.string().uuid()
    });
    const data = schema.parse(req.body);
    await db.update(mailMessages).set({ folderId: data.folderId, updatedAt: /* @__PURE__ */ new Date() }).where(eq24(mailMessages.id, messageId));
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z17.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error moving message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router19.post("/:mailboxId/messages/batch", async (req, res) => {
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
      messageIds: z17.array(z17.string().uuid()).min(1),
      action: z17.enum(["archive", "spam", "unspam", "delete", "read", "unread", "star", "unstar"]),
      folderId: z17.string().uuid().optional()
    });
    const data = schema.parse(req.body);
    const updateData = { updatedAt: /* @__PURE__ */ new Date() };
    switch (data.action) {
      case "archive":
        const archiveFolder = await db.query.mailFolders.findFirst({
          where: and18(
            eq24(mailFolders.mailboxId, mailboxId),
            eq24(mailFolders.remoteId, "Archive")
          )
        });
        if (archiveFolder) {
          updateData.folderId = archiveFolder.id;
        }
        break;
      case "spam":
        const spamFolder = await db.query.mailFolders.findFirst({
          where: and18(
            eq24(mailFolders.mailboxId, mailboxId),
            eq24(mailFolders.type, "spam")
          )
        });
        if (spamFolder) {
          updateData.folderId = spamFolder.id;
        }
        break;
      case "unspam":
        const inboxFolder = await db.query.mailFolders.findFirst({
          where: and18(
            eq24(mailFolders.mailboxId, mailboxId),
            eq24(mailFolders.remoteId, "INBOX")
          )
        });
        if (inboxFolder) {
          updateData.folderId = inboxFolder.id;
        }
        break;
      case "delete":
        updateData.isDeleted = true;
        break;
      case "read":
        updateData.isRead = true;
        break;
      case "unread":
        updateData.isRead = false;
        break;
      case "star":
        updateData.isStarred = true;
        break;
      case "unstar":
        updateData.isStarred = false;
        break;
    }
    if (data.folderId && ["archive", "spam", "unspam"].includes(data.action)) {
      updateData.folderId = data.folderId;
    }
    await db.update(mailMessages).set(updateData).where(inArray3(mailMessages.id, data.messageIds));
    for (const messageId of data.messageIds) {
      await runFiltersOnMessage(messageId);
    }
    res.json({ success: true });
  } catch (error) {
    if (error instanceof z17.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error batch updating messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var messages_default2 = router19;

// src/server/routes/mail/send.ts
init_db();
init_schema();
import { Router as Router20 } from "express";
import { z as z18 } from "zod";
import nodemailer from "nodemailer";
import Imap from "imap";
import { v4 as uuidv44 } from "uuid";
import { eq as eq25, and as and19 } from "drizzle-orm";

// src/server/lib/html-to-text.ts
import { htmlToText } from "html-to-text";
function htmlToPlainText(html) {
  return htmlToText(html, {
    wordwrap: 130,
    selectors: [
      { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
      { selector: "img", format: "skip" }
    ]
  });
}
function createMultipartEmail(plainBody, htmlBody) {
  const boundary = `----=_Part_${Math.random().toString(36).substring(2)}_${Date.now()}`;
  if (htmlBody && plainBody) {
    return {
      headers: [
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`
      ],
      body: [
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=UTF-8",
        "",
        plainBody,
        "",
        `--${boundary}`,
        "Content-Type: text/html; charset=UTF-8",
        "",
        htmlBody,
        "",
        `--${boundary}--`
      ].join("\r\n")
    };
  }
  if (htmlBody && !plainBody) {
    const generatedPlain = htmlToPlainText(htmlBody);
    return {
      headers: [
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`
      ],
      body: [
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=UTF-8",
        "",
        generatedPlain,
        "",
        `--${boundary}`,
        "Content-Type: text/html; charset=UTF-8",
        "",
        htmlBody,
        "",
        `--${boundary}--`
      ].join("\r\n")
    };
  }
  return {
    headers: [
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8"
    ],
    body: `\r
${plainBody || ""}`
  };
}

// src/server/routes/mail/send.ts
var router20 = Router20();
async function appendToSentFolder(mailbox, rawEmail) {
  return new Promise((resolve) => {
    const imapConfig = {
      user: mailbox.imapUsername,
      password: decrypt(mailbox.imapPasswordEncrypted),
      host: mailbox.imapHost,
      port: mailbox.imapPort,
      tls: mailbox.imapSecure,
      tlsOptions: { rejectUnauthorized: process.env.NODE_ENV === "production" }
    };
    const imap = new Imap(imapConfig);
    imap.once("ready", () => {
      imap.append(rawEmail, { mailbox: "Sent" }, (err) => {
        imap.end();
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true });
        }
      });
    });
    imap.once("error", (err) => {
      resolve({ success: false, error: err.message });
    });
    imap.connect();
  });
}
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
    const schema = z18.object({
      to: z18.array(z18.object({
        address: z18.string().email(),
        name: z18.string().optional()
      })).min(1),
      cc: z18.array(z18.object({
        address: z18.string().email(),
        name: z18.string().optional()
      })).optional(),
      bcc: z18.array(z18.object({
        address: z18.string().email(),
        name: z18.string().optional()
      })).optional(),
      subject: z18.string().min(1).max(998),
      plainBody: z18.string().optional(),
      htmlBody: z18.string().optional(),
      inReplyTo: z18.string().optional(),
      references: z18.string().optional(),
      attachments: z18.array(z18.object({
        filename: z18.string(),
        content: z18.string(),
        contentType: z18.string().optional()
      })).optional(),
      saveToSent: z18.boolean().default(true)
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
        where: and19(
          eq25(mailFolders.mailboxId, mailboxId),
          eq25(mailFolders.remoteId, "Sent")
        )
      });
      const { headers: contentHeaders, body: contentBody } = createMultipartEmail(data.plainBody, data.htmlBody);
      const rawEmail = [
        `From: ${mailbox.displayName ? `${mailbox.displayName} <${mailbox.email}>` : mailbox.email}`,
        `To: ${data.to.map((t) => t.name ? `${t.name} <${t.address}>` : t.address).join(", ")}`,
        data.cc ? `Cc: ${data.cc.map((c) => c.name ? `${c.name} <${c.address}>` : c.address).join(", ")}` : "",
        `Subject: ${data.subject}`,
        `Date: ${(/* @__PURE__ */ new Date()).toUTCString()}`,
        `Message-ID: ${messageId}`,
        data.inReplyTo ? `In-Reply-To: ${data.inReplyTo}` : "",
        data.references ? `References: ${data.references}` : "",
        ...contentHeaders,
        contentBody
      ].filter(Boolean).join("\r\n");
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
      const appendResult = await appendToSentFolder(mailbox, rawEmail);
      if (!appendResult.success) {
        console.warn("Failed to append to IMAP Sent folder:", appendResult.error);
      }
    }
    res.json({
      success: true,
      messageId,
      message: "Email sent successfully"
    });
  } catch (error) {
    if (error instanceof z18.ZodError) {
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
    const schema = z18.object({
      to: z18.array(z18.object({
        address: z18.string().email(),
        name: z18.string().optional()
      })).optional(),
      cc: z18.array(z18.object({
        address: z18.string().email(),
        name: z18.string().optional()
      })).optional(),
      bcc: z18.array(z18.object({
        address: z18.string().email(),
        name: z18.string().optional()
      })).optional(),
      subject: z18.string().optional(),
      plainBody: z18.string().optional(),
      htmlBody: z18.string().optional(),
      attachments: z18.array(z18.object({
        filename: z18.string(),
        content: z18.string(),
        contentType: z18.string().optional()
      })).optional()
    });
    const data = schema.parse(req.body);
    const draftsFolder = await db.query.mailFolders.findFirst({
      where: and19(
        eq25(mailFolders.mailboxId, mailboxId),
        eq25(mailFolders.remoteId, "Drafts")
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
    if (error instanceof z18.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error("Error saving draft:", error);
    res.status(500).json({ error: "Failed to save draft" });
  }
});
var send_default = router20;

// src/server/routes/mail/sync.ts
import { Router as Router21 } from "express";

// src/server/lib/mail-sync.ts
init_db();
init_schema();
import Imap2 from "imap";
import { simpleParser as simpleParser2 } from "mailparser";
import { eq as eq26, and as and20, desc as desc9 } from "drizzle-orm";
var DEFAULT_CONFIG = {
  maxRetries: 3,
  retryDelay: 1e3,
  batchSize: 50,
  enableIdle: true
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function withRetry(fn, config = DEFAULT_CONFIG) {
  let lastError = null;
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Attempt ${attempt}/${config.maxRetries} failed: ${lastError.message}`);
      if (attempt < config.maxRetries) {
        const delay = config.retryDelay * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}
function createImapConnection(mailbox, isIdle = false) {
  const config = {
    user: mailbox.imapUsername,
    password: decrypt(mailbox.imapPasswordEncrypted),
    host: mailbox.imapHost,
    port: mailbox.imapPort,
    tls: mailbox.imapSecure,
    tlsOptions: {
      rejectUnauthorized: process.env.NODE_ENV === "production"
    },
    connectionTimeout: 3e4,
    authTimeout: 15e3
  };
  if (isIdle) {
    config.keepalive = {
      interval: 3e4,
      idleTimeout: 3e5
    };
  }
  return new Imap2(config);
}
async function syncMailbox(mailboxId, config = DEFAULT_CONFIG) {
  const result = {
    mailboxId,
    folderId: "",
    newMessages: 0,
    errors: []
  };
  const mailbox = await db.query.mailboxes.findFirst({
    where: eq26(mailboxes.id, mailboxId)
  });
  if (!mailbox) {
    throw new Error("Mailbox not found");
  }
  const imapConfig = {
    user: mailbox.imapUsername,
    password: decrypt(mailbox.imapPasswordEncrypted),
    host: mailbox.imapHost,
    port: mailbox.imapPort,
    tls: mailbox.imapSecure
  };
  try {
    await withRetry(
      () => syncAllFolders(mailboxId, imapConfig, config, result),
      config
    );
    await db.update(mailboxes).set({
      lastSyncAt: /* @__PURE__ */ new Date(),
      syncError: result.errors.length > 0 ? result.errors[0] : null
    }).where(eq26(mailboxes.id, mailboxId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    result.errors.push(message);
    await db.update(mailboxes).set({ syncError: message }).where(eq26(mailboxes.id, mailboxId));
  }
  return result;
}
async function syncAllFolders(mailboxId, imapConfig, config, result) {
  const folders = await getAllFolders(mailboxId, imapConfig);
  for (const folder of folders) {
    let dbFolder = await db.query.mailFolders.findFirst({
      where: and20(
        eq26(mailFolders.mailboxId, mailboxId),
        eq26(mailFolders.remoteId, folder.remoteId)
      )
    });
    if (!dbFolder) {
      const inserted = await db.insert(mailFolders).values({
        mailboxId,
        remoteId: folder.remoteId,
        name: folder.name,
        type: folder.type
      }).returning();
      dbFolder = inserted[0];
    }
    const folderResult = await syncFolder(
      mailboxId,
      dbFolder.id,
      folder.remoteId,
      imapConfig,
      config
    );
    result.newMessages += folderResult.newMessages;
    result.errors.push(...folderResult.errors);
    await db.update(mailFolders).set({
      unreadCount: folderResult.unreadCount,
      totalCount: folderResult.totalCount,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq26(mailFolders.id, dbFolder.id));
  }
}
async function getAllFolders(mailboxId, imapConfig) {
  return new Promise((resolve, reject) => {
    const imap = createImapConnection({ ...imapConfig, id: mailboxId });
    imap.once("ready", () => {
      imap.getBoxes((err, boxes) => {
        if (err) {
          imap.end();
          reject(err);
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
        imap.end();
        resolve(folders);
      });
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
async function syncFolder(mailboxId, folderId, remoteId, imapConfig, config) {
  const result = {
    newMessages: 0,
    errors: [],
    unreadCount: 0,
    totalCount: 0
  };
  return new Promise((resolve) => {
    const imap = createImapConnection({ ...imapConfig, id: mailboxId });
    imap.once("ready", () => {
      const boxName = remoteId;
      imap.openBox(boxName, false, async (err, box) => {
        if (err) {
          result.errors.push(`Failed to open ${boxName}: ${err.message}`);
          imap.end();
          resolve(result);
          return;
        }
        result.unreadCount = box.messages.unseen;
        result.totalCount = box.messages.total;
        try {
          if (box.messages.total > 0) {
            const { newCount, errors } = await fetchMessagesSync(
              imap,
              mailboxId,
              folderId,
              box,
              config
            );
            result.newMessages = newCount;
            result.errors.push(...errors);
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          result.errors.push(`Error syncing ${boxName}: ${msg}`);
        }
        imap.end();
        resolve(result);
      });
    });
    imap.once("error", (err) => {
      result.errors.push(`IMAP error: ${err.message}`);
      resolve(result);
    });
    imap.connect();
  });
}
async function fetchMessagesSync(imap, mailboxId, folderId, box, config) {
  const result = { newCount: 0, errors: [] };
  const lastKnownUid = await getLastKnownUid(mailboxId, folderId);
  const startUid = lastKnownUid ? lastKnownUid + 1 : 1;
  if (startUid > box.messages.total) {
    return result;
  }
  const rangeEnd = Math.min(startUid + config.batchSize - 1, box.messages.total);
  const uidRange = `${startUid}:${rangeEnd}`;
  return new Promise((resolve) => {
    const fetch2 = imap.fetch(uidRange, {
      bodies: "",
      struct: true
    });
    let completed = 0;
    const totalMessages = rangeEnd - startUid + 1;
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
        if (uid) {
          try {
            const existing = await db.query.mailMessages.findFirst({
              where: and20(
                eq26(mailMessages.mailboxId, mailboxId),
                eq26(mailMessages.folderId, folderId),
                eq26(mailMessages.remoteUid, uid)
              )
            });
            if (!existing && raw) {
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
              result.newCount++;
            }
          } catch (error) {
            console.error("Error processing message:", error);
            result.errors.push(`Error processing UID ${uid}: ${error}`);
          }
        }
        if (completed >= totalMessages) {
          resolve(result);
        }
      });
    });
    fetch2.once("error", (err) => {
      console.error("Fetch error:", err);
      result.errors.push(`Fetch error: ${err.message}`);
      resolve(result);
    });
  });
}
async function getLastKnownUid(mailboxId, folderId) {
  const lastMessage = await db.query.mailMessages.findFirst({
    where: and20(
      eq26(mailMessages.mailboxId, mailboxId),
      eq26(mailMessages.folderId, folderId)
    ),
    orderBy: [desc9(mailMessages.remoteUid)]
  });
  return lastMessage?.remoteUid || null;
}
async function syncAllMailboxes() {
  const mailboxesToSync = await db.query.mailboxes.findMany({
    where: and20(
      eq26(mailboxes.isActive, true),
      eq26(mailboxes.isNative, false)
    )
  });
  const results = [];
  for (const mailbox of mailboxesToSync) {
    const result = await syncMailbox(mailbox.id);
    results.push(result);
  }
  return results;
}

// src/server/routes/mail/sync.ts
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
router22.use("/mailboxes", messages_default2);
router22.use("/mailboxes", send_default);
router22.use("/mailboxes", sync_default);
router22.use("/mailboxes", filters_default);
var mail_default = router22;

// src/server/smtp-server.ts
init_db();
init_schema();
import { SMTPServer } from "smtp-server";
import nodemailer2 from "nodemailer";
import { v4 as uuidv45 } from "uuid";
import { eq as eq27, and as and21 } from "drizzle-orm";
async function getCompanionMailbox(email, userId) {
  return db.query.mailboxes.findFirst({
    where: and21(
      eq27(mailboxes.email, email.toLowerCase()),
      eq27(mailboxes.userId, userId)
    )
  });
}
async function storeMessage(mailboxId, folderType, parsed, isRead = false) {
  const folder = await db.query.mailFolders.findFirst({
    where: and21(
      eq27(mailFolders.mailboxId, mailboxId),
      eq27(mailFolders.type, folderType)
    )
  });
  if (!folder) {
    console.error(`[SMTP] Folder type '${folderType}' not found for mailboxId: ${mailboxId}`);
    return;
  }
  const messageId = parsed.messageId || `<${uuidv45()}@skaleclub.mail>`;
  await db.insert(mailMessages).values({
    mailboxId,
    folderId: folder.id,
    messageId,
    inReplyTo: parsed.inReplyTo,
    references: parsed.references,
    subject: parsed.subject,
    fromAddress: parsed.from.address,
    fromName: parsed.from.name,
    toAddresses: parsed.to,
    ccAddresses: parsed.cc,
    bccAddresses: parsed.bcc,
    plainBody: parsed.plainBody,
    htmlBody: parsed.htmlBody,
    headers: parsed.headers,
    hasAttachments: parsed.hasAttachments,
    attachments: parsed.attachments.map((a) => ({
      filename: a.filename,
      contentType: a.contentType,
      size: a.size
    })),
    isRead,
    isDraft: false,
    remoteDate: parsed.date,
    receivedAt: parsed.date || /* @__PURE__ */ new Date()
  }).onConflictDoNothing();
}
async function relayMessage(fromAddress, toAddresses, rawEmail) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transporter = nodemailer2.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await transporter.sendMail({
      envelope: { from: fromAddress, to: toAddresses },
      raw: rawEmail
    });
  } else {
    const transporter = nodemailer2.createTransport({
      direct: true,
      name: process.env.MAIL_DOMAIN || "localhost"
    });
    await transporter.sendMail({
      envelope: { from: fromAddress, to: toAddresses },
      raw: rawEmail
    });
  }
}
async function isLocalAddress(email) {
  const result = await findLocalUser(email);
  return result ? result.userId : null;
}
function createSMTPServer() {
  const port = parseInt(process.env.SMTP_SUBMISSION_PORT || "2587");
  const server = new SMTPServer({
    name: process.env.MAIL_DOMAIN || "skaleclub.mail",
    // Allow unencrypted auth in dev; in prod, set up TLS certs
    secure: false,
    allowInsecureAuth: true,
    // authOptional defaults to false = require auth (no open relay)
    authOptional: false,
    onAuth(auth, _session, callback) {
      const username = auth.username?.toLowerCase();
      const password = auth.password;
      if (!username || !password) {
        return callback(new Error("Username and password required"));
      }
      authenticateNativeUser(username, password).then((account) => {
        if (!account) {
          return callback(new Error("Invalid credentials"));
        }
        console.log(`[SMTP] Auth success: ${username}`);
        callback(null, { user: JSON.stringify({ email: account.email, userId: account.id }) });
      }).catch((err) => {
        console.error("[SMTP] Auth error:", err);
        callback(new Error("Authentication failed"));
      });
    },
    onData(stream, session, callback) {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", async () => {
        const raw = Buffer.concat(chunks);
        const userStr = session.user;
        if (!userStr) {
          return callback(new Error("Unauthenticated"));
        }
        const user = JSON.parse(userStr);
        try {
          const parsed = await parseRawEmail(raw);
          const senderEmail = user.email;
          const senderMailbox = await getCompanionMailbox(senderEmail, user.userId);
          if (senderMailbox) {
            await storeMessage(senderMailbox.id, "sent", parsed, true);
            console.log(`[SMTP] Saved to Sent: ${senderEmail} \u2192 ${parsed.to.map((t) => t.address).join(", ")}`);
          }
          const rcptAddresses = session.envelope.rcptTo.map((r) => r.address);
          const localRecipients = [];
          const externalRecipients = [];
          for (const addr of rcptAddresses) {
            const recipientUserId = await isLocalAddress(addr);
            if (recipientUserId) {
              localRecipients.push({ email: addr, userId: recipientUserId });
            } else {
              externalRecipients.push(addr);
            }
          }
          for (const { email: recipientEmail, userId: recipientUserId } of localRecipients) {
            const recipientMailbox = await getCompanionMailbox(recipientEmail, recipientUserId);
            if (recipientMailbox) {
              await storeMessage(recipientMailbox.id, "inbox", parsed, false);
              console.log(`[SMTP] Local delivery: ${senderEmail} \u2192 ${recipientEmail}`);
            }
          }
          if (externalRecipients.length > 0) {
            try {
              await relayMessage(senderEmail, externalRecipients, raw);
              console.log(`[SMTP] Relayed: ${senderEmail} \u2192 ${externalRecipients.join(", ")}`);
            } catch (relayErr) {
              console.error("[SMTP] Relay error:", relayErr);
            }
          }
          callback();
        } catch (error) {
          console.error("[SMTP] Processing error:", error);
          callback(new Error("Failed to process message"));
        }
      });
      stream.on("error", (err) => {
        console.error("[SMTP] Stream error:", err);
        callback(err);
      });
    }
  });
  server.on("error", (err) => {
    console.error("[SMTP] Server error:", err.message);
  });
  return {
    start() {
      server.listen(port, () => {
        console.log(`[SMTP] Submission server listening on port ${port}`);
        console.log(`[SMTP] Configure Thunderbird: SMTP \u2192 localhost:${port} (STARTTLS)`);
      });
    },
    close() {
      server.close();
    }
  };
}

// src/server/imap-server.ts
init_db();
init_schema();
import net from "net";
import { eq as eq28, and as and22, asc as asc2 } from "drizzle-orm";
var _imapAppName = process.env.APP_APPLICATION_NAME ?? "";
async function loadImapBranding() {
  const { applicationName } = await getCachedBranding();
  _imapAppName = applicationName;
}
async function authenticate(email, password) {
  return authenticateNativeUser(email, password);
}
async function getCompanionMailbox2(email, userId) {
  return db.query.mailboxes.findFirst({
    where: and22(
      eq28(mailboxes.email, email.toLowerCase()),
      eq28(mailboxes.userId, userId)
    )
  });
}
function sendLine(socket, line) {
  socket.write(line + "\r\n");
}
function escapeLiteral(s) {
  if (!s)
    return "NIL";
  if (/[\r\n"]/.test(s)) {
    const bytes = Buffer.byteLength(s, "utf8");
    return `{${bytes}}\r
${s}`;
  }
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function flagsToIMAP(msg) {
  const flags = [];
  if (msg.isRead)
    flags.push("\\Seen");
  if (msg.isStarred)
    flags.push("\\Flagged");
  if (msg.isDeleted)
    flags.push("\\Deleted");
  if (msg.isDraft)
    flags.push("\\Draft");
  return `(${flags.join(" ")})`;
}
function folderTypeToAttributes(type) {
  switch (type) {
    case "inbox":
      return "\\HasNoChildren";
    case "sent":
      return "\\Sent \\HasNoChildren";
    case "drafts":
      return "\\Drafts \\HasNoChildren";
    case "trash":
      return "\\Trash \\HasNoChildren";
    case "spam":
      return "\\Junk \\HasNoChildren";
    default:
      return "\\HasNoChildren";
  }
}
function buildRawMessage(msg) {
  const to = msg.toAddresses || [];
  const cc = msg.ccAddresses || [];
  const toStr = to.map((a) => a.name ? `"${a.name}" <${a.address}>` : a.address).join(", ");
  const ccStr = cc.map((a) => a.name ? `"${a.name}" <${a.address}>` : a.address).join(", ");
  const date = (msg.remoteDate || msg.receivedAt || /* @__PURE__ */ new Date()).toUTCString();
  let raw = "";
  raw += `Message-ID: ${msg.messageId || `<${msg.id}@skaleclub.mail>`}\r
`;
  raw += `Date: ${date}\r
`;
  raw += `From: ${msg.fromName ? `"${msg.fromName}" ` : ""}<${msg.fromAddress || ""}>\r
`;
  if (toStr)
    raw += `To: ${toStr}\r
`;
  if (ccStr)
    raw += `Cc: ${ccStr}\r
`;
  if (msg.subject)
    raw += `Subject: ${msg.subject}\r
`;
  if (msg.inReplyTo)
    raw += `In-Reply-To: ${msg.inReplyTo}\r
`;
  if (msg.references)
    raw += `References: ${msg.references}\r
`;
  if (msg.htmlBody && msg.plainBody) {
    const boundary = `boundary_${msg.id.replace(/-/g, "")}`;
    raw += `MIME-Version: 1.0\r
`;
    raw += `Content-Type: multipart/alternative; boundary="${boundary}"\r
`;
    raw += `\r
`;
    raw += `--${boundary}\r
`;
    raw += `Content-Type: text/plain; charset=utf-8\r
\r
`;
    raw += msg.plainBody + "\r\n";
    raw += `--${boundary}\r
`;
    raw += `Content-Type: text/html; charset=utf-8\r
\r
`;
    raw += msg.htmlBody + "\r\n";
    raw += `--${boundary}--\r
`;
  } else if (msg.htmlBody) {
    raw += `MIME-Version: 1.0\r
`;
    raw += `Content-Type: text/html; charset=utf-8\r
`;
    raw += `\r
`;
    raw += msg.htmlBody;
  } else {
    raw += `Content-Type: text/plain; charset=utf-8\r
`;
    raw += `\r
`;
    raw += msg.plainBody || "";
  }
  return raw;
}
function buildHeader(msg) {
  const to = msg.toAddresses || [];
  const cc = msg.ccAddresses || [];
  const toStr = to.map((a) => a.name ? `"${a.name}" <${a.address}>` : a.address).join(", ");
  const ccStr = cc.map((a) => a.name ? `"${a.name}" <${a.address}>` : a.address).join(", ");
  const date = (msg.remoteDate || msg.receivedAt || /* @__PURE__ */ new Date()).toUTCString();
  let h = "";
  h += `Message-ID: ${msg.messageId || `<${msg.id}@skaleclub.mail>`}\r
`;
  h += `Date: ${date}\r
`;
  h += `From: ${msg.fromName ? `"${msg.fromName}" ` : ""}<${msg.fromAddress || ""}>\r
`;
  if (toStr)
    h += `To: ${toStr}\r
`;
  if (ccStr)
    h += `Cc: ${ccStr}\r
`;
  if (msg.subject)
    h += `Subject: ${msg.subject}\r
`;
  return h;
}
function buildEnvelopeString(msg) {
  const to = msg.toAddresses || [];
  const date = (msg.remoteDate || msg.receivedAt || /* @__PURE__ */ new Date()).toUTCString();
  const fromAddr = [[
    escapeLiteral(msg.fromName),
    "NIL",
    escapeLiteral(msg.fromAddress?.split("@")[0] || null),
    escapeLiteral(msg.fromAddress?.split("@")[1] || null)
  ].join(" ")];
  const toList = to.map((a) => `(${escapeLiteral(a.name || null)} NIL ${escapeLiteral(a.address?.split("@")[0] || null)} ${escapeLiteral(a.address?.split("@")[1] || null)})`);
  return `(${escapeLiteral(date)} ${escapeLiteral(msg.subject)} ((${fromAddr.join(" ")})) NIL NIL ((${toList.join(" ")})) NIL NIL ${escapeLiteral(msg.inReplyTo)} ${escapeLiteral(msg.messageId || `<${msg.id}@skaleclub.mail>`)})`;
}
async function buildFetchResponse(seqNum, msg, items) {
  const parts = [];
  for (const item of items) {
    const upper = item.toUpperCase();
    if (upper === "FLAGS") {
      parts.push(`FLAGS ${flagsToIMAP(msg)}`);
    } else if (upper === "UID") {
      parts.push(`UID ${msg.remoteUid || seqNum}`);
    } else if (upper === "INTERNALDATE") {
      const d = msg.receivedAt || msg.remoteDate || /* @__PURE__ */ new Date();
      parts.push(`INTERNALDATE "${d.toUTCString()}"`);
    } else if (upper === "RFC822.SIZE" || upper === "BODY.SIZE") {
      const raw = buildRawMessage(msg);
      parts.push(`RFC822.SIZE ${Buffer.byteLength(raw, "utf8")}`);
    } else if (upper === "ENVELOPE") {
      parts.push(`ENVELOPE ${buildEnvelopeString(msg)}`);
    } else if (upper === "RFC822" || upper === "BODY[]" || upper === "BODY.PEEK[]") {
      const raw = buildRawMessage(msg);
      parts.push(`${upper === "BODY.PEEK[]" ? "BODY[]" : upper} {${Buffer.byteLength(raw, "utf8")}}\r
${raw}`);
    } else if (upper === "RFC822.HEADER" || upper === "BODY[HEADER]" || upper === "BODY.PEEK[HEADER]") {
      const header = buildHeader(msg);
      parts.push(`${upper.includes("PEEK") ? "BODY[HEADER]" : upper} {${Buffer.byteLength(header, "utf8")}}\r
${header}`);
    } else if (upper === "RFC822.TEXT" || upper === "BODY[TEXT]" || upper === "BODY.PEEK[TEXT]") {
      const body = msg.plainBody || msg.htmlBody || "";
      parts.push(`${upper.includes("PEEK") ? "BODY[TEXT]" : upper} {${Buffer.byteLength(body, "utf8")}}\r
${body}`);
    } else if (upper === "BODYSTRUCTURE") {
      if (msg.htmlBody && msg.plainBody) {
        const boundary = `boundary_${msg.id.replace(/-/g, "")}`;
        parts.push(`BODYSTRUCTURE ((("TEXT" "PLAIN" ("CHARSET" "UTF-8") NIL NIL "7BIT" ${Buffer.byteLength(msg.plainBody, "utf8")} ${msg.plainBody.split("\n").length}) ("TEXT" "HTML" ("CHARSET" "UTF-8") NIL NIL "7BIT" ${Buffer.byteLength(msg.htmlBody, "utf8")} ${msg.htmlBody.split("\n").length}) "ALTERNATIVE" ("BOUNDARY" "${boundary}") NIL NIL) NIL NIL)`);
      } else if (msg.htmlBody) {
        const size = Buffer.byteLength(msg.htmlBody, "utf8");
        const lines = msg.htmlBody.split("\n").length;
        parts.push(`BODYSTRUCTURE ("TEXT" "HTML" ("CHARSET" "UTF-8") NIL NIL "7BIT" ${size} ${lines} NIL NIL NIL)`);
      } else {
        const body = msg.plainBody || "";
        const size = Buffer.byteLength(body, "utf8");
        const lines = body.split("\n").length;
        parts.push(`BODYSTRUCTURE ("TEXT" "PLAIN" ("CHARSET" "UTF-8") NIL NIL "7BIT" ${size} ${lines} NIL NIL NIL)`);
      }
    }
  }
  return `* ${seqNum} FETCH (${parts.join(" ")})`;
}
function parseFetchItems(itemStr) {
  const upper = itemStr.toUpperCase().trim();
  if (upper === "ALL")
    return ["FLAGS", "INTERNALDATE", "RFC822.SIZE", "ENVELOPE"];
  if (upper === "FAST")
    return ["FLAGS", "INTERNALDATE", "RFC822.SIZE"];
  if (upper === "FULL")
    return ["FLAGS", "INTERNALDATE", "RFC822.SIZE", "ENVELOPE", "BODY"];
  const inner = upper.startsWith("(") ? upper.slice(1, -1).trim() : upper;
  const items = [];
  let current = "";
  let depth = 0;
  for (const ch of inner) {
    if (ch === "[")
      depth++;
    if (ch === "]")
      depth--;
    if (ch === " " && depth === 0) {
      if (current)
        items.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current)
    items.push(current);
  return items;
}
function parseSequenceSet(set, max) {
  const nums = [];
  const parts = set.split(",");
  for (const part of parts) {
    if (part.includes(":")) {
      const [a, b] = part.split(":");
      const start = a === "*" ? max : parseInt(a);
      const end = b === "*" ? max : parseInt(b);
      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        if (i >= 1 && i <= max)
          nums.push(i);
      }
    } else {
      const n = part === "*" ? max : parseInt(part);
      if (!isNaN(n) && n >= 1 && n <= max)
        nums.push(n);
    }
  }
  return [...new Set(nums)].sort((a, b) => a - b);
}
async function handleCommand(session, tag, command, args) {
  const cmd = command.toUpperCase();
  const socket = session.socket;
  if (cmd === "CAPABILITY") {
    sendLine(socket, "* CAPABILITY IMAP4rev1 AUTH=PLAIN AUTH=LOGIN LITERAL+ IDLE");
    sendLine(socket, `${tag} OK CAPABILITY completed`);
    return;
  }
  if (cmd === "NOOP") {
    sendLine(socket, `${tag} OK NOOP completed`);
    return;
  }
  if (cmd === "LOGOUT") {
    sendLine(socket, "* BYE Logging out");
    sendLine(socket, `${tag} OK LOGOUT completed`);
    session.state = "logout";
    socket.end();
    return;
  }
  if (cmd === "LOGIN") {
    const match = args.match(/^"?([^"\s]+)"?\s+"?(.+?)"?$/);
    if (!match) {
      sendLine(socket, `${tag} BAD LOGIN syntax error`);
      return;
    }
    const [, email, password] = match;
    const account = await authenticate(email, password);
    if (!account) {
      sendLine(socket, `${tag} NO LOGIN failed - invalid credentials`);
      return;
    }
    session.state = "authenticated";
    session.userId = account.id;
    session.userEmail = account.email;
    console.log(`[IMAP] Login: ${email}`);
    sendLine(socket, `${tag} OK LOGIN completed`);
    return;
  }
  if (cmd === "AUTHENTICATE") {
    if (args.toUpperCase().startsWith("PLAIN")) {
      sendLine(socket, "+ ");
      sendLine(socket, `${tag} NO Use LOGIN command instead`);
      return;
    }
    sendLine(socket, `${tag} NO AUTHENTICATE mechanism not supported, use LOGIN`);
    return;
  }
  if (session.state === "not_authenticated") {
    sendLine(socket, `${tag} NO Please authenticate first`);
    return;
  }
  const companion = await getCompanionMailbox2(session.userEmail, session.userId);
  if (!companion) {
    sendLine(socket, `${tag} NO Mailbox not found`);
    return;
  }
  if (cmd === "LIST" || cmd === "LSUB") {
    const folders = await db.query.mailFolders.findMany({
      where: eq28(mailFolders.mailboxId, companion.id)
    });
    for (const folder of folders) {
      const attrs = folderTypeToAttributes(folder.type);
      sendLine(socket, `* ${cmd} (${attrs}) "/" "${folder.remoteId}"`);
    }
    sendLine(socket, `${tag} OK ${cmd} completed`);
    return;
  }
  if (cmd === "STATUS") {
    const parts = args.match(/^"?([^"\s]+)"?\s+\((.+)\)$/);
    if (!parts) {
      sendLine(socket, `${tag} BAD STATUS syntax error`);
      return;
    }
    const folderName = parts[1];
    const requestedItems = parts[2].toUpperCase().split(/\s+/);
    const folder = await db.query.mailFolders.findFirst({
      where: and22(
        eq28(mailFolders.mailboxId, companion.id),
        eq28(mailFolders.remoteId, folderName)
      )
    });
    if (!folder) {
      sendLine(socket, `${tag} NO STATUS no such mailbox`);
      return;
    }
    const items = [];
    if (requestedItems.includes("MESSAGES"))
      items.push(`MESSAGES ${folder.totalCount}`);
    if (requestedItems.includes("RECENT"))
      items.push("RECENT 0");
    if (requestedItems.includes("UNSEEN"))
      items.push(`UNSEEN ${folder.unreadCount}`);
    if (requestedItems.includes("UIDNEXT"))
      items.push(`UIDNEXT ${folder.totalCount + 1}`);
    if (requestedItems.includes("UIDVALIDITY"))
      items.push("UIDVALIDITY 1");
    sendLine(socket, `* STATUS "${folderName}" (${items.join(" ")})`);
    sendLine(socket, `${tag} OK STATUS completed`);
    return;
  }
  if (cmd === "SELECT" || cmd === "EXAMINE") {
    const folderName = args.replace(/"/g, "").trim();
    const folder = await db.query.mailFolders.findFirst({
      where: and22(
        eq28(mailFolders.mailboxId, companion.id),
        eq28(mailFolders.remoteId, folderName)
      )
    });
    if (!folder) {
      sendLine(socket, `${tag} NO [NONEXISTENT] No such mailbox`);
      return;
    }
    session.state = "selected";
    session.selectedMailboxId = companion.id;
    session.selectedFolderId = folder.id;
    session.selectedReadOnly = cmd === "EXAMINE";
    const msgs = await db.query.mailMessages.findMany({
      where: and22(
        eq28(mailMessages.folderId, folder.id),
        eq28(mailMessages.isDeleted, false)
      ),
      columns: { isRead: true }
    });
    const total = msgs.length;
    const unseen = msgs.filter((m) => !m.isRead).length;
    sendLine(socket, `* ${total} EXISTS`);
    sendLine(socket, "* 0 RECENT");
    if (unseen > 0) {
      sendLine(socket, `* OK [UNSEEN ${total - unseen + 1}] Message ${total - unseen + 1} is the first unseen`);
    }
    sendLine(socket, "* OK [UIDVALIDITY 1] UIDs valid");
    sendLine(socket, `* OK [UIDNEXT ${total + 1}] Predicted next UID`);
    sendLine(socket, `* FLAGS (\\Answered \\Flagged \\Deleted \\Seen \\Draft)`);
    sendLine(socket, `* OK [PERMANENTFLAGS (\\Deleted \\Seen \\Flagged \\Draft \\*)] Flags permitted`);
    const access = cmd === "EXAMINE" ? "[READ-ONLY]" : "[READ-WRITE]";
    sendLine(socket, `${tag} OK ${access} ${cmd} completed`);
    return;
  }
  if (cmd === "CREATE") {
    const folderName = args.replace(/"/g, "").trim();
    const existing = await db.query.mailFolders.findFirst({
      where: and22(
        eq28(mailFolders.mailboxId, companion.id),
        eq28(mailFolders.remoteId, folderName)
      )
    });
    if (existing) {
      sendLine(socket, `${tag} NO Mailbox already exists`);
      return;
    }
    await db.insert(mailFolders).values({
      mailboxId: companion.id,
      remoteId: folderName,
      name: folderName,
      type: "custom"
    });
    sendLine(socket, `${tag} OK CREATE completed`);
    return;
  }
  if (cmd === "DELETE") {
    const folderName = args.replace(/"/g, "").trim();
    const folder = await db.query.mailFolders.findFirst({
      where: and22(
        eq28(mailFolders.mailboxId, companion.id),
        eq28(mailFolders.remoteId, folderName)
      )
    });
    if (!folder) {
      sendLine(socket, `${tag} NO No such mailbox`);
      return;
    }
    await db.delete(mailMessages).where(eq28(mailMessages.folderId, folder.id));
    await db.delete(mailFolders).where(eq28(mailFolders.id, folder.id));
    sendLine(socket, `${tag} OK DELETE completed`);
    return;
  }
  if (cmd === "FETCH" || cmd === "STORE" || cmd === "EXPUNGE" || cmd === "SEARCH" || cmd === "UID" || cmd === "COPY" || cmd === "MOVE") {
    if (session.state !== "selected" || !session.selectedFolderId) {
      sendLine(socket, `${tag} NO No mailbox selected`);
      return;
    }
  }
  if (cmd === "FETCH") {
    const match = args.match(/^(\S+)\s+(.+)$/);
    if (!match) {
      sendLine(socket, `${tag} BAD FETCH syntax error`);
      return;
    }
    const [, seqSet, itemStr] = match;
    const msgs = await db.query.mailMessages.findMany({
      where: and22(
        eq28(mailMessages.folderId, session.selectedFolderId),
        eq28(mailMessages.isDeleted, false)
      ),
      orderBy: [asc2(mailMessages.receivedAt)]
    });
    const seqNums = parseSequenceSet(seqSet, msgs.length);
    const items = parseFetchItems(itemStr);
    for (const seqNum of seqNums) {
      const msg = msgs[seqNum - 1];
      if (!msg)
        continue;
      const response = await buildFetchResponse(seqNum, msg, items);
      sendLine(socket, response);
    }
    const fetchesBody = items.some((i) => i.includes("BODY[") && !i.includes("PEEK"));
    if (fetchesBody) {
      for (const seqNum of seqNums) {
        const msg = msgs[seqNum - 1];
        if (msg && !msg.isRead) {
          await db.update(mailMessages).set({ isRead: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq28(mailMessages.id, msg.id));
        }
      }
    }
    sendLine(socket, `${tag} OK FETCH completed`);
    return;
  }
  if (cmd === "STORE") {
    const match = args.match(/^(\S+)\s+([+-]?FLAGS(?:\.SILENT)?)\s+(.+)$/);
    if (!match) {
      sendLine(socket, `${tag} BAD STORE syntax error`);
      return;
    }
    const [, seqSet, flagOp, flagList] = match;
    const msgs = await db.query.mailMessages.findMany({
      where: and22(
        eq28(mailMessages.folderId, session.selectedFolderId),
        eq28(mailMessages.isDeleted, false)
      ),
      orderBy: [asc2(mailMessages.receivedAt)]
    });
    const seqNums = parseSequenceSet(seqSet, msgs.length);
    const flagStr = flagList.replace(/[()]/g, "").toUpperCase();
    const silent = flagOp.includes(".SILENT");
    for (const seqNum of seqNums) {
      const msg = msgs[seqNum - 1];
      if (!msg)
        continue;
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      const applyFlag = (flag, value) => {
        if (flag === "\\SEEN")
          updates.isRead = value;
        if (flag === "\\FLAGGED")
          updates.isStarred = value;
        if (flag === "\\DELETED")
          updates.isDeleted = value;
        if (flag === "\\DRAFT")
          updates.isDraft = value;
      };
      const flags = flagStr.split(/\s+/);
      if (flagOp.startsWith("+")) {
        flags.forEach((f) => applyFlag(f, true));
      } else if (flagOp.startsWith("-")) {
        flags.forEach((f) => applyFlag(f, false));
      } else {
        updates.isRead = flags.includes("\\SEEN");
        updates.isStarred = flags.includes("\\FLAGGED");
        updates.isDeleted = flags.includes("\\DELETED");
        updates.isDraft = flags.includes("\\DRAFT");
      }
      await db.update(mailMessages).set(updates).where(eq28(mailMessages.id, msg.id));
      if (!silent) {
        const updated = { ...msg, ...updates };
        sendLine(socket, `* ${seqNum} FETCH (FLAGS ${flagsToIMAP(updated)})`);
      }
    }
    sendLine(socket, `${tag} OK STORE completed`);
    return;
  }
  if (cmd === "EXPUNGE") {
    const msgs = await db.query.mailMessages.findMany({
      where: and22(
        eq28(mailMessages.folderId, session.selectedFolderId),
        eq28(mailMessages.isDeleted, false)
      ),
      orderBy: [asc2(mailMessages.receivedAt)]
    });
    const deleted = await db.query.mailMessages.findMany({
      where: and22(
        eq28(mailMessages.folderId, session.selectedFolderId),
        eq28(mailMessages.isDeleted, true)
      )
    });
    for (let i = msgs.length; i >= 1; i--) {
      const msg = msgs[i - 1];
      if (msg.isDeleted) {
        await db.delete(mailMessages).where(eq28(mailMessages.id, msg.id));
        sendLine(socket, `* ${i} EXPUNGE`);
      }
    }
    for (const msg of deleted) {
      await db.delete(mailMessages).where(eq28(mailMessages.id, msg.id));
    }
    sendLine(socket, `${tag} OK EXPUNGE completed`);
    return;
  }
  if (cmd === "SEARCH") {
    const msgs = await db.query.mailMessages.findMany({
      where: and22(
        eq28(mailMessages.folderId, session.selectedFolderId),
        eq28(mailMessages.isDeleted, false)
      ),
      orderBy: [asc2(mailMessages.receivedAt)]
    });
    const upperArgs = args.toUpperCase();
    let results = [];
    for (let i = 0; i < msgs.length; i++) {
      const msg = msgs[i];
      let match = true;
      if (upperArgs.includes("UNSEEN") && msg.isRead)
        match = false;
      if (upperArgs.includes("SEEN") && !msg.isRead)
        match = false;
      if (upperArgs.includes("FLAGGED") && !msg.isStarred)
        match = false;
      if (upperArgs.includes("UNFLAGGED") && msg.isStarred)
        match = false;
      if (upperArgs.includes("DRAFT") && !msg.isDraft)
        match = false;
      const subjectMatch = args.match(/SUBJECT\s+"([^"]+)"/i);
      if (subjectMatch && !msg.subject?.toLowerCase().includes(subjectMatch[1].toLowerCase()))
        match = false;
      const fromMatch = args.match(/FROM\s+"([^"]+)"/i);
      if (fromMatch && !msg.fromAddress?.toLowerCase().includes(fromMatch[1].toLowerCase()))
        match = false;
      if (upperArgs === "ALL")
        match = true;
      if (match)
        results.push(i + 1);
    }
    sendLine(socket, `* SEARCH ${results.join(" ")}`);
    sendLine(socket, `${tag} OK SEARCH completed`);
    return;
  }
  if (cmd === "APPEND") {
    const match = args.match(/^"?([^"\s]+)"?\s+/);
    if (!match) {
      sendLine(socket, `${tag} BAD APPEND syntax error`);
      return;
    }
    const folderName = match[1];
    const folder = await db.query.mailFolders.findFirst({
      where: and22(
        eq28(mailFolders.mailboxId, companion.id),
        eq28(mailFolders.remoteId, folderName)
      )
    });
    if (!folder) {
      sendLine(socket, `${tag} NO [TRYCREATE] No such mailbox`);
      return;
    }
    sendLine(socket, `${tag} OK APPEND completed`);
    return;
  }
  if (cmd === "COPY") {
    const match = args.match(/^(\S+)\s+"?([^"\s]+)"?$/);
    if (!match) {
      sendLine(socket, `${tag} BAD COPY syntax error`);
      return;
    }
    const [, seqSet, destFolderName] = match;
    const destFolder = await db.query.mailFolders.findFirst({
      where: and22(
        eq28(mailFolders.mailboxId, companion.id),
        eq28(mailFolders.remoteId, destFolderName)
      )
    });
    if (!destFolder) {
      sendLine(socket, `${tag} NO [TRYCREATE] No such mailbox`);
      return;
    }
    const msgs = await db.query.mailMessages.findMany({
      where: and22(
        eq28(mailMessages.folderId, session.selectedFolderId),
        eq28(mailMessages.isDeleted, false)
      ),
      orderBy: [asc2(mailMessages.receivedAt)]
    });
    const seqNums = parseSequenceSet(seqSet, msgs.length);
    for (const seqNum of seqNums) {
      const msg = msgs[seqNum - 1];
      if (!msg)
        continue;
      await db.insert(mailMessages).values({
        mailboxId: msg.mailboxId,
        folderId: destFolder.id,
        messageId: msg.messageId,
        inReplyTo: msg.inReplyTo,
        references: msg.references,
        subject: msg.subject,
        fromAddress: msg.fromAddress,
        fromName: msg.fromName,
        toAddresses: msg.toAddresses,
        ccAddresses: msg.ccAddresses,
        bccAddresses: msg.bccAddresses,
        plainBody: msg.plainBody,
        htmlBody: msg.htmlBody,
        headers: msg.headers,
        hasAttachments: msg.hasAttachments,
        attachments: msg.attachments,
        isRead: msg.isRead,
        isDraft: msg.isDraft,
        remoteDate: msg.remoteDate,
        receivedAt: /* @__PURE__ */ new Date()
      }).onConflictDoNothing();
    }
    sendLine(socket, `${tag} OK COPY completed`);
    return;
  }
  if (cmd === "UID") {
    const spaceIdx = args.indexOf(" ");
    const subCmd = args.substring(0, spaceIdx).toUpperCase();
    const subArgs = args.substring(spaceIdx + 1);
    await handleCommand(session, tag, subCmd, subArgs);
    return;
  }
  if (cmd === "IDLE") {
    sendLine(socket, "+ idling");
    return;
  }
  sendLine(socket, `${tag} BAD Unknown command: ${command}`);
}
function handleConnection(socket) {
  const session = {
    socket,
    state: "not_authenticated",
    userId: null,
    userEmail: null,
    selectedMailboxId: null,
    selectedFolderId: null,
    selectedReadOnly: false,
    buffer: ""
  };
  socket.setEncoding("utf8");
  sendLine(socket, `* OK [CAPABILITY IMAP4rev1 AUTH=PLAIN AUTH=LOGIN] ${_imapAppName} IMAP server ready`);
  socket.on("data", (data) => {
    session.buffer += data;
    let lineEnd;
    while ((lineEnd = session.buffer.indexOf("\r\n")) !== -1) {
      const line = session.buffer.substring(0, lineEnd);
      session.buffer = session.buffer.substring(lineEnd + 2);
      if (!line.trim())
        continue;
      if (line.trim().toUpperCase() === "DONE") {
        sendLine(socket, "* OK [IDLE] Idle terminated");
        continue;
      }
      const firstSpace = line.indexOf(" ");
      if (firstSpace === -1)
        continue;
      const tag = line.substring(0, firstSpace);
      const rest = line.substring(firstSpace + 1);
      const secondSpace = rest.indexOf(" ");
      const command = secondSpace === -1 ? rest : rest.substring(0, secondSpace);
      const args = secondSpace === -1 ? "" : rest.substring(secondSpace + 1);
      handleCommand(session, tag, command, args).catch((err) => {
        console.error(`[IMAP] Command error (${command}):`, err);
        sendLine(socket, `${tag} NO Internal server error`);
      });
      if (session.state === "logout")
        break;
    }
  });
  socket.on("error", (err) => {
    if (err.code !== "ECONNRESET") {
      console.error("[IMAP] Socket error:", err.message);
    }
  });
  socket.on("close", () => {
  });
}
function createIMAPServer() {
  const port = parseInt(process.env.IMAP_PORT || "2993");
  const server = net.createServer(handleConnection);
  server.on("error", (err) => {
    console.error("[IMAP] Server error:", err.message);
  });
  return {
    start() {
      server.listen(port, () => {
        console.log(`[IMAP] Server listening on port ${port}`);
        console.log(`[IMAP] Configure Thunderbird: IMAP \u2192 localhost:${port} (no SSL for dev)`);
      });
    },
    close() {
      server.close();
    }
  };
}

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
app.use("/api/", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  next();
});
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
var supabase2 = createClient4(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
var PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/system/branding",
  "/api/system/mail-server-info"
];
app.use("/api", async (req, res, next) => {
  const path = req.originalUrl.split("?")[0];
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
    where: eq35(users.id, user.id)
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
var clientDist = join(process.cwd(), "dist", "client");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });
}
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
      const adminUser = await db.query.users.findFirst({ where: eq35(users.isAdmin, true) });
      if (!adminUser) {
        console.warn("\u26A0\uFE0F  No platform admin found. Run: npx tsx scripts/set-admin.ts <email>");
      }
    } catch {
    }
    Promise.resolve().then(() => (init_jobs(), jobs_exports)).then((jobs) => jobs.startJobs());
    if (!process.env.RAILWAY_ENVIRONMENT) {
      try {
        const smtpServer = createSMTPServer();
        const imapServer = createIMAPServer();
        smtpServer.start();
        loadImapBranding().then(() => imapServer.start());
      } catch (err) {
        console.warn("\u26A0\uFE0F  SMTP/IMAP servers failed to start:", err.message);
      }
    } else {
      console.log("\u2139\uFE0F  SMTP/IMAP servers disabled on Railway (enable TCP addon to use)");
    }
  });
}
var server_default = app;
export {
  server_default as default
};
