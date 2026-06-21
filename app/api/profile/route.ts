import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "No user found." }, { status: 404 });
  }

  const { passwordHash, ...safeUser } = user;
  return NextResponse.json(safeUser);
}
