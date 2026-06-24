import { NextResponse } from "next/server";
import { deleteSidebarBanner, getCurrentUser, updateSidebarBanner } from "@/lib/db";

const ALLOWED_VARIANTS = new Set(["CARD", "HERO"]);

async function requireBannerManager(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    return null;
  }
  return currentUser;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const manager = await requireBannerManager(request);
  if (!manager) {
    return NextResponse.json({ error: "Admin ili moderator pristup je obavezan." }, { status: 403 });
  }

  const { id } = await context.params;
  const bannerId = Number(id);
  if (!Number.isFinite(bannerId) || bannerId <= 0) {
    return NextResponse.json({ error: "Invalid banner id." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const variantRaw = typeof body.variant === "string" ? body.variant.toUpperCase() : undefined;
  const variant = variantRaw && ALLOWED_VARIANTS.has(variantRaw) ? (variantRaw as "CARD" | "HERO") : undefined;
  const position = body.position === undefined ? undefined : Number(body.position);
  const imageAssetIdRaw = body.imageAssetId === undefined ? undefined : Number(body.imageAssetId);
  const imageAssetId = imageAssetIdRaw === undefined
    ? undefined
    : Number.isFinite(imageAssetIdRaw) && imageAssetIdRaw > 0
      ? imageAssetIdRaw
      : null;
  const isActive = body.isActive === undefined ? undefined : Boolean(body.isActive);

  if (variantRaw && !variant) {
    return NextResponse.json({ error: "Varijanta bannera mora biti CARD ili HERO." }, { status: 400 });
  }

  try {
    const updated = await updateSidebarBanner({
      id: bannerId,
      title,
      body: typeof body.body === "string" ? body.body.trim() : undefined,
      ctaText: typeof body.ctaText === "string" ? body.ctaText.trim() : undefined,
      ctaHref: typeof body.ctaHref === "string" ? body.ctaHref.trim() : undefined,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : undefined,
      imageAssetId,
      variant,
      position: Number.isFinite(position) ? position : undefined,
      isActive,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Banner nije azuriran." }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const manager = await requireBannerManager(request);
  if (!manager) {
    return NextResponse.json({ error: "Admin ili moderator pristup je obavezan." }, { status: 403 });
  }

  const { id } = await context.params;
  const bannerId = Number(id);
  if (!Number.isFinite(bannerId) || bannerId <= 0) {
    return NextResponse.json({ error: "Invalid banner id." }, { status: 400 });
  }

  try {
    await deleteSidebarBanner(bannerId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Banner nije obrisan." }, { status: 400 });
  }
}
