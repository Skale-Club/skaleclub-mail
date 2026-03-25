-- Add mail_host column to system_branding table
ALTER TABLE system_branding ADD COLUMN IF NOT EXISTS mail_host text;
