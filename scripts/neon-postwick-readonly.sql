-- Postwick roles on the SHARED Kerygma Neon database.
-- Do NOT create a separate Neon project — Postwick reads the same posts/brands.
--
-- Run in Neon SQL Editor (Kerygma project) as an owner/admin role.
-- Prefer a write-capable Postwick role if you enable Owner Studio
-- (claim codes, username, caption edits). Use read-only only for feed-only deploys.

-- 1) Create login role (change the password before running)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postwick_app') THEN
    CREATE ROLE postwick_app LOGIN PASSWORD 'REPLACE_WITH_STRONG_PASSWORD'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;

-- 2) Schema usage
GRANT USAGE ON SCHEMA public TO postwick_app;

-- 3) Brand + post reads (includes user_id for owner username join)
GRANT SELECT (
  id,
  user_id,
  name,
  website_url,
  description,
  is_public,
  public_slug,
  public_niche
) ON brands TO postwick_app;

GRANT SELECT (
  id,
  brand_id,
  platform,
  content,
  image_url,
  status,
  published_at,
  is_public,
  updated_at
) ON posts TO postwick_app;

-- 4) Owner studio: claim / accounts + limited post updates
GRANT SELECT, INSERT, UPDATE ON postwick_claim_codes TO postwick_app;
GRANT SELECT, INSERT, UPDATE ON postwick_accounts TO postwick_app;
GRANT UPDATE (content, is_public, updated_at) ON posts TO postwick_app;

-- Optional legacy read-only role (feed only — no Studio writes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postwick_readonly') THEN
    CREATE ROLE postwick_readonly LOGIN PASSWORD 'REPLACE_WITH_STRONG_PASSWORD'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO postwick_readonly;
GRANT SELECT (
  id,
  user_id,
  name,
  website_url,
  description,
  is_public,
  public_slug,
  public_niche
) ON brands TO postwick_readonly;
GRANT SELECT (
  id,
  brand_id,
  platform,
  content,
  image_url,
  status,
  published_at,
  is_public
) ON posts TO postwick_readonly;
GRANT SELECT (kerygma_user_id, username) ON postwick_accounts TO postwick_readonly;
