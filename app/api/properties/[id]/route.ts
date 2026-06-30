import { NextResponse } from "next/server";
import { deleteProperty, getCurrentUser, getPropertyById, updateProperty } from "@/lib/db";

const ALLOWED_CATEGORIES = new Set(["KUCA", "ZEMLJISTE", "STAN", "VIKENDICA", "IMANJE"]);

function canManage(role?: string) {
  return role === "ADMIN" || role === "MODERATOR";
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !canManage(currentUser.role)) {
    return NextResponse.json({ error: "Samo moderator ili administrator mogu menjati oglas." }, { status: 403 });
  }

  const { id } = await context.params;
  const propertyId = Number(id);
  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return NextResponse.json({ error: "Neispravan ID oglasa." }, { status: 400 });
  }

  const existing = await getPropertyById(propertyId);
  if (!existing) {
    return NextResponse.json({ error: "Oglas nije pronađen." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const region = typeof body.region === "string" ? body.region.trim() : "";
  const currency = typeof body.currency === "string" ? body.currency.trim() : "EUR";
  const contactPhone = typeof body.contactPhone === "string" ? body.contactPhone.trim() : "";
  const contactName = typeof body.contactName === "string" ? body.contactName.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const categoryRaw = typeof body.category === "string" ? body.category.toUpperCase().trim() : "KUCA";
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  const price = Number(body.price);

  if (!title || !city || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Naslov, grad i validna cena su obavezni." }, { status: 400 });
  }

  if (!ALLOWED_CATEGORIES.has(categoryRaw)) {
    return NextResponse.json({ error: "Neispravna kategorija oglasa." }, { status: 400 });
  }

  const areaSqm = body.areaSqm === undefined || body.areaSqm === null || body.areaSqm === ""
    ? null
    : Number(body.areaSqm);
  const landHa = body.landHa === undefined || body.landHa === null || body.landHa === ""
    ? null
    : Number(body.landHa);
  const rooms = body.rooms === undefined || body.rooms === null || body.rooms === ""
    ? null
    : Number(body.rooms);

  if (areaSqm !== null && (!Number.isFinite(areaSqm) || areaSqm < 0)) {
    return NextResponse.json({ error: "Površina kuće nije validna." }, { status: 400 });
  }

  if (landHa !== null && (!Number.isFinite(landHa) || landHa < 0)) {
    return NextResponse.json({ error: "Površina placa nije validna." }, { status: 400 });
  }

  if (rooms !== null && (!Number.isFinite(rooms) || rooms < 0)) {
    return NextResponse.json({ error: "Broj soba nije validan." }, { status: 400 });
  }

  const updated = await updateProperty(propertyId, {
    title,
    description: description || "",
    price,
    currency,
    city,
    region: region || "",
    areaSqm: areaSqm ?? undefined,
    landHa: landHa ?? undefined,
    rooms: rooms ?? undefined,
    category: categoryRaw,
    imageUrl: imageUrl || "",
    contactPhone: contactPhone || "",
    contactName: contactName || "",
    isActive,
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || !canManage(currentUser.role)) {
    return NextResponse.json({ error: "Samo moderator ili administrator mogu obrisati oglas." }, { status: 403 });
  }

  const { id } = await context.params;
  const propertyId = Number(id);
  if (!Number.isFinite(propertyId) || propertyId <= 0) {
    return NextResponse.json({ error: "Neispravan ID oglasa." }, { status: 400 });
  }

  const existing = await getPropertyById(propertyId);
  if (!existing) {
    return NextResponse.json({ error: "Oglas nije pronađen." }, { status: 404 });
  }

  await deleteProperty(propertyId);
  return NextResponse.json({ ok: true });
}
