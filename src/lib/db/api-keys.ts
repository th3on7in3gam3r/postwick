import { randomUUID } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";
import { getDb } from "./client";
import { postwickApiKeys } from "./schema";

export type ApiKeyRecord = {
  id: string;
  clerkUserId: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

function parseApiKey(row: typeof postwickApiKeys.$inferSelect): ApiKeyRecord {
  return {
    id: row.id,
    clerkUserId: row.clerkUserId,
    name: row.name,
    keyPrefix: row.keyPrefix,
    lastUsedAt: row.lastUsedAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
  };
}

function nowIso() {
  return new Date().toISOString();
}

export async function listApiKeysForClerkUser(
  clerkUserId: string,
): Promise<ApiKeyRecord[]> {
  if (!process.env.DATABASE_URL) return [];
  const db = await getDb();
  const rows = await db
    .select()
    .from(postwickApiKeys)
    .where(
      and(
        eq(postwickApiKeys.clerkUserId, clerkUserId),
        sql`${postwickApiKeys.revokedAt} IS NULL`,
      ),
    )
    .orderBy(desc(postwickApiKeys.createdAt));
  return rows.map(parseApiKey);
}

export async function createApiKeyForClerkUser(
  clerkUserId: string,
  name = "Cadence",
): Promise<{ key: ApiKeyRecord; rawKey: string }> {
  const db = await getDb();
  const { rawKey, keyPrefix, keyHash } = generateApiKey();
  const id = randomUUID();
  const now = nowIso();
  const trimmedName = name.trim() || "Cadence";

  await db.insert(postwickApiKeys).values({
    id,
    clerkUserId,
    name: trimmedName,
    keyPrefix,
    keyHash,
    createdAt: now,
  });

  return {
    key: {
      id,
      clerkUserId,
      name: trimmedName,
      keyPrefix,
      lastUsedAt: null,
      revokedAt: null,
      createdAt: now,
    },
    rawKey,
  };
}

export async function revokeApiKeyForClerkUser(
  keyId: string,
  clerkUserId: string,
): Promise<boolean> {
  const db = await getDb();
  const now = nowIso();
  const updated = await db
    .update(postwickApiKeys)
    .set({ revokedAt: now })
    .where(
      and(
        eq(postwickApiKeys.id, keyId),
        eq(postwickApiKeys.clerkUserId, clerkUserId),
        sql`${postwickApiKeys.revokedAt} IS NULL`,
      ),
    )
    .returning({ id: postwickApiKeys.id });
  return Boolean(updated[0]);
}

export async function authenticateWithApiKey(
  rawKey: string,
): Promise<{ clerkUserId: string; keyId: string } | null> {
  if (!process.env.DATABASE_URL) return null;
  const db = await getDb();
  const keyHash = hashApiKey(rawKey);
  const rows = await db
    .select()
    .from(postwickApiKeys)
    .where(
      and(
        eq(postwickApiKeys.keyHash, keyHash),
        sql`${postwickApiKeys.revokedAt} IS NULL`,
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const now = nowIso();
  await db
    .update(postwickApiKeys)
    .set({ lastUsedAt: now })
    .where(eq(postwickApiKeys.id, row.id));

  return { clerkUserId: row.clerkUserId, keyId: row.id };
}
