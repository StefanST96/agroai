import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "agroai",
      time: new Date().toISOString(),
    },
    { status: 200 }
  );
}
