"use client";

import { useRef, useState } from "react";
import ZoomableProfileImage from "./ZoomableProfileImage";

type Props = {
  initial: {
    name: string;
    location: string;
    farmName: string;
    bio: string;
    avatarUrl: string;
  };
};

export default function ProfileEditor({ initial }: Props) {
  const [name, setName] = useState(initial.name);
  const [location, setLocation] = useState(initial.location);
  const [farmName, setFarmName] = useState(initial.farmName);
  const [bio, setBio] = useState(initial.bio);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "image");

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.url !== "string") {
      throw new Error(data.error ?? "Avatar upload nije uspeo.");
    }

    setAvatarUrl(data.url);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          location,
          farmName,
          bio,
          avatarUrl,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Profil nije sacuvan.");
        return;
      }

      setMessage("Profil je uspesno azuriran.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Profilna slika</span>
        <div className="avatar-editor">
          <ZoomableProfileImage
            src={avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=96&q=80"}
            alt="Profilna slika"
          />
          <div>
            <button
              className="button secondary"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Promeni sliku
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setLoading(true);
                  setError("");
                  await uploadAvatar(file);
                  setMessage("Profilna slika je spremna. Kliknite Sacuvaj profil.");
                } catch (uploadError) {
                  setError(uploadError instanceof Error ? uploadError.message : "Avatar upload nije uspeo.");
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
        </div>
      </label>

      <label className="field">
        <span>Ime i prezime</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>Lokacija</span>
        <input value={location} onChange={(event) => setLocation(event.target.value)} />
      </label>
      <label className="field">
        <span>Gazdinstvo</span>
        <input value={farmName} onChange={(event) => setFarmName(event.target.value)} />
      </label>
      <label className="field">
        <span>Opis</span>
        <textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} />
      </label>

      <button className="button" type="submit" disabled={loading}>
        {loading ? "Cuvanje..." : "Sacuvaj profil"}
      </button>

      {error ? <p className="form-feedback error">{error}</p> : null}
      {message ? <p className="form-feedback success">{message}</p> : null}
    </form>
  );
}
