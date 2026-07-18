import { randomUUID } from "node:crypto";
import { and, eq, gte, inArray, isNull } from "drizzle-orm";
import { getDb } from "./client";
import { brands, postwickPageViews } from "./schema";

export async function recordPageView(input: {
  brandSlug?: string;
  postId?: string | null;
  path: string;
}): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  const path = input.path.trim().slice(0, 200);
  if (!path.startsWith("/")) return;

  const db = await getDb();
  let brandId: string | null = null;

  if (input.brandSlug?.trim()) {
    const rows = await db
      .select({ id: brands.id })
      .from(brands)
      .where(
        and(eq(brands.publicSlug, input.brandSlug.trim()), eq(brands.isPublic, true)),
      )
      .limit(1);
    brandId = rows[0]?.id ?? null;
  }

  if (!brandId) return;

  const viewedOn = new Date().toISOString().slice(0, 10);
  const postId = input.postId?.trim() || null;

  const existing = await db
    .select({ id: postwickPageViews.id, count: postwickPageViews.count })
    .from(postwickPageViews)
    .where(
      and(
        eq(postwickPageViews.brandId, brandId),
        eq(postwickPageViews.path, path),
        eq(postwickPageViews.viewedOn, viewedOn),
        postId
          ? eq(postwickPageViews.postId, postId)
          : isNull(postwickPageViews.postId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(postwickPageViews)
      .set({ count: existing[0].count + 1 })
      .where(eq(postwickPageViews.id, existing[0].id));
    return;
  }

  await db.insert(postwickPageViews).values({
    id: `pv_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    brandId,
    postId,
    path,
    viewedOn,
    count: 1,
  });
}

export type StudioViewsSummary = {
  brandId: string;
  brandName: string;
  last7: number;
  last30: number;
};

export async function getStudioViewsSummary(
  brandIds: string[],
): Promise<StudioViewsSummary[]> {
  if (!process.env.DATABASE_URL || brandIds.length === 0) return [];

  try {
    const db = await getDb();
    const since30 = new Date();
    since30.setUTCDate(since30.getUTCDate() - 30);
    const since30Str = since30.toISOString().slice(0, 10);
    const since7 = new Date();
    since7.setUTCDate(since7.getUTCDate() - 7);
    const since7Str = since7.toISOString().slice(0, 10);

    const brandRows = await db
      .select({ id: brands.id, name: brands.name })
      .from(brands)
      .where(inArray(brands.id, brandIds));

    const viewRows = await db
      .select({
        brandId: postwickPageViews.brandId,
        viewedOn: postwickPageViews.viewedOn,
        count: postwickPageViews.count,
      })
      .from(postwickPageViews)
      .where(
        and(
          inArray(postwickPageViews.brandId, brandIds),
          gte(postwickPageViews.viewedOn, since30Str),
        ),
      );

    return brandRows.map((brand) => {
      let last7 = 0;
      let last30 = 0;
      for (const row of viewRows) {
        if (row.brandId !== brand.id) continue;
        last30 += row.count;
        if (row.viewedOn >= since7Str) last7 += row.count;
      }
      return {
        brandId: brand.id,
        brandName: brand.name,
        last7,
        last30,
      };
    });
  } catch {
    return [];
  }
}
