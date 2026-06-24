import { NextResponse } from "next/server";
import { dismissNotificationForUser, getCurrentUser } from "@/lib/db";

async function markRead(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const { id } = await context.params;
  const notificationKey = decodeURIComponent(id);

  await dismissNotificationForUser(currentUser.id, notificationKey);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  return markRead(request, context);
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  return markRead(request, context);
}
