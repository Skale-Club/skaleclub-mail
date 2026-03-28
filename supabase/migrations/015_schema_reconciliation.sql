-- Reconcile production schema with the tables/columns the application already uses.
-- This migration is intentionally idempotent so it can safely heal drifted environments.

-- ---------------------------------------------------------------------------
-- MAILBOXS / OUTREACH COLUMN DRIFT
-- ---------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.mailboxes
    ADD COLUMN IF NOT EXISTS is_native boolean NOT NULL DEFAULT false;

ALTER TABLE IF EXISTS public.email_accounts
    ADD COLUMN IF NOT EXISTS last_sent_at timestamp;

-- ---------------------------------------------------------------------------
-- CONTACTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    first_name text,
    last_name text,
    company text,
    emailed_count integer NOT NULL DEFAULT 0,
    last_emailed_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS contact_user_email_unique
    ON public.contacts (user_id, email);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id
    ON public.contacts (user_id);

CREATE INDEX IF NOT EXISTS idx_contacts_user_last_emailed_at
    ON public.contacts (user_id, last_emailed_at DESC);

ALTER TABLE IF EXISTS public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contacts_select_owner ON public.contacts;
DROP POLICY IF EXISTS contacts_insert_owner ON public.contacts;
DROP POLICY IF EXISTS contacts_update_owner ON public.contacts;
DROP POLICY IF EXISTS contacts_delete_owner ON public.contacts;

CREATE POLICY contacts_select_owner
    ON public.contacts FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY contacts_insert_owner
    ON public.contacts FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY contacts_update_owner
    ON public.contacts FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY contacts_delete_owner
    ON public.contacts FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- MAIL FILTERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mail_filters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mailbox_id uuid NOT NULL REFERENCES public.mailboxes(id) ON DELETE CASCADE,
    name text NOT NULL,
    conditions jsonb NOT NULL,
    actions jsonb NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    priority integer NOT NULL DEFAULT 0,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mail_filters_mailbox_id
    ON public.mail_filters (mailbox_id);

CREATE INDEX IF NOT EXISTS idx_mail_filters_mailbox_active_priority
    ON public.mail_filters (mailbox_id, is_active, priority DESC);

ALTER TABLE IF EXISTS public.mail_filters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mail_filters_select_owner ON public.mail_filters;
DROP POLICY IF EXISTS mail_filters_insert_owner ON public.mail_filters;
DROP POLICY IF EXISTS mail_filters_update_owner ON public.mail_filters;
DROP POLICY IF EXISTS mail_filters_delete_owner ON public.mail_filters;

CREATE POLICY mail_filters_select_owner
    ON public.mail_filters FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = public.mail_filters.mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY mail_filters_insert_owner
    ON public.mail_filters FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY mail_filters_update_owner
    ON public.mail_filters FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = public.mail_filters.mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY mail_filters_delete_owner
    ON public.mail_filters FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = public.mail_filters.mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- SIGNATURES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.signatures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mailbox_id uuid NOT NULL REFERENCES public.mailboxes(id) ON DELETE CASCADE,
    name text NOT NULL,
    content text NOT NULL,
    is_default boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signatures_mailbox_id
    ON public.signatures (mailbox_id);

CREATE UNIQUE INDEX IF NOT EXISTS signatures_default_per_mailbox_unique
    ON public.signatures (mailbox_id)
    WHERE is_default = true;

ALTER TABLE IF EXISTS public.signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS signatures_select_owner ON public.signatures;
DROP POLICY IF EXISTS signatures_insert_owner ON public.signatures;
DROP POLICY IF EXISTS signatures_update_owner ON public.signatures;
DROP POLICY IF EXISTS signatures_delete_owner ON public.signatures;

CREATE POLICY signatures_select_owner
    ON public.signatures FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = public.signatures.mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY signatures_insert_owner
    ON public.signatures FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY signatures_update_owner
    ON public.signatures FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = public.signatures.mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );

CREATE POLICY signatures_delete_owner
    ON public.signatures FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.mailboxes
            WHERE public.mailboxes.id = public.signatures.mailbox_id
              AND public.mailboxes.user_id = auth.uid()
        )
    );
