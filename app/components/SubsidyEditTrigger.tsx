"use client";

type SubsidyItem = {
  id: number;
  title: string;
  institution: string;
  description: string;
  amount: string | null;
  region: string | null;
  status: "DRAFT" | "OPEN" | "CLOSING_SOON" | "CLOSED";
  opensAt: string | Date | null;
  closesAt: string | Date | null;
  link: string | null;
  imageUrl: string | null;
};

export default function SubsidyEditTrigger({ subsidy }: { subsidy: SubsidyItem }) {
  return (
    <button
      type="button"
      className="button secondary admin-mini-button"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("subsidy:edit", { detail: subsidy }));
      }}
    >
      Izmeni
    </button>
  );
}
