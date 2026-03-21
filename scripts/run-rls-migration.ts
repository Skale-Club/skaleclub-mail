import 'dotenv/config';
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL is not set in .env file');
        process.exit(1);
    }

    console.log('Connecting to database...');
    const sql = postgres(connectionString, { ssl: 'require' });

    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '../supabase/migrations/001_enable_rls.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        console.log('Running RLS migration...');

        // Split by semicolons and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await sql.unsafe(statement);
                    console.log(`✓ Executed: ${statement.substring(0, 60)}...`);
                } catch (error: any) {
                    // Ignore "already exists" errors
                    if (!error.message.includes('already exists') &&
                        !error.message.includes('already enabled')) {
                        console.error(`Error: ${error.message}`);
                    }
                }
            }
        }

        console.log('\n✅ RLS migration completed successfully!');
    } catch (error: any) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

runMigration();
