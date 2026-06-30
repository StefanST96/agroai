import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getFeedPosts } from "@/lib/db";

type AdsFilter = "all" | "mechanization" | "land" | "other";

const POSTS_PER_PAGE = 10;
const equipmentKeywords = ["traktor", "prskal", "oprema", "prikol", "kombajn", "mehanizacij", "oglas", "sejal", "balirka", "atomizer"];
const landKeywords = ["zemlj", "plac", "hektar", "ar", "zakup", "imanje", "parcela"];

function detectAdType(title: string, content: string): AdsFilter {
  const text = `${title} ${content}`.toLowerCase();
  if (landKeywords.some((keyword) => text.includes(keyword))) {
    return "land";
  }
  if (equipmentKeywords.some((keyword) => text.includes(keyword))) {
    return "mechanization";
  }
  return "other";
}

async function getAdsData(params?: { q?: string | string[]; page?: string | string[]; type?: string | string[]; location?: string | string[] }) {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const queryParam = params?.q;
  const pageParam = params?.page;
  const typeParam = params?.type;
  const locationParam = params?.location;

  const query = (Array.isArray(queryParam) ? queryParam[0] : queryParam || "").trim();
  const typeRaw = (Array.isArray(typeParam) ? typeParam[0] : typeParam || "all").toLowerCase();
  const pageRaw = Array.isArray(pageParam) ? pageParam[0] : pageParam || "1";
  const parsedPage = Number.parseInt(pageRaw, 10);
  const location = (Array.isArray(locationParam) ? locationParam[0] : locationParam || "").trim();

  const type: AdsFilter =
    typeRaw === "mechanization" || typeRaw === "land" || typeRaw === "other"
      ? (typeRaw as AdsFilter)
      : "all";

  const posts = await getFeedPosts();
  const keywordMatchedAds = posts.filter((post) => {
    const text = `${post.title} ${post.content}`.toLowerCase();
    return equipmentKeywords.some((kw) => text.includes(kw)) || landKeywords.some((kw) => text.includes(kw));
  });

  const typedAds = keywordMatchedAds.map((post) => ({
    ...post,
    adType: detectAdType(post.title, post.content),
  }));

  const searchedAds = query
    ? typedAds.filter((post) =>
        `${post.title} ${post.content} ${post.author?.name || ""} ${post.author?.location || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
    : typedAds;

  const locationFilteredAds = location
    ? searchedAds.filter((post) =>
        `${post.author?.location || ""} ${post.title} ${post.content}`.toLowerCase().includes(location.toLowerCase())
      )
    : searchedAds;

  const filteredAds = type === "all" ? locationFilteredAds : locationFilteredAds.filter((post) => post.adType === type);

  const totalAds = filteredAds.length;
  const totalPages = Math.max(1, Math.ceil(totalAds / POSTS_PER_PAGE));
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.min(parsedPage, totalPages) : 1;
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const ads = filteredAds.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return { profile, ads, query, type, currentPage, totalPages, totalAds };
}

function typeLabel(type: AdsFilter) {
  if (type === "mechanization") return "Mehanizacija";
  if (type === "land") return "Zemljište";
  if (type === "other") return "Ostali oglasi";
  return "Svi oglasi";
}

export default async function EquipmentAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[]; type?: string | string[]; location?: string | string[] }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) {
    redirect("/login");
  }

  const queryParam = params.q;
  const pageParam = params.page;
  const typeParam = params.type;
  const locationParam = params.location;
  const query = (Array.isArray(queryParam) ? queryParam[0] : queryParam || "").trim();
  const typeRaw = (Array.isArray(typeParam) ? typeParam[0] : typeParam || "all").toLowerCase();
  const pageRaw = Array.isArray(pageParam) ? pageParam[0] : pageParam || "1";
  const parsedPage = Number.parseInt(pageRaw, 10);
  const hasLocationParam = locationParam !== undefined;
  const location = (Array.isArray(locationParam) ? locationParam[0] : locationParam || "").trim();
  const activeScope = hasLocationParam && location ? "regional" : "all";

  const type: AdsFilter =
    typeRaw === "mechanization" || typeRaw === "land" || typeRaw === "other"
      ? (typeRaw as AdsFilter)
      : "all";
  const activeLocation = hasLocationParam ? location : (profile.location || "").trim();

  const { ads, currentPage, totalPages, totalAds } = await getAdsData({ q: query, page: pageRaw, type, location: activeLocation });

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (hasLocationParam || activeLocation) params.set("location", activeLocation);
    if (type !== "all") params.set("type", type);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/oprema-i-oglasi?${qs}` : "/oprema-i-oglasi";
  }

  function buildHref(next: { q?: string; type?: AdsFilter; location?: string; page?: number }) {
    const params = new URLSearchParams();
    const nextQuery = next.q !== undefined ? next.q : query;
    const nextType = next.type !== undefined ? next.type : type;
    const nextLocation = next.location !== undefined ? next.location : activeLocation;

    if (nextQuery) params.set("q", nextQuery);
    if (nextLocation !== undefined) params.set("location", nextLocation);
    if (nextType !== "all") params.set("type", nextType);
    if ((next.page || 1) > 1) params.set("page", String(next.page));

    const qs = params.toString();
    return qs ? `/oprema-i-oglasi?${qs}` : "/oprema-i-oglasi";
  }

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Oprema i oglasi</div>
          <h1>Pregled opreme i ponuda</h1>
          <p className="muted">Objave iz zajednice koje se odnose na mehanizaciju, zemljište i ostale oglase.</p>
          <div style={{ marginTop: 12 }}>
            <Link className="button secondary" href="/">
              Nazad na feed
            </Link>
          </div>
        </div>
        <Link className="button" href="/#new-post">
          Dodaj oglas
        </Link>
      </div>

      <section className="panel" style={{ marginBottom: 16 }}>
        <form method="get" action="/oprema-i-oglasi" style={{ display: "grid", gap: 10 }}>
          <div style={{ alignItems: "center", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { value: "all", label: "Sve" },
              { value: "mechanization", label: "Mehanizacija" },
              { value: "land", label: "Zemljište" },
              { value: "other", label: "Ostalo" },
            ].map((item) => (
              <Link
                key={item.value}
                href={buildHref({ type: item.value as AdsFilter, page: 1 })}
                className="button secondary"
                style={{
                  background: type === item.value ? "#0f7a34" : undefined,
                  borderColor: type === item.value ? "#0f7a34" : undefined,
                  color: type === item.value ? "white" : undefined,
                  minHeight: 34,
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div style={{ alignItems: "center", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
            <input
              name="q"
              defaultValue={query}
              placeholder="Pretraga po naslovu, opisu, gradu..."
              style={{
                border: "1px solid #d9e2dc",
                borderRadius: 8,
                minHeight: 38,
                minWidth: 260,
                padding: "0 10px",
              }}
            />
            <input
              name="location"
              defaultValue={activeLocation}
              placeholder="Paracin, Jagodina, Novi Sad..."
              style={{
                border: "1px solid #d9e2dc",
                borderRadius: 8,
                minHeight: 38,
                minWidth: 220,
                padding: "0 10px",
              }}
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { scope: "all", label: "Cela Srbija" },
                { scope: "regional", label: "Šira okolina" },
              ].map((item) => (
                <Link
                  key={item.scope}
                  href={buildHref({ location: item.scope === "all" ? "" : activeLocation, page: 1 })}
                  className="button secondary"
                  style={{
                    background: item.scope === activeScope ? "#0f7a34" : undefined,
                    borderColor: item.scope === activeScope ? "#0f7a34" : undefined,
                    color: item.scope === activeScope ? "white" : undefined,
                    minHeight: 38,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <button className="button" type="submit" style={{ minHeight: 38 }}>Pretraži</button>
            {query ? (
              <Link className="button secondary" href={buildHref({ q: "", location: "", page: 1 })} style={{ minHeight: 38 }}>
                Reset
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      <p className="muted" style={{ marginTop: 0 }}>
        Prikaz: {typeLabel(type)} · Lokacija: {activeLocation || "Sve lokacije"} · Ukupno oglasa: {totalAds}
      </p>

      <section className="timeline">
        {ads.length ? (
          ads.map((post) => (
            <article className="panel subsidy-row" key={post.id}>
              <div>
                <span className="badge">{post.category}</span>
                <h2>{post.title}</h2>
                <p>{post.content}</p>
                <p className="muted">
                  Autor: {post.author?.name ?? "Nepoznat"}
                  {post.author?.location ? ` · ${post.author.location}` : ""}
                </p>
              </div>
              <div>
                <strong>{typeLabel(post.adType as AdsFilter)}</strong>
                <p className="muted">Otvorite profil autora i kontaktirajte direktno.</p>
              </div>
            </article>
          ))
        ) : (
            <section className="panel" style={{ background: "#fbfdf9", borderColor: "#e4e9e5" }}>
              <strong style={{ display: "block", marginBottom: 8 }}>Nema oglasa za ovu okolinu</strong>
              <p className="muted" style={{ marginTop: 0 }}>
                Proširi pretragu na širu okolinu ili celu Srbiju da vidiš više opreme i zemljišta.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link className="button secondary" href={buildHref({ location: activeLocation, page: 1 })}>
                  Šira okolina
                </Link>
                <Link className="button secondary" href={buildHref({ location: "", page: 1 })}>
                  Cela Srbija
                </Link>
              </div>
            </section>
        )}
      </section>

      {totalPages > 1 ? (
        <nav className="feed-pagination" aria-label="Paginacija oglasa" style={{ marginTop: 14 }}>
          <p className="muted">
            Strana {currentPage} od {totalPages}
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
            <Link
              className={`button secondary ${currentPage >= totalPages ? "disabled" : ""}`}
              href={pageHref(Math.min(totalPages, currentPage + 1))}
              aria-disabled={currentPage >= totalPages}
              tabIndex={currentPage >= totalPages ? -1 : undefined}
            >
              Sledeća
            </Link>
          </div>
        </nav>
      ) : null}
    </main>
  );
}
