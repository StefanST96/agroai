"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nacrt" },
  { value: "OPEN", label: "Otvoreno" },
  { value: "CLOSING_SOON", label: "Uskoro se zatvara" },
  { value: "CLOSED", label: "Zatvoreno" },
] as const;

export default function SubsidyAdminForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [region, setRegion] = useState("");
  const [link, setLink] = useState("");
  const [opensAt, setOpensAt] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("OPEN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const response = await fetch("/api/subsidies", {
      method: "POST",
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
        status,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Subvencija nije sacuvana.");
      setIsSubmitting(false);
      return;
    }

    setTitle("");
    setInstitution("");
    setDescription("");
    setAmount("");
    setRegion("");
    setLink("");
    setOpensAt("");
    setClosesAt("");
    setStatus("OPEN");
    setSuccess("Subvencija je uspesno dodata.");
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <section className="panel subsidy-admin-panel">
      <h2>Dodaj novu subvenciju</h2>
      <p className="muted">Ova forma je dostupna samo administratoru.</p>

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
        </div>

        <label className="field">
          <span>Opis</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} required rows={4} />
        </label>

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Cuvanje..." : "Dodaj subvenciju"}
        </button>

        {error ? <p className="form-feedback error">{error}</p> : null}
        {success ? <p className="form-feedback success">{success}</p> : null}
      </form>
    </section>
  );
}
