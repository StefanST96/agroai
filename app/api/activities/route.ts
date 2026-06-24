import { NextResponse } from "next/server";
import { createWeekendActivity, getActivityCities, getCurrentUser, getWeekendActivities } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = (searchParams.get("city") || "").trim();
  const limitRaw = Number(searchParams.get("limit") || "8");
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 30) : 8;

  const [items, cities] = await Promise.all([
    getWeekendActivities(limit, city || undefined),
    getActivityCities(),
  ]);

  return NextResponse.json({ items, cities });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Morate biti prijavljeni da biste dodali aktivnost." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const imageAssetId = typeof body.imageAssetId === "number" ? body.imageAssetId : undefined;
  const startAtRaw = typeof body.startAt === "string" ? body.startAt : "";
  const endAtRaw = typeof body.endAt === "string" ? body.endAt : "";

  if (!title || !city || !startAtRaw) {
    return NextResponse.json({ error: "Naslov, grad i datum/vreme su obavezni." }, { status: 400 });
  }

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "Datum aktivnosti nije validan." }, { status: 400 });
  }

  const endAt = endAtRaw ? new Date(endAtRaw) : undefined;
  if (endAt && Number.isNaN(endAt.getTime())) {
    return NextResponse.json({ error: "Krajnji datum aktivnosti nije validan." }, { status: 400 });
  }

  if (endAt && endAt < startAt) {
    return NextResponse.json({ error: "Krajnji datum mora biti nakon pocetnog." }, { status: 400 });
  }

  const created = await createWeekendActivity({
    title,
    city,
    location: location || undefined,
    category: category || undefined,
    description: description || undefined,
    imageUrl: imageUrl || undefined,
    imageAssetId,
    startAt,
    endAt,
    createdById: currentUser.id,
  });

  return NextResponse.json(created, { status: 201 });
}
