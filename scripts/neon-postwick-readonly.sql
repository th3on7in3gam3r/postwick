-- Postwick read-only role on the SHARED Kerygma Neon database.
-- Do NOT create a separate Neon project — Postwick reads the same posts/brands.
--
-- Run in Neon SQL Editor (Kerygma project) as an owner/admin role.
-- Then create a connection string with this user and set it as Postwick DATABASE_URL.

-- 1) Create login role (change the password before running)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postwick_readonly') THEN
    CREATE ROLE postwick_readonly LOGIN PASSWORD 'REPLACE_WITH_STRONG_PASSWORD'
      NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
END
$$;

-- 2) Schema usage only
GRANT USAGE ON SCHEMA public TO postwick_readonly;

-- 3) Column-level SELECT on public-safe fields (no tokens, no emails, no connections)
GRANT SELECT (
  id,
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

-- Explicitly no grants on: connections, users, api_keys, meta_oauth_*, etc.

-- Optional: verify as postwick_readonly that sensitive tables fail:
-- SET ROLE postwick_readonly;
-- SELECT access_token FROM connections LIMIT 1;  -- should ERROR
-- SELECT id, content FROM posts WHERE is_public = true LIMIT 1;  -- should work
-- RESET ROLE;
