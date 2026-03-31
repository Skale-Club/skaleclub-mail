#!/usr/bin/env tsx
/**
 * RLS Policy Verification Script
 *
 * Statically analyzes all SQL migration files in supabase/migrations/ to detect:
 * 1. Policies referencing server_id (should be organization_id)
 * 2. Policies calling dropped functions (is_server_member, is_server_admin, is_server_editor)
 * 3. Helper functions that query public.servers table
 * 4. Tables with RLS enabled but no active policies
 *
 * Usage: npx tsx scripts/verify-rls-policies.ts
 * Exit: 0 on pass, 1 on failure
 */

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

interface PolicyState {
  name: string
  table: string
  sql: string
  file: string
}

interface FunctionState {
  name: string
  body: string
  file: string
}

const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations')

function getMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
}

/**
 * Strip SQL line comments (-- ...) and block comments (...)
 * while preserving dollar-quoted strings.
 */
function stripComments(sql: string): string {
  let result = ''
  let i = 0
  let inDollarQuote = false
  let dollarTag = ''

  while (i < sql.length) {
    // Handle dollar quotes
    if (sql[i] === '$') {
      const tagMatch = sql.slice(i).match(/^\$(\w*)\$/)
      if (tagMatch) {
        if (!inDollarQuote) {
          inDollarQuote = true
          dollarTag = tagMatch[1]
        } else if (tagMatch[1] === dollarTag) {
          inDollarQuote = false
          dollarTag = ''
        }
        result += tagMatch[0]
        i += tagMatch[0].length
        continue
      }
    }

    // Skip comments only outside dollar quotes
    if (!inDollarQuote) {
      // Line comment
      if (sql[i] === '-' && sql[i + 1] === '-') {
        // Skip to end of line
        while (i < sql.length && sql[i] !== '\n') i++
        result += '\n' // preserve newline for statement separation
        i++
        continue
      }
      // Block comment
      if (sql[i] === '/' && sql[i + 1] === '*') {
        i += 2
        while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++
        i += 2
        result += ' '
        continue
      }
    }

    result += sql[i]
    i++
  }

  return result
}

