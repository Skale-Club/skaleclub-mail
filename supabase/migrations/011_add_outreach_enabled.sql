-- Add outreach_enabled column to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS outreach_enabled boolean DEFAULT true NOT NULL;
