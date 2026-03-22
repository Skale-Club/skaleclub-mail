ALTER TYPE server_send_mode ADD VALUE IF NOT EXISTS 'outlook';
ALTER TYPE webhook_event ADD VALUE IF NOT EXISTS 'test';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'outlook_mailbox_status'
    ) THEN
        CREATE TYPE outlook_mailbox_status AS ENUM ('active', 'expired', 'revoked');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS outlook_mailboxes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
    email text NOT NULL,
    display_name text,
    microsoft_user_id text NOT NULL,
    tenant_id text,
    scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
    access_token_encrypted text NOT NULL,
    refresh_token_encrypted text NOT NULL,
    token_expires_at timestamp NOT NULL,
    status outlook_mailbox_status NOT NULL DEFAULT 'active',
    last_synced_at timestamp,
    last_send_at timestamp,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS outlook_mailboxes_server_email_unique
    ON outlook_mailboxes (server_id, email);

CREATE UNIQUE INDEX IF NOT EXISTS outlook_mailboxes_microsoft_user_unique
    ON outlook_mailboxes (microsoft_user_id);
