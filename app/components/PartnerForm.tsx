"use client";

import { useState } from "react";

export default function PartnerForm() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description,
          logoUrl: logoUrl || undefined,
          website: website || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create partner");
      }

      setName("");
      setCategory("");
      setDescription("");
      setLogoUrl("");
      setWebsite("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
      <div>
        <label>
          <strong>Naziv firme</strong>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naziv partnera"
          required
        />
      </div>

      <div>
        <label>
          <strong>Kategorija</strong>
        </label>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="npr. Zastita bilja, Mehanizacija"
          required
        />
      </div>

      <div>
        <label>
          <strong>Opis</strong>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detaljno objasnite ulogu partnera"
          rows={4}
          required
        />
      </div>

      <div>
        <label>
          <strong>URL loga (opciono)</strong>
        </label>
        <input
          type="url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div>
        <label>
          <strong>Vebsajt (opciono)</strong>
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {error && <p style={{ color: "var(--error-color)" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Pravi se..." : "Dodaj partnera"}
      </button>
    </form>
  );
}
