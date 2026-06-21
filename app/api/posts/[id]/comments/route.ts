import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createComment, getCurrentUser, getPostComments } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const comments = await getPostComments(Number(id));
  return NextResponse.json(comments);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "Comment content is required." }, { status: 400 });
  }

  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const comment = await createComment({
    postId: Number(id),
    authorId: currentUser.id,
    content,
  });

  return NextResponse.json(comment, { status: 201 });
}
