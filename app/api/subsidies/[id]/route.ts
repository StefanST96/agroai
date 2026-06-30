import { NextResponse } from "next/server";
import { deleteSubsidy, getCurrentUser, updateSubsidy } from "@/lib/db";

const ALLOWED_STATUSES = new Set(["DRAFT", "OPEN", "CLOSING_SOON", "CLOSED"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.role !== "MODERATOR") {
    return NextResponse.json({ error: "Samo moderator moze da menja subvencije." }, { status: 403 });
  }

  const { id } = await context.params;
  const subsidyId = Number(id);
  if (!Number.isFinite(subsidyId) || subsidyId <= 0) {
    return NextResponse.json({ error: "Neispravan ID subvencije." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const institution = typeof body.institution === "string" ? body.institution.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const amount = typeof body.amount === "string" ? body.amount.trim() : "";
  const region = typeof body.region === "string" ? body.region.trim() : "";
  const link = typeof body.link === "string" ? body.link.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const imageAssetId = typeof body.imageAssetId === "number" ? body.imageAssetId : null;
  const statusRaw = typeof body.status === "string" ? body.status.toUpperCase().trim() : "OPEN";

  if (!title || !institution || !description) {
    return NextResponse.json(
      { error: "Naslov, institucija i opis su obavezni." },
      { status: 400 },
    );
  }

  if (!imageUrl && imageAssetId === null) {
    return NextResponse.json(
      { error: "Slika je obavezna za objavu subvencije." },
      { status: 400 },
    );
  }

  if (!ALLOWED_STATUSES.has(statusRaw)) {
    return NextResponse.json({ error: "Neispravan status subvencije." }, { status: 400 });
  }

  const opensAt = body.opensAt ? new Date(body.opensAt) : null;
  const closesAt = body.closesAt ? new Date(body.closesAt) : null;

  if (opensAt && Number.isNaN(opensAt.getTime())) {
    return NextResponse.json({ error: "Datum otvaranja nije validan." }, { status: 400 });
  }

  if (closesAt && Number.isNaN(closesAt.getTime())) {
    return NextResponse.json({ error: "Datum zatvaranja nije validan." }, { status: 400 });
  }

  const updated = await updateSubsidy(subsidyId, {
    title,
    institution,
    description,
    amount: amount || null,
    region: region || null,
    link: link || null,
    imageUrl: imageUrl || null,
    imageAssetId,
    status: statusRaw as "DRAFT" | "OPEN" | "CLOSING_SOON" | "CLOSED",
    opensAt,
    closesAt,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.role !== "MODERATOR") {
    return NextResponse.json({ error: "Samo moderator moze da brise subvencije." }, { status: 403 });
  }

  const { id } = await context.params;
  const subsidyId = Number(id);
  if (!Number.isFinite(subsidyId) || subsidyId <= 0) {
    return NextResponse.json({ error: "Neispravan ID subvencije." }, { status: 400 });
  }

  try {
    await deleteSubsidy(subsidyId);
  } catch {
    return NextResponse.json({ error: "Subvencija nije pronadjena." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
