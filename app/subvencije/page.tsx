import Link from "next/link";
import { cookies } from "next/headers";
import SubsidyAdminForm from "@/app/components/SubsidyAdminForm";
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

export default async function SubsidiesPage() {
  const [subsidies, currentUser] = await Promise.all([getSubsidiesData(), getCurrentUser(await cookies())]);
  const canManageSubsidies = currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR";

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

      {canManageSubsidies ? <SubsidyAdminForm /> : null}

      <section className="timeline subsidy-timeline">
        {subsidies.map((subsidy) => (
          <article className="panel subsidy-row" key={subsidy.id}>
            <div>
              <span className={`badge subsidy-badge ${getStatusMeta(subsidy.status).className}`}>
                {getStatusMeta(subsidy.status).label}
              </span>
              <h2>{subsidy.title}</h2>
              <p className="muted">{subsidy.institution}</p>
              <p>{subsidy.description}</p>
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
      </section>
    </main>
  );
}
