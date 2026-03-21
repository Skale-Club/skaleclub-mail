-- Enable Row Level Security on all tables
-- This migration should be run in Supabase SQL Editor

-- ============================================================================
-- USERS TABLE
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = organizations.id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Users can create organizations (they become owner)
CREATE POLICY "Users can create organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (true);

-- Only organization owners can update
CREATE POLICY "Only owners can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = organizations.id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- Only organization owners can delete
CREATE POLICY "Only owners can delete organizations"
  ON public.organizations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = organizations.id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- ORGANIZATION_USERS TABLE
-- ============================================================================
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;

-- Users can view members of their organizations
CREATE POLICY "Users can view organization members"
  ON public.organization_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can add members
CREATE POLICY "Owners and admins can add members"
  ON public.organization_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()::text
      AND ou.role IN ('owner', 'admin')
    )
  );

-- Only owners can remove members (except themselves)
CREATE POLICY "Owners can remove members"
  ON public.organization_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()::text
      AND ou.role = 'owner'
    )
  );

-- ============================================================================
-- SERVERS TABLE
-- ============================================================================
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

-- Users can view servers in their organizations
CREATE POLICY "Users can view organization servers"
  ON public.servers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = servers.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create servers
CREATE POLICY "Owners and admins can create servers"
  ON public.servers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = servers.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update servers
CREATE POLICY "Owners and admins can update servers"
  ON public.servers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = servers.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete servers
CREATE POLICY "Only owners can delete servers"
  ON public.servers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = servers.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- DOMAINS TABLE
-- ============================================================================
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Users can view domains in their organizations
CREATE POLICY "Users can view organization domains"
  ON public.domains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = domains.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create domains
CREATE POLICY "Owners and admins can create domains"
  ON public.domains FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = domains.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update domains
CREATE POLICY "Owners and admins can update domains"
  ON public.domains FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = domains.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete domains
CREATE POLICY "Only owners can delete domains"
  ON public.domains FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = domains.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- CREDENTIALS TABLE
-- ============================================================================
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Users can view credentials in their organizations
CREATE POLICY "Users can view organization credentials"
  ON public.credentials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = credentials.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create credentials
CREATE POLICY "Owners and admins can create credentials"
  ON public.credentials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = credentials.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update credentials
CREATE POLICY "Owners and admins can update credentials"
  ON public.credentials FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = credentials.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete credentials
CREATE POLICY "Only owners can delete credentials"
  ON public.credentials FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = credentials.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- ROUTES TABLE
-- ============================================================================
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Users can view routes in their organizations
CREATE POLICY "Users can view organization routes"
  ON public.routes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = routes.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create routes
CREATE POLICY "Owners and admins can create routes"
  ON public.routes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = routes.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update routes
CREATE POLICY "Owners and admins can update routes"
  ON public.routes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = routes.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete routes
CREATE POLICY "Only owners can delete routes"
  ON public.routes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = routes.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages in their organizations
CREATE POLICY "Users can view organization messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = messages.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Server can insert messages (using service role)
-- For user-level inserts, check organization membership
CREATE POLICY "Users can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = messages.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can update messages
CREATE POLICY "Owners and admins can update messages"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = messages.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete messages
CREATE POLICY "Only owners can delete messages"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = messages.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- DELIVERIES TABLE
-- ============================================================================
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- Users can view deliveries in their organizations
CREATE POLICY "Users can view organization deliveries"
  ON public.deliveries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      JOIN public.messages m ON m.id = deliveries.message_id
      WHERE m.organization_id = ou.organization_id
      AND ou.user_id = auth.uid()::text
    )
  );

-- System can insert deliveries (service role bypasses RLS)
CREATE POLICY "System can insert deliveries"
  ON public.deliveries FOR INSERT
  WITH CHECK (true);

-- System can update deliveries (service role bypasses RLS)
CREATE POLICY "System can update deliveries"
  ON public.deliveries FOR UPDATE
  USING (true);

-- ============================================================================
-- WEBHOOKS TABLE
-- ============================================================================
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

-- Users can view webhooks in their organizations
CREATE POLICY "Users can view organization webhooks"
  ON public.webhooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = webhooks.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create webhooks
CREATE POLICY "Owners and admins can create webhooks"
  ON public.webhooks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = webhooks.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update webhooks
CREATE POLICY "Owners and admins can update webhooks"
  ON public.webhooks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = webhooks.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete webhooks
CREATE POLICY "Only owners can delete webhooks"
  ON public.webhooks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = webhooks.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- WEBHOOK_REQUESTS TABLE
-- ============================================================================
ALTER TABLE public.webhook_requests ENABLE ROW LEVEL SECURITY;

