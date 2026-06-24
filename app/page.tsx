import Link from "next/link";
import PostComposer from "./components/PostComposer";
import NotificationCenter from "./components/NotificationCenter";
import PostInteractions from "./components/PostInteractions";
import PollWidget from "./components/PollWidget";
import FooterScrollBehavior from "./components/FooterScrollBehavior";
import ProfileNavMenu from "./components/ProfileNavMenu";
import ZoomableProfileImage from "./components/ZoomableProfileImage";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActivityCities, getCurrentUser, getFeedPosts, getMarketPriceHighlights, getPlatformStats, getSidebarBanners, getWeekendActivities } from "@/lib/db";
import { formatDeltaValue, formatPriceDin, getProductIcon } from "@/lib/market";
import avatarImg from "../public/avatars/avatar.png";

type FeedTab = "all" | "following" | "latest" | "popular" | "nearby" | "admin";
const POSTS_PER_PAGE = 16;

type PollData = {
  question: string;
  options: string[];
};

type IconName =
  | "home"
  | "bot"
  | "tips"
  | "market"
  | "funds"
  | "weather"
  | "plants"
  | "ads"
  | "events"
  | "users"
  | "partners"
  | "chat"
  | "bell"
  | "search"
  | "image"
  | "video"
  | "poll"
  | "tag"
  | "like"
  | "comment"
  | "share"
  | "stats-users"
  | "stats-posts"
  | "stats-price"
  | "stats-chat"
  | "stats-ai";

const navItems = [
  { icon: "home" as IconName, label: "Pocetna", href: "/" },
  { icon: "bot" as IconName, label: "AI Asistent", href: "/ai-asistent" },
  { icon: "tips" as IconName, label: "Iskustva i saveti", href: "/iskustva-i-saveti" },
  { icon: "market" as IconName, label: "Cene na pijaci", href: "/cene-na-pijaci" },
  { icon: "funds" as IconName, label: "Subvencije i konkursi", href: "/subvencije" },
  { icon: "weather" as IconName, label: "Vremenska prognoza", href: "/vremenska-prognoza" },
  { icon: "plants" as IconName, label: "Bolesti biljaka", href: "/bolesti-biljaka" },
  { icon: "ads" as IconName, label: "Oprema i oglasi", href: "/oprema-i-oglasi" },
  { icon: "events" as IconName, label: "Dogadjaji", href: "/dogadjaji" },
  { icon: "partners" as IconName, label: "Prijatelji sajta", href: "/prijatelji-sajta" },
];

