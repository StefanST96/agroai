import { NextResponse } from "next/server";
import { getCurrentUser, getDismissedNotificationKeys, getFeedPosts, getMarketPrices, getSubsidies } from "@/lib/db";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ items: [], unread: 0 });
  }

  const [posts, prices, subsidies] = await Promise.all([
    getFeedPosts(),
    getMarketPrices(),
    getSubsidies(),
  ]);
  const dismissedKeys = new Set(await getDismissedNotificationKeys(currentUser.id));

  const postNotifications = posts
    .filter((post) => post.authorId !== currentUser.id)
    .slice(0, 4)
    .map((post) => ({
      id: `post-${post.id}`,
      title: `${post.author?.name ?? "Korisnik"} je objavio novu poruku`,
      body: post.title,
      href: "/",
      createdAt: post.createdAt,
    }));

  const priceNotifications = prices.slice(0, 2).map((price) => ({
    id: `price-${price.id}`,
    title: `Nova cena: ${price.product?.name ?? "Proizvod"}`,
    body: `${price.price.toString()} ${price.unit.toLowerCase()} · ${price.market?.name ?? "Pijaca"}`,
    href: "/cene-na-pijaci",
    createdAt: price.createdAt,
  }));

  const subsidyNotifications = subsidies.slice(0, 2).map((subsidy) => ({
    id: `subsidy-${subsidy.id}`,
    title: "Nova informacija o subvencijama",
    body: subsidy.title,
    href: "/subvencije",
    createdAt: subsidy.createdAt,
  }));

  const items = [...postNotifications, ...priceNotifications, ...subsidyNotifications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map((item) => ({
      ...item,
      isRead: dismissedKeys.has(item.id),
      createdAt: new Date(item.createdAt).toISOString(),
    }));

  const unread = items.reduce((sum, item) => sum + (item.isRead ? 0 : 1), 0);

  return NextResponse.json({ items, unread });
}
