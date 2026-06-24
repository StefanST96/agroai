"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ActivityComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAssetId, setImageAssetId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "image");

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.url !== "string" || typeof data.assetId !== "number") {
      throw new Error(data.error ?? "Upload slike nije uspeo.");
    }

    setImageUrl(data.url);
    setImageAssetId(data.assetId);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          city,
          location,
          category,
          description,
          imageUrl: imageUrl || undefined,
          imageAssetId: imageAssetId ?? undefined,
          startAt,
          endAt,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Aktivnost nije sacuvana.");
        return;
      }

      setTitle("");
      setCity("");
      setLocation("");
      setCategory("");
      setDescription("");
      setStartAt("");
      setEndAt("");
      setImageUrl("");
      setImageAssetId(null);
      setSuccess("Aktivnost je uspesno dodata.");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel activity-composer-panel">
      <h2>Dodaj aktivnost</h2>
      <p className="muted">Obicni korisnici mogu da dodaju aktivnosti koje ce se prikazati na pocetnoj strani.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid two-cols">
          <label className="field">
            <span>Naslov</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>

          <label className="field">
            <span>Grad</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} required />
          </label>

          <label className="field">
            <span>Lokacija (opciono)</span>
            <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Dom kulture, sportski centar..." />
          </label>

          <label className="field">
            <span>Kategorija (opciono)</span>
            <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Sajam, radionica, sport..." />
          </label>

          <label className="field">
            <span>Slika aktivnosti (opciono)</span>
            <input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setIsUploadingImage(true);
                  setError("");
                  await uploadImage(file);
                } catch (uploadError) {
                  setError(uploadError instanceof Error ? uploadError.message : "Upload slike nije uspeo.");
                } finally {
                  setIsUploadingImage(false);
                }
              }}
            />
          </label>

          <label className="field">
            <span>Pocetak</span>
            <input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} required />
          </label>

          <label className="field">
            <span>Kraj (opciono)</span>
            <input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
          </label>
        </div>

        <label className="field">
          <span>Opis</span>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Dodajte kratak opis aktivnosti."
          />
        </label>

        {imageUrl ? <img src={imageUrl} alt="Preview aktivnosti" className="activity-image-preview" /> : null}

        <button className="button" type="submit" disabled={isSubmitting || isUploadingImage}>
          {isSubmitting ? "Cuvanje..." : isUploadingImage ? "Upload slike..." : "Dodaj aktivnost"}
        </button>

        {error ? <p className="form-feedback error">{error}</p> : null}
        {success ? <p className="form-feedback success">{success}</p> : null}
      </form>
    </section>
  );
}
