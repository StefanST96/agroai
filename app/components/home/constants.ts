import type { IconName } from "../Icon";

export type FeedTab = "all" | "following" | "latest" | "popular" | "nearby" | "admin";

export const navGroups: {
  label?: string;
  items: { icon: IconName; label: string; href: string; badge?: string }[];
}[] = [
  {
    items: [
      { icon: "home", label: "Početna", href: "/" },
      { icon: "bot", label: "AI Savetnik", href: "/ai-asistent", badge: "Novo" },
      { icon: "plants", label: "Bolesti biljaka", href: "/bolesti-biljaka" },
      { icon: "tips", label: "Iskustva i saveti", href: "/iskustva-i-saveti" },
    ],
  },
  {
    label: "POLJOPRIVREDA",
    items: [
      { icon: "market", label: "Cene na pijaci", href: "/cene-na-pijaci" },
      { icon: "funds", label: "Subvencije i konkursi", href: "/subvencije" },
      { icon: "weather", label: "Vremenska prognoza", href: "/vremenska-prognoza" },
    ],
  },
  {
    label: "ŽIVOT NA SELU",
    items: [
      { icon: "partners", label: "Kuće na selu", href: "/kuce-na-selu" },
      { icon: "tag", label: "Zemljište", href: "/kuce-na-selu?category=ZEMLJISTE" },
      { icon: "events", label: "Događaji i manifestacije", href: "/dogadjaji" },
    ],
  },
  {
    label: "OSTALO",
    items: [
      { icon: "ads", label: "Oglasi", href: "/oprema-i-oglasi" },
      { icon: "market", label: "Mehanizacija", href: "/oprema-i-oglasi" },
    ],
  },
];

export const categoryFilters = [
  { label: "Sve", value: "all" },
  { label: "Biljna proizvodnja", value: "BILJNA_PROIZVODNJA" },
  { label: "Voćarstvo", value: "VOCARSTVO" },
  { label: "Povrćarstvo", value: "POVRCARSTVO" },
  { label: "Stočarstvo", value: "STOCARSTVO" },
  { label: "Život na selu", value: "ZIVOT_NA_SELU" },
  { label: "Pitanja", value: "QUESTION" },
  { label: "Subvencije", value: "SUBSIDY" },
  { label: "Bolesti", value: "DISEASE" },
  { label: "Tržište", value: "MARKET" },
] as const;

export type CategoryFilterValue = (typeof categoryFilters)[number]["value"];

export const featureCards: {
  icon: IconName;
  title: string;
  text: string;
  action: string;
  tone: string;
  href: string;
}[] = [
  {
    icon: "bot",
    title: "AI Asistent",
    text: "Postavi pitanje i dobij strucan odgovor odmah.",
    action: "Pitaj AI",
    tone: "green",
    href: "/ai-asistent",
  },
  {
    icon: "market",
    title: "Cene na pijaci",
    text: "Proveri najnovije cene voca, povrca i stoke.",
    action: "Vidi cene",
    tone: "gold",
    href: "/cene-na-pijaci",
  },
  {
    icon: "funds",
    title: "Subvencije",
    text: "Pronadji aktuelne konkurse i uslove za subvencije.",
    action: "Pogledaj",
    tone: "blue",
    href: "/subvencije",
  },
  {
    icon: "weather",
    title: "Vreme",
    text: "Proveri vremensku prognozu za svoj kraj.",
    action: "Vidi prognozu",
    tone: "sky",
    href: "/vremenska-prognoza",
  },
];

export const exploreMoreCards: {
  icon: IconName;
  label: string;
  sub: string;
  href: string;
}[] = [
  { icon: "plants", label: "Vodič za sadnju", sub: "Kada i šta saditi", href: "/iskustva-i-saveti" },
  { icon: "tips", label: "Bolesti biljaka", sub: "Prepoznavanje i zaštita", href: "/bolesti-biljaka" },
  { icon: "ads", label: "Agro oglasi", sub: "Kupovina / Prodaja", href: "/oprema-i-oglasi" },
  { icon: "market", label: "Mehanizacija", sub: "Traktori i oprema", href: "/oprema-i-oglasi" },
  { icon: "tag", label: "Zemljište", sub: "Kupovina / Najam", href: "/kuce-na-selu?category=ZEMLJISTE" },
  { icon: "share", label: "Turizam na selu", sub: "Otkrij lepotu Srbije", href: "/kuce-na-selu?category=VIKENDICA" },
];
