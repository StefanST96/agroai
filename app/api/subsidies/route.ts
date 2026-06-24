import { NextResponse } from "next/server";
import { createSubsidy, getCurrentUser, getSubsidies } from "@/lib/db";

const ALLOWED_STATUSES = new Set(["DRAFT", "OPEN", "CLOSING_SOON", "CLOSED"]);

export async function GET() {
  const subsidies = await getSubsidies();
  return NextResponse.json(subsidies);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    return NextResponse.json({ error: "Samo administrator ili moderator moze da dodaje subvencije." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const institution = typeof body.institution === "string" ? body.institution.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const amount = typeof body.amount === "string" ? body.amount.trim() : "";
  const region = typeof body.region === "string" ? body.region.trim() : "";
  const link = typeof body.link === "string" ? body.link.trim() : "";
  const statusRaw = typeof body.status === "string" ? body.status.toUpperCase().trim() : "OPEN";

  if (!title || !institution || !description) {
    return NextResponse.json(
      { error: "Naslov, institucija i opis su obavezni." },
      { status: 400 },
    );
  }

  if (!ALLOWED_STATUSES.has(statusRaw)) {
    return NextResponse.json({ error: "Neispravan status subvencije." }, { status: 400 });
  }

  const opensAt = body.opensAt ? new Date(body.opensAt) : undefined;
  const closesAt = body.closesAt ? new Date(body.closesAt) : undefined;

  if (opensAt && Number.isNaN(opensAt.getTime())) {
    return NextResponse.json({ error: "Datum otvaranja nije validan." }, { status: 400 });
  }

  if (closesAt && Number.isNaN(closesAt.getTime())) {
    return NextResponse.json({ error: "Datum zatvaranja nije validan." }, { status: 400 });
  }

  const created = await createSubsidy({
    title,
    institution,
    description,
    amount: amount || undefined,
    region: region || undefined,
    link: link || undefined,
    status: statusRaw as "DRAFT" | "OPEN" | "CLOSING_SOON" | "CLOSED",
    opensAt,
    closesAt,
  });

  return NextResponse.json(created, { status: 201 });
}