const featureCards = [
  {
    icon: "bot" as IconName,
    title: "AI Asistent",
    text: "Postavi pitanje i dobij strucan odgovor odmah.",
    action: "Pitaj AI",
    tone: "green",
    href: "/ai-asistent",
  },
  {
    icon: "market" as IconName,
    title: "Cene na pijaci",
    text: "Proveri najnovije cene voca, povrca i stoke.",
    action: "Vidi cene",
    tone: "gold",
    href: "/cene-na-pijaci",
  },
  {
    icon: "funds" as IconName,
    title: "Subvencije",
    text: "Pronadji aktuelne konkurse i uslove za subvencije.",
    action: "Pogledaj",
    tone: "blue",
    href: "/subvencije",
  },
  {
    icon: "weather" as IconName,
    title: "Vreme",
    text: "Proveri vremensku prognozu za svoj kraj.",
    action: "Vidi prognozu",
    tone: "sky",
    href: "/vremenska-prognoza",
  },
];

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "home":
      return <svg viewBox="0 0 24 24"><path {...common} d="M3 10.5 12 3l9 7.5" /><path {...common} d="M5.5 9.5V20h13V9.5" /></svg>;
    case "bot":
      return <svg viewBox="0 0 24 24"><rect {...common} x="4" y="7" width="16" height="12" rx="3" /><path {...common} d="M12 3v4" /><circle cx="9" cy="13" r="1" /><circle cx="15" cy="13" r="1" /></svg>;
    case "tips":
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 3a7 7 0 0 0-4 12.7V18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 3Z" /><path {...common} d="M9 21h6" /></svg>;
    case "market":
      return <svg viewBox="0 0 24 24"><path {...common} d="M4 8h16l-1 12H5L4 8Z" /><path {...common} d="M9 8V6a3 3 0 1 1 6 0v2" /></svg>;
    case "funds":
      return <svg viewBox="0 0 24 24"><rect {...common} x="4" y="3" width="16" height="18" rx="2" /><path {...common} d="M8 8h8M8 12h8M8 16h5" /></svg>;
    case "weather":
      return <svg viewBox="0 0 24 24"><circle {...common} cx="9" cy="9" r="3" /><path {...common} d="M14.5 18a4 4 0 1 0-.8-7.9A5 5 0 1 0 6 16h8.5Z" /></svg>;
    case "plants":
      return <svg viewBox="0 0 24 24"><path {...common} d="M12 21V10" /><path {...common} d="M12 11c0-4 3-7 7-7 0 4-3 7-7 7Z" /><path {...common} d="M12 14c0-3-2.5-5.5-5.5-5.5 0 3 2.5 5.5 5.5 5.5Z" /></svg>;
    case "ads":
      return <svg viewBox="0 0 24 24"><path {...common} d="M4 14h5l8 4V6l-8 4H4v4Z" /><path {...common} d="M6 14v4" /></svg>;
    case "events":
      return <svg viewBox="0 0 24 24"><rect {...common} x="4" y="5" width="16" height="15" rx="2" /><path {...common} d="M8 3v4M16 3v4M4 10h16" /></svg>;
    case "users":
      return <svg viewBox="0 0 24 24"><circle {...common} cx="9" cy="8" r="3" /><path {...common} d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle {...common} cx="17" cy="10" r="2" /></svg>;
    case "partners":
      return <svg viewBox="0 0 24 24"><path {...common} d="m12 20-6-3.5V7.5L12 4l6 3.5v9L12 20Z" /><path {...common} d="M8.5 12.5 11 15l4.5-5" /></svg>;
    case "chat":
      return <svg viewBox="0 0 24 24"><path {...common} d="M4 5h16v11H8l-4 3V5Z" /></svg>;
    case "bell":
      return <svg viewBox="0 0 24 24"><path {...common} d="M6 10a6 6 0 1 1 12 0v5l2 2H4l2-2v-5" /><path {...common} d="M10 19a2 2 0 0 0 4 0" /></svg>;
    case "search":
      return <svg viewBox="0 0 24 24"><circle {...common} cx="11" cy="11" r="6" /><path {...common} d="m20 20-4.2-4.2" /></svg>;
    case "image":
      return <svg viewBox="0 0 24 24"><rect {...common} x="4" y="5" width="16" height="14" rx="2" /><path {...common} d="m8 14 3-3 5 5" /></svg>;
    case "video":
      return <svg viewBox="0 0 24 24"><rect {...common} x="4" y="7" width="11" height="10" rx="2" /><path {...common} d="m15 10 5-2v8l-5-2" /></svg>;
    case "poll":
      return <svg viewBox="0 0 24 24"><path {...common} d="M5 19V9M12 19V5M19 19v-7" /></svg>;
    case "tag":
      return <svg viewBox="0 0 24 24"><path {...common} d="m20 10-8.5 8.5L4 11V4h7l9 6Z" /><circle {...common} cx="8" cy="8" r="1" /></svg>;
    case "like":
      return <svg viewBox="0 0 24 24"><path {...common} d="M8 11v9H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3Z" /><path {...common} d="M8 20h8a2 2 0 0 0 2-1.6l1-5a2 2 0 0 0-2-2.4h-5l.6-3a2.5 2.5 0 0 0-5-.5L7.6 11" /></svg>;
    case "comment":
      return <svg viewBox="0 0 24 24"><path {...common} d="M4 5h16v10H9l-5 4V5Z" /></svg>;
    case "share":
      return <svg viewBox="0 0 24 24"><path {...common} d="M7 12V6h10" /><path {...common} d="m10 9 7-7 7 7" /><path {...common} d="M5 13v7h14v-7" /></svg>;
    case "stats-users":
      return <svg viewBox="0 0 24 24"><circle {...common} cx="12" cy="8" r="3" /><path {...common} d="M5 20a7 7 0 0 1 14 0" /></svg>;
    case "stats-posts":
      return <svg viewBox="0 0 24 24"><path {...common} d="M6 12h12M6 7h12M6 17h8" /></svg>;
    case "stats-price":
      return <svg viewBox="0 0 24 24"><path {...common} d="M5 18 11 12l3 3 5-6" /><path {...common} d="M19 9v4h-4" /></svg>;
    case "stats-chat":
      return <svg viewBox="0 0 24 24"><path {...common} d="M4 5h16v11H8l-4 3V5Z" /></svg>;
    case "stats-ai":
      return <svg viewBox="0 0 24 24"><rect {...common} x="5" y="7" width="14" height="11" rx="3" /><circle cx="10" cy="12.5" r="1" /><circle cx="14" cy="12.5" r="1" /></svg>;
  }
}

