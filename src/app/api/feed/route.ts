import { NextResponse } from "next/server";
import { getPublicFeedPosts } from "@/lib/db";
import { sanitizeCity, sanitizeNiche } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const niche = sanitizeNiche(searchParams.get("niche"));
  const city = sanitizeCity(searchParams.get("city"));
  const limitRaw = Number(searchParams.get("limit") ?? "48");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(limitRaw, 1), 100)
    : 48;

  const posts = await getPublicFeedPosts({ niche, city, limit });
  return NextResponse.json({ posts });
}
