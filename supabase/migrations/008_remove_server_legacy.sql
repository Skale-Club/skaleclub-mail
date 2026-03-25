-- Remove legacy server-related functions and tables
-- The application now uses organizations directly instead of a servers layer

-- Drop policies that depend on legacy functions first
DROP POLICY IF EXISTS webhook_requests_select_member ON public.webhook_requests;

-- Drop legacy server helper functions
DROP FUNCTION IF EXISTS public.is_server_member(uuid);
DROP FUNCTION IF EXISTS public.is_server_admin(uuid);
DROP FUNCTION IF EXISTS public.is_server_editor(uuid);
DROP FUNCTION IF EXISTS public.is_webhook_member(uuid);

-- Drop legacy servers table if it exists
DROP TABLE IF EXISTS public.servers CASCADE;

-- Recreate is_webhook_member using organization_id directly
CREATE OR REPLACE FUNCTION public.is_webhook_member(target_webhook_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.webhooks w
        JOIN public.organization_users ou ON ou.organization_id = w.organization_id
        WHERE w.id = target_webhook_id
          AND ou.user_id = auth.uid()
    );
$$;

-- Recreate webhook_requests policy
CREATE POLICY webhook_requests_select_member
    ON public.webhook_requests FOR SELECT
    TO authenticated
    USING (public.is_webhook_member(webhook_id) OR public.is_platform_admin());
