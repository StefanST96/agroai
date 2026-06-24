import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createPost, getFeedPosts, getCurrentUser } from "@/lib/db";

export async function GET() {
  const posts = await getFeedPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { title, content, category, imageUrl, imageAssetId, videoAssetId } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  }

  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const newPost = await createPost({
    title,
    content,
    category: category || undefined,
    imageUrl,
    imageAssetId: typeof imageAssetId === "number" ? imageAssetId : undefined,
    videoAssetId: typeof videoAssetId === "number" ? videoAssetId : undefined,
    authorId: currentUser.id,
  });

  return NextResponse.json(newPost, { status: 201 });
}