async function getPageData(
  searchParamsPromise?: Promise<{ q?: string | string[]; tab?: string | string[]; page?: string | string[]; activityCity?: string | string[] }>,
) {
  const searchParams = await searchParamsPromise;
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const activityCityParam = searchParams?.activityCity;
  const activityCity = (Array.isArray(activityCityParam) ? activityCityParam[0] : activityCityParam || "").trim();

  const [posts, marketPrices, stats, banners, weekendActivities, activityCities] = await Promise.all([
    getFeedPosts(),
    getMarketPriceHighlights(5),
    getPlatformStats(),
    getSidebarBanners(true),
    getWeekendActivities(6, activityCity || undefined),
    getActivityCities(),
  ]);

  const queryParam = searchParams?.q;
  const tabParam = searchParams?.tab;
  const pageParam = searchParams?.page;
  const query = (Array.isArray(queryParam) ? queryParam[0] : queryParam || "").trim();
  const tabRaw = (Array.isArray(tabParam) ? tabParam[0] : tabParam || "all").toLowerCase();
  const pageRaw = Array.isArray(pageParam) ? pageParam[0] : pageParam || "1";
  const parsedPage = Number.parseInt(pageRaw, 10);
  const tab: FeedTab =
    tabRaw === "following" || tabRaw === "latest" || tabRaw === "popular" || tabRaw === "nearby" || tabRaw === "admin"
      ? (tabRaw as FeedTab)
      : "all";

  const q = query.toLowerCase();
  const searchedPosts = q
    ? posts.filter((post) => {
      const haystack = [
        post.title,
        post.content,
        post.author?.name || "",
        post.author?.location || "",
        post.category || "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    })
    : posts;

  const filteredPosts = (() => {
    if (tab === "following") {
      return searchedPosts.filter((post) => post.authorId === profile.id);
    }
    if (tab === "nearby") {
      const userLocation = (profile.location || "").trim();
      if (!userLocation) return [];
      return searchedPosts.filter((post) => {
        const authorLocation = (post.author?.location || "").trim();
        return authorLocation.toLowerCase() === userLocation.toLowerCase();
      });
    }
    if (tab === "admin") {
      return searchedPosts.filter((post) => {
        const role = (post.author?.role || "USER").toUpperCase();
        return role === "ADMIN" || role === "MODERATOR";
      });
    }
    if (tab === "popular") {
      return [...searchedPosts].sort((a, b) => {
        const scoreA = (a.likes?.length || 0) * 2 + (a.comments?.length || 0);
        const scoreB = (b.likes?.length || 0) * 2 + (b.comments?.length || 0);
        return scoreB - scoreA;
      });
    }
    if (tab === "latest") {
      return [...searchedPosts].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return searchedPosts;
  })();

  const totalPosts = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0
    ? Math.min(parsedPage, totalPages)
    : 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const pagedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return {
    profile,
    posts: pagedPosts,
    marketPrices,
    banners,
    weekendActivities,
    activityCities,
    activityCity,
    stats,
    query,
    tab,
    currentPage,
    totalPages,
    totalPosts,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; tab?: string | string[]; page?: string | string[]; activityCity?: string | string[] }>;
}) {
  const { profile, posts, marketPrices, banners, weekendActivities, activityCities, activityCity, stats, query, tab, currentPage, totalPages, totalPosts } = await getPageData(searchParams);
  const userAvatar = profile?.avatarUrl || avatarImg.src;

  function feedHref(nextTab: FeedTab) {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (nextTab !== "all") {
      params.set("tab", nextTab);
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (tab !== "all") {
      params.set("tab", tab);
    }
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  function extractVideoUrl(text: string) {
    const match = text.match(/(?:^|\n)Video:\s*(\S+)/i);
    return match?.[1] ?? null;
  }

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

  function getCategoryMeta(category?: string | null) {
    const value = (category || "GENERAL").toUpperCase();
    if (value === "SUBSIDY") {
      return { label: "Subvencije", className: "category-subsidy" };
    }
    if (value === "QUESTION") {
      return { label: "Pitanje", className: "category-question" };
    }
    if (value === "MARKET") {
      return { label: "Trziste", className: "category-market" };
    }
    if (value === "DISEASE") {
      return { label: "Bolesti", className: "category-disease" };
    }
    return { label: "Opste", className: "category-general" };
  }

  return (
    <div className="social-shell">
      <header className="app-header">
        <Link className="logo" href="/">
          <span className="logo-mark" aria-hidden>
            <Icon name="plants" />
          </span>
          <span>AgroAI</span>
        </Link>

        <form className="search-box" action="/" method="get">
          <button className="search-submit" type="submit" aria-label="Pokreni pretragu">
            <span className="search-mark" aria-hidden>
              <Icon name="search" />
            </span>
          </button>
          <input name="q" defaultValue={query} placeholder="Pretrazi savete, iskustva, subvencije..." />
          {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
        </form>

        <div className="header-actions">
          
          <Link className="icon-button" href="/ai-asistent" aria-label="AI poruke">
            <Icon name="chat" />
          </Link>
          <NotificationCenter />
          <ProfileNavMenu
            name={profile?.name || "Korisnik"}
            location={profile?.location || "Srbija"}
            avatarUrl={userAvatar}
            role={profile.role}
          />
        </div>
      </header>

      <aside className="social-sidebar">
        <nav className="social-nav">
          {navItems.map((item, index) => (
            <Link className={`social-nav-item ${index === 0 ? "active" : ""}`} href={item.href} key={item.label}>
              <span aria-hidden>
                <Icon name={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="premium-card">
          <div className="premium-icon">PRO</div>
          <h3>Premium clanstvo</h3>
          <p>Otkljucaj napredne AI savete, detaljne analize i jos mnogo toga.</p>
          <Link className="premium-button" href="/ai-asistent">Nadogradi sada</Link>
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
              <div className="feature-icon" aria-hidden>
                <Icon name={card.icon} />
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <Link href={card.href}>{card.action} -&gt;</Link>
              </div>
            </article>
          ))}
        </section>

        <PostComposer userAvatar={userAvatar} id="new-post" />

        <nav className="tabs">
          <Link className={tab === "all" ? "active" : ""} href={feedHref("all")}>
            Svi postovi
          </Link>
          <Link className={tab === "following" ? "active" : ""} href={feedHref("following")}>Pratim</Link>
          <Link className={tab === "nearby" ? "active" : ""} href={feedHref("nearby")}>Moja okolina</Link>
          <Link className={tab === "admin" ? "active" : ""} href={feedHref("admin")}>Stručno</Link>
          <Link className={tab === "latest" ? "active" : ""} href={feedHref("latest")}>Najnovije</Link>
          <Link className={tab === "popular" ? "active" : ""} href={feedHref("popular")}>Popularno</Link>
        </nav>

        <section className="post-list">
          {posts.length ? posts.map((post) => (
            <article className={`social-post ${post.imageUrl ? "" : "no-media"}`} key={post.id} id={`post-${post.id}`}>
              {(() => {
                const videoUrl = (post as { videoUrl?: string | null }).videoUrl ?? extractVideoUrl(post.content);
                const pollData = extractPollData(post.content);
                const cleanedContent = cleanPostContent(post.content);
                const hasImage = Boolean(post.imageUrl);
                const categoryMeta = getCategoryMeta(post.category);
                const authorHref = post.author?.username ? `/korisnici/${post.author.username}` : "/profil";
                const visibleComments = (post.comments ?? []).filter((comment) => !comment.content.startsWith("POLL_VOTE:"));

                return (
              <div className="post-copy">
                <div className="author-row">
                  <Link href={authorHref} className="author-link">
                    <ZoomableProfileImage
                      src={post.author?.avatarUrl ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80"}
                      alt={post.author?.name || "Autor"}
                      preventDefault
                      stopPropagation
                    />
                    <div>
                      <strong>{post.author?.name}</strong>
                      <span>
                        {post.author?.location || "Srbija"} - {new Date(post.createdAt).toLocaleDateString("sr-RS")}
                      </span>
                    </div>
                  </Link>
                </div>
                <div className="post-title-row">
                  <h2>{post.title}</h2>
                  {!hasImage ? (
                    <span className={`topic-pill inline ${categoryMeta.className}`}>
                      {categoryMeta.label}
                    </span>
                  ) : null}
                </div>
                <p>{cleanedContent}</p>
                {pollData ? <PollWidget postId={post.id} question={pollData.question} options={pollData.options} /> : null}
                {videoUrl ? (
                  <video className="post-video" controls preload="metadata" src={videoUrl} />
                ) : null}
                <PostInteractions
                  postId={post.id}
                  initialLikes={post.likes?.length ?? 0}
                  initialComments={visibleComments.map((comment) => ({
                    id: comment.id,
                    content: comment.content,
                  }))}
                />
              </div>
                );
              })()}
              {post.imageUrl ? (
                <div className="post-media">
                  <span className={`topic-pill ${getCategoryMeta(post.category).className}`}>
                    {getCategoryMeta(post.category).label}
                  </span>
                  <img src={post.imageUrl} alt={post.title} />
                  <button type="button" aria-label="Post opcije">
                    ...
                  </button>
                </div>
              ) : null}
            </article>
          )) : (
            <div className="empty-result">
              <strong>Nema rezultata</strong>
              <p className="muted">Promenite pretragu ili filter i pokusajte ponovo.</p>
            </div>
          )}
        </section>

        {totalPages > 1 ? (
          <nav className="feed-pagination" aria-label="Paginacija postova">
            <p className="muted">
              Strana {currentPage} od {totalPages} · Ukupno {totalPosts} postova
            </p>
            <div className="feed-pagination-actions">
              <Link
                className={`button secondary ${currentPage <= 1 ? "disabled" : ""}`}
                href={pageHref(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage <= 1}
                tabIndex={currentPage <= 1 ? -1 : undefined}
              >
                Prethodna
              </Link>

              <span className="pagination-page">{currentPage}</span>

              <Link
                className={`button secondary ${currentPage >= totalPages ? "disabled" : ""}`}
                href={pageHref(Math.min(totalPages, currentPage + 1))}
                aria-disabled={currentPage >= totalPages}
                tabIndex={currentPage >= totalPages ? -1 : undefined}
              >
                Sledeca
              </Link>
            </div>
          </nav>
        ) : null}
      </main>

      <aside className="social-rightbar">
        <section className="side-panel">
          <div className="panel-heading">
            <h3>Cene na pijaci</h3>
            <Link href="/cene-na-pijaci">Pogledaj sve</Link>
          </div>
          <div className="price-list">
            {marketPrices.map((price) => (
              <div className="price-row" key={price.id}>
                <span className="crop-icon">{getProductIcon(price.product?.name)}</span>
                <span>
                  <strong>
                    {price.product?.name} ({price.unit?.toLowerCase()})
                  </strong>
                  <small>{price.market?.name}</small>
                </span>
                <span className="price-value">
                  <strong>{formatPriceDin(price.price.toString())}</strong>
                  <small className={price.delta > 0 ? "up" : price.delta < 0 ? "down" : ""}>
                    {formatDeltaValue(price.delta)}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="side-panel weekend-activities-panel">
          <div className="panel-heading">
            <h3>Aktivnosti ovog vikenda</h3>
            <Link href="/dogadjaji">Pogledaj sve</Link>
          </div>

          <form className="weekend-filter-form" method="get" action="/">
            {query ? <input type="hidden" name="q" value={query} /> : null}
            {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
            {currentPage > 1 ? <input type="hidden" name="page" value={String(currentPage)} /> : null}
            <label>
              <span>Grad</span>
              <select name="activityCity" defaultValue={activityCity}>
                <option value="">Svi gradovi</option>
                {activityCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>
            <button type="submit">Filtriraj</button>
          </form>

          <div className="weekend-activity-list">
            {weekendActivities.length ? weekendActivities.map((activity) => (
              <article className="weekend-activity-item" key={activity.id}>
                {activity.imageUrl ? <img className="weekend-activity-thumb" src={activity.imageUrl} alt={activity.title} /> : null}
                <strong>{activity.title}</strong>
                <small>{activity.city} · {new Date(activity.startAt).toLocaleString("sr-RS", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</small>
                <p>{activity.location || activity.category || "Lokalni dogadjaj"}</p>
              </article>
            )) : <p className="muted">Nema aktivnosti za izabrani grad ovog vikenda.</p>}
          </div>
        </section>

        {banners.length ? banners.map((banner) => (
          banner.variant === "HERO" ? (
            <section
              className="dynamic-hero-banner"
              key={banner.id}
              style={banner.imageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(8, 74, 33, 0.92), rgba(8, 74, 33, 0.2)), url(${banner.imageUrl})` } : undefined}
            >
              <div>
                <h3>{banner.title}</h3>
                {banner.body ? <p>{banner.body}</p> : null}
                {banner.ctaHref && banner.ctaText ? <Link className="tractor-link" href={banner.ctaHref}>{banner.ctaText}</Link> : null}
              </div>
            </section>
          ) : (
            <section className="side-panel sponsor-card dynamic-card-banner" key={banner.id}>
              <div>
                <h3>{banner.title}</h3>
                {banner.body ? <p>{banner.body}</p> : null}
                {banner.ctaHref && banner.ctaText ? <Link href={banner.ctaHref}>{banner.ctaText} -&gt;</Link> : null}
              </div>
              {banner.imageUrl ? (
                <div className="dynamic-banner-image-wrap">
                  <img className="dynamic-banner-image" src={banner.imageUrl} alt={banner.title} />
                </div>
              ) : (
                <div className="bottles">
                  <span />
                  <span />
                </div>
              )}
            </section>
          )
        )) : (
          <>
            <section className="side-panel sponsor-card agrochem">
              <div>
                <h3>AgroChem</h3>
                <p>Kvalitetna zastita za vece prinose</p>
                <Link href="/subvencije">Pogledaj ponudu -&gt;</Link>
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
                <Link className="tractor-link" href="/subvencije">Saznaj vise</Link>
              </div>
            </section>
          </>
        )}
      </aside>

      <footer className="bottom-stats" id="feed-bottom-stats">
        <div>
          <span>
            <Icon name="stats-users" />
          </span>
          <strong>{stats.usersCount.toLocaleString("sr-RS")}</strong>
          <small>Aktivnih korisnika</small>
        </div>
        <div>
          <span>
            <Icon name="stats-posts" />
          </span>
          <strong>{stats.postsCount.toLocaleString("sr-RS")}</strong>
          <small>Podeljenih iskustava</small>
        </div>
        <div>
          <span>
            <Icon name="stats-price" />
          </span>
          <strong>{stats.pricesUpdatedToday.toLocaleString("sr-RS")}</strong>
          <small>Cena azurirano danas</small>
        </div>
        <div>
          <span>
            <Icon name="stats-chat" />
          </span>
          <strong>{stats.activeDiscussions.toLocaleString("sr-RS")}</strong>
          <small>Aktivnih diskusija</small>
        </div>
        <div>
          <span>
            <Icon name="stats-ai" />
          </span>
          <strong>AI Asistent</strong>
          <small>Dostupan 24/7</small>
        </div>
      </footer>

      <FooterScrollBehavior targetId="feed-bottom-stats" />
    </div>
  );
}
