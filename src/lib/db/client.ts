import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    await sql`
      CREATE TABLE IF NOT EXISTS postwick_claim_codes (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        user_id TEXT NOT NULL,
        brand_id TEXT,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    await sql`CREATE INDEX IF NOT EXISTS idx_postwick_claim_codes_user_id ON postwick_claim_codes(user_id)`;
    await sql`
      CREATE TABLE IF NOT EXISTS postwick_accounts (
        id TEXT PRIMARY KEY,
        clerk_user_id TEXT NOT NULL UNIQUE,
        kerygma_user_id TEXT NOT NULL UNIQUE,
        username TEXT UNIQUE,
        brand_ids TEXT NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
  } catch (error) {
    // Read-only roles cannot create tables; Kerygma ensureSchema owns migrations.
    console.warn(
      "[postwick] ensureSchema skipped or failed:",
      error instanceof Error ? error.message : error,
    );
  }
}

export async function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!schemaReady) {
    schemaReady = ensureSchema();
  }
  await schemaReady;

  if (!db) {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  }

  return db;
}
