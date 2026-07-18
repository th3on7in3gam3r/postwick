import { NextResponse } from "next/server";
import { getPublicFeedPosts, getPublicPostsByBrandSlug } from "@/lib/db";
import { sanitizeCity, sanitizeNiche } from "@/lib/env";

export const dynamic = "force-dynamic";

function clampInt(raw: string | null, fallback: number, min: number, max: number) {
  const n = Number(raw ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.trunc(n), min), max);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const niche = sanitizeNiche(searchParams.get("niche"));
  const city = sanitizeCity(searchParams.get("city"));
  const brand = searchParams.get("brand")?.trim() || null;
  const limit = clampInt(searchParams.get("limit"), 48, 1, 100);
  const offset = clampInt(searchParams.get("offset"), 0, 0, 10_000);

  const page = brand
    ? await getPublicPostsByBrandSlug(brand, { limit, offset })
    : await getPublicFeedPosts({ niche, city, limit, offset });

  return NextResponse.json(page);
}
