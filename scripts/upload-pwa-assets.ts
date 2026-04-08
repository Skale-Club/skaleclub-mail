/**
 * Uploads PWA icon assets to Supabase Storage (branding-assets bucket).
 * Run once after generating the PNG icons or when icons change.
 *
 * Usage: npx tsx scripts/upload-pwa-assets.ts
 */
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const BUCKET = 'branding-assets'

const assets = [
    { file: 'public/pwa-192x192.png',          storagePath: 'pwa-icon-192.png',      mime: 'image/png' },
    { file: 'public/pwa-512x512.png',          storagePath: 'pwa-icon-512.png',      mime: 'image/png' },
    { file: 'public/pwa-512x512-maskable.png', storagePath: 'pwa-icon-maskable.png', mime: 'image/png' },
    { file: 'public/apple-touch-icon.png',     storagePath: 'apple-touch-icon.png',  mime: 'image/png' },
]

for (const asset of assets) {
    const filePath = path.resolve(__dirname, '..', asset.file)
    const buffer = await readFile(filePath)

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(asset.storagePath, buffer, {
            contentType: asset.mime,
            upsert: true,
        })

    if (error) {
        console.error(`❌ Failed to upload ${asset.storagePath}:`, error.message)
        process.exit(1)
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${asset.storagePath}`
    console.log(`✅ ${asset.storagePath} → ${publicUrl}`)
}

console.log('\nDone. Update VITE_SUPABASE_URL in your .env if not already set.')
