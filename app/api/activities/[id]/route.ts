import { NextResponse } from "next/server";
import { deleteWeekendActivity, getCurrentUser, getWeekendActivityById, updateWeekendActivity } from "@/lib/db";

function canManageActivity(actor: { id: number; role?: string }, ownerId: number) {
  return actor.id === ownerId || actor.role === "ADMIN" || actor.role === "MODERATOR";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
  }

  const { id } = await context.params;
  const activityId = Number(id);
  if (!Number.isFinite(activityId) || activityId <= 0) {
    return NextResponse.json({ error: "Neispravan ID aktivnosti." }, { status: 400 });
  }

  const existing = await getWeekendActivityById(activityId);
  if (!existing) {
    return NextResponse.json({ error: "Aktivnost nije pronadjena." }, { status: 404 });
  }

  if (!canManageActivity(currentUser, existing.createdById)) {
    return NextResponse.json({ error: "Nemate dozvolu za izmenu ove aktivnosti." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : undefined;
  const city = typeof body.city === "string" ? body.city.trim() : undefined;
  const location = typeof body.location === "string" ? body.location.trim() : undefined;
  const category = typeof body.category === "string" ? body.category.trim() : undefined;
  const description = typeof body.description === "string" ? body.description.trim() : undefined;
  const imageUrl = body.imageUrl === null
    ? null
    : typeof body.imageUrl === "string"
      ? body.imageUrl.trim()
      : undefined;
  const imageAssetId = body.imageAssetId === null
    ? null
    : typeof body.imageAssetId === "number"
      ? body.imageAssetId
      : undefined;

  const startAt = typeof body.startAt === "string" ? new Date(body.startAt) : undefined;
  const endAt = body.endAt === null
    ? null
    : typeof body.endAt === "string"
      ? new Date(body.endAt)
      : undefined;

  if (title !== undefined && !title) {
    return NextResponse.json({ error: "Naslov ne moze biti prazan." }, { status: 400 });
  }

  if (city !== undefined && !city) {
    return NextResponse.json({ error: "Grad ne moze biti prazan." }, { status: 400 });
  }

  if (startAt && Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "Datum pocetka nije validan." }, { status: 400 });
  }

  if (endAt && Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: "Datum kraja nije validan." }, { status: 400 });
  }

  const effectiveStart = startAt ?? existing.startAt;
  const effectiveEnd = endAt === undefined ? existing.endAt : endAt;

  if (effectiveEnd && effectiveEnd < effectiveStart) {
    return NextResponse.json({ error: "Krajnji datum mora biti nakon pocetnog." }, { status: 400 });
  }

  const updated = await updateWeekendActivity(activityId,{
    title,
    city,
    location,
    category,
    description,
    imageUrl,
    imageAssetId,
    startAt,
    endAt,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Morate biti prijavljeni." }, { status: 401 });
  }

  const { id } = await context.params;
  const activityId = Number(id);
  if (!Number.isFinite(activityId) || activityId <= 0) {
    return NextResponse.json({ error: "Neispravan ID aktivnosti." }, { status: 400 });
  }

  const existing = await getWeekendActivityById(activityId);
  if (!existing) {
    return NextResponse.json({ error: "Aktivnost nije pronadjena." }, { status: 404 });
  }

  if (!canManageActivity(currentUser, existing.createdById)) {
    return NextResponse.json({ error: "Nemate dozvolu za brisanje ove aktivnosti." }, { status: 403 });
  }

  await deleteWeekendActivity(activityId);
  return NextResponse.json({ ok: true });
}
