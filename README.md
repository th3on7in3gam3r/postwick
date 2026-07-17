# Postwick

Public posts network for brands that opt in from [Kerygma Social](https://kerygmasocial.com). Create and publish on Kerygma; discover and share on Postwick.

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Neon Postgres via Drizzle — **same Kerygma database**, read-only role

## Database (important)

**Do not create a separate Neon project/account for Postwick.**

Postwick must see the same `brands` / `posts` rows as Kerygma. Security comes from a **read-only Postgres role** on that shared project:

1. Open the **Kerygma** Neon project → SQL Editor.
2. Edit the password in [`scripts/neon-postwick-readonly.sql`](scripts/neon-postwick-readonly.sql), then run it.
3. Verify with the commented checks at the bottom of that script (`SET ROLE postwick_readonly; …`).
4. Copy a pooler connection string for `postwick_readonly`.
5. Set that string as Postwick `DATABASE_URL` (Vercel + `.env.local`).

Kerygma keeps using its existing full-access `DATABASE_URL`.

## Local development

```bash
cp .env.example .env.local
# Fill DATABASE_URL, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_KERYGMA_URL
# Optional: NEXT_PUBLIC_SUPPORT_EMAIL for /report

npm install
npm run dev -- -p 3002
```

Smoke checks:

- [http://localhost:3002](http://localhost:3002) — feed
- [http://localhost:3002/api/health](http://localhost:3002/api/health) — should return `{ "status": "ok" }`

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon pooler URL for **postwick_readonly** (same project as Kerygma) |
| `NEXT_PUBLIC_APP_URL` | This deployment’s public origin (no trailing slash) |
| `NEXT_PUBLIC_KERYGMA_URL` | Kerygma Social origin for CTAs |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Inbox used by `/report` mailto |

## Security (shipped)

- Read-only DB role script (column grants; no `connections` / tokens)
- Security headers (CSP, frame deny, nosniff, referrer policy)
- `/api/*` rate limit (~60 req/min/IP, best-effort on serverless)
- Image + website URL allowlist (`http`/`https` only)
- Niche query length capped at 64 chars
- `/report` mailto takedown surface

## Deploy (Vercel)

1. Create a **new** Vercel project pointed at this folder (`Post-Wick`).
2. Set env vars (use the **read-only** Neon connection string).
3. Point health checks at `/api/health` if desired.
4. Deploy. Attach a custom domain when ready.
5. On Kerygma, set `NEXT_PUBLIC_POSTWICK_URL` to the Postwick origin.

## Seeding a non-empty feed

On Kerygma:

1. Enable **Directory listing** for a brand.
2. Publish at least one post.
3. In **History**, click **Share on Postwick**.

## Routes

| Path | Description |
|------|-------------|
| `/` | Consumer feed (optional `?niche=`) |
| `/b/[slug]` | Brand portfolio |
| `/report` | Report / takedown mailto form |
| `/privacy`, `/terms` | Legal stubs |
| `/api/feed` | JSON feed (rate limited) |
| `/api/health` | DB + env health |
| `/robots.txt`, `/sitemap.xml` | SEO |

## Related

Kerygma app: `POST-WICK — FULL PRODUCT BUILD/native-landing`. Schema for `posts.is_public` is applied there via runtime `ensureSchema()`.
