import { NextResponse } from "next/server";
import { createReport, getCurrentUser } from "@/lib/db";

const ALLOWED_TARGETS = new Set(["POST", "PROFILE"]);

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const targetType = typeof body.targetType === "string" ? body.targetType.toUpperCase() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const details = typeof body.details === "string" ? body.details.trim() : undefined;
  const postId = Number(body.postId);
  const reportedUserId = Number(body.reportedUserId);

  if (!ALLOWED_TARGETS.has(targetType)) {
    return NextResponse.json({ error: "Invalid target type." }, { status: 400 });
  }

  if (!reason) {
    return NextResponse.json({ error: "Reason is required." }, { status: 400 });
  }

  if (targetType === "POST" && (!Number.isFinite(postId) || postId <= 0)) {
    return NextResponse.json({ error: "postId is required for post reports." }, { status: 400 });
  }

  if (targetType === "PROFILE" && (!Number.isFinite(reportedUserId) || reportedUserId <= 0)) {
    return NextResponse.json({ error: "reportedUserId is required for profile reports." }, { status: 400 });
  }

  if (targetType === "PROFILE" && reportedUserId === currentUser.id) {
    return NextResponse.json({ error: "Ne mozete prijaviti svoj profil." }, { status: 400 });
  }

  const report = await createReport({
    reporterId: currentUser.id,
    targetType: targetType as "POST" | "PROFILE",
    reason,
    details,
    postId: targetType === "POST" ? postId : undefined,
    reportedUserId: targetType === "PROFILE" ? reportedUserId : undefined,
  });

  return NextResponse.json(report, { status: 201 });
}
