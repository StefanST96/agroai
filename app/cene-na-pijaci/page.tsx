import Link from "next/link";
import { cookies } from "next/headers";
import { getMarketPriceHighlights, getMarketPrices } from "@/lib/db";
import { formatPriceDin, formatPriceSource, getProductIcon } from "@/lib/market";
import MarketPriceForm from "../components/MarketPriceForm";
import CollapsibleForm from "../components/CollapsibleForm";
import { getCurrentUser } from "@/lib/db";

type MarketPriceSort = "latest" | "price-asc" | "price-desc" | "product" | "market";
type MarketScope = "local" | "regional" | "all";

const unitLabels: Record<string, string> = {
  KG: "kg",
  T: "t",
  L: "l",
  PIECE: "kom",
};

function daysAgo(value: Date) {
  return Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000));
}

function freshnessLabel(value: Date) {
  const age = daysAgo(value);
  if (age <= 0) return "Danas";
  if (age === 1) return "Juce";
  return `Pre ${age} dana`;
}

function formatReportedAt(value: Date) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function normalize(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value || "";
  return raw.trim();
}

export default async function MarketPricesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; market?: string | string[]; category?: string | string[]; unit?: string | string[]; sort?: string | string[]; location?: string | string[]; scope?: string | string[] }>;
}) {
  const params = await searchParams;
  const currentUser = await getCurrentUser(await cookies());
  const query = normalize(params.q);
  const marketFilter = normalize(params.market);
  const categoryFilter = normalize(params.category);
  const unitFilter = normalize(params.unit);
  const locationParam = params.location;
  const scopeParam = params.scope;
  const hasLocationParam = locationParam !== undefined;
  const location = normalize(locationParam);
  const scopeRaw = normalize(scopeParam).toLowerCase();
  const activeScope: MarketScope = scopeRaw === "regional" || scopeRaw === "all" ? scopeRaw : "local";
  const sortRaw = normalize(params.sort).toLowerCase();
  const sort: MarketPriceSort = sortRaw === "price-asc" || sortRaw === "price-desc" || sortRaw === "product" || sortRaw === "market" ? sortRaw : "latest";
  const activeLocation = hasLocationParam ? location : (currentUser?.location || "").trim();

  const [marketPrices, highlights] = await Promise.all([
    getMarketPrices(),
    getMarketPriceHighlights(4, activeLocation || undefined),
  ]);

  const markets = Array.from(new Map(marketPrices.map((price) => [price.market?.name || "", price.market])).values())
    .filter(Boolean)
    .sort((a, b) => (a?.name || "").localeCompare(b?.name || ""));
  const categories = Array.from(new Set(marketPrices.map((price) => price.product?.category).filter(Boolean))).sort();
  const units = Array.from(new Set(marketPrices.map((price) => price.unit).filter(Boolean))).sort();

  const filteredPrices = marketPrices.filter((price) => {
    const haystack = [
      price.product?.name || "",
      price.product?.category || "",
      price.market?.name || "",
      price.market?.city || "",
      price.source || "",
      price.unit || "",
    ].join(" ").toLowerCase();

    if (query && !haystack.includes(query.toLowerCase())) {
      return false;
    }

    if (activeLocation && activeScope !== "all") {
      const locationHaystack = `${price.market?.name || ""} ${price.market?.city || ""}`.toLowerCase();
      const relaxedHaystack = `${price.market?.name || ""} ${price.market?.city || ""} ${price.market?.region || ""}`.toLowerCase();
      const matchesLocation = activeScope === "regional"
        ? relaxedHaystack.includes(activeLocation.toLowerCase())
        : locationHaystack.includes(activeLocation.toLowerCase());
      if (!matchesLocation) {
        return false;
      }
    }

    if (marketFilter && `${price.market?.name || ""} · ${price.market?.city || ""}` !== marketFilter) {
      return false;
    }

    if (categoryFilter && (price.product?.category || "") !== categoryFilter) {
      return false;
    }

    if (unitFilter && (price.unit || "") !== unitFilter) {
      return false;
    }

    return true;
  });

  const sortedPrices = [...filteredPrices].sort((a, b) => {
    if (sort === "price-asc") return Number(a.price) - Number(b.price);
    if (sort === "price-desc") return Number(b.price) - Number(a.price);
    if (sort === "product") return (a.product?.name || "").localeCompare(b.product?.name || "");
    if (sort === "market") return `${a.market?.name || ""} ${a.market?.city || ""}`.localeCompare(`${b.market?.name || ""} ${b.market?.city || ""}`);
    return +new Date(b.reportedAt) - +new Date(a.reportedAt);
  });

  const hasAdvancedFilters = Boolean(marketFilter || categoryFilter || unitFilter || sort !== "latest");

  function buildHref(next: { q?: string; market?: string; category?: string; unit?: string; sort?: MarketPriceSort; scope?: MarketScope; location?: string }) {
    const nextParams = new URLSearchParams();
    if (next.q || query) nextParams.set("q", next.q ?? query);
    if (activeLocation || hasLocationParam) nextParams.set("location", activeLocation || "");
    if ((next.scope || activeScope) !== "local") nextParams.set("scope", next.scope ?? activeScope);
    if (next.market || marketFilter) nextParams.set("market", next.market ?? marketFilter);
    if (next.category || categoryFilter) nextParams.set("category", next.category ?? categoryFilter);
    if (next.unit || unitFilter) nextParams.set("unit", next.unit ?? unitFilter);
    if ((next.sort || sort) !== "latest") nextParams.set("sort", next.sort ?? sort);
    const qs = nextParams.toString();
    return qs ? `/cene-na-pijaci?${qs}` : "/cene-na-pijaci";
  }

  return (
    <main className="main market-page">
      <section className="market-hero panel">
        <div className="market-hero-copy">
          <div className="eyebrow">Cene na pijaci</div>
          <h1>Živi pregled tržišta, bez suve tabele.</h1>
          <p className="muted">
            Prati kretanje cena, filtriraj po pijaci i kategoriji, i prijavi novu cenu za nekoliko sekundi.
          </p>
          <div className="actions">
            <Link className="button" href="#price-form">
              Prijavi cenu
            </Link>
            <Link className="button secondary" href="/">
              Nazad na feed
            </Link>
          </div>
        </div>

      </section>

      <section className="panel market-toolbar">
        {activeLocation ? (
          <div className="market-toolbar-top">
            <div>
              <div className="eyebrow">Pregled za {activeLocation}</div>
              <p className="muted">Lokalno, šira okolina i cela Srbija su nivoi pregleda, ne precizni kilometri.</p>
            </div>
            <div className="market-scope-pills" role="group" aria-label="Opseg pregleda">
              {[
                { value: "local" as const, label: "Lokalno" },
                { value: "regional" as const, label: "Šira okolina" },
                { value: "all" as const, label: "Cela Srbija" },
              ].map((item) => (
                <Link
                  key={item.value}
                  href={buildHref({ scope: item.value, location: activeLocation })}
                  className={`market-scope-pill ${activeScope === item.value ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <form className="market-filter-form" method="get" action="/cene-na-pijaci">
          <div className="market-filter-main">
            <label className="field">
              <span>Pretraga</span>
              <input name="q" defaultValue={query} placeholder="Proizvod, pijaca, grad, izvor..." />
            </label>

            <label className="field">
              <span>Lokacija</span>
              <input name="location" defaultValue={activeLocation} placeholder="Paracin, Beograd, Novi Sad..." />
            </label>

            <label className="field">
              <span>Opseg</span>
              <select name="scope" defaultValue={activeScope}>
                <option value="local">Lokalno</option>
                <option value="regional">Šira okolina</option>
                <option value="all">Cela Srbija</option>
              </select>
            </label>

            <div className="market-filter-actions">
              <button className="button" type="submit">
                Primeni filtere
              </button>
              <Link className="button secondary" href="/cene-na-pijaci?location=&scope=all">
                Reset
              </Link>
            </div>
          </div>

          <details className="market-advanced-filters" open={hasAdvancedFilters}>
            <summary>Napredni filteri</summary>
            <div className="market-advanced-grid">
              <label className="field">
                <span>Pijaca</span>
                <select name="market" defaultValue={marketFilter}>
                  <option value="">Sve pijace</option>
                  {markets.map((market) => (
                    <option key={market?.id} value={`${market?.name || ""} · ${market?.city || ""}`}>
                      {market?.name} · {market?.city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Kategorija</span>
                <select name="category" defaultValue={categoryFilter}>
                  <option value="">Sve kategorije</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Jedinica</span>
                <select name="unit" defaultValue={unitFilter}>
                  <option value="">Sve jedinice</option>
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unitLabels[unit] || unit.toLowerCase()}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Sortiranje</span>
                <select name="sort" defaultValue={sort}>
                  <option value="latest">Najnovije</option>
                  <option value="price-asc">Cena rastuće</option>
                  <option value="price-desc">Cena opadajuće</option>
                  <option value="product">Proizvod</option>
                  <option value="market">Pijaca</option>
                </select>
              </label>
            </div>
          </details>
        </form>
      </section>

      <section className="market-layout">
        <div className="market-feed-column">
          <section className="panel market-trends-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Trendovi</div>
                <h2>Najnoviji pomaci</h2>
              </div>
              <p className="muted">Razlika između poslednje i prethodne prijavljene cene.</p>
            </div>

            <div className="market-trend-grid">
              {highlights.length ? highlights.map((item) => (
                <article className="market-trend-card" key={`${item.marketId}-${item.productId}`}>
                  <div className="market-trend-icon" aria-hidden>
                    {getProductIcon(item.product?.name)}
                  </div>
                  <div>
                    <strong>{item.product?.name}</strong>
                    <p>{item.market?.name} · {item.market?.city}</p>
                  </div>
                  <div className="market-trend-meta">
                    <span>{formatPriceDin(item.price.toString())} / {unitLabels[item.unit] || item.unit?.toLowerCase()}</span>
                    <small className={Number(item.delta) > 0 ? "up" : Number(item.delta) < 0 ? "down" : ""}>
                      {Number(item.delta) > 0 ? "+" : ""}{Number(item.delta).toFixed(2)} din
                    </small>
                  </div>
                </article>
              )) : (
                <div className="market-empty-state" style={{ gridColumn: "1 / -1" }}>
                  <div className="market-empty-icon">📍</div>
                  <strong>Nema lokalnih trendova za ovaj pregled</strong>
                  <p>Proširi pregled na širu okolinu ili celu Srbiju da vidiš više poslednjih prijava.</p>
                </div>
              )}
            </div>
          </section>

          <section className="panel market-feed-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Pregled cena</div>
                <h2>{filteredPrices.length ? `${filteredPrices.length} rezultata` : "Nema rezultata"}</h2>
              </div>
            </div>

            {sortedPrices.length ? (
              <div className="market-price-grid">
                {sortedPrices.map((price) => (
                  <article className="market-price-card" key={price.id}>
                    <div className="market-price-card-head">
                      <div className="market-price-icon" aria-hidden>
                        {getProductIcon(price.product?.name)}
                      </div>
                      <div>
                        <strong>{price.product?.name}</strong>
                        <p>{price.product?.category || "Ostalo"}</p>
                      </div>
                      <span className="market-price-source">{formatPriceSource(price.source)}</span>
                    </div>

                    <div className="market-price-figure">
                      <strong>{formatPriceDin(price.price.toString())}</strong>
                      <span>/{unitLabels[price.unit] || price.unit?.toLowerCase()}</span>
                    </div>

                    <div className="market-price-details">
                      <span>{price.market?.name} · {price.market?.city}</span>
                      <span>{formatReportedAt(price.reportedAt)}</span>
                    </div>

                    <div className="market-price-footer">
                      <span className={`market-pill ${daysAgo(price.reportedAt) >= 7 ? "market-pill--stale" : "market-pill--fresh"}`}>
                        {freshnessLabel(price.reportedAt)}
                      </span>
                      <span className="market-pill market-pill--soft">{price.market?.region || "Bez regiona"}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="market-empty-state">
                <div className="market-empty-icon">📉</div>
                <strong>Nema cena za ovaj opseg</strong>
                <p>Probaj širu okolinu ili celu Srbiju. Ako je cena stara, obnovi je u subotu da pregled ostane svež.</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  <Link className="button secondary" href={buildHref({ scope: "regional" })}>
                    Širi pregled
                  </Link>
                  <Link className="button secondary" href={buildHref({ scope: "all", location: "" })}>
                    Cela Srbija
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="market-sidebar-column">
          <section className="panel market-side-panel">
            <CollapsibleForm id="price-form" summary="Dodaj novu cenu">
              <MarketPriceForm />
            </CollapsibleForm>
          </section>

          <section className="panel market-side-panel market-tip-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">Brzi vodič</div>
                <h2>Kako da prijaviš cenu</h2>
              </div>
            </div>
            <ul className="market-tip-list">
              <li>Izaberi postojeću pijacu i proizvod kad su dostupni.</li>
              <li>Obnavljaj cenu svake subote ili čim primetiš da je tržište promenjeno.</li>
              <li>Koristi istu jedinicu da bi poređenje ostalo precizno.</li>
              <li>Najkorisnije su sveže prijave sa datumom i konkretnim mestom.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
