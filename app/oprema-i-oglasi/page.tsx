import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getFeedPosts } from "@/lib/db";

const equipmentKeywords = ["traktor", "prskal", "oprema", "prikol", "kombajn", "mehanizacij", "oglas"];

async function getAdsData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const posts = await getFeedPosts();
  const ads = posts.filter((post) => {
    const text = `${post.title} ${post.content}`.toLowerCase();
    return equipmentKeywords.some((kw) => text.includes(kw));
  });

  return { profile, ads };
}

export default async function EquipmentAdsPage() {
  const { ads } = await getAdsData();

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Oprema i oglasi</div>
          <h1>Pregled opreme i ponuda</h1>
          <p className="muted">Objave iz zajednice koje se odnose na mehanizaciju i opremu.</p>
        </div>
        <Link className="button secondary" href="/#new-post">
          Dodaj oglas
        </Link>
      </div>

      <section className="timeline">
        {ads.length ? (
          ads.map((post) => (
            <article className="panel subsidy-row" key={post.id}>
              <div>
                <span className="badge">{post.category}</span>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <p className="muted">Autor: {post.author?.name ?? "Nepoznat"}</p>
              </div>
              <div>
                <strong>Kontakt</strong>
                <p className="muted">Otvorite profil autora i kontaktirajte direktno.</p>
              </div>
            </article>
          ))
        ) : (
          <section className="panel">
            <p>Nema oglasa. Dodajte prvi post preko + Novi post.</p>
          </section>
        )}
      </section>
    </main>
  );
}
