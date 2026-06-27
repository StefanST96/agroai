export function getProductIcon(productName?: string | null) {
  const name = (productName || "").toLowerCase();

  if (name.includes("malin") || name.includes("jagod")) return "🍓";
  if (name.includes("kukuruz")) return "🌽";
  if (name.includes("psenic") || name.includes("zito")) return "🌾";
  if (name.includes("svinj")) return "🐖";
  if (name.includes("pras")) return "🐷";
  if (name.includes("krav")) return "🐄";
  if (name.includes("jabuk")) return "🍎";
  if (name.includes("paradajz")) return "🍅";

  return "🌱";
}

export function formatPriceSource(source?: string | null) {
  if (!source) return "Korisnik";

  const normalized = source.trim().toLowerCase();
  if (normalized === "seed data" || normalized === "seed") return "Seed data";
  if (normalized === "user submitted") return "Korisnik";

  return source;
}

export function formatDeltaValue(delta?: number | null) {
  const value = typeof delta === "number" ? delta : 0;
  const rounded = Math.round(value * 100) / 100;
  const compact = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(2);
  return `${rounded > 0 ? "+" : ""}${compact}`;
}

export function formatPriceDin(value: string | number) {
  const raw = typeof value === "number" ? String(value) : value;
  return `${raw} din`;
}
