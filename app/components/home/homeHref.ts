import type { CategoryFilterValue, FeedTab } from "./constants";

export function buildHomeHref(params: {
  query?: string;
  tab?: FeedTab;
  page?: number;
  category?: CategoryFilterValue;
  activityCity?: string;
}) {
  const search = new URLSearchParams();

  const query = (params.query || "").trim();
  const activityCity = (params.activityCity || "").trim();

  if (query) search.set("q", query);
  if (params.tab && params.tab !== "all") search.set("tab", params.tab);
  if (typeof params.page === "number" && params.page > 1) search.set("page", String(params.page));
  if (params.category && params.category !== "all") search.set("cat", params.category);
  if (activityCity) search.set("activityCity", activityCity);

  const qs = search.toString();
  return qs ? `/?${qs}` : "/";
}
