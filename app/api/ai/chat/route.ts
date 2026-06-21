import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { appendAiMessage, createAiConversation, getLatestAiConversation, getCurrentUser } from "@/lib/db";

export async function GET() {
  const conversation = await getLatestAiConversation();
  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }
  return NextResponse.json(conversation);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question : "";
  const title = typeof body.title === "string" ? body.title : "Nova AI konverzacija";

  const currentUser = await getCurrentUser(request);

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const conversation = await createAiConversation({
    userId: currentUser.id,
    title,
    firstMessage: question,
  });

  return NextResponse.json(conversation, { status: 201 });
}
