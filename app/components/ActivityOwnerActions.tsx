"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Activity = {
  id: number;
  title: string;
  description: string | null;
  city: string;
  location: string | null;
  category: string | null;
  startAt: string;
  endAt: string | null;
  imageUrl: string | null;
  createdById: number;
};

type Props = {
  activity: Activity;
  currentUserId: number;
};

function toInputDateTime(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function ActivityOwnerActions({ activity, currentUserId }: Props) {
  const router = useRouter();
  const canManage = activity.createdById === currentUserId;

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(activity.title);
  const [city, setCity] = useState(activity.city);
  const [location, setLocation] = useState(activity.location || "");
  const [category, setCategory] = useState(activity.category || "");
  const [description, setDescription] = useState(activity.description || "");
  const [startAt, setStartAt] = useState(toInputDateTime(activity.startAt));
  const [endAt, setEndAt] = useState(toInputDateTime(activity.endAt));
  const [imageUrl, setImageUrl] = useState(activity.imageUrl || "");
  const [imageAssetId, setImageAssetId] = useState<number | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  if (!canManage) return null;

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
    setImageChanged(true);
  }

  async function saveChanges() {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError("");

      const response = await fetch(`/api/activities/${activity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          city,
          location,
          category,
          description,
          startAt,
          endAt: endAt || null,
          ...(imageChanged
            ? {
                imageUrl: imageUrl || null,
                imageAssetId,
              }
            : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Izmena aktivnosti nije uspela.");
        return;
      }

      setEditing(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteActivity() {
    const confirmed = window.confirm("Da li sigurno zelite da obrisete ovu aktivnost?");
    if (!confirmed) return;

    const response = await fetch(`/api/activities/${activity.id}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Brisanje aktivnosti nije uspelo.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="activity-owner-actions">
      <div className="activity-owner-buttons">
        <button type="button" className="button secondary admin-mini-button" onClick={() => setEditing((prev) => !prev)}>
          {editing ? "Zatvori" : "Izmeni"}
        </button>
        <button type="button" className="button secondary admin-mini-button danger" onClick={deleteActivity}>
          Obrisi
        </button>
      </div>

      {editing ? (
        <div className="activity-edit-form">
          <label className="field"><span>Naslov</span><input value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label className="field"><span>Grad</span><input value={city} onChange={(event) => setCity(event.target.value)} /></label>
          <label className="field"><span>Lokacija</span><input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
          <label className="field"><span>Kategorija</span><input value={category} onChange={(event) => setCategory(event.target.value)} /></label>
          <label className="field"><span>Pocetak</span><input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} /></label>
          <label className="field"><span>Kraj</span><input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} /></label>
          <label className="field"><span>Opis</span><textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} /></label>
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

          {imageUrl ? <img src={imageUrl} alt="Slika aktivnosti" className="activity-image-preview" /> : null}

          <div className="activity-edit-actions">
            <button type="button" className="button" onClick={saveChanges} disabled={isSaving || isUploading}>
              {isSaving ? "Cuvanje..." : "Sacuvaj izmene"}
            </button>
            {imageUrl ? (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setImageUrl("");
                  setImageAssetId(null);
                  setImageChanged(true);
                }}
              >
                Ukloni sliku
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {error ? <p className="form-feedback error">{error}</p> : null}
    </div>
  );
}
