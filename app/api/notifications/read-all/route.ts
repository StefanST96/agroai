import { NextResponse } from "next/server";
import {
  getCurrentUser,
  getFeedPosts,
  getMarketPrices,
  getSubsidies,
  markNotificationsReadForUser,
} from "@/lib/db";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const [posts, prices, subsidies] = await Promise.all([
    getFeedPosts(),
    getMarketPrices(),
    getSubsidies(),
  ]);

  const keys = [
    ...posts.filter((post) => post.authorId !== currentUser.id).slice(0, 4).map((post) => `post-${post.id}`),
    ...prices.slice(0, 2).map((price) => `price-${price.id}`),
    ...subsidies.slice(0, 2).map((subsidy) => `subsidy-${subsidy.id}`),
  ];

  const marked = await markNotificationsReadForUser(currentUser.id, keys);
  return NextResponse.json({ ok: true, marked });
}
