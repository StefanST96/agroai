import { NextResponse } from "next/server";
import { createProperty, getCurrentUser, getProperties } from "@/lib/db";

const ALLOWED_CATEGORIES = new Set(["KUCA", "ZEMLJISTE", "STAN", "VIKENDICA", "IMANJE"]);

export async function GET() {
  const properties = await getProperties({ activeOnly: true });
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Samo moderator ili administrator mogu dodavati oglas." }, { status: 403 });
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
  const price = Number(body.price);

  if (!title || !city || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Naslov, grad i validna cena su obavezni." }, { status: 400 });
  }

  if (!ALLOWED_CATEGORIES.has(categoryRaw)) {
    return NextResponse.json({ error: "Neispravna kategorija oglasa." }, { status: 400 });
  }

  const areaSqm = body.areaSqm === undefined || body.areaSqm === null || body.areaSqm === ""
    ? undefined
    : Number(body.areaSqm);
  const landHa = body.landHa === undefined || body.landHa === null || body.landHa === ""
    ? undefined
    : Number(body.landHa);
  const rooms = body.rooms === undefined || body.rooms === null || body.rooms === ""
    ? undefined
    : Number(body.rooms);

  if (areaSqm !== undefined && (!Number.isFinite(areaSqm) || areaSqm < 0)) {
    return NextResponse.json({ error: "Površina kuće nije validna." }, { status: 400 });
  }

  if (landHa !== undefined && (!Number.isFinite(landHa) || landHa < 0)) {
    return NextResponse.json({ error: "Površina placa nije validna." }, { status: 400 });
  }

  if (rooms !== undefined && (!Number.isFinite(rooms) || rooms < 0)) {
    return NextResponse.json({ error: "Broj soba nije validan." }, { status: 400 });
  }

  const created = await createProperty({
    title,
    description: description || undefined,
    price,
    currency: currency || "EUR",
    city,
    region: region || undefined,
    areaSqm,
    landHa,
    rooms,
    category: categoryRaw as "KUCA" | "ZEMLJISTE" | "STAN" | "VIKENDICA" | "IMANJE",
    imageUrl: imageUrl || undefined,
    contactPhone: contactPhone || undefined,
    contactName: contactName || undefined,
  });

  return NextResponse.json(created, { status: 201 });
}
