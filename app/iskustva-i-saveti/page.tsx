import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getFeedPosts } from "@/lib/db";

async function getTipsData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const posts = await getFeedPosts();
  const tipsPosts = posts.filter((post) => {
    const c = post.category?.toString().toLowerCase();
    return (
      c === "general" ||
      c === "question" ||
      c === "disease" ||
      c === "vocarstvo" ||
      c === "povrcarstvo" ||
      c === "stocarstvo" ||
      c === "biljna_proizvodnja" ||
      c === "zivot_na_selu"
    );
  });

  return { profile, tipsPosts };
}

export default async function TipsPage() {
  const { tipsPosts } = await getTipsData();

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Iskustva i saveti</div>
          <h1>Zajednica i praksa sa terena</h1>
          <p className="muted">Saveti poljoprivrednika i diskusije koje mogu odmah da pomognu u radu.</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      <section className="panel" style={{ marginBottom: 16 }}>
        <h2>Pregled objava</h2>
        <p className="muted">Filtrirano iz feed-a po savetodavnim kategorijama i iskustvima sa terena.</p>
      </section>

      <section className="timeline">
        {tipsPosts.length ? (
          tipsPosts.map((post) => (
            <article className="panel subsidy-row" key={post.id}>
              <div>
                <span className="badge">{post.category}</span>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <p className="muted">
                  {post.author?.name} · {new Date(post.createdAt).toLocaleDateString("sr-RS")}
                </p>
              </div>
              <div>
                <strong>Interakcije</strong>
                <p>{post.likes?.length ?? 0} lajkova</p>
                <p>{post.comments?.length ?? 0} komentara</p>
              </div>
            </article>
          ))
        ) : (
          <section className="panel">
            <strong>Trenutno nema objava za prikaz.</strong>
            <p className="muted">Dodajte novu objavu na početnoj stranici ili promenite kategoriju u feed-u.</p>
            <Link className="button secondary" href="/#new-post">Dodaj novo iskustvo</Link>
          </section>
        )}
      </section>
    </main>
  );
}
