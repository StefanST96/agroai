"use client";

import { useState } from "react";

type AnalysisResult = {
  crop: string;
  suspectedIssue: string;
  confidence: number;
  symptoms: string[];
  recommendation: string;
  severity: string;
};

export default function PlantAnalyzer() {
  const cropSuggestions = ["Malina", "Paradajz", "Psenica", "Kukuruz", "Jabuka", "Sljiva", "Paprika", "Kupus"];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState("Malina");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  async function runAnalysis() {
    if (!selectedFile) {
      setError("Izaberite sliku biljke.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("kind", "image");

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: uploadFormData,
      });
      const uploadData = await uploadResponse.json().catch(() => ({}));
      if (!uploadResponse.ok || typeof uploadData.url !== "string" || typeof uploadData.assetId !== "number") {
        setError(uploadData.error ?? "Upload slike nije uspeo.");
        return;
      }

      const response = await fetch("/api/disease-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          notes,
          imageAssetId: uploadData.assetId,
          imageUrl: uploadData.url,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Analiza nije uspela.");
        return;
      }

      setResult(data as AnalysisResult);
      setAnalyzed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="analyzer-grid">
      <div className="panel upload-panel">
        <h2>Upload slike biljke</h2>
        <p className="muted">Dodaj jasnu sliku lista, stabla ili ploda. Najbolje radi prirodno svetlo i krupan kadar.</p>

        <div className="plant-crop-controls">
          <label className="field">
            <span>Biljka / kultura</span>
            <input
              list="crop-suggestions"
              value={crop}
              onChange={(event) => setCrop(event.target.value)}
              placeholder="Unesite biljku (npr. vinova loza, krastavac...)"
            />
            <datalist id="crop-suggestions">
              {cropSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>

          <div className="plant-crop-chips" role="group" aria-label="Brz izbor kulture">
            {cropSuggestions.slice(0, 6).map((item) => (
              <button
                key={item}
                type="button"
                className={`plant-chip ${crop.toLowerCase() === item.toLowerCase() ? "active" : ""}`}
                onClick={() => setCrop(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

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
              setSelectedFile(file);
              setPreview(URL.createObjectURL(file));
              setError("");
              setAnalyzed(false);
            }}
          />
        </label>

        <div className="form">
          <label className="field">
            <span>Napomena</span>
            <textarea
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Npr. simptomi su poceli posle kise, listovi se suse na ivicama..."
            />
          </label>
          <button className="button" type="button" onClick={runAnalysis} disabled={loading}>
            {loading ? "Analiziram..." : "Pokreni AI analizu"}
          </button>
          {error ? <p className="form-feedback error">{error}</p> : null}
        </div>
      </div>

      <div className="panel analysis-result">
        <div className="result-heading">
          <div>
            <div className="eyebrow">AI analiza bolesti</div>
            <h2>{analyzed && result ? result.suspectedIssue : "Rezultat ce se prikazati ovde"}</h2>
          </div>
          <span className={analyzed ? "risk-badge" : "risk-badge muted-badge"}>
            {analyzed && result ? result.severity : "Ceka sliku"}
          </span>
        </div>

        {analyzed && result ? (
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
