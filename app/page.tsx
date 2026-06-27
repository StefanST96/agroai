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
import { getActivityCities, getCurrentUser, getFeedPosts, getMarketPriceHighlights, getPartners, getPlatformStats, getProperties, getSidebarBanners, getWeekendActivities } from "@/lib/db";
import { formatDeltaValue, formatPriceDin, getProductIcon } from "@/lib/market";
import avatarImg from "../public/avatars/avatar.png";
import SearchBox from "./components/SearchBox";
import Icon, { type IconName } from "./components/Icon";


type FeedTab = "all" | "following" | "latest" | "popular" | "nearby" | "admin";
const POSTS_PER_PAGE = 16;

type PollData = {
  question: string;
  options: string[];
};

type NavGroup = {
  label?: string;
  items: { icon: IconName; label: string; href: string; badge?: string }[];
};

const navGroups: NavGroup[] = [
  {
    items: [
      { icon: "home", label: "Početna", href: "/" },
      { icon: "bot", label: "AI Savetnik", href: "/ai-asistent", badge: "Novo" },
      { icon: "plants", label: "Bolesti biljaka", href: "/bolesti-biljaka" },
      { icon: "tips", label: "Vodič za početnike", href: "/iskustva-i-saveti" },
    ],
  },
  {
    label: "POLJOPRIVREDA",
    items: [
      { icon: "market", label: "Cene na pijaci", href: "/cene-na-pijaci" },
      { icon: "funds", label: "Subvencije i konkursi", href: "/subvencije" },
      { icon: "weather", label: "Vremenska prognoza", href: "/vremenska-prognoza" },
    ],
  },
  {
    label: "ŽIVOT NA SELU",
    items: [
      { icon: "partners", label: "Kuće na selu", href: "/kuce-na-selu" },
      { icon: "tag", label: "Zemljište", href: "/kuce-na-selu?category=ZEMLJISTE" },
      { icon: "events", label: "Događaji i manifestacije", href: "/dogadjaji" },
    ],
  },
  {
    label: "OSTALO",
    items: [
      { icon: "ads", label: "Oglasi", href: "/oprema-i-oglasi" },
      { icon: "market", label: "Mehanizacija", href: "/oprema-i-oglasi" },
    ],
  },
];

