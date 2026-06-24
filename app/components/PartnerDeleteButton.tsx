"use client";

import { useState } from "react";

export default function PartnerDeleteButton({ partnerId }: { partnerId: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Sigurno želiš da obrišeš ovog partnera?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/partners/${partnerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete partner");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Greška pri brisanju partnera");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        background: "var(--danger-color, #dc3545)",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        marginTop: "8px",
      }}
    >
      {loading ? "Briše se..." : "Obriši"}
    </button>
  );
}
