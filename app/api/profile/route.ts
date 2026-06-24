import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/db";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "No user found." }, { status: 404 });
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  const { passwordHash, ...safeUser } = user;
  return NextResponse.json({ ...safeUser, userProfile });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "No user found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const location = typeof body.location === "string" ? body.location.trim() : undefined;
  const farmName = typeof body.farmName === "string" ? body.farmName.trim() : undefined;
  const bio = typeof body.bio === "string" ? body.bio.trim() : undefined;
  const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : undefined;

  const hasChanges = [name, location, farmName, bio, avatarUrl].some((value) => value !== undefined);
  if (!hasChanges) {
    return NextResponse.json({ error: "No changes submitted." }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name: name || user.name } : {}),
        ...(location !== undefined ? { location: location || null } : {}),
        ...(farmName !== undefined ? { farmName: farmName || null } : {}),
        ...(bio !== undefined ? { bio: bio || null } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
      },
    });

    const updatedProfile = await tx.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(name !== undefined ? { displayName: name || null } : {}),
        ...(location !== undefined ? { location: location || null } : {}),
        ...(farmName !== undefined ? { farmName: farmName || null } : {}),
        ...(bio !== undefined ? { bio: bio || null } : {}),
      },
      create: {
        userId: user.id,
        displayName: name ?? user.name,
        location: location ?? user.location,
        farmName: farmName ?? user.farmName,
        bio: bio ?? user.bio,
      },
    });

    return { updatedUser, updatedProfile };
  });

  const { passwordHash, ...safeUser } = updated.updatedUser;
  return NextResponse.json({ ...safeUser, userProfile: updated.updatedProfile });
}
