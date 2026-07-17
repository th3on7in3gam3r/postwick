import { and, desc, eq, sql } from "drizzle-orm";
import { sanitizeNiche } from "@/lib/env";
import { getDb } from "./client";
import { brands, posts } from "./schema";

export type PublicFeedPost = {
  id: string;
  platform: string;
  content: string;
  imageUrl: string | null;
  publishedAt: string | null;
  brandName: string;
  brandSlug: string;
  brandNiche: string | null;
};

export type PublicBrandProfile = {
  name: string;
  websiteUrl: string;
  description: string | null;
  publicSlug: string;
  publicNiche: string | null;
};

const publicGates = and(
  eq(posts.status, "published"),
  eq(posts.isPublic, true),
  eq(brands.isPublic, true),
);

export async function getPublicFeedPosts(options?: {
  niche?: string;
  limit?: number;
}): Promise<PublicFeedPost[]> {
  if (!process.env.DATABASE_URL) return [];

  const limit = options?.limit ?? 48;
  const niche = sanitizeNiche(options?.niche);

  try {
    const db = await getDb();
    const conditions = [publicGates];
    if (niche) {
      conditions.push(eq(brands.publicNiche, niche));
    }

    const rows = await db
      .select({
        id: posts.id,
        platform: posts.platform,
        content: posts.content,
        imageUrl: posts.imageUrl,
        publishedAt: posts.publishedAt,
        brandName: brands.name,
        brandSlug: brands.publicSlug,
        brandNiche: brands.publicNiche,
      })
      .from(posts)
      .innerJoin(brands, eq(brands.id, posts.brandId))
      .where(and(...conditions))
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(limit);

    return rows
      .filter((row) => Boolean(row.brandSlug))
      .map((row) => ({
        id: row.id,
        platform: row.platform,
        content: row.content,
        imageUrl: row.imageUrl,
        publishedAt: row.publishedAt,
        brandName: row.brandName,
        brandSlug: row.brandSlug!,
        brandNiche: row.brandNiche,
      }));
  } catch {
    return [];
  }
}

export async function getPublicNiches(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const db = await getDb();
    const rows = await db
      .selectDistinct({ niche: brands.publicNiche })
      .from(posts)
      .innerJoin(brands, eq(brands.id, posts.brandId))
      .where(publicGates);

    return rows
      .map((row) => row.niche)
      .filter((niche): niche is string => Boolean(niche?.trim()))
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export async function getPublicBrandBySlug(
  slug: string,
): Promise<PublicBrandProfile | null> {
  if (!process.env.DATABASE_URL) return null;

  try {
    const db = await getDb();
    const rows = await db
      .select()
      .from(brands)
      .where(and(eq(brands.publicSlug, slug), eq(brands.isPublic, true)))
      .limit(1);

    const row = rows[0];
    if (!row?.publicSlug) return null;

    return {
      name: row.name,
      websiteUrl: row.websiteUrl,
      description: row.description,
      publicSlug: row.publicSlug,
      publicNiche: row.publicNiche,
    };
  } catch {
    return null;
  }
}

export async function getPublicPostsByBrandSlug(
  slug: string,
  limit = 48,
): Promise<PublicFeedPost[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const db = await getDb();
    const rows = await db
      .select({
        id: posts.id,
        platform: posts.platform,
        content: posts.content,
        imageUrl: posts.imageUrl,
        publishedAt: posts.publishedAt,
        brandName: brands.name,
        brandSlug: brands.publicSlug,
        brandNiche: brands.publicNiche,
      })
      .from(posts)
      .innerJoin(brands, eq(brands.id, posts.brandId))
      .where(and(publicGates, eq(brands.publicSlug, slug)))
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(limit);

    return rows
      .filter((row) => Boolean(row.brandSlug))
      .map((row) => ({
        id: row.id,
        platform: row.platform,
        content: row.content,
        imageUrl: row.imageUrl,
        publishedAt: row.publishedAt,
        brandName: row.brandName,
        brandSlug: row.brandSlug!,
        brandNiche: row.brandNiche,
      }));
  } catch {
    return [];
  }
}

/** Public brand slugs for sitemap (directory-listed brands only). */
export async function getPublicBrandSlugs(limit = 500): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const db = await getDb();
    const rows = await db
      .select({ slug: brands.publicSlug })
      .from(brands)
      .where(and(eq(brands.isPublic, true), sql`${brands.publicSlug} IS NOT NULL`))
      .limit(limit);

    return rows
      .map((row) => row.slug)
      .filter((slug): slug is string => Boolean(slug));
  } catch {
    return [];
  }
}
