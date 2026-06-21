import Link from "next/link";
import { getSubsidies } from "@/lib/db";

async function getSubsidiesData() {
  return getSubsidies();
}

export default async function SubsidiesPage() {
  const subsidies = await getSubsidies();

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

      <section className="timeline">
        {subsidies.map((subsidy) => (
          <article className="panel subsidy-row" key={subsidy.id}>
            <div>
              <span className={`badge ${subsidy.status.toLowerCase()}`}>
                {subsidy.status}
              </span>
              <h2>{subsidy.title}</h2>
              <p className="muted">{subsidy.institution}</p>
              <p>
                <strong>Iznos:</strong> {subsidy.amount ?? "-"}
              </p>
            </div>
            <div>
              <strong>Rok</strong>
              <p>{subsidy.closesAt ? new Date(subsidy.closesAt).toLocaleDateString("sr-RS") : "N/A"}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
