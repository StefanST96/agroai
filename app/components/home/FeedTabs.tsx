import Link from "next/link";
import type { CategoryFilterValue, FeedTab } from "./constants";
import { buildHomeHref } from "./homeHref";

type Props = {
  tab: FeedTab;
  query: string;
  category: CategoryFilterValue;
  activityCity: string;
};

export default function FeedTabs({ tab, query, category, activityCity }: Props) {
  function tabHref(nextTab: FeedTab) {
    return buildHomeHref({
      query,
      tab: nextTab,
      category,
      activityCity,
      page: 1,
    });
  }

  return (
    <nav className="tabs">
      <Link className={tab === "all" ? "active" : ""} href={tabHref("all")}>
        Svi postovi
      </Link>
      <Link className={tab === "following" ? "active" : ""} href={tabHref("following")}> 
        Pratim
      </Link>
      <Link className={tab === "nearby" ? "active" : ""} href={tabHref("nearby")}>
        Moja okolina
      </Link>
      <Link className={tab === "admin" ? "active" : ""} href={tabHref("admin")}>
        Stručno
      </Link>
      <Link className={tab === "latest" ? "active" : ""} href={tabHref("latest")}>
        Najnovije
      </Link>
      <Link className={tab === "popular" ? "active" : ""} href={tabHref("popular")}>
        Popularno
      </Link>
    </nav>
  );
}
