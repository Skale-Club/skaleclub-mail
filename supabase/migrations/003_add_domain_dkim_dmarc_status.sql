-- Add DKIM and DMARC status columns to domains table
ALTER TABLE domains
    ADD COLUMN IF NOT EXISTS dkim_status text DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS dkim_error text,
    ADD COLUMN IF NOT EXISTS dmarc_status text DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS dmarc_error text;
