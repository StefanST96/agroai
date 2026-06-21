import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMarketPrice, getCurrentUser, getMarketPrices } from "@/lib/db";

export async function GET() {
  const prices = await getMarketPrices();
  return NextResponse.json(prices);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { marketName, marketCity, productName, productCategory, price, unit } = body;

  if (!marketName || !marketCity || !productName || !productCategory || !price || !unit) {
    return NextResponse.json({ error: "Missing market price fields." }, { status: 400 });
  }

  const user = await getCurrentUser(request);
  const marketPrice = await createMarketPrice({
    marketName,
    marketCity,
    productName,
    productCategory,
    price: Number(price),
    unit,
    reporterId: user?.id,
  });

  return NextResponse.json(marketPrice, { status: 201 });
}
