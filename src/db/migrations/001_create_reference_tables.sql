-- 001_create_reference_tables.sql
-- This file creates the reference tables for sources, media_types, licenses, creators, and subjects.

CREATE TABLE IF NOT EXISTS sources (
  source_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  api_endpoint TEXT,
  website_url TEXT,
  auth_details JSONB,      -- e.g., API keys, OAuth info (optionally encrypted)
  rate_limit_config JSONB, -- recommended rate limits or notes
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS media_types (
  type_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., 'Text', 'Image', 'Audio', 'Video', 'Film'
  description TEXT
);

CREATE TABLE IF NOT EXISTS licenses (
  license_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- e.g., 'Public Domain', 'CC BY 4.0', 'CC0'
  description TEXT,
  reference_url TEXT         -- URL to the official license text
);

CREATE TABLE IF NOT EXISTS creators (
  creator_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  additional_info TEXT,      -- e.g., brief biography or reference URL
  UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS subjects (
  subject_id SERIAL PRIMARY KEY,
  subject TEXT NOT NULL UNIQUE
);
