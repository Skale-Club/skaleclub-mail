# GitHub Secrets Setup for Hetzner Deployment
# Run this in PowerShell

param(
    [string]$HetznerHost = ""
)

# Check if gh is installed
$ghCheck = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghCheck) {
    Write-Host "Installing GitHub CLI..." -ForegroundColor Yellow
    winget install GitHub.cli
}

# Check auth
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please run: gh auth login" -ForegroundColor Red
    exit 1
}

# Load .env
$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    $envPath = Join-Path $PSScriptRoot "..\..\.env"
}
$envContent = Get-Content $envPath

$envVars = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

# Prompt for Hetzner Host if not provided
if (-not $HetznerHost) {
    Write-Host "Enter your Hetzner Server IP:" -ForegroundColor Cyan
    $HetznerHost = Read-Host
}

# Get SSH key
$sshKeyPath = "$env:USERPROFILE\.ssh\id_ed25519"
if (-not (Test-Path $sshKeyPath)) {
    $sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
}
$sshKey = Get-Content $sshKeyPath -Raw

Write-Host "`nSetting GitHub Secrets..." -ForegroundColor Green

# Set secrets
gh secret set HETZNER_HOST --body $HetznerHost
gh secret set HETZNER_SSH_KEY --body $sshKey
gh secret set SUPABASE_URL --body $envVars["SUPABASE_URL"]
gh secret set SUPABASE_ANON_KEY --body $envVars["SUPABASE_ANON_KEY"]
gh secret set SUPABASE_SERVICE_ROLE_KEY --body $envVars["SUPABASE_SERVICE_ROLE_KEY"]
gh secret set DATABASE_URL --body $envVars["DATABASE_URL"]
gh secret set JWT_SECRET --body $envVars["JWT_SECRET"]
gh secret set ENCRYPTION_KEY --body $envVars["ENCRYPTION_KEY"]
gh secret set OUTLOOK_TOKEN_ENCRYPTION_KEY --body $envVars["OUTLOOK_TOKEN_ENCRYPTION_KEY"]
gh secret set MAIL_DOMAIN --body $envVars["MAIL_DOMAIN"]
gh secret set SMTP_HOST --body $envVars["SMTP_HOST"]
gh secret set SMTP_PORT --body $envVars["SMTP_PORT"]
gh secret set SMTP_USER --body $envVars["SMTP_USER"]
gh secret set SMTP_PASS --body $envVars["SMTP_PASS"]
gh secret set SMTP_FROM --body $envVars["SMTP_FROM"]

Write-Host "`n✅ All secrets configured!" -ForegroundColor Green
