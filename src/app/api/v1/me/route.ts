import { NextResponse } from "next/server";
import {
  getPostwickAccountByClerkId,
  getStudioBrands,
} from "@/lib/db";
import { requirePartnerApiUser } from "@/lib/server/partner-api-auth";

/** Verify a Postwick API key (Cadence / growth stack). */
export async function GET(req: Request) {
  const authResult = await requirePartnerApiUser(req);
  if ("error" in authResult) return authResult.error;

  const account = await getPostwickAccountByClerkId(authResult.clerkUserId);
  if (!account) {
    return NextResponse.json(
      {
        ok: true,
        product: "postwick",
        user: {
          clerkUserId: authResult.clerkUserId,
          username: null,
        },
        brands: [],
        notice: "No Postwick Studio account linked yet. Redeem a claim code.",
      },
    );
  }

  const brands = await getStudioBrands(account);

  return NextResponse.json({
    ok: true,
    product: "postwick",
    user: {
      clerkUserId: account.clerkUserId,
      username: account.username,
    },
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      publicSlug: brand.publicSlug,
      publicNiche: brand.publicNiche,
      publicCity: brand.publicCity,
    })),
  });
}
