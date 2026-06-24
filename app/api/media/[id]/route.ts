import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseAssetId(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const assetId = parseAssetId(id);

  if (!assetId) {
    return NextResponse.json({ error: "Invalid media id." }, { status: 400 });
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
    select: {
      data: true,
      mimeType: true,
      filename: true,
      size: true,
      createdAt: true,
    },
  });

  if (!asset) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  const body = Uint8Array.from(asset.data);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": asset.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${(asset.filename || `media-${assetId}`).replace(/"/g, "")}"`,
      "Last-Modified": asset.createdAt.toUTCString(),
    },
  });
}
