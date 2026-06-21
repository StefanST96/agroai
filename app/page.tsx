import Link from "next/link";
import LogoutButton from "./components/LogoutButton";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getFeedPosts, getMarketPrices } from "@/lib/db";

const navItems = [
  ["Home", "Pocetna", "/"],
  ["AI", "AI Asistent", "/ai-asistent"],
  ["Tips", "Iskustva i saveti", "/"],
  ["Market", "Cene na pijaci", "/cene-na-pijaci"],
  ["Funds", "Subvencije i konkursi", "/subvencije"],
  ["Weather", "Vremenska prognoza", "/"],
  ["Plants", "Bolesti biljaka", "/bolesti-biljaka"],
  ["Ads", "Oprema i oglasi", "/"],
  ["Events", "Dogadjaji", "/"],
  ["Users", "Korisnici", "/profil"],
  ["Partners", "Prijatelji sajta", "/"],
];

const featureCards = [
  {
    icon: "AI",
    title: "AI Asistent",
    text: "Postavi pitanje i dobij strucan odgovor odmah.",
    action: "Pitaj AI",
    tone: "green",
    href: "/ai-asistent",
  },
  {
    icon: "RSD",
    title: "Cene na pijaci",
    text: "Proveri najnovije cene voca, povrca i stoke.",
    action: "Vidi cene",
    tone: "gold",
    href: "/cene-na-pijaci",
  },
  {
    icon: "DOC",
    title: "Subvencije",
    text: "Pronadji aktuelne konkurse i uslove za subvencije.",
    action: "Pogledaj",
    tone: "blue",
    href: "/subvencije",
  },
  {
    icon: "IMG",
    title: "Bolesti biljaka",
    text: "Uploaduj sliku biljke i proveri simptome bolesti.",
    action: "Analiziraj",
    tone: "sky",
    href: "/bolesti-biljaka",
  },
];

async function getPageData() {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const [posts, marketPrices] = await Promise.all([
    getFeedPosts(),
    getMarketPrices(),
  ]);

  return { profile, posts, marketPrices };
}

