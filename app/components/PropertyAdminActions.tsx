"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type PropertyItem = {
  id: number;
  title: string;
  description: string | null;
  price: number | string;
  currency: string;
  city: string;
  region: string | null;
  areaSqm: number | null;
  landHa: number | string | { toString(): string } | null;
  rooms: number | null;
  category: "KUCA" | "ZEMLJISTE" | "STAN" | "VIKENDICA" | "IMANJE";
  imageUrl: string | null;
  contactPhone: string | null;
  contactName: string | null;
  isActive: boolean;
};

const CATEGORY_OPTIONS = [
  { value: "KUCA", label: "Kuća" },
  { value: "ZEMLJISTE", label: "Zemljište" },
  { value: "VIKENDICA", label: "Vikendica" },
  { value: "IMANJE", label: "Imanje" },
  { value: "STAN", label: "Stan" },
] as const;

export default function PropertyAdminActions({ property }: { property: PropertyItem }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description || "");
  const [price, setPrice] = useState(String(property.price));
  const [currency, setCurrency] = useState(property.currency || "EUR");
  const [city, setCity] = useState(property.city || "");
  const [region, setRegion] = useState(property.region || "");
  const [areaSqm, setAreaSqm] = useState(property.areaSqm ? String(property.areaSqm) : "");
  const [landHa, setLandHa] = useState(property.landHa ? String(property.landHa) : "");
  const [rooms, setRooms] = useState(property.rooms ? String(property.rooms) : "");
  const [category, setCategory] = useState<PropertyItem["category"]>(property.category);
  const [contactPhone, setContactPhone] = useState(property.contactPhone || "");
  const [contactName, setContactName] = useState(property.contactName || "");
  const [imageUrl, setImageUrl] = useState(property.imageUrl || "");
  const [isActive, setIsActive] = useState(property.isActive);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
    if (!response.ok || typeof data.url !== "string") {
      throw new Error(data.error ?? "Upload slike nije uspeo.");
    }

    setImageUrl(data.url);
  }

  async function saveChanges() {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`/api/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: Number(price),
          currency,
          city,
          region,
          areaSqm: areaSqm || null,
          landHa: landHa || null,
          rooms: rooms || null,
          category,
          imageUrl,
          contactPhone,
          contactName,
          isActive,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Izmena oglasa nije uspela.");
        return;
      }

      setSuccess("Oglas je uspešno izmenjen.");
      setEditing(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem() {
    if (isDeleting) return;
    const confirmed = window.confirm("Da li sigurno želite da obrišete ovaj oglas?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setError("");

      const response = await fetch(`/api/properties/${property.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Brisanje oglasa nije uspelo.");
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="activity-owner-actions">
      <div className="activity-owner-buttons">
        <button type="button" className="button secondary admin-mini-button" onClick={() => setEditing((prev) => !prev)}>
          {editing ? "Zatvori" : "Izmeni"}
        </button>
        <button type="button" className="button secondary admin-mini-button danger" onClick={deleteItem} disabled={isDeleting}>
          {isDeleting ? "Brisanje..." : "Obriši"}
        </button>
      </div>

      {editing ? (
        <div className="activity-edit-form">
          <label className="field"><span>Naslov</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="field"><span>Kategorija</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as PropertyItem["category"])}>
              {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="field"><span>Cena</span><input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
          <label className="field"><span>Valuta</span><input value={currency} onChange={(event) => setCurrency(event.target.value)} /></label>
          <label className="field"><span>Grad</span><input value={city} onChange={(event) => setCity(event.target.value)} /></label>
          <label className="field"><span>Region</span><input value={region} onChange={(event) => setRegion(event.target.value)} /></label>
          <label className="field"><span>Površina (m²)</span><input type="number" min="0" value={areaSqm} onChange={(event) => setAreaSqm(event.target.value)} /></label>
          <label className="field"><span>Plac (ha)</span><input type="number" min="0" step="0.01" value={landHa} onChange={(event) => setLandHa(event.target.value)} /></label>
          <label className="field"><span>Sobe</span><input type="number" min="0" value={rooms} onChange={(event) => setRooms(event.target.value)} /></label>
          <label className="field"><span>Kontakt telefon</span><input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} /></label>
          <label className="field"><span>Kontakt osoba</span><input value={contactName} onChange={(event) => setContactName(event.target.value)} /></label>
          <label className="field"><span>Opis</span><textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
          <label className="field"><span>Status</span>
            <select value={isActive ? "active" : "inactive"} onChange={(event) => setIsActive(event.target.value === "active")}>
              <option value="active">Aktivan</option>
              <option value="inactive">Neaktivan</option>
            </select>
          </label>
          <label className="field">
            <span>Nova slika</span>
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

          {imageUrl ? <img src={imageUrl} alt="Slika oglasa" className="activity-image-preview" /> : null}

          <div className="activity-edit-actions">
            <button type="button" className="button" onClick={saveChanges} disabled={isSaving || isUploading}>
              {isSaving ? "Čuvanje..." : "Sačuvaj izmene"}
            </button>
            {imageUrl ? (
              <button type="button" className="button secondary" onClick={() => setImageUrl("")}>
                Ukloni sliku
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? <p className="form-feedback error">{error}</p> : null}
      {success ? <p className="form-feedback success">{success}</p> : null}
    </div>
  );
}
