import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/db";
import { prisma } from "@/lib/prisma";

type PollPayload = {
  question: string;
  options: string[];
};

function extractPollPayload(content: string): PollPayload | null {
  const match = content.match(/<!--POLL:([\s\S]*?)-->/);
  if (!match?.[1]) return null;

  try {
    const decoded = decodeURIComponent(match[1]);
    const parsed = JSON.parse(decoded) as Partial<PollPayload>;

    if (
      typeof parsed.question === "string" &&
      Array.isArray(parsed.options) &&
      parsed.options.every((option) => typeof option === "string") &&
      parsed.options.length >= 2
    ) {
      return {
        question: parsed.question,
        options: parsed.options,
      };
    }
  } catch {
    return null;
  }

  return null;
}

async function getPollState(postId: number, userId?: number) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, content: true },
  });

  if (!post) {
    return { error: "Post ne postoji.", status: 404 as const };
  }

  const poll = extractPollPayload(post.content);
  if (!poll) {
    return { error: "Post nema aktivnu anketu.", status: 400 as const };
  }

  const voteComments = await prisma.comment.findMany({
    where: {
      postId,
      content: {
        startsWith: "POLL_VOTE:",
      },
    },
    select: {
      authorId: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const counts = poll.options.map(() => 0);
  let userVoteIndex: number | null = null;

  for (const vote of voteComments) {
    const value = Number.parseInt(vote.content.replace("POLL_VOTE:", ""), 10);
    if (!Number.isFinite(value) || value < 0 || value >= poll.options.length) continue;
    counts[value] += 1;
    if (userId && vote.authorId === userId) {
      userVoteIndex = value;
    }
  }

  return {
    question: poll.question,
    options: poll.options,
    counts,
    totalVotes: counts.reduce((sum, item) => sum + item, 0),
    userVoteIndex,
  };
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const postId = Number(id);

  if (!Number.isFinite(postId) || postId <= 0) {
    return NextResponse.json({ error: "Neispravan ID posta." }, { status: 400 });
  }

  const currentUser = await getCurrentUser(request);
  const state = await getPollState(postId, currentUser?.id);

  if ("error" in state) {
    return NextResponse.json({ error: state.error }, { status: state.status });
  }

  return NextResponse.json(state);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Morate biti prijavljeni da biste glasali." }, { status: 401 });
  }

  const { id } = await context.params;
  const postId = Number(id);
  if (!Number.isFinite(postId) || postId <= 0) {
    return NextResponse.json({ error: "Neispravan ID posta." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const optionIndex = Number(body.optionIndex);
  if (!Number.isFinite(optionIndex) || optionIndex < 0) {
    return NextResponse.json({ error: "Opcija za glasanje nije validna." }, { status: 400 });
  }

  const pollState = await getPollState(postId, currentUser.id);
  if ("error" in pollState) {
    return NextResponse.json({ error: pollState.error }, { status: pollState.status });
  }

  if (optionIndex >= pollState.options.length) {
    return NextResponse.json({ error: "Opcija za glasanje ne postoji." }, { status: 400 });
  }

  await prisma.comment.deleteMany({
    where: {
      postId,
      authorId: currentUser.id,
      content: {
        startsWith: "POLL_VOTE:",
      },
    },
  });

  await prisma.comment.create({
    data: {
      postId,
      authorId: currentUser.id,
      content: `POLL_VOTE:${optionIndex}`,
    },
  });

  const updated = await getPollState(postId, currentUser.id);
  if ("error" in updated) {
    return NextResponse.json({ error: updated.error }, { status: updated.status });
  }

  return NextResponse.json(updated);
}
