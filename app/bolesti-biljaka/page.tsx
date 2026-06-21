import Link from "next/link";
import { plantAnalyses } from "../data";
import PlantAnalyzer from "./PlantAnalyzer";

export default function PlantDiseasesPage() {
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
