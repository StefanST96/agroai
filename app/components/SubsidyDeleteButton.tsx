"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubsidyDeleteButton({ subsidyId }: { subsidyId: number }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (isDeleting) return;

    const confirmed = window.confirm("Da li sigurno zelite da obrisete ovu subvenciju?");
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      setError("");

      const response = await fetch(`/api/subsidies/${subsidyId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Brisanje nije uspelo.");
        return;
      }

      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <button type="button" className="button secondary admin-mini-button danger" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Brisem..." : "Obrisi"}
      </button>
      {error ? <p className="form-feedback error" style={{ marginTop: 6 }}>{error}</p> : null}
    </div>
  );
}
