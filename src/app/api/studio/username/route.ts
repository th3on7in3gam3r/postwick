import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { updatePostwickUsername } from "@/lib/db";

const bodySchema = z.object({
  username: z.string().min(3).max(24),
});

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const result = await updatePostwickUsername(userId, body.username);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ account: result.account });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 },
    );
  }
}
