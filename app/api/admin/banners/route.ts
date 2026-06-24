import { NextResponse } from "next/server";
import { createSidebarBanner, getCurrentUser, getSidebarBanners } from "@/lib/db";

const ALLOWED_VARIANTS = new Set(["CARD", "HERO"]);

function canManageBanners(role?: "USER" | "MODERATOR" | "ADMIN") {
  return role === "ADMIN" || role === "MODERATOR";
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !canManageBanners(currentUser.role)) {
    return NextResponse.json({ error: "Admin ili moderator pristup je obavezan." }, { status: 403 });
  }

  const banners = await getSidebarBanners(false);
  return NextResponse.json(banners);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !canManageBanners(currentUser.role)) {
    return NextResponse.json({ error: "Admin ili moderator pristup je obavezan." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.body === "string" ? body.body.trim() : "";
  const ctaText = typeof body.ctaText === "string" ? body.ctaText.trim() : "";
  const ctaHref = typeof body.ctaHref === "string" ? body.ctaHref.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const imageAssetId = Number(body.imageAssetId);
  const variant = typeof body.variant === "string" ? body.variant.toUpperCase() : "CARD";
  const position = Number(body.position);
  const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

  if (!title) {
    return NextResponse.json({ error: "Naslov bannera je obavezan." }, { status: 400 });
  }

  if (!ALLOWED_VARIANTS.has(variant)) {
    return NextResponse.json({ error: "Varijanta bannera mora biti CARD ili HERO." }, { status: 400 });
  }

  const created = await createSidebarBanner({
    title,
    body: content || undefined,
    ctaText: ctaText || undefined,
    ctaHref: ctaHref || undefined,
    imageUrl: imageUrl || undefined,
    imageAssetId: Number.isFinite(imageAssetId) && imageAssetId > 0 ? imageAssetId : undefined,
    variant: variant as "CARD" | "HERO",
    position: Number.isFinite(position) ? position : 0,
    isActive,
    createdById: currentUser.id,
  });

  return NextResponse.json(created, { status: 201 });
}
