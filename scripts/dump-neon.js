/**
 * dump-neon.js
 * Exports all Neon tables to a .sql file compatible with psql import on VPS.
 * Run: node scripts/dump-neon.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const CONNECTION_STRING =
  'postgresql://neondb_owner:npg_NZjz7ATJUM3C@ep-dark-union-aiyemuh7-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// All tables in dependency order (parents before children)
const TABLES = [
  'admin_users',
  'users',
  'services',
  'bookings',
  'loyalty_cards',
  'stamps',
  'referrals',
  'reviews',
  'notification_logs',
  'slider_images',
  'gallery_images',
  'customer_notes',
  'page_views',
  'tasks',
  'task_updates',
];

// Enum types used in the schema
const ENUMS = [
  { name: 'BookingStatus', values: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
  { name: 'TaskStatus',    values: ['TODO', 'IN_PROGRESS', 'DONE'] },
  { name: 'TaskPriority',  values: ['LOW', 'MEDIUM', 'HIGH'] },
];

function escape(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  if (Array.isArray(val)) {
    if (val.length === 0) return "ARRAY[]::TEXT[]";   // ← fix: typed empty array
    const inner = val.map(v => `'${String(v).replace(/'/g, "''")}'`).join(',');
    return `ARRAY[${inner}]`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  const client = new Client({ connectionString: CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected to Neon');

  const outPath = path.join(__dirname, '..', 'glitz_neon_backup.sql');
  const lines = [];

  lines.push('-- Glitz & Glamour Neon → VPS backup');
  lines.push(`-- Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('SET client_encoding = \'UTF8\';');
  lines.push('SET standard_conforming_strings = on;');
  lines.push('');

  // Create enum types (safe: use DO block so it won't fail if they exist)
  for (const en of ENUMS) {
    lines.push(`DO $$ BEGIN`);
    lines.push(`  CREATE TYPE "${en.name}" AS ENUM (${en.values.map(v => `'${v}'`).join(', ')});`);
    lines.push(`EXCEPTION WHEN duplicate_object THEN null;`);
    lines.push(`END $$;`);
    lines.push('');
  }

  for (const table of TABLES) {
    let rows;
    try {
      const res = await client.query(`SELECT * FROM "${table}" ORDER BY "createdAt" ASC NULLS FIRST`);
      rows = res.rows;
    } catch (e) {
      // Try without ORDER BY (table might not have createdAt)
      try {
        const res = await client.query(`SELECT * FROM "${table}"`);
        rows = res.rows;
      } catch (e2) {
        console.warn(`⚠️  Skipping table "${table}": ${e2.message}`);
        continue;
      }
    }

    console.log(`  → ${table}: ${rows.length} rows`);
    lines.push(`-- TABLE: ${table} (${rows.length} rows)`);

    if (rows.length === 0) {
      lines.push('');
      continue;
    }

    const columns = Object.keys(rows[0]).map(c => `"${c}"`).join(', ');

    for (const row of rows) {
      const values = Object.values(row).map(escape).join(', ');
      lines.push(`INSERT INTO "${table}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;`);
    }
    lines.push('');
  }

  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  await client.end();

  const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Done! Backup saved to: glitz_neon_backup.sql (${sizeMB} MB)`);
  console.log('   Ready to copy to VPS with: scp glitz_neon_backup.sql root@31.97.236.172:/tmp/');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
