-- 003_create_junction_tables.sql
-- This file creates many-to-many relationships for items with creators and subjects.

CREATE TABLE IF NOT EXISTS item_creators (
  item_id BIGINT NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  creator_id INTEGER NOT NULL REFERENCES creators(creator_id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, creator_id)
);

CREATE TABLE IF NOT EXISTS item_subjects (
  item_id BIGINT NOT NULL REFERENCES items(item_id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, subject_id)
);
