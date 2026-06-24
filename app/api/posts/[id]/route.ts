import { NextResponse } from "next/server";
import { deletePostById, getCurrentUser, getPostById } from "@/lib/db";

function canDeletePost(actor: { id: number; role?: string }, ownerId: number) {
  return actor.id === ownerId || actor.role === "ADMIN" || actor.role === "MODERATOR";
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
  }

  const { id } = await context.params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) {
    return NextResponse.json({ error: "Neispravan ID objave." }, { status: 400 });
  }

  const post = await getPostById(postId);
  if (!post) {
    return NextResponse.json({ error: "Objava nije pronadjena." }, { status: 404 });
  }

  if (!canDeletePost(currentUser, post.authorId)) {
    return NextResponse.json({ error: "Nemate dozvolu za brisanje ove objave." }, { status: 403 });
  }

  await deletePostById(postId);
  return NextResponse.json({ ok: true });
}
