import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/db";
import { prisma } from "@/lib/prisma";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 120 * 1024 * 1024;

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kindRaw = formData.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required." }, { status: 400 });
  }

  const kind = typeof kindRaw === "string" ? kindRaw : "image";
  const isImage = kind === "image";
  const allowedTypes = isImage ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  if (file.size > maxSize) {
    return NextResponse.json({ error: "File is too large." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const asset = await prisma.mediaAsset.create({
    data: {
      userId: currentUser.id,
      kind: isImage ? "IMAGE" : "VIDEO",
      filename: file.name || null,
      mimeType: file.type,
      size: file.size,
      data: Buffer.from(bytes),
    },
    select: {
      id: true,
    },
  });

  return NextResponse.json({
    assetId: asset.id,
    url: `/api/media/${asset.id}`,
  });
}
