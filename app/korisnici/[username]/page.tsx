import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import PostInteractions from "@/app/components/PostInteractions";
import ProfileReportButton from "@/app/components/ProfileReportButton";
import ZoomableProfileImage from "@/app/components/ZoomableProfileImage";
import PollWidget from "@/app/components/PollWidget";
import { getCurrentUser, getPostsByUserDetailed, getUserByUsername } from "@/lib/db";

type Params = {
  username: string;
};

type PollData = {
  question: string;
  options: string[];
};

async function getPageData(paramsPromise: Promise<Params>) {
  const params = await paramsPromise;
  const cookieStore = await cookies();
  const currentUser = await getCurrentUser(cookieStore);

  if (!currentUser) {
    redirect("/login");
  }

  const profile = await getUserByUsername(params.username);
  if (!profile) {
    notFound();
  }

  const posts = await getPostsByUserDetailed(profile.id);
  return { currentUser, profile, posts };
}

export default async function PublicUserProfilePage({ params }: { params: Promise<Params> }) {
  const { currentUser, profile, posts } = await getPageData(params);
  const avatar = profile.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80";
  const isOwnProfile = currentUser.id === profile.id;

  function extractPollData(text: string): PollData | null {
    const match = text.match(/<!--POLL:([\s\S]*?)-->/);
    if (!match?.[1]) return null;

    try {
      const parsed = JSON.parse(decodeURIComponent(match[1])) as Partial<PollData>;
      if (
        typeof parsed.question === "string" &&
        Array.isArray(parsed.options) &&
        parsed.options.every((item) => typeof item === "string") &&
        parsed.options.length >= 2
      ) {
        return {
          question: parsed.question,
          options: parsed.options,
        };
      }
    } catch {
      return null;
    }

    return null;
  }

  function cleanPostContent(text: string) {
    return text
      .replace(/<!--POLL:[\s\S]*?-->/, "")
      .replace(/(?:^|\n)Video:\s*\S+/i, "")
      .trim();
  }

  function getCategoryLabel(category?: string | null) {
    const value = (category || "GENERAL").toUpperCase();
    if (value === "SUBSIDY") return "Subvencije";
    if (value === "QUESTION") return "Pitanje";
    if (value === "MARKET") return "Trziste";
    if (value === "DISEASE") return "Bolesti";
    return "Opste";
  }

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Profil korisnika</div>
          <h1>{profile.name}</h1>
          <p className="muted">@{profile.username} · {profile.location || "Srbija"}</p>
        </div>
        <ZoomableProfileImage className="profile-hero-avatar" src={avatar} alt={profile.name} />
      </div>

      <section className="panel" style={{ marginBottom: 16 }}>
        <h2>O korisniku</h2>
        <p><strong>Gazdinstvo:</strong> {profile.farmName || "-"}</p>
        <p>{profile.bio || "Korisnik nije dodao opis."}</p>
        <div className="actions">
          <Link className="button secondary" href="/">Nazad na feed</Link>
          {isOwnProfile ? <Link className="button" href="/profil">Izmeni moj profil</Link> : null}
          {!isOwnProfile ? <ProfileReportButton reportedUserId={profile.id} /> : null}
        </div>
      </section>

      <section className="panel">
        <h2>Objave korisnika</h2>
        <div className="post-list">
          {posts.length ? posts.map((post) => {
            const pollData = extractPollData(post.content || "");
            const content = cleanPostContent(post.content || "");
            const categoryLabel = getCategoryLabel(post.category);

            return (
            <article className={`social-post ${post.imageUrl ? "" : "no-media"}`} key={post.id}>
              <div className="post-copy">
                <div className="post-title-row">
                  <h2>{post.title}</h2>
                  <span className={`topic-pill inline category-${post.category?.toLowerCase() || "general"}`}>{categoryLabel}</span>
                </div>
                {content ? <p>{content}</p> : null}
                {pollData ? (
                  <PollWidget
                    postId={post.id}
                    question={pollData.question}
                    options={pollData.options}
                  />
                ) : null}
                <PostInteractions
                  postId={post.id}
                  initialLikes={post.likes?.length ?? 0}
                  initialComments={(post.comments ?? []).map((comment) => {
                    const likes = new Set((comment.likes ?? []).map((like) => like.authorId));

                    return {
                      id: comment.id,
                      content: comment.content,
                      createdAt: comment.createdAt?.toISOString?.() || String(comment.createdAt),
                      author: comment.author
                        ? {
                            id: comment.author.id,
                            name: comment.author.name,
                            avatarUrl: comment.author.avatarUrl || null,
                          }
                        : undefined,
                      likesCount: likes.size,
                      likedByMe: false,
                      replies: (comment.replies ?? []).map((reply) => ({
                        id: reply.id,
                        content: reply.content,
                        createdAt: reply.createdAt?.toISOString?.() || String(reply.createdAt),
                        author: reply.author
                          ? {
                              id: reply.author.id,
                              name: reply.author.name,
                              avatarUrl: reply.author.avatarUrl || null,
                            }
                          : undefined,
                      })),
                    };
                  })}
                />
              </div>
              {post.imageUrl ? (
                <div className="post-media">
                  <img src={post.imageUrl} alt={post.title} />
                </div>
              ) : null}
            </article>
            );
          }) : <p>Nema objava za prikaz.</p>}
        </div>
      </section>
    </main>
  );
}
