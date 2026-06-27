import Link from "next/link";
import { cookies } from "next/headers";
import { plantAnalyses } from "../data";
import PlantAnalyzer from "./PlantAnalyzer";
import { getCurrentUser, getDiseaseAnalysesForUser } from "@/lib/db";

function toSymptomsList(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return value.filter((item): item is string => typeof item === "string");
}

export default function PlantDiseasesPage() {
  return <PlantDiseasesPageContent />;
}

async function PlantDiseasesPageContent() {
  const currentUser = await getCurrentUser(await cookies());
  const recentAnalyses = currentUser ? await getDiseaseAnalysesForUser(currentUser.id, { limit: 6 }) : [];

  return (
    <main className="main v2-page">
      <div className="topbar">
        <div>
          <div className="eyebrow">V2 bolesti biljaka</div>
          <h1>Upload slike i AI analiza bolesti</h1>
          <p className="muted">
            Dodaj fotografiju biljke, izaberi kulturu i dobij procenu simptoma, rizika i narednih koraka.
          </p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/ai-asistent">
            AI asistent
          </Link>
          <Link className="button secondary" href="/">
            Nazad na pocetnu
          </Link>
        </div>
      </div>

      <PlantAnalyzer />

      <section className="panel previous-analyses user-analysis-panel">
        <div className="analysis-section-head">
          <h2>Tvoje poslednje analize</h2>
          <span className="muted">Iz baze podataka</span>
        </div>

        {recentAnalyses.length ? (
          <div className="user-analysis-list">
            {recentAnalyses.map((analysis) => {
              const symptoms = toSymptomsList(analysis.symptoms);
              return (
                <article className="user-analysis-card" key={analysis.id}>
                  <div className="user-analysis-top">
                    <span className="badge">{analysis.crop || "Biljka"}</span>
                    <small className="muted">{new Date(analysis.createdAt).toLocaleString("sr-RS")}</small>
                  </div>

                  <h3>{analysis.suspectedIssue}</h3>
                  <p className="muted">
                    {analysis.severity} · {analysis.confidence}% pouzdanost
                  </p>

                  {analysis.upload?.imageUrl ? (
                    <img
                      className="user-analysis-image"
                      src={analysis.upload.imageUrl}
                      alt={analysis.crop || "Analiza biljke"}
                    />
                  ) : null}

                  {symptoms.length ? (
                    <ul className="symptom-list compact">
                      {symptoms.slice(0, 3).map((symptom) => (
                        <li key={symptom}>{symptom}</li>
                      ))}
                    </ul>
                  ) : null}

                  <p>{analysis.recommendation}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-result slim">
            <strong>Jos nema sacuvanih analiza</strong>
            <p className="muted">Pokreni analizu iznad i rezultat ce automatski biti dodat u istoriju.</p>
          </div>
        )}
      </section>

      <section className="panel previous-analyses">
        <h2>Primeri analiza</h2>
        <div className="analysis-list">
          {plantAnalyses.map((analysis) => (
            <article className="analysis-card" key={analysis.suspectedIssue}>
              <img src={analysis.image} alt={analysis.crop} />
              <div>
                <span className="badge">{analysis.crop}</span>
                <h3>{analysis.suspectedIssue}</h3>
                <p className="muted">
                  {analysis.severity} · {analysis.confidence}% pouzdanost
                </p>
                <p>{analysis.recommendation}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
