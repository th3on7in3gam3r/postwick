import { NextResponse } from "next/server";
import { z } from "zod";
import { recordPageView } from "@/lib/db/analytics";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  brandSlug: z.string().trim().min(1).max(120).optional(),
  postId: z.string().trim().min(1).max(80).optional(),
  path: z.string().trim().min(1).max(200),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    await recordPageView({
      brandSlug: body.brandSlug,
      postId: body.postId,
      path: body.path,
    });
    return NextResponse.json({ ok: true });
  } catch {
    // Swallow bad beacons — never break the page.
    return NextResponse.json({ ok: true });
  }
}
