import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession, createUser, getUserByEmail } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, username, email, password, phone, location, bio, farmName } = body;

  if (!name || !username || !email || !password) {
    return NextResponse.json({ error: "Missing required user data." }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    username,
    email,
    passwordHash,
    phone,
    location,
    bio,
    farmName,
  });

  const session = await createSession(user.id);
  const { passwordHash: _, ...safeUser } = user;

  const response = NextResponse.json(safeUser, { status: 201 });
  response.cookies.set({
    name: "session",
    value: session.token,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
