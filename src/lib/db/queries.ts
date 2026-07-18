import { and, desc, eq, sql } from "drizzle-orm";
import { sanitizeCity, sanitizeNiche } from "@/lib/env";
import { getDb } from "./client";
import { getOwnerUsernameForBrandUserId, getOwnerUsernamesByBrandIds } from "./owner";
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
  brandCity: string | null;
  ownerUsername: string | null;
};

export type PublicBrandProfile = {
  name: string;
  websiteUrl: string;
  description: string | null;
  publicSlug: string;
  publicNiche: string | null;
  publicCity: string | null;
  ownerUsername: string | null;
};

const publicGates = and(
  eq(posts.status, "published"),
  eq(posts.isPublic, true),
  eq(brands.isPublic, true),
);

export async function getPublicFeedPosts(options?: {
  niche?: string;
  city?: string;
  limit?: number;
}): Promise<PublicFeedPost[]> {
  if (!process.env.DATABASE_URL) return [];

  const limit = options?.limit ?? 48;
  const niche = sanitizeNiche(options?.niche);
  const city = sanitizeCity(options?.city);

  try {
    const db = await getDb();
    const conditions = [publicGates];
    if (niche) {
      conditions.push(eq(brands.publicNiche, niche));
    }
    if (city) {
      conditions.push(eq(brands.publicCity, city));
    }

    const rows = await db
      .select({
        id: posts.id,
        platform: posts.platform,
        content: posts.content,
        imageUrl: posts.imageUrl,
        publishedAt: posts.publishedAt,
        brandId: brands.id,
        brandName: brands.name,
        brandSlug: brands.publicSlug,
        brandNiche: brands.publicNiche,
        brandCity: brands.publicCity,
      })
      .from(posts)
      .innerJoin(brands, eq(brands.id, posts.brandId))
      .where(and(...conditions))
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(limit);

    const usernames = await getOwnerUsernamesByBrandIds(
      rows.map((row) => row.brandId),
    );

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
        brandCity: row.brandCity,
        ownerUsername: usernames.get(row.brandId) ?? null,
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

export async function getPublicCities(): Promise<string[]> {
  if (!process.env.DATABASE_URL) return [];

  try {
    const db = await getDb();
    const rows = await db
      .selectDistinct({ city: brands.publicCity })
      .from(posts)
      .innerJoin(brands, eq(brands.id, posts.brandId))
      .where(publicGates);

    return rows
      .map((row) => row.city)
      .filter((city): city is string => Boolean(city?.trim()))
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

    const ownerUsername = await getOwnerUsernameForBrandUserId(row.userId);

    return {
      name: row.name,
      websiteUrl: row.websiteUrl,
      description: row.description,
      publicSlug: row.publicSlug,
      publicNiche: row.publicNiche,
      publicCity: row.publicCity,
      ownerUsername,
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
        brandId: brands.id,
        brandName: brands.name,
        brandSlug: brands.publicSlug,
        brandNiche: brands.publicNiche,
        brandCity: brands.publicCity,
      })
      .from(posts)
      .innerJoin(brands, eq(brands.id, posts.brandId))
      .where(and(publicGates, eq(brands.publicSlug, slug)))
      .orderBy(desc(posts.publishedAt), desc(posts.id))
      .limit(limit);

    const usernames = await getOwnerUsernamesByBrandIds(
      rows.map((row) => row.brandId),
    );

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
        brandCity: row.brandCity,
        ownerUsername: usernames.get(row.brandId) ?? null,
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
