import { NextResponse } from "next/server";
import { getCurrentUser, updateUserRole } from "@/lib/db";

const ALLOWED_ROLES = new Set(["USER", "MODERATOR", "ADMIN"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser(request);
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await context.params;
  const userId = Number(id);
  if (!Number.isFinite(userId) || userId <= 0) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const role = typeof body.role === "string" ? body.role.toUpperCase() : "";

  if (!ALLOWED_ROLES.has(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  try {
    const updated = await updateUserRole({
      userId,
      role: role as "USER" | "MODERATOR" | "ADMIN",
      actorUserId: admin.id,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Uloga nije azurirana." },
      { status: 400 },
    );
  }
}
