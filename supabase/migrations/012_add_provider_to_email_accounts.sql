-- Migration: Add provider and outlook_mailbox_id to email_accounts
-- This enables linking OAuth Outlook mailboxes with outreach email accounts

-- Add provider column (defaults to 'smtp')
ALTER TABLE email_accounts 
ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'smtp';

-- Add outlook_mailbox_id foreign key
ALTER TABLE email_accounts 
ADD COLUMN IF NOT EXISTS outlook_mailbox_id UUID REFERENCES outlook_mailboxes(id) ON DELETE SET NULL;

-- Make SMTP fields nullable for OAuth providers
ALTER TABLE email_accounts 
ALTER COLUMN smtp_host DROP NOT NULL,
ALTER COLUMN smtp_port DROP NOT NULL,
ALTER COLUMN smtp_username DROP NOT NULL,
ALTER COLUMN smtp_password DROP NOT NULL;

-- Update existing records to set provider = 'smtp' where smtp_host is not null
UPDATE email_accounts 
SET provider = 'smtp' 
WHERE smtp_host IS NOT NULL AND provider IS NULL;

-- Add index for outlook_mailbox_id lookups
CREATE INDEX IF NOT EXISTS idx_email_accounts_outlook_mailbox_id 
ON email_accounts(outlook_mailbox_id);

-- Add comment
COMMENT ON COLUMN email_accounts.provider IS 'Email provider type: smtp, outlook';
COMMENT ON COLUMN email_accounts.outlook_mailbox_id IS 'References outlook_mailboxes.id for OAuth-based Outlook accounts';
