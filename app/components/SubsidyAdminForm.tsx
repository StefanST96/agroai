"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nacrt" },
  { value: "OPEN", label: "Otvoreno" },
  { value: "CLOSING_SOON", label: "Uskoro se zatvara" },
  { value: "CLOSED", label: "Zatvoreno" },
] as const;

type SubsidyItem = {
  id: number;
  title: string;
  institution: string;
  description: string;
  amount: string | null;
  region: string | null;
  status: (typeof STATUS_OPTIONS)[number]["value"];
  opensAt: Date | string | null;
  closesAt: Date | string | null;
  link: string | null;
  imageUrl: string | null;
};

function toDateInput(value: Date | string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function SubsidyAdminForm() {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [region, setRegion] = useState("");
  const [link, setLink] = useState("");
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAssetId, setImageAssetId] = useState<number | null>(null);
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("OPEN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setInstitution("");
    setDescription("");
    setAmount("");
    setRegion("");
    setLink("");
    setOpensAt("");
    setClosesAt("");
    setImageUrl("");
    setImageAssetId(null);
    setStatus("OPEN");
  }

  function startEdit(item: SubsidyItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setInstitution(item.institution);
    setDescription(item.description);
    setAmount(item.amount || "");
    setRegion(item.region || "");
    setLink(item.link || "");
    setOpensAt(toDateInput(item.opensAt));
    setClosesAt(toDateInput(item.closesAt));
    setImageUrl(item.imageUrl || "");
    setImageAssetId(null);
    setStatus(item.status);
    setError("");
    setSuccess("");
  }

  useEffect(() => {
    function handleEditEvent(event: Event) {
      const custom = event as CustomEvent<SubsidyItem>;
      if (!custom.detail) return;
      startEdit(custom.detail);
      const formEl = document.getElementById("subsidy-admin-form");
      formEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    window.addEventListener("subsidy:edit", handleEditEvent as EventListener);
    return () => window.removeEventListener("subsidy:edit", handleEditEvent as EventListener);
  }, []);

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

    if (!imageUrl.trim()) {
      setError("Slika je obavezna za objavu subvencije.");
      setSuccess("");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const isEditing = Boolean(editingId);
    const response = await fetch(isEditing ? `/api/subsidies/${editingId}` : "/api/subsidies", {
      method: isEditing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        institution,
        description,
        amount,
        region,
        link,
        opensAt: opensAt || undefined,
        closesAt: closesAt || undefined,
        imageUrl: imageUrl || undefined,
        imageAssetId: imageAssetId ?? undefined,
        status,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Subvencija nije sacuvana.");
      setIsSubmitting(false);
      return;
    }

    resetForm();
    setSuccess(isEditing ? "Subvencija je uspesno izmenjena." : "Subvencija je uspesno dodata.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <section className="panel subsidy-admin-panel" id="subsidy-admin-form">
      <h2>{editingId ? "Izmeni subvenciju" : "Dodaj novu subvenciju"}</h2>
      <p className="muted">Ova forma je dostupna samo moderatoru.</p>

      {editingId ? (
        <p className="form-feedback success" style={{ marginTop: 0 }}>
          Režim izmene aktivan. Menjate postojeću subvenciju.
        </p>
      ) : (
        <p className="muted" style={{ marginTop: 0 }}>
          Popunite polja i objavite novi konkurs.
        </p>
      )}

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid two-cols">
          <label className="field">
            <span>Naslov</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>

          <label className="field">
            <span>Institucija</span>
            <input value={institution} onChange={(event) => setInstitution(event.target.value)} required />
          </label>

          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as (typeof STATUS_OPTIONS)[number]["value"])}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Iznos</span>
            <input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="npr. do 1.200.000 RSD" />
          </label>

          <label className="field">
            <span>Region</span>
            <input value={region} onChange={(event) => setRegion(event.target.value)} placeholder="npr. Vojvodina" />
          </label>

          <label className="field">
            <span>Link konkursa</span>
            <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="https://..." />
          </label>

          <label className="field">
            <span>Datum otvaranja</span>
            <input type="date" value={opensAt} onChange={(event) => setOpensAt(event.target.value)} />
          </label>

          <label className="field">
            <span>Rok za prijavu</span>
            <input type="date" value={closesAt} onChange={(event) => setClosesAt(event.target.value)} />
          </label>

          <label className="field">
            <span>Slika (obavezno)</span>
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
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={4} />
        </label>

        {imageUrl ? <img className="admin-banner-preview" src={imageUrl} alt="Subvencija" /> : null}

        <div className="actions">
          <button className="button" type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Cuvanje..." : editingId ? "Sacuvaj izmene" : "Dodaj subvenciju"}
          </button>

          {editingId ? (
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                resetForm();
                setError("");
                setSuccess("");
              }}
            >
              Otkazi izmenu
            </button>
          ) : null}

          {imageUrl ? (
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                setImageUrl("");
                setImageAssetId(null);
              }}
            >
              Ukloni sliku
            </button>
          ) : null}
        </div>

        {error ? <p className="form-feedback error">{error}</p> : null}
        {success ? <p className="form-feedback success">{success}</p> : null}
      </form>

    </section>
  );
}
