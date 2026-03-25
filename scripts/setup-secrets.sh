#!/bin/bash

# Setup GitHub Secrets for Hetzner Deployment
# Run this after creating your Hetzner server

set -e

# Load .env file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "$PROJECT_DIR/.env" ]; then
    export $(cat "$PROJECT_DIR/.env" | grep -v '^#' | xargs)
fi

echo "Setting up GitHub Secrets..."

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "Installing GitHub CLI..."
    brew install gh
fi

# Authenticate if needed
gh auth status || gh auth login

# Set secrets
echo "Enter your Hetzner Server IP:"
read HETZNER_HOST

echo "Enter your Hetzner SSH private key path:"
read SSH_KEY_PATH

SSH_KEY=$(cat "$SSH_KEY_PATH")

echo "Setting GitHub Secrets..."

gh secret set HETZNER_HOST --body "$HETZNER_HOST"
gh secret set HETZNER_SSH_KEY --body "$SSH_KEY"
gh secret set SUPABASE_URL --body "$SUPABASE_URL"
gh secret set SUPABASE_ANON_KEY --body "$SUPABASE_ANON_KEY"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "$SUPABASE_SERVICE_ROLE_KEY"
gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set JWT_SECRET --body "$JWT_SECRET"
gh secret set ENCRYPTION_KEY --body "$ENCRYPTION_KEY"
gh secret set OUTLOOK_TOKEN_ENCRYPTION_KEY --body "$OUTLOOK_TOKEN_ENCRYPTION_KEY"
gh secret set MAIL_DOMAIN --body "$MAIL_DOMAIN"
gh secret set SMTP_HOST --body "$SMTP_HOST"
gh secret set SMTP_PORT --body "$SMTP_PORT"
gh secret set SMTP_USER --body "$SMTP_USER"
gh secret set SMTP_PASS --body "$SMTP_PASS"
gh secret set SMTP_FROM --body "$SMTP_FROM"

echo "✅ All secrets configured!"
