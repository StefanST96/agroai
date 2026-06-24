import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getFeedPosts, getUserProfileByUserId } from "@/lib/db";
import ProfileEditor from "../components/ProfileEditor";
import DeletePostButton from "../components/DeletePostButton";
import PollWidget from "../components/PollWidget";
import ZoomableProfileImage from "../components/ZoomableProfileImage";

type PollData = {
  question: string;
  options: string[];
};

async function getProfileData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }
  const [posts, userProfile] = await Promise.all([
    getFeedPosts(),
    getUserProfileByUserId(profile.id),
  ]);

  return { profile, posts, userProfile };
}

export default async function ProfilePage() {
  const { profile, posts, userProfile } = await getProfileData();
  const userPosts = posts.filter((post) => post.author?.id === profile.id);
  const displayName = userProfile?.displayName || profile.name;
  const displayLocation = userProfile?.location || profile.location;
  const displayFarmName = userProfile?.farmName || profile.farmName;
  const displayBio = userProfile?.bio || profile.bio;
  const displayAvatar = profile.avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80";

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
    <main className="main profile-page">
      <section className="panel profile-hero">
        <div className="profile-hero-copy">
          <div className="eyebrow">Profil</div>
          <h1>{displayName}</h1>
          <p className="muted">
            @{profile.username} · {displayLocation || "Srbija"}
          </p>
          <p>{displayBio ?? "Nema opisa"}</p>
          <div className="actions">
            <Link className="button secondary" href="/">
              Nazad na feed
            </Link>
          </div>
        </div>
        <ZoomableProfileImage className="profile-hero-avatar" src={displayAvatar} alt={displayName} />
      </section>

      <section className="grid two-cols profile-stats-grid">
        <article className="panel profile-stat-card">
          <h3>Ukupno objava</h3>
          <strong>{userPosts.length}</strong>
          <p className="muted">Objave koje ste podelili sa zajednicom.</p>
        </article>

        <article className="panel profile-stat-card">
          <h3>Primljeni lajkovi</h3>
          <strong>{userPosts.reduce((sum, post) => sum + (post.likes?.length ?? 0), 0)}</strong>
          <p className="muted">Ukupan broj reakcija na vase objave.</p>
        </article>

        <article className="panel profile-stat-card">
          <h3>Lokacija</h3>
          <strong>{displayLocation ?? "Srbija"}</strong>
          <p className="muted">Glavni region pracenja i aktivnosti.</p>
        </article>

        <article className="panel profile-stat-card">
          <h3>Gazdinstvo</h3>
          <strong>{displayFarmName ?? "-"}</strong>
          <p className="muted">Naziv ili opis vaseg gazdinstva.</p>
        </article>
      </section>

      <section className="grid two-cols profile-layout-grid">
        <section className="panel profile-editor-panel">
          <h2>Podaci korisnika</h2>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Gazdinstvo:</strong> {displayFarmName ?? "-"}
          </p>
          <h2>Izmena profila</h2>
          <ProfileEditor
            initial={{
              name: displayName,
              location: displayLocation ?? "",
              farmName: displayFarmName ?? "",
              bio: displayBio ?? "",
              avatarUrl: displayAvatar,
            }}
          />
        </section>

        <section className="panel profile-posts-panel">
          <h2>Moje objave</h2>
          <div className="profile-post-list">
            {userPosts.length ? (
              userPosts.map((post) => {
                const pollData = extractPollData(post.content || "");
                const content = cleanPostContent(post.content || "");

                return (
                <article className="post" key={post.id}>
                  <span className="badge">{getCategoryLabel(post.category)}</span>
                  <div className="profile-post-head">
                    <h3>{post.title}</h3>
                    <DeletePostButton postId={post.id} />
                  </div>
                  {content ? <p>{content}</p> : null}
                  {pollData ? (
                    <PollWidget
                      postId={post.id}
                      question={pollData.question}
                      options={pollData.options}
                    />
                  ) : null}
                </article>
                );
              })
            ) : (
              <p>Nema objava za prikaz.</p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
