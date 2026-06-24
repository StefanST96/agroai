import { getCurrentUser } from "@/lib/db";
import { getPartners, createPartner, deletePartner } from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  const partners = await getPartners();
  return Response.json(partners);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const user = await getCurrentUser(cookieStore);

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    const partner = await createPartner(data);
    return Response.json(partner, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create partner" }, { status: 500 });
  }
}
