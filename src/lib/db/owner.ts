import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "./client";
import { brands, posts, postwickAccounts, postwickClaimCodes } from "./schema";

export type PostwickAccount = {
  id: string;
  clerkUserId: string;
  kerygmaUserId: string;
  username: string | null;
  brandIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type StudioBrand = {
  id: string;
  name: string;
  publicSlug: string | null;
  publicNiche: string | null;
  isPublic: boolean;
};

export type StudioPost = {
  id: string;
  brandId: string;
  brandName: string;
  brandSlug: string | null;
  platform: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null;
  isPublic: boolean;
};

function parseBrandIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function mapAccount(row: typeof postwickAccounts.$inferSelect): PostwickAccount {
  return {
    id: row.id,
    clerkUserId: row.clerkUserId,
    kerygmaUserId: row.kerygmaUserId,
    username: row.username,
    brandIds: parseBrandIds(row.brandIds),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function getPostwickAccountByClerkId(
  clerkUserId: string,
): Promise<PostwickAccount | null> {
  if (!process.env.DATABASE_URL) return null;
  const db = await getDb();
  const rows = await db
    .select()
    .from(postwickAccounts)
    .where(eq(postwickAccounts.clerkUserId, clerkUserId))
    .limit(1);
  return rows[0] ? mapAccount(rows[0]) : null;
}

export async function redeemClaimCode(
  clerkUserId: string,
  rawCode: string,
): Promise<{ account: PostwickAccount } | { error: string }> {
  const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 6 || code.length > 16) {
    return { error: "Enter a valid claim code." };
  }

  const existing = await getPostwickAccountByClerkId(clerkUserId);
  if (existing) {
    return { error: "This Postwick account is already linked." };
  }

  const db = await getDb();
  const now = new Date().toISOString();

  const claimRows = await db
    .select()
    .from(postwickClaimCodes)
    .where(eq(postwickClaimCodes.code, code))
    .limit(1);

  const claim = claimRows[0];
  if (!claim) {
    return { error: "Claim code not found." };
  }
  if (claim.usedAt) {
    return { error: "This claim code has already been used." };
  }
  if (new Date(claim.expiresAt).getTime() < Date.now()) {
    return { error: "This claim code has expired. Generate a new one in Kerygma." };
  }

  const linkedAlready = await db
    .select({ id: postwickAccounts.id })
    .from(postwickAccounts)
    .where(eq(postwickAccounts.kerygmaUserId, claim.userId))
    .limit(1);
  if (linkedAlready[0]) {
    return {
      error:
        "This Kerygma owner is already linked to another Postwick account.",
    };
  }

  let brandIdList: string[] = [];
  if (claim.brandId) {
    const owned = await db
      .select({ id: brands.id })
      .from(brands)
      .where(and(eq(brands.id, claim.brandId), eq(brands.userId, claim.userId)))
      .limit(1);
    if (!owned[0]) {
      return { error: "Brand for this claim code was not found." };
    }
    brandIdList = [owned[0].id];
  } else {
    const owned = await db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.userId, claim.userId));
    brandIdList = owned.map((row) => row.id);
  }

  if (brandIdList.length === 0) {
    return { error: "No brands found for this claim code." };
  }

  await db
    .update(postwickClaimCodes)
    .set({ usedAt: now })
    .where(
      and(eq(postwickClaimCodes.id, claim.id), isNull(postwickClaimCodes.usedAt)),
    );

  const id = `pwa_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await db.insert(postwickAccounts).values({
    id,
    clerkUserId,
    kerygmaUserId: claim.userId,
    username: null,
    brandIds: JSON.stringify(brandIdList),
    createdAt: now,
    updatedAt: now,
  });

  const account = await getPostwickAccountByClerkId(clerkUserId);
  if (!account) {
    return { error: "Linked, but failed to load account." };
  }
  return { account };
}

export async function updatePostwickUsername(
  clerkUserId: string,
  rawUsername: string,
): Promise<{ account: PostwickAccount } | { error: string }> {
  const username = rawUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (username.length < 3 || username.length > 24) {
    return { error: "Username must be 3–24 characters (letters, numbers, underscore)." };
  }

  const account = await getPostwickAccountByClerkId(clerkUserId);
  if (!account) {
    return { error: "Link a Kerygma claim code first." };
  }

  const db = await getDb();
  const taken = await db
    .select({ id: postwickAccounts.id })
    .from(postwickAccounts)
    .where(
      and(
        eq(postwickAccounts.username, username),
        sql`${postwickAccounts.id} <> ${account.id}`,
      ),
    )
    .limit(1);
  if (taken[0]) {
    return { error: "That username is already taken." };
  }

  const now = new Date().toISOString();
  await db
    .update(postwickAccounts)
    .set({ username, updatedAt: now })
    .where(eq(postwickAccounts.clerkUserId, clerkUserId));

  const updated = await getPostwickAccountByClerkId(clerkUserId);
  if (!updated) return { error: "Could not update username." };
  return { account: updated };
}

export async function getStudioBrands(
  account: PostwickAccount,
): Promise<StudioBrand[]> {
  if (account.brandIds.length === 0) return [];
  const db = await getDb();
  const rows = await db
    .select({
      id: brands.id,
      name: brands.name,
      publicSlug: brands.publicSlug,
      publicNiche: brands.publicNiche,
      isPublic: brands.isPublic,
    })
    .from(brands)
    .where(
      and(
        inArray(brands.id, account.brandIds),
        eq(brands.userId, account.kerygmaUserId),
      ),
    )
    .orderBy(brands.name);

  return rows;
}

export async function getStudioPosts(
  account: PostwickAccount,
): Promise<StudioPost[]> {
  if (account.brandIds.length === 0) return [];
  const db = await getDb();
  const rows = await db
    .select({
      id: posts.id,
      brandId: posts.brandId,
      brandName: brands.name,
      brandSlug: brands.publicSlug,
      platform: posts.platform,
      content: posts.content,
      imageUrl: posts.imageUrl,
      publishedAt: posts.publishedAt,
      isPublic: posts.isPublic,
    })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        inArray(posts.brandId, account.brandIds),
        eq(brands.userId, account.kerygmaUserId),
        eq(posts.status, "published"),
        eq(posts.isPublic, true),
      ),
    )
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(100);

  return rows;
}

export async function updateOwnerPost(
  clerkUserId: string,
  postId: string,
  data: { content?: string; isPublic?: boolean },
): Promise<{ post: StudioPost } | { error: string }> {
  const account = await getPostwickAccountByClerkId(clerkUserId);
  if (!account) {
    return { error: "Link a Kerygma claim code first." };
  }
  if (account.brandIds.length === 0) {
    return { error: "No linked brands." };
  }

  const content =
    typeof data.content === "string" ? data.content.trim() : undefined;
  if (content !== undefined && (content.length < 1 || content.length > 5000)) {
    return { error: "Caption must be 1–5000 characters." };
  }
  if (data.content === undefined && data.isPublic === undefined) {
    return { error: "Nothing to update." };
  }

  const db = await getDb();
  const owned = await db
    .select({
      id: posts.id,
      brandId: posts.brandId,
    })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(
      and(
        eq(posts.id, postId),
        inArray(posts.brandId, account.brandIds),
        eq(brands.userId, account.kerygmaUserId),
        eq(posts.status, "published"),
      ),
    )
    .limit(1);

  if (!owned[0]) {
    return { error: "Post not found or not owned by your linked account." };
  }

  const now = new Date().toISOString();
  await db
    .update(posts)
    .set({
      ...(content !== undefined ? { content } : {}),
      ...(data.isPublic !== undefined ? { isPublic: data.isPublic } : {}),
      updatedAt: now,
    })
    .where(eq(posts.id, postId));

  const rows = await db
    .select({
      id: posts.id,
      brandId: posts.brandId,
      brandName: brands.name,
      brandSlug: brands.publicSlug,
      platform: posts.platform,
      content: posts.content,
      imageUrl: posts.imageUrl,
      publishedAt: posts.publishedAt,
      isPublic: posts.isPublic,
    })
    .from(posts)
    .innerJoin(brands, eq(brands.id, posts.brandId))
    .where(eq(posts.id, postId))
    .limit(1);

  const row = rows[0];
  if (!row) return { error: "Updated, but failed to reload post." };
  return { post: row };
}

/** Owner display username for a public brand (via brand.userId → postwick_accounts). */
export async function getOwnerUsernameForBrandUserId(
  kerygmaUserId: string,
): Promise<string | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const db = await getDb();
    const rows = await db
      .select({ username: postwickAccounts.username })
      .from(postwickAccounts)
      .where(eq(postwickAccounts.kerygmaUserId, kerygmaUserId))
      .limit(1);
    return rows[0]?.username?.trim() || null;
  } catch {
    return null;
  }
}

export async function getOwnerUsernamesByBrandIds(
  brandIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!process.env.DATABASE_URL || brandIds.length === 0) return map;

  try {
    const db = await getDb();
    const brandRows = await db
      .select({ id: brands.id, userId: brands.userId })
      .from(brands)
      .where(inArray(brands.id, brandIds));

    if (brandRows.length === 0) return map;

    const userIds = Array.from(new Set(brandRows.map((row) => row.userId)));
    const accounts = await db
      .select({
        kerygmaUserId: postwickAccounts.kerygmaUserId,
        username: postwickAccounts.username,
      })
      .from(postwickAccounts)
      .where(inArray(postwickAccounts.kerygmaUserId, userIds));

    const usernameByUser = new Map(
      accounts
        .filter((row) => row.username?.trim())
        .map((row) => [row.kerygmaUserId, row.username!.trim()] as const),
    );

    for (const brand of brandRows) {
      const username = usernameByUser.get(brand.userId);
      if (username) map.set(brand.id, username);
    }
  } catch {
    // ignore
  }

  return map;
}
