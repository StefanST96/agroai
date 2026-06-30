import Link from "next/link";
import PostComposer from "./components/PostComposer";
import PostInteractions from "./components/PostInteractions";
import PollWidget from "./components/PollWidget";
import FooterScrollBehavior from "./components/FooterScrollBehavior";
import ZoomableProfileImage from "./components/ZoomableProfileImage";
import BottomStatsFooter from "./components/home/BottomStatsFooter";
import CategoryFilterBar from "./components/home/CategoryFilterBar";
import ExploreMoreSection from "./components/home/ExploreMoreSection";
import FeedPagination from "./components/home/FeedPagination";
import FeatureGrid from "./components/home/FeatureGrid";
import FeedTabs from "./components/home/FeedTabs";
import HomeHeader from "./components/home/HomeHeader";
import LeftSidebar from "./components/home/LeftSidebar";
import { categoryFilters } from "./components/home/constants";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getActivityCities, getCurrentUser, getFeedPosts, getMarketPriceHighlights, getPartners, getPlatformStats, getPostsByUser, getProperties, getSidebarBanners, getWeekendActivities } from "@/lib/db";
import { formatDeltaValue, formatPriceDin, getProductIcon } from "@/lib/market";
import avatarImg from "../public/avatars/avatar.png";
import CollapsibleForm from "./components/CollapsibleForm";
import Icon from "./components/Icon";
import { getWeatherSnapshotForLocation } from "@/lib/weather";


type FeedTab = "all" | "following" | "latest" | "popular" | "nearby" | "admin";
const POSTS_PER_PAGE = 16;
type SidebarScope = "local" | "regional" | "all";
type CategoryFilterValue = (typeof categoryFilters)[number]["value"];

type PollData = {
  question: string;
  options: string[];
};



