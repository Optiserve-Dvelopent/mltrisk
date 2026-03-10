-- ================================================================
-- MLTRisk – Database Schema
-- ================================================================
-- Run this once against your Vercel Postgres (or any PostgreSQL)
-- database to initialise the users table.
--
-- Usage (Vercel CLI):
--   vercel env pull .env.local
--   psql $POSTGRES_URL -f db/schema.sql
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255) UNIQUE NOT NULL CHECK (username = lower(username)),
  password_hash VARCHAR(255)        NOT NULL,
  created_at    TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- Example: create an initial admin user.
-- Replace 'admin' and the bcrypt hash with your own values.
-- Generate a hash with:  node -e "const b=require('bcryptjs'); console.log(b.hashSync('YourPassword',12));"
--
-- INSERT INTO users (username, password_hash)
-- VALUES ('admin', '$2a$12$...');
