import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createMarketPrice, createMarketPriceForExisting, getCurrentUser, getMarketPrices } from "@/lib/db";

export async function GET() {
  const prices = await getMarketPrices();
  return NextResponse.json(prices);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { marketId, productId, marketName, marketCity, productName, productCategory, price, unit } = body;

  if (!price || !unit) {
    return NextResponse.json({ error: "Missing market price fields." }, { status: 400 });
  }

  const parsedMarketId = Number(marketId);
  const parsedProductId = Number(productId);
  const hasExistingSelection = Number.isFinite(parsedMarketId) && parsedMarketId > 0 && Number.isFinite(parsedProductId) && parsedProductId > 0;

  if (
    !hasExistingSelection &&
    (!marketName || !marketCity || !productName || !productCategory)
  ) {
    return NextResponse.json({ error: "Missing market or product fields." }, { status: 400 });
  }

  const user = await getCurrentUser(request);
  const marketPrice = hasExistingSelection
    ? await createMarketPriceForExisting({
        marketId: parsedMarketId,
        productId: parsedProductId,
        price: Number(price),
        unit,
        reporterId: user?.id,
      })
    : await createMarketPrice({
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