async function getPageData(
  searchParamsPromise?: Promise<{ q?: string | string[]; tab?: string | string[]; page?: string | string[]; activityCity?: string | string[]; cat?: string | string[]; scope?: string | string[] }>,
) {
  const searchParams = await searchParamsPromise;
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const activityCityParam = searchParams?.activityCity;
  const activityCity = (Array.isArray(activityCityParam) ? activityCityParam[0] : activityCityParam || "").trim();
  const scopeParam = searchParams?.scope;
  const sidebarScopeRaw = (Array.isArray(scopeParam) ? scopeParam[0] : scopeParam || "local").toLowerCase();
  const sidebarScope: SidebarScope = sidebarScopeRaw === "regional" || sidebarScopeRaw === "all" ? sidebarScopeRaw : "local";
  const hasActivityCityParam = activityCityParam !== undefined;
  const activeActivityCity = hasActivityCityParam ? activityCity : profile.location || "";
  const propertyLocation = (profile.location || "").trim();

  const [posts, marketPrices, stats, banners, activityCities, partners, weatherSnapshot, userPosts] = await Promise.all([
    getFeedPosts(),
      getMarketPriceHighlights(5, profile.location || undefined),
    getPlatformStats(),
    getSidebarBanners(true),
    getActivityCities(),
    getPartners(),
    getWeatherSnapshotForLocation(profile.location || ""),
    getPostsByUser(profile.id),
  ]);

  const propertyScopeOrder: SidebarScope[] =
    sidebarScope === "local"
      ? ["local", "regional", "all"]
      : sidebarScope === "regional"
        ? ["regional", "all"]
        : ["all"];

  let properties: Awaited<ReturnType<typeof getProperties>> = [];
  let resolvedPropertyScope: SidebarScope = sidebarScope;

  for (const currentScope of propertyScopeOrder) {
    const currentProperties = await getProperties({
      limit: 3,
      activeOnly: true,
      location: propertyLocation || undefined,
      locationScope: currentScope,
    });

    if (currentProperties.length) {
      properties = currentProperties;
      resolvedPropertyScope = currentScope;
      break;
    }

    properties = currentProperties;
    resolvedPropertyScope = currentScope;
  }

  const localWeekendActivities = await getWeekendActivities(3, activeActivityCity || undefined);
  const weekendActivities = localWeekendActivities.length || !activeActivityCity
    ? localWeekendActivities
    : await getWeekendActivities(3);
  const weekendActivitiesUsedFallback = Boolean(activeActivityCity && !localWeekendActivities.length && weekendActivities.length);

  const queryParam = searchParams?.q;
  const tabParam = searchParams?.tab;
  const pageParam = searchParams?.page;
  const catParam = searchParams?.cat;
  const query = (Array.isArray(queryParam) ? queryParam[0] : queryParam || "").trim();
  const catRaw = (Array.isArray(catParam) ? catParam[0] : catParam || "all").trim().toUpperCase();
  const tabRaw = (Array.isArray(tabParam) ? tabParam[0] : tabParam || "all").toLowerCase();
  const pageRaw = Array.isArray(pageParam) ? pageParam[0] : pageParam || "1";
  const parsedPage = Number.parseInt(pageRaw, 10);
  const tab: FeedTab =
    tabRaw === "following" || tabRaw === "latest" || tabRaw === "popular" || tabRaw === "nearby" || tabRaw === "admin"
      ? (tabRaw as FeedTab)
      : "all";
  const allowedCategories = new Set(categoryFilters.map((item) => item.value));
  const category: CategoryFilterValue = allowedCategories.has(catRaw as CategoryFilterValue)
    ? (catRaw as CategoryFilterValue)
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

  const categoryFilteredPosts = category === "all"
    ? filteredPosts
    : filteredPosts.filter((post) => (post.category || "").toUpperCase() === category);

  const totalPosts = categoryFilteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0
    ? Math.min(parsedPage, totalPages)
    : 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const pagedPosts = categoryFilteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  const isFirstTimeUser = userPosts.length === 0;

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
    category,
    tab,
    currentPage,
    totalPages,
    totalPosts,
    properties,
    partners,
    activeActivityCity,
    sidebarScope,
    resolvedPropertyScope,
    weekendActivitiesUsedFallback,
    weatherSnapshot,
    isFirstTimeUser,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; tab?: string | string[]; page?: string | string[]; activityCity?: string | string[]; cat?: string | string[] }>;
}) {
  const { profile, posts, marketPrices, banners, weekendActivities, activityCities, activityCity, stats, query, category, tab, currentPage, totalPages, totalPosts, properties, partners, activeActivityCity, sidebarScope, resolvedPropertyScope, weekendActivitiesUsedFallback, weatherSnapshot, isFirstTimeUser } = await getPageData(searchParams);
  const userAvatar = profile?.avatarUrl || avatarImg.src;

  function buildSidebarHref(next: { scope?: SidebarScope; activityCity?: string }) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tab !== "all") params.set("tab", tab);
    if (category !== "all") params.set("cat", category);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (next.activityCity !== undefined) {
      params.set("activityCity", next.activityCity);
    } else if (activityCity) {
      params.set("activityCity", activityCity);
    }
    if (next.scope && next.scope !== "local") {
      params.set("scope", next.scope);
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  function feedHref(nextTab: FeedTab) {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (nextTab !== "all") {
      params.set("tab", nextTab);
    }
    if (category !== "all") {
      params.set("cat", category);
    }
    if (activityCity) {
      params.set("activityCity", activityCity);
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
    if (value === "VOCARSTVO") {
      return { label: "Voćarstvo", className: "category-subsidy" };
    }
    if (value === "POVRCARSTVO") {
      return { label: "Povrćarstvo", className: "category-question" };
    }
    if (value === "STOCARSTVO") {
      return { label: "Stočarstvo", className: "category-market" };
    }
    if (value === "BILJNA_PROIZVODNJA") {
      return { label: "Biljna proizvodnja", className: "category-general" };
    }
    if (value === "ZIVOT_NA_SELU") {
      return { label: "Život na selu", className: "category-disease" };
    }
    return { label: "Opste", className: "category-general" };
  }

  return (
    <div className="social-shell">
      <HomeHeader
        query={query}
        tab={tab}
        category={category}
        activityCity={activityCity}
        weatherSnapshot={weatherSnapshot}
        profile={profile}
        userAvatar={userAvatar}
      />

      <LeftSidebar />

      <main className="feed-main">
        
        {isFirstTimeUser ? (
          <section className="panel quick-start-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Dobrodošli</div>
                <h2>Kreni od 3 brza koraka</h2>
              </div>
              <p className="muted">Platforma je spremna, samo dodaj prve informacije i biće ti mnogo korisnija.</p>
            </div>
            <div className="quick-start-grid">
              <Link className="quick-start-card" href="/#new-post">
                <strong>1. Napiši prvu objavu</strong>
                <small>Podeli iskustvo ili pitanje da krene interakcija.</small>
              </Link>
              <Link className="quick-start-card" href="/cene-na-pijaci#price-form">
                <strong>2. Dodaj cenu iz svog grada</strong>
                <small>Odmah dobijaš korisniji lokalni prikaz tržišta.</small>
              </Link>
              <Link className="quick-start-card" href="/dogadjaji#new-activity">
                <strong>3. Upiši lokalni događaj</strong>
                <small>Poveži zajednicu kroz rokove i aktivnosti.</small>
              </Link>
            </div>
          </section>
        ) : null}


        <FeatureGrid />

        <section className="feed-control-panel panel">
          <div className="panel-heading feed-control-heading">
            <div>
              <div className="eyebrow">Filteri</div>
              <h2>Suzi pregled bez gubljenja konteksta</h2>
            </div>
            <p className="muted">Tabovi menjaju tok sadržaja, a kategorije su za precizno filtriranje objava.</p>
          </div>

          <FeedTabs tab={tab} query={query} category={category} activityCity={activityCity} />

          <CategoryFilterBar category={category} query={query} tab={tab} activityCity={activityCity} />
        </section>

        <div className="composer-shell">
          <CollapsibleForm id="new-post" summary={isFirstTimeUser ? "Napravi prvu objavu" : "Dodaj novi post"} defaultOpen={isFirstTimeUser}>
            <PostComposer userAvatar={userAvatar} />
          </CollapsibleForm>
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
                    createdAt: comment.createdAt?.toISOString?.() || String(comment.createdAt),
                    likesCount: 0,
                    likedByMe: false,
                    replies: [],
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

        <FeedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalPosts={totalPosts}
          query={query}
          tab={tab}
          category={category}
          activityCity={activityCity}
        />
      </main>

      <aside className="social-rightbar">
        <section className="side-panel">
          <div className="panel-heading">
            <h3>Cene na pijaci</h3>
          </div>
          {marketPrices.length ? (
            <div className="price-list">
              {marketPrices.slice(0, 3).map((price) => (
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
          ) : (
            <div className="empty-result slim">
              <strong>Nema dodatih cena u tvojoj okolini.</strong>
              <p className="muted">Probaj širi pregled tržišta ili dodaj prvu cenu za svoj grad.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                <Link className="button secondary" href="/cene-na-pijaci?scope=all&location=">
                  Prikaži sve cene
                </Link>
                <Link className="button secondary" href="/cene-na-pijaci#price-form">
                  Dodaj cenu
                </Link>
              </div>
            </div>
          )}
          <Link className="see-all-link" href="/cene-na-pijaci">Vidi cene →</Link>
        </section>

        <section className="side-panel">
          <div className="panel-heading">
            <div>
              <h3>Kuće na selu</h3>
              <p className="muted" style={{ margin: 0 }}>
                Prikaz za {profile.location || "tvoju lokaciju"}
              </p>
            </div>
            <Link href="/kuce-na-selu">Pogledaj sve</Link>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {[
              { scope: "local" as const, label: "25 km" },
              { scope: "regional" as const, label: "50-100 km" },
              { scope: "all" as const, label: "200 km" },
            ].map((item) => (
              <Link
                key={item.scope}
                href={buildSidebarHref({ scope: item.scope })}
                style={{
                  background: sidebarScope === item.scope ? "#0f7a34" : "#edf8ef",
                  border: "1px solid #dce7dd",
                  borderRadius: 999,
                  color: sidebarScope === item.scope ? "white" : "#0f7a34",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "6px 12px",
                  textDecoration: "none",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {properties.length ? (
            <div className="property-list">
              {properties.slice(0, 2).map((prop) => (
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
          ) : (
            <div className="empty-result slim">
              <strong>Nema kuća u ovom opsegu.</strong>
              <p className="muted">
                Pokušali smo {resolvedPropertyScope === "local" ? "25 km" : resolvedPropertyScope === "regional" ? "50-100 km" : "širu pretragu"}. Možeš da proširiš opseg ili otvoriš sve oglase.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link className="button secondary" href={buildSidebarHref({ scope: "regional" })}>
                  Šira okolina
                </Link>
                <Link className="button secondary" href={buildSidebarHref({ scope: "all" })}>
                  Cela Srbija
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="side-panel weekend-activities-panel">
          <div className="panel-heading">
            <h3>Aktivnosti ovog vikenda</h3>
          </div>

          
          <form className="weekend-filter-form" method="get" action="/">
            {query ? <input type="hidden" name="q" value={query} /> : null}
            {tab !== "all" ? <input type="hidden" name="tab" value={tab} /> : null}
            {category !== "all" ? <input type="hidden" name="cat" value={category} /> : null}
            {currentPage > 1 ? <input type="hidden" name="page" value={String(currentPage)} /> : null}
            <label>
              <span>Grad</span>
              <select name="activityCity" defaultValue={activeActivityCity}>
                <option value="">Svi gradovi</option>
                {activityCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>
            <button type="submit">Filtriraj</button>
          </form>

          <div className="weekend-activity-list">
            {weekendActivities.length ? weekendActivities.slice(0, 2).map((activity) => (
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
            )) : (
              <div className="empty-result slim">
                <strong>Nema aktivnosti za ovu lokaciju.</strong>
                <p className="muted">
                  {weekendActivitiesUsedFallback
                    ? "Prikazali smo sve dostupne gradove jer u tvojoj okolini trenutno nema događaja."
                    : "Promeni grad ili vidi sve događaje da pronađeš druge termine."}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link className="button secondary" href={buildSidebarHref({ activityCity: "" })}>
                    Svi gradovi
                  </Link>
                  <Link className="button secondary" href={buildSidebarHref({ activityCity: profile.location || "" })}>
                    Moja lokacija
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link className="see-all-link" href="/dogadjaji">Vidi sve događaje →</Link>
        </section>

        {banners.length ? banners.slice(0, 1).map((banner) => (
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
        )) : (
          <section className="side-panel sponsor-card dynamic-card-banner">
            <div>
              <h3>Nema istaknutih banera</h3>
              <p className="muted">Za ovu lokaciju trenutno nema aktivnih kampanja ili obaveštenja.</p>
            </div>
          </section>
        )}

        <section className="side-panel">
          <div className="panel-heading">
            <h3>Prijatelji sajta</h3>
          </div>
          {partners.length ? (
            <>
              <div className="partners-logo-grid">
                {partners.slice(0, 4).map((partner) => (
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
            </>
          ) : (
            <div className="empty-result slim">
              <strong>Nema partnera za prikaz.</strong>
              <p className="muted">Ovaj deo se popunjava kada postoji aktivna saradnja ili lokalni sponzor.</p>
            </div>
          )}
        </section>
      </aside>

      <ExploreMoreSection />

      <BottomStatsFooter stats={stats} />

      <FooterScrollBehavior targetId="feed-bottom-stats" />
    </div>
  );
}
