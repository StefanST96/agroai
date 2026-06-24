"use client";

import { useState } from "react";

type Props = {
  reportedUserId: number;
};

export default function ProfileReportButton({ reportedUserId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("Lazan profil");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");
      setFeedback("");

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetType: "PROFILE",
          reportedUserId,
          reason,
          details: details.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Prijava nije poslata.");
        return;
      }

      setFeedback("Prijava profila je poslata administratoru.");
      setDetails("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button className="button secondary" type="button" onClick={() => setOpen((prev) => !prev)}>
        Prijavi profil
      </button>

      {open ? (
        <form className="profile-report-form" onSubmit={handleSubmit}>
          <label>
            <span>Razlog</span>
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="Lazan profil">Lazan profil</option>
              <option value="Uznemiravanje">Uznemiravanje</option>
              <option value="Neprimeren sadrzaj">Neprimeren sadrzaj</option>
              <option value="Spam">Spam</option>
            </select>
          </label>
          <label>
            <span>Detalji</span>
            <input
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Kratko pojasnjenje"
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Slanje..." : "Posalji prijavu"}
          </button>
        </form>
      ) : null}

      {error ? <p className="form-feedback error">{error}</p> : null}
      {feedback ? <p className="form-feedback success">{feedback}</p> : null}
    </div>
  );
}
