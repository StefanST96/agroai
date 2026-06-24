import { NextResponse } from "next/server";
import { getCurrentUser, getUsersForAdmin } from "@/lib/db";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const users = await getUsersForAdmin();
  return NextResponse.json(users);
}
