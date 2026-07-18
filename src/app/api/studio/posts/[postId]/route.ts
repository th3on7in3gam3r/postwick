import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { updateOwnerPost } from "@/lib/db";

const bodySchema = z
  .object({
    content: z.string().min(1).max(5000).optional(),
    isPublic: z.boolean().optional(),
  })
  .refine((value) => value.content !== undefined || value.isPublic !== undefined, {
    message: "Provide content and/or isPublic",
  });

export async function PATCH(
  req: Request,
  { params }: { params: { postId: string } },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = bodySchema.parse(await req.json());
    const result = await updateOwnerPost(userId, params.postId, body);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ post: result.post });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 },
    );
  }
}
