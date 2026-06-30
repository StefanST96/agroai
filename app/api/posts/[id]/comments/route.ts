import { NextResponse } from "next/server";
import { createComment, getCurrentUser } from "@/lib/db";
import { prisma } from "@/lib/prisma";

const POLL_PREFIX = "POLL_VOTE:";
const COMMENT_LIKE_PREFIX = "__COMMENT_LIKE__:";
const REPLY_PREFIX = "__REPLY__:";

function isSystemComment(content: string) {
  return (
    content.startsWith(POLL_PREFIX) ||
    content.startsWith(COMMENT_LIKE_PREFIX) ||
    content.startsWith(REPLY_PREFIX)
  );
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) {
    return NextResponse.json({ error: "Neispravan ID posta." }, { status: 400 });
  }

  const [comments, currentUser] = await Promise.all([
    prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        likes: {
          select: {
            authorId: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    getCurrentUser(request),
  ]);

  const visibleComments = comments
    .filter((comment) => !isSystemComment(comment.content))
    .map((comment) => {
      const likes = new Set(comment.likes.map((like) => like.authorId));
      const replies = comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        author: {
          id: reply.author.id,
          name: reply.author.name,
          avatarUrl: reply.author.avatarUrl || null,
        },
      }));

      return {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          name: comment.author.name,
          avatarUrl: comment.author.avatarUrl || null,
        },
        likesCount: likes.size,
        likedByMe: currentUser ? likes.has(currentUser.id) : false,
        replies,
      };
    });

  return NextResponse.json(visibleComments);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) {
    return NextResponse.json({ error: "Neispravan ID posta." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "comment";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const commentId = Number(body.commentId);


  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  if (action === "likeComment") {
    if (!Number.isFinite(commentId) || commentId <= 0) {
      return NextResponse.json({ error: "Neispravan komentar." }, { status: 400 });
    }

    const targetComment = await prisma.comment.findFirst({
      where: { id: commentId, postId },
      select: { id: true, content: true },
    });

    if (!targetComment || isSystemComment(targetComment.content)) {
      return NextResponse.json({ error: "Komentar nije pronadjen." }, { status: 404 });
    }

    await prisma.commentLike.upsert({
      where: {
        commentId_authorId: {
          commentId,
          authorId: currentUser.id,
        },
      },
      update: {},
      create: {
        commentId,
        authorId: currentUser.id,
      },
    });

    return NextResponse.json({ ok: true });
  }

  if (action === "reply") {
    if (!Number.isFinite(commentId) || commentId <= 0) {
      return NextResponse.json({ error: "Neispravan komentar." }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: "Odgovor ne sme biti prazan." }, { status: 400 });
    }

    const targetComment = await prisma.comment.findFirst({
      where: { id: commentId, postId },
      select: { id: true, content: true },
    });

    if (!targetComment || isSystemComment(targetComment.content)) {
      return NextResponse.json({ error: "Komentar nije pronadjen." }, { status: 404 });
    }

    await prisma.commentReply.create({
      data: {
        commentId,
        authorId: currentUser.id,
        content,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (!content) {
    return NextResponse.json({ error: "Comment content is required." }, { status: 400 });
  }

  const comment = await createComment({
    postId,
    authorId: currentUser.id,
    content,
  });

  return NextResponse.json(comment, { status: 201 });
}
