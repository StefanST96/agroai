import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, getProperties } from "@/lib/db";

export default async function KuceNaSelu({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const cookieStore = await cookies();
  const profile = await getCurrentUser(cookieStore);
  if (!profile) redirect("/login");

  const { category } = await searchParams;
  const properties = await getProperties({
    activeOnly: true,
    ...(category ? { category } : {}),
  });

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
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {categories.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value ? `/kuce-na-selu?category=${cat.value}` : "/kuce-na-selu"}
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
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#68746d" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏡</div>
          <strong>Nema oglasa za ovu kategoriju</strong>
          <p>Promenite filter ili dodajte oglas.</p>
        </div>
      )}
    </div>
  );
}