const categoryFilters = [
  { label: "Sve", value: "all" },
  { label: "Biljna proizvodnja", value: "BILJNA_PROIZVODNJA" },
  { label: "Voćarstvo", value: "VOCARSTVO" },
  { label: "Povrćarstvo", value: "POVRCARSTVO" },
  { label: "Stočarstvo", value: "STOCARSTVO" },
  { label: "Život na selu", value: "ZIVOT_NA_SELU" },
];

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

  const [posts, marketPrices, stats, banners, weekendActivities, activityCities, properties, partners] = await Promise.all([
    getFeedPosts(),
    getMarketPriceHighlights(5),
    getPlatformStats(),
    getSidebarBanners(true),
    getWeekendActivities(3, activityCity || undefined),
    getActivityCities(),
    getProperties({ limit: 3, activeOnly: true }),
    getPartners(),
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
    properties,
    partners,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; tab?: string | string[]; page?: string | string[]; activityCity?: string | string[] }>;
}) {
  const { profile, posts, marketPrices, banners, weekendActivities, activityCities, activityCity, stats, query, tab, currentPage, totalPages, totalPosts, properties, partners } = await getPageData(searchParams);
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
          <span className="logo-text">
            <span>AgroAI</span>
            <small className="logo-subtitle">Zavičaj</small>
          </span>
        </Link>


 <SearchBox
  defaultValue={query}
  tab={tab}
/>
        <div className="header-actions">
          <Link className="btn-new-post" href="/#new-post">
            <span>+</span> Novi post
          </Link>
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
          {navGroups.map((group, gi) => (
            <div className="nav-group" key={gi}>
              {group.label ? <span className="nav-group-label">{group.label}</span> : null}
              {group.items.map((item) => (
                <Link
                  className={`social-nav-item ${item.href === "/" && gi === 0 ? "active" : ""}`}
                  href={item.href}
                  key={item.label}
                >
                  <span aria-hidden><Icon name={item.icon} /></span>
                  {item.label}
                  {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <section className="premium-card">
          <div className="premium-icon">👑</div>
          <h3>Premium članstvo</h3>
          <p>Otključaj napredne AI savete, detaljne analize i još mnogo toga.</p>
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

        <div className="category-filter-bar">
          {categoryFilters.map((f) => (
            <Link
              key={f.value}
              href={`/?${f.value !== "all" ? `cat=${f.value}` : ""}`}
              className="category-filter-chip"
            >
              {f.label}
            </Link>
          ))}
        </div>

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
          <Link className="see-all-link" href="/cene-na-pijaci">Vidi cene →</Link>
        </section>

        {properties.length ? (
          <section className="side-panel">
            <div className="panel-heading">
              <h3>Kuće na selu</h3>
              <Link href="/kuce-na-selu">Pogledaj sve</Link>
            </div>
            <div className="property-list">
              {properties.map((prop) => (
                <Link className="property-card" href={`/kuce-na-selu`} key={prop.id}>
                  {prop.imageUrl ? (
                    <div className="property-card-img">
                      <img src={prop.imageUrl} alt={prop.title} />
                      <span className="property-badge">Novo</span>
                    </div>
                  ) : (
                    <div className="property-card-img property-card-img--empty">
                      <Icon name="partners" />
                    </div>
                  )}
                  <div className="property-card-body">
                    <strong>{prop.title}</strong>
                    <small>
                      {prop.areaSqm ? `${prop.areaSqm}m²` : ""}
                      {prop.rooms ? ` · ${prop.rooms} sobe` : ""}
                      {prop.landHa ? ` · ${prop.landHa}ha placa` : ""}
                    </small>
                    <span className="property-price">
                      {Number(prop.price).toLocaleString("sr-RS")} {prop.currency}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="side-panel weekend-activities-panel">
          <div className="panel-heading">
            <h3>Aktivnosti ovog vikenda</h3>
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
              <article className="weekend-activity-item weekend-activity-item--compact" key={activity.id}>
                {activity.imageUrl ? (
                  <img className="weekend-activity-thumb" src={activity.imageUrl} alt={activity.title} />
                ) : (
                  <div className="weekend-activity-thumb weekend-activity-thumb--placeholder">
                    <Icon name="events" />
                  </div>
                )}
                <div className="weekend-activity-info">
                  <strong>{activity.title}</strong>
                  <small>{activity.city} · {new Date(activity.startAt).toLocaleString("sr-RS", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</small>
                  {activity.category ? <span className="activity-tag">{activity.category}</span> : null}
                </div>
              </article>
            )) : <p className="muted">Nema aktivnosti ovog vikenda.</p>}
          </div>
          <Link className="see-all-link" href="/dogadjaji">Vidi sve događaje →</Link>
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
                {banner.ctaHref && banner.ctaText ? <Link href={banner.ctaHref}>{banner.ctaText} →</Link> : null}
              </div>
              {banner.imageUrl ? (
                <div className="dynamic-banner-image-wrap">
                  <img className="dynamic-banner-image" src={banner.imageUrl} alt={banner.title} />
                </div>
              ) : (
                <div className="bottles"><span /><span /></div>
              )}
            </section>
          )
        )) : null}

        {partners.length ? (
          <section className="side-panel">
            <div className="panel-heading">
              <h3>Prijatelji sajta</h3>
            </div>
            <div className="partners-logo-grid">
              {partners.slice(0, 8).map((partner) => (
                partner.website ? (
                  <a className="partner-logo-item" href={partner.website} target="_blank" rel="noopener noreferrer" key={partner.id} title={partner.name}>
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt={partner.name} />
                    ) : (
                      <span className="partner-logo-fallback">{partner.name.slice(0, 4)}</span>
                    )}
                  </a>
                ) : (
                  <div className="partner-logo-item" key={partner.id} title={partner.name}>
                    {partner.logoUrl ? (
                      <img src={partner.logoUrl} alt={partner.name} />
                    ) : (
                      <span className="partner-logo-fallback">{partner.name.slice(0, 4)}</span>
                    )}
                  </div>
                )
              ))}
            </div>
            <Link className="see-all-link" href="/prijatelji-sajta">Vidi sve prijatelje →</Link>
          </section>
        ) : null}
      </aside>

      <section className="explore-more-section">
        <h3>Istraži više</h3>
        <div className="explore-more-grid">
          {[
            { icon: "plants" as IconName, label: "Vodič za sadnju", sub: "Kada i šta saditi" },
            { icon: "tips" as IconName, label: "Bolesti biljaka", sub: "Prepoznavanje i zaštita" },
            { icon: "ads" as IconName, label: "Agro oglasi", sub: "Kupovina / Prodaja" },
            { icon: "market" as IconName, label: "Mehanizacija", sub: "Traktori i oprema" },
            { icon: "tag" as IconName, label: "Zemljište", sub: "Kupovina / Najam" },
            { icon: "share" as IconName, label: "Turizam na selu", sub: "Otkrij lepotu Srbije" },
          ].map((item) => (
            <Link className="explore-more-card" href="/" key={item.label}>
              <span className="explore-more-icon"><Icon name={item.icon} /></span>
              <strong>{item.label}</strong>
              <small>{item.sub}</small>
            </Link>
          ))}
        </div>
      </section>

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
