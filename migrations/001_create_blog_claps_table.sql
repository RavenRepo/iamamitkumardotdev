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
