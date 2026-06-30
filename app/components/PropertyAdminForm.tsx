"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "KUCA", label: "Kuća" },
  { value: "ZEMLJISTE", label: "Zemljište" },
  { value: "VIKENDICA", label: "Vikendica" },
  { value: "IMANJE", label: "Imanje" },
  { value: "STAN", label: "Stan" },
] as const;

export default function PropertyAdminForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [landHa, setLandHa] = useState("");
  const [rooms, setRooms] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]["value"]>("KUCA");
  const [contactPhone, setContactPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAssetId, setImageAssetId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description: description || undefined,
        price: Number(price),
        currency,
        city,
        region: region || undefined,
        areaSqm: areaSqm ? Number(areaSqm) : undefined,
        landHa: landHa ? Number(landHa) : undefined,
        rooms: rooms ? Number(rooms) : undefined,
        category,
        imageUrl: imageUrl || undefined,
        imageAssetId: imageAssetId ?? undefined,
        contactPhone: contactPhone || undefined,
        contactName: contactName || undefined,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Oglas nije sačuvan.");
      setIsSubmitting(false);
      return;
    }

    setTitle("");
    setDescription("");
    setPrice("");
    setCurrency("EUR");
    setCity("");
    setRegion("");
    setAreaSqm("");
    setLandHa("");
    setRooms("");
    setCategory("KUCA");
    setContactPhone("");
    setContactName("");
    setImageUrl("");
    setImageAssetId(null);
    setSuccess("Oglas je uspešno dodat.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <section className="panel" style={{ marginBottom: 16 }}>
      <h2>Dodaj oglas (Kuće na selu)</h2>
      <p className="muted">Forma je dostupna moderatoru i administratoru.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid two-cols">
          <label className="field">
            <span>Naslov</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>

          <label className="field">
            <span>Kategorija</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as (typeof CATEGORY_OPTIONS)[number]["value"])}>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Cena</span>
            <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
          </label>

          <label className="field">
            <span>Valuta</span>
            <input value={currency} onChange={(event) => setCurrency(event.target.value)} placeholder="EUR" />
          </label>

          <label className="field">
            <span>Grad</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} required />
          </label>

          <label className="field">
            <span>Region</span>
            <input value={region} onChange={(event) => setRegion(event.target.value)} />
          </label>

          <label className="field">
            <span>Površina kuće (m²)</span>
            <input type="number" min="0" step="1" value={areaSqm} onChange={(event) => setAreaSqm(event.target.value)} />
          </label>

          <label className="field">
            <span>Plac (ha)</span>
            <input type="number" min="0" step="0.01" value={landHa} onChange={(event) => setLandHa(event.target.value)} />
          </label>

          <label className="field">
            <span>Broj soba</span>
            <input type="number" min="0" step="1" value={rooms} onChange={(event) => setRooms(event.target.value)} />
          </label>

          <label className="field">
            <span>Telefon</span>
            <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="+381..." />
          </label>

          <label className="field">
            <span>Kontakt osoba</span>
            <input value={contactName} onChange={(event) => setContactName(event.target.value)} />
          </label>

          <label className="field">
            <span>Slika (opciono)</span>
            <input
              type="file"
              accept="image/*"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setIsUploading(true);
                  setError("");
                  await uploadImage(file);
                } catch (uploadError) {
                  setError(uploadError instanceof Error ? uploadError.message : "Upload nije uspeo.");
                } finally {
                  setIsUploading(false);
                }
              }}
            />
          </label>
        </div>

        <label className="field">
          <span>Opis</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
        </label>

        {imageUrl ? <img className="admin-banner-preview" src={imageUrl} alt="Pregled slike" /> : null}

        <button className="button" type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting ? "Čuvanje..." : "Dodaj oglas"}
        </button>

        {error ? <p className="form-feedback error">{error}</p> : null}
        {success ? <p className="form-feedback success">{success}</p> : null}
      </form>
    </section>
  );
}
