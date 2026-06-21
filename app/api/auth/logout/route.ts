import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/db";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;

  if (sessionToken) {
    await deleteSession(sessionToken);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({ name: "session", value: "", httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
