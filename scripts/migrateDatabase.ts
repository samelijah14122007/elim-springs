import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function migrate() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const dbMatch = envContent.match(/DATABASE_URL\s*=\s*(.+)/);
  if (!dbMatch) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
  }

  const databaseUrl = dbMatch[1].trim().replace(/^['"]|['"]$/g, '');
  console.log('Connecting to Supabase PostgreSQL database...');

  // Supabase PostgreSQL requires SSL
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Successfully connected to Supabase PostgreSQL via DATABASE_URL');

    // 1. Run Schema SQL
    console.log('Running supabase/schema.sql...');
    const schemaSql = fs.readFileSync(path.resolve('supabase/schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✓ Schema applied successfully (18 tables, triggers, indexes, RLS created).');

    // 2. Run Seed Demo Data SQL
    console.log('Running supabase/migrations/20260927000002_seed_demo_data.sql...');
    const seedSql = fs.readFileSync(path.resolve('supabase/migrations/20260927000002_seed_demo_data.sql'), 'utf8');
    await client.query(seedSql);
    console.log('✓ Demo data seeded successfully.');

    // 3. Verify Tables in information_schema
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`\nVerified Public Tables (${res.rows.length}):`);
    res.rows.forEach(r => console.log(`   ✓ ${r.table_name}`));

    await client.end();
    console.log('\nMigration and verification completed successfully!');
  } catch (err: any) {
    console.error('Migration error:', err.message || err);
    try { await client.end(); } catch {}
    process.exit(1);
  }
}

migrate();
