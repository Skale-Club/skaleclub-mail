-- Templates table and RLS policy.
-- Run after 001_enable_rls.sql so the shared helper functions already exist.

CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    subject TEXT NOT NULL,
    plain_body TEXT,
    html_body TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT template_server_slug_unique UNIQUE (server_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_templates_server_id ON public.templates(server_id);

ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS templates_select_member ON public.templates;
DROP POLICY IF EXISTS templates_insert_editor ON public.templates;
DROP POLICY IF EXISTS templates_update_editor ON public.templates;
DROP POLICY IF EXISTS templates_delete_editor ON public.templates;
DROP POLICY IF EXISTS "Users can view organization templates" ON public.templates;
DROP POLICY IF EXISTS "Members can create templates" ON public.templates;
DROP POLICY IF EXISTS "Members can update templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can delete templates" ON public.templates;

CREATE POLICY templates_select_member
    ON public.templates FOR SELECT
    TO authenticated
    USING (public.is_server_member(server_id) OR public.is_platform_admin());

CREATE POLICY templates_insert_editor
    ON public.templates FOR INSERT
    TO authenticated
    WITH CHECK (public.is_server_editor(server_id) OR public.is_platform_admin());

CREATE POLICY templates_update_editor
    ON public.templates FOR UPDATE
    TO authenticated
    USING (public.is_server_editor(server_id) OR public.is_platform_admin())
    WITH CHECK (public.is_server_editor(server_id) OR public.is_platform_admin());

CREATE POLICY templates_delete_editor
    ON public.templates FOR DELETE
    TO authenticated
    USING (public.is_server_editor(server_id) OR public.is_platform_admin());
