const { Pool } = require("pg");

const MIGRATION_SQL = `
-- Migration: 001_create_blog_claps_table
-- Description: Creates the blog_claps table for tracking user claps on blog posts
-- Date: 2026-04-23

CREATE TABLE IF NOT EXISTS blog_claps (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  visitor_key TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(slug, visitor_key)
);

-- Index for faster lookups by slug
CREATE INDEX IF NOT EXISTS idx_blog_claps_slug ON blog_claps(slug);

-- Index for faster lookups by visitor_key
CREATE INDEX IF NOT EXISTS idx_blog_claps_visitor_key ON blog_claps(visitor_key);
`;

async function runMigration() {
  const connectionString = process.env.DATABASE_URL_DIRECT;

  if (!connectionString) {
    console.error("DATABASE_URL_DIRECT environment variable is not set");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: true },
  });

  try {
    console.log("Connecting to Supabase database...");
    const client = await pool.connect();

    console.log("Running migration: 001_create_blog_claps_table");
    await client.query(MIGRATION_SQL);

    console.log("Verifying table creation...");
    const result = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_name = 'blog_claps'
    `);

    if (result.rows.length > 0) {
      console.log(`✅ Table 'blog_claps' created successfully`);
    } else {
      console.error("❌ Table creation verification failed");
      process.exit(1);
    }

    console.log("Checking indexes...");
    const indexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'blog_claps' AND indexname LIKE 'idx_%'
    `);

    console.log(`✅ Created ${indexes.rows.length} indexes:`);
    indexes.rows.forEach(row => console.log(`   - ${row.indexname}`));

    client.release();
    await pool.end();

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    await pool.end();
    process.exit(1);
  }
}

runMigration();