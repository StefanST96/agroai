import { NextResponse } from "next/server";
import { getCurrentUser, getReportsForAdmin, updateReportStatus } from "@/lib/db";

const ALLOWED_STATUS = new Set(["OPEN", "REVIEWED", "RESOLVED", "REJECTED"]);

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin pristup je obavezan." }, { status: 403 });
  }

  const reports = await getReportsForAdmin();
  return NextResponse.json(reports);
}

export async function PATCH(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin pristup je obavezan." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const reportId = Number(body.reportId);
  const status = typeof body.status === "string" ? body.status.toUpperCase() : "";

  if (!Number.isFinite(reportId) || reportId <= 0) {
    return NextResponse.json({ error: "reportId is required." }, { status: 400 });
  }

  if (!ALLOWED_STATUS.has(status)) {
    return NextResponse.json({ error: "Invalid report status." }, { status: 400 });
  }

  const updated = await updateReportStatus({
    reportId,
    status: status as "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED",
    resolvedById: currentUser.id,
  });

  return NextResponse.json(updated);
}
