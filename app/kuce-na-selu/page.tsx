import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getProperties, getPropertiesCount } from "@/lib/db";
import PropertyAdminForm from "@/app/components/PropertyAdminForm";
import PropertyAdminActions from "@/app/components/PropertyAdminActions";

const PROPERTIES_PER_PAGE = 9;

export default async function KuceNaSelu({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; q?: string; page?: string; location?: string; scope?: string }>;
}) {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) redirect("/login");

  const { category, status, q, page, location, scope } = await searchParams;
  const canAddProperty = profile.role === "ADMIN" || profile.role === "MODERATOR";
  const statusFilter = status === "inactive" || status === "all" ? status : "active";
  const query = (q || "").trim();
  const hasLocationParam = location !== undefined;
  const activeLocation = hasLocationParam ? location.trim() : (profile.location || "").trim();
  const activeScope: "local" | "regional" | "all" = scope === "all" || scope === "regional" ? scope : "local";
  const parsedPage = Number.parseInt(page || "1", 10);

  const propertyFilter = canAddProperty
    ? statusFilter === "all"
      ? { activeOnly: false }
      : { activeOnly: false, isActive: statusFilter === "active" }
    : { activeOnly: true as const };

  const baseFilter = {
    ...propertyFilter,
    ...(category ? { category } : {}),
    ...(query ? { query } : {}),
    ...(activeLocation ? { location: activeLocation } : {}),
    ...(activeLocation ? { locationScope: activeScope } : {}),
  };

  const totalProperties = await getPropertiesCount(baseFilter);
  const totalPages = Math.max(1, Math.ceil(totalProperties / PROPERTIES_PER_PAGE));
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0
    ? Math.min(parsedPage, totalPages)
    : 1;
  const skip = (currentPage - 1) * PROPERTIES_PER_PAGE;

  const properties = await getProperties({
    ...baseFilter,
    skip,
    limit: PROPERTIES_PER_PAGE,
  });

  function pageHref(nextPage: number) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (query) params.set("q", query);
    if (hasLocationParam || activeLocation) params.set("location", activeLocation);
    if (activeScope !== "local") params.set("scope", activeScope);
    if (canAddProperty) params.set("status", statusFilter);
    if (nextPage > 1) params.set("page", String(nextPage));
    const qs = params.toString();
    return qs ? `/kuce-na-selu?${qs}` : "/kuce-na-selu";
  }

  function filterHref(next: { category?: string; status?: string; q?: string; location?: string; scope?: string; page?: number }) {
    const params = new URLSearchParams();
    const nextCategory = next.category !== undefined ? next.category : category;
    const nextQuery = next.q !== undefined ? next.q : query;
    const nextLocation = next.location !== undefined ? next.location : activeLocation;
    const nextStatus = next.status !== undefined ? next.status : statusFilter;
    const nextScope = next.scope !== undefined ? next.scope : activeScope;

    if (nextCategory) params.set("category", nextCategory);
    if (nextQuery) params.set("q", nextQuery);
    if (nextLocation !== undefined) params.set("location", nextLocation);
    if (nextScope !== "local") params.set("scope", nextScope);
    if (canAddProperty) params.set("status", nextStatus);
    if ((next.page || 1) > 1) params.set("page", String(next.page));

    const qs = params.toString();
    return qs ? `/kuce-na-selu?${qs}` : "/kuce-na-selu";
  }

  const categories = [
    { value: "", label: "Sve" },
    { value: "KUCA", label: "Kuće" },
    { value: "ZEMLJISTE", label: "Zemljište" },
    { value: "VIKENDICA", label: "Vikendice" },
    { value: "IMANJE", label: "Imanja" },
    { value: "STAN", label: "Stanovi" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Kuće na selu</h1>
        <p style={{ color: "#68746d", margin: 0 }}>Pronađi svoju kuću iz snova na selu</p>
        <div style={{ marginTop: 12 }}>
          <Link className="button secondary" href="/">
            Nazad na feed
          </Link>
        </div>
      </div>

      {canAddProperty ? <PropertyAdminForm /> : null}

      <form method="get" action="/kuce-na-selu" style={{ display: "grid", gap: 8, marginBottom: 20 }}>
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {canAddProperty ? <input type="hidden" name="status" value={statusFilter} /> : null}
        <label style={{ color: "#68746d", fontSize: 13, fontWeight: 600 }}>Pretraga oglasa</label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            name="q"
            defaultValue={query}
            placeholder="Naslov, grad, region, kontakt..."
            style={{
              border: "1px solid #e4e9e5",
              borderRadius: 10,
              fontSize: 14,
              minHeight: 40,
              padding: "0 12px",
              width: "min(100%, 420px)",
            }}
          />
          <input
            name="location"
            defaultValue={activeLocation}
            placeholder="Paracin, Jagodina, Vojvodina..."
            style={{
              border: "1px solid #e4e9e5",
              borderRadius: 10,
              fontSize: 14,
              minHeight: 40,
              padding: "0 12px",
              width: "min(100%, 260px)",
            }}
          />
          <select
            name="scope"
            defaultValue={activeScope}
            style={{
              border: "1px solid #e4e9e5",
              borderRadius: 10,
              fontSize: 14,
              minHeight: 40,
              padding: "0 12px",
              width: "min(100%, 220px)",
            }}
          >
            <option value="local">25 km - uža okolina</option>
            <option value="regional">50-100 km - šira okolina</option>
            <option value="all">200 km - cela Srbija</option>
          </select>
          <button
            type="submit"
            style={{
              background: "#0f7a34",
              border: 0,
              borderRadius: 10,
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              minHeight: 40,
              padding: "0 16px",
            }}
          >
            Pretraži
          </button>
          {query ? (
            <Link
              href={filterHref({ q: "", location: "", scope: "all" })}
              style={{
                alignItems: "center",
                background: "#f3f4f6",
                borderRadius: 10,
                color: "#374151",
                display: "inline-flex",
                fontSize: 14,
                fontWeight: 600,
                minHeight: 40,
                padding: "0 14px",
                textDecoration: "none",
              }}
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={filterHref({ category: cat.value, page: 1 })}
            style={{
              background: category === cat.value || (!category && !cat.value) ? "#0f7a34" : "#edf8ef",
              border: "1px solid #e4e9e5",
              borderRadius: 20,
              color: category === cat.value || (!category && !cat.value) ? "white" : "#111713",
              fontSize: 14,
              padding: "6px 16px",
              textDecoration: "none",
            }}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {activeLocation ? (
        <section
          style={{
            background: "#f7fbf4",
            border: "1px solid #dbeadf",
            borderRadius: 14,
            marginBottom: 20,
            padding: 16,
          }}
        >
          <strong>Prikaz za {activeLocation}</strong>
          <p style={{ color: "#68746d", margin: "6px 0 12px" }}>
            Opseg je približan po gradu i regionu, pa možeš brzo da proširiš pretragu ako nema dovoljno rezultata.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { scope: "local", label: "25 km" },
              { scope: "regional", label: "50-100 km" },
              { scope: "all", label: "200 km" },
            ].map((item) => (
              <Link
                key={item.scope}
                href={filterHref({ scope: item.scope, page: 1 })}
                style={{
                  background: activeScope === item.scope ? "#0f7a34" : "white",
                  border: "1px solid #dbeadf",
                  borderRadius: 999,
                  color: activeScope === item.scope ? "white" : "#0f7a34",
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
        </section>
      ) : null}

      {canAddProperty ? (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { value: "active", label: "Aktivni oglasi" },
            { value: "inactive", label: "Neaktivni oglasi" },
            { value: "all", label: "Svi oglasi" },
          ].map((item) => (
            <Link
              key={item.value}
              href={filterHref({ status: item.value, page: 1 })}
              style={{
                background: statusFilter === item.value ? "#1d4ed8" : "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 20,
                color: statusFilter === item.value ? "white" : "#1e3a8a",
                fontSize: 13,
                fontWeight: 600,
                padding: "6px 14px",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}

      {properties.length ? (
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {properties.map((prop) => (
            <article
              key={prop.id}
              style={{ background: "white", border: "1px solid #e4e9e5", borderRadius: 14, overflow: "hidden" }}
            >
              {prop.imageUrl ? (
                <div style={{ aspectRatio: "16/9", overflow: "hidden", position: "relative" }}>
                  <img src={prop.imageUrl} alt={prop.title} style={{ height: "100%", objectFit: "cover", width: "100%" }} />
                  <span style={{
                    background: "#0f7a34", borderRadius: 6, color: "white", fontSize: 11,
                    fontWeight: 700, left: 10, padding: "3px 8px", position: "absolute", top: 10,
                  }}>
                    {prop.category === "KUCA" ? "Kuća" : prop.category === "ZEMLJISTE" ? "Zemljište" : prop.category}
                  </span>
                </div>
              ) : (
                <div style={{ aspectRatio: "16/9", background: "#edf8ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 40 }}>🏡</span>
                </div>
              )}
              <div style={{ padding: "14px 16px" }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>{prop.title}</h2>
                {canAddProperty ? (
                  <p style={{ margin: "0 0 8px" }}>
                    <span
                      style={{
                        background: prop.isActive ? "#e8f8ec" : "#fee2e2",
                        borderRadius: 8,
                        color: prop.isActive ? "#166534" : "#991b1b",
                        display: "inline-block",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                      }}
                    >
                      {prop.isActive ? "Aktivan" : "Neaktivan"}
                    </span>
                  </p>
                ) : null}
                <p style={{ color: "#68746d", fontSize: 13, margin: "0 0 8px" }}>
                  📍 {prop.city}{prop.region ? `, ${prop.region}` : ""}
                </p>
                {prop.description ? (
                  <p style={{ color: "#444", fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>
                    {prop.description.slice(0, 100)}{prop.description.length > 100 ? "..." : ""}
                  </p>
                ) : null}
                <div style={{ color: "#68746d", fontSize: 12, marginBottom: 10 }}>
                  {prop.areaSqm ? `${prop.areaSqm}m²` : ""}
                  {prop.rooms ? ` · ${prop.rooms} sobe` : ""}
                  {prop.landHa ? ` · ${Number(prop.landHa)}ha placa` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <strong style={{ color: "#075421", fontSize: 18 }}>
                    {Number(prop.price).toLocaleString("sr-RS")} {prop.currency}
                  </strong>
                  {prop.contactPhone ? (
                    <a
                      href={`tel:${prop.contactPhone}`}
                      style={{ background: "#edf8ef", borderRadius: 8, color: "#0f7a34", fontSize: 13, fontWeight: 600, padding: "6px 12px" }}
                    >
                      Pozovi
                    </a>
                  ) : null}
                </div>

                {canAddProperty ? (
                  <PropertyAdminActions
                    property={{
                      id: prop.id,
                      title: prop.title,
                      description: prop.description,
                      price: Number(prop.price),
                      currency: prop.currency,
                      city: prop.city,
                      region: prop.region,
                      areaSqm: prop.areaSqm,
                      landHa: prop.landHa ? prop.landHa.toString() : null,
                      rooms: prop.rooms,
                      category: prop.category,
                      imageUrl: prop.imageUrl,
                      contactPhone: prop.contactPhone,
                      contactName: prop.contactName,
                      isActive: prop.isActive,
                    }}
                  />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ background: "#fbfdf9", border: "1px solid #e4e9e5", borderRadius: 18, padding: "36px 24px", textAlign: "center", color: "#68746d" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏡</div>
          <strong style={{ color: "#111713", display: "block", fontSize: 18, marginBottom: 8 }}>
            Nema oglasa za ovu okolinu
          </strong>
          <p style={{ margin: 0 }}>
            Proširi opseg na 50-100 km ili 200 km da vidiš više ponude.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            <Link className="button secondary" href={filterHref({ scope: "regional", page: 1 })}>
              Šira okolina
            </Link>
            <Link className="button secondary" href={filterHref({ scope: "all", page: 1, location: "" })}>
              Cela Srbija
            </Link>
          </div>
        </div>
      )}

      {totalPages > 1 ? (
        <div style={{ alignItems: "center", display: "flex", gap: 10, justifyContent: "space-between", marginTop: 22 }}>
          <p style={{ color: "#68746d", margin: 0 }}>
            Strana {currentPage} od {totalPages} · Ukupno {totalProperties} oglasa
          </p>

          <div style={{ display: "inline-flex", gap: 8 }}>
            <Link
              href={pageHref(Math.max(1, currentPage - 1))}
              style={{
                background: currentPage <= 1 ? "#f3f4f6" : "#e8f8ec",
                borderRadius: 8,
                color: currentPage <= 1 ? "#9ca3af" : "#166534",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 12px",
                pointerEvents: currentPage <= 1 ? "none" : "auto",
                textDecoration: "none",
              }}
            >
              Prethodna
            </Link>
            <Link
              href={pageHref(Math.min(totalPages, currentPage + 1))}
              style={{
                background: currentPage >= totalPages ? "#f3f4f6" : "#e8f8ec",
                borderRadius: 8,
                color: currentPage >= totalPages ? "#9ca3af" : "#166534",
                fontSize: 13,
                fontWeight: 700,
                padding: "8px 12px",
                pointerEvents: currentPage >= totalPages ? "none" : "auto",
                textDecoration: "none",
              }}
            >
              Sledeća
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