export default async function Page() {
  const { profile, posts, marketPrices } = await getPageData();
  const userAvatar = profile?.avatarUrl ||
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80";

  return (
    <div className="social-shell">
      <header className="app-header">
        <Link className="logo" href="/">
          <span className="logo-mark">A</span>
          <span>AgroAI</span>
        </Link>

        <label className="search-box">
          <span>Search</span>
          <input placeholder="Pretrazi savete, iskustva, subvencije..." />
        </label>

        <div className="header-actions">
          <Link className="new-post" href="/registracija">
            <span>+</span>
            Novi post
          </Link>
          <button className="icon-button" type="button" aria-label="Poruke">
            Msg
          </button>
          <button className="icon-button notification" type="button" aria-label="Obavestenja">
            Bell
            <span>3</span>
          </button>
          <Link className="mini-profile" href="/profil">
            <span>
              <strong>{profile?.name}</strong>
              <small>{profile?.location}</small>
            </span>
            <img src={userAvatar} alt={profile?.name || "Korisnik"} />
          </Link>
          <LogoutButton />
        </div>
      </header>

      <aside className="social-sidebar">
        <nav className="social-nav">
          {navItems.map(([icon, label, href], index) => (
            <Link className={`social-nav-item ${index === 0 ? "active" : ""}`} href={href} key={label}>
              {/* <span>{icon}</span> */}
              {label}
            </Link>
          ))}
        </nav>

        <section className="premium-card">
          <div className="premium-icon">PRO</div>
          <h3>Premium clanstvo</h3>
          <p>Otkljucaj napredne AI savete, detaljne analize i jos mnogo toga.</p>
          <button type="button">Nadogradi sada</button>
        </section>

        <section className="version-card">
          <strong>AgroAI v2.0</strong>
          <span>AI saveti i analiza biljaka</span>
        </section>
      </aside>

      <main className="feed-main">
        <section className="feature-grid">
          {featureCards.map((card) => (
            <article className={`feature-card ${card.tone}`} key={card.title}>
              {/* <div className="feature-icon">{card.icon}</div> */}
              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Link href={card.href}>{card.action} -&gt;</Link>
              </div>
            </article>
          ))}
        </section>

        <section className="composer">
          <img src={userAvatar} alt={profile?.name || "Korisnik"} />
          <div className="composer-body">
            <input placeholder="Sta zelite da podelite sa zajednicom?" />
            <div className="composer-tools">
              <button type="button">Dodaj sliku</button>
              <button type="button">Video</button>
              <button type="button">Anketa</button>
              <button type="button">Oznaka</button>
              <button className="publish-button" type="button">
                Objavi
              </button>
            </div>
          </div>
        </section>

        <nav className="tabs">
          <button className="active" type="button">
            Svi postovi
          </button>
          <button type="button">Pratim</button>
          <button type="button">Najnovije</button>
          <button type="button">Popularno</button>
        </nav>

        <section className="post-list">
          {posts.map((post) => (
            <article className="social-post" key={post.id}>
              <div className="post-copy">
                <div className="author-row">
                  <img
                    src={post.author?.avatarUrl ||
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80"}
                    alt={post.author?.name || "Autor"}
                  />
                  <div>
                    <strong>{post.author?.name}</strong>
                    <span>
                      {post.author?.location || "Srbija"} - {new Date(post.createdAt).toLocaleDateString("sr-RS")}
                    </span>
                  </div>
                </div>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <div className="post-actions">
                  <button type="button">Like {post.likes?.length ?? 0}</button>
                  <button type="button">Komentari {post.comments?.length ?? 0}</button>
                  <button type="button">Podeli</button>
                </div>
              </div>
              <div className="post-media">
                <span className={`topic-pill ${post.category?.toLowerCase()}`}>
                  {post.category}
                </span>
                {post.imageUrl ? <img src={post.imageUrl} alt={post.title} /> : null}
                <button type="button" aria-label="Post opcije">
                  ...
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <aside className="social-rightbar">
        <section className="side-panel">
          <div className="panel-heading">
            <h4>Cene na pijaci</h4>
            <Link href="/cene-na-pijaci">Pogledaj sve</Link>
          </div>
          <div className="price-list">
            {marketPrices.map((price) => (
              <div className="price-row" key={price.id}>
                <span className="crop-icon">{price.product?.name?.[0] ?? "?"}</span>
                <span>
                  <strong>
                    {price.product?.name} ({price.unit?.toLowerCase()})
                  </strong>
                  <small>{price.market?.name}</small>
                </span>
                <span className="price-value">
                  <strong>{price.price.toString()}</strong>
                  <small>{price.source ?? "User submitted"}</small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="side-panel sponsor-card agrochem">
          <div>
            <h3>AgroChem</h3>
            <p>Kvalitetna zastita za vece prinose</p>
            <Link href="/">Pogledaj ponudu -&gt;</Link>
          </div>
          <div className="bottles">
            <span />
            <span />
          </div>
        </section>

        <section className="tractor-ad">
          <div>
            <h3>Poljoprivredna mehanizacija</h3>
            <p>POPUSTI DO 20%</p>
            <button type="button">Saznaj vise</button>
          </div>
        </section>
      </aside>

      <footer className="bottom-stats">
        <div>
          <span>Users</span>
          <strong>12.450+</strong>
          <small>Aktivnih korisnika</small>
        </div>
        <div>
          <span>Posts</span>
          <strong>3.320+</strong>
          <small>Podeljenih iskustava</small>
        </div>
        <div>
          <span>Price</span>
          <strong>1.250+</strong>
          <small>Cena azurirano danas</small>
        </div>
        <div>
          <span>Chat</span>
          <strong>320+</strong>
          <small>Aktivnih diskusija</small>
        </div>
        <div>
          <span>AI</span>
          <strong>AI Asistent</strong>
          <small>Dostupan 24/7</small>
        </div>
      </footer>
    </div>
  );
}
