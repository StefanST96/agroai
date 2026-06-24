import { getCurrentUser, deletePartner } from "@/lib/db";
import { cookies } from "next/headers";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const user = await getCurrentUser(cookieStore);

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const partnerId = Number.parseInt(id, 10);

  if (!Number.isFinite(partnerId)) {
    return Response.json({ error: "Invalid partner ID" }, { status: 400 });
  }

  try {
    await deletePartner(partnerId);
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete partner" }, { status: 500 });
  }
}
