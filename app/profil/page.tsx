import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getFeedPosts } from "@/lib/db";

async function getProfileData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }
  const posts = await getFeedPosts();

  return { profile, posts };
}

export default async function ProfilePage() {
  const { profile, posts } = await getProfileData();
  const userPosts = posts.filter((post) => post.author?.id === profile.id);

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Profil</div>
          <h1>{profile.name}</h1>
          <p className="muted">
            @{profile.username} · {profile.location}
          </p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <section className="grid two-cols">
        <div className="panel">
          <h2>Podaci korisnika</h2>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Gazdinstvo:</strong> {profile.farmName ?? "-"}
          </p>
          <p>{profile.bio ?? "Nema opisa"}</p>
        </div>

        <div className="panel">
          <h2>Aktivnost</h2>
          <p>
            <strong>{userPosts.length}</strong> objava
          </p>
          <p>
            <strong>{userPosts.reduce((sum, post) => sum + (post.likes?.length ?? 0), 0)}</strong> primljena lajka
          </p>
          <p>
            <strong>{profile.location ?? "Srbija"}</strong> glavna pijaca za pracenje
          </p>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Moje objave</h2>
        {userPosts.length ? (
          userPosts.map((post) => (
            <article className="post" key={post.id}>
              <span className="badge">{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </article>
          ))
        ) : (
          <p>Nema objava za prikaz.</p>
        )}
      </section>
    </main>
  );
}
