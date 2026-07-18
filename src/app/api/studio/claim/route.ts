import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { redeemClaimCode } from "@/lib/db";

const bodySchema = z.object({
  code: z.string().min(6).max(32),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const result = await redeemClaimCode(userId, body.code);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ account: result.account });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to redeem claim code" },
      { status: 500 },
    );
  }
}