/**
 * Split SQL into individual statements on semicolons,
 * respecting dollar-quoted blocks.
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ''
  let inDollarQuote = false
  let dollarTag = ''

  let i = 0
  while (i < sql.length) {
    if (sql[i] === '$') {
      const tagMatch = sql.slice(i).match(/^\$(\w*)\$/)
      if (tagMatch) {
        const tag = tagMatch[1]
        if (!inDollarQuote) {
          inDollarQuote = true
          dollarTag = tag
        } else if (tag === dollarTag) {
          inDollarQuote = false
          dollarTag = ''
        }
        current += tagMatch[0]
        i += tagMatch[0].length
        continue
      }
    }

    if (sql[i] === ';' && !inDollarQuote) {
      const trimmed = current.trim()
      if (trimmed) statements.push(trimmed)
      current = ''
      i++
      continue
    }

    current += sql[i]
    i++
  }

  const trimmed = current.trim()
  if (trimmed) statements.push(trimmed)

  return statements
}

function extractFunctionName(stmt: string): string | null {
  const match = stmt.match(
    /(?:CREATE\s+OR\s+REPLACE\s+FUNCTION|DROP\s+FUNCTION(?:\s+IF\s+EXISTS)?)\s+(?:public\.)?(\w+)\s*\(/
  )
  return match ? match[1] : null
}

function extractPolicyInfo(stmt: string): { name: string; table: string } | null {
  // CREATE POLICY name ON [public.]table
  const createMatch = stmt.match(
    /CREATE\s+POLICY\s+(\w+)\s+ON\s+(?:public\.)?(\w+)/i
  )
  if (createMatch) return { name: createMatch[1], table: createMatch[2] }

  // DROP POLICY [IF EXISTS] name ON [public.]table
  const dropMatch = stmt.match(
    /DROP\s+POLICY\s+(?:IF\s+EXISTS\s+)?(\w+)\s+ON\s+(?:public\.)?(\w+)/i
  )
  if (dropMatch) return { name: dropMatch[1], table: dropMatch[2] }

  return null
}

function run(): boolean {
  const errors: string[] = []
  const warnings: string[] = []

  const files = getMigrationFiles()
  console.log(`Analyzing ${files.length} migration files...\n`)

  // State tracking
  const activeFunctions = new Map<string, FunctionState>()
  const activePolicies = new Map<string, PolicyState>() // key: "table.policy_name"
  const rlsEnabledTables = new Set<string>()
  const deadFunctions = new Set(['is_server_member', 'is_server_admin', 'is_server_editor'])

  for (const file of files) {
    const filePath = join(MIGRATIONS_DIR, file)
    const rawContent = readFileSync(filePath, 'utf-8')
    // Strip comments first to avoid comment-statement merging issues
    const content = stripComments(rawContent)
    const statements = splitStatements(content)

    for (const stmt of statements) {
      const upper = stmt.toUpperCase().trim()

      // Track ENABLE ROW LEVEL SECURITY
      if (upper.includes('ENABLE ROW LEVEL SECURITY')) {
        const tableMatch = stmt.match(/(?:public\.)?(\w+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i)
        if (tableMatch) {
          rlsEnabledTables.add(tableMatch[1])
        }
      }

      // Track function creation
      if (upper.includes('CREATE') && upper.includes('FUNCTION')) {
        const funcName = extractFunctionName(stmt)
        if (funcName) {
          activeFunctions.set(funcName, {
            name: funcName,
            body: stmt,
            file,
          })
        }
      }

      // Track function drops
      if (upper.includes('DROP') && upper.includes('FUNCTION')) {
        const funcName = extractFunctionName(stmt)
        if (funcName) {
          activeFunctions.delete(funcName)
        }
      }

      // Track policy creation
      if (upper.includes('CREATE POLICY')) {
        const info = extractPolicyInfo(stmt)
        if (info) {
          const key = `${info.table}.${info.name}`
          activePolicies.set(key, {
            name: info.name,
            table: info.table,
            sql: stmt,
            file,
          })
        }
      }

      // Track policy drops
      if (upper.includes('DROP POLICY')) {
        const info = extractPolicyInfo(stmt)
        if (info) {
          const key = `${info.table}.${info.name}`
          activePolicies.delete(key)
        }
      }
    }
  }

  // After processing all migrations, run checks
  console.log('=== RLS Policy Verification ===\n')

  // Check 1: Active policies referencing server_id
  console.log('Check 1: Policies referencing server_id...')
  let check1Pass = true
  for (const [key, policy] of activePolicies) {
    if (policy.sql.includes('server_id')) {
      errors.push(
        `[FAIL] Policy "${policy.name}" on ${policy.table} references server_id (file: ${policy.file})`
      )
      check1Pass = false
    }
  }
  if (check1Pass) {
    console.log('  PASS — No active policies reference server_id\n')
  } else {
    console.log('  FAIL — Found policies referencing server_id\n')
  }

  // Check 2: Active policies calling dead functions
  console.log('Check 2: Policies calling dead functions...')
  let check2Pass = true
  for (const [key, policy] of activePolicies) {
    for (const deadFunc of deadFunctions) {
      if (policy.sql.includes(deadFunc)) {
        errors.push(
          `[FAIL] Policy "${policy.name}" on ${policy.table} calls dropped function ${deadFunc} (file: ${policy.file})`
        )
        check2Pass = false
      }
    }
  }
  if (check2Pass) {
    console.log('  PASS — No active policies call dead functions\n')
  } else {
    console.log('  FAIL — Found policies calling dropped functions\n')
  }

  // Check 3: Active functions querying public.servers
  console.log('Check 3: Functions querying public.servers...')
  let check3Pass = true
  for (const [name, func] of activeFunctions) {
    if (func.body.includes('public.servers') || /\bFROM\s+servers\b/i.test(func.body)) {
      errors.push(
        `[FAIL] Function "${name}" queries public.servers table (file: ${func.file})`
      )
      check3Pass = false
    }
  }
  if (check3Pass) {
    console.log('  PASS — No active functions query public.servers\n')
  } else {
    console.log('  FAIL — Found functions querying public.servers\n')
  }

  // Check 4: Tables with RLS enabled but no active policies
  console.log('Check 4: Tables with RLS enabled but no policies...')
  let check4Pass = true
  const tablesWithPolicies = new Set<string>()
  for (const [key, policy] of activePolicies) {
    tablesWithPolicies.add(policy.table)
  }
  // Tables that are expected to have org-scoped policies
  const criticalTables = [
    'domains', 'credentials', 'routes', 'smtp_endpoints', 'http_endpoints',
    'address_endpoints', 'messages', 'deliveries', 'webhooks', 'webhook_requests',
    'track_domains', 'suppressions', 'statistics',
    'email_accounts', 'lead_lists', 'leads', 'campaigns', 'outreach_emails', 'outreach_analytics',
  ]
  for (const table of criticalTables) {
    if (rlsEnabledTables.has(table) && !tablesWithPolicies.has(table)) {
      warnings.push(`[WARN] Critical table "${table}" has RLS enabled but no active policies`)
      check4Pass = false
    }
  }
  if (check4Pass) {
    console.log('  PASS — All critical tables have active policies\n')
  } else {
    console.log('  WARN — Some tables have RLS but no policies (see warnings)\n')
  }

  // Check 5: is_outreach_org_member should not exist
  console.log('Check 5: Duplicate is_outreach_org_member removed...')
  let check5Pass = true
  if (activeFunctions.has('is_outreach_org_member')) {
    errors.push(
      `[FAIL] Duplicate function is_outreach_org_member still exists (should use is_org_member)`
    )
    check5Pass = false
  }
  if (check5Pass) {
    console.log('  PASS — is_outreach_org_member consolidated\n')
  } else {
    console.log('  FAIL — is_outreach_org_member still exists\n')
  }

  // Print summary
  console.log('=== Summary ===')
  console.log(`Migration files analyzed: ${files.length}`)
  console.log(`Active policies tracked: ${activePolicies.size}`)
  console.log(`Active helper functions: ${activeFunctions.size}`)
  console.log(`RLS-enabled tables: ${rlsEnabledTables.size}`)
  console.log()

  if (warnings.length > 0) {
    console.log('Warnings:')
    for (const w of warnings) {
      console.log(`  ${w}`)
    }
    console.log()
  }

  if (errors.length > 0) {
    console.log('Errors:')
    for (const e of errors) {
      console.log(`  ${e}`)
    }
    console.log()
    console.log('RESULT: FAIL')
    process.exit(1)
  } else {
    console.log('RESULT: PASS')
    if (warnings.length > 0) {
      console.log('(with warnings — review non-critical tables above)')
    }
    process.exit(0)
  }
}

run()
