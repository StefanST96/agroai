import { NextResponse } from "next/server";
import { getSubsidies } from "@/lib/db";

export async function GET() {
  const subsidies = await getSubsidies();
  return NextResponse.json(subsidies);
}