-- Users can view webhook requests in their organizations
CREATE POLICY "Users can view organization webhook requests"
  ON public.webhook_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users ou
      JOIN public.webhooks w ON w.id = webhook_requests.webhook_id
      WHERE w.organization_id = ou.organization_id
      AND ou.user_id = auth.uid()::text
    )
  );

-- System can insert webhook requests (service role bypasses RLS)
CREATE POLICY "System can insert webhook requests"
  ON public.webhook_requests FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- TRACK_DOMAINS TABLE
-- ============================================================================
ALTER TABLE public.track_domains ENABLE ROW LEVEL SECURITY;

-- Users can view track domains in their organizations
CREATE POLICY "Users can view organization track domains"
  ON public.track_domains FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = track_domains.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create track domains
CREATE POLICY "Owners and admins can create track domains"
  ON public.track_domains FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = track_domains.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update track domains
CREATE POLICY "Owners and admins can update track domains"
  ON public.track_domains FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = track_domains.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete track domains
CREATE POLICY "Only owners can delete track domains"
  ON public.track_domains FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = track_domains.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- SUPPRESSIONS TABLE
-- ============================================================================
ALTER TABLE public.suppressions ENABLE ROW LEVEL SECURITY;

-- Users can view suppressions in their organizations
CREATE POLICY "Users can view organization suppressions"
  ON public.suppressions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = suppressions.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create suppressions
CREATE POLICY "Owners and admins can create suppressions"
  ON public.suppressions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = suppressions.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update suppressions
CREATE POLICY "Owners and admins can update suppressions"
  ON public.suppressions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = suppressions.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete suppressions
CREATE POLICY "Only owners can delete suppressions"
  ON public.suppressions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = suppressions.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- STATISTICS TABLE
-- ============================================================================
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Users can view statistics in their organizations
CREATE POLICY "Users can view organization statistics"
  ON public.statistics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = statistics.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- System can insert statistics (service role bypasses RLS)
CREATE POLICY "System can insert statistics"
  ON public.statistics FOR INSERT
  WITH CHECK (true);

-- System can update statistics (service role bypasses RLS)
CREATE POLICY "System can update statistics"
  ON public.statistics FOR UPDATE
  USING (true);

-- ============================================================================
-- ADDRESS_ENDPOINTS TABLE
-- ============================================================================
ALTER TABLE public.address_endpoints ENABLE ROW LEVEL SECURITY;

-- Users can view address endpoints in their organizations
CREATE POLICY "Users can view organization address endpoints"
  ON public.address_endpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = address_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create address endpoints
CREATE POLICY "Owners and admins can create address endpoints"
  ON public.address_endpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = address_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update address endpoints
CREATE POLICY "Owners and admins can update address endpoints"
  ON public.address_endpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = address_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete address endpoints
CREATE POLICY "Only owners can delete address endpoints"
  ON public.address_endpoints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = address_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- HTTP_ENDPOINTS TABLE
-- ============================================================================
ALTER TABLE public.http_endpoints ENABLE ROW LEVEL SECURITY;

-- Users can view http endpoints in their organizations
CREATE POLICY "Users can view organization http endpoints"
  ON public.http_endpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = http_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create http endpoints
CREATE POLICY "Owners and admins can create http endpoints"
  ON public.http_endpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = http_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update http endpoints
CREATE POLICY "Owners and admins can update http endpoints"
  ON public.http_endpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = http_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete http endpoints
CREATE POLICY "Only owners can delete http endpoints"
  ON public.http_endpoints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = http_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );

-- ============================================================================
-- SMTP_ENDPOINTS TABLE
-- ============================================================================
ALTER TABLE public.smtp_endpoints ENABLE ROW LEVEL SECURITY;

-- Users can view smtp endpoints in their organizations
CREATE POLICY "Users can view organization smtp endpoints"
  ON public.smtp_endpoints FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = smtp_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
    )
  );

-- Only owners/admins can create smtp endpoints
CREATE POLICY "Owners and admins can create smtp endpoints"
  ON public.smtp_endpoints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = smtp_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners/admins can update smtp endpoints
CREATE POLICY "Owners and admins can update smtp endpoints"
  ON public.smtp_endpoints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = smtp_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role IN ('owner', 'admin')
    )
  );

-- Only owners can delete smtp endpoints
CREATE POLICY "Only owners can delete smtp endpoints"
  ON public.smtp_endpoints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_users
      WHERE organization_users.organization_id = smtp_endpoints.organization_id
      AND organization_users.user_id = auth.uid()::text
      AND organization_users.role = 'owner'
    )
  );
