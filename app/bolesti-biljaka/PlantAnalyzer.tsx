"use client";

import { useMemo, useState } from "react";
import { plantAnalyses } from "../data";

export default function PlantAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState("Malina");
  const [notes, setNotes] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  const result = useMemo(() => {
    const known = plantAnalyses.find((item) => item.crop.toLowerCase() === crop.toLowerCase());
    return known ?? plantAnalyses[0];
  }, [crop]);

  return (
    <section className="analyzer-grid">
      <div className="panel upload-panel">
        <h2>Upload slike biljke</h2>
        <p className="muted">Dodaj jasnu sliku lista, stabla ili ploda. Najbolje radi prirodno svetlo i krupan kadar.</p>

        <label className="upload-drop">
          {preview ? (
            <img src={preview} alt="Pregled upload slike" />
          ) : (
            <span>
              <strong>Izaberi sliku</strong>
              <small>JPG, PNG ili WEBP</small>
            </span>
          )}
          <input
            accept="image/*"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setPreview(URL.createObjectURL(file));
              setAnalyzed(false);
            }}
          />
        </label>

        <div className="form">
          <label className="field">
            <span>Kultura</span>
            <select value={crop} onChange={(event) => setCrop(event.target.value)}>
              <option>Malina</option>
              <option>Paradajz</option>
              <option>Psenica</option>
              <option>Kukuruz</option>
              <option>Jabuka</option>
            </select>
          </label>
          <label className="field">
            <span>Napomena</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Npr. simptomi su poceli posle kise, listovi se suse na ivicama..."
            />
          </label>
          <button className="button" type="button" onClick={() => setAnalyzed(true)}>
            Pokreni AI analizu
          </button>
        </div>
      </div>

      <div className="panel analysis-result">
        <div className="result-heading">
          <div>
            <div className="eyebrow">AI analiza bolesti</div>
            <h2>{analyzed ? result.suspectedIssue : "Rezultat ce se prikazati ovde"}</h2>
          </div>
          <span className={analyzed ? "risk-badge" : "risk-badge muted-badge"}>
            {analyzed ? result.severity : "Ceka sliku"}
          </span>
        </div>

        {analyzed ? (
          <>
            <div className="confidence">
              <span style={{ width: `${result.confidence}%` }} />
            </div>
            <p className="muted">Pouzdanost procene: {result.confidence}%</p>

            <h3>Prepoznati simptomi</h3>
            <ul className="symptom-list">
              {result.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>

            <h3>Preporuka</h3>
            <p>{result.recommendation}</p>

            {notes ? (
              <p className="muted">
                Napomena korisnika: <strong>{notes}</strong>
              </p>
            ) : null}
          </>
        ) : (
          <div className="empty-result">
            <strong>Nema pokrenute analize</strong>
            <p className="muted">Uploaduj sliku i klikni na dugme za analizu.</p>
          </div>
        )}
      </div>
    </section>
  );
}
