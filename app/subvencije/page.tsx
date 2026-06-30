import Link from "next/link";
import { cookies } from "next/headers";
import SubsidyAdminForm from "@/app/components/SubsidyAdminForm";
import CollapsibleForm from "@/app/components/CollapsibleForm";
import SubsidyDeleteButton from "@/app/components/SubsidyDeleteButton";
import SubsidyEditTrigger from "@/app/components/SubsidyEditTrigger";
import { getCurrentUser, getSubsidies } from "@/lib/db";

async function getSubsidiesData() {
  return getSubsidies();
}

function getStatusMeta(status: "DRAFT" | "OPEN" | "CLOSING_SOON" | "CLOSED") {
  switch (status) {
    case "OPEN":
      return { label: "Otvoreno", className: "subsidy-status-open" };
    case "CLOSING_SOON":
      return { label: "Uskoro se zatvara", className: "subsidy-status-closing-soon" };
    case "CLOSED":
      return { label: "Zatvoreno", className: "subsidy-status-closed" };
    default:
      return { label: "Nacrt", className: "subsidy-status-draft" };
  }
}

export default async function SubsidiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; status?: string | string[]; location?: string | string[] }>;
}) {
  const params = await searchParams;
  const queryParam = params?.q;
  const statusParam = params?.status;
  const locationParam = params?.location;
  const query = (Array.isArray(queryParam) ? queryParam[0] : queryParam || "").trim();
  const statusFilterRaw = (Array.isArray(statusParam) ? statusParam[0] : statusParam || "all").toUpperCase();
  const location = (Array.isArray(locationParam) ? locationParam[0] : locationParam || "").trim();
  const allowedStatus = new Set(["ALL", "DRAFT", "OPEN", "CLOSING_SOON", "CLOSED"]);
  const statusFilter = allowedStatus.has(statusFilterRaw) ? statusFilterRaw : "ALL";

  const [subsidies, currentUser] = await Promise.all([getSubsidiesData(), getCurrentUser(await cookies())]);
  const canManageSubsidies = currentUser?.role === "MODERATOR";
  const activeLocation = location;
  const filteredSubsidies = subsidies.filter((item) => {
    if (statusFilter !== "ALL" && item.status !== statusFilter) {
      return false;
    }

    if (activeLocation && item.region && !item.region.toLowerCase().includes(activeLocation.toLowerCase())) {
      return false;
    }

    if (!query) return true;
    const haystack = `${item.title} ${item.institution} ${item.description} ${item.region || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <main className="main">
      <div className="topbar">
        <div>
          <div className="eyebrow">Subvencije</div>
          <h1>Konkursi i podsticaji</h1>
          <p className="muted">Pregled rokova, institucija i iznosa za poljoprivrednike.</p>
        </div>
        <Link className="button secondary" href="/">
          Nazad na feed
        </Link>
      </div>

      {canManageSubsidies ? (
        <CollapsibleForm id="new-subsidy" summary="Dodaj subvenciju" style={{ marginBottom: 16 }}>
          <SubsidyAdminForm />
        </CollapsibleForm>
      ) : null}

      <section className="panel" style={{ marginBottom: 16 }}>
        <form method="get" action="/subvencije" className="form">
          <div className="grid two-cols">
            <label className="field">
              <span>Pretraga</span>
              <input name="q" defaultValue={query} placeholder="Naslov, institucija, region..." />
            </label>

            <label className="field">
              <span>Lokacija</span>
              <input name="location" defaultValue={activeLocation} placeholder="Paracin, Jagodina, Vojvodina..." />
            </label>

            <label className="field">
              <span>Status</span>
              <select name="status" defaultValue={statusFilter}>
                <option value="ALL">Svi statusi</option>
                <option value="OPEN">Otvoreno</option>
                <option value="CLOSING_SOON">Uskoro se zatvara</option>
                <option value="CLOSED">Zatvoreno</option>
                <option value="DRAFT">Nacrt</option>
              </select>
            </label>
          </div>

          <div className="actions">
            <button className="button" type="submit">Primeni filtere</button>
            <Link className="button secondary" href="/subvencije?location=">Reset</Link>
          </div>
        </form>
      </section>

      <p className="muted" style={{ marginTop: 0 }}>
        Prikazano subvencija: {filteredSubsidies.length}
      </p>

      <section className="timeline subsidy-timeline">
        {filteredSubsidies.map((subsidy) => (
          <article className="panel subsidy-row" key={subsidy.id}>
            <div>
              <span className={`badge subsidy-badge ${getStatusMeta(subsidy.status).className}`}>
                {getStatusMeta(subsidy.status).label}
              </span>
              <h2>{subsidy.title}</h2>
              <p className="muted">{subsidy.institution}</p>
              <p>{subsidy.description}</p>
              {subsidy.imageUrl ? <img className="activity-card-image" src={subsidy.imageUrl} alt={subsidy.title} /> : null}
              <p>
                <strong>Iznos:</strong> {subsidy.amount ?? "-"}
              </p>
              {subsidy.link ? (
                <p>
                  <Link className="subsidy-link" href={subsidy.link} target="_blank" rel="noreferrer">
                    Pogledaj konkurs
                  </Link>
                </p>
              ) : null}

              {canManageSubsidies ? (
                <div className="actions" style={{ marginTop: 10 }}>
                  <SubsidyEditTrigger
                    subsidy={{
                      id: subsidy.id,
                      title: subsidy.title,
                      institution: subsidy.institution,
                      description: subsidy.description,
                      amount: subsidy.amount,
                      region: subsidy.region,
                      status: subsidy.status,
                      opensAt: subsidy.opensAt,
                      closesAt: subsidy.closesAt,
                      link: subsidy.link,
                      imageUrl: subsidy.imageUrl,
                    }}
                  />
                  <SubsidyDeleteButton subsidyId={subsidy.id} />
                </div>
              ) : null}
            </div>
            <div className="subsidy-meta">
              <div>
                <strong>Otvaranje</strong>
                <p>{subsidy.opensAt ? new Date(subsidy.opensAt).toLocaleDateString("sr-RS") : "Nije definisano"}</p>
              </div>
              <div>
                <strong>Rok</strong>
                <p>{subsidy.closesAt ? new Date(subsidy.closesAt).toLocaleDateString("sr-RS") : "Nije definisano"}</p>
              </div>
              <div>
                <strong>Region</strong>
                <p>{subsidy.region || "Cela Srbija"}</p>
              </div>
            </div>
          </article>
        ))}

        {!filteredSubsidies.length ? (
          <article className="panel">
            <strong>Nema rezultata za zadate filtere.</strong>
            <p className="muted" style={{ marginTop: 8 }}>Promenite pretragu ili status filter.</p>
          </article>
        ) : null}
      </section>
    </main>
  );
}
