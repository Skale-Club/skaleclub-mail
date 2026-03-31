-- =============================================================================
-- indexes.sql — Safe Index Creation (CONCURRENTLY)
-- =============================================================================
--
-- This file contains CREATE INDEX CONCURRENTLY statements for all indexes.
--
-- IMPORTANT:
--   - Execute via:  npm run db:indexes
--   - DO NOT run through db:push or any tool that wraps statements in transactions
--   - CREATE INDEX CONCURRENTLY cannot run inside a transaction block
--   - CONCURRENTLY allows writes to continue during index creation
--
-- For index health verification after execution, run:
--   npx tsx scripts/verify-indexes.ts
-- =============================================================================

-- Phase 06 will populate this file with all required indexes
-- (FK columns, composite indexes for common queries, etc.)

-- Example: Index on messages.organization_id for org-scoped message queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_organization_id
    ON messages (organization_id);
