-- 002_create_main_tables.sql
-- This file creates the main tables for items (ingested records) and files (associated file URLs).

CREATE TABLE IF NOT EXISTS items (
  item_id BIGSERIAL PRIMARY KEY,
  source_id INTEGER NOT NULL REFERENCES sources(source_id),
  source_item_id TEXT NOT NULL,  -- External source identifier (e.g., Archive.org identifier)
  title TEXT NOT NULL,
  description TEXT,
  creator_override TEXT,         -- Optional display value for creator(s)
  publication_date DATE,         -- Date of publication or release (if available)
  type_id INTEGER NOT NULL REFERENCES media_types(type_id),
  license_id INTEGER NOT NULL REFERENCES licenses(license_id),
  source_url TEXT NOT NULL,      -- Publicly accessible metadata page URL
  extra_info JSONB,              -- Any additional, unstructured metadata
  inserted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, source_item_id)
);

CREATE TABLE IF NOT EXISTS files (
  file_id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,       -- Absolute URL (publicly accessible)
  format TEXT,                  -- E.g., 'PDF', 'JPEG'
  size BIGINT,                  -- File size in bytes, if provided
  notes TEXT
);
