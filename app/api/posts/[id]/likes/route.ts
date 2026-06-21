import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createLike, getCurrentUser, getLikeCount } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const likes = await getLikeCount(Number(id));
  return NextResponse.json({ likes });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const currentUser = await getCurrentUser(request);

  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  try {
    const like = await createLike({
      postId: Number(id),
      authorId: currentUser.id,
    });
    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "You have already liked this post." }, { status: 409 });
  }
}
